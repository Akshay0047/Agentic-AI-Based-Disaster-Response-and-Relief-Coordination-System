from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.db.session import get_db as get_db_gen
from sqlalchemy import select, text
from app.models.emergency_request import EmergencyRequest
from app.models.volunteer import Volunteer
from app.models.shelter import Shelter
from app.models.resource import Resource
from app.models.agent_plan import AgentPlan
from app.models.agent_action_log import AgentActionLog
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/agent", tags=["agent"])


@router.get("/activity", tags=["agent"])
async def agent_activity(db: AsyncSession = Depends(get_db)):
    """Return current AI agent loop activity state for the frontend panel.

    Summarises the latest OBSERVE→ANALYZE→PLAN→ACT→MONITOR→REPLAN cycle:
      - recent_requests: count of new/triaged requests
      - available_volunteers: count of available volunteers
      - shelter_capacities: occupancy info
      - resource_inventory: low-stock warnings
      - last_tool: the most recent tool that was executed
      - last_plan_reasoning: reasoning from the latest agent_plan row
      - loop_status: current state of the agent loops
    """
    # Recent new/triaged requests
    reqs = await db.execute(
        select(EmergencyRequest).where(
            EmergencyRequest.status.in_(["new", "triaged"])
        )
    )
    recent_requests = reqs.scalars().all()
    req_count = len(recent_requests)

    # Available volunteers
    vols = await db.execute(select(Volunteer).where(Volunteer.availability_status == "available"))
    available_volunteers = vols.scalars().all()
    vol_count = len(available_volunteers)

    # Shelter capacities
    shelters = await db.execute(select(Shelter))
    shelters_list = shelters.scalars().all()
    shelter_info = []
    resource_warning = False
    for s in shelters_list:
        resource_items = []
        # Check resources for this shelter
        res = await db.execute(
            select(Resource).where(Resource.shelter_id == s.id)
        )
        resources_list = res.scalars().all()
        for r in resources_list:
            resource_items.append(
                {"type": r.resource_type, "quantity": r.quantity, "unit": r.unit}
            )
            if r.quantity < 20:
                resource_warning = True
        shelter_info.append(
            {
                "id": str(s.id),
                "name": s.name,
                "capacity": s.capacity,
                "occupancy": s.current_occupancy,
                "resources": resource_items,
            }
        )

    # Latest agent plan
    plans = await db.execute(
        select(AgentPlan).order_by(AgentPlan.created_at.desc())
    )
    latest_plan = plans.scalars().first()
    last_plan_reasoning = latest_plan.reasoning if latest_plan else "no plans yet"
    last_tool = "none"
    if latest_plan and latest_plan.reasoning:
        # try to extract tool name from reasoning
        if "choose" in latest_plan.reasoning.lower():
            last_tool = "grok_decision"
        elif "execute" in latest_plan.reasoning.lower():
            last_tool = "tool_execution"
        else:
            last_tool = "agent_action"

    # Loop status text
    observing = f"{req_count} new requests, {vol_count} available volunteers"
    analyzing = "Grok decision pending" if req_count > 0 and vol_count > 0 else "waiting for work"
    planning = f"planning assignment for request {recent_requests[0].id if recent_requests else 'none'}"
    acting = f"last tool: {last_tool}"
    monitoring = "watching state changes"
    replanning = "stable"

    # Resource warning
    resource_warning_flag = resource_warning

    return {
        "observing": observing,
        "analyzing": analyzing,
        "planning": planning,
        "acting": acting,
        "monitoring": monitoring,
        "replanning": replanning,
        "lastTool": last_tool,
        "lastPlanReasoning": last_plan_reasoning,
        "resourceWarning": resource_warning_flag,
    }