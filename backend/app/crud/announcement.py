from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..models.announcement import Announcement, AnnouncementStatus
from ..models.category import Category
from ..schemas.announcement import AnnouncementCreate, AnnouncementUpdate


def get_announcement(db: Session, announcement_id: int) -> Optional[Announcement]:
    """Get announcement by ID"""
    return db.query(Announcement).filter(Announcement.id == announcement_id).first()


def get_announcement_by_slug(db: Session, slug: str) -> Optional[Announcement]:
    """Get announcement by slug"""
    return db.query(Announcement).filter(Announcement.slug == slug).first()


def get_announcements(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[AnnouncementStatus] = None,
    category_id: Optional[int] = None
) -> List[Announcement]:
    """Get list of announcements with optional filters"""
    query = db.query(Announcement)

    if status:
        query = query.filter(Announcement.status == status)

    if category_id:
        query = query.join(Announcement.categories).filter(Category.id == category_id)

    return query.order_by(desc(Announcement.created_at)).offset(skip).limit(limit).all()


def get_published_announcements(db: Session, skip: int = 0, limit: int = 100) -> List[Announcement]:
    """Get published announcements only"""
    return (
        db.query(Announcement)
        .filter(Announcement.status == AnnouncementStatus.PUBLISHED)
        .order_by(desc(Announcement.published_at))
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_announcement(db: Session, announcement: AnnouncementCreate, author_id: int) -> Announcement:
    """Create new announcement"""
    announcement_data = announcement.model_dump(exclude={"category_ids"})
    db_announcement = Announcement(**announcement_data, author_id=author_id)

    # Add categories
    if announcement.category_ids:
        categories = db.query(Category).filter(Category.id.in_(announcement.category_ids)).all()
        db_announcement.categories = categories

    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    return db_announcement


def update_announcement(
    db: Session,
    announcement_id: int,
    announcement: AnnouncementUpdate
) -> Optional[Announcement]:
    """Update announcement"""
    db_announcement = get_announcement(db, announcement_id)
    if not db_announcement:
        return None

    update_data = announcement.model_dump(exclude_unset=True, exclude={"category_ids"})

    # Handle status change to published
    if "status" in update_data and update_data["status"] == AnnouncementStatus.PUBLISHED:
        if db_announcement.status != AnnouncementStatus.PUBLISHED:
            update_data["published_at"] = datetime.utcnow()

    for field, value in update_data.items():
        setattr(db_announcement, field, value)

    # Update categories if provided
    if announcement.category_ids is not None:
        categories = db.query(Category).filter(Category.id.in_(announcement.category_ids)).all()
        db_announcement.categories = categories

    db.commit()
    db.refresh(db_announcement)
    return db_announcement


def delete_announcement(db: Session, announcement_id: int) -> bool:
    """Delete announcement"""
    db_announcement = get_announcement(db, announcement_id)
    if not db_announcement:
        return False

    db.delete(db_announcement)
    db.commit()
    return True
