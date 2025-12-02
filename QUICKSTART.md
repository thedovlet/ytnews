# Быстрый старт YTNews

## Шаг 1: Установка PostgreSQL

Скачайте и установите PostgreSQL с официального сайта:
- Windows: https://www.postgresql.org/download/windows/
- При установке запомните пароль для пользователя `postgres`

## Шаг 2: Создание базы данных

Откройте командную строку (cmd) или PowerShell:

```bash
# Подключитесь к PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE ytnews;

# Создайте пользователя (опционально)
CREATE USER ytnews_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ytnews TO ytnews_user;

# Выйдите из psql
\q
```

## Шаг 3: Настройка Backend

```bash
cd backend

# Создайте виртуальное окружение
python -m venv venv

# Активируйте виртуальное окружение
venv\Scripts\activate

# Установите зависимости
pip install -r requirements.txt

# Создайте .env файл
copy .env.example .env
```

Отредактируйте файл `.env`:
```env
DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/ytnews
SECRET_KEY=сгенерируйте_случайную_строку_минимум_32_символа
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
```

**Генерация SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Шаг 4: Инициализация базы данных

```bash
# Примените миграции
alembic upgrade head

# Создайте первого администратора
python init_db.py
```

Будет создан админ с учетными данными:
- Email: `admin@ytnews.com`
- Password: `admin123`

**⚠️ ВАЖНО: Измените пароль после первого входа!**

## Шаг 5: Запуск Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend запустится на: http://localhost:8000
API документация: http://localhost:8000/api/v1/docs

## Шаг 6: Настройка Frontend

Откройте новый терминал:

```bash
cd frontend

# Установите зависимости
npm install

# Запустите dev-сервер
npm run dev
```

Frontend запустится на: http://localhost:5173

## Шаг 7: Первый вход

1. Откройте браузер: http://localhost:5173
2. Нажмите "Войти"
3. Введите:
   - Email: `admin@ytnews.com`
   - Password: `admin123`
4. После входа перейдите в "Админ-панель"

## Основные функции

### Создание категорий

1. Админ-панель → Категории
2. Нажмите "Создать категорию"
3. Введите название (например, "Новости")
4. Slug сгенерируется автоматически

### Создание объявления

1. Админ-панель → Объявления
2. Нажмите "Создать объявление"
3. Заполните форму:
   - Заголовок
   - Краткое описание
   - Загрузите обложку
   - Напишите контент в редакторе
   - Выберите категории
   - Установите статус "Опубликовано"
4. Нажмите "Создать"

### Управление пользователями (только для администраторов)

1. Админ-панель → Пользователи
2. Создавайте модераторов и других администраторов
3. Блокируйте или меняйте роли существующих пользователей

## Часто возникающие проблемы

### Ошибка подключения к БД

Проверьте:
- PostgreSQL запущен
- Правильный пароль в `.env`
- База данных создана

### Ошибка при миграции

```bash
# Удалите все миграции и пересоздайте
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### Frontend не запускается

```bash
# Очистите кеш и переустановите
rm -rf node_modules package-lock.json
npm install
```

### CORS ошибки

Убедитесь, что в `.env` backend указаны правильные URL фронтенда:
```
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
```

## Сборка для продакшена

### Backend

```bash
# Используйте gunicorn для продакшена
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend

```bash
cd frontend
npm run build
# Результат в папке dist/
```

## Следующие шаги

1. Создайте несколько категорий
2. Опубликуйте тестовые объявления
3. Создайте модераторов для управления контентом
4. Настройте домен и SSL для продакшена
5. Настройте резервное копирование базы данных

## Полезные команды

```bash
# Backend - создание новой миграции после изменения моделей
alembic revision --autogenerate -m "описание изменений"
alembic upgrade head

# Backend - откат миграции
alembic downgrade -1

# Frontend - проверка типов
npm run build

# Backend - запуск с автоперезагрузкой
uvicorn app.main:app --reload

# Frontend - запуск dev сервера
npm run dev
```

## Поддержка

Если возникли проблемы:
1. Проверьте логи backend и frontend
2. Убедитесь, что все зависимости установлены
3. Проверьте версии Python (3.9+) и Node.js (18+)
