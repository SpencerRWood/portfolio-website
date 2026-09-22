# portfolio-website

A thin full-stack template with a FastAPI backend, a React + TypeScript
frontend, `uv`, Vite, Ruff, mypy, pytest, ESLint, Prettier, Vitest,
pre-commit, GitHub Actions, Docker Compose, and semantic-release wired
together.

## Intended Use

Use this template for small full-stack applications that need a typed FastAPI
backend and a lightweight React frontend. The repository infrastructure is
ready for local development and release automation; application behavior is intentionally
minimal.

## Repository Layout

```text
backend/
  src/portfolio_website/
    api/routes/
    models/
    services/
    config.py
    exceptions.py
    main.py
  tests/
  pyproject.toml
  .python-version
frontend/
  src/
    api/
    components/
    hooks/
    pages/
    types/
    App.tsx
    main.tsx
  tests/
  package.json
  tsconfig.json
  vite.config.ts
.github/workflows/
docker-compose.yml
```

The backend follows the existing Python template family. The frontend keeps a
small Vite application shell and leaves API-specific behavior under
`frontend/src/api/`.

## Runtime Configuration

The application defaults to `WEBSITE_ENV=development`. Local development can
set `WOOD_DATA_PLATFORM_DATABASE_URL` to use the Wood Data Platform PostgreSQL
service without putting credentials in source control. Production requires a
deployment-injected `DATABASE_URL`; the backend refuses to start in production
without it. See `.env.example` for the non-secret variable names.

## Prerequisites

- Python 3.14
- `uv`
- Node.js 24
- npm
- Docker, if using Docker Compose

## Backend Setup

```sh
cd backend
uv sync --frozen --group dev
```

Run backend checks:

```sh
uv run ruff check .
uv run ruff format --check .
uv run mypy
uv run pytest
uv build
```

Run the backend locally:

```sh
uv run uvicorn portfolio_website.main:app --reload
```

## Frontend Setup

```sh
cd frontend
npm install
```

Run frontend checks:

```sh
npm run lint
npm run format
npm run typecheck
npm test -- --run
npm run build
```

Run the frontend locally:

```sh
npm run dev
```

## Docker Compose

From the repository root:

```sh
docker compose up --build
```

This starts:

- backend: `http://localhost:8000`
- frontend: `http://localhost:5173`

No database, cache, proxy, worker, or queue is included by default.

## Production Container

The root `Dockerfile` builds the React frontend with `npm ci`, installs the
locked backend runtime dependencies, and runs Uvicorn without a development
server or source mount. The image also includes the Alembic migration files.
It listens on port 8000 and serves the frontend, API, and `/health` from one
process.

```sh
docker build -t portfolio-website:local .
docker run --rm -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:password@database:5432/portfolio_website \
  portfolio-website:local
curl --fail http://localhost:8000/health
```

Set `DATABASE_URL` at runtime for the production database. Optional public
browser analytics settings are `RUDDERSTACK_WRITE_KEY` and
`RUDDERSTACK_DATA_PLANE_URL`; the frontend receives them at request time.
The image contains no environment file or credentials. The existing Compose
services remain for local development.

## Full Repository Validation

From the repository root:

```sh
cd backend && uv sync --frozen --group dev
cd ../frontend && npm install
cd ..
uv run --directory backend pre-commit run --all-files
docker compose config
```

## Pre-commit

Install hooks from the repository root after backend and frontend dependencies
are installed:

```sh
uv run --directory backend pre-commit install
```

Pre-commit runs the same file hygiene hooks as the Python templates, backend
Ruff lint/format, and frontend Prettier formatting.

## Release Validation

The release workflow validates the backend, frontend, repository hooks, and
Docker Compose configuration before semantic-release:

- Backend: `uv sync --frozen --group dev`, mypy, pytest, `uv build`
- Frontend: `npm ci`, ESLint, TypeScript, Vitest, Vite build
- Repository: pre-commit and `docker compose config`

Backend Ruff and frontend Prettier run through pre-commit.

## Versioning And Release

The repository uses one version, stored in `backend/pyproject.toml`.
semantic-release follows the Python template conventions:

- conventional commits
- tags like `v0.0.1`
- `fix:` and `perf:` create patch releases
- `feat:` creates minor releases while the template remains `0.x`
- release assets are built with `uv build`

The frontend package version starts at the same value for search-and-replace
clarity, but the default release workflow is repository-level rather than
separate frontend/backend release tracks.

When semantic-release creates a new tag, the release workflow calls the
centralized container publisher with that tag. It publishes
`ghcr.io/spencerrwood/website-portfolio:vX.Y.Z` and
`ghcr.io/spencerrwood/website-portfolio:sha-<full-commit-sha>` and exposes a
digest-qualified version reference. The image name is explicit because this
repository is named `portfolio-website` on GitHub.

The publisher uses `GITHUB_TOKEN` with `contents: read` and `packages: write`.
If an existing GHCR package denies this repository access, add
`SpencerRWood/portfolio-website` under the `website-portfolio` package's
**Settings → Manage Actions access** with **Write** permission.

## Copy And Rename

After copying this template, replace these names everywhere:

- repository/distribution name: `portfolio-website`
- Python package name: `portfolio_website`
- npm package name: `portfolio-website`
- FastAPI title: `portfolio-website`
- frontend page title: `portfolio-website`

Then update package metadata, refresh locks with `uv lock` and `npm install`,
and run the backend, frontend, pre-commit, and Docker Compose validation
commands.
