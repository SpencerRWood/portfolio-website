FROM python:3.14-slim

ENV UV_PROJECT_ENVIRONMENT=/opt/portfolio-website-backend-venv
ENV PATH="/opt/portfolio-website-backend-venv/bin:${PATH}"

WORKDIR /app/backend

COPY pyproject.toml uv.lock .python-version ./
COPY src ./src
COPY tests ./tests

RUN pip install --no-cache-dir uv \
    && uv sync --frozen --group dev

CMD ["uv", "run", "uvicorn", "portfolio_website.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
