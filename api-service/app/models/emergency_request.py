import uuid

from sqlalchemy import Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import EmergencyType, Priority, RequestStatus, Severity


class EmergencyRequest(Base, TimestampMixin):
    __tablename__ = "emergency_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    requester_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    requester_name: Mapped[str] = mapped_column(String(255), nullable=False)
    requester_contact: Mapped[str] = mapped_column(String(255), nullable=False)

    emergency_type: Mapped[EmergencyType] = mapped_column(
        Enum(EmergencyType, name="emergency_type"), nullable=False
    )
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    number_of_people: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status"), nullable=False, default=RequestStatus.new
    )
    severity: Mapped[Severity | None] = mapped_column(
        Enum(Severity, name="severity"), nullable=True
    )
    priority: Mapped[Priority | None] = mapped_column(
        Enum(Priority, name="priority"), nullable=True
    )
    ai_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)

    requester = relationship("User", back_populates="emergency_requests")
    rescue_assignments = relationship("RescueAssignment", back_populates="request")
    agent_plans = relationship("AgentPlan", back_populates="request")