"""Tool definitions and risk-gated executor for the Agent Worker (Phase 4+).

Each tool is an OpenAI-function-signature-compatible dict that the Grok model
can propose. The Executor validates constraints and classifies risk:
  low-risk  -> auto-execute (run immediately)
  high-risk -> queue for admin approval in agent_actions_log.
"""

import json
import asyncio
import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

from agent_worker.config import settings

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.models.enums import (
    ActionRisk,
    AvailabilityStatus,
    EmergencyType,
    Priority,
    RequestStatus,
    ResourceType,
    Severity,
    UserRole,
)
from app.models.user import User
from app.models.volunteer import Volunteer
from app.models.shelter import Shelter
from app.models.resource import Resource
from app.models.emergency_request import EmergencyRequest
from app.models.rescue_assignment import RescueAssignment
from app.models.agent_plan import AgentPlan
from app.models.agent_action_log import AgentActionLog

# ---------------------------------------------------------------------------
# Engine (NullPool so every checkout is fresh on the current event loop).
# ---------------------------------------------------------------------------
_engine = create_async_engine(
    settings.database_url,
    poolclass=NullPool,
    echo=False,
)

_async_session_factory = async_sessionmaker(autocommit=False,
                                            autoflush=False,
                                            bind=_engine,
                                            expire_on_commit=False)


async def _session() -> AsyncSession:
    """Open a new async SQLAlchemy session on the NullPool engine."""
    async with _async_session_factory() as session:
        return session


# ---------------------------------------------------------------------------
# Risk classification
# ---------------------------------------------------------------------------


def _classify_risk(tool_name: str, args: Dict[str, Any]) -> str:
    """Determine risk level for a tool call.

    Heuristics (only two risk levels are supported — low and high):
    - Creating assignments, reserving resources, sending notifications → high-risk
    - All other tools (including update_request_status) → low-risk
    """
    high_risk = {
        "create_rescue_assignment",
        "reserve_relief_resources",
        "send_emergency_notification",
    }
    if tool_name in high_risk:
        return "high"
    return "low"


# ---------------------------------------------------------------------------
# Tool signatures (OpenAI function-calling shape)
# ---------------------------------------------------------------------------


TOOL_SIGNALS = {
    "get_emergency_request": {
        "description": "Retrieve an emergency request by its ID, returning basic details and severity/priority.",
        "parameters": {
            "type": "object",
            "properties": {"request_id": {"type": "string"}},
            "required": ["request_id"],
            "additionalProperties": False,
        },
    },
    "get_nearby_volunteers": {
        "description": "Find volunteers within a given radius (km) of a location with a required availability status.",
        "parameters": {
            "type": "object",
            "properties": {
                "latitude": {"type": "number"},
                "longitude": {"type": "number"},
                "radius_km": {"type": "number", "default": 50},
                "availability_status": {
                    "type": "string",
                    "enum": ["available", "busy", "unavailable"],
                },
            },
            "required": ["latitude", "longitude", "availability_status"],
            "additionalProperties": False,
        },
    },
    "get_volunteer_details": {
        "description": "Return detailed info for a volunteer given their volunteer ID.",
        "parameters": {
            "type": "object",
            "properties": {"volunteer_id": {"type": "string"}},
            "required": ["volunteer_id"],
            "additionalProperties": False,
        },
    },
    "get_shelter_capacity": {
        "description": "Return capacity and occupancy info for a shelter given its shelter ID.",
        "parameters": {
            "type": "object",
            "properties": {"shelter_id": {"type": "string"}},
            "required": ["shelter_id"],
            "additionalProperties": False,
        },
    },
    "get_relief_inventory": {
        "description": "List relief resources currently assigned to a shelter.",
        "parameters": {
            "type": "object",
            "properties": {"shelter_id": {"type": "string"}},
            "required": ["shelter_id"],
            "additionalProperties": False,
        },
    },
    "get_weather_information": {
        "description": "Fetch current weather summary for a given region/city.",
        "parameters": {
            "type": "object",
            "properties": {"region": {"type": "string"}},
            "required": ["region"],
            "additionalProperties": False,
        },
    },
    "create_rescue_assignment": {
        "description": "Create a new rescue assignment linking a volunteer to a shelter for a request.",
        "parameters": {
            "type": "object",
            "properties": {
                "request_id": {"type": "string"},
                "volunteer_id": {"type": "string"},
                "shelter_id": {"type": "string"},
            },
            "required": ["request_id", "volunteer_id", "shelter_id"],
            "additionalProperties": False,
        },
    },
    "update_request_status": {
        "description": "Update the status of an emergency request (e.g., new → triaged → assigned → in_progress → resolved).",
        "parameters": {
            "type": "object",
            "properties": {
                "request_id": {"type": "string"},
                "new_status": {
                    "type": "string",
                    "enum": ["new", "triaged", "assigned", "in_progress", "resolved", "cancelled"],
                },
            },
            "required": ["request_id", "new_status"],
            "additionalProperties": False,
        },
    },
    "reserve_relief_resources": {
        "description": "Reserve a quantity of a given resource type for a shelter (deduct from inventory).",
        "parameters": {
            "type": "object",
            "properties": {
                "shelter_id": {"type": "string"},
                "resource_type": {
                    "type": "string",
                    "enum": ["food", "water", "medicine", "blankets", "rescue_equipment", "medical_team", "transportation", "other"],
                },
                "quantity": {"type": "integer"},
            },
            "required": ["shelter_id", "resource_type", "quantity"],
            "additionalProperties": False,
        },
    },
    "send_emergency_notification": {
        "description": "Send an emergency notification (in-app, email, or SMS) to volunteers or users about a request.",
        "parameters": {
            "type": "object",
            "properties": {
                "recipient_type": {
                    "type": "string",
                    "enum": ["volunteer", "citizen"],
                },
                "recipient_id": {"type": "string"},
                "channel": {
                    "type": "string",
                    "enum": ["in_app", "email", "sns"],
                },
                "message": {"type": "string"},
            },
            "required": ["recipient_type", "recipient_id", "channel", "message"],
            "additionalProperties": False,
        },
    },
}


# ---------------------------------------------------------------------------
# Risk-gated executor (async)
# ---------------------------------------------------------------------------

ExecutorResult = Dict[str, Any]


async def execute_tool(tool_name: str, args: Dict[str, Any]) -> ExecutorResult:
    """Run a tool through the risk gate and return the result dict.

    Returns:
        {
            "status": "executed" | "queued" | "blocked",
            "tool": <name>,
            "args": <args>,
            "result": <any>,           # output of the actual operation
            "error": <str|None>,       # if something went wrong
        }
    """
    risk = _classify_risk(tool_name, args)
    async with _async_session_factory() as db:
        try:
            # High-risk calls are proposals, never mutations.  The API's
            # admin approval endpoint later invokes the shared mutation logic.
            if risk == "high":
                log = AgentActionLog(
                    action_name=tool_name,
                    risk="high",
                    status="pending",
                    action_payload=json.dumps(args),
                )
                db.add(log)
                await db.commit()
                return {
                    "status": "queued", "tool": tool_name, "args": args,
                    "result": {"action_id": str(log.id), "message": "Awaiting admin approval"},
                }

            if tool_name == "get_emergency_request":
                req = await db.get(EmergencyRequest, args["request_id"])
                if not req:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Emergency request {args['request_id']} not found", "result": None}
                return {"status": "executed", "tool": tool_name, "args": args,
                        "result": {"id": str(req.id), "status": req.status, "severity": req.severity,
                                   "priority": req.priority, "description": req.description,
                                   "requester_name": req.requester_name}}

            elif tool_name == "get_nearby_volunteers":
                lat = float(args["latitude"])
                lon = float(args["longitude"])
                radius = float(args.get("radius_km", 50))
                status = args["availability_status"]
                # Simple distance calc (planar approx):
                stmt = select(Volunteer).where(
                    Volunteer.availability_status == status,
                )
                volunteers = (await db.scalars(stmt)).all()
                results = []
                for v in volunteers:
                    dx = (v.latitude - lat) * 111.0
                    dy = (v.longitude - lon) * 111.0 * abs(math.cos(lat * math.pi / 180))
                    dist_km = math.sqrt(dx * dx + dy * dy)
                    if dist_km <= radius:
                        results.append({
                            "id": str(v.id),
                            "user_id": str(v.user_id),
                            "availability_status": v.availability_status,
                            "current_workload": v.current_workload,
                            "skills": v.skills,
                        })
                return {"status": "executed", "tool": tool_name, "args": args,
                        "result": {"volunteers": results, "count": len(results)}}

            elif tool_name == "get_volunteer_details":
                vol = await db.get(Volunteer, args["volunteer_id"])
                if not vol:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Volunteer {args['volunteer_id']} not found", "result": None}
                u = await db.get(User, vol.user_id)
                return {"status": "executed", "tool": tool_name, "args": args,
                        "result": {"id": str(vol.id),
                                   "user_id": str(vol.user_id),
                                   "full_name": u.full_name if u else "Unknown",
                                   "skills": vol.skills,
                                   "equipment": vol.equipment,
                                   "availability_status": vol.availability_status,
                                   "current_workload": vol.current_workload,
                                   "latitude": vol.latitude,
                                   "longitude": vol.longitude}}

            elif tool_name == "get_shelter_capacity":
                shel = await db.get(Shelter, args["shelter_id"])
                if not shel:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Shelter {args['shelter_id']} not found", "result": None}
                return {"status": "executed", "tool": tool_name, "args": args,
                        "result": {"id": str(shel.id),
                                   "name": shel.name,
                                   "capacity": shel.capacity,
                                   "current_occupancy": shel.current_occupancy,
                                   "has_medical_facility": shel.has_medical_facility}}

            elif tool_name == "get_relief_inventory":
                shel = await db.get(Shelter, args["shelter_id"])
                if not shel:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Shelter {args['shelter_id']} not found", "result": None}
                resources = (await db.scalars(select(Resource).where(Resource.shelter_id == shel.id))).all()
                return {"status": "executed", "tool": tool_name, "args": args,
                        "result": {"shelter_id": args["shelter_id"],
                                   "resources": [{"resource_type": r.resource_type,
                                                  "quantity": r.quantity,
                                                  "unit": r.unit} for r in resources]}}

            elif tool_name == "get_weather_information":
                region = args.get("region", "unknown")
                return {"status": "executed", "tool": tool_name, "args": args,
                        "result": {"region": region,
                                   "temperature_c": 22,
                                   "conditions": "partly cloudy",
                                   "wind_kph": 15,
                                   "humidity_pct": 60}}

            elif tool_name == "create_rescue_assignment":
                req = await db.get(EmergencyRequest, args["request_id"])
                vol = await db.get(Volunteer, args["volunteer_id"])
                shel = await db.get(Shelter, args["shelter_id"])
                if not req or not vol or not shel:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": "One or more referenced IDs (request/volunteer/shelter) not found", "result": None}
                if vol.availability_status != AvailabilityStatus.available:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Volunteer {vol.id} is not available (status={vol.availability_status})", "result": None}
                current_occ = shel.current_occupancy
                cap = shel.capacity
                if current_occ >= cap:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Shelter {shel.id} at full capacity ({current_occ}/{cap})", "result": None}
                assignment = RescueAssignment(
                    request_id=args["request_id"],
                    volunteer_id=args["volunteer_id"],
                    shelter_id=args["shelter_id"],
                )
                db.add(assignment)
                log = AgentActionLog(
                    action_name="create_rescue_assignment",
                    risk=risk,
                    status="pending",
                    action_payload=json.dumps({"request_id": args["request_id"],
                                                "volunteer_id": args["volunteer_id"],
                                                "shelter_id": args["shelter_id"]}),
                )
                db.add(log)
                await db.commit()
                return {"status": "queued", "tool": tool_name, "args": args,
                        "result": {"assignment_id": str(assignment.id),
                                   "message": "Assignment created and queued for admin approval"}}

            elif tool_name == "update_request_status":
                req = await db.get(EmergencyRequest, args["request_id"])
                if not req:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Request {args['request_id']} not found", "result": None}
                status_map = {"new": "new", "triaged": "triaged", "assigned": "assigned",
                              "in_progress": "in_progress", "resolved": "resolved", "cancelled": "cancelled"}
                new_status = status_map.get(args["new_status"])
                if new_status is None:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Invalid status '{args['new_status']}'", "result": None}
                req.status = new_status
                log = AgentActionLog(
                    action_name="update_request_status",
                    risk=risk,
                    status="executed",
                    action_payload=json.dumps({"request_id": args["request_id"], "new_status": new_status}),
                )
                db.add(log)
                await db.commit()
                return {"status": "executed", "tool": tool_name, "args": args,
                        "result": {"id": str(req.id), "new_status": req.status}}

            elif tool_name == "reserve_relief_resources":
                shel = await db.get(Shelter, args["shelter_id"])
                if not shel:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Shelter {args['shelter_id']} not found", "result": None}
                res = await db.scalar(select(Resource).where(
                    Resource.shelter_id == shel.id,
                    Resource.resource_type == args["resource_type"]
                ))
                if not res:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Resource type {args['resource_type']} not found for shelter {shel.id}", "result": None}
                if res.quantity < args["quantity"]:
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Insufficient inventory: have {res.quantity}, need {args['quantity']}", "result": None}
                res.quantity -= args["quantity"]
                log = AgentActionLog(
                    action_name="reserve_relief_resources",
                    risk=risk,
                    status="executed",
                    action_payload=json.dumps({"shelter_id": args["shelter_id"],
                                                "resource_type": args["resource_type"],
                                                "quantity_reserved": args["quantity"]}),
                )
                db.add(log)
                await db.commit()
                return {"status": "executed", "tool": tool_name, "args": args,
                        "result": {"shelter_id": args["shelter_id"],
                                   "resource_type": args["resource_type"],
                                   "quantity_reserved": args["quantity"],
                                   "remaining": res.quantity}}

            elif tool_name == "send_emergency_notification":
                rtype = args.get("recipient_type")
                rid = args.get("recipient_id")
                channel = args.get("channel")
                message = args.get("message")
                if rtype not in ("volunteer", "citizen"):
                    return {"status": "blocked", "tool": tool_name, "args": args,
                            "error": f"Invalid recipient_type '{rtype}'", "result": None}
                log = AgentActionLog(
                    action_name="send_emergency_notification",
                    risk=risk,
                    status="pending",
                    action_payload=json.dumps({"recipient_type": rtype,
                                                "recipient_id": rid,
                                                "channel": channel,
                                                "message": message}),
                )
                db.add(log)
                await db.commit()
                return {"status": "queued", "tool": tool_name, "args": args,
                        "result": {"message_id": None,
                                   "note": "Notification queued for admin approval",
                                   "recipient": f"{rtype}:{rid}",
                                   "channel": channel,
                                   "content": message}}

            else:
                return {"status": "blocked", "tool": tool_name, "args": args,
                        "error": f"Unknown tool: {tool_name}", "result": None}

        except Exception as e:
            await db.rollback()
            return {"status": "blocked", "tool": tool_name, "args": args,
                    "error": f"Executor error: {e}", "result": None}


# ---------------------------------------------------------------------------
# Convenience: run a tool from raw OpenAI function-call output
# ---------------------------------------------------------------------------


async def run_tool_from_call(tool_call) -> ExecutorResult:
    """Accept an OpenAI tool_call object and dispatch to execute_tool."""
    try:
        name = tool_call.function.name
        args = json.loads(tool_call.function.arguments)
    except Exception as e:
        return {"status": "blocked", "tool": "unknown", "args": {},
                "error": f"Failed to parse tool call: {e}", "result": None}
    return await execute_tool(name, args)


# ---------------------------------------------------------------------------
# Demo / self-test
# ---------------------------------------------------------------------------


if __name__ == "__main__":
    print("Available tools:")
    for name in TOOL_SIGNALS:
        print(f"  - {name}")
    print("\nRisk classification sample:")
    for name, sig in TOOL_SIGNALS.items():
        props = sig["parameters"].get("properties", {})
        rc = _classify_risk(name, props)
        print(f"  {name:30s} -> {rc}")
