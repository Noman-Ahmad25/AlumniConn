from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.database.base import Base
from src.database.session import engine

from src.models.user import User
from src.models.profile import Profile
from src.models.connection import Connection
from src.models.message import Message
from src.models.college import College
from src.models.college_request import CollegeRequest
from src.models.alumni_request import AlumniRequest
from src.models.post import Post
from src.models.like import Like
from src.models.comment import Comment

from src.routes.auth import router as auth_router
from src.routes.profile import router as profile_router
from src.routes.connection import router as connection_router   
from src.routes.message import router as message_router
from src.routes.college import router as college_router
from src.routes.college_request import router as college_request_router
from src.routes.alumni_request import router as alumni_request_router
from src.routes.post import router as post_router
from src.routes.like import router as like_router
from src.routes.comment import router as comment_router
from src.routes.user import router as user_router


app = FastAPI(title="AlumniConn API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.mount("/static", StaticFiles(directory="static"), name="static")

Base.metadata.create_all(bind=engine)
app.include_router(college_router, prefix="/colleges", tags=["Colleges"])
app.include_router(college_request_router, prefix="/college-requests", tags=["College Requests"])
app.include_router(alumni_request_router, prefix="/alumni-requests", tags=["Alumni Requests"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])
app.include_router(connection_router, prefix="/connections", tags=["Connections"])
app.include_router(message_router, prefix="/messages", tags=["Messages"])
app.include_router(post_router, prefix="/posts", tags=["Posts"])
app.include_router(like_router, prefix="/likes", tags=["Likes"])
app.include_router(comment_router, prefix="/comments", tags=["Comments"])


@app.get("/")
def root():
    return {"message": "AlumniConn API running"}
