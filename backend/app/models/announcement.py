from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base


class AnnouncementStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# Association table for many-to-many relationship between announcements and categories
announcement_categories = Table(
    'announcement_categories',
    Base.metadata,
    Column('announcement_id', Integer, ForeignKey('announcements.id', ondelete='CASCADE'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id', ondelete='CASCADE'), primary_key=True)
)


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)  # JSON content from editor
    excerpt = Column(Text, nullable=True)  # Short description for previews
    cover_image = Column(String, nullable=True)  # Path to cover image
    status = Column(Enum(AnnouncementStatus), default=AnnouncementStatus.DRAFT, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)  # Optional: post on behalf of organization
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)  # Which employee posted for org
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="announcements")
    organization = relationship("Organization", back_populates="announcements")
    employee = relationship("Employee", foreign_keys=[employee_id])
    categories = relationship("Category", secondary=announcement_categories, back_populates="announcements")
