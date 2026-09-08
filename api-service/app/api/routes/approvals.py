"""Admin oversight endpoints for deferred high-risk agent actions."""
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import require_admin
from app.db.session import get_db
from app.models.agent_action_log import AgentActionLog
from app.models.user import User
from app.services.agent_actions import DeferredActionError, execute_approved_action

router = APIRouter(tags=["agent-approvals"])

def _serialize(action: AgentActionLog) -> dict:
    return {"id": str(action.id), "action_name": action.action_name,
            "action_payload": json.loads(action.action_payload or "{}"),
            "risk": getattr(action.risk, "value", action.risk), "status": getattr(action.status, "value", action.status),
            "approved_by": str(action.approved_by) if action.approved_by else None,
            "created_at": action.created_at.isoformat() if action.created_at else None,
            "updated_at": action.updated_at.isoformat() if action.updated_at else None}

async def _get_pending_action(action_id: uuid.UUID, db: AsyncSession) -> AgentActionLog:
    action = await db.get(AgentActionLog, action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Agent action not found")
    if getattr(action.status, "value", action.status) != "pending":
        raise HTTPException(status_code=409, detail="Agent action has already been decided")
    return action

@router.get("/agent/pending-approvals")
async def pending_approvals(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    rows = (await db.scalars(select(AgentActionLog).where(AgentActionLog.status == "pending").order_by(AgentActionLog.created_at.desc()))).all()
    return [_serialize(row) for row in rows]

@router.post("/agent/approve/{action_id}")
async def approve_action(action_id: uuid.UUID, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)) -> dict:
    action = await _get_pending_action(action_id, db)
    try:
        result = await execute_approved_action(db, action.action_name, json.loads(action.action_payload or "{}"))
    except (json.JSONDecodeError, DeferredActionError) as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    action.status, action.approved_by = "approved", admin.id
    await db.commit(); await db.refresh(action)
    return {"action": _serialize(action), "result": result}

@router.post("/agent/reject/{action_id}")
async def reject_action(action_id: uuid.UUID, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)) -> dict:
    action = await _get_pending_action(action_id, db)
    action.status, action.approved_by = "rejected", admin.id
    await db.commit(); await db.refresh(action)
    return {"action": _serialize(action)}

@router.get("/admin/logs")
async def audit_log(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    rows = (await db.scalars(select(AgentActionLog).order_by(AgentActionLog.created_at.desc()))).all()
    return [_serialize(row) for row in rows]
