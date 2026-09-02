from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.resource import Resource
from app.models.user import User
from app.schemas.resource import ResourceRead

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("", response_model=list[ResourceRead])
async def list_resources(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[ResourceRead]:
    result = await db.execute(select(Resource))
    resources = list(result.scalars().all())
    return [ResourceRead.model_validate(r) for r in resources]