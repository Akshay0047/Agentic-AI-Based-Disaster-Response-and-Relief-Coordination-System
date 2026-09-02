import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.emergency_request import EmergencyRequest
from app.models.enums import UserRole
from app.models.rescue_assignment import RescueAssignment
from app.models.user import User
from app.schemas.assignment import AssignmentRead

router = APIRouter(prefix="/assignments", tags=["assignments"])


async def _owned_volunteer_id(db: AsyncSession, user: User) -> uuid.UUID | None:
    from app.models.volunteer import Volunteer

    result = await db.execute(select(Volunteer).where(Volunteer.user_id == user.id))
    volunteer = result.scalar_one_or_none()
    return volunteer.id if volunteer is not None else None


@router.get("", response_model=list[AssignmentRead])
async def list_assignments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AssignmentRead]:
    stmt = select(RescueAssignment)

    if current_user.role == UserRole.admin:
        pass
    elif current_user.role == UserRole.volunteer:
        volunteer_id = await _owned_volunteer_id(db, current_user)
        if volunteer_id is None:
            return []
        stmt = stmt.where(RescueAssignment.volunteer_id == volunteer_id)
    elif current_user.role == UserRole.citizen:
        stmt = stmt.join(
            EmergencyRequest, EmergencyRequest.id == RescueAssignment.request_id
        ).where(EmergencyRequest.requester_user_id == current_user.id)

    result = await db.execute(stmt)
    assignments = list(result.scalars().all())
    return [AssignmentRead.model_validate(a) for a in assignments]


@router.get("/{assignment_id}", response_model=AssignmentRead)
async def get_assignment(
    assignment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AssignmentRead:
    assignment = await db.get(RescueAssignment, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if current_user.role == UserRole.admin:
        return AssignmentRead.model_validate(assignment)

    if current_user.role == UserRole.volunteer:
        volunteer_id = await _owned_volunteer_id(db, current_user)
        if volunteer_id is None or assignment.volunteer_id != volunteer_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return AssignmentRead.model_validate(assignment)

    if current_user.role == UserRole.citizen:
        request = await db.get(EmergencyRequest, assignment.request_id)
        if request is None or request.requester_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return AssignmentRead.model_validate(assignment)

    raise HTTPException(status_code=403, detail="Insufficient permissions")