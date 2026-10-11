# Repository Guidance

## Purpose and boundaries
- `backend/` owns FastAPI behavior and Alembic migrations; `frontend/` owns the React and TypeScript UI.
- Runtime hosting and deployment topology belong to `infrastructure`; this repo owns the application image and release.

## Development
- Keep backend API changes and frontend callers aligned; add migrations for persistent schema changes.
- Inject database and public browser settings at runtime, as described in `README.md`; keep credentials out of the image.

## Validation
- In `backend/`, run `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy`, `uv run pytest`, and `uv build`.
- In `frontend/`, run `npm run lint`, `npm run format`, `npm run typecheck`, `npm test -- --run`, and `npm run build`.
- From the root, run `uv run --directory backend pre-commit run --all-files` and `docker compose config` when relevant.

## Architecture constraints
- Preserve the single-image contract that serves the built frontend and API together.
- Keep browser configuration injection separate from build-time secrets.

## Safety
- Review Alembic ordering and rollback impact before a shared-environment deployment.

## Branching strategy

- This repository uses **release-branch integration**. Create Story branches from the verified active `release/vX.Y.Z` and target Story PRs there; `main` changes only after the release readiness gate.
- Follow the [canonical branching and delivery policy](https://github.com/SpencerRWood/codex-config/blob/main/docs/branching-policy.md), available through the installed codex-config source path. Verify the strategy, release association, fetched base and PR target before implementation and record them in Story evidence. Story completion does not authorize publication or deployment; retain existing review, CI, security and rollback requirements.
