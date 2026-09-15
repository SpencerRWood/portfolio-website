FROM node:24-slim

WORKDIR /app/frontend

COPY package.json package-lock.json* ./
RUN npm install

COPY index.html tsconfig.json vite.config.ts eslint.config.js .prettierrc.json ./
COPY src ./src

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
