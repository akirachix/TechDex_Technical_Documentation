# Architecture

## Core Principles

Ishuko's architecture is guided by a small set of principles that shape every design decision
across the mobile app, dashboard, backend, and AI service:

- **Trust through verification, not intermediaries.** Every produce batch is graded by the same AI
  pipeline and every payment is held in escrow — the system, not a middleman, is the source of
  trust between cooperative and buyer.
- **Separation of concerns by layer.** The backend follows a strict
  models → repositories → services → schemas → routers pattern (see [Backend](/backend)) so
  business logic never leaks into request handling or persistence code.
- **Isolate heavy compute.** The AI grading engine runs as its own containerized service
  (GCP Cloud Run) rather than inside the core API, so a spike in image-processing load can't take
  down auth, orders, or payments.
- **Defense in depth.** No single control is trusted alone — network-level filtering (WAF),
  application-level checks (JWT, RBAC, input validation), and data-level protection (encryption at
  rest, least-privilege access) all apply simultaneously. See [Security](/security) for the full
  breakdown.
- **Least privilege by default.** Every role (Buyer, Cooperative Manager, Admin) can only reach the
  endpoints and data it needs; admin actions additionally require MFA.
- **Idempotent, verifiable money movement.** Escrow release only happens on a validated OTP match;
  payment webhooks are signature-verified and idempotency-checked so a retried webhook can never
  double-disburse funds.

## System Diagram

The diagram below is Ishuko's System Architecture Diagram (SAD) — cybersecurity view — showing how
the three client surfaces (Cooperative mobile, Buyer mobile, Admin web) reach the backend through a
WAF and API security layer, how the application modules talk to external providers, and where each
security control sits.

<div class="ishuko-diagram">
  <figure>
    <img src="/diagrams/system-architecture-diagram.png" alt="SAD" />
    <figcaption>System Architecture Diagram</figcaption>
  </figure>
</div>

## Component Breakdown

| Component                              | Responsibility                                                                                                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WAF (Web Application Firewall)**     | Filters malicious traffic before it reaches the API — first line of defense for all client requests.                                                                       |
| **API Security Layer**                 | Enforces JWT Authentication, RBAC, Input Validation & Sanitization, Rate Limiting & Throttling, and MFA / privileged access control for every request that passes the WAF. |
| **Ordering Module**                    | Validates order data and sanitizes inputs when a buyer places an order.                                                                                                    |
| **Admin Module**                       | User & role management, audit log viewer, system/security configuration — used by the Admin Web Portal.                                                                    |
| **Payment Module**                     | Accepts payment initiation from a buyer and hands funds to escrow.                                                                                                         |
| **Escrow (Protected Funds)**           | Holds funds securely until the OTP-based pickup verification releases them to the cooperative.                                                                             |
| **Pickup Verification**                | Validates the 6-digit code at handover and triggers escrow release.                                                                                                        |
| **Listing Module**                     | Sanitizes inputs, manages, stores, and serves produce listings to the marketplace.                                                                                         |
| **Location Service**                   | Requests the nearest geocoding and returns address data by calling the external Location API — used to direct buyers to a cooperative's depot.                             |
| **Postgres Database**                  | Primary system of record, accessed read/write over encrypted TLS.                                                                                                          |
| **Supabase**                           | Secondary datastore used for encrypted backup replication of the Postgres database.                                                                                        |
| **Payment Provider (Flutterwave API)** | Processes buyer payments; sends signed webhooks back to the Payment Module.                                                                                                |
| **Mobile Money Provider API**          | Airtel / Zamtel / MTN integration used to move funds to/from a user's mobile money account.                                                                                |
| **Admin Web Portal**                   | The Next.js dashboard used by Platform Administrators, gated by MFA and RBAC-enforced admin API calls.                                                                     |

## Data Flow

1. **Cooperative Lead** browses the system, views the marketplace, places pickup orders, and tracks
   order/payment status from the mobile app, over a secure channel (HTTPS/TLS 1.2+) with MFA
   required for sensitive actions.
2. **Buyer** makes an order, views/pays at checkout, and receives a pickup code — same secure
   channel and MFA requirements.
3. Requests from both mobile clients pass through the **WAF**, then the **API Security Layer**
   (JWT → RBAC → input validation → rate limiting → MFA checks) before reaching the
   **Application Modules**.
4. The **Ordering Module** validates the order and hands off to the **Payment Module**, which
   moves funds into **Escrow**. Funds stay protected until **Pickup Verification** confirms the
   OTP handshake, at which point they're released.
5. In parallel, the **Listing Module** serves marketplace data; the **Location Service** calls the
   external **Location API** (over HTTPS/TLS 1.2+) to resolve the cooperative's depot address for
   the buyer's pickup notification.
6. The **Payment Module** and **Escrow** talk to the external **Payment Provider (Flutterwave)**
   and **Mobile Money Provider API** to actually move money; all webhook responses are signature-
   verified, idempotency-checked, and validated for transaction integrity before being trusted.
7. All application modules read/write to **Postgres** over encrypted TLS; Postgres is continuously,
   encryptedly backup-replicated to **Supabase**.
8. The **Admin** actor reaches the **Admin Web Portal** over a separate secure channel with MFA
   required; every admin API call is additionally RBAC-enforced. From the portal, admins manage
   users & roles, configure security settings, review audit logs, monitor system health & alerts,
   and handle dispute/refund overrides.

## Design Guidelines

Visual design follows the Ishuko brand palette sampled directly from the Figma-exported product
screens (see the shared `custom.css` theme):

| Token               | Hex       | Use                                          |
| ------------------- | --------- | -------------------------------------------- |
| Ishuko Green        | `#1B9C25` | Primary buttons / CTAs across mobile and web |
| Ishuko Deep Green   | `#075107` | Hero/auth panels, onboarding backgrounds     |
| Ishuko Accent Green | `#2D724A` | Secondary links (e.g. "Forgot password?")    |
| Ishuko Green Tint   | `#CAF0CD` | Soft highlights, success chips               |

- **Typography:** Roboto across mobile and web.
- **Components:** functional components only (web); one component per file, grouped by feature.
- **Accessibility:** all UI must meet WCAG AA — semantic HTML and ARIA attributes required.
- Full brand compliance detail lives in [Frontend Web → Brand Compliance](/frontend-web) and the
  `docs/.vitepress/theme/custom.css` file in this documentation site's own source.

## Scalability Strategy

- **Stateless application tier.** The FastAPI backend and AI microservice are both stateless
  containers, so horizontal scaling is a matter of adding instances behind the existing routing —
  no session affinity required.
- **Compute isolated from API.** The AI grading service scales independently on GCP Cloud Run
  (memory-bound: ≥2Gi per instance), so image-processing spikes don't compete with API request
  capacity.
- **Read/write separation potential.** Postgres is the single write path today; the encrypted
  Supabase replica is currently backup-only, but is positioned to become a read replica if
  marketplace-browse read load grows faster than write load.
- **Rate limiting at the edge.** Rate Limiting & Throttling in the API Security Layer protects
  downstream modules from abusive or runaway traffic before it reaches business logic.
- **Async-friendly boundaries.** Payment/escrow settlement is already event-driven (webhook →
  validate → update state), which is the natural seam for introducing a message queue if
  transaction volume outgrows synchronous webhook handling.
- **CDN/WAF in front of both surfaces.** The WAF sits in front of client traffic today; the same
  edge layer is the natural place to add caching for marketplace read traffic as usage grows.
