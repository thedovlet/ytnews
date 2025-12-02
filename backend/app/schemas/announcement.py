from pydantic import BaseModel, Field
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from ..models.announcement import AnnouncementStatus
from .user import User
from .category import Category

if TYPE_CHECKING:
    from .organization import Organization
    from .employee import Employee


class AnnouncementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    content: str  # JSON string from editor
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    status: AnnouncementStatus = AnnouncementStatus.DRAFT


class AnnouncementCreate(AnnouncementBase):
    category_ids: List[int] = []
    organization_id: Optional[int] = None  # Post on behalf of organization
    employee_id: Optional[int] = None  # Which employee is posting


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    status: Optional[AnnouncementStatus] = None
    category_ids: Optional[List[int]] = None
    organization_id: Optional[int] = None
    employee_id: Optional[int] = None


class AnnouncementInDB(AnnouncementBase):
    id: int
    author_id: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Announcement(AnnouncementInDB):
    author: User
    categories: List[Category] = []
    organization: Optional["Organization"] = None
    employee: Optional["Employee"] = None


class AnnouncementList(BaseModel):
    """Simplified announcement for list views"""
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    status: AnnouncementStatus
    author: User
    categories: List[Category] = []
    organization_id: Optional[int] = None
    employee_id: Optional[int] = None
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Import after class definitions to avoid circular imports
from .organization import Organization
from .employee import Employee

# Rebuild model to resolve forward references
Announcement.model_rebuild()
