import uuid

from pydantic import BaseModel, ConfigDict

from app.models.enums import ResourceType


class ResourceCreate(BaseModel):
    shelter_id: uuid.UUID | None = None
    resource_type: ResourceType
    quantity: int = 0
    unit: str = "units"


class ResourceUpdate(BaseModel):
    shelter_id: uuid.UUID | None = None
    resource_type: ResourceType | None = None
    quantity: int | None = None
    unit: str | None = None


class ResourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    shelter_id: uuid.UUID | None
    resource_type: ResourceType
    quantity: int
    unit: str