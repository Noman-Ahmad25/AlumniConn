"""Add performance indexes

Revision ID: 4a8c9e1b2d3f
Revises: 293e6cac4656
Create Date: 2026-10-14 01:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '4a8c9e1b2d3f'
down_revision: Union[str, Sequence[str], None] = '293e6cac4656'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table performance indexes
    op.create_index(op.f('ix_users_college_id'), 'users', ['college_id'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    op.create_index(op.f('ix_users_is_active'), 'users', ['is_active'], unique=False)
    op.create_index(op.f('ix_users_created_at'), 'users', ['created_at'], unique=False)

    # Posts table performance indexes
    op.create_index(op.f('ix_posts_user_id'), 'posts', ['user_id'], unique=False)
    op.create_index(op.f('ix_posts_created_at'), 'posts', ['created_at'], unique=False)
    op.create_index(op.f('ix_posts_is_opportunity'), 'posts', ['is_opportunity'], unique=False)

    # Likes & Comments post_id indexes for feed aggregation
    op.create_index(op.f('ix_likes_post_id'), 'likes', ['post_id'], unique=False)
    op.create_index(op.f('ix_comments_post_id'), 'comments', ['post_id'], unique=False)

    # Connections table performance indexes
    op.create_index(op.f('ix_connections_college_id'), 'connections', ['college_id'], unique=False)
    op.create_index(op.f('ix_connections_status'), 'connections', ['status'], unique=False)

    # Conversations table performance indexes
    op.create_index(op.f('ix_conversations_user1_id'), 'conversations', ['user1_id'], unique=False)
    op.create_index(op.f('ix_conversations_user2_id'), 'conversations', ['user2_id'], unique=False)
    op.create_index(op.f('ix_conversations_college_id'), 'conversations', ['college_id'], unique=False)

    # Messages table performance indexes
    op.create_index(op.f('ix_messages_college_id'), 'messages', ['college_id'], unique=False)
    op.create_index(op.f('ix_messages_conversation_id'), 'messages', ['conversation_id'], unique=False)
    op.create_index(op.f('ix_messages_timestamp'), 'messages', ['timestamp'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_messages_timestamp'), table_name='messages')
    op.drop_index(op.f('ix_messages_conversation_id'), table_name='messages')
    op.drop_index(op.f('ix_messages_college_id'), table_name='messages')

    op.drop_index(op.f('ix_conversations_college_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_user2_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_user1_id'), table_name='conversations')

    op.drop_index(op.f('ix_connections_status'), table_name='connections')
    op.drop_index(op.f('ix_connections_college_id'), table_name='connections')

    op.drop_index(op.f('ix_comments_post_id'), table_name='comments')
    op.drop_index(op.f('ix_likes_post_id'), table_name='likes')

    op.drop_index(op.f('ix_posts_is_opportunity'), table_name='posts')
    op.drop_index(op.f('ix_posts_created_at'), table_name='posts')
    op.drop_index(op.f('ix_posts_user_id'), table_name='posts')

    op.drop_index(op.f('ix_users_created_at'), table_name='users')
    op.drop_index(op.f('ix_users_is_active'), table_name='users')
    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_index(op.f('ix_users_college_id'), table_name='users')
