from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.join_request import JoinRequest, JoinRequestStatus
from ..models.employee import Employee
from ..schemas.join_request import JoinRequestCreate


def get_join_request(db: Session, join_request_id: int) -> Optional[JoinRequest]:
    return db.query(JoinRequest).filter(JoinRequest.id == join_request_id).first()


def get_join_requests_by_organization(db: Session, organization_id: int, skip: int = 0, limit: int = 100) -> List[JoinRequest]:
    return db.query(JoinRequest).filter(
        JoinRequest.organization_id == organization_id
    ).offset(skip).limit(limit).all()


def get_pending_join_requests_by_organization(db: Session, organization_id: int) -> List[JoinRequest]:
    return db.query(JoinRequest).filter(
        JoinRequest.organization_id == organization_id,
        JoinRequest.status == JoinRequestStatus.PENDING
    ).all()


def get_user_join_request(db: Session, user_id: int, organization_id: int) -> Optional[JoinRequest]:
    return db.query(JoinRequest).filter(
        JoinRequest.user_id == user_id,
        JoinRequest.organization_id == organization_id,
        JoinRequest.status == JoinRequestStatus.PENDING
    ).first()


def create_join_request(db: Session, user_id: int, join_request: JoinRequestCreate) -> JoinRequest:
    db_join_request = JoinRequest(
        user_id=user_id,
        **join_request.model_dump()
    )
    db.add(db_join_request)
    db.commit()
    db.refresh(db_join_request)
    return db_join_request


def accept_join_request(db: Session, join_request_id: int) -> Optional[JoinRequest]:
    join_request = get_join_request(db, join_request_id)
    if not join_request or join_request.status != JoinRequestStatus.PENDING:
        return None

    # Update request status
    join_request.status = JoinRequestStatus.ACCEPTED

    # Create employee record
    employee = Employee(
        user_id=join_request.user_id,
        organization_id=join_request.organization_id,
        position=join_request.position,
        is_active=True,
        can_post=True
    )
    db.add(employee)
    db.commit()
    db.refresh(join_request)
    return join_request


def reject_join_request(db: Session, join_request_id: int) -> Optional[JoinRequest]:
    join_request = get_join_request(db, join_request_id)
    if not join_request or join_request.status != JoinRequestStatus.PENDING:
        return None

    join_request.status = JoinRequestStatus.REJECTED
    db.commit()
    db.refresh(join_request)
    return join_request


def delete_join_request(db: Session, join_request_id: int) -> bool:
    join_request = get_join_request(db, join_request_id)
    if not join_request:
        return False
    db.delete(join_request)
    db.commit()
    return True
