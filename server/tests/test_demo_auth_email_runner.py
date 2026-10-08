import unittest
import urllib.parse
from fastapi import HTTPException
from src.database.session import SessionLocal
from src.models.user import User, UserRole, AlumniStatus
from src.models.college import College
from src.schemas.user import UserLogin, SuperAdminLogin, UserCreate, ForgotPasswordRequest
from src.schemas.admin_management import DemoLoginRequest
from src.routes.auth import (
    login,
    super_admin_login,
    demo_login,
    get_email_mode,
    get_demo_emails,
    clear_demo_emails,
    register,
    verify_email,
    handle_forgot_password,
)
from src.routes.admin_management import delete_college, delete_user
from src.routes.alumni import get_my_alumni_request
from src.services.alumni_service import list_alumni_requests_for_admin
from src.services.email.demo_store import demo_email_store
import asyncio
import inspect
from src.utils.dispatcher import AbstractTaskDispatcher


class SynchronousTaskDispatcher(AbstractTaskDispatcher):
    def dispatch(self, task, *args, **kwargs):
        res = task(*args, **kwargs)
        if inspect.iscoroutine(res):
            asyncio.run(res)


class TestDemoAuthEmail(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()
        cls.task_dispatcher = SynchronousTaskDispatcher()
        cls.super_admin = cls.db.query(User).filter(User.username == "superadmin").first()
        cls.demo_super_admin = cls.db.query(User).filter(User.username == "demo_superadmin").first()
        cls.admin_nitk = cls.db.query(User).filter(User.username == "admin_nitk").first()
        cls.demo_alumni = cls.db.query(User).filter(User.username == "demo_alumni").first()
        cls.demo_student = cls.db.query(User).filter(User.username == "demo_student").first()
        cls.nitk = cls.db.query(College).filter(College.slug == "nitk").first()
        cls.other_college = cls.db.query(College).filter(College.slug != "nitk").first()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def setUp(self):
        self.db.rollback()

    def test_01_username_and_email_login_tenant(self):
        """Verify normal tenant login works with either username or email."""
        # 1. Login with email
        email_login = UserLogin(
            username_or_email=self.admin_nitk.email,
            password="Admin@Alumni2026!",
            college_slug="nitk",
        )
        res1 = login(email_login, db=self.db)
        self.assertIn("access_token", res1)
        self.assertEqual(res1["token_type"], "bearer")

        # 2. Login with username
        username_login = UserLogin(
            username_or_email="admin_nitk",
            password="Admin@Alumni2026!",
            college_slug="nitk",
        )
        res2 = login(username_login, db=self.db)
        self.assertIn("access_token", res2)
        self.assertEqual(res2["token_type"], "bearer")

    def test_02_username_and_email_login_super_admin(self):
        """Verify Super Admin login works with either username or email."""
        # 1. Login with email
        email_login = SuperAdminLogin(
            username_or_email="admin2@gmail.com",
            password="noman123",
        )
        res1 = super_admin_login(email_login, db=self.db)
        self.assertIn("access_token", res1)

        # 2. Login with username
        username_login = SuperAdminLogin(
            username_or_email="superadmin",
            password="noman123",
        )
        res2 = super_admin_login(username_login, db=self.db)
        self.assertIn("access_token", res2)

    def test_03_dedicated_demo_personas_resolution(self):
        """Verify 1-click demo login resolves directly to the dedicated synthetic personas."""
        # 1. Super Admin -> demo_superadmin
        res_sa = demo_login(DemoLoginRequest(demo_role="super_admin"), db=self.db)
        self.assertIn("access_token", res_sa)
        self.assertEqual(res_sa["role"], "super_admin")

        # 2. College Admin -> admin_nitk
        res_ca = demo_login(DemoLoginRequest(demo_role="college_admin"), db=self.db)
        self.assertIn("access_token", res_ca)
        self.assertEqual(res_ca["college_slug"], "nitk")

        # 3. Alumni -> demo_alumni
        res_alumni = demo_login(DemoLoginRequest(demo_role="alumni"), db=self.db)
        self.assertIn("access_token", res_alumni)
        self.assertEqual(res_alumni["college_slug"], "nitk")
        self.assertEqual(res_alumni["role"], "alumni")

        # 4. Student -> demo_student
        res_student = demo_login(DemoLoginRequest(demo_role="student"), db=self.db)
        self.assertIn("access_token", res_student)
        self.assertEqual(res_student["college_slug"], "nitk")
        self.assertEqual(res_student["role"], "student")

    def test_04_demo_super_admin_destructive_safety(self):
        """Verify demo_superadmin is strictly blocked from destructive operations (HTTP 403)."""
        self.assertIsNotNone(self.demo_super_admin, "demo_superadmin must exist")

        # 1. demo_superadmin cannot delete a college
        with self.assertRaises(HTTPException) as ctx:
            delete_college(
                college_id=self.other_college.id,
                db=self.db,
                current_user=self.demo_super_admin,
            )
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Destructive action blocked", ctx.exception.detail)

        # 2. demo_superadmin cannot delete a user
        with self.assertRaises(HTTPException) as ctx:
            delete_user(
                user_id=self.demo_student.id,
                db=self.db,
                current_user=self.demo_super_admin,
            )
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Destructive action blocked", ctx.exception.detail)

    def test_05_protected_demo_accounts_deletion_prevention(self):
        """Verify protected demo accounts cannot be deleted by anyone."""
        with self.assertRaises(HTTPException) as ctx:
            delete_user(
                user_id=self.demo_alumni.id,
                db=self.db,
                current_user=self.super_admin,
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Cannot delete protected demo account", ctx.exception.detail)

    def test_06_demo_email_interception_and_verification_flow(self):
        """Verify EMAIL_MODE=demo captures outbound emails and enables 1-click verification."""
        # 1. Check email mode endpoint
        mode_res = get_email_mode()
        self.assertIn("email_mode", mode_res)
        self.assertEqual(mode_res["email_mode"], "demo")

        # 2. Clear inbox before test
        clear_demo_emails()

        # 3. Register a test user
        test_email = f"test.newstudent@{self.nitk.domain}"
        test_username = "test_newstudent"

        # Cleanup in case already exists from previous test
        existing = self.db.query(User).filter(User.email == test_email).first()
        if existing:
            if existing.profile:
                self.db.delete(existing.profile)
            self.db.delete(existing)
            self.db.commit()

        user_create = UserCreate(
            username=test_username,
            email=test_email,
            password="Password@123!",
            college_slug="nitk",
            role=UserRole.STUDENT,
        )

        reg_res = register(user_create, db=self.db, task_dispatcher=self.task_dispatcher)
        self.assertIsNotNone(reg_res)

        # 4. Verify email was intercepted
        inbox_res = get_demo_emails(to_email=test_email)
        self.assertEqual(inbox_res["total"], 1)
        email_event = inbox_res["emails"][0]
        self.assertEqual(email_event["to_email"], test_email)
        self.assertEqual(email_event["action_type"], "user_verification")
        self.assertIsNotNone(email_event["action_url"])

        # 5. Extract verification token from intercepted URL and verify
        parsed_url = urllib.parse.urlparse(email_event["action_url"])
        query_params = urllib.parse.parse_qs(parsed_url.query)
        self.assertIn("token", query_params)
        token = query_params["token"][0]

        verify_res = verify_email(token=token, db=self.db)
        self.assertEqual(verify_res["message"], "Email verified successfully")

        # 6. Verify user in database is now email_verified=True
        verified_user = self.db.query(User).filter(User.email == test_email).first()
        self.assertTrue(verified_user.email_verified)

        # Cleanup
        if verified_user.profile:
            self.db.delete(verified_user.profile)
        self.db.delete(verified_user)
        self.db.commit()

    def test_07_demo_email_forgot_password_flow(self):
        """Verify forgot-password generates intercepted email with password reset action URL."""
        clear_demo_emails()

        forgot_req = ForgotPasswordRequest(
            username_or_email="demo_alumni",
            college_slug="nitk",
        )
        handle_forgot_password(forgot_req, db=self.db, task_dispatcher=self.task_dispatcher)

        inbox_res = get_demo_emails(to_email=self.demo_alumni.email)
        self.assertGreaterEqual(inbox_res["total"], 1)
        email_event = inbox_res["emails"][0]
        self.assertEqual(email_event["action_type"], "password_reset")
        self.assertIn("/reset-password", email_event["action_url"])

    def test_08_alumni_registration_initial_student_role_and_pending_request(self):
        """Verify registering with role=ALUMNI creates a STUDENT with pending alumni request."""
        test_email = f"test.futurealumni@{self.nitk.domain}"
        test_username = "test_futurealumni"

        # Cleanup if exists
        existing = self.db.query(User).filter(User.email == test_email).first()
        if existing:
            if existing.profile:
                self.db.delete(existing.profile)
            self.db.delete(existing)
            self.db.commit()

        user_create = UserCreate(
            username=test_username,
            email=test_email,
            password="Password@123!",
            college_slug="nitk",
            role=UserRole.ALUMNI,
        )

        reg_res = register(user_create, db=self.db, task_dispatcher=self.task_dispatcher)
        self.assertIsNotNone(reg_res)
        # 1. Registered role must be STUDENT
        self.assertEqual(reg_res.role, UserRole.STUDENT)
        # 2. Alumni status must be PENDING
        self.assertEqual(reg_res.alumni_status, AlumniStatus.PENDING)
        self.assertIsNotNone(reg_res.alumni_requested_at)

        # 3. Check DB directly
        created_user = self.db.query(User).filter(User.email == test_email).first()
        self.assertEqual(created_user.role, UserRole.STUDENT)
        self.assertEqual(created_user.alumni_status, AlumniStatus.PENDING)
        self.assertIsNotNone(created_user.alumni_requested_at)

        # 4. Verify /alumni-requests/me returns pending status for this user
        my_req = get_my_alumni_request(current_user=created_user)
        self.assertEqual(my_req["status"], "pending")
        self.assertEqual(my_req["user_id"], created_user.id)

        # 5. Verify the college admin sees this pending request
        admin_reqs = list_alumni_requests_for_admin(
            db=self.db,
            admin_id=self.admin_nitk.id,
            college_id=self.nitk.id,
            status="pending",
        )
        found = any(u.id == created_user.id for u in admin_reqs)
        self.assertTrue(found, "Pending request must be visible to college admin")

        # Cleanup
        if created_user.profile:
            self.db.delete(created_user.profile)
        self.db.delete(created_user)
        self.db.commit()


if __name__ == "__main__":
    unittest.main()
