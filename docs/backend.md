# Backend (FastAPI)

## Core Architecture Overview

**System purpose:** Ishuko is an AI-powered agri-tech platform for maize cooperatives to perform
quality assessments via computer vision and list graded products on an integrated marketplace.

<VPButton text="System Architecture Diagram" href="https://lucid.app/lucidchart/86211153-4d03-4c80-84a2-086ba4e011a3/edit?viewport_loc=-2620%2C-1835%2C8728%2C6225%2C0_0&invitationId=inv_cceb6a42-9a03-4f47-afac-dcd132a97274" theme="alt" />

<VPButton text="ERD Document & Diagram" href="https://docs.google.com/document/d/1rmPQ9oDVq9a2rVQOjsuKNhDyMEqxtWVCQz7rV9OZwFg/edit?usp=sharing" theme="alt" />

<VPButton text="Heroku Deployed app" href="https://ishuko-fd4a8483c782.herokuapp.com/docs#/" theme="alt" />

## SAD

<div class="ishuko-screens">
  <figure>
    <img src="/screenshots/SAD.png" alt="SAD" />
    <figcaption>System Architecture Diagram</figcaption>
  </figure>
</div>

## API Overview

|                        |                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**          | FastAPI (Python 3.10+)                                                                                                                               |
| **Architecture style** | REST, layered (models → repositories → services → schemas → routers)                                                                                 |
| **Base path**          | Each resource is mounted under its own prefix, e.g. `/users`, `/cooperatives`, `/produce_listings`, `/orders`, `/payments`, `/transactions`, `/auth` |
| **Response format**    | JSON                                                                                                                                                 |
| **Auth**               | JWT bearer token (`Authorization: Bearer <token>`) on all protected routes                                                                           |

## Prerequisites

To run the backend locally you'll need:

- **Python 3.10+**
- **`uv`** (or `venv`) for virtual environment management
- **PostgreSQL** running locally or a reachable connection string
- **`pip`** for installing dependencies from `requirements.txt`
- A `.env` file populated per [Backend Setup](#backend-setup) below

## Endpoint Categories

| Resource           | Router prefix         | Covers                                                                      |
| ------------------ | --------------------- | --------------------------------------------------------------------------- |
| Auth               | `/auth`               | Login, forgot-password, verify-reset-pin, reset-password                    |
| Users              | `/users`              | Registration, profile, role-scoped access                                   |
| Cooperatives       | `/cooperatives`       | Cooperative registration and depot/location data                            |
| Produce Listings   | `/produce_listings`   | Creating and browsing marketplace listings                                  |
| AI Grading Results | `/ai_grading_results` | Persisted output from the AI grading pipeline                               |
| Orders             | `/orders`             | Order placement, pickup date validation, order status                       |
| Payments           | `/payments`           | Escrow deposits, Flutterwave webhook intake, escrow status                  |
| Transactions       | `/transactions`       | OTP-based pickup verification and settlement (`/transactions/{id}/release`) |

## Tech Stack

| Layer           | Technology                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------ |
| Backend         | FastAPI (layered architecture), hosted on **Heroku**                                       |
| Database        | **PostgreSQL**, object storage on **Amazon S3**                                            |
| Admin Dashboard | **Next.js**                                                                                |
| Mobile App      | **Flutter**                                                                                |
| AI Service      | Python 3.10, FastAPI, OpenCV-Python, Ultralytics YOLOv8-cls, deployed on **GCP Cloud Run** |

### Layered Backend Pattern

- **Models** — the entities running in the backend are defined and initialized.

```python
class Order(Base):
    __tablename__ = "orders"
```

- **Repositories** — sit between models and services.

```python
class OrderRepository:
    def __init__(self):
        self.model = Order

    def get(self, db: Session, order_id: uuid.UUID):
        statement = select(Order).where(
            Order.order_id == order_id, Order.is_deleted == False
        )
        return db.scalar(statement)
```

- **Services** — business logic lives here.

```python
def update_pickup_date_and_status(db: Session, order_id: uuid.UUID, data: OrderUpdate):
    order = get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    validated_pickup_date = validate_pickup_date(data.pickup_date, order.created_at)

    return order_repository.update_pickup_date_and_status(
        db, order.order_id, validated_pickup_date, data.order_status
    )
```

- **Schemas** — data validation and serialization.

```python
class OrderRead(OrderBase):
    order_id: UUID = None
    token_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
```

- **Routers** — endpoint definitions.

```python
router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=list[OrderRead])
def get_orders(db: Session = Depends(get_db)):
    return order_service.get_orders(db)
```

## Backend Setup

```bash
cd TechDex_Backend
uv venv env
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment variables** — create a `.env` in the project root:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/ishuko-db
JWT_SECRET_KEY=<a-long-random-secret>
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=30
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://techdexishukodashboard.vercel.app/login
```

**Database migration**

```bash
alembic upgrade head
```

**Run the backend**

```bash
uvicorn main:app --reload
```

**Confirm it's working:** open the Swagger UI at the deployed backend's `/docs` route. You should
see routers for `users`, `cooperatives`, `produce_listings`, `ai_grading_results`, `orders`,
`payments`, and `transactions`. A successful `GET /users/` (with a valid admin token), or a
successful signup via `POST /users/`, verifies that PostgreSQL connectivity, SQLAlchemy
migrations, and the JWT pipeline are all working.

## Authentication

JWT bearer tokens (`python-jose`) with bcrypt password hashing (`passlib`).

**Flow:**

1. A user registers via `POST /users/` or logs in via `POST /users/login`.
2. On success, the backend issues a signed JWT containing `sub` (user id) and `user_type`,
   expiring after `JWT_EXPIRE_DAYS`.
3. Protected routes depend on `get_current_user`, which decodes the token via `HTTPBearer` and
   loads the user from the database.
4. Admin-only routes additionally depend on `get_admin_user`, which checks `user_type == "ADMIN"`.

## Error Handling

| Status | Meaning               | Typical Cause                                                                                                                                         |
| ------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400    | Bad Request           | Malformed request body/params, or a malformed CORS preflight from an incorrectly formatted allowed-origins value                                      |
| 401    | Unauthorized          | Missing, invalid, or expired JWT — "Not authenticated" means no token sent; "Invalid or expired token" means a token was sent but failed verification |
| 403    | Forbidden             | Valid token, but the user's role lacks permission (e.g. non-admin calling an admin-only route)                                                        |
| 404    | Not Found             | Route/resource doesn't exist — also triggered by a malformed base URL client-side (double slash, or an unset env var resolving to `undefined`)        |
| 500    | Internal Server Error | Unhandled exception on the server — check `heroku logs --tail` for the traceback                                                                      |

**Error handling & logging conventions:**

- Backend: exceptions raised as `HTTPException` with an explicit `status_code` and `detail`;
  unhandled exceptions surface as generic 500s, visible via `heroku logs --tail`.
- Frontend: fetch calls wrapped in try/catch, errors surfaced via a dedicated error state and
  logged to console via `console.error`.

## Code Standards

- **Naming:** `snake_case.py` for backend modules (e.g. `user.py`,
  `user_repository.py`).
- **Python:** `snake_case` for variables/functions, `PascalCase` for classes (e.g.
  `CORSMiddleware`, `CryptContext`).
- **TypeScript/React:** `camelCase` for variables/functions, `PascalCase` for components/types.
- **Folder & file structure:** strict layer-per-resource pattern —
  `ishuko/models`, `ishuko/repositories`, `ishuko/services`, `ishuko/schemas`, `ishuko/routers`, with
  `database.py` and `main.py` at the project root. New code for a resource goes in the matching
  layer file (e.g. registering a new user endpoint → `ishuko/routers/user.py`, calling
  `ishuko/services`, which calls `ishuko/repositories`).

## Release Checklist

- Confirm `CORS_ORIGINS` on Heroku includes the current production frontend URL.
- Confirm `NEXT_PUBLIC_API_URL` on Vercel points to the current production backend URL
  (`https://`, no trailing slash).
- Run `alembic upgrade head` against the production database if there are new migrations.
- Verify `/docs` loads on the deployed backend, and the deployed frontend can load inventory
  without console errors.

## Deployment

### Backend (Heroku)

Config vars are managed under the app's **Settings → Config Vars**:

- `DATABASE_URL` (provisioned automatically by the Heroku Postgres add-on)
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `JWT_EXPIRE_DAYS`
- `CORS_ORIGINS` — comma-separated list of allowed frontend origins, no spaces, no trailing slashes

Deploy via Git:

```bash
git push heroku main
```

Config var changes take effect automatically (Heroku restarts the dyno). Code changes only take
effect after pushing/deploying updated code.

### Frontend (Vercel)

Required environment variable:

- `NEXT_PUBLIC_API_URL` — the backend's full HTTPS URL, no trailing slash, scoped to the
  Production environment. Redeploy required after any env var change.

## Integration

| Service    | Used For                                          | Configuration                                                                                                                                                          |
| ---------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heroku     | Backend hosting (FastAPI app + PostgreSQL add-on) | Config vars: `DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRE_DAYS`, `CORS_ORIGINS`. Deploy via `git push heroku main` or a connected GitHub integration |
| Vercel     | Frontend hosting (Next.js dashboard)              | Env var: `NEXT_PUBLIC_API_URL` (Production scope). Redeploy required after any env var change                                                                          |
| PostgreSQL | Primary relational database                       | Provisioned via Heroku Postgres add-on; schema managed by Alembic migrations                                                                                           |
