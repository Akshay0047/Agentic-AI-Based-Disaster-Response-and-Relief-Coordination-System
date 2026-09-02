import uuid

from pydantic import BaseModel, ConfigDict

from app.models.enums import AvailabilityStatus


class VolunteerBase(BaseModel):
    skills: list[str] = []
    equipment: list[str] = []
    latitude: float | None = None
    longitude: float | None = None


class VolunteerRead(VolunteerBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    availability_status: AvailabilityStatus
    current_workload: int


class VolunteerAvailabilityUpdate(BaseModel):
    availability_status: AvailabilityStatus