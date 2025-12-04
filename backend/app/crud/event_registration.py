from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..models.event_registration import EventRegistration, RegistrationStatus
from ..schemas.event_registration import EventRegistrationCreate, EventRegistrationUpdate


def get_registration(db: Session, registration_id: int) -> Optional[EventRegistration]:
    """Get registration by ID"""
    return db.query(EventRegistration).options(
        joinedload(EventRegistration.event),
        joinedload(EventRegistration.user)
    ).filter(EventRegistration.id == registration_id).first()


def get_registrations_by_event(
    db: Session,
    event_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[EventRegistration]:
    """Get all registrations for an event"""
    return db.query(EventRegistration).options(
        joinedload(EventRegistration.user)
    ).filter(
        EventRegistration.event_id == event_id
    ).order_by(EventRegistration.registered_at.desc()).offset(skip).limit(limit).all()


def get_registrations_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[EventRegistration]:
    """Get all registrations for a user"""
    return db.query(EventRegistration).options(
        joinedload(EventRegistration.event)
    ).filter(
        EventRegistration.user_id == user_id
    ).order_by(EventRegistration.registered_at.desc()).offset(skip).limit(limit).all()


def check_existing_registration(
    db: Session,
    event_id: int,
    user_id: Optional[int] = None,
    guest_email: Optional[str] = None
) -> Optional[EventRegistration]:
    """Check if user or guest already registered for event"""
    if user_id:
        return db.query(EventRegistration).filter(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user_id
        ).first()
    elif guest_email:
        return db.query(EventRegistration).filter(
            EventRegistration.event_id == event_id,
            EventRegistration.guest_email == guest_email
        ).first()
    return None


def create_registration(
    db: Session,
    registration: EventRegistrationCreate,
    user_id: Optional[int] = None
) -> EventRegistration:
    """Create new event registration"""
    db_registration = EventRegistration(
        **registration.model_dump(),
        user_id=user_id
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    return db_registration


def update_registration(
    db: Session,
    registration_id: int,
    registration_update: EventRegistrationUpdate
) -> Optional[EventRegistration]:
    """Update registration"""
    db_registration = get_registration(db, registration_id)
    if not db_registration:
        return None

    update_data = registration_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_registration, field, value)

    db.commit()
    db.refresh(db_registration)
    return db_registration


def delete_registration(db: Session, registration_id: int) -> bool:
    """Delete registration"""
    db_registration = get_registration(db, registration_id)
    if not db_registration:
        return False

    db.delete(db_registration)
    db.commit()
    return True
