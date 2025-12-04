from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .user import UserOut
from .organization import OrganizationOut


class EventBase(BaseModel):
    title: str
    slug: str
    description: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    location: Optional[str] = None
    event_date: datetime
    registration_deadline: Optional[datetime] = None
    max_participants: Optional[int] = None


class EventCreate(EventBase):
    organization_id: Optional[int] = None
    status: str = "draft"


class EventUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    max_participants: Optional[int] = None
    status: Optional[str] = None
    organization_id: Optional[int] = None


class EventOut(EventBase):
    id: int
    status: str
    author_id: int
    organization_id: Optional[int] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    author: UserOut
    organization: Optional[OrganizationOut] = None
    registrations_count: int = 0

    class Config:
        from_attributes = True


class EventList(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    location: Optional[str] = None
    event_date: datetime
    status: str
    author: UserOut
    organization: Optional[OrganizationOut] = None
    registrations_count: int = 0

    class Config:
        from_attributes = True
