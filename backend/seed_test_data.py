"""
Seed test data script
Creates test users, organizations, and announcements
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.employee import Employee
from app.models.category import Category
from app.models.announcement import Announcement, AnnouncementStatus
from app.core.database import Base
from datetime import datetime, timedelta
import random

# Import all models
from app.models.join_request import JoinRequest


def seed_data():
    """Seed database with test data"""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Create categories
        categories_data = [
            {"name": "Технологии", "slug": "tech"},
            {"name": "Бизнес", "slug": "business"},
            {"name": "Наука", "slug": "science"},
            {"name": "Образование", "slug": "education"},
            {"name": "Спорт", "slug": "sport"},
        ]

        categories = []
        for cat_data in categories_data:
            existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not existing:
                category = Category(**cat_data)
                db.add(category)
                db.flush()
                categories.append(category)
                print(f"[+] Category created: {cat_data['name']}")
            else:
                categories.append(existing)
                print(f"[i] Category exists: {cat_data['name']}")

        db.commit()

        # Create test users
        users_data = [
            {
                "email": "john@example.com",
                "password": "password123",
                "full_name": "Джон Доу",
                "role": UserRole.USER
            },
            {
                "email": "jane@example.com",
                "password": "password123",
                "full_name": "Джейн Смит",
                "role": UserRole.USER
            },
            {
                "email": "moderator@example.com",
                "password": "password123",
                "full_name": "Модератор",
                "role": UserRole.MODERATOR
            },
        ]

        users = []
        for user_data in users_data:
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing:
                user = User(
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    is_active=True
                )
                db.add(user)
                db.flush()
                users.append(user)
                print(f"[+] User created: {user_data['email']}")
            else:
                users.append(existing)
                print(f"[i] User exists: {user_data['email']}")

        db.commit()

        # Create test organizations
        orgs_data = [
            {
                "name": "Tech Innovations",
                "slug": "tech-innovations",
                "description": "Ведущая технологическая компания, специализирующаяся на разработке инновационных решений",
                "website": "https://tech-innovations.example.com",
                "email": "info@tech-innovations.com"
            },
            {
                "name": "Global Business Corp",
                "slug": "global-business",
                "description": "Международная бизнес-корпорация с более чем 20-летним опытом",
                "website": "https://globalbusiness.example.com",
                "email": "contact@globalbusiness.com"
            },
        ]

        organizations = []
        for i, org_data in enumerate(orgs_data):
            existing = db.query(Organization).filter(Organization.slug == org_data["slug"]).first()
            if not existing:
                org = Organization(**org_data)
                db.add(org)
                db.flush()

                # Add user as employee
                if i < len(users):
                    employee = Employee(
                        user_id=users[i].id,
                        organization_id=org.id,
                        position="CEO" if i == 0 else "Director",
                        is_active=True,
                        can_post=True
                    )
                    db.add(employee)
                    db.flush()

                organizations.append(org)
                print(f"[+] Organization created: {org_data['name']}")
            else:
                organizations.append(existing)
                print(f"[i] Organization exists: {org_data['name']}")

        db.commit()

        # Get admin user
        admin = db.query(User).filter(User.email == "admin@ytnews.com").first()
        if admin:
            users.append(admin)

        # Create announcements from personal users
        personal_announcements = [
            {
                "title": "Новый прорыв в искусственном интеллекте",
                "content": "<h2>Революция в машинном обучении</h2><p>Исследователи объявили о создании новой архитектуры нейронных сетей, которая показывает на 40% лучшие результаты в задачах обработки естественного языка.</p><p>Эта технология открывает новые возможности для создания более точных и эффективных AI-систем.</p>",
                "cover_image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
                "author_index": 0,
                "category_index": 0,
                "status": AnnouncementStatus.PUBLISHED
            },
            {
                "title": "Топ-10 стратегий для малого бизнеса в 2024",
                "content": "<h2>Как развивать малый бизнес</h2><ul><li>Цифровизация процессов</li><li>Фокус на клиентском опыте</li><li>Оптимизация затрат</li><li>Инвестиции в персонал</li></ul><p>Подробный анализ каждой стратегии с реальными примерами успешных компаний.</p>",
                "cover_image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
                "author_index": 1,
                "category_index": 1,
                "status": AnnouncementStatus.PUBLISHED
            },
            {
                "title": "Обзор последних научных открытий",
                "content": "<h2>Наука в 2024 году</h2><p>За последний месяц ученые сделали несколько важных открытий в области квантовой физики и биотехнологий.</p><p>Особенно интересны результаты экспериментов по квантовой телепортации на расстояние более 100 км.</p>",
                "cover_image": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=400&fit=crop",
                "author_index": 2,
                "category_index": 2,
                "status": AnnouncementStatus.PUBLISHED
            },
        ]

        for ann_data in personal_announcements:
            if ann_data["author_index"] < len(users) and ann_data["category_index"] < len(categories):
                # Generate slug from title
                slug = ann_data["title"].lower()
                slug = slug.replace(" ", "-")
                slug = ''.join(c for c in slug if c.isalnum() or c == '-')
                slug = slug[:100]  # Limit length

                announcement = Announcement(
                    title=ann_data["title"],
                    slug=slug,
                    content=ann_data["content"],
                    cover_image=ann_data.get("cover_image"),
                    author_id=users[ann_data["author_index"]].id,
                    status=ann_data["status"],
                    published_at=datetime.now() if ann_data["status"] == AnnouncementStatus.PUBLISHED else None
                )
                announcement.categories.append(categories[ann_data["category_index"]])
                db.add(announcement)
                print(f"[+] Personal announcement created: {ann_data['title']}")

        db.commit()

        # Create announcements from organizations
        org_announcements = [
            {
                "title": "Tech Innovations запускает новый продукт на рынок",
                "content": "<h2>Представляем SmartCloud Platform</h2><p>Мы рады объявить о запуске нашей новой облачной платформы SmartCloud, которая революционизирует способ работы с данными.</p><h3>Основные преимущества:</h3><ul><li>99.99% аптайм</li><li>Автоматическое масштабирование</li><li>Интеграция с популярными сервисами</li><li>Доступные цены</li></ul><p>Первые 1000 клиентов получат 3 месяца бесплатного использования!</p>",
                "cover_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
                "org_index": 0,
                "employee_index": 0,
                "category_index": 0,
                "status": AnnouncementStatus.PUBLISHED
            },
            {
                "title": "Global Business Corp расширяет присутствие в Азии",
                "content": "<h2>Новые офисы в 5 странах</h2><p>Global Business Corp объявляет об открытии новых региональных офисов в Сингапуре, Токио, Сеуле, Бангкоке и Ханое.</p><p>Это расширение является частью нашей долгосрочной стратегии роста на азиатском рынке.</p><h3>Планы развития:</h3><p>В ближайшие 2 года мы планируем увеличить штат сотрудников в регионе до 5000 человек и открыть дополнительные офисы.</p>",
                "cover_image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
                "org_index": 1,
                "employee_index": 1,
                "category_index": 1,
                "status": AnnouncementStatus.PUBLISHED
            },
            {
                "title": "Партнерство Tech Innovations с ведущими университетами",
                "content": "<h2>Образовательная инициатива</h2><p>Tech Innovations объявляет о партнерстве с 10 ведущими техническими университетами для запуска программы стажировок.</p><p>Студенты получат возможность работать над реальными проектами и получить ценный опыт в индустрии.</p><h3>Условия программы:</h3><ul><li>Оплачиваемые стажировки</li><li>Менторство от опытных специалистов</li><li>Возможность трудоустройства</li><li>Доступ к новейшим технологиям</li></ul>",
                "cover_image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop",
                "org_index": 0,
                "employee_index": 0,
                "category_index": 3,
                "status": AnnouncementStatus.PUBLISHED
            },
        ]

        # Get employees
        employees = db.query(Employee).all()

        for ann_data in org_announcements:
            if ann_data["org_index"] < len(organizations) and ann_data["category_index"] < len(categories):
                if ann_data["employee_index"] < len(employees):
                    employee = employees[ann_data["employee_index"]]

                    # Generate slug from title
                    slug = ann_data["title"].lower()
                    slug = slug.replace(" ", "-")
                    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
                    slug = slug[:100]  # Limit length

                    announcement = Announcement(
                        title=ann_data["title"],
                        slug=slug,
                        content=ann_data["content"],
                        cover_image=ann_data.get("cover_image"),
                        author_id=employee.user_id,
                        organization_id=organizations[ann_data["org_index"]].id,
                        employee_id=employee.id,
                        status=ann_data["status"],
                        published_at=datetime.now() if ann_data["status"] == AnnouncementStatus.PUBLISHED else None
                    )
                    announcement.categories.append(categories[ann_data["category_index"]])
                    db.add(announcement)
                    print(f"[+] Organization announcement created: {ann_data['title']}")

        db.commit()

        print("\n" + "="*60)
        print("TEST DATA SUMMARY")
        print("="*60)
        print("\nTest Users (password: password123):")
        print("- john@example.com (Джон Доу)")
        print("- jane@example.com (Джейн Смит)")
        print("- moderator@example.com (Модератор)")
        print("\nAdmin User (password: admin):")
        print("- admin@ytnews.com (Administrator)")
        print("\nOrganizations:")
        print("- Tech Innovations (CEO: john@example.com)")
        print("- Global Business Corp (Director: jane@example.com)")
        print("\nCategories:")
        for cat in categories:
            print(f"- {cat.name}")
        print("\nAnnouncements:")
        print("- 3 personal announcements")
        print("- 3 organization announcements")
        print("="*60)

    except Exception as e:
        print(f"[!] Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding test data...")
    seed_data()
    print("\n[+] Test data seeding complete!")
