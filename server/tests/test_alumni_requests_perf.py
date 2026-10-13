import os
import unittest
from datetime import datetime

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key-1234567890"
os.environ["ALGORITHM"] = "HS256"

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.database.base import Base
from src.models.college import College
from src.models.user import User, UserRole, AlumniStatus
from src.models.profile import Profile
from src.routes.alumni import list_alumni_requests, format_alumni_request
from src.services.alumni_service import list_alumni_requests_for_admin


class TestAlumniRequestsPerformance(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(
            bind=cls.engine,
            tables=[College.__table__, User.__table__, Profile.__table__],
        )
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        # Clean up
        self.db.query(Profile).delete()
        self.db.query(User).delete()
        self.db.query(College).delete()
        self.db.commit()

        # Seed college
        self.college = College(
            name="Test University",
            domain="test.edu",
            slug="test-univ",
            is_approved=True,
            is_active=True,
        )
        self.db.add(self.college)
        self.db.commit()
        self.db.refresh(self.college)

        # Seed admin
        self.admin = User(
            username="admin_user",
            email="admin@test.edu",
            password_hash="hash",
            role=UserRole.ADMIN,
            college_id=self.college.id,
            is_active=True,
        )
        self.db.add(self.admin)
        self.db.commit()
        self.db.refresh(self.admin)

        # Seed 100 users with profiles and alumni_status
        for i in range(100):
            user = User(
                username=f"student_{i}",
                email=f"student_{i}@test.edu",
                password_hash="hash",
                role=UserRole.STUDENT,
                college_id=self.college.id,
                is_active=True,
                alumni_status=AlumniStatus.PENDING if i % 2 == 0 else AlumniStatus.APPROVED,
                alumni_requested_at=datetime.utcnow(),
            )
            self.db.add(user)
            self.db.flush()

            profile = Profile(
                user_id=user.id,
                college_id=self.college.id,
                full_name=f"Student Number {i}",
            )
            self.db.add(profile)

        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_list_alumni_requests_query_count(self):
        """Measure number of SQL queries when listing 100 alumni requests."""
        # Expire all cached objects in session so lazy loads are forced to hit DB
        self.db.expire_all()

        query_log = []

        def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            query_log.append(statement)

        event.listen(self.engine, "before_cursor_execute", before_cursor_execute)

        try:
            results = list_alumni_requests(
                status_filter=None,
                skip=0,
                limit=100,
                db=self.db,
                current_user=self.admin,
            )
            self.assertEqual(len(results), 100)
            # Query count MUST be bounded (<= 2 queries total, down from 103 queries)
            self.assertLessEqual(len(query_log), 2)
            # Verify profile full_name is correctly populated without triggering lazy loads
            for r in results:
                self.assertIsNotNone(r["full_name"])
                self.assertTrue(r["full_name"].startswith("Student Number"))
        finally:
            event.remove(self.engine, "before_cursor_execute", before_cursor_execute)

    def test_list_alumni_requests_status_filtering(self):
        """Verify filtering by status works correctly."""
        pending_results = list_alumni_requests(
            status_filter="pending",
            skip=0,
            limit=100,
            db=self.db,
            current_user=self.admin,
        )
        self.assertEqual(len(pending_results), 50)
        for r in pending_results:
            self.assertEqual(r["status"], "pending")

        approved_results = list_alumni_requests(
            status_filter="approved",
            skip=0,
            limit=100,
            db=self.db,
            current_user=self.admin,
        )
        self.assertEqual(len(approved_results), 50)
        for r in approved_results:
            self.assertEqual(r["status"], "approved")

    def test_list_alumni_requests_tenant_isolation(self):
        """Verify Admin cannot see requests from another college."""
        other_college = College(
            name="Other University",
            domain="other.edu",
            slug="other-univ",
            is_approved=True,
            is_active=True,
        )
        self.db.add(other_college)
        self.db.commit()

        other_user = User(
            username="other_student",
            email="other@other.edu",
            password_hash="hash",
            role=UserRole.STUDENT,
            college_id=other_college.id,
            is_active=True,
            alumni_status=AlumniStatus.PENDING,
            alumni_requested_at=datetime.utcnow(),
        )
        self.db.add(other_user)
        self.db.commit()

        # Admin of test.edu should NOT see other_college's student
        results = list_alumni_requests(
            status_filter=None,
            skip=0,
            limit=100,
            db=self.db,
            current_user=self.admin,
        )
        self.assertFalse(any(r["user_id"] == other_user.id for r in results))

    def test_list_alumni_requests_rbac(self):
        """Verify non-admin users cannot access alumni requests."""
        student_user = self.db.query(User).filter(User.role == UserRole.STUDENT).first()
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            list_alumni_requests(
                status_filter=None,
                skip=0,
                limit=100,
                db=self.db,
                current_user=student_user,
            )
        self.assertEqual(ctx.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
