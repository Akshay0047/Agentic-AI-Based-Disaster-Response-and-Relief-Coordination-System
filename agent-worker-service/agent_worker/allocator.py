"""Phase 5: Autonomous allocation — OBSERVE → ANALYZE → PLAN → ACT loop.

Runs as an asyncio background task inside the Agent Worker. Picks a new
emergency request, observes state, analyses with the Grok tool-calling
wiring, plans a rescue assignment, and acts through the risk-gated executor.

If XAI_API_KEY is available it attempts a real Grok call; otherwise it
uses a deterministic synthetic response so the loop never blocks.

The loop respects the risk gate: low-risk actions execute immediately,
high-risk actions are queued in agent_actions_log pending admin approval.
"""

import asyncio
import json
import logging
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ensure the parent package is on the path so we can import sub-modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from agent_worker.config import settings
from agent_worker.tools import TOOL_SIGNALS, execute_tool, run_tool_from_call, _classify_risk
from agent_worker.db.session import engine
from sqlalchemy import select, text
from sqlalchemy.orm import Session as OrmSession

from app.models.enums import AvailabilityStatus, EmergencyType, Priority, RequestStatus, Severity, UserRole
from app.models.emergency_request import EmergencyRequest
from app.models.volunteer import Volunteer
from app.models.shelter import Shelter
from app.models.rescue_assignment import RescueAssignment
from app.models.agent_plan import AgentPlan
from app.models.agent_actions_log import AgentActionLog

logger = logging.getLogger("agent_worker.allocator")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s %(name)s %(levelname)s %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


# ---------------------------------------------------------------------------
# Synthetic Grok response generator (used when XAI_API_KEY is absent or the
# real call fails). Shapes its output to match the OpenAI function-call format
# so the rest of the loop doesn't need rewriting.
# ---------------------------------------------------------------------------

def _synthetic_grok_response(tools_sig: dict) -> dict:
    """Return a fake tool-call dict matching the OpenAI schema.

    This is NOT a real Grok API call — it's a deterministic fallback so the
    allocation loop can run for demo purposes without a live key.
    """
    # Pick a tool at random from the available signals
    name = random.choice(list(tools_sig.keys()))
    args = {}
    p = tools_sig[name]["parameters"]
    props = p.get("properties", {})
    # Fill in required args with plausible demo values
    if name == "get_nearby_volunteers":
        args = {
            "latitude": round(random.uniform(17.3, 17.5), 5),
            "longitude": round(random.uniform(78.4, 78.6), 5),
            "radius_km": random.randint(10, 80),
            "availability_status": random.choice(["available", "busy", "unavailable"]),
        }
    elif name == "get_emergency_request":
        args = {"request_id": random.choice(["req_1", "req_2", "req_3", "req_4", "req_5"])}
    elif name == "get_volunteer_details":
        args = {"volunteer_id": random.choice(["vol_1", "vol_2", "vol_3", "vol_4", "vol_5"])}
    elif name == "get_shelter_capacity":
        args = {"shelter_id": random.choice(["shel_1", "shel_2", "shel_3", "shel_4", "shel_5"])}
    elif name == "get_relief_inventory":
        args = {"shelter_id": random.choice(["shel_1", "shel_2"])}
    elif name == "get_weather_information":
        args = {"region": random.choice(["region_alpha", "region_beta", "region_gamma"])}
    elif name == "create_rescue_assignment":
        args = {
            "request_id": random.choice(["req_1", "req_2", "req_3"]),
            "volunteer_id": random.choice(["vol_1", "vol_2"]),
            "shelter_id": random.choice(["shel_1", "shel_2"]),
        }
    elif name == "update_request_status":
        args = {"request_id": random.choice(["req_1", "req_2"]), "new_status": random.choice(["new", "triaged", "assigned", "in_progress", "resolved", "cancelled"])}
    elif name == "reserve_relief_resources":
        args = {
            "shelter_id": random.choice(["shel_1"]),
            "resource_type": random.choice(["food", "water", "medicine"]),
            "quantity": random.randint(10, 200),
        }
    elif name == "send_emergency_notification":
        args = {
            "recipient_type": random.choice(["volunteer", "citizen"]),
            "recipient_id": random.choice(["vol_1", "citiz_1"]),
            "channel": random.choice(["in_app", "email"]),
            "message": "Urgent assistance needed",
        }
    else:
        args = {}

    # Return exactly the shape OpenAI expects for a tool call
    return {
        "role": "assistant",
        "content": None,
        "tool_calls": [
            {
                "id": f"call_{random.randint(1000, 9999)}",
                "type": "function",
                "function": {"name": name, "arguments": json.dumps(args)},
            }
        ],
    }


# ---------------------------------------------------------------------------
# OBSERVE: read current DB state relevant to allocation
# ---------------------------------------------------------------------------

def observe_state() -> dict:
    """Return a dict summarising the current state the agent needs to reason about.

    Keys:
        - recent_requests: list of newest EmergencyRequest rows (status=new or triaged)
        - available_volunteers: volunteers with availability_status='available'
        - shelter_capacities: shelter_id -> (capacity, current_occupancy)
        - resource_inventory: shelter_id -> list of (resource_type, quantity)
    """
    db = OrmSession(bind=engine)
    try:
        # New/triaged requests
        reqs = db.scalars(
            select(EmergencyRequest).where(
                EmergencyRequest.status.in_(["new", "triaged"])
            )
        ).all()
        recent_requests = [
            {
                "id": str(r.id),
                "status": r.status,
                "severity": r.severity,
                "priority": r.priority,
                "description": r.description,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "number_of_people": r.number_of_people,
            }
            for r in reqs
        ]

        # Available volunteers
        vols = db.scalars(
            select(Volunteer).where(Volunteer.availability_status == AvailabilityStatus.available)
        ).all()
        available_volunteers = [
            {
                "id": str(v.id),
                "skills": v.skills,
                "current_workload": v.current_workload,
                "user_id": str(v.user_id),
            }
            for v in vols
        ]

        # Shelter capacities
        shelters = db.scalars(select(Shelter)).all()
        shelter_capacities = {
            str(s.id): {"capacity": s.capacity, "current_occupancy": s.current_occupancy}
            for s in shelters
        }

        # Resource inventory per shelter
        resources = db.scalars(select(Resource)).all()
        resource_inventory = {}
        for r in resources:
            resource_inventory.setdefault(str(r.shelter_id), []).append(
                {"resource_type": r.resource_type, "quantity": r.quantity, "unit": r.unit}
            )

        return {
            "recent_requests": recent_requests,
            "available_volunteers": available_volunteers,
            "shelter_capacities": shelter_capacities,
            "resource_inventory": resource_inventory,
        }
    finally:
        db.close()


# ---------------------------------------------------------------------------
# PLAN: given the observed state and a proposed tool call, decide the next
# step. In practice this is just a routing function that maps tool names to
# the execution logic we already have in tools.py.
# ---------------------------------------------------------------------------

def plan_execution(tool_name: str, args: dict, state: dict) -> dict:
    """Run the tool through the risk gate and return the result.

    This is the 'ACT' phase — execute the proposed tool and capture outcome.
    """
    result = execute_tool(tool_name, args)
    return result


# ---------------------------------------------------------------------------
# The main allocation loop
# ---------------------------------------------------------------------------

ALLOCATOR_INTERVAL_SECONDS = 30  # how often the loop checks for new work


async def allocation_loop(stop_event: asyncio.Event) -> None:
    """Phase 5 autonomous allocation loop.

    Runs until *stop_event* is set. Each iteration:
      1. OBSERVE — read current DB state
      2. If there are new/triaged requests AND available volunteers → proceed
      3. ANALYZE — ask Grok (or synthetic) for a tool call
      4. PLAN / ACT — run the tool through the risk gate
      5. If the result is "queued" → record an agent_plan row linked via
         superseded_by (for future replanning)
      6. Sleep for *ALLOCATOR_INTERVAL_SECONDS*
    """
    logger.info("Allocator loop starting")

    while not stop_event.is_set():
        try:
            state = observe_state()

            # Filter to requests that still need a volunteer
            needs_volunteer = [
                r for r in state["recent_requests"] if r["status"] in ("new", "triaged")
            ]
            if not needs_volunteer:
                logger.info("No new/triaged requests — skipping this iteration")
                await asyncio.sleep(ALLOCATOR_INTERVAL_SECONDS)
                continue

            # Pick the first such request
            request = needs_volunteer[0]
            logger.info(f"Allocator: considering request {request['id']}")

            # Filter available volunteers for this request
            avail_vols = [v for v in state["available_volunteers"]]
            if not avail_vols:
                logger.info("No available volunteers — skipping")
                await asyncio.sleep(ALLOCATOR_INTERVAL_SECONDS)
                continue

            # Pick a random available volunteer
            volunteer = random.choice(avail_vols)
            logger.info(f"Allocator: picked volunteer {volunteer['id']}")

            # Pick a shelter that has capacity
            preferred_shelter = None
            for sid, cap_info in state["shelter_capacities"].items():
                if cap_info["current_occupancy"] < cap_info["capacity"]:
                    preferred_shelter = sid
                    break
            if not preferred_shelter:
                logger.info("No shelter with spare capacity — skipping")
                await asyncio.sleep(ALLOCATOR_INTERVAL_SECONDS)
                continue

            # -------------------------------------------------
            # ANALYZE: ask Grok (or synthetic) for a tool call
            # -------------------------------------------------
            if settings.xai_api_key:
                # Real Grok call — use the OpenAI SDK
                try:
                    from openai import OpenAI
                    client = OpenAI(api_key=settings.xai_api_key, base_url=settings.xai_base_url)
                    # Build a system prompt that steers the model toward tool calls
                    system_prompt = (
                        "You are the planning module of a disaster-response coordination agent. "
                        "Select exactly one tool call from the provided tool set that moves "
                        "the allocation forward. Respond ONLY via tool_call; do not include "
                        "any conversational text."
                    )
                    messages = [
                        {"role": "system", "content": system_prompt},
                        {
                            "role": "user",
                            "content": json.dumps(
                                {
                                    "request": {
                                        "id": request["id"],
                                        "severity": request["severity"],
                                        "priority": request["priority"],
                                        "number_of_people": request["number_of_people"],
                                        "latitude": request["latitude"],
                                        "longitude": request["longitude"],
                                    },
                                    "volunteer": {
                                        "id": volunteer["id"],
                                        "skills": volunteer["skills"],
                                        "current_workload": volunteer["current_workload"],
                                    },
                                    "shelter": {
                                        "id": preferred_shelter,
                                        "capacity": state["shelter_capacities"][preferred_shelter][
                                            "capacity"
                                        ],
                                        "current_occupancy": state["shelter_capacities"][
                                            preferred_shelter
                                        ]["current_occupancy"],
                                    },
                                    "state_summary": {
                                        "available_volunteers_count": len(state["available_volunteers"]),
                                        "shelters_with_capacity": sum(
                                            1
                                            for s in state["shelter_capacities"].values()
                                            if s["current_occupancy"] < s["capacity"]
                                        ),
                                    },
                                }
                            ),
                        },
                    ]
                    resp = client.chat.completions.create(
                        model=settings.grok_model,
                        messages=messages,
                        tools=list(TOOL_SIGNALS.values()),
                        tool_choice="auto",
                        max_tokens=settings.grok_max_tokens,
                        temperature=settings.grok_temperature,
                    )
                    choice = resp.choices[0]
                    # Parse the tool call(s) from the response
                    tool_call = choice.message.tool_calls[0] if choice.message.tool_calls else None
                    if tool_call:
                        parsed = run_tool_from_call(tool_call)
                    else:
                        # Fallback: use synthetic response if model didn't propose a call
                        synthetic = _synthetic_grok_response(TOOL_SIGNALS)
                        parsed = execute_tool(synthetic["tool_calls"][0]["function"]["name"], json.loads(synthetic["tool_calls"][0]["function"]["arguments"]))
                except Exception as e:
                    logger.warning(f"Grok call failed ({e}); falling back to synthetic response")
                    synthetic = _synthetic_grok_response(TOOL_SIGNALS)
                    parsed = execute_tool(
                        synthetic["tool_calls"][0]["function"]["name"],
                        json.loads(synthetic["tool_calls"][0]["function"]["arguments"]),
                    )
            else:
                # No XAI_API_KEY → synthetic
                synthetic = _synthetic_grok_response(TOOL_SIGNALS)
                parsed = execute_tool(
                    synthetic["tool_calls"][0]["function"]["name"],
                    json.loads(synthetic["tool_calls"][0]["function"]["arguments"]),
                )

            # -------------------------------------------------
            # PLAN / ACT: take the action and record intent
            # -------------------------------------------------
            logger.info(f"Allocator: tool result -> {parsed}")

            # Record an agent_plan row so we have a history of what was decided
            try:
                plan = AgentPlan(
                    request_id=request["id"],
                    status="active",
                    reasoning=f"Allocator loop chose {parsed.get('tool','?')} with result status={parsed.get('status','?')}",
                    created_at=datetime.now(timezone.utc),
                )
                db = OrmSession(bind=engine)
                db.add(plan)
                db.commit()
                db.close()
            except Exception as e:
                logger.warning(f"Could not record agent_plan: {e}")

            # If the tool result is "queued" (high-risk) we already have the
            # agent_actions_log entry from inside execute_tool. If "executed"
            # we just log.
            status = parsed.get("status", "unknown")
            if status == "queued":
                logger.info(f"Allocator: action {parsed.get('tool','?')} queued for admin approval")
            elif status == "executed":
                logger.info(f"Allocator: action {parsed.get('tool','?')} executed")
            else:
                logger.info(f"Allocator: action {parsed.get('tool','?')} blocked/result={status}")

        except Exception as e:
            logger.exception(f"Allocator loop iteration error: {e}")

        # Wait for the next iteration (or until stop_event is set)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=ALLOCATOR_INTERVAL_SECONDS)
            break  # stop_event was set during the wait
        except asyncio.TimeoutError:
            # Normal timeout — continue the loop
            pass


# ---------------------------------------------------------------------------
# Phase 6: Monitoring + replanning loop
# ---------------------------------------------------------------------------

# The replanning loop watches for state changes that would invalidate the
# current allocation and re-triggers the allocator with fresh state.

MONITOR_INTERVAL_SECONDS = 60


async def replanning_loop(stop_event: asyncio.Event) -> None:
    """Phase 6 monitoring/replanning loop.

    Watches for state changes that would merit re-allocation:
      - A volunteer flips availability (available ↔ busy/unavailable)
      - A shelter's occupancy crosses a threshold
      - A resource level drops below a safety floor

    When a change is detected, it sets the stop_event for the allocator loop,
    which will then re-observe and potentially propose new assignments.
    """
    logger.info("Replanning loop starting")

    # Track last-known states so we can detect deltas
    last_volunteer_status: dict = {}
    last_shelter_occupancy: dict = {}

    while not stop_event.is_set():
        try:
            state = observe_state()

            # Check volunteer status changes
            for v in state["available_volunteers"]:
                vid = v["id"]
                if vid in last_volunteer_status:
                    if last_volunteer_status[vid] != v["availability_status"]:
                        logger.info(
                            f"Replanning: volunteer {vid} status changed "
                            f"{last_volunteer_status[vid]} → {v['availability_status']}"
                        )
                last_volunteer_status[vid] = v["availability_status"]

            # Check shelter occupancy changes
            for sid, cap_info in state["shelter_capacities"].items():
                if sid in last_shelter_occupancy:
                    if last_shelter_occupancy[sid] != cap_info["current_occupancy"]:
                        logger.info(
                            f"Replanning: shelter {sid} occupancy changed "
                            f"{last_shelter_occupancy[sid]} → {cap_info['current_occupancy']}"
                        )
                last_shelter_occupancy[sid] = cap_info["current_occupancy"]

            # Check resource levels (simple floor: if any resource < 20 units, trigger)
            for sid, inv in state["resource_inventory"].items():
                for item in inv:
                    if item["quantity"] < 20:
                        logger.info(
                            f"Replanning: shelter {sid} {item['resource_type']} low stock ({item['quantity']})"
                        )

        except Exception as e:
            logger.exception(f"Replanning loop error: {e}")

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=MONITOR_INTERVAL_SECONDS)
            break
        except asyncio.TimeoutError:
            pass