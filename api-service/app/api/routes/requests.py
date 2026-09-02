import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.emergency_request import (
    EmergencyRequestCreate,
    EmergencyRequestRead,
)
from app.services.request_service import RequestService

router = APIRouter(prefix="/requests", tags=["requests"])


@router.post("", response_model=EmergencyRequestRead, status_code=201)
async def create_request(
    data: EmergencyRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EmergencyRequestRead:
    request = await RequestService(db).create_request(
        data, current_user.id, requester_name=current_user.full_name
    )
    return EmergencyRequestRead.model_validate(request)


@router.get("", response_model=list[EmergencyRequestRead])
async def list_requests(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[EmergencyRequestRead]:
    requests = await RequestService(db).list_requests(current_user, limit, offset)
    return [EmergencyRequestRead.model_validate(r) for r in requests]


@router.get("/{request_id}", response_model=EmergencyRequestRead)
async def get_request(
    request_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EmergencyRequestRead:
    request = await RequestService(db).get_request(request_id, current_user)
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return EmergencyRequestRead.model_validate(request)