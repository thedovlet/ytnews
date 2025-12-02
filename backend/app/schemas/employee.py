from pydantic import BaseModel, Field
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from .user import User

if TYPE_CHECKING:
    from .organization import Organization


class EmployeeBase(BaseModel):
    user_id: int
    organization_id: int
    position: str = Field(..., min_length=1, max_length=100)
    is_active: bool = True
    can_post: bool = True


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    position: Optional[str] = Field(None, min_length=1, max_length=100)
    is_active: Optional[bool] = None
    can_post: Optional[bool] = None


class EmployeeInDB(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Employee(EmployeeInDB):
    user: User
    organization: Optional["Organization"] = None


# Import after class definitions to avoid circular imports
from .organization import Organization

# Rebuild model to resolve forward references
Employee.model_rebuild()
