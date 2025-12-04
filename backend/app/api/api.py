from fastapi import APIRouter
from .endpoints import auth, users, categories, announcements, upload, organizations, employees, join_requests, events

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(announcements.router, prefix="/announcements", tags=["announcements"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(join_requests.router, prefix="/join-requests", tags=["join-requests"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
