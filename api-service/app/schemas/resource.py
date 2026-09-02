import uuid

from pydantic import BaseModel, ConfigDict

from app.models.enums import ResourceType


class ResourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    shelter_id: uuid.UUID | None
    resource_type: ResourceType
    quantity: int
    unit: str