from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from ..models.join_request import JoinRequestStatus
from .user import User
from .organization import Organization


class JoinRequestBase(BaseModel):
    organization_id: int
    position: str = Field(..., min_length=1, max_length=100)
    message: Optional[str] = None


class JoinRequestCreate(JoinRequestBase):
    pass


class JoinRequestUpdate(BaseModel):
    status: JoinRequestStatus


class JoinRequestInDB(JoinRequestBase):
    id: int
    user_id: int
    status: JoinRequestStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JoinRequest(JoinRequestInDB):
    user: User
    organization: Organization
