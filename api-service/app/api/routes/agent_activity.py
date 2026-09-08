"""Database-backed activity history for the autonomous agent."""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.agent_action_log import AgentActionLog
from app.models.agent_plan import AgentPlan

router = APIRouter(prefix="/agent", tags=["agent"])

@router.get("/activity")
async def agent_activity(request_id: uuid.UUID | None = Query(default=None), db: AsyncSession = Depends(get_db)) -> dict:
    stmt = select(AgentPlan).order_by(AgentPlan.created_at.desc()).limit(25)
    if request_id:
        stmt = stmt.where(AgentPlan.request_id == request_id)
    plans = (await db.scalars(stmt)).all()
    count_rows = await db.execute(select(AgentActionLog.status, func.count(AgentActionLog.id)).group_by(AgentActionLog.status))
    action_counts = {key: 0 for key in ("pending", "approved", "rejected", "executed")}
    for action_status, count in count_rows.all():
        action_counts[getattr(action_status, "value", action_status)] = count
    history = [{"id": str(plan.id), "request_id": str(plan.request_id) if plan.request_id else None,
                "status": getattr(plan.status, "value", plan.status), "reasoning": plan.reasoning,
                "plan_summary": plan.plan_summary, "created_at": plan.created_at.isoformat() if plan.created_at else None,
                "superseded_by": str(plan.superseded_by) if plan.superseded_by else None} for plan in plans]
    superseded = [plan for plan in history if plan["status"] == "superseded"]
    return {"request_id": str(request_id) if request_id else None, "plans": history,
            "has_superseded_plan": bool(superseded),
            "supersessions": [{"plan_id": plan["id"], "superseded_by": plan["superseded_by"]} for plan in superseded],
            "action_counts": action_counts}
