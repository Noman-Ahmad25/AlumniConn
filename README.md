# AlumniConn 🎓

**A multi-tenant networking and mentorship platform connecting students and alumni within institutional boundaries, powered by semantic vector search and real-time communication.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![pgvector](https://img.shields.io/badge/pgvector-0.2.5+-336791?style=flat&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Live Demo

- **Hosted Application**: [https://alumniconn-umber.vercel.app/](https://alumniconn-umber.vercel.app/) 
- **Interactive Demo Notice**: The platform includes a self-contained showcase environment pre-seeded with synthetic institutional data, pre-configured role personas, and an in-browser demo email inbox for testing verification workflows without third-party email configuration.

---

## 💡 What AlumniConn Does

### The Problem
Traditional professional networks (such as LinkedIn) are global and noisy. Students frequently struggle to reach relevant alumni who share their exact collegiate background, degree curriculum, and departmental context. Cold outreach often goes unanswered due to lack of shared institutional trust. Conversely, universities rarely possess unified, self-serve networking platforms with real-time chat, opportunity feeds, and machine-learning-driven mentor matching tailored strictly to their own student and graduate bodies.

### The Solution
AlumniConn solves this through a **multi-tenant institutional architecture**:
- **Strict Institutional Isolation**: Each college functions as an autonomous tenant with isolated user directories, social feeds, connection graphs, and messaging channels.
- **Verified Academic Progression**: Students transition to verified alumni status through college-admin verification workflows.
- **AI-Powered Mentor Matching**: Hybrid vector search (`pgvector` + `sentence-transformers`) paired with heuristic ranking connects students with alumni based on domain expertise, career trajectories, graduation proximity, and skill overlap.
- **Real-Time Collaboration**: Instant one-on-one WebSocket messaging and rich media sharing support focused mentorship conversations.

---

## ✨ Key Features

### 🏛️ Multi-Tenant Institutional Boundaries
- **Tenant-Scoped Networks**: All posts, connection requests, profiles, and messages are partitioned by institutional identity (`college_id`). Users cannot discover or interact across tenant borders.
- **Custom Institutional Identity**: Dedicated sub-branding with institutional logos, hex color themes, and custom URLs for each approved college.
- **College Self-Registration**: Colleges submit onboarding requests reviewed and approved by platform Super Admins.

### 👥 Role-Based Capabilities (RBAC)
- **Student**:
  - Discover verified alumni within their institution via vector-similarity recommendations.
  - Send and manage connection requests.
  - Participate in the social feed (create posts, like, and comment).
  - Apply for upgraded Alumni status directly from their profile with administrative verification.
- **Alumni**:
  - Full networking and messaging privileges.
  - Publish specialized **Opportunity Posts** (jobs, internships, research grants, mentorship slots) flagged with distinct visual markers in the feed.
  - Mentor students and review inbound connection requests from their alma mater.
- **College Admin**:
  - Review and approve/reject Student → Alumni status elevation requests with administrative audit notes.
  - Monitor college-level user activity and manage institutional branding parameters.
- **Super Admin**:
  - Platform-level governance: review, approve, or reject new college onboarding applications.
  - Monitor cross-tenant health and tenant metrics.

### 📰 Centered Campus Feed & Opportunities
- Responsive desktop layout (optimized up to 850px max width) eliminating whitespace while retaining focus.
- Filter views for **All Posts** and dedicated **Opportunities**.
- Single streamlined floating action trigger (`+ Create Post`) opening modal composer with Cloudinary image upload.

### 🤝 Connections & Graph Management
- Asymmetric request lifecycle (`PENDING` → `ACCEPTED` / `REJECTED`).
- Bi-directional friendship tracking enforcing institution boundaries.

### 💬 Real-Time Messaging
- Full-duplex WebSocket communication over `/messages/ws`.
- Online/offline presence indicators.
- Instant delivery, offline message persistence, and Cloudinary image attachments.

### 🧠 Semantic AI Recommendations
- Explainable hybrid mentor recommendations combining 384-dimensional dense semantic vectors with heuristic domain scoring and human-readable explanation generation.

---

## 🏗️ Architecture

```
                                  +---------------------------------------+
                                  |         React 19 Frontend (SPA)       |
                                  |  TypeScript, Tailwind, Context API    |
                                  +-------------------+-------------------+
                                                      |
                                     HTTP REST / Auth | WebSocket (/messages/ws)
                                                      v
                                  +---------------------------------------+
                                  |            FastAPI Backend            |
                                  |  - Dependency Injection (Session/Auth)|
                                  |  - RBAC & Tenant Scoping Middleware   |
                                  |  - Event Bus & Notification Dispatch  |
                                  +---------+-------------------+---------+
                                            |                   |
                        Vector Embeddings & |                   | Image Storage
                            Relational CRUD |                   |
                                            v                   v
                    +-------------------------------+   +-------------------+
                    |      PostgreSQL 15 +          |   |  Cloudinary API   |
                    |         pgvector              |   +-------------------+
                    |  - 384-d semantic embeddings  |
                    |  - SQL tenant-scoped query    |
                    +-------------------------------+
                                            ^
                                            |
                               +------------+------------+
                               |                         |
                    +----------+----------+   +----------+----------+
                    |  In-Memory Demo     |   |   Real Email Mode   |
                    |  Email Store & API  |   |  (Resend API / SMTP)|
                    +---------------------+   +---------------------+
```

---

## 🏢 Multi-Tenancy & Authorization

Tenant isolation is enforced across both data storage and business logic:

1. **Database Partitioning**:
   - Entities (`User`, `Post`, `Connection`, `Conversation`, `CollegeBranding`) maintain foreign key references to `colleges.id`.
   - Unique constraints scope usernames and email addresses within individual institutions:
     ```python
     UniqueConstraint('email', 'college_id', name='uq_users_email_college')
     UniqueConstraint('username', 'college_id', name='uq_users_username_college')
     ```
   - Platform Super Admins exist globally without a tenant assignment (`college_id = None`).

2. **Authorization Guards**:
   - FastAPI dependency `require_roles([UserRole.STUDENT, UserRole.ALUMNI, ...])` validates JWT claims against requested endpoints.
   - Database queries explicitly scope records by `current_user.college_id`, enforcing tenant boundaries at the application query and service layers even if an entity ID is known.

3. **Student → Alumni Verification State Machine**:
   - Registration selecting the Alumni persona defaults the account to `student` role with `alumni_status = "PENDING"`.
   - College Admins inspect graduation documentation through `/admin/alumni-requests` and approve or reject the request.
   - Upon approval, the user's role is atomically migrated to `alumni`, unlocking opportunity posting privileges.

---

## 🧠 AI Recommendation System

AlumniConn features a hybrid recommendation engine combining dense semantic vector search with deterministic domain heuristics:

### 1. Vector Embeddings (`sentence-transformers` + `pgvector`)
- **Model**: `all-MiniLM-L6-v2` produces compact 384-dimensional dense semantic vectors.
- **Semantic Text Composition**: Synthesizes a structured profile representation from the user's headline, bio, major, skills, interests, and current industry.
- **SHA-256 Hashing**: Embeddings are only regenerated when the computed semantic hash of the profile changes, preventing unnecessary neural model inferences.
- **PostgreSQL Vector Storage & Tenant Filtering**: Embeddings are stored in a `Vector(384)` column using `pgvector` and queried with the cosine distance operator (`<=>`). Candidate profile retrieval applies explicit tenant filtering (`User.college_id == current_user.college_id`) at the SQL query level before similarity ranking.

### 2. Hybrid Scoring Algorithm
Recommendations calculate a composite match score `M ∈ [0, 1]` for candidate alumni within the same college:
$$\text{Score} = w_v \cdot S_{\text{cosine}} + w_s \cdot J(\text{skills}) + w_i \cdot J(\text{interests}) + w_m \cdot \mathbb{I}(\text{major}) + w_{\text{ind}} \cdot \mathbb{I}(\text{industry}) + P(\Delta \text{grad})$$

- **Cosine Vector Similarity**: Captures high-level latent semantic alignment between career goals and background.
- **Jaccard Similarity**: Evaluates precise keyword overlaps across listed skills and personal interests.
- **Domain Indicators**: Binary boosts for identical collegiate majors and target industries.
- **Gaussian Decay Penalty**: Proximity weighting based on graduation year gap ($\Delta \text{grad}$).

### 3. Explainable Matches
Recommendations return human-readable justifications generated from deterministic feature analysis (e.g., *"Shared background in Computer Science"*, *"Common expertise in Distributed Systems & Kubernetes"*).

---

## ⚡ Real-Time Communication

- **WebSocket Protocol**: Connected clients authenticate via query token handshake at `/messages/ws?token=<JWT>`.
- **Connection Pooling**: Managed via `ConnectionManager` handling thread-safe registration, active socket tracking, and clean disconnection handling.
- **Presence Tracking**: `PresenceManager` monitors active socket connections per user ID and broadcasts real-time online/offline statuses across mutual connections.
- **Persistence & Media**: Inbound chat payloads are persisted in PostgreSQL (`Conversation` and `Message` tables) with support for Cloudinary-hosted image attachments.

---

## 🔐 Authentication & Email Subsystem

AlumniConn implements a flexible dual-mode email and authentication pipeline designed for development, testing, and production environments:

### Authentication Pipeline
- **Password Complexity**: Enforced on registration and resets (minimum 8 characters, requiring at least one uppercase letter, one lowercase letter, one numeric digit, and one special character).
- **JWT Cryptography**: Signed using HMAC-SHA256 (`HS256`) with configurable expiration windows.
- **Verification Tokens**: Ephemeral signed tokens for email activation and password resets.

### Dual-Mode Email Subsystem
Configured via `EMAIL_MODE` (`demo` | `real`) and `EMAIL_PROVIDER` (`demo` | `smtp` | `resend`):

| Mode | Provider | Behavior |
| :--- | :--- | :--- |
| **`demo`** | `demo` | **Zero external dependencies.** Outgoing emails (verification links, password reset codes) are intercepted by an in-memory `DemoEmailStore`. The frontend renders a dedicated `<DemoEmailInbox />` allowing evaluators to preview and click verification links directly in the browser. |
| **`real`** | `resend` | Dispatches production HTML templates via the official Resend REST API using `RESEND_API_KEY`. |
| **`real`** | `smtp` | Dispatches emails over standard TLS/STARTTLS SMTP (e.g., AWS SES, SendGrid, Gmail) using configured host credentials. |

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 (`react`, `react-dom`)
- **Routing**: React Router DOM 7
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4, PostCSS, Autoprefixer
- **Build Tool**: Vite 8 with React Compiler support
- **HTTP Client**: Axios with automatic JWT interceptors
- **Testing**: Vitest, React Testing Library, jsdom

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn (ASGI)
- **Database ORM**: SQLAlchemy 2.0
- **Database Migrations**: Alembic
- **Relational DB**: PostgreSQL 15+ with `pgvector`
- **Vector Search & ML**: `sentence-transformers`, `pgvector`, PyTorch, Scikit-learn
- **Authentication**: `python-jose` (JWT), `passlib` (Argon2 / bcrypt)
- **Validation**: Pydantic v2, `pydantic-settings`, `email-validator`
- **Media Storage**: Cloudinary Python SDK
- **Email Delivery**: Resend SDK, standard SMTP, Jinja2 template engine

---

## 📁 Project Structure

```
AlumniConn/
├── client/                           # React 19 Frontend Application
│   ├── src/
│   │   ├── app/                      # App root, router, layout definitions
│   │   ├── features/                 # Domain-driven feature modules
│   │   │   ├── admin/                # College & Super Admin management
│   │   │   ├── auth/                 # Login, Registration, Demo Email Inbox
│   │   │   ├── college/              # College discovery & onboarding
│   │   │   ├── connections/          # Connection graphs & requests
│   │   │   ├── feed/                 # Campus posts & opportunity stream
│   │   │   ├── messages/             # WebSocket chat & conversation lists
│   │   │   ├── notifications/        # Activity feeds & alerts
│   │   │   ├── profile/              # Career profile & Alumni status modal
│   │   │   └── recommendations/      # AI mentor discovery cards
│   │   ├── layouts/                  # AppShell, AuthLayout, SuperAdminLayout
│   │   ├── providers/                # Tenant context and auth state providers
│   │   ├── services/                 # Axios client and API endpoints
│   │   ├── shared/                   # Shared UI primitives, icons, modals
│   │   ├── test/                     # Vitest test suites
│   │   └── utils/                    # Password validation and error handlers
│   ├── package.json
│   └── vite.config.ts
│
├── server/                           # FastAPI Backend Application
│   ├── app.py                        # FastAPI application entrypoint & routers
│   ├── alembic.ini                   # Alembic migration configuration
│   ├── migrations/                   # Schema migration versions
│   │   └── versions/                 # 293e6cac4656_db_initialization.py
│   ├── scripts/                      # Data seeding & demo setup scripts
│   │   ├── seed_demo.py              # Realistic multi-tenant showcase seeder
│   │   └── demo_content.py           # Synthetic collegiate data & posts
│   ├── src/
│   │   ├── database/                 # SQLAlchemy session and Base models
│   │   ├── models/                   # PostgreSQL table entities
│   │   ├── routes/                   # REST and WebSocket endpoints
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── services/                 # Domain services (auth, AI, email, posts)
│   │   │   └── email/                # Email provider abstractions (demo/resend/smtp)
│   │   ├── templates/emails/         # Jinja2 HTML transactional templates
│   │   └── utils/                    # Embeddings, presence, RBAC, tokens
│   ├── tests/                        # Integration and unit test runners
│   └── requirements.txt              # Pinned Python dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher
- **PostgreSQL**: v15 or higher with `pgvector` extension
- **Git**

---

### Environment Variables

#### Backend (`server/.env`)
Create `server/.env` with the following variables:

```env
# Database Connection (with pgvector support)
DATABASE_URL=postgresql://username:password@localhost:5432/alumniconn

# Security & JWT
SECRET_KEY=your-secure-random-secret-key-at-least-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24

# Super Admin Initialization
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=your-secure-super-admin-password

# Frontend Origin (CORS)
FRONTEND_URL=http://localhost:5173

# Email Service Configuration
EMAIL_MODE=demo                      # 'demo' captures emails in-memory; 'real' sends emails
EMAIL_PROVIDER=demo                  # 'demo' | 'resend' | 'smtp'

# Real Email Credentials (required only if EMAIL_MODE=real)
RESEND_API_KEY=                      # Required if EMAIL_PROVIDER=resend
SMTP_HOST=                           # Required if EMAIL_PROVIDER=smtp
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_USE_TLS=True

# Cloudinary Storage (optional for local development, media falls back to avatars)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Frontend (`client/.env`)
Create `client/.env` with:

```env
VITE_API_URL=http://localhost:8000
```

---

### Database Setup

1. **Create the Database and Enable `pgvector`**:
   ```sql
   CREATE DATABASE alumniconn;
   \c alumniconn
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Apply Alembic Migrations**:
   ```bash
   cd server
   alembic upgrade head
   ```

---

### Backend Setup

```bash
cd server

# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate      # On Windows: .venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run initial database migrations
alembic upgrade head

# Seed the showcase demo environment (institutions, users, posts, chats)
python -m scripts.seed_demo
```

---

### Frontend Setup

```bash
cd client

# Install NPM packages
npm install
```

---

### Running the Application

1. **Start the FastAPI Backend**:
   ```bash
   cd server
   source .venv/bin/activate
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```
   *API Swagger documentation will be available at `http://localhost:8000/docs`.*

2. **Start the Vite Frontend**:
   ```bash
   cd client
   npm run dev
   ```
   *Frontend application will be accessible at `http://localhost:5173`.*

---

## 🎭 Demo Data & Personas

The database seeder (`scripts/seed_demo.py`) generates a comprehensive showcase environment using **fictional institutions** and realistic synthetic network activity:

### Showcase Institutions
- **Northbridge Institute of Technology** — Primary active campus tenant.
- **Apex Institute of Technology**
- **Crestview University**
- **Solaris Institute of Technology**

### Showcase Evaluation Personas
For rapid evaluation, the application provides an interactive **1-Click Demo Account Picker** directly on the sign-in page (`/login`), enabling instant authentication into any role without requiring manual password entry:

| Persona Role | Scope / Context | Persona Profile | One-Click Demo Access |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Platform-Wide Governance | Platform metrics, university onboarding review, cross-campus administration | Available on Sign In |
| **College Admin** | Campus Administration | Campus directory, student moderation, alumni status approvals | Available on Sign In |
| **Alumni (Mentor)** | Verified Alumna / Mentor | Senior AI Engineer profile, alumni connections, career posts, mentorship | Available on Sign In |
| **Student** | Undergraduate Student | CS student profile, alumni directory discovery, recommendations, connection requests | Available on Sign In |

*To reset and regenerate clean showcase data at any time, run:*
```bash
python -m scripts.seed_demo --reset
```

---

## 🧪 Testing

### Frontend Test Suites
The frontend utilizes Vitest with React Testing Library:
```bash
cd client

# Run all unit and integration tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Verify production build compilation
npm run build
```

### Backend Test Suites
The backend includes automated integration and audit test runners:
```bash
cd server
source .venv/bin/activate

# Execute authentication, demo email, and registration test runner
python tests/test_demo_auth_email_runner.py

# Execute full system audit test runner
python tests/test_full_system_audit.py

# Run standard pytest suite
pytest
```

---

## 🚀 Deployment

The project is structured for straightforward deployment on cloud platforms:

- **Backend (Render / Railway / Container VM)**:
  - Can be run as a containerized Docker service using `server/DockerFile` or directly as a Python web service with start command:
    `uvicorn app:app --host 0.0.0.0 --port $PORT`
  - Requires a managed PostgreSQL instance with `pgvector` enabled (e.g. Neon, Supabase, AWS RDS, or Render Postgres).
- **Frontend (Vercel / Netlify / Cloudflare Pages)**:
  - Static SPA deployable with build command: `npm run build`
  - Output directory: `dist`
  - Rewrites are pre-configured in `client/vercel.json` for client-side routing.

---

## 📢 Showcase Disclaimer

> **Notice**: AlumniConn is an open-source educational and technical demonstration platform. All institutions (such as *Northbridge Institute of Technology*, *Crestview University*, and *Solaris Tech*), corporate affiliations, profile data, discussion posts, and member personas presented in the seeded demo environment are purely synthetic and fictional. Any resemblance to real institutions, organizations, or individuals is coincidental.

---

## 👤 Author & License

- **Author / Maintainer**: [Noman Ahmad](https://github.com/Noman-Ahmad25)
- **Repository**: [https://github.com/Noman-Ahmad25/AlumniConn](https://github.com/Noman-Ahmad25/AlumniConn)
- **License**: Released under the [MIT License](LICENSE).
