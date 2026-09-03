import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.models.volunteer import Volunteer
from app.schemas.volunteer import (
    VolunteerAvailabilityUpdate,
    VolunteerRead,
    VolunteerUpdate,
)

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


@router.get("", response_model=list[VolunteerRead])
async def list_volunteers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[VolunteerRead]:
    # Admin sees all; volunteer sees own record.
    if current_user.role == UserRole.admin:
        result = await db.execute(select(Volunteer))
        volunteers = list(result.scalars().all())
    elif current_user.role == UserRole.volunteer:
        result = await db.execute(select(Volunteer).where(Volunteer.user_id == current_user.id))
        volunteers = list(result.scalars().all())
    else:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return [VolunteerRead.model_validate(v) for v in volunteers]


@router.get("/{volunteer_id}", response_model=VolunteerRead)
async def get_volunteer(
    volunteer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VolunteerRead:
    volunteer = await db.get(Volunteer, volunteer_id)
    if volunteer is None:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    if current_user.role != UserRole.admin and volunteer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    return VolunteerRead.model_validate(volunteer)


@router.patch("/{volunteer_id}/availability", response_model=VolunteerRead)
async def update_availability(
    volunteer_id: uuid.UUID,
    data: VolunteerAvailabilityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VolunteerRead:
    volunteer = await db.get(Volunteer, volunteer_id)
    if volunteer is None:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    if current_user.role != UserRole.admin and volunteer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    volunteer.availability_status = data.availability_status
    await db.commit()
    await db.refresh(volunteer)
    return VolunteerRead.model_validate(volunteer)


@router.patch("/{volunteer_id}", response_model=VolunteerRead)
async def update_volunteer(
    volunteer_id: uuid.UUID,
    data: VolunteerUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> VolunteerRead:
    volunteer = await db.get(Volunteer, volunteer_id)
    if volunteer is None:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(volunteer, field, value)
    await db.commit()
    await db.refresh(volunteer)
    return VolunteerRead.model_validate(volunteer)