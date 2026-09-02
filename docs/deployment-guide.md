# Rebuild & Deployment Guide

A practical guide for a software engineer recreating Ishuko from scratch — what to build, in what
order, and how to deploy every piece. This page ties together all the other tabs into a single
build path.

## Deployment Architecture

| Component                     | Hosting                                         | Notes                                                                   |
| ----------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| Core backend (FastAPI)        | Heroku                                          | Behind the WAF + API Security Layer — see [Architecture](/architecture) |
| AI grading microservice       | GCP Cloud Run                                   | Independent, stateless container; scales separately from the core API   |
| Admin web dashboard (Next.js) | Vercel                                          | Auto-deploys from `main`; PR preview builds                             |
| Mobile app (Flutter)          | App stores / TestFlight / internal distribution | Points at the production backend base URL                               |
| Primary database              | Heroku Postgres add-on                          | Encrypted at rest; TLS in transit                                       |
| Backup datastore              | Supabase                                        | Encrypted backup replication target for Postgres                        |
| Payments                      | Flutterwave (API + webhook)                     | Signature-verified, idempotency-checked                                 |
| Mobile money                  | Airtel / Zamtel / MTN APIs                      | Moves funds to/from user mobile money accounts                          |
| Geocoding                     | External Location API                           | Called by the Location Service to resolve depot addresses               |

## 1. Tech Stack At a Glance

| Component           | Stack                                                                                         | Hosting                                         |
| ------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Mobile app          | Flutter (iOS/Android/Web/Desktop targets scaffolded)                                          | App stores / TestFlight / internal distribution |
| Admin web dashboard | Next.js + Tailwind CSS                                                                        | Vercel                                          |
| Core backend API    | FastAPI (Python), layered architecture (models → repositories → services → schemas → routers) | Heroku                                          |
| AI grading service  | Python 3.10, FastAPI, OpenCV-Python, Ultralytics YOLOv8-cls, Docker                           | Google Cloud Platform Cloud Run                 |
| Database            | PostgreSQL + SQLAlchemy ORM + Alembic migrations                                              | Heroku Postgres add-on                          |
| Object storage      | Amazon S3                                                                                     | AWS                                             |
| Auth                | JWT (python-jose) + bcrypt (passlib)                                                          | —                                               |
| Payments            | Escrow ledger + Flutterwave webhook + mobile money (Airtel/Zamtel)                            | —                                               |
| External data       | UN WFP Humanitarian Data Exchange — Zambia Food Prices                                        | —                                               |

## 2. Recommended Build Order

Building the pieces in this order minimizes rework, since each layer depends on the one before it.

### Step 1 — Database schema

Stand up PostgreSQL and model the 6 core tables first — everything else depends on this shape:
`user`, `cooperative`, `produce_listing`, `ai_grading_result`, `payment`, `order`. Full column
definitions are in [Database](/database). Use Alembic from day one so every schema change is a tracked migration.

### Step 2 — Backend core (auth + CRUD)

Scaffold the FastAPI project using the layered pattern (see [Backend](/backend)):

```
backend/
├── main.py
├── database.py
├── models/
├── repositories/
├── services/
├── schemas/
└── routers/
```

Build in this order:

1. `users` router — registration, login, JWT issuance (`get_current_user`, `get_admin_user`
   dependencies), password reset flow (forgot-password → verify-reset-pin → reset-password).
2. `cooperatives` router — registration with GPS capture.
3. `produce_listings` router — `POST /produce_listings/` accepting multipart form data (images +
   metadata).

### Step 3 — AI grading microservice

Build this as an independent service so it can scale/deploy separately from the core API (see
[AI Quality Assessment Module](/ai-quality-module)):

1. Implement the OpenCV contour-segmentation step (`pipeline_process_image`).
2. Train or source a YOLOv8 classification model on the RoboFlow / Kaggle maize datasets.
3. Implement `evaluate_maize_batch` (weakest-link grading logic) and `get_dynamic_valuation`
   (grade → price modifier).
4. Containerize with the provided Dockerfile pattern and deploy to Cloud Run.
5. Wire the core backend's `ai_grading_results` router to call this service and persist results.

### Step 4 — Pricing integration

Pull live prices from the
[WFP HDX Zambia Food Prices dataset](https://data.humdata.org/dataset/wfp-food-prices-for-zambia)
and combine with the grade modifier to compute `price_per_kg` on each listing. Decide and document
one canonical modifier table — the source docs contain two slightly different versions (see the
note in [Core Features](/core-features)) — before writing this logic.

### Step 5 — Marketplace, orders & escrow

1. `orders` router — order creation, pickup-date validation (must be within 7 days of order
   placement).
2. `payments` router — escrow deposit, Flutterwave webhook handler, `escrow_status` state machine
   (`HELD` → `DISBURSED` / `REFUNDED`).
3. OTP generation — cryptographically random 6-digit code, stored as a hash, dispatched via SMS
   gateway; implement the 7-day expiry + 5% cancellation penalty refund logic.
4. `POST /transactions/{id}/release` — validates the OTP hash and triggers settlement (moves funds
   to the cooperative's mobile money balance, releases escrow).

### Step 6 — Mobile app (Flutter)

Build screens in this order, matching real user flow (see [Frontend Mobile](/frontend-mobile)):

1. Auth screens: splash, onboarding, signup (buyer/cooperative toggle), login, forgot
   password/OTP/reset.
2. Cooperative flow: location permission, grading capture (exactly 3 photos, camera-only — disable
   gallery picker), AI report result screen, listing preview, listing history.
3. Buyer flow: marketplace browse, shopping cart, pickup date picker (disable dates beyond 7
   days), payment, order history, notifications.
4. Shared: bottom nav, secure storage for JWT (`flutter_secure_storage`), `notification_service`
   for OTP/pickup alerts.

### Step 7 — Admin web dashboard (Next.js)

1. Login + 2FA-ready auth screen, forgot password flow (mirrors mobile).
2. Dashboard home (aggregate stats: total cooperatives, active regions, avg yield).
3. Cooperative Summary and Buyer Summary tables (searchable, filterable, status badges).
4. Apply Ishuko brand tokens (color palette, Roboto typography) across every component.

### Step 8 — QA pass

Work through [Quality Assurance & Testing](/quality-assurance) before calling any milestone done:
unit tests for OTP generation, cancellation penalty math, and pickup-date constraints; integration
tests for the camera→AI pipeline and the full escrow lifecycle; load test AI inference (target
< 3s) and marketplace query concurrency.

## 3. Environment Variables Reference

### Backend (`TechDex_Backend/.env`)

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/ishuko-db
JWT_SECRET_KEY=<a-long-random-secret>
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=30
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://<your-dashboard>.vercel.app
```

### Admin dashboard (`TechDex_Dashboard/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### AI service

- `MODEL_PATH` — path to the trained YOLOv8-cls weights (e.g. `best_maize_yolov8_cls.pt`)
- Memory: allocate **≥ 2Gi** per container instance

## 4. Local Dev Quickstart

```bash
# 1. Database
createdb ishuko-db

# 2. Backend
cd TechDex_Backend
uv venv env
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
# → verify http://localhost:8000/docs

# 3. AI service (separate repo/container)
docker build -t ishuko-ai .
docker run -p 8080:8080 --memory=2g ishuko-ai
# → verify http://localhost:8080/health

# 4. Admin dashboard
cd TechDex_Dashboard
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev

# 5. Mobile app
cd ishuko
flutter pub get
flutter run
```

## 5. Deployment Checklist

Deploy in this order so downstream URLs are known before upstream config references them:

1. **Database** — provision Heroku Postgres (or managed Postgres of choice); run
   `alembic upgrade head` against it.
2. **AI microservice** — build and push the Docker image; deploy to GCP Cloud Run with ≥ 2Gi
   memory; note the resulting service URL.
3. **Core backend** — deploy to Heroku (`git push heroku main`); set config vars
   (`DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRE_DAYS`, `CORS_ORIGINS`, plus the
   AI microservice URL); confirm `/docs` loads and `GET /users/` works with a valid admin token.
4. **Admin dashboard** — deploy to Vercel from the connected GitHub repo; set
   `NEXT_PUBLIC_API_URL` (Production scope, HTTPS, no trailing slash); redeploy after any env var
   change.
5. **Update CORS** — go back to the Heroku backend and confirm `CORS_ORIGINS` includes the final
   production dashboard URL.
6. **Mobile app** — point the Flutter app's API base URL at the production backend; build release
   binaries; distribute via TestFlight / Play Console internal testing before a public release.
7. **Smoke test end-to-end** — register a cooperative, run a 3-image grading session, publish a
   listing, register a buyer, place an order, deposit to escrow, release via OTP, confirm the
   payment record shows `DISBURSED`.

## 5.5 External Services

| Service                                     | Purpose                                             | Notes                                                                                   |
| ------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **WAF / Cloudflare-class edge**             | Filters malicious traffic before it reaches the API | Sits in front of both mobile and web client traffic — see [Architecture](/architecture) |
| **Flutterwave**                             | Payment processing                                  | Sends signature-verified webhooks on payment events                                     |
| **Airtel / Zamtel / MTN Mobile Money APIs** | Moving funds to/from user accounts                  | Tied to each user's `phone_number`                                                      |
| **SMS / notification gateway**              | Delivers the 6-digit OTP to buyers                  | Also used for order-status and pickup-reminder notifications                            |
| **Location API**                            | Reverse geocoding for depot pickup addresses        | Called by the backend's Location Service                                                |
| **WFP HDX**                                 | Live Zambia maize market prices                     | Polled to compute `price_per_kg` on each listing                                        |

## 5.6 System Integration

Components communicate exclusively over HTTPS/TLS 1.2+:

- **Mobile/Web → Backend:** REST over HTTPS, JWT bearer auth, behind the WAF + API Security Layer.
- **Backend → Postgres:** encrypted read/write; Postgres → Supabase for encrypted backup
  replication.
- **Backend → AI microservice:** internal HTTPS call carrying the grading images; the AI service
  returns grade + defect ratios synchronously within the backend's request/response cycle.
- **Backend ↔ Flutterwave / Mobile Money APIs:** outbound requests are signed; inbound webhooks are
  signature-verified and idempotency-checked before any state change.
- **Backend → Location API:** outbound HTTPS call to resolve a cooperative's depot address for
  buyer pickup notifications.

See the full request-path walkthrough in [Architecture → Data Flow](/architecture#data-flow).

## 5.7 CI/CD Pipeline

- **Trigger:** every GitHub Pull Request against `main` runs `flutter analyze`, lint, and the full
  backend/frontend unit test suite (see [Developer Guide → Testing Conventions](/developer-guide)).
- **Preview builds:** Vercel generates a live preview deployment for every dashboard PR.
- **Deploy on merge:** merging to `main` triggers automatic production deployment — Heroku
  (`git push heroku main` or a connected GitHub integration) for the backend, Vercel for the
  dashboard.
- **Manual gate:** the AI microservice and mobile app builds are deployed via explicit steps
  (Docker image push to Cloud Run; `flutter build` + store submission) rather than being
  auto-deployed on every merge, since both require additional review (model changes, app store
  review) before going live.

## 6. Common Pitfalls (from the Error Handling table)

| Symptom                           | Likely Cause                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| CORS preflight fails with 400     | Malformed `CORS_ORIGINS` value (stray space, trailing slash, missing scheme)                           |
| 401 "Not authenticated"           | No `Authorization: Bearer <token>` header sent at all                                                  |
| 401 "Invalid or expired token"    | Token sent but failed JWT verification/expired                                                         |
| 403 on an admin route             | Valid token, but `user_type != "ADMIN"`                                                                |
| 404 on an otherwise-correct route | Double slash in the base URL, or an unset frontend env var resolving to the literal string `undefined` |
| 500 with no obvious cause         | Unhandled backend exception — check `heroku logs --tail`                                               |

## 7. Definition of Done (Release Criteria)

- ≥ 80% unit test coverage across frontend widgets and backend logic.
- ≥ 95% AI grading precision across Grade A–D thresholds.
- Zero blocking vulnerabilities or failed escrow state loops.
- CI runs `flutter analyze`, lint, and all backend/frontend unit tests on every PR.
- Brand compliance verified on every dashboard build (Ishuko colors, Roboto, logo).
