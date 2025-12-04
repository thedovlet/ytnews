from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...api import deps
from ...crud import event as crud_event
from ...crud import event_registration as crud_registration
from ...models.user import User
from ...models.event import EventStatus
from ...schemas import event as event_schema
from ...schemas import event_registration as registration_schema

router = APIRouter()


@router.get("/", response_model=List[event_schema.EventList])
def get_events(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    db: Session = Depends(deps.get_db),
):
    """Get all events (public)"""
    if status_filter:
        events = crud_event.get_events(db, skip=skip, limit=limit, status=status_filter)
    else:
        events = crud_event.get_published_events(db, skip=skip, limit=limit)

    # Add registrations count
    result = []
    for event in events:
        event_dict = event_schema.EventList.model_validate(event).model_dump()
        event_dict['registrations_count'] = crud_event.get_registrations_count(db, event.id)
        result.append(event_schema.EventList(**event_dict))

    return result


@router.get("/upcoming", response_model=List[event_schema.EventList])
def get_upcoming_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
):
    """Get upcoming published events"""
    events = crud_event.get_upcoming_events(db, skip=skip, limit=limit)

    result = []
    for event in events:
        event_dict = event_schema.EventList.model_validate(event).model_dump()
        event_dict['registrations_count'] = crud_event.get_registrations_count(db, event.id)
        result.append(event_schema.EventList(**event_dict))

    return result


@router.get("/{slug}", response_model=event_schema.EventOut)
def get_event(
    slug: str,
    db: Session = Depends(deps.get_db),
):
    """Get event by slug"""
    event = crud_event.get_event_by_slug(db, slug)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    event_dict = event_schema.EventOut.model_validate(event).model_dump()
    event_dict['registrations_count'] = crud_event.get_registrations_count(db, event.id)
    return event_schema.EventOut(**event_dict)


@router.post("/", response_model=event_schema.EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    event: event_schema.EventCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_moderator),
):
    """Create new event (moderator/admin only)"""
    # Check if slug already exists
    existing = crud_event.get_event_by_slug(db, event.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event with this slug already exists"
        )

    db_event = crud_event.create_event(db, event, current_user.id)
    event_dict = event_schema.EventOut.model_validate(db_event).model_dump()
    event_dict['registrations_count'] = 0
    return event_schema.EventOut(**event_dict)


@router.put("/{event_id}", response_model=event_schema.EventOut)
def update_event(
    event_id: int,
    event: event_schema.EventUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_moderator),
):
    """Update event (moderator/admin only)"""
    # Check if slug already exists (if being updated)
    if event.slug:
        existing = crud_event.get_event_by_slug(db, event.slug)
        if existing and existing.id != event_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event with this slug already exists"
            )

    db_event = crud_event.update_event(db, event_id, event)
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    event_dict = event_schema.EventOut.model_validate(db_event).model_dump()
    event_dict['registrations_count'] = crud_event.get_registrations_count(db, db_event.id)
    return event_schema.EventOut(**event_dict)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin),
):
    """Delete event (admin only)"""
    success = crud_event.delete_event(db, event_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )


# Event Registrations

@router.get("/{event_id}/registrations", response_model=List[registration_schema.EventRegistrationOut])
def get_event_registrations(
    event_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_moderator),
):
    """Get all registrations for an event (moderator/admin only)"""
    # Check if event exists
    event = crud_event.get_event(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    return crud_registration.get_registrations_by_event(db, event_id, skip, limit)


@router.post("/{event_id}/register", response_model=registration_schema.EventRegistrationOut, status_code=status.HTTP_201_CREATED)
def register_for_event(
    event_id: int,
    registration: registration_schema.EventRegistrationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user_optional),
):
    """Register for an event (authenticated or guest)"""
    # Check if event exists and is published
    event = crud_event.get_event(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    if event.status != EventStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is not open for registration"
        )

    # Check if registration deadline has passed
    if event.registration_deadline:
        from datetime import datetime
        if datetime.utcnow() > event.registration_deadline:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration deadline has passed"
            )

    # Check if event is full
    if crud_event.is_event_full(db, event_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is full"
        )

    # Check if already registered
    existing = crud_registration.check_existing_registration(
        db,
        event_id,
        user_id=current_user.id if current_user else None,
        guest_email=registration.guest_email if not current_user else None
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this event"
        )

    # Create registration
    registration.event_id = event_id
    return crud_registration.create_registration(
        db,
        registration,
        user_id=current_user.id if current_user else None
    )


@router.get("/registrations/my", response_model=List[registration_schema.EventRegistrationOut])
def get_my_registrations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get current user's event registrations"""
    return crud_registration.get_registrations_by_user(db, current_user.id, skip, limit)


@router.delete("/registrations/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_registration(
    registration_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Cancel event registration"""
    registration = crud_registration.get_registration(db, registration_id)
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )

    # Check if user owns this registration
    if registration.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this registration"
        )

    crud_registration.delete_registration(db, registration_id)
