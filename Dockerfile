FROM node:24-slim AS frontend-build

WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.14-slim AS backend-build

ENV UV_PROJECT_ENVIRONMENT=/opt/portfolio-website-venv
WORKDIR /build/backend
COPY backend/pyproject.toml backend/uv.lock backend/.python-version backend/README.md ./
COPY backend/src ./src
RUN pip install --no-cache-dir uv \
    && uv sync --frozen --no-dev --no-editable

FROM python:3.14-slim

ENV PATH="/opt/portfolio-website-venv/bin:${PATH}" \
    WEBSITE_ENV=production \
    PORTFOLIO_FRONTEND_DIR=/app/frontend/dist \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app/backend
COPY --from=backend-build /opt/portfolio-website-venv /opt/portfolio-website-venv
COPY --from=frontend-build /build/frontend/dist /app/frontend/dist
COPY backend/alembic.ini ./alembic.ini
COPY backend/alembic ./alembic
RUN useradd --create-home --uid 10001 appuser

EXPOSE 8000
USER 10001
CMD ["uvicorn", "portfolio_website.production:app", "--host", "0.0.0.0", "--port", "8000"]
