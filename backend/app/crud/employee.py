from typing import Optional, List
from sqlalchemy.orm import Session
from ..models.employee import Employee
from ..models.user import User
from ..schemas.employee import EmployeeCreate, EmployeeUpdate


def get_employee(db: Session, employee_id: int) -> Optional[Employee]:
    """Get employee by ID"""
    return db.query(Employee).filter(Employee.id == employee_id).first()


def get_employee_by_user_and_org(db: Session, user_id: int, organization_id: int) -> Optional[Employee]:
    """Get employee by user and organization"""
    return db.query(Employee).filter(
        Employee.user_id == user_id,
        Employee.organization_id == organization_id
    ).first()


def get_employees_by_organization(db: Session, organization_id: int) -> List[Employee]:
    """Get all employees of an organization"""
    return db.query(Employee).filter(
        Employee.organization_id == organization_id,
        Employee.is_active == True
    ).all()


def get_user_organizations(db: Session, user_id: int) -> List[Employee]:
    """Get all organizations a user belongs to"""
    return db.query(Employee).filter(
        Employee.user_id == user_id,
        Employee.is_active == True
    ).all()


def create_employee(db: Session, employee: EmployeeCreate) -> Employee:
    """Create new employee"""
    db_employee = Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


def update_employee(db: Session, employee_id: int, employee: EmployeeUpdate) -> Optional[Employee]:
    """Update employee"""
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        return None

    update_data = employee.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)

    db.commit()
    db.refresh(db_employee)
    return db_employee


def delete_employee(db: Session, employee_id: int) -> bool:
    """Delete employee"""
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        return False

    db.delete(db_employee)
    db.commit()
    return True
