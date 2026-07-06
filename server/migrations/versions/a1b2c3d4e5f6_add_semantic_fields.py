"""add semantic fields and embedding

Revision ID: a1b2c3d4e5f6
Revises: f3b73a5f172c
Create Date: 2026-07-06 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f3b73a5f172c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    
    op.add_column('profiles', sa.Column('skills', sa.JSON(), nullable=True))
    op.add_column('profiles', sa.Column('interests', sa.JSON(), nullable=True))
    op.add_column('profiles', sa.Column('grad_year', sa.Integer(), nullable=True))
    op.add_column('profiles', sa.Column('major', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('semantic_hash', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('embedding', Vector(dim=384), nullable=True))
    
    op.execute("CREATE INDEX IF NOT EXISTS profile_embedding_hnsw_idx ON profiles USING hnsw (embedding vector_cosine_ops);")


def downgrade() -> None:
    op.drop_index('profile_embedding_hnsw_idx', table_name='profiles')
    
    op.drop_column('profiles', 'embedding')
    op.drop_column('profiles', 'semantic_hash')
    op.drop_column('profiles', 'major')
    op.drop_column('profiles', 'grad_year')
    op.drop_column('profiles', 'interests')
    op.drop_column('profiles', 'skills')
