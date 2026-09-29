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
use the existing `Infrastructure Dev/dev:/portfolio-website` Infisical secret.
`./scripts/dev` changes only its hostname and port to the host-facing development
PostgreSQL endpoint; the stored container URL remains unchanged. Override the
ordinary endpoint with `PORTFOLIO_DEV_DB_HOST` and `PORTFOLIO_DEV_DB_PORT` when
needed. Production requires a deployment-injected `DATABASE_URL`; the backend
refuses to start in production without it. See `.env.example` for the config
variable names. Local commands do not require a plaintext `.env` file.

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
infisical login --domain=https://dev-infisical.woodhost.cloud/api --method=user --interactive
./scripts/dev uv run --frozen --directory backend uvicorn portfolio_website.main:app --reload
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
./scripts/dev docker compose up --build
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
./scripts/dev docker run --rm -p 8000:8000 \
  -e DATABASE_URL \
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

The integrated `release-container.yml@v3` workflow builds and verifies the
container before publishing the semantic Git tag and GitHub Release. It publishes
`ghcr.io/spencerrwood/portfolio-website:vX.Y.Z` and
`ghcr.io/spencerrwood/portfolio-website:sha-<full-commit-sha>` and exposes a
digest-qualified version reference. Older dev releases remain pinned to the
legacy `website-portfolio` package until infrastructure promotes a new image.

The release job uses `GITHUB_TOKEN` with `contents: write` and `packages: write`.
If an existing GHCR package denies this repository access, add
`SpencerRWood/portfolio-website` under the `portfolio-website` package's
**Settings → Manage Actions access** with **Write** permission.

After a new semantic release and successful GHCR publication, the shared
`promote-container-to-dev.yml@v2` workflow proposes the exact
`vX.Y.Z@sha256:...` reference in
`SpencerRWood/infrastructure` as a PR against `main`. It uses the branch
`chore/portfolio-website-vX.Y.Z` and commit/PR title
`chore(deps): update portfolio-website to vX.Y.Z`. The dev handoff waits up to
20 minutes for the `infrastructure-validation` commit status, which the
centralized workflow publishes from its `validation / validation` result. It
re-fetches the PR, verifies its unchanged head and exact one-line
`environments/dev.yml` image pin, checks that dev is not already running a
newer application version, then squash-merges only that PR. The
`chore(deps)` squash commit causes an infrastructure patch release and its
existing Beelink dev deployment. Validation failure, cancellation, timeout,
or a changed PR leaves it open and fails the promotion job; the published
application release and image remain valid. The failed job can be rerun after
the cause is fixed. Production promotion remains manual.

The shared dev promotion job is serialized across application versions. An exact
image pin is a no-op, an existing open promotion PR is reused, and a stale
version branch with different content requires manual review. Release workflow
reruns do not create another promotion; a newer dev pin cannot be downgraded
by an older release.

Configure the `INFRASTRUCTURE_PR_TOKEN` repository secret in
`SpencerRWood/portfolio-website` before the next release. It is passed as the
reusable workflow's `infrastructure_token` secret. Use a fine-grained
GitHub PAT restricted to `SpencerRWood/infrastructure` with **Contents:
read/write**, **Pull requests: read/write**, and **Commit statuses: read** so the
promotion can inspect the exact PR head's validation status. The normal `GITHUB_TOKEN`
publishes this repository's image; it cannot create a branch and PR in the
private infrastructure repository. Rotate the secret through GitHub settings.

The dev handoff is: validated GHCR image → semantic release → shared dev
promotion → infrastructure PR →
central validation → exact-diff verification → squash merge → infrastructure
patch release → existing Ansible deployment and Beelink readiness checks.
This repository does not deploy directly. Production is outside this handoff.

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
