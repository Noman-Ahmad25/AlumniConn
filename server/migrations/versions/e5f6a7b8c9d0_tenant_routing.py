"""Add tenant routing fields

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-07-06 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import re

# revision identifiers, used by Alembic.
revision = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None

def generate_slug(name: str) -> str:
    # Basic slugify: lowercase, replace non-alphanumeric with hyphens, strip hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return slug

def upgrade() -> None:
    # 1. Update Users with password reset fields
    op.add_column('users', sa.Column('password_reset_token_hash', sa.String(), nullable=True))
    op.add_column('users', sa.Column('password_reset_expires_at', sa.DateTime(), nullable=True))
    op.create_index(op.f('ix_users_password_reset_token_hash'), 'users', ['password_reset_token_hash'], unique=True)
    
    # 2. Add slug to colleges
    op.add_column('colleges', sa.Column('slug', sa.String(), nullable=True))
    
    # 3. Create CollegeBranding table
    op.create_table(
        'college_brandings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('college_id', sa.Integer(), nullable=False),
        sa.Column('logo_url', sa.String(), nullable=True),
        sa.Column('banner_url', sa.String(), nullable=True),
        sa.Column('favicon_url', sa.String(), nullable=True),
        sa.Column('primary_color', sa.String(), server_default='#007bff', nullable=False),
        sa.Column('secondary_color', sa.String(), server_default='#6c757d', nullable=False),
        sa.Column('accent_color', sa.String(), server_default='#0056b3', nullable=False),
        sa.Column('background_color', sa.String(), server_default='#f8f9fa', nullable=False),
        sa.Column('typography_preset', sa.String(), server_default='inter', nullable=False),
        sa.Column('homepage_layout', sa.String(), server_default='standard', nullable=False),
        sa.Column('welcome_message', sa.String(), nullable=True),
        sa.Column('motto', sa.String(), nullable=True),
        sa.Column('social_links', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('quick_links', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['college_id'], ['colleges.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_college_brandings_college_id'), 'college_brandings', ['college_id'], unique=True)
    op.create_index(op.f('ix_college_brandings_id'), 'college_brandings', ['id'], unique=False)
    
    # 4. Backfill existing colleges with slugs and default brandings
    connection = op.get_bind()
    colleges = connection.execute(sa.text("SELECT id, name FROM colleges")).fetchall()
    
    for college_id, name in colleges:
        slug = generate_slug(name)
        # Ensure slug uniqueness in the loop might be tricky if dupes exist, but assuming college names are unique
        connection.execute(
            sa.text("UPDATE colleges SET slug = :slug WHERE id = :id"),
            {"slug": slug, "id": college_id}
        )
        # Insert default branding
        connection.execute(
            sa.text("""
                INSERT INTO college_brandings (college_id, primary_color, secondary_color, accent_color, background_color, typography_preset, homepage_layout)
                VALUES (:college_id, '#007bff', '#6c757d', '#0056b3', '#f8f9fa', 'inter', 'standard')
            """),
            {"college_id": college_id}
        )
        
    # 5. Make slug non-nullable and add index
    op.alter_column('colleges', 'slug', nullable=False)
    op.create_index(op.f('ix_colleges_slug'), 'colleges', ['slug'], unique=True)

def downgrade() -> None:
    op.drop_index(op.f('ix_colleges_slug'), table_name='colleges')
    op.drop_column('colleges', 'slug')
    
    op.drop_index(op.f('ix_college_brandings_id'), table_name='college_brandings')
    op.drop_index(op.f('ix_college_brandings_college_id'), table_name='college_brandings')
    op.drop_table('college_brandings')
    
    op.drop_index(op.f('ix_users_password_reset_token_hash'), table_name='users')
    op.drop_column('users', 'password_reset_expires_at')
    op.drop_column('users', 'password_reset_token_hash')
