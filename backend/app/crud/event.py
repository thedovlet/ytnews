from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from ..models.event import Event, EventStatus
from ..models.event_registration import EventRegistration
from ..schemas.event import EventCreate, EventUpdate


def get_event(db: Session, event_id: int) -> Optional[Event]:
    """Get event by ID"""
    return db.query(Event).options(
        joinedload(Event.author),
        joinedload(Event.organization),
        joinedload(Event.registrations)
    ).filter(Event.id == event_id).first()


def get_event_by_slug(db: Session, slug: str) -> Optional[Event]:
    """Get event by slug"""
    return db.query(Event).options(
        joinedload(Event.author),
        joinedload(Event.organization),
        joinedload(Event.registrations)
    ).filter(Event.slug == slug).first()


def get_events(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[Event]:
    """Get all events with optional status filter"""
    query = db.query(Event).options(
        joinedload(Event.author),
        joinedload(Event.organization)
    )

    if status:
        query = query.filter(Event.status == status)

    return query.order_by(Event.event_date.desc()).offset(skip).limit(limit).all()


def get_published_events(db: Session, skip: int = 0, limit: int = 100) -> List[Event]:
    """Get published events only"""
    return db.query(Event).options(
        joinedload(Event.author),
        joinedload(Event.organization)
    ).filter(
        Event.status == EventStatus.PUBLISHED
    ).order_by(Event.event_date.desc()).offset(skip).limit(limit).all()


def get_upcoming_events(db: Session, skip: int = 0, limit: int = 100) -> List[Event]:
    """Get upcoming published events"""
    from datetime import datetime
    return db.query(Event).options(
        joinedload(Event.author),
        joinedload(Event.organization)
    ).filter(
        Event.status == EventStatus.PUBLISHED,
        Event.event_date > datetime.utcnow()
    ).order_by(Event.event_date.asc()).offset(skip).limit(limit).all()


def get_events_by_organization(
    db: Session,
    organization_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Event]:
    """Get events by organization"""
    return db.query(Event).options(
        joinedload(Event.author),
        joinedload(Event.organization)
    ).filter(
        Event.organization_id == organization_id,
        Event.status == EventStatus.PUBLISHED
    ).order_by(Event.event_date.desc()).offset(skip).limit(limit).all()


def create_event(db: Session, event: EventCreate, author_id: int) -> Event:
    """Create new event"""
    from datetime import datetime

    db_event = Event(
        **event.model_dump(),
        author_id=author_id,
        published_at=datetime.utcnow() if event.status == "published" else None
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(
    db: Session,
    event_id: int,
    event_update: EventUpdate
) -> Optional[Event]:
    """Update event"""
    from datetime import datetime

    db_event = get_event(db, event_id)
    if not db_event:
        return None

    update_data = event_update.model_dump(exclude_unset=True)

    # Set published_at if status is being changed to published
    if "status" in update_data and update_data["status"] == "published" and not db_event.published_at:
        update_data["published_at"] = datetime.utcnow()

    for field, value in update_data.items():
        setattr(db_event, field, value)

    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int) -> bool:
    """Delete event"""
    db_event = get_event(db, event_id)
    if not db_event:
        return False

    db.delete(db_event)
    db.commit()
    return True


def get_registrations_count(db: Session, event_id: int) -> int:
    """Get count of confirmed registrations for an event"""
    return db.query(func.count(EventRegistration.id)).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.status == "confirmed"
    ).scalar()


def is_event_full(db: Session, event_id: int) -> bool:
    """Check if event has reached max participants"""
    event = get_event(db, event_id)
    if not event or not event.max_participants:
        return False

    count = get_registrations_count(db, event_id)
    return count >= event.max_participants
