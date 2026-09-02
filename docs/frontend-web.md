# Frontend — Admin Web Dashboard (Next.js)

## Overview

The Admin Web Dashboard is the internal tool Platform Administrators use to oversee Ishuko — it is
not customer-facing. It serves one role only (`ADMIN`), gated by MFA at sign-in and RBAC-enforced
on every API call, and gives admins visibility into cooperatives, buyers, and system health
without touching the mobile app that cooperatives and buyers use.

## Technology Stack

|               |                                           |
| ------------- | ----------------------------------------- |
| **Framework** | Next.js (App Router)                      |
| **Language**  | TypeScript / JavaScript (`.tsx` / `.jsx`) |
| **Styling**   | Tailwind CSS                              |
| **Linting**   | ESLint (`eslint.config.mjs`)              |
| **Testing**   | Jest + React Testing Library              |
| **Hosting**   | Vercel                                    |

## Prerequisites

- **Node.js** (LTS) and **npm**
- Access to the backend's production or local base URL (`NEXT_PUBLIC_API_URL`)
- An admin account (`user_type == "ADMIN"`) to sign in with

<VPButton text="Admin Dashboard Link" href="https://techdexishukodashboard.vercel.app/login" theme="alt" />

## Admin Dasboard

<div class="ishuko-screens">
  <figure>
    <img src="/screenshots/dashboard/screen1.png" alt="Screen" />
  </figure>
  <figure>
    <img src="/screenshots/dashboard/screen2.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/dashboard/screen4.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/dashboard/screen5.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/dashboard/screen6.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/dashboard/screen7.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/dashboard/screen8.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/dashboard/screen9.png" alt="Screen" />
  </figure>
</div>

## User Onboarding Flows

### Admin Login

Login details required: **Email**, **Password**.

**Endpoint:** `POST /auth/login`

```json title="Sample Request"
{
  "email": "user@example.com",
  "password": "string"
}
```

```json title="Sample Response"
{
  "two_factor_required": true,
  "pre_auth_token": "string",
  "message": "string"
}
```

### Forgot Password, OTP Verification & Reset Flow

**Step 1 — Initiate Password Reset**

`POST /auth/forgot-password`

```json
{ "email": "user@example.com" }
```

```json
{ "message": "Password reset code sent." }
```

**Step 2 — Verify Code**

`POST /auth/verify-reset-pin`

```json
{
  "email": "user@example.com",
  "pin": "string"
}
```

```json
{ "message": "Code Verified. Proceed to reset password." }
```

**Step 3 — Reset Password**

`POST /auth/reset-password`

```json
{
  "email": "user@example.com",
  "pin": "string",
  "new_password": "stringsecure"
}
```

```json
{ "detail": "Password reset successful." }
```

## Authentication Flow

- **Login:** `POST /auth/login` returns a JWT (and, if 2FA is enabled for the account,
  `two_factor_required` + a `pre_auth_token` to complete verification).
- **Token storage:** the JWT is kept in memory/local storage for the session and attached to every
  subsequent API call as `Authorization: Bearer <token>`.
- **Auth helpers:** a shared request wrapper (e.g. an API client instance) injects the bearer
  token automatically and centrally handles `401`/`403` responses (see
  [Error Handling](#error-handling) below) so individual pages don't each reimplement token
  attachment.
- **Protected routes:** dashboard routes assume an authenticated `ADMIN` session; an expired or
  missing token should redirect back to `/login` rather than render a partial dashboard.
- **Forgot password / reset:** handled by the three-step OTP flow documented above
  (`/auth/forgot-password` → `/auth/verify-reset-pin` → `/auth/reset-password`).

## API Integration

- All requests target `NEXT_PUBLIC_API_URL`, the backend's base URL, injected at build time from
  the environment (see [Prerequisites](#prerequisites) and [Deployment
  Process](#deployment-process) below).
- API calls are organized into service files per resource (e.g. a `cooperatives` service, a
  `buyers` service) rather than scattered `fetch` calls inside components, so the request shape
  for a given resource lives in one place.
- No server-side proxy is required today — the dashboard calls the FastAPI backend directly over
  HTTPS using the bearer token described above; CORS on the backend is configured to allow the
  dashboard's origin (see [Backend → CORS](/backend)).

## First Steps After Login

The dashboard shows how different cooperatives using Ishuko are performing, with three key
screens:

- **Dashboard** — total cooperatives, active regions, average yield per cooperative
- **Cooperative Summary** — a searchable/filterable table (ID, cooperative name, region, members,
  volume, status: active / deactivated / banned)
- **Buyer Summary** — a searchable/filterable table (ID, buyer, country, orders, total spend,
  status)

## Code Standards

- **Components:** Always use functional components for consistency and performance.
- **Naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for component names
  - `SCREAMING_SNAKE_CASE` for constants
- **Files:** One component per file. Group by feature/module for maintainability.
- **Testing:** Jest + React Testing Library for unit tests; add tests for each new component or
  logic block.
- **Styling:** Tailwind CSS only — avoid inline styles unless absolutely necessary.
- **Accessibility:** All UI should meet WCAG AA standards; use semantic HTML and ARIA attributes.

## Code Structure (`TechDex_Dashboard/`)

```
TechDex_Dashboard/
├── .env
├── .github/
│   └── pull_request_template.md
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.jsx
│   ├── dashboard/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   ├── page.module.css
│   │   └── buyers/
│   │       ├── buyer_summary.module.css
│   │       └── page.jsx
│   └── login/
│       ├── login.module.css
│       └── page.jsx
├── components/
│   └── sidebar/
│       ├── Sidebar.module.css
│       └── Sidebar.jsx
└── public/
    ├── vercel.svg
    ├── window.svg
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── ishukologo.png
    └── ishuko-logo.png
```

## Brand Compliance

- **Color palette:** Ishuko green (primary) + black/near-black accent.
- **Typography:** Roboto.
- Buttons, forms, and CTAs (Get Started, Verify, Add to Cart, Sign Up, Sign in with Google, etc.)
  follow a consistent green-on-white / white-on-green button system across mobile and web.
- Final builds must use Ishuko colors, fonts, and logo per the brand guidelines.

## Styling

- **Framework:** Tailwind CSS only — inline styles are avoided unless absolutely necessary (see
  [Code Standards](#code-standards)).
- **Design tokens:** the brand palette is centralized as CSS custom properties rather than
  hard-coded hex values scattered through components — see `docs/.vitepress/theme/custom.css` in
  this documentation site's own source for the reference token set (`--ishuko-green`,
  `--ishuko-green-deep`, `--ishuko-green-accent`, `--ishuko-green-tint`), which mirrors the
  dashboard's own token usage.
- Component-level styling stays scoped via CSS Modules (`*.module.css`, e.g. `Sidebar.module.css`,
  `login.module.css`) alongside Tailwind utility classes — see [Code Structure](#code-structure-techdex-dashboard).

## Error Handling

- **API errors:** fetch calls are wrapped in try/catch; failures are surfaced to the user via a
  dedicated error state on the page (not a raw thrown exception) and logged to the console via
  `console.error`. See [Backend → Error Handling](/backend) for the status codes the dashboard
  needs to handle (`400`, `401`, `403`, `404`, `500`).
- **UI error states:** a `401` (missing/expired token) redirects to `/login`; a `403` (valid
  token, wrong role) shows an access-denied state rather than a blank page; a `500` shows a
  generic retry-able error rather than exposing the backend stack trace.
- **Form validation errors** (e.g. invalid email on login/forgot-password) are shown inline next
  to the offending field, not as a page-level banner.

## Deployment Process

- **Platform:** Vercel (Next.js / Tailwind)
- **Branch:** Auto-deployment from `main`
- **Environment variables:** Managed securely via `.env` in the Vercel dashboard
- **Build & Preview:** Every PR triggers a preview build; production deploys on merge to `main`

**Release steps:**

1. Developers create feature branches from `main`.
2. Code changes are committed and pushed to the remote repository.
3. A Pull Request is opened targeting `main`.
4. Vercel auto-generates a preview build per PR for live review.
5. Reviewers test and validate UI and functionality.
6. Brand compliance is verified (colors, fonts, logo).
7. After approval, the PR is merged into `main`.
8. Vercel triggers an automatic production deployment from `main`.
9. Environment variables are injected securely at build time from the Vercel dashboard.
10. Final validation confirms the live site matches brand requirements and functions correctly.

## Frontend Setup

```bash
cd TechDex_Dashboard
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the dashboard:

```bash
npm run dev
```

## QA Documentation

- **Framework:** Jest + React Testing Library.
- **Convention:** one test file per component (`ComponentName.test.tsx`), colocated with or
  mirroring the component's folder — see [Developer Guide → Testing Conventions](/developer-guide).
- **Run tests locally:**

  ```bash
  npm run test
  ```

- **CI:** the full test suite runs automatically on every GitHub Pull Request alongside lint
  checks; a PR should not merge with failing tests. See [Deployment → CI/CD
  Pipeline](/deployment-guide).
- **Manual QA:** each Vercel PR preview build is manually reviewed for functionality and brand
  compliance before merge (see [Deployment Process](#deployment-process) above).
