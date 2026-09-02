import uuid

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import PlanStatus


class AgentPlan(Base, TimestampMixin):
    __tablename__ = "agent_plans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    request_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emergency_requests.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[PlanStatus] = mapped_column(
        Enum(PlanStatus, name="plan_status"), nullable=False, default=PlanStatus.active
    )
    plan_summary: Mapped[str] = mapped_column(Text, nullable=True)
    reasoning: Mapped[str] = mapped_column(Text, nullable=True)
    superseded_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agent_plans.id", ondelete="SET NULL"), nullable=True
    )

    request = relationship("EmergencyRequest", back_populates="agent_plans")
    previous_plan = relationship(
        "AgentPlan", remote_side=[id], backref="next_plan"
    )