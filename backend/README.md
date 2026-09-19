# CYP Platform

CYP is a full-stack youth organization platform with public content, member participation, election management, voting, moderation, and real-time election updates.

## Repository Structure

```text
backend/   NestJS API, Prisma database layer, WebSocket gateway, tests
frontend/  Next.js member, admin, public, and election interfaces
```

## Implemented Features

### Authentication and access control

- User registration and login with JWT authentication.
- Password hashing with bcrypt.
- Role-aware access control for `ADMIN` and regular members.
- Protected member and admin routes.
- Email verification is required for new accounts.
- Password reset links are single-use, hashed at rest, and expire after 30 minutes.
- Access tokens expire after 15 minutes by default and password changes revoke existing sessions.
- Login endpoints use global and route-specific throttling plus account lockout controls.
- Profile editing, profile-picture upload, password changes, and logout.
- Admin-only application moderation, position management, and election administration.

### Public platform content

- Public overview with counts for news, events, resources, governors, and secretariat members.
- Published news, upcoming events, downloadable resources, governors, and secretariat content.
- Contact message submission and admin message access.
- Responsive public pages for home, about, contact, news, events, resources, and elections.

### Member dashboard

- Member profile and account-security views.
- Member activity and participation history.
- Events attended and event-participation submissions.
- Community-service participation tracking.
- Organization resource library.
- Election list, open positions, applications, application statuses, and election candidates.
- Automatic dashboard refresh so election and application changes appear without a manual reload.
- Responsive mobile navigation with a hamburger dropdown.

### Admin dashboard

- Member list with status changes and deletion.
- Admin news publishing and local content persistence.
- Event creation and deletion.
- Resource upload, creation, preview, and deletion.
- System health display and activity information.
- Election selection and lifecycle controls.
- Election status transitions: draft, scheduled, active, and closed.
- Admin access to update elections created by other users.
- Position-level application controls to open and close applications.
- Application filtering and approval/rejection.
- Candidate/member roster management with add and delete actions.
- Candidates with recorded votes cannot be deleted.
- Responsive mobile hamburger dropdown navigation.

## Required authentication environment

Set these values in the backend deployment environment before starting the API:

- `JWT_SECRET`: random secret of at least 32 characters; never commit or expose it to the frontend.
- `JWT_EXPIRES_IN_SECONDS`: optional access-token lifetime, default `900`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, and `MAIL_FROM`: required for verification and reset email delivery.
- `FRONTEND_URL`: frontend origin used in verification and reset links.
- `COOKIE_SAME_SITE`: use `none` when the deployed frontend and API are on different sites; this also requires HTTPS.

After deploying, run `npm run db:migrate` from `backend` to apply the authentication migration.

### Election lifecycle

1. An election is created with title, description, dates, status, and optional initial candidates.
2. Five default positions are created automatically in the closed state:
   - County Youth Governor
   - Secretary General
   - Delegate for Gender and Inclusion
   - Delegate for PWDs and Special Interests
   - Liaison Officer
3. An admin opens only the positions that should accept applications.
4. Members submit one application per position.
5. Admins approve or reject applications.
6. Approved applicants are converted into candidates and assigned a position ordinal.
7. The election is moved through its lifecycle by an authorized admin.
8. Closing an election closes its positions and preserves result data.

### Voting and results

- Members can vote only while an election is active and inside its configured time window.
- One vote per member per election is enforced by a database constraint.
- Candidate-to-election validation prevents cross-election votes.
- Vote activity is recorded for audit purposes.
- Vote totals are aggregated into election results.
- Results include total votes, candidate totals, and percentages.
- Results are updated through WebSockets for connected clients.
- The public election view includes candidate vote bars, percentage breakdown, donut visualization, position labels, and closed-election winner labels.
- Admin election views show totals, application status breakdowns, positions, candidates, and approved applicants.

### Real-time updates

- Socket.IO results namespace at `/results`.
- Election result, status, position, and application update events.
- Admin-only application and system-activity subscriptions.
- Authenticated election subscriptions for result updates.

### Health, audit, and scheduling

- Health, liveness, and readiness endpoints.
- User activity records for logins, applications, approvals, rejections, votes, and participation.
- Election status scheduler for due and expired elections.
- Prisma migrations and seed support.

### Web compliance and UX

- Privacy policy at `/privacy-policy`.
- Terms of service at `/terms-of-service`.
- FAQ page at `/faq` with accessible native accordions.
- Custom branded 404 page with recovery links.
- `robots.txt` and public `sitemap.xml` excluding authenticated dashboard routes.
- Route-level page titles, descriptions, canonical URLs, and shared Open Graph metadata.
- Built-in `app/icon.svg` favicon.
- Consent banner for optional analytics; analytics load only when `NEXT_PUBLIC_GA_ID` is configured and the visitor opts in.
- Keyboard-visible focus styles, labeled interactive controls, responsive layouts, and a prominent homepage Get involved CTA.
- Public election result polling fallback when authenticated WebSocket updates are unavailable.

## API Areas

The backend exposes these main route groups:

| Area | Prefix | Purpose |
| --- | --- | --- |
| Authentication | `/auth` | Register and login |
| Public content | `/content` | Public platform content |
| Members | `/users/me` | Profile, dashboard, activity, uploads, participation |
| Admin | `/admin` | Content, resources, events, applications, positions, activity |
| Elections | `/elections` | Election CRUD, status, candidates, timeline, applications, results |
| Applications | `/applications` | Submit, list, inspect, and moderate applications |
| Positions | `/positions` | Read and admin-manage election positions |
| Votes | `/elections/:id/vote` | Cast votes and inspect election votes |
| Health | `/health` | Health and readiness probes |
| Contact | `/contact` | Contact messages |

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

The API defaults to port `3001`. Configure the database connection and JWT settings in the backend environment configuration used by the project.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` when the API is hosted elsewhere. The real-time client can use `NEXT_PUBLIC_WS_URL` when the WebSocket host differs from the API host.

Optional frontend environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://www.coastalyouthparliament.org
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

Analytics are disabled when `NEXT_PUBLIC_GA_ID` is absent and remain disabled until the visitor accepts optional analytics.

## Verification Commands

Backend:

```bash
npm run build
npm test -- --runInBand
npm run test:cov
npm run test:e2e
npm run db:validate
```

Frontend:

```bash
npm run build
```

Current automated coverage includes authentication, role guards, voting behavior, database URL handling, election creation, position initialization, five-member application submission, admin approval of five applicants, candidate position assignment, and result percentage calculations.

## Resolved Review Findings

The following findings from the platform review have been addressed:

- Candidates now have a nullable direct `positionId` foreign key, with a migration that preserves existing ordinal data.
- Election creation creates five default positions closed for applications.
- Generic admin application status updates reconcile candidate records inside a transaction.
- Election status changes use the orchestrator lifecycle path, including the legacy status route.
- Expired elections close their application positions.
- The duplicate elections-service cron job was removed; `ElectionSchedulerService` owns scheduled synchronization.
- Admin resource uploads have a 25 MB limit and an allow-list for image, PDF, Word, and video MIME types.
- Public election results poll every 15 seconds as a fallback when WebSocket updates are unavailable.
- The public election page and shared context accept both array and paginated `{ data, meta }` election responses.
- The stale root e2e smoke test now checks the current API response.
- `/applications` and direct position status mutation are restricted to administrators.
- Regression tests cover election creation, five applications, five approvals, candidate assignment, and result percentages.

## Remaining Limitations and Likely Failure Points

These items should be addressed before treating the system as production-ready:

1. **Database-backed election end-to-end testing is incomplete.** The root API smoke test passes, but a running PostgreSQL database, migrations, seeded users, and API/frontend servers are still required to verify the complete browser election flow.
2. **The legacy `/portal` pages remain separate.** The main `/admin` and `/dashboard` pages contain the current workflow, while older portal pages may not expose all newer election and moderation capabilities.
3. **Legacy candidates may have a null `positionId`.** Existing records retain the old ordinal until a data backfill associates them with a position.
5. **Election results are still aggregated per candidate.** Position labels use the direct candidate relation when available, but a first-class position-level result snapshot would be more robust for ties, recounts, and historical reporting.
6. **The public results WebSocket requires authentication.** Public users now have polling fallback, but a public read-only WebSocket subscription could reduce latency and server polling.
7. **Some admin content operations use local storage or separate APIs.** News publishing in the dashboard and database-backed content are not fully unified, so content can appear differently across sessions or pages.
8. **Application and candidate moderation errors need user-facing feedback.** Some failed admin requests currently fail silently or only appear in the browser network response.
9. **File uploads still use local static storage.** MIME allow-lists and size limits are implemented, but production should use content inspection, durable object storage, signed/private downloads where appropriate, and virus scanning.
10. **Rate limiting and audit review should cover every administrative mutation.** Authentication is protected, but production operations should verify throttling, audit completeness, and alerting for admin actions.
11. **The frontend has no dedicated lint or browser test command.** Add Playwright or an equivalent browser suite for mobile navigation, application submission, approval propagation, voting, and result charts.
12. **Legal text requires organizational review.** The published privacy and terms pages are an implementation baseline, not legal advice; confirm retention periods, responsible data controller details, complaints procedures, and applicable Kenyan requirements with counsel.
13. **The static sitemap uses the production domain.** Update `frontend/public/sitemap.xml` and `robots.txt` if the deployment domain changes.
14. **Consent preferences are browser-local.** A signed-in member using multiple devices must set preferences on each device, and analytics consent should be reviewed against the organization’s final cookie policy.
15. **Accessibility has not received a formal WCAG audit.** Keyboard focus and semantic FAQ controls are included, but contrast, screen-reader announcements, dynamic election updates, and uploaded-image descriptions still need manual axe/Lighthouse testing.

## Recommended End-to-End Smoke Flow

1. Create or seed an admin and five member accounts.
2. Create an election with future start and end dates.
3. Confirm five positions exist and are closed.
4. Open selected positions from the admin Applications panel.
5. Submit applications from five member accounts.
6. Approve each application as admin and verify the candidate roster.
7. Confirm each member dashboard shows its application status and the election shows approved candidates.
8. Move the election to active, cast valid votes, and verify duplicate-vote rejection.
9. Close the election and verify positions close, totals update, percentages render, and winners appear by position.
10. Review audit activity and WebSocket updates in the browser network/console logs.
