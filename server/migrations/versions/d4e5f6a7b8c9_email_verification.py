"""Add email verification fields

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-07-06 17:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'd4e5f6a7b8c9'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Update Users
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('verification_token_hash', sa.String(), nullable=True))
    op.add_column('users', sa.Column('verification_token_expires_at', sa.DateTime(), nullable=True))
    
    op.create_index(op.f('ix_users_email_verified'), 'users', ['email_verified'], unique=False)
    op.create_index(op.f('ix_users_verification_token_hash'), 'users', ['verification_token_hash'], unique=True)
    
    # We drop the old activation token fields
    op.drop_index('ix_users_activation_token_hash', table_name='users')
    op.drop_column('users', 'activation_token_expires_at')
    op.drop_column('users', 'activation_token_hash')

    # 2. Update CollegeRequests
    op.add_column('college_requests', sa.Column('password_hash', sa.String(), nullable=True))
    op.add_column('college_requests', sa.Column('email_verified', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('college_requests', sa.Column('email_verified_at', sa.DateTime(), nullable=True))
    op.add_column('college_requests', sa.Column('verification_token_hash', sa.String(), nullable=True))
    op.add_column('college_requests', sa.Column('verification_token_expires_at', sa.DateTime(), nullable=True))
    
    op.create_index(op.f('ix_college_requests_email_verified'), 'college_requests', ['email_verified'], unique=False)
    op.create_index(op.f('ix_college_requests_verification_token_hash'), 'college_requests', ['verification_token_hash'], unique=True)
    
    # Migrate requested_by -> reviewed_by & password backfill
    op.execute("""
        UPDATE college_requests
        SET 
            password_hash = u.password_hash,
            reviewed_by = u.reviewed_by_id
        FROM users u
        WHERE college_requests.requested_by = u.id
    """)
    
    # We must ensure password_hash is not null for new rows.
    # Set it to empty string for old requests if any lack a user.
    op.execute("UPDATE college_requests SET password_hash = '' WHERE password_hash IS NULL")
    op.alter_column('college_requests', 'password_hash', nullable=False)
    
    # Drop requested_by from college_requests
    op.drop_constraint('college_requests_requested_by_fkey', 'college_requests', type_='foreignkey')
    op.drop_index('ix_college_requests_requested_by', table_name='college_requests')
    op.drop_column('college_requests', 'requested_by')
    
    # Note: For existing active users, set email_verified = true
    op.execute("UPDATE users SET email_verified = true WHERE is_active = true")
    

def downgrade() -> None:
    # 2. Downgrade CollegeRequests
    op.add_column('college_requests', sa.Column('requested_by', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('college_requests_requested_by_fkey', 'college_requests', 'users', ['requested_by'], ['id'])
    op.create_index('ix_college_requests_requested_by', 'college_requests', ['requested_by'], unique=False)
    
    op.drop_index(op.f('ix_college_requests_verification_token_hash'), table_name='college_requests')
    op.drop_index(op.f('ix_college_requests_email_verified'), table_name='college_requests')
    
    op.drop_column('college_requests', 'verification_token_expires_at')
    op.drop_column('college_requests', 'verification_token_hash')
    op.drop_column('college_requests', 'email_verified_at')
    op.drop_column('college_requests', 'email_verified')
    op.drop_column('college_requests', 'password_hash')

    # 1. Downgrade Users
    op.add_column('users', sa.Column('activation_token_hash', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('users', sa.Column('activation_token_expires_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True))
    op.create_index('ix_users_activation_token_hash', 'users', ['activation_token_hash'], unique=True)
    
    op.drop_index(op.f('ix_users_verification_token_hash'), table_name='users')
    op.drop_index(op.f('ix_users_email_verified'), table_name='users')
    
    op.drop_column('users', 'verification_token_expires_at')
    op.drop_column('users', 'verification_token_hash')
    op.drop_column('users', 'email_verified_at')
    op.drop_column('users', 'email_verified')
