# CYP Platform

CYP is a full-stack youth organization platform for public storytelling, member engagement, election administration, voting, moderation, and live election updates. The system combines a NestJS backend, Prisma data layer, Socket.IO event stream, and a Next.js frontend to support both public-facing and authenticated admin/member workflows.

## Repository Structure

```text
backend/   NestJS API, Prisma database layer, WebSocket gateway, tests, migration setup
frontend/  Next.js public, member, admin, and election interfaces
```

## System Overview

This project supports the core lifecycle of a youth organization platform:

- member onboarding and authentication
- public content publishing for news, events, resources, and organizational profiles
- member dashboard access for activity, participation, and elections
- admin moderation for applications, roles, content, and system state
- election creation, candidate application handling, and vote counting
- real-time result updates and public result viewing
- health checks, audit trail support, and rate-limited secure endpoints

## Implemented Features

The platform already includes a complete end-to-end stack for youth-organization operations, with the backend and frontend working together across public, member, and admin workflows.

### 1. Authentication, identity, and account security

- User registration with verified email activation and password hashing with bcrypt.
- Login/logout flows with JWT access tokens and HttpOnly refresh-token cookies.
- Role-based authorization for `USER` and `ADMIN` workflows.
- Password reset flow with hashed single-use tokens that expire after 30 minutes.
- Session versioning, refresh rotation, revocation, and invalidation on password change.
- Account lockout after repeated failed login attempts with configurable cooldown windows.
- Route-level enforcement through Nest guards and protected API boundaries.
- Profile update, avatar upload, account security changes, and user activity tracking.
- Email delivery services for verification and password reset communications.

### 2. Member onboarding, profile, and dashboard workflows

- Member registration, verification, login, logout, and secure session management.
- Personal profile management with name, email, preferred display data, and profile image handling.
- Member dashboard covering activity feed, elections, participation, and account information.
- Event registration and attendance-related tracking for member submissions and approvals.
- Community service participation records and status visibility.
- Access to organizational resource materials from a member-facing library.
- Election application status tracking, position visibility, and candidate listing for members.
- Automatic refresh behavior for member-facing election and application lists.
- Responsive member navigation and mobile-friendly dashboard experience.

### 3. Public content, organization pages, and community information

- Public landing page with live counts for news, events, resources, governors, and secretariat members.
- News, events, resource library, governor, and secretariat content pages.
- Contact submission handling with admin visibility for staff moderation.
- About, FAQ, privacy, terms, and branded 404 flows for a complete public site.
- Search-engine metadata and sitemap/robots support for discoverability.
- Responsive public pages designed for desktop and mobile access.
- Canonical URL, page-title, and Open Graph metadata support across key public routes.
- Downloadable public content and structured resource categories.

### 4. Admin moderation, content management, and operational controls

- Member list management including identification, status updates, and deletion controls.
- News management with create, edit, publish, and delete operations.
- Event creation, updating, and deletion with public-facing listing support.
- Resource uploads and admin-side document management with MIME restrictions and file-size validation.
- Election management, lifecycle handling, and access to application and result data.
 One vote per member per election position is enforced by database integrity constraints, allowing one ballot across each of the five positions.
2. The platform creates five default positions in a closed application state by default:
   - County Youth Governor
   - Secretary General
7. Elections are advanced through their lifecycle states using the orchestrated status workflow.
8. Closed elections preserve result integrity while finalizing positions and vote totals.

- Public voting and result pages include candidate bars, percentages, position labels, and winner display for closed elections.
- Admin views surface totals, application breakdowns, positions, candidates, and approved applicants.
- Fallback polling refreshes public results every 15 seconds when WebSocket delivery is unavailable.
- Health, readiness, and liveness endpoints for service monitoring.
- Scheduler-driven status transitions for due and expiry lifecycle handling.
- Live result propagation for both public-facing and admin election views.

### 8. Infrastructure, reliability, and developer support

- Prisma-based schema management with migrations and seed support.
- Database validation and migration tooling for consistent environment setup.
- NestJS configuration and environment-based deployment patterns.

- Public pages for home, about, contact, elections, news, events, resources, FAQ, and policy documents.
- Member-specific dashboard and profile interfaces with account and participation management.
- Admin dashboards for elections, moderation, content management, applications, and resource handling.
- Next.js-based responsive UI with navigation patterns tuned for desktop and mobile use.
- Election result and candidate display components that support both raw arrays and paginated API payloads.
- Consent and analytics handling that keeps tracking disabled until the user opts in.
- User-friendly error states, status transitions, and recovery paths across the application.

### 10. Current production-readiness position

This project already implements the core lifecycle of a modern youth organization platform: onboarding, member participation, secure moderation, election operations, result tracking, and live public reporting. The codebase reflects a working end-to-end system with the major business flows in place, while still requiring additional hardening for full production deployment and governance review.

## Required Environment Variables

Set these values in the backend deployment environment before starting the API:

- `JWT_SECRET`: random secret with at least 32 characters; never expose it to the frontend.
- `JWT_EXPIRES_IN_SECONDS`: optional token lifetime; defaults to `900` seconds.
- `ACCESS_TOKEN_TTL_SECONDS`: optional access-token lifetime; defaults to `900` seconds.
- `REFRESH_TOKEN_TTL_DAYS`: optional refresh-token lifetime; defaults to `7` days.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, `MAIL_FROM`: required for verification and reset email delivery.
- `FRONTEND_URL`: frontend origin used in verification and password-reset links.
- `COOKIE_SAME_SITE`: set to `none` when the frontend and API are on different sites; this also requires HTTPS.

After deployment, run:

```bash
cd backend
npm run db:migrate
```

## API Areas

The backend exposes the following main route groups:

| Area | Prefix | Purpose |
| --- | --- | --- |
| Authentication | `/auth` | Register, login, refresh, verification, reset, and logout flow |
| Public content | `/content` | Public platform content |
| Members | `/users/me` | Profile, dashboard, activity, uploads, participation |
| Admin | `/admin` | Content, resources, events, applications, positions, activity |
| Elections | `/elections` | Election CRUD, status, candidates, applications, timeline, results |
| Applications | `/applications` | Submit, review, and moderate applications |
| Positions | `/positions` | Read and admin-manage election positions |
| Votes | `/elections/:id/vote` | OTP verification, voting sessions, vote casting, and election vote data |
| Health | `/health` | Health and readiness probes |
| Contact | `/contact` | Contact message submission and access |

Important election endpoints include:

```text
POST   /elections
GET    /elections
GET    /elections/:id
PATCH  /elections/:id
PATCH  /elections/:id/status
PATCH  /elections/:id/transition-status
POST   /elections/:id/initialize
POST   /elections/:id/open-positions
POST   /elections/:id/close-positions
POST   /elections/:id/candidates
DELETE /elections/:id/candidates/:candidateId
GET    /elections/:id/timeline
GET    /elections/:id/results
POST   /elections/:id/applications/:appId/approve
POST   /elections/:id/applications/:appId/reject
POST   /auth/refresh
POST   /elections/:id/vote/otp/request
POST   /elections/:id/vote/otp/verify
POST   /elections/:id/vote/session
```

## Local Setup

### Backend

```bash
cd backend
npm install
npm run db:validate
npm run db:migrate
npm run start:dev
```

The API defaults to port `3001`. Configure the database connection and JWT settings in the environment configuration used by the project.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` if the API is hosted elsewhere. The real-time client can use `NEXT_PUBLIC_WS_URL` when the WebSocket host differs from the API host.

Optional frontend environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://www.coastalyouthparliament.org
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```bash
npm run build
npm test -- --runInBand
npm run test:cov
npm run test:e2e
- voting validation and vote limits
- database URL handling
- election creation and initialization workflows
- five-member application submission
- admin approval of five applicants
- candidate assignment to positions
- result percentage calculations

## Resolved Review Findings

The following review issues have been addressed during the implementation cycle:

- Candidates now support a nullable direct `positionId` foreign key, with a migration preserving existing ordinal data.
- Election creation creates five default positions in a closed application state.
- Generic admin application status updates reconcile candidate records inside a transaction.
- Election status changes follow the orchestrator lifecycle path, including the legacy status route.
- Expired elections close their application positions.
- Duplicate cron logic was removed; `ElectionSchedulerService` owns scheduled synchronization.
- Admin resource uploads have a 25 MB limit and allow-list for image, PDF, Word, and video MIME types.
- Public election results poll every 15 seconds as a fallback when WebSockets are unavailable.
- Public election components accept both array and paginated `{ data, meta }` responses.
- The stale root e2e smoke test was updated to validate the current API response.
- `/applications` and direct position status mutation are restricted to administrators.
- Regression tests cover election creation, five applications, five approvals, candidate assignment, and result percentages.

## Remaining Limitations and Likely Failure Points

These issues are known and should be addressed before treating the system as production-ready:

1. Database-backed end-to-end election testing remains incomplete. The API smoke test passes, but a live PostgreSQL database, migrations, seeded users, and running API/frontend servers are still required to validate the full browser flow.
2. Legacy `/portal` pages remain separate from the main `/admin` and `/dashboard` workflows, and may not expose all newer election or moderation features.
3. Legacy candidates may still have a null `positionId`. Existing records retain older ordinal data until a proper backfill is applied.
4. Election results are still primarily aggregated per candidate. A first-class position-level result snapshot would be more robust for ties, recounts, and historical reporting.
5. The public results WebSocket still requires authentication. Public users now have a polling fallback, but a read-only public socket could reduce latency further.
6. Some admin content operations still rely on local storage or separate APIs, so data can appear inconsistently across sessions or pages.
7. Some admin moderation failures are not surfaced clearly to the end user; errors may fail silently or only show in the browser network response.
8. File uploads still use local static storage. MIME allow-lists and size limits help, but production should use content inspection, durable object storage, signed/private downloads, and virus scanning.
9. Rate limiting and audit review should cover every administrative mutation. Authentication is protected, but production verification should include throttling, audit completeness, and alerting.
10. The frontend does not currently expose a dedicated lint or browser automation command. Browser test coverage should include mobile navigation, application submission, approval propagation, voting, and result rendering.
11. The legal text is an implementation baseline, not legal advice. The privacy and terms pages should be reviewed with counsel for retention periods, data-controller details, complaints procedures, and Kenyan compliance requirements.
12. The static sitemap is tied to the production domain and should be updated if the public deployment domain changes.
13. Consent preferences are stored in the browser only. A signed-in member using multiple devices must opt in separately on each device.
14. Accessibility has not received a formal WCAG audit. Keyboard focus, semantic FAQ controls, dynamic update announcements, and uploaded image descriptions need additional manual and automated testing.

## Recommended End-to-End Smoke Flow

1. Create or seed an admin account and five member accounts.
2. Create an election with future start and end dates.
3. Confirm five positions exist and are closed for applications.
4. Open selected positions from the admin applications panel.
5. Submit applications from five member accounts.
6. Approve each application as admin and verify the candidate roster.
7. Confirm each member dashboard shows the correct application status and approved candidate information.
8. Move the election to active, cast valid votes, and verify duplicate-vote rejection.
9. Close the election and verify positions close, totals update, percentages render, and winners appear by position.
10. Review audit activity and WebSocket updates in browser network/console logs.

## Final Status

The platform already implements a broad set of organization, member, admin, and election workflows and is functionally aligned with the project goals. It is best described as a working system with production-hardening work still needed, especially around database-backed browser validation, admin UX feedback, storage strategy, legal review, and formal accessibility testing.
