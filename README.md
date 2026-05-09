# AlumniConn

A multi-tenant networking platform for colleges — connecting students and alumni within college-specific boundaries.

## Tech Stack

**Backend:** FastAPI · PostgreSQL · SQLAlchemy · Alembic · JWT · WebSockets  
**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · Axios  
**Infrastructure:** Cloudinary (image uploads) · Render (deployment)

---

## Features

- **Multi-tenant architecture** — each college is an isolated tenant scoped by `college_id`
- **Role-based access** — Student, Alumni, College Admin, Super Admin
- **College onboarding** — Super Admin reviews and approves college registration requests
- **Alumni role upgrade** — Students apply; College Admins approve or reject
- **Social feed** — Posts, likes, comments, and opportunity posts (Alumni-only)
- **Connections** — Send, accept, and reject connection requests within your college
- **Real-time messaging** — WebSocket-based one-to-one chat with image support
- **Profile management** — Career details with Cloudinary-hosted profile pictures

---

## Project Structure

```
AlumniConn/
├── client/
│   └── src/
│       ├── api/          # Axios API clients
│       ├── components/   # Feed, profile, post, connection UI
│       ├── hooks/        # WebSocket messaging hook
│       ├── pages/        # Route-level screens
│       ├── types/        # TypeScript types
│       └── utils/        # Auth helpers, token decoding
└── server/
    ├── app.py            # FastAPI app entry point
    ├── src/
    │   ├── database/     # SQLAlchemy session & seed
    │   ├── models/       # ORM models
    │   ├── routes/       # FastAPI routers
    │   ├── schemas/      # Pydantic schemas
    │   ├── services/     # Business logic
    │   └── utils/        # Auth, RBAC, WebSocket manager
    ├── migrations/       # Alembic migration history
    └── tests/            # Pytest test suite
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd server
pip install -r requirements.txt

# Set up environment variables (see below)
alembic upgrade head
uvicorn app:app --reload
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key |
| `ALGORITHM` | JWT algorithm (e.g. `HS256`) |
| `ACCESS_TOKEN_EXPIRE_HOURS` | Token lifetime in hours |
| `SUPER_ADMIN_EMAIL` | Seeded super admin email |
| `SUPER_ADMIN_USERNAME` | Seeded super admin username |
| `SUPER_ADMIN_PASSWORD` | Seeded super admin password |
| `FRONTEND_URL` | CORS origin for production |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config |
| `CLOUDINARY_API_KEY` | Cloudinary config |
| `CLOUDINARY_API_SECRET` | Cloudinary config |

### Frontend (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | FastAPI base URL |

---

## API Overview

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register as a student |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/super-admin/login` | Super admin login |

### Colleges & Onboarding
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/college-requests/` | Request college onboarding |
| `GET` | `/college-requests/` | List requests (Super Admin) |
| `POST` | `/college-requests/{id}/approve` | Approve request |
| `POST` | `/college-requests/{id}/reject` | Reject request |

### Social
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/posts/feed` | Tenant-scoped feed |
| `POST` | `/posts/` | Create post |
| `POST` | `/likes/toggle/{post_id}` | Like / unlike |
| `POST` | `/comments/` | Add comment |
| `POST` | `/connections/` | Send connection request |
| `POST` | `/connections/accept/{id}` | Accept connection |

### Messaging
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/messages/send` | Send a message |
| `GET` | `/messages/inbox` | Inbox summaries |
| `GET` | `/messages/chat/{conversation_id}` | Chat history |
| `WS` | `/messages/ws?token=<jwt>` | Real-time WebSocket |

### Alumni Requests
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/alumni-requests/` | Apply for alumni role |
| `POST` | `/alumni-requests/{id}/approve` | Approve (Admin) |
| `POST` | `/alumni-requests/{id}/reject` | Reject (Admin) |

---

## Running Tests

```bash
# Backend
cd server
pytest

# Frontend
cd client
npm run test
```

> Backend tests use SQLite by default for speed. Production targets PostgreSQL via `DATABASE_URL`.

---

## Deployment

Configured for [Render](https://render.com) via `render.yaml`:

- Python web service with auto-migration on deploy (`alembic upgrade head`)
- Managed PostgreSQL database
- Frontend deployable to Vercel or Render static sites

---

## Known Limitations

- WebSocket connections are in-memory — horizontal scaling requires a Redis pub/sub layer
- Alumni re-application after rejection is blocked by a unique DB constraint on `(user_id, college_id)`; requires schema change or row reuse
- Opportunity post RBAC is currently enforced client-side only; server-side guard pending

---

## Developer

**Noman Ahmad**
