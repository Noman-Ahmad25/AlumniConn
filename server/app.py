from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from src.database.base import Base
from src.database.session import engine, SessionLocal
from src.database.seed import seed_super_admin 
from src.models.user import User

from src.models.profile import Profile
from src.models.connection import Connection
from src.models.message import Message
from src.models.college import College
from src.models.college_request import CollegeRequest
from src.models.college_branding import CollegeBranding
from src.models.post import Post
from src.models.like import Like
from src.models.comment import Comment

from src.routes.auth import router as auth_router
from src.routes.profile import router as profile_router
from src.routes.connection import router as connection_router   
from src.routes.message import router as message_router
from src.routes.college import router as college_router
from src.routes.college_request import router as college_request_router
from src.routes.notification import router as notification_router
from src.routes.alumni import router as alumni_router
from src.routes.post import router as post_router
from src.routes.like import router as like_router
from src.routes.comment import router as comment_router
from src.routes.user import router as user_router
from src.routes.recommendation import router as recommendation_router
from src.utils.event_bus import event_bus
from src.services.notification_service import handle_notification_event
import logging


logging.getLogger().setLevel(logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Subscribe the notification handler to all relevant events
    events = [
        "connection_received", "connection_accepted", "connection_rejected",
        "message_received", "post_liked", "post_commented",
        "alumni_request_approved", "alumni_request_rejected",
        "college_request_approved", "college_request_rejected",
        "recommendations_available"
    ]
    for ev in events:
        event_bus.subscribe(ev, handle_notification_event)
        
    print("Application started")
    # This block runs on startup
    db = SessionLocal()
    try:
        seed_super_admin(db)
    finally:
        db.close()
    yield
    print("Application shutdown")

# 3. Update the FastAPI initialization
app = FastAPI(title="AlumniConn API", lifespan=lifespan)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", ""), # Add this for Vercel
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


app.include_router(college_router, prefix="/colleges", tags=["Colleges"])
app.include_router(college_request_router, prefix="/college-requests", tags=["College Requests"])
app.include_router(alumni_router, tags=["Alumni"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])
app.include_router(connection_router, prefix="/connections", tags=["Connections"])
app.include_router(message_router, prefix="/messages", tags=["Messages"])
app.include_router(post_router, prefix="/posts", tags=["Posts"])
app.include_router(like_router, prefix="/likes", tags=["Likes"])
app.include_router(comment_router, prefix="/comments", tags=["Comments"])
app.include_router(recommendation_router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(notification_router, prefix="/notifications", tags=["Notifications"])


@app.get("/")
def root():
    return {"message": "AlumniConn API running"}
