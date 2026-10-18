from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserRegister, UserLogin, UserOut, AuthResponse
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    # Check if username or email is already taken
    existing_user = db.query(User).filter(
        (User.username == req.username.strip().lower()) | 
        (User.email == req.email.strip().lower())
    ).first()
    
    if existing_user:
        if existing_user.username == req.username.strip().lower():
            raise HTTPException(status_code=400, detail="Username is already taken.")
        else:
            raise HTTPException(status_code=400, detail="Email is already registered.")

    hashed_pw = hash_password(req.password)
    new_user = User(
        username=req.username.strip().lower(),
        email=req.email.strip().lower(),
        hashed_password=hashed_pw,
        role=req.role or "General Internet User",
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        user_id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        role=new_user.role
    )

    user_out = UserOut(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        role=new_user.role,
        created_at=new_user.created_at.isoformat()
    )

    return AuthResponse(access_token=token, user=user_out)

@router.post("/login", response_model=AuthResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    login_id = req.login.strip().lower()
    user = db.query(User).filter(
        (User.username == login_id) | (User.email == login_id)
    ).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        user_id=user.id,
        username=user.username,
        email=user.email,
        role=user.role
    )

    user_out = UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        created_at=user.created_at.isoformat() if user.created_at else ""
    )

    return AuthResponse(access_token=token, user=user_out)

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        created_at=current_user.created_at.isoformat() if current_user.created_at else ""
    )
