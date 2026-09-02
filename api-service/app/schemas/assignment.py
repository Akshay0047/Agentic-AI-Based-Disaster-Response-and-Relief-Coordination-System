import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import AssignmentStatus


class AssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    request_id: uuid.UUID
    volunteer_id: uuid.UUID | None
    shelter_id: uuid.UUID | None
    status: AssignmentStatus
    ai_reasoning: str | None
    accepted_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime