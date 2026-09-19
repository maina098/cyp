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

### 1. Authentication and access control

- User registration and login with JWT-based authentication.
- Password hashing with bcrypt.
- Role-aware access control for `ADMIN` and regular members.
- Protected member and admin routes with guards and strategies.
- Email verification required for newly registered accounts.
- Password reset links hashed at rest, single-use, and expired after 30 minutes.
- Access tokens expire after 15 minutes by default and rotate through HttpOnly refresh cookies.
- Refresh tokens are hashed at rest, rotated on use, revocable, and expire after seven days by default.
- Global and route-specific throttling plus account lockout protections.
- Profile editing, profile picture upload, password changes, and logout flows.
- Admin-only moderation for applications, positions, and elections.

### 2. Public content and information pages

- Public landing page with counts for news, events, resources, governors, and secretariat members.
- Published news, upcoming events, downloadable resources, governor profiles, and secretariat content.
- Contact form submissions with staff/admin read access.
- Responsive public pages for home, about, contact, news, events, resources, elections, FAQ, privacy policy, and terms.
- SEO metadata, page titles, canonical URLs, and Open Graph metadata across public pages.
- Search engine support through `robots.txt` and `sitemap.xml`.
- Branded 404 page and user-friendly recovery navigation.

### 3. Member dashboard and participation features

- Member profile management and account security views.
- Activity history and participation tracking.
- Event attendance and event submission tracking.
- Community service participation records.
- Organization resource library access.
- Election lists, open positions, application status tracking, and candidate visibility.
- Automatic refresh behavior so election and application data update without a manual reload.
- Mobile-friendly hamburger navigation and responsive layouts.

### 4. Admin dashboard and moderation capabilities

- Member list management with status updates and deletion.
- News publishing and content persistence.
- Event creation and deletion.
- Resource upload, creation, preview, and deletion.
- System health and activity monitoring.
- Election management and status lifecycle transitions.
- Admin ability to update elections created by other users.
- Position-level controls to open and close applications.
- Application filtering and approval/rejection workflows.
- Candidate/member roster management with add and delete actions.
- Protection against deleting candidates with recorded votes.
- Responsive admin mobile navigation with hamburger menu support.

### 5. Election lifecycle and application flow

1. An election is created with a title, description, dates, status, and optional starting candidates.
2. Five default positions are created automatically and start in the closed state:
   - County Youth Governor
   - Secretary General
   - Delegate for Gender and Inclusion
   - Delegate for PWDs and Special Interests
   - Liaison Officer
3. An admin opens only the positions intended to accept applications.
4. Members submit one application per open position.
5. Admins approve or reject applications.
6. Approved applicants are converted into candidates and assigned a position ordinal.
7. The election is transitioned through its lifecycle by an authorized admin.
8. Closing an election closes its positions and preserves result data.

### 6. Voting and election results

- Members vote only while an election is active and inside its configured time window.
- Voting can require an email-delivered one-time code and short-lived voting session before submission.
- One vote per member per election is enforced by database constraints.
- Candidate-to-election validation prevents cross-election voting.
- Vote activity is recorded for audit purposes.
- Vote totals are aggregated into election results.
- Results include total votes, candidate totals, and percentages.
- Live result updates are propagated via WebSockets.
- Public election views include candidate vote bars, percentage breakdowns, donut visualizations, position labels, and winner labels for closed elections.
- Admin election views show totals, application status breakdowns, positions, candidates, and approved applicants.
- Public fallback polling refreshes results every 15 seconds when WebSocket updates are unavailable.

### 7. Real-time updates and monitoring

- Socket.IO namespace at `/results` for live result delivery.
- Event notifications for election status, position changes, result updates, and application changes.
- Admin-only subscriptions for applications and system activity.
- Authenticated subscriptions for election result updates.
- Health, liveness, and readiness endpoints for service monitoring.
- Scheduler support for election due and expiry transitions.

### 8. Developer and operational support

- Prisma migrations and seed support.
- Database validation and migration scripts.
- Integration with NestJS configuration and environment-based setup.
- Rate-limited authentication routes and security-focused middleware patterns.
- Sentry-ready backend integration and structured operational support.
- Local static uploads with MIME allow-lists and file-size limits for resource storage.

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
```

Analytics remain disabled until `NEXT_PUBLIC_GA_ID` is configured and the visitor explicitly opts in.

## Verification Commands

### Backend

```bash
npm run build
npm test -- --runInBand
npm run test:cov
npm run test:e2e
npm run db:validate
```

### Frontend

```bash
npm run build
```

The automated test coverage currently includes:

- authentication and role-guard behavior
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
