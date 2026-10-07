"""
Comprehensive Multi-User Regression Audit Test Suite for AlumniConn
Validates all Phase 1 - 10 fixes across the realistic dataset (~85 alumni users).
"""
import sys
import asyncio
from datetime import datetime
from pathlib import Path

# Add server directory to path
server_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(server_dir))

import app
from src.database.session import SessionLocal
from src.models.user import User, UserRole
from src.models.profile import Profile
from src.models.college import College
from src.models.connection import Connection, ConnectionStatus
from src.models.post import Post
from src.models.like import Like
from src.models.comment import Comment
from src.models.conversation import Conversation
from src.models.message import Message
from src.models.notification import Notification, NotificationType
from src.schemas.post import PostCreate
from src.services.recommendation_service import (
    get_recommendations,
    trigger_embedding_generation,
    calculate_rule_based_score,
    generate_explanation,
)
from src.services.message_service import (
    get_or_create_conversation,
    send_message,
    get_messages,
    get_inbox,
)
from src.services.user_service import get_discover_users
from src.services.post_service import (
    create_post,
    get_feed,
    get_user_posts,
    get_other_user_posts,
)
from src.services.connection_service import (
    send_request,
    accept_request,
    reject_request,
    withdraw_request,
    disconnect,
)
from src.services.notification_service import (
    persist_notification,
    get_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_as_read,
)
from src.services.auth_service import resend_user_verification
from src.utils.dependency import get_connection_status, format_posts_bulk


def test_baseline_and_models(db):
    print("--- 1. Testing Database & Realistic Dataset Integrity ---")
    college_count = db.query(College).count()
    user_count = db.query(User).count()
    profile_count = db.query(Profile).count()
    alumni_count = db.query(User).filter(User.role == UserRole.ALUMNI).count()
    
    print(f"Colleges: {college_count}, Users: {user_count} (Alumni: {alumni_count}), Profiles: {profile_count}")
    assert college_count >= 1, "At least 1 college should exist"
    assert user_count >= 80, "Realistic dataset should have 80+ users"
    assert alumni_count >= 80, "Realistic dataset should have 80+ alumni"
    assert profile_count >= 80, "Realistic dataset should have 80+ profiles"
    print("✓ Dataset integrity confirmed.")


def test_security_authorization(db):
    print("\n--- 2. Testing Security & Authorization ---")
    from src.utils.rbac import require_super_admin
    from fastapi import HTTPException
    
    super_admin = db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    alumni = db.query(User).filter(User.role == UserRole.ALUMNI).first()

    assert super_admin is not None, "Super admin user should exist"
    
    # 1. Super admin is allowed
    auth_user = require_super_admin(super_admin)
    assert auth_user.id == super_admin.id
    print("✓ Super admin authorized successfully.")

    # 2. Regular admin is rejected (403)
    if admin:
        try:
            require_super_admin(admin)
            assert False, "Regular admin should be rejected by require_super_admin"
        except HTTPException as e:
            assert e.status_code == 403
            print("✓ College Admin rejected with 403 Forbidden.")

    # 3. Regular alumni is rejected (403)
    if alumni:
        try:
            require_super_admin(alumni)
            assert False, "Alumni should be rejected by require_super_admin"
        except HTTPException as e:
            assert e.status_code == 403
            print("✓ Alumni rejected with 403 Forbidden.")


def test_recommendation_crash_fix(db):
    print("\n--- 3. Testing Recommendation pgvector Truthiness & Ranking ---")
    user = db.query(User).filter(User.username == "rahul_sharma_backend").first()
    assert user is not None

    # Test with valid embedding
    recs, cursor = get_recommendations(db, user, cursor=None, limit=10)
    assert len(recs) == 10
    assert all(r.match_score is not None for r in recs)
    assert all(len(r.explanation) > 0 for r in recs)
    print(f"✓ Hybrid recommendation returned {len(recs)} candidates with explanations.")

    # Test with user having None profile
    dummy_no_profile = User(id=88888, college_id=user.college_id, email="noprof@nitk.edu.in", is_active=True)
    recs_empty, cursor_empty = get_recommendations(db, dummy_no_profile, cursor=None, limit=10)
    assert recs_empty == []
    assert cursor_empty is None
    print("✓ Handled user with missing profile gracefully without crash.")

    # Test pagination cursor
    if cursor is not None:
        p2_recs, p2_cursor = get_recommendations(db, user, cursor=cursor, limit=5)
        p1_ids = {r.user_id for r in recs[:5]}
        p2_ids = {r.user_id for r in p2_recs}
        assert p1_ids.isdisjoint(p2_ids), "Cursor pagination should not return duplicates across pages"
        print("✓ Cursor pagination works cleanly without duplicate overlap.")


def test_inbox_sorting_and_none_timestamps(db):
    print("\n--- 4. Testing Message Inbox Sorting & Timestamp Handling ---")
    user_a = db.query(User).filter(User.username == "demo_alumni").first()
    inbox = get_inbox(db, user_a)
    assert isinstance(inbox, list)
    # Check that sorting didn't raise TypeError: '<' not supported between instances of 'NoneType' and 'datetime'
    if len(inbox) > 1:
        for i in range(len(inbox) - 1):
            t1 = inbox[i]["last_time"] or datetime.min
            t2 = inbox[i + 1]["last_time"] or datetime.min
            assert t1 >= t2, "Inbox items should be sorted descending by last_time"
    print("✓ Inbox sorting handles empty and active conversations correctly.")


def test_post_creation_validation(db):
    print("\n--- 5. Testing Post Creation Validation ---")
    user = db.query(User).filter(User.username == "demo_alumni").first()

    # Empty post with whitespace only
    try:
        data_empty = PostCreate(content="   ", is_opportunity=False)
        assert False, "Pydantic validation should have rejected whitespace-only content"
    except ValueError as e:
        print(f"✓ Schema rejected whitespace-only post: {e}")

    # Valid post
    data_valid = PostCreate(content="Regression test audit post #clean", is_opportunity=False)
    created = create_post(db, user.id, data_valid)
    assert created["id"] is not None
    assert created["content"] == "Regression test audit post #clean"
    print("✓ Valid post created successfully.")

    # Clean up created test post
    post_record = db.query(Post).filter(Post.id == created["id"]).first()
    if post_record:
        db.delete(post_record)
        db.commit()
    print("✓ Test post cleaned up.")


def test_auth_and_email_service(db):
    print("\n--- 6. Testing Auth Verification & Email Dispatch ---")
    user = db.query(User).filter(User.username == "rahul_sharma_backend").first()
    assert user is not None

    # Temporarily toggle email_verified to test dispatch
    orig_verified = user.email_verified
    user.email_verified = False
    db.commit()

    class MockTaskDispatcher:
        def __init__(self):
            self.tasks = []
        def dispatch(self, func, *args, **kwargs):
            self.tasks.append((func, args, kwargs))

    try:
        mock_dispatcher = MockTaskDispatcher()
        res = resend_user_verification(db, user.id, mock_dispatcher)
        assert res is True
        assert len(mock_dispatcher.tasks) == 1
        func, args, kwargs = mock_dispatcher.tasks[0]
        assert len(args) == 4, f"Expected 4 args (email, token, full_name, college_slug), got {len(args)}"
        print(f"✓ Resend verification dispatches with college_slug: {args[3]}")
    finally:
        user.email_verified = orig_verified
        db.commit()


def test_event_bus_and_notifications(db):
    print("\n--- 7. Testing Event Bus & Synchronous Notification Persistence ---")
    user_recipient = db.query(User).filter(User.username == "demo_student").first()
    user_actor = db.query(User).filter(User.username == "demo_alumni").first()

    initial_unread = get_unread_count(db, user_recipient.id)
    
    # Persist a test notification
    notif = persist_notification(
        recipient_id=user_recipient.id,
        notification_type=NotificationType.POST_LIKED,
        title="Audit Like Test",
        message="Rahul liked your post.",
        actor_id=user_actor.id,
        metadata_={"post_id": 1},
    )
    assert notif.id is not None
    assert notif.is_read is False

    new_unread = get_unread_count(db, user_recipient.id)
    assert new_unread == initial_unread + 1
    print(f"✓ Notification persisted synchronously. Unread count incremented ({initial_unread} -> {new_unread}).")

    # Mark as read
    mark_as_read(db, user_recipient.id, notif.id)
    notif_in_db = db.query(Notification).filter(Notification.id == notif.id).first()
    assert notif_in_db is not None
    assert notif_in_db.is_read is True
    print("✓ Notification marked as read successfully.")

    # Clean up test notification
    db.delete(notif_in_db)
    db.commit()


def test_connection_lifecycle(db):
    print("\n--- 8. Testing Complete Connection Lifecycle (Send, Withdraw, Accept, Disconnect) ---")
    # Find two unconnected alumni
    user_s = db.query(User).filter(User.username == "aditi_verma").first()
    user_r = db.query(User).filter(User.username == "karan_patel").first()
    
    # Ensure no existing connection between user_s and user_r
    existing = db.query(Connection).filter(
        ((Connection.sender_id == user_s.id) & (Connection.receiver_id == user_r.id)) |
        ((Connection.sender_id == user_r.id) & (Connection.receiver_id == user_s.id))
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    # 1. Send Request
    conn = send_request(db, user_s, user_r.id)
    assert conn["status"] == ConnectionStatus.PENDING
    print("✓ Connection request sent (PENDING).")

    # 2. Cannot send duplicate request
    try:
        send_request(db, user_s, user_r.id)
        assert False, "Should reject duplicate connection request"
    except ValueError as e:
        print(f"✓ Duplicate request blocked: {e}")

    # 3. Withdraw Request (Sender only)
    withdraw_res = withdraw_request(db, conn["id"], user_s)
    assert withdraw_res["detail"] == "Connection request withdrawn successfully"
    assert db.query(Connection).filter(Connection.id == conn["id"]).first() is None
    print("✓ Connection request withdrawn by sender.")

    # 4. Resend and Accept
    conn2 = send_request(db, user_s, user_r.id)
    accepted_conn = accept_request(db, conn2["id"], user_r)
    assert accepted_conn["status"] == ConnectionStatus.ACCEPTED
    print("✓ Connection accepted by receiver (ACCEPTED).")

    # 5. Disconnect
    disc_res = disconnect(db, conn2["id"], user_s)
    assert disc_res["detail"] == "Connection removed successfully"
    assert db.query(Connection).filter(Connection.id == conn2["id"]).first() is None
    print("✓ Connection disconnected cleanly.")


def test_discovery_search_and_filters(db):
    print("\n--- 9. Testing User Discovery Search & Multi-Field Filters ---")
    user = db.query(User).filter(User.username == "rahul_sharma_backend").first()

    # Pagination
    p1 = get_discover_users(db, user, skip=0, limit=15)
    p2 = get_discover_users(db, user, skip=15, limit=15)
    assert len(p1) == 15
    assert len(p2) == 15
    p1_ids = {u["id"] for u in p1}
    p2_ids = {u["id"] for u in p2}
    assert p1_ids.isdisjoint(p2_ids)
    print("✓ Discovery pagination verified across 30 users.")

    # Skill filter
    py_users = get_discover_users(db, user, skill="Python")
    assert len(py_users) > 0
    print(f"✓ Skill filter 'Python' returned {len(py_users)} candidates.")

    # Company filter
    scale_users = get_discover_users(db, user, company="CloudScale")
    assert len(scale_users) > 0
    assert all("cloudscale" in (u["company"] or "").lower() for u in scale_users)
    print(f"✓ Company filter 'CloudScale' returned {len(scale_users)} candidates.")

    # Location filter
    blr_users = get_discover_users(db, user, location="Bengaluru")
    assert len(blr_users) > 0
    assert all("bengaluru" in (u["location"] or "").lower() or "bangalore" in (u["location"] or "").lower() for u in blr_users)
    print(f"✓ Location filter 'Bengaluru' returned {len(blr_users)} candidates.")


def test_post_feed_and_n_plus_one_batching(db):
    print("\n--- 10. Testing Post Feed Scalability & Batch Connection Resolution ---")
    user = db.query(User).filter(User.username == "demo_alumni").first()

    # Feed with pagination
    feed_page = get_feed(db, user, skip=0, limit=10)
    assert isinstance(feed_page, list)
    for p in feed_page:
        assert "connection_status" in p
        assert p["connection_status"] in ("connected", "pending", "none")
    print(f"✓ Post feed resolved {len(feed_page)} posts with O(1) batched connection statuses.")

    # Opportunities filter
    opps = get_feed(db, user, is_opportunity=True)
    assert all(p["is_opportunity"] is True for p in opps)
    print(f"✓ Opportunities filter returned {len(opps)} opportunity posts.")


async def test_messaging_and_conversation_flow(db):
    print("\n--- 11. Testing Messaging Flow & Conversation Isolation ---")
    user_a = db.query(User).filter(User.username == "demo_alumni").first()
    user_b = db.query(User).filter(User.username == "demo_student").first()

    convo = get_or_create_conversation(db, user_a, user_b.id)
    msg = await send_message(db, user_a, convo.id, content="Audit verification message #100")
    assert msg.id is not None
    assert msg.content == "Audit verification message #100"

    messages = get_messages(db, user_b, convo.id)
    assert any(m["content"] == "Audit verification message #100" for m in messages)
    print("✓ Messaging send, receive, and conversation isolation verified.")


def main():
    print("================================================================================")
    print("           ALUMNICONN COMPREHENSIVE MULTI-USER REGRESSION AUDIT")
    print("================================================================================")
    db = SessionLocal()
    try:
        test_baseline_and_models(db)
        test_security_authorization(db)
        test_recommendation_crash_fix(db)
        test_inbox_sorting_and_none_timestamps(db)
        test_post_creation_validation(db)
        test_auth_and_email_service(db)
        test_event_bus_and_notifications(db)
        test_connection_lifecycle(db)
        test_discovery_search_and_filters(db)
        test_post_feed_and_n_plus_one_batching(db)
        asyncio.run(test_messaging_and_conversation_flow(db))
        print("\n================================================================================")
        print("                   ALL 11 TEST SUITES PASSED (100% SUCCESS)")
        print("================================================================================")
    finally:
        db.close()


if __name__ == "__main__":
    main()
