# Developer Guide

Cross-project conventions that apply regardless of which part of Ishuko you're working in. For
stack-specific conventions, see [Backend](/backend), [Frontend Web](/frontend-web), and
[Frontend Mobile](/frontend-mobile). For domain terminology, see the [Glossary](/glossary).

## Global Code Standards

These apply across the backend, admin dashboard, and mobile app:

- **One component/module per file**, grouped by feature — never bundle unrelated logic into a
  single file for convenience.
- **Naming is consistent across stacks, adapted per language:**

  | Concept | Python (backend) | TypeScript/React (dashboard) | Dart (mobile) |
  |---|---|---|---|
  | Variables/functions | `snake_case` | `camelCase` | `camelCase` |
  | Classes/Components | `PascalCase` | `PascalCase` | `PascalCase` |
  | Constants | `SCREAMING_SNAKE_CASE` | `SCREAMING_SNAKE_CASE` | `SCREAMING_SNAKE_CASE` |
  | Files | `snake_case.py` | `PascalCase.tsx` | `snake_case.dart` |

- **Layered/feature folder structure everywhere** — backend follows
  models → repositories → services → schemas → routers; the dashboard groups by route/feature
  under `app/`; the mobile app groups by `screens/`, `services/`, `models/`, `viewmodel/`.
- **Accessibility is not optional** — all web UI must meet WCAG AA, with semantic HTML and ARIA
  attributes.
- **No secrets in source** — `.env` files and anything containing credentials are gitignored,
  never committed. See [Deployment → Environment Variables](/deployment-guide).

## Testing Conventions

| Layer | Framework | Convention |
|---|---|---|
| Backend (Python) | `pytest` | Mirror the source layer structure (`tests/services/`, `tests/repositories/`); mock external calls (WFP HDX fetch, database) rather than hitting real services |
| Dashboard (Next.js) | Jest + React Testing Library | One test file per component (`ComponentName.test.tsx`), colocated with or mirroring the component's folder |
| Mobile (Flutter) | `flutter_test` | Mirror `lib/` structure under `test/`; widget tests for screens, unit tests for services/viewmodels |

- **Coverage target:** minimum 80% unit test coverage across frontend widgets and backend logic
  (see [Quality Assurance → Release Criteria](/quality-assurance)).
- **Mocking:** external dependencies (payment provider, SMS gateway, WFP HDX price feed, database)
  are mocked in unit tests; real integrations are only exercised in integration tests
  (see [Quality Assurance → Integration Testing](/quality-assurance)).
- **CI enforcement:** `flutter analyze`, lint rules, and the full backend/frontend unit test suite
  run automatically on every GitHub Pull Request — a PR should not merge with a red CI run.

## Git Workflow

- **Branching:** feature branches are cut from `main` (e.g. `feature/escrow-release-endpoint`,
  `fix/pickup-date-validation`). No direct commits to `main`.
- **Pull Requests:** every change targets `main` via PR. Vercel and CI both auto-run against the
  PR (preview build + tests) before review.
- **Review before merge:** at least one reviewer validates functionality, UI/brand compliance
  (dashboard changes), and test coverage before approval.
- **Commit message format:** use conventional, imperative commit messages that state *what* and
  *why*:

  ```
  feat: add escrow release endpoint for pickup verification
  fix: correct pickup date validation to allow exactly 7 days
  chore: bump ultralytics to latest YOLOv8-cls release
  docs: document webhook signature verification flow
  ```

  Common prefixes: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`.
- **Deploy on merge:** merging to `main` triggers automatic production deployment (Heroku for the
  backend, Vercel for the dashboard) — see [Deployment → CI/CD Pipeline](/deployment-guide).

## Glossary

Domain and technical terminology used throughout this documentation lives in its own
[Glossary](/glossary) tab, covering product/business terms, AI/CV terms, backend/infrastructure
terms, and deployment/tooling terms.
