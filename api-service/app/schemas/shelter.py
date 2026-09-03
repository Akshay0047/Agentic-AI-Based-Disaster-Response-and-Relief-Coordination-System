import uuid

from pydantic import BaseModel, ConfigDict


class ShelterCreate(BaseModel):
    name: str
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    capacity: int = 0
    current_occupancy: int = 0
    has_medical_facility: bool = False


class ShelterUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    capacity: int | None = None
    current_occupancy: int | None = None
    has_medical_facility: bool | None = None


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