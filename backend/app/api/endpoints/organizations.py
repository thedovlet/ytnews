from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...api.deps import get_current_user, get_current_moderator
from ...schemas.organization import Organization as OrganizationSchema, OrganizationCreate, OrganizationUpdate
from ...crud import organization as crud_organization
from ...crud import employee as crud_employee
from ...models.user import User

router = APIRouter()


@router.get("/", response_model=List[OrganizationSchema])
def read_organizations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Get all organizations (public)"""
    organizations = crud_organization.get_organizations(db, skip=skip, limit=limit)
    return organizations


@router.get("/{organization_id}", response_model=OrganizationSchema)
def read_organization(
    organization_id: int,
    db: Session = Depends(get_db),
):
    """Get organization by ID (public)"""
    organization = crud_organization.get_organization(db, organization_id=organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization


@router.get("/slug/{slug}", response_model=OrganizationSchema)
def read_organization_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Get organization by slug (public)"""
    organization = crud_organization.get_organization_by_slug(db, slug=slug)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization


@router.post("/", response_model=OrganizationSchema, status_code=status.HTTP_201_CREATED)
def create_organization(
    organization_in: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create new organization (authenticated users)"""
    # Check if slug already exists
    existing = crud_organization.get_organization_by_slug(db, slug=organization_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization with this slug already exists"
        )

    organization = crud_organization.create_organization(db=db, organization=organization_in)

    # Automatically add creator as admin/owner of the organization
    from ...models.employee import Employee
    employee = Employee(
        user_id=current_user.id,
        organization_id=organization.id,
        position="Founder & CEO",
        is_active=True,
        can_post=True
    )
    db.add(employee)
    db.commit()

    return organization


@router.put("/{organization_id}", response_model=OrganizationSchema)
def update_organization(
    organization_id: int,
    organization_in: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update organization (authenticated users)"""
    # Check if new slug conflicts with existing
    if organization_in.slug:
        existing = crud_organization.get_organization_by_slug(db, slug=organization_in.slug)
        if existing and existing.id != organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization with this slug already exists"
            )

    organization = crud_organization.update_organization(db, organization_id=organization_id, organization=organization_in)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization


@router.delete("/{organization_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(
    organization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_moderator),
):
    """Delete organization (moderator/admin only)"""
    success = crud_organization.delete_organization(db, organization_id=organization_id)
    if not success:
        raise HTTPException(status_code=404, detail="Organization not found")
