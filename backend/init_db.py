"""
Initial database setup script
Creates the first admin user
"""
import asyncio
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.core.database import Base
# Import all models to ensure relationships are properly set up
from app.models.organization import Organization
from app.models.employee import Employee
from app.models.join_request import JoinRequest
from app.models.announcement import Announcement
from app.models.category import Category


def init_db():
    """Initialize database with tables and first admin user"""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@ycnews.com").first()
        if not admin:
            # Create admin user
            admin = User(
                email="admin@ycnews.com",
                hashed_password=get_password_hash("admin"),
                full_name="Administrator",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("[+] Admin user created successfully!")
            print("Email: admin@ycnews.com")
            print("Password: admin")
            print("WARNING: Please change the password after first login!")
        else:
            print("[i] Admin user already exists")

    except Exception as e:
        print(f"[!] Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("[+] Database initialization complete!")
