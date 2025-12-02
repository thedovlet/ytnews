from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...api.deps import get_current_user, get_current_moderator
from ...schemas.announcement import (
    Announcement as AnnouncementSchema,
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementList
)
from ...crud import announcement as crud_announcement
from ...models.announcement import AnnouncementStatus
from ...models.user import User

router = APIRouter()


@router.get("/", response_model=List[AnnouncementList])
def read_announcements(
    skip: int = 0,
    limit: int = 20,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Get published announcements (public)"""
    announcements = crud_announcement.get_published_announcements(
        db, skip=skip, limit=limit
    )
    return announcements


@router.get("/all", response_model=List[AnnouncementList])
def read_all_announcements(
    skip: int = 0,
    limit: int = 100,
    status: Optional[AnnouncementStatus] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_moderator),
):
    """Get all announcements with filters (moderator/admin only)"""
    announcements = crud_announcement.get_announcements(
        db, skip=skip, limit=limit, status=status, category_id=category_id
    )
    return announcements


@router.get("/{announcement_id}", response_model=AnnouncementSchema)
def read_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
):
    """Get announcement by ID (public if published)"""
    announcement = crud_announcement.get_announcement(db, announcement_id=announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    # Only allow viewing published announcements for non-authenticated users
    if announcement.status != AnnouncementStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Announcement not found")

    return announcement


@router.get("/slug/{slug}", response_model=AnnouncementSchema)
def read_announcement_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Get announcement by slug (public if published)"""
    announcement = crud_announcement.get_announcement_by_slug(db, slug=slug)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    # Only allow viewing published announcements for non-authenticated users
    if announcement.status != AnnouncementStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Announcement not found")

    return announcement


@router.post("/", response_model=AnnouncementSchema, status_code=status.HTTP_201_CREATED)
def create_announcement(
    announcement_in: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_moderator),
):
    """Create new announcement (moderator/admin only)"""
    # Check if slug already exists
    existing = crud_announcement.get_announcement_by_slug(db, slug=announcement_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Announcement with this slug already exists"
        )

    announcement = crud_announcement.create_announcement(
        db=db, announcement=announcement_in, author_id=current_user.id
    )
    return announcement


@router.put("/{announcement_id}", response_model=AnnouncementSchema)
def update_announcement(
    announcement_id: int,
    announcement_in: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_moderator),
):
    """Update announcement (moderator/admin only)"""
    # Check if new slug conflicts with existing
    if announcement_in.slug:
        existing = crud_announcement.get_announcement_by_slug(db, slug=announcement_in.slug)
        if existing and existing.id != announcement_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Announcement with this slug already exists"
            )

    announcement = crud_announcement.update_announcement(
        db, announcement_id=announcement_id, announcement=announcement_in
    )
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return announcement


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_moderator),
):
    """Delete announcement (moderator/admin only)"""
    success = crud_announcement.delete_announcement(db, announcement_id=announcement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Announcement not found")
