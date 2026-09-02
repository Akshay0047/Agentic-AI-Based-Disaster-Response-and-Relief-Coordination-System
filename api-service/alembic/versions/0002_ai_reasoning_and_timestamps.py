"""add ai_reasoning, assignment timestamps, workload-aware volunteer fields

Revision ID: 0002_ai_reasoning_and_timestamps
Revises: 0001_initial
Create Date: 2026-09-02 00:00:00

"""
from alembic import op
import sqlalchemy as sa

revision = "0002_ai_reasoning_and_timestamps"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- emergency_requests: ai_reasoning ---
    op.add_column(
        "emergency_requests",
        sa.Column("ai_reasoning", sa.Text(), nullable=True),
    )

    # --- rescue_assignments: ai_reasoning + lifecycle timestamps ---
    op.add_column(
        "rescue_assignments",
        sa.Column("ai_reasoning", sa.Text(), nullable=True),
    )
    op.add_column(
        "rescue_assignments",
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "rescue_assignments",
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    # --- volunteers: availability boolean -> enum + workload ---
    # 1. Add the enum type.
    availability_status_enum = sa.Enum(
        "available", "busy", "unavailable", name="availability_status"
    )
    availability_status_enum.create(op.get_bind(), checkfirst=True)

    # 2. Add the new enum column (nullable) and the workload column.
    op.add_column(
        "volunteers",
        sa.Column(
            "availability_status",
            availability_status_enum,
            nullable=True,
        ),
    )
    op.add_column(
        "volunteers",
        sa.Column(
            "current_workload",
            sa.Integer(),
            nullable=True,
        ),
    )

    # 3. Backfill from the old boolean: True -> 'available', False -> 'unavailable'.
    op.execute(
        "UPDATE volunteers "
        "SET availability_status = CASE WHEN availability "
        "THEN 'available'::availability_status ELSE 'unavailable'::availability_status END"
    )
    op.execute(
        "UPDATE volunteers SET availability_status = 'available'::availability_status "
        "WHERE availability_status IS NULL"
    )

    # 4. Make the new columns NOT NULL and set defaults.
    op.alter_column("volunteers", "availability_status", nullable=False)
    op.alter_column(
        "volunteers",
        "current_workload",
        nullable=False,
        server_default="0",
    )

    # 5. Drop the old boolean column.
    op.drop_column("volunteers", "availability")

    # --- indexes on frequently filtered columns ---
    op.create_index("ix_emergency_requests_status", "emergency_requests", ["status"])
    op.create_index(
        "ix_volunteers_availability_status",
        "volunteers",
        ["availability_status"],
    )


def downgrade() -> None:
    op.drop_index("ix_volunteers_availability_status", table_name="volunteers")
    op.drop_index("ix_emergency_requests_status", table_name="emergency_requests")

    # Re-add boolean availability; cannot losslessly restore, so default to True.
    op.add_column(
        "volunteers",
        sa.Column("availability", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.execute(
        "UPDATE volunteers SET availability = (availability_status = 'available')"
    )
    op.drop_column("volunteers", "current_workload")
    op.drop_column("volunteers", "availability_status")

    availability_status_enum = sa.Enum(
        "available", "busy", "unavailable", name="availability_status"
    )
    availability_status_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_column("rescue_assignments", "completed_at")
    op.drop_column("rescue_assignments", "accepted_at")
    op.drop_column("rescue_assignments", "ai_reasoning")
    op.drop_column("emergency_requests", "ai_reasoning")