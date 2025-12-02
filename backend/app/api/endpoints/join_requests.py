from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...api.deps import get_current_user
from ...schemas.join_request import JoinRequest as JoinRequestSchema, JoinRequestCreate
from ...crud import join_request as crud_join_request
from ...crud import employee as crud_employee
from ...models.user import User

router = APIRouter()


@router.post("/", response_model=JoinRequestSchema, status_code=status.HTTP_201_CREATED)
def create_join_request(
    join_request_in: JoinRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a join request to an organization"""
    # Check if user is already an employee
    existing_employee = crud_employee.get_employee_by_user_and_org(
        db, user_id=current_user.id, organization_id=join_request_in.organization_id
    )
    if existing_employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of this organization"
        )

    # Check if user already has a pending request
    existing_request = crud_join_request.get_user_join_request(
        db, user_id=current_user.id, organization_id=join_request_in.organization_id
    )
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending request to this organization"
        )

    join_request = crud_join_request.create_join_request(
        db=db, user_id=current_user.id, join_request=join_request_in
    )
    return join_request


@router.get("/organization/{organization_id}", response_model=List[JoinRequestSchema])
def read_organization_join_requests(
    organization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all join requests for an organization (for organization admins)"""
    # Check if current user is an employee of the organization
    employee = crud_employee.get_employee_by_user_and_org(
        db, user_id=current_user.id, organization_id=organization_id
    )
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this organization"
        )

    requests = crud_join_request.get_pending_join_requests_by_organization(db, organization_id=organization_id)
    return requests


@router.post("/{join_request_id}/accept", response_model=JoinRequestSchema)
def accept_join_request(
    join_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Accept a join request"""
    # Get the join request
    join_request = crud_join_request.get_join_request(db, join_request_id=join_request_id)
    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    # Check if current user is an employee of the organization
    employee = crud_employee.get_employee_by_user_and_org(
        db, user_id=current_user.id, organization_id=join_request.organization_id
    )
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to manage this organization"
        )

    result = crud_join_request.accept_join_request(db, join_request_id=join_request_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not accept join request"
        )
    return result


@router.post("/{join_request_id}/reject", response_model=JoinRequestSchema)
def reject_join_request(
    join_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reject a join request"""
    # Get the join request
    join_request = crud_join_request.get_join_request(db, join_request_id=join_request_id)
    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    # Check if current user is an employee of the organization
    employee = crud_employee.get_employee_by_user_and_org(
        db, user_id=current_user.id, organization_id=join_request.organization_id
    )
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to manage this organization"
        )

    result = crud_join_request.reject_join_request(db, join_request_id=join_request_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not reject join request"
        )
    return result
