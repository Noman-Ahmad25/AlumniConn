"""add notifications table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-06 16:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the Enum type manually if necessary (or rely on sa.Enum creation)
    # SQLAlchemy sa.Enum creates type automatically in PostgreSQL usually.
    notification_type_enum = sa.Enum(
        'CONNECTION_RECEIVED', 'CONNECTION_ACCEPTED', 'CONNECTION_REJECTED',
        'MESSAGE_RECEIVED', 'POST_LIKED', 'POST_COMMENTED',
        'ALUMNI_REQUEST_APPROVED', 'ALUMNI_REQUEST_REJECTED',
        'COLLEGE_REQUEST_APPROVED', 'COLLEGE_REQUEST_REJECTED',
        'RECOMMENDATIONS_AVAILABLE',
        name='notificationtype'
    )
    
    op.create_table(
        'notifications',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('recipient_id', sa.Integer(), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('notification_type', notification_type_enum, nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index('idx_notifications_recipient_created', 'notifications', ['recipient_id', sa.text('created_at DESC')], unique=False)
    op.create_index('idx_notifications_recipient_unread', 'notifications', ['recipient_id', 'is_read'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_notifications_recipient_unread', table_name='notifications')
    op.drop_index('idx_notifications_recipient_created', table_name='notifications')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')
    
    op.execute("DROP TYPE notificationtype;")
