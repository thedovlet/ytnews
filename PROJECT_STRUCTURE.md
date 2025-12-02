# Структура проекта YTNews

## Обзор директорий

```
ytnews/
├── backend/                    # FastAPI Backend
│   ├── alembic/               # Миграции базы данных
│   │   ├── versions/          # Файлы миграций
│   │   ├── env.py            # Конфигурация Alembic
│   │   └── script.py.mako    # Шаблон миграций
│   ├── app/                   # Основное приложение
│   │   ├── api/              # API endpoints
│   │   │   ├── endpoints/    # Модули endpoints
│   │   │   │   ├── auth.py          # Авторизация
│   │   │   │   ├── users.py         # Пользователи
│   │   │   │   ├── categories.py   # Категории
│   │   │   │   ├── announcements.py # Объявления
│   │   │   │   └── upload.py        # Загрузка файлов
│   │   │   └── api.py         # Роутер API
│   │   ├── core/             # Конфигурация
│   │   │   ├── config.py     # Настройки приложения
│   │   │   ├── database.py   # База данных
│   │   │   └── security.py   # JWT и хеширование
│   │   ├── crud/             # CRUD операции
│   │   │   ├── user.py
│   │   │   ├── category.py
│   │   │   └── announcement.py
│   │   ├── models/           # SQLAlchemy модели
│   │   │   ├── user.py       # Модель User
│   │   │   ├── category.py   # Модель Category
│   │   │   └── announcement.py # Модель Announcement
│   │   ├── schemas/          # Pydantic схемы
│   │   │   ├── user.py
│   │   │   ├── category.py
│   │   │   └── announcement.py
│   │   └── main.py           # Точка входа FastAPI
│   ├── uploads/              # Загруженные файлы
│   │   └── images/           # Изображения
│   ├── .env.example          # Пример конфигурации
│   ├── .gitignore
│   ├── alembic.ini           # Конфигурация Alembic
│   ├── init_db.py            # Скрипт инициализации БД
│   └── requirements.txt      # Python зависимости
│
├── frontend/                  # React Frontend
│   ├── public/               # Статические файлы
│   ├── src/
│   │   ├── api/              # API клиенты
│   │   │   ├── client.ts     # Axios конфигурация
│   │   │   ├── auth.ts       # API авторизации
│   │   │   ├── users.ts      # API пользователей
│   │   │   ├── categories.ts # API категорий
│   │   │   ├── announcements.ts # API объявлений
│   │   │   └── upload.ts     # API загрузки
│   │   ├── components/       # Переиспользуемые компоненты
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── TipTapEditor.tsx # WYSIWYG редактор
│   │   ├── pages/            # Страницы приложения
│   │   │   ├── admin/        # Админ-панель
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AnnouncementsListPage.tsx
│   │   │   │   ├── AnnouncementFormPage.tsx
│   │   │   │   ├── CategoriesPage.tsx
│   │   │   │   └── UsersPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── AnnouncementPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── store/            # State management
│   │   │   └── authStore.ts  # Zustand store для auth
│   │   ├── types/            # TypeScript типы
│   │   │   └── index.ts
│   │   ├── App.tsx           # Главный компонент
│   │   ├── main.tsx          # Точка входа
│   │   └── index.css         # Глобальные стили
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── .gitignore                 # Git ignore (общий)
├── README.md                  # Основная документация
├── QUICKSTART.md              # Быстрый старт
├── PROJECT_STRUCTURE.md       # Этот файл
├── setup.bat                  # Скрипт установки (Windows)
├── start-backend.bat          # Запуск backend (Windows)
└── start-frontend.bat         # Запуск frontend (Windows)
```

## Ключевые файлы

### Backend

#### `app/main.py`
Главный файл приложения FastAPI. Настраивает CORS, подключает роутеры, создает endpoints.

#### `app/models/*.py`
SQLAlchemy модели для базы данных:
- `User` - пользователи системы
- `Category` - категории объявлений
- `Announcement` - объявления
- `announcement_categories` - связь многие-ко-многим

#### `app/schemas/*.py`
Pydantic схемы для валидации данных API.

#### `app/api/endpoints/*.py`
API endpoints, организованные по доменам:
- `auth.py` - регистрация, вход
- `users.py` - управление пользователями
- `categories.py` - CRUD категорий
- `announcements.py` - CRUD объявлений
- `upload.py` - загрузка изображений

#### `app/core/security.py`
Функции безопасности:
- `create_access_token()` - создание JWT
- `verify_password()` - проверка пароля
- `get_password_hash()` - хеширование

#### `app/api/deps.py`
Зависимости FastAPI:
- `get_current_user()` - получение текущего пользователя
- `get_current_moderator()` - проверка прав модератора
- `get_current_admin()` - проверка прав администратора

### Frontend

#### `src/App.tsx`
Главный компонент с маршрутизацией.

#### `src/store/authStore.ts`
Zustand store для управления аутентификацией:
- `login()` - вход
- `logout()` - выход
- `loadUser()` - загрузка текущего пользователя

#### `src/components/TipTapEditor.tsx`
WYSIWYG редактор на основе TipTap с кнопками форматирования и загрузкой изображений.

#### `src/pages/admin/*`
Страницы административной панели для управления контентом.

## Потоки данных

### Аутентификация

1. Пользователь вводит email/пароль
2. Frontend → POST `/api/v1/auth/login`
3. Backend проверяет данные, возвращает JWT
4. Frontend сохраняет токен в localStorage
5. Токен добавляется в заголовки всех запросов

### Создание объявления

1. Модератор заполняет форму
2. Загружает изображения → POST `/api/v1/upload/image`
3. Редактирует контент в TipTap
4. Сохраняет → POST `/api/v1/announcements/`
5. Backend валидирует, сохраняет в БД
6. Редирект на список объявлений

### Просмотр объявления

1. Пользователь кликает на объявление
2. Frontend → GET `/api/v1/announcements/slug/{slug}`
3. Backend проверяет статус (опубликовано?)
4. Возвращает данные с автором и категориями
5. Frontend отображает контент

## Модели данных

### User
```python
- id: Integer (PK)
- email: String (уникальный)
- hashed_password: String
- full_name: String (опционально)
- role: Enum (user, moderator, admin)
- is_active: Boolean
- created_at: DateTime
- updated_at: DateTime
```

### Category
```python
- id: Integer (PK)
- name: String (уникальный)
- slug: String (уникальный)
- description: Text (опционально)
- created_at: DateTime
- updated_at: DateTime
```

### Announcement
```python
- id: Integer (PK)
- title: String
- slug: String (уникальный)
- content: Text (HTML из редактора)
- excerpt: Text (опционально)
- cover_image: String (путь к файлу)
- status: Enum (draft, published, archived)
- author_id: Integer (FK → users)
- published_at: DateTime (опционально)
- created_at: DateTime
- updated_at: DateTime
- categories: Many-to-Many → Category
```

## API Endpoints

Полный список в [README.md](README.md#api-endpoints)

## Безопасность

### Хеширование паролей
- Используется bcrypt через passlib
- Соль генерируется автоматически

### JWT токены
- Алгоритм: HS256
- Срок действия: 30 минут (настраивается)
- Payload: `{"sub": user_id, "exp": timestamp}`

### Защита endpoints
- Публичные: GET объявлений, категорий
- Авторизованные: профиль пользователя
- Модераторы: CRUD объявлений, категорий
- Администраторы: управление пользователями

### CORS
Настроен для разрешенных origin из .env

## Расширение функционала

### Добавление нового API endpoint

1. Создайте CRUD функцию в `app/crud/`
2. Создайте Pydantic схему в `app/schemas/`
3. Добавьте endpoint в `app/api/endpoints/`
4. Подключите роутер в `app/api/api.py`

### Добавление новой модели

1. Создайте модель в `app/models/`
2. Импортируйте в `alembic/env.py`
3. Создайте миграцию: `alembic revision --autogenerate -m "описание"`
4. Примените: `alembic upgrade head`

### Добавление новой страницы

1. Создайте компонент в `src/pages/`
2. Добавьте маршрут в `src/App.tsx`
3. При необходимости оберните в `<ProtectedRoute>`

## Тестирование

### Backend
```bash
# Установите pytest
pip install pytest pytest-asyncio httpx

# Создайте тесты в backend/tests/
pytest
```

### Frontend
```bash
# Используйте встроенные инструменты Vite
npm run build  # проверка типов и сборка
```

## Deployment

### Backend (Production)
```bash
# Используйте gunicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Production)
```bash
npm run build
# Результат в dist/ можно развернуть на Nginx, Vercel, Netlify
```

### База данных
- Настройте регулярные бэкапы
- Используйте managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
- Настройте репликацию для высокой доступности

### Переменные окружения
- Никогда не коммитьте `.env` в git
- Используйте переменные окружения на сервере
- Генерируйте новый SECRET_KEY для продакшена
