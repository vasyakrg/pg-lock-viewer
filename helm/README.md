# PG Lock Viewer Helm Chart

Helm chart для установки PG Lock Viewer в Kubernetes.

## Установка

### Базовая установка

```bash
helm install pg-lock-viewer ./helm \
  --set backend.image.repository=your-registry/pg-lock-viewer \
  --set frontend.image.repository=your-registry/pg-lock-viewer \
  --set backend.env.DB_HOST=your-postgres-host \
  --set backend.env.DB_NAME=your-database \
  --set backend.env.DB_USER=your-user \
  --set backend.env.DB_PASSWORD=your-password
```

### Установка с кастомными значениями

Создайте файл `my-values.yaml`:

```yaml
imageRegistry: ghcr.io

backend:
  image:
    repository: owner/repo
    tag: "1.0.0"
  env:
    DB_HOST: postgres.example.com
    DB_PORT: "5432"
    DB_NAME: mydb
    DB_USER: myuser
    DB_PASSWORD: mypassword
    QUERY_TIMEOUT: "30000"

frontend:
  image:
    repository: owner/repo
    tag: "1.0.0"

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: pg-lock-viewer.example.com
      paths:
        - path: /
          pathType: Prefix
```

Затем установите:

```bash
helm install pg-lock-viewer ./helm -f my-values.yaml
```

## Параметры

### Backend

| Параметр | Описание | Значение по умолчанию |
|----------|----------|----------------------|
| `backend.image.repository` | Репозиторий образа backend | `""` (автоматически) |
| `backend.image.tag` | Тег образа | `"latest"` |
| `backend.replicaCount` | Количество реплик | `1` |
| `backend.service.type` | Тип сервиса | `ClusterIP` |
| `backend.service.port` | Порт сервиса | `3001` |
| `backend.env.DB_HOST` | Хост PostgreSQL | `""` (обязательно) |
| `backend.env.DB_PORT` | Порт PostgreSQL | `"5432"` |
| `backend.env.DB_NAME` | Имя базы данных | `""` (обязательно) |
| `backend.env.DB_USER` | Пользователь БД | `""` (обязательно) |
| `backend.env.DB_PASSWORD` | Пароль БД | `""` (обязательно) |
| `backend.env.QUERY_TIMEOUT` | Таймаут запросов (мс) | `"30000"` |

### Frontend

| Параметр | Описание | Значение по умолчанию |
|----------|----------|----------------------|
| `frontend.image.repository` | Репозиторий образа frontend | `""` (автоматически) |
| `frontend.image.tag` | Тег образа | `"latest"` |
| `frontend.replicaCount` | Количество реплик | `1` |
| `frontend.service.type` | Тип сервиса | `ClusterIP` |
| `frontend.service.port` | Порт сервиса | `80` |

### Ingress

| Параметр | Описание | Значение по умолчанию |
|----------|----------|----------------------|
| `ingress.enabled` | Включить Ingress | `false` |
| `ingress.className` | Класс Ingress контроллера | `""` |
| `ingress.hosts` | Список хостов | `[]` |
| `ingress.tls` | TLS конфигурация | `[]` |

## Обновление

```bash
helm upgrade pg-lock-viewer ./helm -f my-values.yaml
```

## Удаление

```bash
helm uninstall pg-lock-viewer
```

## Использование Secret для пароля БД

Для безопасности рекомендуется использовать Kubernetes Secret:

```bash
kubectl create secret generic pg-lock-viewer-db \
  --from-literal=password=your-password
```

Затем в `values.yaml`:

```yaml
backend:
  env:
    DB_PASSWORD:
      valueFrom:
        secretKeyRef:
          name: pg-lock-viewer-db
          key: password
```

Или обновите `backend-deployment.yaml` для использования Secret.
