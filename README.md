# Deploying CYP as one Render service

The root `Dockerfile` runs the Next.js frontend and NestJS API in one Render web service. Nginx serves the frontend, forwards `/api/*` to the NestJS process (stripping the `/api` prefix), forwards Socket.IO traffic, and serves uploaded files. The public website and API therefore share one Render URL.

## Deploy

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository. Render will read `render.yaml` and build the root `Dockerfile`.
3. When prompted for `DATABASE_URL`, enter the connection string for the **existing Supabase PostgreSQL database** already configured for this project. Use its PostgreSQL connection string (including its existing password); do not create a new database. Keep the value in Render's environment settings and never commit it to the repository.
4. Set `JWT_SECRET` to a random secret of at least 32 characters when prompted.
5. Add mail settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, and `MAIL_FROM`) if registration, password reset, or voting email is enabled.
6. After the service is created, set `FRONTEND_URL` to the service's public URL. Include any custom frontend domains as comma-separated origins. The Render-provided URL is also allowed automatically.
7. Wait for deployment to finish, then open the service URL. Render checks `/api/health`; Prisma migrations run against the existing database as the pre-deploy command.

The Render service listens on port `10000`; leave the service `PORT` at Render's default. The blueprint provisions a persistent disk for `/app/backend/uploads` so uploaded files survive deploys. A persistent disk requires a paid Render web-service plan.

If the public URL shows an API response instead of the website, check that the Render service was created from this Blueprint with the **Docker** runtime, an empty Root Directory (repository root), and `./Dockerfile` as its Dockerfile path. Render does not convert an existing Node service to Docker; create the Blueprint service instead. Open the service root URL for the website; `/api/health` is only the backend health endpoint.

The backend's local `backend/.env` already supplies the existing database connection, and the Prisma schema uses PostgreSQL. The existing database was checked during setup: all six Prisma migrations are applied. Render does not provision a database in this blueprint; its `DATABASE_URL` must point to that same existing PostgreSQL database.

## Run locally

From the repository root, install dependencies if needed and start both apps:

```sh
npm install
npm run dev
```

Open `http://localhost:3000` for the frontend. The NestJS API runs on `http://localhost:3002`, and the frontend is configured to use it. The backend reads the existing PostgreSQL credentials from `backend/.env`. If port `3002` is already occupied, set `API_PORT` to another available port; the frontend URL is updated to match:

```powershell
$env:API_PORT = "3003"
npm run dev
```

Use Ctrl+C to stop both development servers.

## Local Docker check

Build from the repository root:

```sh
docker build -t cyp-full-stack .
docker run --rm -p 10000:10000 \
  -e DATABASE_URL="your-existing-postgresql-connection-string" \
  -e JWT_SECRET="replace-with-a-random-secret-of-at-least-32-characters" \
  -e FRONTEND_URL="http://localhost:10000" \
  cyp-full-stack
```

Run database migrations before using the local container:

```sh
docker run --rm \
  -e DATABASE_URL="your-existing-postgresql-connection-string" \
  -e JWT_SECRET="replace-with-a-random-secret-of-at-least-32-characters" \
  cyp-full-stack npm --prefix backend run db:migrate
```

For local frontend/backend development without Docker, existing scripts remain available in `frontend/` and `backend/`; `NEXT_PUBLIC_API_URL` continues to support a separately hosted API.
