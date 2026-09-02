import uuid

from pydantic import BaseModel, ConfigDict


class ShelterRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    address: str | None
    latitude: float | None
    longitude: float | None
    capacity: int
    current_occupancy: int
    has_medical_facility: bool