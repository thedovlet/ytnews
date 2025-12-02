from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...api.deps import get_current_user
from ...schemas.employee import Employee as EmployeeSchema, EmployeeCreate, EmployeeUpdate
from ...crud import employee as crud_employee
from ...models.user import User

router = APIRouter()


@router.get("/my-organizations", response_model=List[EmployeeSchema])
def read_my_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all organizations current user belongs to"""
    employments = crud_employee.get_user_organizations(db, user_id=current_user.id)
    return employments


@router.get("/organization/{organization_id}", response_model=List[EmployeeSchema])
def read_organization_employees(
    organization_id: int,
    db: Session = Depends(get_db),
):
    """Get all employees of an organization (public)"""
    employees = crud_employee.get_employees_by_organization(db, organization_id=organization_id)
    return employees


@router.post("/", response_model=EmployeeSchema, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee_in: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add employee to organization"""
    # Check if already exists
    existing = crud_employee.get_employee_by_user_and_org(
        db, user_id=employee_in.user_id, organization_id=employee_in.organization_id
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already employed by this organization"
        )

    employee = crud_employee.create_employee(db=db, employee=employee_in)
    return employee


@router.put("/{employee_id}", response_model=EmployeeSchema)
def update_employee(
    employee_id: int,
    employee_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update employee"""
    employee = crud_employee.update_employee(db, employee_id=employee_id, employee=employee_in)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove employee from organization"""
    success = crud_employee.delete_employee(db, employee_id=employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
