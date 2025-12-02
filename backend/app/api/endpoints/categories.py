from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...api.deps import get_current_moderator
from ...schemas.category import Category as CategorySchema, CategoryCreate, CategoryUpdate
from ...crud import category as crud_category

router = APIRouter()


@router.get("/", response_model=List[CategorySchema])
def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Get all categories (public)"""
    categories = crud_category.get_categories(db, skip=skip, limit=limit)
    return categories


@router.get("/{category_id}", response_model=CategorySchema)
def read_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    """Get category by ID (public)"""
    category = crud_category.get_category(db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("/slug/{slug}", response_model=CategorySchema)
def read_category_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Get category by slug (public)"""
    category = crud_category.get_category_by_slug(db, slug=slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=CategorySchema, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_moderator),
):
    """Create new category (moderator/admin only)"""
    # Check if slug already exists
    existing = crud_category.get_category_by_slug(db, slug=category_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists"
        )

    category = crud_category.create_category(db=db, category=category_in)
    return category


@router.put("/{category_id}", response_model=CategorySchema)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_moderator),
):
    """Update category (moderator/admin only)"""
    # Check if new slug conflicts with existing
    if category_in.slug:
        existing = crud_category.get_category_by_slug(db, slug=category_in.slug)
        if existing and existing.id != category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists"
            )

    category = crud_category.update_category(db, category_id=category_id, category=category_in)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_moderator),
):
    """Delete category (moderator/admin only)"""
    success = crud_category.delete_category(db, category_id=category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
