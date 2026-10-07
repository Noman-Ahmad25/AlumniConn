import unittest
from fastapi import HTTPException
from src.database.session import SessionLocal
from src.models.user import User, UserRole, AlumniStatus
from src.models.college import College
from src.models.college_request import CollegeRequest, CollegeRequestStatus
from src.routes.admin_management import (
    get_platform_overview,
    list_admin_colleges,
    update_college_status,
    delete_college,
    list_platform_users,
    list_college_users,
    update_user_status,
    update_user_role,
    delete_user,
)
from src.routes.auth import demo_login
from src.schemas.admin_management import (
    DemoLoginRequest,
    UserStatusUpdate,
    UserRoleUpdate,
    CollegeStatusUpdate,
)


class TestAdminManagement(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()
        cls.super_admin = cls.db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
        cls.college_admin_nitk = (
            cls.db.query(User)
            .filter(User.role == UserRole.ADMIN, User.username == "admin_nitk")
            .first()
        )
        cls.nitk = cls.db.query(College).filter(College.slug == "nitk").first()
        cls.other_college = cls.db.query(College).filter(College.slug != "nitk").first()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_demo_login_all_roles(self):
        """Verify 1-click demo login generates valid access tokens for all 4 roles."""
        roles = ["super_admin", "college_admin", "alumni", "student"]
        for role in roles:
            resp = demo_login(DemoLoginRequest(demo_role=role), db=self.db)
            self.assertIn("access_token", resp)
            self.assertEqual(resp["token_type"], "bearer")
            self.assertTrue(len(resp["access_token"]) > 50)
            if role == "super_admin":
                self.assertIsNone(resp["college_slug"])
                self.assertEqual(resp["role"], "super_admin")
            else:
                self.assertIsNotNone(resp["college_slug"])

    def test_02_platform_overview_metrics(self):
        """Verify platform overview returns real DB statistics and dynamic activity log."""
        overview = get_platform_overview(db=self.db, current_user=self.super_admin)
        self.assertGreaterEqual(overview["total_colleges"], 3)
        self.assertGreaterEqual(overview["active_colleges"], 2)
        self.assertGreaterEqual(overview["pending_requests"], 1)
        self.assertGreaterEqual(overview["total_users"], 80)
        self.assertGreaterEqual(overview["alumni_count"], 70)
        self.assertGreaterEqual(overview["student_count"], 1)
        self.assertIsInstance(overview["recent_activity"], list)
        self.assertTrue(len(overview["recent_activity"]) > 0)

    def test_03_super_admin_universities_management(self):
        """Verify universities listing, search, status toggles, and deletion safeguard."""
        colleges = list_admin_colleges(db=self.db, current_user=self.super_admin)
        self.assertTrue(len(colleges) >= 3)
        nitk_item = next(c for c in colleges if c.slug == "nitk")
        self.assertTrue(nitk_item.is_active)
        self.assertTrue(nitk_item.total_users > 50)

        # Search filter
        search_res = list_admin_colleges(search="Crestview", db=self.db, current_user=self.super_admin)
        self.assertEqual(len(search_res), 1)
        self.assertEqual(search_res[0].slug, "crestview-university")

        # Status toggle
        crestview_item = next(c for c in colleges if c.slug == "crestview-university")
        initial_status = crestview_item.is_active
        updated = update_college_status(
            crestview_item.id,
            CollegeStatusUpdate(is_active=not initial_status),
            db=self.db,
            current_user=self.super_admin,
        )
        self.assertEqual(updated.is_active, not initial_status)
        # Restore status
        update_college_status(
            crestview_item.id,
            CollegeStatusUpdate(is_active=initial_status),
            db=self.db,
            current_user=self.super_admin,
        )

        # Deletion safeguard for primary college NITK
        with self.assertRaises(HTTPException) as ctx:
            delete_college(nitk_item.id, db=self.db, current_user=self.super_admin)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("primary reference college", ctx.exception.detail)

    def test_04_college_admin_tenant_isolation(self):
        """Verify College Admin is strictly isolated to their own college."""
        # College admin listing
        ca_users = list_college_users(db=self.db, current_user=self.college_admin_nitk)
        for u in ca_users:
            self.assertEqual(u.college_id, self.college_admin_nitk.college_id)
            self.assertNotEqual(u.role, "super_admin")

        # College admin modifying user in another college must raise 403
        other_user = self.db.query(User).filter(User.college_id == self.other_college.id).first()
        if other_user:
            with self.assertRaises(HTTPException) as ctx:
                update_user_status(
                    other_user.id,
                    UserStatusUpdate(is_active=False),
                    db=self.db,
                    current_user=self.college_admin_nitk,
                )
            self.assertEqual(ctx.exception.status_code, 403)
            self.assertIn("another college", ctx.exception.detail)

    def test_05_student_promotion_and_demotion(self):
        """Verify promoting a student to alumni and demoting back updates role and alumni_status."""
        student = (
            self.db.query(User)
            .filter(User.role == UserRole.STUDENT, User.college_id == self.college_admin_nitk.college_id)
            .first()
        )
        self.assertIsNotNone(student)

        # Promote to alumni
        update_user_role(
            student.id,
            UserRoleUpdate(role="alumni"),
            db=self.db,
            current_user=self.college_admin_nitk,
        )
        self.db.refresh(student)
        self.assertEqual(student.role, UserRole.ALUMNI)
        self.assertEqual(student.alumni_status, AlumniStatus.APPROVED)
        self.assertEqual(student.reviewed_by_id, self.college_admin_nitk.id)

        # Demote back to student
        update_user_role(
            student.id,
            UserRoleUpdate(role="student"),
            db=self.db,
            current_user=self.college_admin_nitk,
        )
        self.db.refresh(student)
        self.assertEqual(student.role, UserRole.STUDENT)
        self.assertEqual(student.alumni_status, AlumniStatus.NOT_REQUESTED)

    def test_06_college_admin_privilege_escalation_blocked(self):
        """Verify College Admin cannot grant admin or super_admin roles."""
        student = (
            self.db.query(User)
            .filter(User.role == UserRole.STUDENT, User.college_id == self.college_admin_nitk.college_id)
            .first()
        )
        with self.assertRaises(HTTPException) as ctx:
            update_user_role(
                student.id,
                UserRoleUpdate(role="admin"),
                db=self.db,
                current_user=self.college_admin_nitk,
            )
        self.assertEqual(ctx.exception.status_code, 403)

        with self.assertRaises(HTTPException) as ctx2:
            update_user_role(
                student.id,
                UserRoleUpdate(role="super_admin"),
                db=self.db,
                current_user=self.college_admin_nitk,
            )
        self.assertEqual(ctx2.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
