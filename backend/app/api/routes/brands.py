import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Brand, User
from app.schemas.all_schemas import BrandCreate, BrandUpdate, BrandResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/brands", tags=["Brand Management"])

@router.get("/", response_model=list[BrandResponse])
def list_brands(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Lists monitored brands strictly isolated to the user's registered organization.
    """
    brands = db.query(Brand).filter(Brand.organization == current_user.organization).all()
    results = []
    for b in brands:
        results.append({
            "id": b.id,
            "name": b.name,
            "organization": b.organization,
            "official_domain": b.official_domain,
            "description": b.description,
            "logo_url": b.logo_url,
            "official_handles": json.loads(b.official_handles) if b.official_handles else {},
            "target_keywords": json.loads(b.target_keywords) if b.target_keywords else [],
            "threat_count": len(b.threats),
            "created_at": b.created_at
        })
    return results

@router.post("/", response_model=BrandResponse)
def create_brand(req: BrandCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Registers a new corporate brand with official domain, description, and social handles.
    """
    clean_domain = req.official_domain.lower().replace("https://", "").replace("http://", "").split("/")[0].strip()
    if not clean_domain:
        raise HTTPException(status_code=400, detail="A valid official brand domain is required.")

    brand = Brand(
        name=req.name.strip(),
        organization=current_user.organization,
        official_domain=clean_domain,
        description=req.description,
        logo_url=req.logo_url,
        official_handles=json.dumps(req.official_handles or {}),
        target_keywords=json.dumps(req.target_keywords or [req.name.lower().strip()])
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)

    return {
        "id": brand.id,
        "name": brand.name,
        "organization": brand.organization,
        "official_domain": brand.official_domain,
        "description": brand.description,
        "logo_url": brand.logo_url,
        "official_handles": json.loads(brand.official_handles),
        "target_keywords": json.loads(brand.target_keywords),
        "threat_count": 0,
        "created_at": brand.created_at
    }

@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: int,
    req: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates brand information, official domains, description, or social handles.
    """
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.organization == current_user.organization
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found or does not belong to your organization.")

    if req.name is not None:
        brand.name = req.name.strip()
    if req.official_domain is not None:
        brand.official_domain = req.official_domain.lower().replace("https://", "").replace("http://", "").split("/")[0].strip()
    if req.description is not None:
        brand.description = req.description
    if req.logo_url is not None:
        brand.logo_url = req.logo_url
    if req.official_handles is not None:
        brand.official_handles = json.dumps(req.official_handles)
    if req.target_keywords is not None:
        brand.target_keywords = json.dumps(req.target_keywords)

    db.commit()
    db.refresh(brand)

    return {
        "id": brand.id,
        "name": brand.name,
        "organization": brand.organization,
        "official_domain": brand.official_domain,
        "description": brand.description,
        "logo_url": brand.logo_url,
        "official_handles": json.loads(brand.official_handles) if brand.official_handles else {},
        "target_keywords": json.loads(brand.target_keywords) if brand.target_keywords else [],
        "threat_count": len(brand.threats),
        "created_at": brand.created_at
    }

@router.delete("/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Deletes a registered brand and associated records for the user's organization.
    """
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.organization == current_user.organization
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found or access denied.")
    
    brand_name = brand.name
    db.delete(brand)
    db.commit()
    return {"status": "success", "message": f"Brand '{brand_name}' removed from active monitoring."}
