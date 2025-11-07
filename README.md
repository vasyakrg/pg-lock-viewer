# PostgreSQL Lock Viewer

Веб-приложение для просмотра блокировок и активных запросов в PostgreSQL базе данных.

## Описание

PG Lock Viewer - это инструмент для мониторинга блокировок PostgreSQL через веб-интерфейс. Приложение позволяет выполнять предопределенные SQL-запросы для анализа состояния базы данных и экспортировать результаты в Excel.

## Возможности

- Выполнение предопределенных SQL-запросов к PostgreSQL
- Отображение результатов в удобной таблице с темной темой
- Фильтрация колонок (автоматическое скрытие `transactionid` и `usename`)
- Преобразование поля `age` в миллисекунды
- Экспорт результатов в Excel
- Таймауты для запросов
- Логирование всех операций в stdout

## Структура проекта

```
pg-lock-viewer/
├── backend/              # Backend сервис (Node.js/Express)
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/             # Frontend приложение (Vue.js)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.vue
│       └── main.js
├── queries/              # SQL запросы
│   ├── lock.sql
│   ├── lockAndWho.sql
│   └── waiting.sql
├── docker-compose.yml    # Docker Compose конфигурация
├── .dockerignore
├── .gitignore
└── README.md
```

## Требования

- Docker и Docker Compose
- Доступ к PostgreSQL базе данных

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd pg-lock-viewer
```

### 2. Создание файла .env

Создайте файл `.env` в корне проекта со следующими переменными:

```env
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
QUERY_TIMEOUT=30000
```

### 3. Запуск приложения

```bash
docker-compose up --build
```

Приложение будет доступно по адресу:
- Frontend: `http://localhost:3000` (если порт открыт)
- Backend API: `http://localhost:3001`

## Использование

1. Откройте веб-интерфейс в браузере
2. Выберите запрос из выпадающего списка:
   - **Lock** - показывает текущие блокировки
   - **Lock and Who** - показывает заблокированные запросы и кто их блокирует
   - **Waiting** - показывает долгие запросы (более 1 минуты)
3. Нажмите кнопку "Запустить"
4. Просмотрите результаты в таблице
5. При необходимости экспортируйте данные в Excel, нажав "Выгрузить в Excel"

## Доступные запросы

### Lock
Показывает текущие блокировки в базе данных с информацией о транзакциях, режимах блокировок и активных запросах.

### Lock and Who
Отображает заблокированные запросы и информацию о том, какие запросы их блокируют.

### Waiting
Показывает запросы, которые выполняются дольше 1 минуты, с информацией о длительности выполнения.

## API Endpoints

### GET /api/queries
Возвращает список доступных запросов.

**Ответ:**
```json
{
  "queries": [
    { "id": "lock", "name": "Lock" },
    { "id": "lockAndWho", "name": "Lock and Who" },
    { "id": "waiting", "name": "Waiting" }
  ]
}
```

### POST /api/execute
Выполняет указанный запрос.

**Тело запроса:**
```json
{
  "queryId": "lock"
}
```

**Ответ (успех):**
```json
{
  "success": true,
  "rows": [...],
  "columns": ["datname", "relation", "mode", ...]
}
```

**Ответ (ошибка):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Переменные окружения

| Переменная      | Описание                         | Значение по умолчанию |
|-----------------|----------------------------------|-----------------------|
| `DB_HOST`       | Хост PostgreSQL                  | `localhost`           |
| `DB_PORT`       | Порт PostgreSQL                  | `5432`                |
| `DB_NAME`       | Имя базы данных                  | `postgres`            |
| `DB_USER`       | Пользователь базы данных         | `postgres`            |
| `DB_PASSWORD`   | Пароль базы данных               | `postgres`            |
| `QUERY_TIMEOUT` | Таймаут запросов в миллисекундах | `30000` (30 секунд)   |
| `PORT`          | Порт backend сервера             | `3001`                |

## Особенности

### Фильтрация колонок
Автоматически скрываются колонки `transactionid` и `usename` из результатов.

### Преобразование age
Поле `age` автоматически преобразуется из объекта интервала PostgreSQL в миллисекунды.

### Ширина колонок
Колонка `query` отображается с увеличенной шириной (40% от доступного пространства) для лучшей читаемости SQL-запросов.

### Логирование
Все запросы логируются в stdout контейнера с информацией:
- Время выполнения
- ID запроса
- Длительность выполнения
- Количество возвращенных строк
- Ошибки (если есть)

Формат лога:
```
[2025-01-07T10:30:45.123Z] EXECUTE QUERY: lock
[2025-01-07T10:30:45.456Z] QUERY SUCCESS: lock | Duration: 333ms | Rows: 15
```

## Разработка

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Технологии

- **Backend**: Node.js, Express, PostgreSQL (pg)
- **Frontend**: Vue.js 3, Vite, Axios, XLSX
- **Контейнеризация**: Docker, Docker Compose
- **Веб-сервер**: Nginx (для production frontend)

## Лицензия

Copyright (C) 2025 PG Lock Viewer
