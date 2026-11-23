# BriefBoard

**Client briefs → projects → delivery board for a creative studio.**

A client fills in a brief on the public page (what they need: branding, SMM, web, marketing, video; budget; deadline).
The studio sees it in the inbox, accepts it in one click, and it becomes a project card that moves across a
kanban board: Strategy → Design → Development → Review → Delivered.

![Board](docs/board.png)

| Public brief form | Mobile |
| --- | --- |
| ![Landing](docs/landing.png) | <img src="docs/mobile.png" width="260"> |

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | NestJS 11, TypeScript, REST, Swagger / OpenAPI |
| Database | PostgreSQL 16, TypeORM (entities + migrations) |
| Auth | JWT (Bearer), bcrypt password hashing, role guard (ADMIN / MEMBER) |
| Tests | Jest unit tests + Supertest e2e tests against a real PostgreSQL |
| Infra | Docker (multi-stage images), docker compose, GitHub Actions CI |

## Architecture

```mermaid
flowchart LR
  Browser["Next.js app<br/>(landing, login, dashboard)"] -- "REST + JWT" --> API["NestJS API<br/>auth · briefs · projects"]
  API -- TypeORM --> DB[(PostgreSQL)]
```

```
apps/
  api/                 NestJS REST API
    src/auth/          register / login / me, JwtAuthGuard, RolesGuard
    src/briefs/        public brief form endpoint, inbox, accept (transaction) / reject
    src/projects/      CRUD, stage moves with business rules, stats
    src/entities/      TypeORM entities: User, Brief, Project
    src/database/      data source, migrations, seed
    test/              e2e tests (full flow through HTTP)
  web/                 Next.js frontend
    src/app/           routes: /, /login, /dashboard
    src/components/    brief form, inbox, kanban board, new-project form
    src/lib/api.ts     typed API client
```

## Business rules worth noting

- **Accepting a brief is atomic.** Marking the brief `ACCEPTED` and creating the project run in one DB transaction
  with a row lock, so a double click or two managers at once can't create two projects (second call → `409`).
- **Board moves:** forward only one column at a time (no skipping Review), back any distance (rework).
  Enforced on the API (`stage-rules.ts`) and mirrored in the UI, which only highlights columns you can drop on.
- **Optimistic UI:** a card moves instantly; if the API refuses, it snaps back and the error is shown.
- **Validation:** DTOs with `class-validator`; unknown fields are rejected (`forbidNonWhitelisted`).
- **Roles:** any team member can work with briefs and projects; only `ADMIN` can delete projects (`403` otherwise).

## API

Swagger UI: `http://localhost:4000/docs`

| Method | Path | Auth | What it does |
| --- | --- | --- | --- |
| POST | `/auth/register` · `/auth/login` | – | returns `{ accessToken, user }` |
| GET | `/auth/me` | JWT | current user |
| POST | `/briefs` | – | public brief form |
| GET | `/briefs?status=NEW` | JWT | inbox |
| PATCH | `/briefs/:id/accept` · `/reject` | JWT | accept → creates a project |
| GET / POST | `/projects` | JWT | list / create |
| GET | `/projects/stats` | JWT | counts per stage + new briefs |
| PATCH | `/projects/:id` · `/projects/:id/stage` | JWT | edit / move on the board |
| DELETE | `/projects/:id` | ADMIN | delete |

## Run it

**With Docker** (one command):

```bash
docker compose up --build
docker compose exec api node dist/database/seed.js   # optional demo data: admin@briefboard.dev / admin12345
```

**Without Docker** (Node 22 + a local PostgreSQL):

```bash
# API
cd apps/api
cp .env.example .env          # adjust DATABASE_URL if needed
npm install
npm run migration:run
npm run seed                  # demo user admin@briefboard.dev / admin12345 + sample data
npm run start:dev             # http://localhost:4000, Swagger at /docs

# Web (second terminal)
cd apps/web
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

## Tests

```bash
cd apps/api
npm test                      # unit: stage rules, ProjectsService with a mocked repository
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/briefboard_test npm run test:e2e
```

The e2e suite walks the main flow over HTTP against a real database: register → send a public brief →
validation errors → 401 without token → accept (project created) → accept again (409) → move one column →
skip columns (400) → stats → member tries to delete (403). CI runs both suites on every push.

## What I'd add next

- React Native client for managers (the API is already client-agnostic)
- Comments and file attachments on a project, email notification when a brief arrives
- Refresh tokens in an httpOnly cookie instead of a token in `localStorage`
