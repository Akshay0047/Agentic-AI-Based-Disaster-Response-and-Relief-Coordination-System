import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.shelter import Shelter
from app.models.user import User
from app.schemas.shelter import ShelterRead

router = APIRouter(prefix="/shelters", tags=["shelters"])


@router.get("", response_model=list[ShelterRead])
async def list_shelters(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[ShelterRead]:
    result = await db.execute(select(Shelter))
    shelters = list(result.scalars().all())
    return [ShelterRead.model_validate(s) for s in shelters]


@router.get("/{shelter_id}", response_model=ShelterRead)
async def get_shelter(
    shelter_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ShelterRead:
    shelter = await db.get(Shelter, shelter_id)
    if shelter is None:
        raise HTTPException(status_code=404, detail="Shelter not found")
    return ShelterRead.model_validate(shelter)