import uuid

from sqlalchemy import Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import AvailabilityStatus


class Volunteer(Base, TimestampMixin):
    __tablename__ = "volunteers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    skills: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    equipment: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    availability_status: Mapped[AvailabilityStatus] = mapped_column(
        Enum(AvailabilityStatus, name="availability_status"),
        nullable=False,
        default=AvailabilityStatus.available,
    )
    current_workload: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    user = relationship("User", back_populates="volunteer")
    assignments = relationship("RescueAssignment", back_populates="volunteer")