from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.seed_data import seed_database_demo_data
from app.models.all_models import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/seed", tags=["Demonstration & Sample Data"])

@router.post("/demo-data")
def reseed_demo_data(db: Session = Depends(get_db)):
    """
    Populates or resets sample demonstration data.
    Clearly marks all sample threats with is_sample=True.
    """
    res = seed_database_demo_data(db)
    return res
