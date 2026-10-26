# Deploying CYP frontend and backend separately

CYP is deployed as two independent Render web services:

- **Frontend:** Next.js, built from `frontend/` and served on the public website domain.
- **Backend:** NestJS API, built from `backend/` and served at `https://backend.coastalyouthparliament.co.ke`.

The existing Supabase PostgreSQL database is shared by the backend service. The Render blueprint in `render.yaml` configures both services and runs Prisma migrations before deploying the backend.

## Deploy with Render Blueprint

1. Push the repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repository. Render reads `render.yaml` and creates the `cyp-backend` and `cyp-frontend` services.
3. For the backend service, provide the existing Supabase PostgreSQL connection as `DATABASE_URL` and a random `JWT_SECRET` of at least 32 characters. Keep credentials and secrets in Render environment settings; do not commit them.
4. Configure backend email delivery variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, and `MAIL_FROM`) if account email features are required.
5. Add the custom domains in each service's **Settings → Custom Domains**:
   - Add `backend.coastalyouthparliament.co.ke` to `cyp-backend`.
   - Add `coastalyouthparliament.co.ke` and, if used, `www.coastalyouthparliament.co.ke` to `cyp-frontend`.
6. Follow Render's DNS instructions at your domain provider and wait for domain verification and TLS certificates.
7. Confirm `FRONTEND_URL` on `cyp-backend` contains the exact frontend origins, comma-separated, for example `https://coastalyouthparliament.co.ke,https://www.coastalyouthparliament.co.ke`. Set `COOKIE_SAME_SITE` to `lax` when both services use the `.co.ke` domain.
8. The frontend build receives `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` from `render.yaml`. If the backend hostname changes, update both frontend variables to the new HTTPS API host and redeploy the frontend, because Next.js embeds these public values during build.

The backend health check is `https://backend.coastalyouthparliament.co.ke/health`. It checks database connectivity as well as service health. Prisma migrations run automatically as the backend's pre-deploy command.

## Local development

Install dependencies from the repository root with `npm install`. Run each service in its own terminal:

```sh
npm run dev:backend
npm run dev:frontend
```

The frontend's local `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` values are in `frontend/.env`; the backend listens on port `3001` when using this local configuration. The backend reads its database settings from `backend/.env`.

To build or start an individual application from the repository root:

```sh
npm run build:backend
npm run build
npm run start:backend
npm run start:frontend
```
