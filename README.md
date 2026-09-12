# Product Inventory Management

A small product inventory application: a REST API built with Node.js/TypeScript and a Vue 3 single-page app that consumes it. The two projects live in one repository but are fully independent — each has its own `package.json` and can be installed, run, and deployed on its own.

Both the API and the UI run with a single command via Docker Compose, or manually with Bun and a local PostgreSQL instance.

---

## Features

- **Product CRUD** — create, list, read, update (PATCH), and delete products.
- **Image upload** — one image per product (`multipart/form-data`), stored on local disk, served back as static files. Type (jpg/png/webp), size (5 MB), and file signature (magic bytes) are validated; replacing or deleting a product removes the previous file.
- **List with server-side pagination, search, sorting, and filters** — page/limit, search by name or SKU, filter by category and status, sort by name/price/stock/createdAt/updatedAt.
- **Category suggestions** — `GET /products/categories` returns the distinct categories used by existing products.
- **Seed data** — 20 sample products across five categories, including low-stock and inactive items.
- **Health endpoint** — `GET /health` reports API status and checks the database connection.
- **Hardening** — helmet security headers, upload endpoint rate limiting (20 requests / 15 minutes per IP → `429`), uppercase SKU normalization, duplicate SKU → `409`.
- **API collection** — a Bruno collection (`backend/bruno/`) covering every endpoint, runnable from the CLI or the Bruno app.
- **Docker** — `docker compose up --build` starts PostgreSQL, the API, and the frontend (nginx). Uploaded files and database data persist across restarts.
- **Frontend UX** — monochrome responsive UI, client-side validation, image preview and upload progress, loading/error/empty states, toasts, delete confirmation, and filter/sort/pagination state synced to the URL (deep-linkable).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime / package manager | [Bun](https://bun.sh) (backend and frontend tooling) |
| Backend | Node.js + TypeScript, [Express 5](https://expressjs.com) (`^5.2.1`), strict TypeScript (`^7`) |
| Validation | [Zod 4](https://zod.dev) (`^4.6.2`) |
| ORM / database | [Prisma 7](https://www.prisma.io) (`^7.10.0`) with the `@prisma/adapter-pg` driver adapter, PostgreSQL 17 |
| Uploads | [Multer 2](https://github.com/expressjs/multer) (`^2.3.0`), local disk storage |
| Security | [helmet 8](https://helmetjs.github.io) (`^8.3.0`), [express-rate-limit 8](https://express-rate-limit.mintlify.app) (`^8.7.0`) |
| Frontend | [Vue 3](https://vuejs.org) (`^3.5.40`), [Vite 8](https://vite.dev) (`^8.1.5`), TypeScript (`~6`) |
| Router / state | [Vue Router 5](https://router.vuejs.org) (`^5.2.0`), [Pinia 4](https://pinia.vuejs.org) (`^4.0.2`) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) (`^4.3.3`) via `@tailwindcss/vite` |
| HTTP client | [Axios](https://axios-http.com) (`^1.20.0`) |
| Containers | `oven/bun:1-alpine` (build), `nginx:alpine` (frontend runtime), `postgres:17-alpine` |

> Frontend engines: Node `^22.18.0 || >=24.12.0` (only needed if you build with Node instead of Bun).

---

## Repository Structure

```
.
├── backend
│   ├── bruno/                  # Bruno API collection (Health + 8 product requests)
│   ├── prisma/
│   │   ├── migrations/         # SQL migrations (applied with prisma migrate deploy)
│   │   ├── schema.prisma       # Product model + ProductStatus enum
│   │   └── seed.ts             # idempotent seed, 20 sample products
│   ├── src/
│   │   ├── config/env.ts       # Zod-validated environment configuration
│   │   ├── lib/                # app-error, http helpers, prisma, upload, rate-limit
│   │   ├── modules/product/    # product.schema / service / controller / routes
│   │   ├── routes.ts           # /health + mounts /products
│   │   ├── app.ts              # middleware pipeline
│   │   └── server.ts           # listen + graceful shutdown
│   ├── uploads/                # uploaded images (kept with .gitkeep)
│   ├── Dockerfile
│   ├── prisma7.config.ts       # Prisma 7 config (schema, migrations, seed)
│   └── package.json
├── frontend
│   ├── src/
│   │   ├── assets/             # Tailwind entry CSS + placeholder image
│   │   ├── components/         # ui/ (AppButton, AppModal, ...), layout/, product/
│   │   ├── composables/        # useToast, useProductModals, useProductListQuery
│   │   ├── lib/                # axios client + error mapping, format helpers, constants
│   │   ├── router/
│   │   ├── stores/             # Pinia product store
│   │   ├── types/
│   │   ├── views/              # ProductListView, NotFoundView
│   │   ├── App.vue
│   │   └── main.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example                # compose variables (copy to .env)
└── README.md
```

---

## Prerequisites

- **Bun ≥ 1.3** — https://bun.sh (used for both projects)
- **Docker + Docker Compose** — recommended; the quickest way to run everything
- **PostgreSQL 17** — only needed for the manual backend setup (a container works fine)

---

## Getting Started

Clone the repository and move into it:

```bash
git clone https://github.com/handikatriarlan/product-inventory-management.git
cd product-inventory-management
```

Then choose one of the two setup paths below: [Quick Start (Docker)](#quick-start-docker) (recommended — runs the database, API, and frontend together) or [Manual Setup](#manual-setup).

---

## Quick Start (Docker)

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec backend bun run db:seed   # optional: 20 sample products
```

Then open:

| URL | Description |
|-----|-------------|
| http://localhost:8080 | Frontend (nginx) |
| http://localhost:3000 | API |
| http://localhost:3000/health | Health check |
| http://localhost:8080/products | Frontend route, also served directly (deep-link/refresh) |

What happens on startup:

1. `db` (PostgreSQL 17) starts and becomes healthy.
2. `backend` waits for the database, runs `prisma migrate deploy`, then starts the API.
3. `frontend` is built with Vite and served by nginx; nginx proxies `/products`, `/uploads`, and `/health` to the backend (same-origin, so no CORS configuration is needed).

Persistence:

- **Database** — named volume `pgdata`. Data survives `docker compose restart` and `docker compose down`.
- **Uploads** — bind mount `./backend/uploads`, so files are visible on your host and survive restarts.

Useful commands:

```bash
docker compose ps                  # service status
docker compose logs -f backend     # follow API logs
docker compose exec backend bun run db:seed
docker compose down                # stop (keeps volumes)
docker compose down -v             # stop and wipe the database volume
```

Ports can be changed in `.env` (`BACKEND_PORT`, `FRONTEND_PORT`).

---

## Manual Setup

### 1. Database

Any PostgreSQL 17 instance works. With Docker:

```bash
docker run -d --name seakun-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=db_inventory \
  -p 5432:5432 \
  postgres:17-alpine
```

### 2. Backend

```bash
cd backend
bun install
cp .env.example .env          # defaults already point at localhost:5432/db_inventory
bun run db:migrate            # creates the schema and generates the Prisma client
bun run db:seed               # optional: 20 sample products
bun run dev                   # http://localhost:3000 (hot reload)
```

Environment: see [Environment Variables](#environment-variables). `DATABASE_URL` is required; everything else has a sensible default.

### 3. Frontend

```bash
cd frontend
bun install
cp .env.example .env          # optional in dev; sets the proxy target
bun run dev                   # http://localhost:5173
```

In development Vite proxies `/products`, `/uploads`, and `/health` to `VITE_API_BASE_URL` (default `http://localhost:3000`), so the axios client uses relative URLs and no CORS setup is required. For a production build served from a different origin, set `VITE_API_BASE_URL` to the API base URL **before** `bun run build`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — (required) | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/db_inventory?schema=public` |
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | `development` or `production` (production hides internal error messages) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed origin when the API is called cross-origin |
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded images |
| `MAX_UPLOAD_SIZE_MB` | `5` | Maximum image size in MB |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3000` (dev example) | API base URL. **Leave empty** for same-origin deployments (nginx proxies the API paths). In dev it is also used as the Vite proxy target. |

### Docker Compose (root `.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `POSTGRES_DB` | `db_inventory` | Database name |
| `BACKEND_PORT` | `3000` | Host port for the API |
| `FRONTEND_PORT` | `8080` | Host port for the frontend |
| `VITE_API_BASE_URL` | empty | Baked into the frontend build; empty means same-origin via nginx |

---

## Database & Migrations

The single `Product` model (plus the `ProductStatus` enum) is defined in `backend/prisma/schema.prisma`:

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `sku` | string | Required, unique, normalized to uppercase |
| `name` | string | Required, 1–200 chars |
| `description` | string? | Optional, max 2000 chars |
| `price` | Decimal(12,2) | Required, ≥ 0 |
| `stock` | integer | Required, ≥ 0 |
| `category` | string? | Optional free text, max 100 chars |
| `status` | enum | `ACTIVE` (default) or `INACTIVE` |
| `imageUrl` | string? | Relative path such as `/uploads/<uuid>.png` |
| `createdAt` / `updatedAt` | datetime | Managed automatically |

`sku` and `status` are the two extra fields added on top of the brief's model — a SKU makes inventory records identifiable, and `status` allows hiding discontinued products without deleting them.

Commands (run inside `backend/`):

```bash
bun run db:migrate     # prisma migrate dev — create/apply migrations in development
bun run db:deploy      # prisma migrate deploy — apply migrations (used by Docker)
bun run db:generate    # regenerate the Prisma client
bun run db:seed        # reset + insert the 20 sample products (idempotent)
bun run db:studio      # browse data with Prisma Studio
```

Prisma 7 stores CLI configuration in `backend/prisma7.config.ts` (schema path, migrations path, seed command, datasource URL). The generated client lives in `backend/src/generated/prisma` and is not committed.

---

## API Reference

Base URLs: `http://localhost:3000` (manual) or `http://localhost:8080` through nginx (Docker). All endpoints are mounted at the root — there is no `/api` prefix.

### Endpoints

| Method | Endpoint | Description | Success |
|--------|----------|-------------|---------|
| GET | `/health` | API status + database connectivity | `200` (or `503` when the database is down) |
| GET | `/products` | List products (pagination, search, sort, filters) | `200` |
| GET | `/products/categories` | Distinct product categories | `200` |
| GET | `/products/:id` | Get one product | `200` |
| POST | `/products` | Create a product | `201` |
| PATCH | `/products/:id` | Update a product (partial) | `200` |
| POST | `/products/:id/image` | Upload/replace the product image (`multipart/form-data`, field `image`) | `200` |
| DELETE | `/products/:id` | Delete a product (and its image file) | `204` |
| GET | `/uploads/:filename` | Serve an uploaded image | `200` |

### Response envelopes

Single resource:

```json
{ "data": { "id": "…", "sku": "SKU-0001", "price": 12500000, "…": "…" } }
```

List (note the `meta` object):

```json
{
  "data": [ { "…": "…" } ],
  "meta": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request tidak valid",
    "details": [ { "path": "price", "message": "Harga tidak boleh negatif" } ]
  }
}
```

`price` is returned as a number with at most 2 decimals. `imageUrl` is a relative path (`/uploads/<uuid>.<ext>`), so it works from any origin that proxies `/uploads`.

### List query parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–100 | `10` | |
| `search` | string | — | Case-insensitive match on `name` **or** `sku` |
| `category` | string | — | Exact, case-insensitive |
| `status` | `ACTIVE` \| `INACTIVE` | — | |
| `sortBy` | `name` \| `price` \| `stock` \| `createdAt` \| `updatedAt` | `createdAt` | |
| `order` | `asc` \| `desc` | `desc` | |

Invalid values (including non-numeric `page`/`limit`, repeated parameters, and unknown sort fields) are rejected with `400 VALIDATION_ERROR`.

### Error codes

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Request body/query/params fail validation |
| `NOT_FOUND` | 404 | Product or route does not exist |
| `CONFLICT` | 409 | Duplicate `sku` |
| `PAYLOAD_TOO_LARGE` | 413 | Image exceeds `MAX_UPLOAD_SIZE_MB` |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | File is not a valid jpg/png/webp image |
| `TOO_MANY_REQUESTS` | 429 | Upload rate limit exceeded (20 requests / 15 minutes per IP) |
| `INTERNAL_ERROR` | 500 | Unexpected error |
| `SERVICE_UNAVAILABLE` | 503 | Database unreachable (`/health`) |

### Examples

List with search, filters, and sorting:

```bash
curl "http://localhost:3000/products?page=1&limit=10&search=meja&category=Furniture&status=ACTIVE&sortBy=price&order=asc"
```

Create:

```bash
curl -X POST http://localhost:3000/products \
  -H 'Content-Type: application/json' \
  -d '{"sku":"SKU-1001","name":"Standing Desk","description":"Height-adjustable desk.","price":2499000,"stock":8,"category":"Furniture"}'
```

Upload an image (field name `image`):

```bash
curl -X POST http://localhost:3000/products/<id>/image -F "image=@/path/to/photo.png"
```

Update and delete:

```bash
curl -X PATCH http://localhost:3000/products/<id> -H 'Content-Type: application/json' -d '{"price":2299000,"status":"INACTIVE"}'
curl -X DELETE http://localhost:3000/products/<id> -i
```

### API collection (Bruno)

A ready-to-run collection lives in `backend/bruno/` (environment `Local`, base URL `http://localhost:3000`). It covers health, list (plain and filtered), create, get, update, image upload, delete, and categories — with assertions for each. `productId` is set automatically after `Create Product`, so the requests can be run in order.

```bash
cd backend/bruno
bunx @usebruno/cli run --env Local
```

You can also open the folder in the [Bruno app](https://www.usebruno.com) and run requests individually.

---

## Frontend Notes

- `GET /products` (the product list) is the only page; creating, editing, and viewing a product open in accessible modals on top of it. This keeps navigation state (filters, sorting, pagination) intact while working with a product.
- List filters, sorting, and pagination are reflected in the URL query string, so the view is deep-linkable and survives reloads and browser back/forward. Typing in the search box replaces the history entry (debounced 300 ms); other changes push new entries.
- Client-side validation mirrors the server rules (required fields, price/stock ranges, image type/size) and server errors are mapped back to the relevant fields (for example a duplicate SKU message under `sku`).
- Image preview before upload, `XHR` upload progress, toasts for success/failure, delete confirmation, and dedicated loading/error/empty states.
- A placeholder image is shown when a product has no image or the image fails to load.
- The UI is intentionally monochrome (black/white plus neutral grays) with sharp, editorial styling. UI copy and API error messages are in Indonesian.

---

## Assumptions & Trade-offs

1. **`sku` added (required, unique)** — duplicate values return `409`. SKUs are trimmed and uppercased, so `sku-1` and `SKU-1` are the same value.
2. **`status` added** (`ACTIVE`/`INACTIVE`, default `ACTIVE`) — allows soft-retiring products; list can filter by it.
3. **`price` handling** — stored as PostgreSQL `Decimal(12,2)`, returned by the API as a number with at most 2 decimals (JavaScript has no native decimal type; sums of money are not performed server-side).
4. **`category` is free text** — no separate categories table. `GET /products/categories` returns distinct values for dropdown suggestions.
5. **`imageUrl` is relative** (`/uploads/<filename>`) — works for both dev proxy and production nginx.
6. **Upload validation** — one file, max 5 MB (`MAX_UPLOAD_SIZE_MB`), mime type restricted to jpeg/png/webp, and the file's first bytes are checked (magic bytes) so a renamed non-image is rejected with `415`.
7. **Uploaded filenames are random UUIDs** with the original extension; the original name is not reused.
8. **Old images are deleted** from disk when a product image is replaced or the product is deleted.
9. **No authentication/authorization** — explicitly not required by the brief.
10. **No automated tests** — a deliberate scope decision for this exercise; quality is backed by strict TypeScript, `bun run typecheck` / `bun run type-check`, `bun run build`, and manual end-to-end verification (including the Bruno collection).
11. **`DELETE` returns `204`** with no response body.
12. **Endpoints are mounted at the root** (no `/api` prefix), matching the brief's endpoint table.
13. **`PATCH` is implemented** for updates (the brief allows `PUT` or `PATCH`); the frontend sends only the fields it changes.
14. **Upload is a separate endpoint** (`POST /products/:id/image`) as specified by the brief. The create/edit modal therefore performs two calls when an image is selected: save the product, then upload the image. If the upload fails, the product is kept and the user is notified.
15. **Upload rate limiting uses an in-memory store** (`20 requests / 15 minutes / IP`). It is per-process; a multi-instance deployment should switch to a shared store (for example Redis).
16. **Frontend CRUD uses modals rather than separate pages.** The brief calls them "pages/views"; using modals is a deliberate UX trade-off that keeps list state (search, filters, pagination) alive. All functionality — including image upload and validation — is identical.
17. **Docker frontend build runs `vite build` directly** (`bun run build-only`). `vue-tsc`/Volar does not run correctly inside the container, so the Docker build does not type-check SFCs; type checking runs locally/CI via `bun run build`.
18. **nginx serves `index.html` for browser navigations under `/products`** (based on `Accept: text/html`) while proxying JSON/XHR requests to the API — otherwise deep links like `/products` would be shadowed by the API proxy.
19. **`/health` checks the database** and returns `503 SERVICE_UNAVAILABLE` when it is unreachable.
20. **Seed data is manual** (`bun run db:seed`) and idempotent: it clears the table and re-inserts 20 products, so it never silently duplicates data.

---

## Available Scripts

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the API with hot reload |
| `bun run start` | Start the API once |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run db:migrate` | Create/apply migrations in development |
| `bun run db:deploy` | Apply pending migrations (production/Docker) |
| `bun run db:generate` | Regenerate the Prisma client |
| `bun run db:seed` | Reset and insert the 20 sample products |
| `bun run db:studio` | Open Prisma Studio |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `bun run dev` | Vite dev server at http://localhost:5173 |
| `bun run build` | Type-check (`vue-tsc`) then build for production |
| `bun run build-only` | Build without type-checking (used by Docker) |
| `bun run preview` | Preview the production build |
| `bun run type-check` | `vue-tsc --build` |
| `bun run lint` | oxlint + ESLint (with autofix) |
| `bun run format` | Prettier |

---

## Verification

Commands used to verify the project:

```bash
# Backend: type checking
cd backend && bun run typecheck

# Frontend: type checking, production build, linting
cd frontend && bun run type-check && bun run build && bun run lint

# API collection (backend must be running with seeded data)
cd backend/bruno && bunx @usebruno/cli run --env Local

# Docker: full stack from scratch
docker compose down -v && docker compose up --build -d
docker compose exec backend bun run db:seed
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/health   # 200
```

End-to-end checks performed: create → upload image → list/filter/sort → update → delete (image file removed), duplicate SKU returns `409`, invalid/mismatched image files return `415`, oversized files return `413`, upload rate limit returns `429`, `/health` returns `503` when the database is stopped, SPA deep links and browser refresh work, and uploads/database data persist across container restarts.
