<a id="top"></a>

# Backend Architecture

Breadcrumbs: [Architecture](docs/markdown/architecture/index.md) › Backend

Section TOC:
- Overview
- Technology Stack
- Folder Structure
- Data Model & Schema
- Database & ORM
- API Endpoints
- Authentication
- Configuration
- Deployment Options
- Local Development
- Error Handling & Logging
- Security Considerations
- Scalability & Performance
- Roadmap

## Overview
The backend is prepared to support future features such as data sync, multi-device accounts, and optional server-side services. The app currently works entirely client-side, but the backend can be enabled to provide persistence on Neon (PostgreSQL), authentication, and richer integrations.

Key points:
- Client-first: the frontend functions without a backend.
- Optional server: an Express server with routes is scaffolded and ready for future use.
- Shared types: the data contracts live in a shared schema for consistency.

Relevant sources:
- [server/index.ts](server/index.ts)
- [server/routes.ts](server/routes.ts)
- [server/storage.ts](server/storage.ts)
- [server/utils.ts](server/utils.ts)
- [server/vite.ts](server/vite.ts)
- [shared/schema.ts](shared/schema.ts)
- [drizzle.config.ts](drizzle.config.ts)

## Technology Stack
- **Runtime:** Node.js + Express (prepared)
- **Database:** Neon (serverless PostgreSQL)
- **ORM:** Drizzle ORM with type-safe schema and migrations
- **Auth (planned):** Passport (sessions/cookies), with optional OAuth providers
- **Bundling:** Vite/esbuild for server (see [server/vite.ts](server/vite.ts))
- **Config:** Environment variables via `.env` or Vercel/host secrets

## Folder Structure
- [server/index.ts](server/index.ts): Entrypoint for the Express app setup.
- [server/routes.ts](server/routes.ts): Route registrations and controllers.
- [server/storage.ts](server/storage.ts): Data access abstraction (Local-first now; DB-ready design).
- [server/utils.ts](server/utils.ts): Helpers (e.g., error wrappers, validation).
- [server/vite.ts](server/vite.ts): Server bundling/build configuration.
- [shared/schema.ts](shared/schema.ts): Shared types and Drizzle schema used by both client and server.
- [drizzle.config.ts](drizzle.config.ts): Drizzle configuration for migrations and codegen.

## Data Model & Schema
All core entities are defined centrally to keep client and server aligned. See [shared/schema.ts](shared/schema.ts).

Typical entities (examples; confirm in schema):
- Foods and nutrients metadata
- Meals and diary entries
- Shopping lists and items
- User profile and preferences

## Database & ORM
- Drizzle ORM maps tables declared in [shared/schema.ts](shared/schema.ts) and uses [drizzle.config.ts](drizzle.config.ts) for migrations.
- Neon provides serverless Postgres with HTTP connectivity suitable for modern hosting.
- Recommended flow:
	1. Define/adjust tables in `shared/schema.ts`.
	2. Generate and apply migrations via Drizzle.
	3. Use a thin repository layer in [server/storage.ts](server/storage.ts).

## API Endpoints
Routes are defined in [server/routes.ts](server/routes.ts). Suggested structure:
- `GET /api/foods`: list foods with pagination and search.
- `POST /api/foods`: add or update food.
- `GET /api/meals`: list meals/diary entries.
- `POST /api/meals`: create/update meals.
- `GET /api/shopping-lists`: list user shopping lists.
- `POST /api/shopping-lists`: create/update lists.

Notes:
- Controllers should validate input and return typed DTOs matching [shared/schema.ts](shared/schema.ts).
- Consider ETags or `Last-Modified` headers for cacheable resources.

## Authentication
Planned with Passport and cookie-based sessions:
- **Strategies:** Email/password first; optionally OAuth (Google/Apple).
- **Sessions:** Signed cookies + server session store (e.g., Postgres-backed or Redis).
- **Protection:** CSRF tokens for state-changing requests; CORS configured for mobile/PWA origins.

## Configuration
Environment variables (examples):
- `DATABASE_URL`: Neon Postgres connection string
- `SESSION_SECRET`: Cookie/session signing secret
- `NODE_ENV`: `development` or `production`
- Optional provider secrets (e.g., `GOOGLE_CLIENT_ID`)

Drizzle setup: see [drizzle.config.ts](drizzle.config.ts).

## Deployment Options
Two common approaches:
1. **Serverless functions (Vercel):** Port Express routes into Vercel functions or use a lightweight adapter. Good for scale-to-zero, but mind cold starts and connection pooling to Neon.
2. **Dedicated Node server:** Host Express on a container/VM (e.g., Azure, Fly.io, Render). Manage long-lived connections and sessions explicitly.

Mobile + Backend:
- The Capacitor app can talk to the backend over HTTPS.
- Keep APIs stateless; use JWTs for mobile if preferred over cookies.

## Local Development
Typical workflow (adjust to your scripts):

```bash
# Install deps
npm install

# If you have a dev server script
npm run dev:server

# Or run with ts-node/esbuild (add a script if missing)
npm run build:server && node dist/server/index.js
```

If scripts are missing, wire up [server/vite.ts](server/vite.ts) or add a simple `ts-node` runner for [server/index.ts](server/index.ts).

## Error Handling & Logging
- Use centralized error middleware in Express with consistent error shapes.
- Return helpful `4xx` messages; avoid leaking internals in `5xx`.
- Consider structured logging (e.g., `pino`) with request correlation IDs.

## Security Considerations
- **Input validation:** Validate payloads against DTOs; sanitize strings.
- **Auth & sessions:** Use secure cookies (`Secure`, `HttpOnly`, `SameSite`); rotate secrets.
- **Transport:** Enforce HTTPS; HSTS headers.
- **CORS:** Restrict origins; allow only needed methods/headers.
- **Rate limiting:** Protect critical endpoints against abuse.
- **Secrets management:** Use environment/hosted secrets, never hardcode.

## Scalability & Performance
- Prefer stateless APIs; keep session footprint minimal.
- Connection pooling to Neon; reuse clients across requests.
- Cache hot reads when practical; paginate large lists.
- Monitor P95/P99 latency and error rates.

## Roadmap
- Enable auth and per-user server persistence.
- Add sync between local data and server (conflict resolution for offline-first).
- Migrate selected features from LocalStorage to API-backed storage.
- Introduce background jobs for reminders/analytics if needed.

---

[Back to top](#top)
# Architettura · Backend (opzionale)

## Stack
- Express ^4.21.2
- Drizzle ORM ^0.39.1 + Drizzle Kit ^0.31.4
- Neon serverless PostgreSQL ^0.10.4
- Sessione: `express-session` + `connect-pg-simple`

## Stato attuale
- Backend predisposto ma non collegato al frontend (app lavora offline)
- Endpoint e storage in `server/` e `shared/schema.ts`

## Evoluzione
- Autenticazione (Passport Local), sync multi-dispositivo
- CRUD alimenti e pasti su DB
