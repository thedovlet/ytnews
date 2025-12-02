from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from typing import List
import os
import uuid
from pathlib import Path

from ...core.config import settings
from ...api.deps import get_current_moderator
from ...models.user import User

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE


def validate_image(file: UploadFile) -> None:
    """Validate uploaded image"""
    # Check extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )


def save_upload_file(upload_file: UploadFile, destination: Path) -> None:
    """Save uploaded file to destination"""
    try:
        with destination.open("wb") as buffer:
            while chunk := upload_file.file.read(8192):
                buffer.write(chunk)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )


@router.post("/image")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_moderator),
):
    """Upload image (moderator/admin only)"""
    validate_image(file)

    # Generate unique filename
    ext = Path(file.filename).suffix.lower()
    filename = f"{uuid.uuid4()}{ext}"
    file_path = Path(settings.UPLOAD_DIR) / "images" / filename

    # Save file
    save_upload_file(file, file_path)

    # Return URL path
    return {
        "filename": filename,
        "url": f"/uploads/images/{filename}"
    }


@router.post("/images")
def upload_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_moderator),
):
    """Upload multiple images (moderator/admin only)"""
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed"
        )

    uploaded_files = []
    for file in files:
        validate_image(file)

        # Generate unique filename
        ext = Path(file.filename).suffix.lower()
        filename = f"{uuid.uuid4()}{ext}"
        file_path = Path(settings.UPLOAD_DIR) / "images" / filename

        # Save file
        save_upload_file(file, file_path)

        uploaded_files.append({
            "filename": filename,
            "url": f"/uploads/images/{filename}"
        })

    return {"files": uploaded_files}
