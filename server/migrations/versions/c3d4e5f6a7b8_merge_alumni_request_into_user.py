"""Merge AlumniRequest into User

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-06 16:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Create Enum type
    alumni_status_enum = postgresql.ENUM('NOT_REQUESTED', 'PENDING', 'APPROVED', 'REJECTED', name='alumnistatus')
    alumni_status_enum.create(op.get_bind(), checkfirst=True)

    # 2. Add new columns to users
    op.add_column('users', sa.Column('alumni_status', sa.Enum('NOT_REQUESTED', 'PENDING', 'APPROVED', 'REJECTED', name='alumnistatus'), server_default='NOT_REQUESTED', nullable=False))
    op.add_column('users', sa.Column('alumni_requested_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('alumni_reviewed_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('reviewed_by_id', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('review_notes', sa.String(), nullable=True))
    
    op.create_index(op.f('ix_users_alumni_status'), 'users', ['alumni_status'], unique=False)
    op.create_foreign_key('fk_users_reviewed_by_id', 'users', 'users', ['reviewed_by_id'], ['id'], ondelete='SET NULL')

    # 3. Data Migration
    # 3a. Existing approved alumni
    op.execute("""
        UPDATE users 
        SET alumni_status = 'APPROVED'
        WHERE role = 'ALUMNI'
    """)
    
    # 3b. Pending / Rejected requests (take latest per user)
    op.execute("""
        WITH ranked_requests AS (
            SELECT 
                user_id,
                status,
                created_at,
                reviewed_at,
                reviewed_by,
                rejection_reason,
                ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY created_at DESC) as rn
            FROM alumni_requests
            WHERE status IN ('pending', 'rejected')
        )
        UPDATE users
        SET 
            alumni_status = UPPER(r.status)::alumnistatus,
            alumni_requested_at = r.created_at,
            alumni_reviewed_at = r.reviewed_at,
            reviewed_by_id = r.reviewed_by,
            review_notes = r.rejection_reason
        FROM ranked_requests r
        WHERE users.id = r.user_id AND r.rn = 1 AND users.alumni_status = 'NOT_REQUESTED'
    """)

    # 4. Drop old table
    op.drop_index('ix_alumni_requests_college_id', table_name='alumni_requests')
    op.drop_index('ix_alumni_requests_created_at', table_name='alumni_requests')
    op.drop_index('ix_alumni_requests_id', table_name='alumni_requests')
    op.drop_index('ix_alumni_requests_status', table_name='alumni_requests')
    op.drop_index('ix_alumni_requests_user_id', table_name='alumni_requests')
    op.drop_table('alumni_requests')
    
    # Drop old enum
    op.execute("DROP TYPE IF EXISTS alumnirequeststatus")


def downgrade() -> None:
    # 1. Recreate Enum type
    alumni_req_status_enum = postgresql.ENUM('pending', 'approved', 'rejected', name='alumnirequeststatus')
    alumni_req_status_enum.create(op.get_bind(), checkfirst=True)

    # 2. Recreate old table
    op.create_table('alumni_requests',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('college_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('status', sa.Enum('pending', 'approved', 'rejected', name='alumnirequeststatus'), autoincrement=False, nullable=True),
    sa.Column('reviewed_by', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('rejection_reason', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column('reviewed_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['college_id'], ['colleges.id'], name='alumni_requests_college_id_fkey'),
    sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], name='alumni_requests_reviewed_by_fkey'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='alumni_requests_user_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='alumni_requests_pkey'),
    sa.UniqueConstraint('user_id', 'college_id', name='unique_user_college_alumni_request')
    )
    op.create_index('ix_alumni_requests_user_id', 'alumni_requests', ['user_id'], unique=False)
    op.create_index('ix_alumni_requests_status', 'alumni_requests', ['status'], unique=False)
    op.create_index('ix_alumni_requests_id', 'alumni_requests', ['id'], unique=False)
    op.create_index('ix_alumni_requests_created_at', 'alumni_requests', ['created_at'], unique=False)
    op.create_index('ix_alumni_requests_college_id', 'alumni_requests', ['college_id'], unique=False)

    # 3. Migrate data back
    op.execute("""
        INSERT INTO alumni_requests (user_id, college_id, status, reviewed_by, rejection_reason, created_at, reviewed_at)
        SELECT 
            id, 
            college_id, 
            LOWER(alumni_status::text)::alumnirequeststatus, 
            reviewed_by_id, 
            review_notes, 
            COALESCE(alumni_requested_at, created_at), 
            alumni_reviewed_at
        FROM users
        WHERE alumni_status IN ('PENDING', 'APPROVED', 'REJECTED')
    """)

    # 4. Drop columns from users
    op.drop_constraint('fk_users_reviewed_by_id', 'users', type_='foreignkey')
    op.drop_index(op.f('ix_users_alumni_status'), table_name='users')
    op.drop_column('users', 'review_notes')
    op.drop_column('users', 'reviewed_by_id')
    op.drop_column('users', 'alumni_reviewed_at')
    op.drop_column('users', 'alumni_requested_at')
    op.drop_column('users', 'alumni_status')
    
    op.execute("DROP TYPE IF EXISTS alumnistatus")
