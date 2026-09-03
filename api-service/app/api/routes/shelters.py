import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.shelter import Shelter
from app.models.user import User
from app.schemas.shelter import ShelterCreate, ShelterRead, ShelterUpdate

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


@router.post("", response_model=ShelterRead, status_code=201)
async def create_shelter(
    data: ShelterCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> ShelterRead:
    shelter = Shelter(**data.model_dump())
    db.add(shelter)
    await db.commit()
    await db.refresh(shelter)
    return ShelterRead.model_validate(shelter)


@router.patch("/{shelter_id}", response_model=ShelterRead)
async def update_shelter(
    shelter_id: uuid.UUID,
    data: ShelterUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> ShelterRead:
    shelter = await db.get(Shelter, shelter_id)
    if shelter is None:
        raise HTTPException(status_code=404, detail="Shelter not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(shelter, field, value)
    await db.commit()
    await db.refresh(shelter)
    return ShelterRead.model_validate(shelter)