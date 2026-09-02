import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import EmergencyType, Priority, RequestStatus, Severity


class EmergencyRequestCreate(BaseModel):
    emergency_type: EmergencyType
    description: str = Field(min_length=1, max_length=2000)
    requester_name: str = Field(min_length=1, max_length=255)
    requester_contact: str = Field(min_length=1, max_length=255)
    latitude: float | None = None
    longitude: float | None = None
    number_of_people: int = Field(ge=1, default=1)


class EmergencyRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    requester_user_id: uuid.UUID | None
    requester_name: str
    requester_contact: str
    emergency_type: EmergencyType
    description: str
    latitude: float | None
    longitude: float | None
    number_of_people: int
    status: RequestStatus
    severity: Severity | None
    priority: Priority | None
    ai_reasoning: str | None
    created_at: datetime
    updated_at: datetime


class EmergencyRequestCreated(EmergencyRequestRead):
    pass