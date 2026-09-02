import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.emergency_request import EmergencyRequest
from app.models.enums import RequestStatus, UserRole
from app.schemas.emergency_request import EmergencyRequestCreate
from app.services.queue_service import queue_service

logger = logging.getLogger(__name__)


class RequestService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_request(
        self,
        data: EmergencyRequestCreate,
        user_id: uuid.UUID,
        requester_name: str | None = None,
    ) -> EmergencyRequest:
        request = EmergencyRequest(
            requester_user_id=user_id,
            requester_name=requester_name or data.requester_name,
            requester_contact=data.requester_contact,
            emergency_type=data.emergency_type,
            description=data.description,
            latitude=data.latitude,
            longitude=data.longitude,
            number_of_people=data.number_of_people,
            status=RequestStatus.new,
        )
        self.db.add(request)
        await self.db.commit()
        await self.db.refresh(request)

        # Prepare architecture for SQS: publish (no-op in Phase 1).
        queue_service.publish_emergency_request(str(request.id))

        return request

    async def list_requests(
        self, user: "object", limit: int = 50, offset: int = 0
    ) -> list[EmergencyRequest]:
        stmt = select(EmergencyRequest)
        if user.role == UserRole.citizen:
            stmt = stmt.where(EmergencyRequest.requester_user_id == user.id)
        stmt = stmt.order_by(EmergencyRequest.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_request(
        self, request_id: uuid.UUID, user: "object"
    ) -> EmergencyRequest:
        request = await self.db.get(EmergencyRequest, request_id)
        if request is None:
            return None
        if user.role == UserRole.citizen and request.requester_user_id != user.id:
            return None
        return request