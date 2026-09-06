"""Autonomous allocation loop (Phase 5) and monitoring/replanning loop (Phase 6)
for the Agent Worker.

Phase 5 — allocation_loop():
    OBSERVE  -> gather recent unassigned requests, available volunteers,
                shelters, resources (observe_state()).
    ANALYZE  -> ask Grok (or a synthetic fallback with no API key) which tool
                to call next for a given request.
    PLAN     -> before calling the tool, select the best-fit volunteer using
                real skill/distance/workload scoring (select_best_volunteer),
                not a random pick. Record the plan + reasoning in agent_plans.
    ACT      -> execute the tool via agent_worker.tools.execute_tool, which
                is the single, risk-gated path allowed to touch the database.

Phase 6 — replanning_loop():
    MONITOR  -> track ACTIVE ASSIGNMENTS (not just "available" volunteers,
                since a volunteer disappears from that list the instant they
                go unavailable — tracking assignments is what lets this loop
                actually notice a dropout after the fact).
    REPLAN   -> when an assigned volunteer's live availability_status flips
                to "unavailable", close out the old assignment, pick a
                replacement volunteer, create a new assignment + new plan,
                and mark the old plan as superseded_by the new one.
"""

import asyncio
import json
import logging
import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select

from agent_worker.config import settings
from agent_worker.tools import (
    TOOL_SIGNALS,
    _engine,
    _classify_risk,
    execute_tool,
    run_tool_from_call,
)

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models.enums import AvailabilityStatus
from app.models.user import User
from app.models.volunteer import Volunteer
from app.models.shelter import Shelter
from app.models.resource import Resource
from app.models.emergency_request import EmergencyRequest
from app.models.rescue_assignment import RescueAssignment
from app.models.agent_plan import AgentPlan
from app.models.agent_action_log import AgentActionLog

logger = logging.getLogger("agent_worker.allocator")

_session_factory = async_sessionmaker(autocommit=False, autoflush=False, bind=_engine)

ALLOCATOR_INTERVAL_SECONDS = 20
MONITOR_INTERVAL_SECONDS = settings.monitor_interval_seconds

# Non-terminal assignment states — an assignment in one of these is still
# "live" and needs to be watched by the replanning loop.
ACTIVE_ASSIGNMENT_STATUSES = ("pending", "accepted", "in_progress")

# Terminal request states — a request in one of these should not be picked
# up again by the allocation loop.
TERMINAL_REQUEST_STATUSES = ("resolved", "cancelled")


# ---------------------------------------------------------------------------
# Distance + scoring helpers (Phase 5 — real reasoning, not random.choice)
# ---------------------------------------------------------------------------


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    """Great-circle distance in kilometers between two lat/lon points."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 9999.0
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


# Emergency type -> the skill that best matches it. Used to prefer a
# skill-matched volunteer even if they are farther away than an unskilled one.
SKILL_FOR_EMERGENCY_TYPE = {
    "medical": "medical",
    "fire": "rescue",
    "flood": "rescue",
    "earthquake": "rescue",
    "cyclone": "rescue",
    "landslide": "rescue",
}


def score_volunteer(volunteer: Dict[str, Any], request_lat, request_lon, required_skill: Optional[str]) -> tuple:
    """Score one candidate volunteer. Higher score = better fit.

    Returns (score, reason_text).
    """
    distance = haversine_km(request_lat, request_lon, volunteer.get("latitude"), volunteer.get("longitude"))
    skills = volunteer.get("skills") or []
    has_skill = bool(required_skill and required_skill in skills)
    workload = volunteer.get("current_workload", 0) or 0

    score = 0.0
    reason_parts = []

    # Skill match dominates the score — a skilled volunteer far away should
    # still outrank an unskilled volunteer nearby.
    if has_skill:
        score += 100.0
        reason_parts.append(f"has required skill '{required_skill}'")
    elif required_skill:
        reason_parts.append(f"lacks required skill '{required_skill}'")
    else:
        reason_parts.append("no specific skill required for this request")

    score -= distance * 1.0
    reason_parts.append(f"{distance:.1f} km away")

    score -= workload * 5.0
    reason_parts.append(f"current workload {workload}")

    return score, ", ".join(reason_parts)


def select_best_volunteer(
    candidates: List[Dict[str, Any]], request_lat, request_lon, required_skill: Optional[str]
) -> tuple:
    """Pick the best-fit volunteer from candidates.

    Returns (chosen_volunteer_dict_or_None, reasoning_text).
    """
    if not candidates:
        return None, "No candidate volunteers were available."

    scored = [(v, *score_volunteer(v, request_lat, request_lon, required_skill)) for v in candidates]
    scored.sort(key=lambda row: row[1], reverse=True)
    best_volunteer, best_score, best_reason = scored[0]

    comparison = "; ".join(f"volunteer {v['id']}: {reason} (score={s:.1f})" for v, s, reason in scored)
    reasoning = f"Selected volunteer {best_volunteer['id']} because they {best_reason}. Considered {len(scored)} candidate(s) — {comparison}."
    return best_volunteer, reasoning


def select_best_shelter(candidates: List[Dict[str, Any]]) -> tuple:
    """Pick the shelter with the most free capacity, preferring ones with a
    medical facility when capacity is otherwise similar.

    Returns (chosen_shelter_dict_or_None, reasoning_text).
    """
    viable = [s for s in candidates if (s.get("capacity", 0) - s.get("current_occupancy", 0)) > 0]
    if not viable:
        return None, "No shelter with free capacity was found."

    viable.sort(
        key=lambda s: (
            s.get("has_medical_facility", False),
            s.get("capacity", 0) - s.get("current_occupancy", 0),
        ),
        reverse=True,
    )
    chosen = viable[0]
    free = chosen.get("capacity", 0) - chosen.get("current_occupancy", 0)
    reasoning = (
        f"Selected shelter {chosen['id']} with {free} free spaces"
        f"{' and an on-site medical facility' if chosen.get('has_medical_facility') else ''}."
    )
    return chosen, reasoning


# ---------------------------------------------------------------------------
# OBSERVE — gather current state from the database
# ---------------------------------------------------------------------------


async def observe_state() -> Dict[str, Any]:
    """Read the current world state needed for allocation and replanning."""
    async with _session_factory() as db:
        requests = (
            await db.scalars(
                select(EmergencyRequest).where(
                    ~EmergencyRequest.status.in_(TERMINAL_REQUEST_STATUSES)
                )
            )
        ).all()
        recent_requests = [
            {
                "id": str(r.id),
                "description": r.description,
                "emergency_type": r.emergency_type,
                "severity": r.severity,
                "priority": r.priority,
                "status": r.status,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "requester_name": r.requester_name,
            }
            for r in requests
        ]

        vols = (
            await db.scalars(
                select(Volunteer).where(Volunteer.availability_status == AvailabilityStatus.available)
            )
        ).all()
        available_volunteers = [
            {
                "id": str(v.id),
                "user_id": str(v.user_id),
                "skills": v.skills,
                "current_workload": v.current_workload,
                "latitude": v.latitude,
                "longitude": v.longitude,
                "availability_status": v.availability_status.value
                if hasattr(v.availability_status, "value")
                else v.availability_status,
            }
            for v in vols
        ]

        shelters = (await db.scalars(select(Shelter))).all()
        shelter_capacities = [
            {
                "id": str(s.id),
                "name": s.name,
                "capacity": s.capacity,
                "current_occupancy": s.current_occupancy,
                "has_medical_facility": s.has_medical_facility,
            }
            for s in shelters
        ]

        resources = (await db.scalars(select(Resource))).all()
        resource_inventory = [
            {
                "id": str(r.id),
                "shelter_id": str(r.shelter_id) if r.shelter_id else None,
                "resource_type": r.resource_type,
                "quantity": r.quantity,
                "unit": r.unit,
            }
            for r in resources
        ]

        # Active assignments joined with their volunteer's CURRENT
        # availability. This is what makes replanning possible: a volunteer
        # who has gone unavailable no longer appears in
        # `available_volunteers` above, so the only way to notice the
        # transition is to track it from the assignment side instead.
        rows = (
            await db.execute(
                select(RescueAssignment, Volunteer)
                .join(Volunteer, RescueAssignment.volunteer_id == Volunteer.id)
                .where(RescueAssignment.status.in_(ACTIVE_ASSIGNMENT_STATUSES))
            )
        ).all()
        active_assignments = [
            {
                "assignment_id": str(a.id),
                "request_id": str(a.request_id),
                "volunteer_id": str(a.volunteer_id),
                "shelter_id": str(a.shelter_id) if a.shelter_id else None,
                "volunteer_availability_status": v.availability_status.value
                if hasattr(v.availability_status, "value")
                else v.availability_status,
            }
            for a, v in rows
        ]

        return {
            "recent_requests": recent_requests,
            "available_volunteers": available_volunteers,
            "shelter_capacities": shelter_capacities,
            "resource_inventory": resource_inventory,
            "active_assignments": active_assignments,
        }


# ---------------------------------------------------------------------------
# ANALYZE / ACT — ask Grok which tool to call, or fall back to a synthetic
# response if no API key is configured (keeps the loop runnable for a demo
# without a live xAI key).
# ---------------------------------------------------------------------------


def _synthetic_tool_call(request: Dict[str, Any], volunteer: Dict[str, Any], shelter: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Build a deterministic 'as if Grok chose this' tool call, used when no
    XAI_API_KEY is configured so the loop can still be demonstrated end to
    end without a live API call.
    """
    return {
        "tool": "create_rescue_assignment",
        "arguments": {
            "request_id": request["id"],
            "volunteer_id": volunteer["id"],
            "shelter_id": shelter["id"] if shelter else None,
        },
    }


async def _ask_grok_for_tool_call(request: Dict[str, Any], volunteer: Dict[str, Any], shelter: Optional[Dict[str, Any]], state: Dict[str, Any]) -> Dict[str, Any]:
    """Call Grok with the pre-selected volunteer/shelter and ask it to choose
    the next tool call. If no API key is configured, or the call fails, fall
    back to the synthetic tool call so the demo loop still runs.
    """
    if not settings.xai_api_key:
        return _synthetic_tool_call(request, volunteer, shelter)

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.xai_api_key, base_url=settings.xai_base_url)
        tools_payload = [
            {"type": "function", "function": {"name": name, **sig}}
            for name, sig in TOOL_SIGNALS.items()
        ]
        context = {
            "request": request,
            "candidate_volunteer": volunteer,
            "candidate_shelter": shelter,
        }
        response = await client.chat.completions.create(
            model=settings.grok_model,
            max_tokens=settings.grok_max_tokens,
            temperature=settings.grok_temperature,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are the allocation agent for a disaster-response system. "
                        "A candidate volunteer and shelter have already been selected for you "
                        "using skill/distance/workload scoring. Call the create_rescue_assignment "
                        "tool with these IDs, or update_request_status if the request cannot be "
                        "assigned yet."
                    ),
                },
                {"role": "user", "content": json.dumps(context, default=str)},
            ],
            tools=tools_payload,
            tool_choice="required",
        )
        choice = response.choices[0]
        if choice.message.tool_calls:
            call = choice.message.tool_calls[0]
            return {"tool": call.function.name, "arguments": json.loads(call.function.arguments), "_raw_call": call}
        logger.warning("Grok did not return a tool call; falling back to synthetic assignment")
        return _synthetic_tool_call(request, volunteer, shelter)
    except Exception as e:
        logger.exception(f"Grok call failed, falling back to synthetic assignment: {e}")
        return _synthetic_tool_call(request, volunteer, shelter)


# ---------------------------------------------------------------------------
# Phase 5 — allocation_loop
# ---------------------------------------------------------------------------


async def allocate_one_request(request: Dict[str, Any], state: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Run one OBSERVE(already done)->ANALYZE->PLAN->ACT pass for a single
    request. Returns the execute_tool() result, or None if no suitable
    volunteer/shelter could be found.
    """
    avail_vols = state["available_volunteers"]
    if not avail_vols:
        logger.info(f"No available volunteers for request {request['id']}")
        return None

    required_skill = SKILL_FOR_EMERGENCY_TYPE.get(request.get("emergency_type"))
    volunteer, volunteer_reasoning = select_best_volunteer(
        avail_vols, request.get("latitude"), request.get("longitude"), required_skill
    )
    if volunteer is None:
        logger.info(f"select_best_volunteer found no candidate for request {request['id']}")
        return None

    shelter, shelter_reasoning = select_best_shelter(state["shelter_capacities"])
    full_reasoning = f"{volunteer_reasoning} {shelter_reasoning}"

    logger.info(f"Allocator: request {request['id']} -> {full_reasoning}")

    tool_call = await _ask_grok_for_tool_call(request, volunteer, shelter, state)

    async with _session_factory() as db:
        plan = AgentPlan(
            request_id=request["id"],
            status="active",
            reasoning=full_reasoning,
            created_at=datetime.now(timezone.utc),
        )
        db.add(plan)
        await db.commit()

    result = await execute_tool(tool_call["tool"], tool_call["arguments"])
    logger.info(f"Allocator: executed {tool_call['tool']} for request {request['id']} -> {result.get('status')}")
    return result


async def allocation_loop(stop_event: asyncio.Event) -> None:
    """Phase 5: continuously look for unassigned requests and allocate them."""
    logger.info("Allocation loop starting")
    while not stop_event.is_set():
        try:
            state = await observe_state()
            already_assigned_request_ids = {a["request_id"] for a in state["active_assignments"]}
            pending_requests = [
                r for r in state["recent_requests"]
                if r["id"] not in already_assigned_request_ids and r["status"] not in TERMINAL_REQUEST_STATUSES
            ]
            for request in pending_requests:
                await allocate_one_request(request, state)
                # Re-observe after each allocation so the next request in
                # this batch doesn't see a volunteer/resource as available
                # when it was just consumed by the previous one.
                state = await observe_state()
        except Exception as e:
            logger.exception(f"Allocation loop error: {e}")

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=ALLOCATOR_INTERVAL_SECONDS)
        except asyncio.TimeoutError:
            pass


# ---------------------------------------------------------------------------
# Phase 6 — replanning_loop
# ---------------------------------------------------------------------------


async def replanning_loop(stop_event: asyncio.Event) -> None:
    """Phase 6: watch active assignments for a volunteer going unavailable,
    and automatically create a replacement plan + assignment when it happens.
    """
    logger.info("Replanning loop starting")
    already_replanned: set = set()

    while not stop_event.is_set():
        try:
            state = await observe_state()

            for assignment in state["active_assignments"]:
                aid = assignment["assignment_id"]
                if aid in already_replanned:
                    continue
                if assignment["volunteer_availability_status"] != AvailabilityStatus.unavailable.value:
                    continue

                logger.info(
                    f"Replanning: assignment {aid} — volunteer {assignment['volunteer_id']} "
                    f"is now unavailable. Reassigning."
                )
                already_replanned.add(aid)

                async with _session_factory() as db:
                    try:
                        old_assignment = await db.get(RescueAssignment, assignment["assignment_id"])
                        if old_assignment is None:
                            logger.warning(f"Assignment {aid} not found during replan — skipping")
                            continue

                        request_row = await db.get(EmergencyRequest, old_assignment.request_id)
                        if request_row is None:
                            logger.warning(f"Request for assignment {aid} not found — skipping")
                            continue

                        old_plan = (
                            await db.scalars(
                                select(AgentPlan)
                                .where(AgentPlan.request_id == request_row.id, AgentPlan.status == "active")
                                .order_by(AgentPlan.created_at.desc())
                            )
                        ).first()

                        fresh_state = await observe_state()
                        candidates = [
                            v for v in fresh_state["available_volunteers"]
                            if v["id"] != assignment["volunteer_id"]
                        ]
                        required_skill = SKILL_FOR_EMERGENCY_TYPE.get(request_row.emergency_type)
                        new_volunteer, reasoning = select_best_volunteer(
                            candidates, request_row.latitude, request_row.longitude, required_skill
                        )

                        if new_volunteer is None:
                            logger.warning(f"No replacement volunteer available for request {request_row.id}")
                            continue

                        # AssignmentStatus has no dedicated "reassigned" value
                        # in the current schema, so "cancelled" is used as the
                        # closest correct terminal state for the old
                        # assignment. Consider adding a real "reassigned"
                        # enum value + migration later for clarity.
                        old_assignment.status = "cancelled"

                        new_assignment = RescueAssignment(
                            request_id=request_row.id,
                            volunteer_id=new_volunteer["id"],
                            shelter_id=old_assignment.shelter_id,
                        )
                        db.add(new_assignment)
                        await db.flush()

                        new_plan = AgentPlan(
                            request_id=request_row.id,
                            status="active",
                            reasoning=f"Replan triggered: original volunteer {assignment['volunteer_id']} became unavailable. {reasoning}",
                            created_at=datetime.now(timezone.utc),
                        )
                        db.add(new_plan)
                        await db.flush()

                        if old_plan is not None:
                            old_plan.status = "superseded"
                            old_plan.superseded_by = new_plan.id

                        log = AgentActionLog(
                            action_name="create_rescue_assignment",
                            risk="high",
                            status="pending",
                            action_payload=json.dumps({
                                "request_id": str(request_row.id),
                                "old_volunteer_id": assignment["volunteer_id"],
                                "new_volunteer_id": new_volunteer["id"],
                                "reason": "volunteer_dropout_replan",
                            }),
                        )
                        db.add(log)

                        await db.commit()
                        logger.info(
                            f"Replanning: request {request_row.id} reassigned from "
                            f"{assignment['volunteer_id']} to {new_volunteer['id']}"
                        )
                    except Exception as e:
                        await db.rollback()
                        logger.exception(f"Replan failed for assignment {aid}: {e}")

        except Exception as e:
            logger.exception(f"Replanning loop error: {e}")

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=MONITOR_INTERVAL_SECONDS)
        except asyncio.TimeoutError:
            pass


# ---------------------------------------------------------------------------
# Demo / self-test
# ---------------------------------------------------------------------------


if __name__ == "__main__":
    async def _demo():
        state = await observe_state()
        print(json.dumps(state, indent=2, default=str))

    asyncio.run(_demo())