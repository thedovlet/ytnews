from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from .user import UserOut


class EventRegistrationBase(BaseModel):
    guest_name: Optional[str] = None
    guest_email: Optional[EmailStr] = None
    guest_phone: Optional[str] = None
    notes: Optional[str] = None


class EventRegistrationCreate(EventRegistrationBase):
    event_id: int


class EventRegistrationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class EventRegistrationOut(EventRegistrationBase):
    id: int
    event_id: int
    user_id: Optional[int] = None
    status: str
    registered_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True
