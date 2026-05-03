from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.session import get_db
from src.schemas.connection import ConnectionCreate, ConnectionResponse
from src.services import connection_service
from src.models.user import User
from src.utils.dependency import get_current_user

router = APIRouter()

@router.post("/", response_model=ConnectionResponse)
def send_connection_request(
    request: ConnectionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # <-- The Bouncer!
):
    try:
        return connection_service.send_request(
            db=db, 
            current_user=current_user, 
            receiver_id=request.receiver_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ConnectionResponse])
def get_my_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Notice we don't pass ANY user input here. It's purely token-driven.
    return connection_service.get_connections(db=db, current_user=current_user)

@router.get("/requests", response_model=List[ConnectionResponse])
def get_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return connection_service.get_pending_requests(db = db, current_user=current_user)

@router.post("/accept/{connection_id}", response_model=ConnectionResponse)
def accept_connection_request(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return connection_service.accept_request(
            db=db,
            connection_id=connection_id,
            current_user=current_user
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/reject/{connection_id}", response_model=ConnectionResponse)
def reject_connection_request(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return connection_service.reject_request(
            db=db,
            connection_id=connection_id,
            current_user=current_user
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))