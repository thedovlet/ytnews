from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base


class RegistrationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null if guest registration

    # Guest information (if user_id is null)
    guest_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    guest_phone = Column(String, nullable=True)

    notes = Column(Text, nullable=True)  # Additional notes from participant
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.CONFIRMED, nullable=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="event_registrations")
