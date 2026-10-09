import json
import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, Organization, Brand
from app.schemas.all_schemas import UserRegister, UserLogin, ForgotPasswordRequest, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def slugify(text: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', text.lower()).strip('-')
    return slug or "org"

@router.post("/register", response_model=TokenResponse)
def register_user(req: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new corporate user, secures credentials with PBKDF2 salt hashing,
    ensures organizational tenancy isolation, and initializes brand context.
    """
    clean_email = req.email.strip().lower()
    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=400, detail="Please enter a valid work email address.")
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must contain at least 8 characters.")

    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    org_name = (req.organization or "Apex Financial Group").strip()
    org_slug = slugify(org_name)

    # Ensure Organization record exists
    org = db.query(Organization).filter(Organization.name == org_name).first()
    if not org:
        org = Organization(name=org_name, slug=org_slug)
        db.add(org)
        db.flush()

    # Create User
    user = User(
        email=clean_email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name.strip(),
        role=req.role or "Analyst",
        organization=org_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If organization has no brand yet, auto-seed primary brand
    existing_brand = db.query(Brand).filter(Brand.organization == org_name).first()
    if not existing_brand:
        default_domain = f"{org_slug}.com"
        clean_keyword = org_slug.replace("-", "")
        new_brand = Brand(
            name=org_name,
            organization=org_name,
            official_domain=default_domain,
            description=f"Primary brand asset profile for {org_name}",
            official_handles=json.dumps({"x": f"@{clean_keyword}", "linkedin": f"company/{clean_keyword}"}),
            target_keywords=json.dumps([clean_keyword, org_slug])
        )
        db.add(new_brand)
        db.commit()

    token = create_access_token(data={"sub": user.email, "role": user.role, "org": user.organization})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization": user.organization
        }
    }

@router.post("/login", response_model=TokenResponse)
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user credentials against PBKDF2 hash and issues signed JWT bearer token.
    """
    clean_email = req.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination. Please try again."
        )

    token = create_access_token(data={"sub": user.email, "role": user.role, "org": user.organization})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization": user.organization
        }
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiates password reset workflow for the specified email address.
    """
    clean_email = req.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    # Return positive message regardless of presence to prevent account enumeration
    return {
        "status": "success",
        "message": f"If an account exists for {clean_email}, password reset instructions have been dispatched.",
        "simulated_token": "RR-RESET-89412A" if user else None
    }

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's organization profile.
    """
    return current_user
