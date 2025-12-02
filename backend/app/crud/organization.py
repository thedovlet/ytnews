from typing import Optional, List
from sqlalchemy.orm import Session
from ..models.organization import Organization
from ..schemas.organization import OrganizationCreate, OrganizationUpdate


def get_organization(db: Session, organization_id: int) -> Optional[Organization]:
    """Get organization by ID"""
    return db.query(Organization).filter(Organization.id == organization_id).first()


def get_organization_by_slug(db: Session, slug: str) -> Optional[Organization]:
    """Get organization by slug"""
    return db.query(Organization).filter(Organization.slug == slug).first()


def get_organizations(db: Session, skip: int = 0, limit: int = 100) -> List[Organization]:
    """Get list of organizations"""
    return db.query(Organization).filter(Organization.is_active == True).offset(skip).limit(limit).all()


def create_organization(db: Session, organization: OrganizationCreate) -> Organization:
    """Create new organization"""
    db_organization = Organization(**organization.model_dump())
    db.add(db_organization)
    db.commit()
    db.refresh(db_organization)
    return db_organization


def update_organization(db: Session, organization_id: int, organization: OrganizationUpdate) -> Optional[Organization]:
    """Update organization"""
    db_organization = get_organization(db, organization_id)
    if not db_organization:
        return None

    update_data = organization.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_organization, field, value)

    db.commit()
    db.refresh(db_organization)
    return db_organization


def delete_organization(db: Session, organization_id: int) -> bool:
    """Delete organization"""
    db_organization = get_organization(db, organization_id)
    if not db_organization:
        return False

    db.delete(db_organization)
    db.commit()
    return True
