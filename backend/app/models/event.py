from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base


class EventStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)  # Short description
    cover_image = Column(String, nullable=True)
    location = Column(String, nullable=True)  # Physical or online location
    event_date = Column(DateTime(timezone=True), nullable=False)  # When the event happens
    registration_deadline = Column(DateTime(timezone=True), nullable=True)  # Last date to register
    max_participants = Column(Integer, nullable=True)  # Null = unlimited
    status = Column(Enum(EventStatus), default=EventStatus.DRAFT, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="events")
    organization = relationship("Organization", back_populates="events")
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")
