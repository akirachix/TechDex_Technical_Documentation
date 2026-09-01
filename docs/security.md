# Security

This page consolidates Ishuko's security posture across network, application, data, webhook, and
physical layers, based on the platform's System Architecture Diagram (SAD) — cybersecurity view —
and the auth/data-handling behavior documented elsewhere in this site.

## Security Posture

Ishuko handles two categories of sensitive material end to end: **money** (buyer payments held in
escrow, disbursed to cooperatives) and **trust data** (the AI grade a buyer relies on to pay
without inspecting produce in person). The security architecture is built around protecting both:

- **Defense in depth** — a WAF, an API security layer (JWT, RBAC, input validation, rate limiting,
  MFA), and data-layer encryption all apply independently, so no single control failure exposes the
  system.
- **Least-privilege access** — every role (Buyer, Cooperative Manager, Admin) is scoped to only the
  endpoints and records it needs; admin actions require both MFA and RBAC enforcement on every API
  call.
- **Verifiable money movement** — funds only move on a cryptographically verified event: an OTP
  hash match at pickup, or a signature-verified webhook from Flutterwave.

See [Architecture](/architecture) for the full system diagram this posture is built around.

## Data Classification

| Class | Examples | Handling |
|---|---|---|
| **Credentials** | Passwords, JWT secrets, reset PINs | Never stored in plaintext — passwords are bcrypt-hashed (Passlib); secrets live in environment variables, never source control |
| **Financial data** | Payment amounts, escrow status, Flutterwave/webhook references | Encrypted at rest (AES-256); transaction integrity validated on every webhook |
| **Personal data** | Name, email, phone number (mobile money-linked) | Access restricted by RBAC; only surfaced to the owning user and Admins |
| **Location data** | Cooperative depot GPS coordinates | Encrypted, per the PRD's explicit data-privacy assumption — only used to route buyers to a pickup point |
| **Produce imagery** | The 3 grading photos per batch | Used for AI inference and stored against the listing; not linked to any other cooperative's data |
| **Operational/audit data** | Audit logs, system health alerts | Visible only to Admins via the Admin Web Portal |

## Network Security

- **WAF (Web Application Firewall)** sits in front of all client traffic (mobile and web),
  filtering malicious requests before they reach the API — the first layer in the diagram's
  request path.
- **API Security Layer** — every request that clears the WAF passes through JWT authentication,
  RBAC, input validation & sanitization, and rate limiting/throttling before reaching an
  application module.
- **TLS everywhere** — all client-to-backend traffic (mobile → API, web → API), backend-to-database
  traffic (Postgres read/write), and backend-to-external-service traffic (Location API, Payment
  Provider) is carried over HTTPS/TLS 1.2+.
- **CORS allow-list** — the backend accepts cross-origin requests only from explicitly configured
  frontend origins (`CORS_ORIGINS`), never a wildcard, which matters because the API allows
  credentialed requests. See [Backend → CORS](/backend).

## Application Security

- **Authentication** — JWT bearer tokens (`python-jose`), issued on login, expiring after
  `JWT_EXPIRE_DAYS`. See [Backend → Authentication](/backend).
- **MFA (Multi-Factor Authentication)** — required for cooperative and buyer mobile sessions on
  sensitive actions, and required for every Admin Web Portal sign-in, per the SAD diagram.
- **RBAC (Role-Based Access Control)** — enforced both at the API Security Layer and again on every
  Admin API call (`user_type == "ADMIN"` dependency). See [Backend → Role-Based Access
  Control](/backend).
- **Input Validation & Sanitization** — enforced centrally in the API Security Layer, and again at
  the module level (the Ordering Module and Listing Module both explicitly sanitize inputs before
  persisting).
- **Rate Limiting & Throttling** — protects the API Security Layer and downstream modules from
  abusive or runaway request volume.
- **AI input security** — the grading pipeline only accepts exactly 3 camera-captured images per
  session (gallery upload is disabled client-side — see [Frontend Mobile → Security
  Measures](/frontend-mobile)), constraining the AI's input surface to fresh, on-device captures
  rather than arbitrary uploaded files.

## Data Security

- **Encryption at rest (AES-256)** — applied to the Postgres database per the SAD diagram's
  security controls.
- **Regular, encrypted backups** — Postgres is continuously backup-replicated to Supabase over an
  encrypted channel. See [Database → Backup & Replication](/database).
- **Access control (least privilege)** — database access is scoped to what each backend service
  needs; there is no direct client-to-database path.
- **Audit logs** — retained and reviewable by Admins via the Admin Web Portal.
- **Secrets management** — `JWT_SECRET_KEY`, database credentials, and other sensitive
  configuration are stored as environment/platform variables (Heroku Config Vars, Vercel
  Environment Variables) and are never committed to source control. See [Deployment → Environment
  Variables](/deployment-guide).
- **Mobile offline/local cache** — the Flutter app uses `flutter_secure_storage` for sensitive
  values (e.g. the auth token) and `shared_preferences` for non-sensitive local state; the camera
  bridge blocks gallery access so no produce imagery is cached outside the active grading session.

## Webhook Security

Payment confirmation arrives via a Flutterwave webhook, which is treated as untrusted input until
verified:

- **Webhook signature verification** — every inbound webhook's signature is validated before its
  payload is trusted.
- **Idempotency checks** — a retried or duplicate webhook delivery cannot double-process a payment
  or double-release escrow.
- **Transaction integrity validation** — webhook amounts and references are cross-checked against
  the originating order/payment record before `escrow_status` is updated.
- **Secure API credentials, request signing, and response validation** apply symmetrically to
  outbound calls Ishuko makes to the Payment Provider and Mobile Money Provider APIs.

## Physical Security

Ishuko does not manage physical infrastructure directly — compute runs on managed platforms
(Heroku, Vercel, GCP Cloud Run), which carry their own physical/data-center security
certifications. The platform's own physical-security surface is therefore narrower:

- **Device-level protection on mobile** — auth tokens are kept in secure, OS-level encrypted
  storage (`flutter_secure_storage`) rather than plain shared preferences, so a lost/stolen device
  doesn't trivially expose a session.
- **Camera hardware lock** — the grading camera flow is locked to live capture (no gallery import),
  reducing the risk of pre-staged or tampered images being submitted for grading.
- **Depot handshake as a physical control** — the 6-digit OTP exchange at pickup is, functionally,
  a physical-world access control: it ties the release of funds to a real-world, in-person handoff.

## Incident Response

- **Centralized error visibility** — unhandled backend exceptions surface as 500s and are traceable
  via `heroku logs --tail`. See [Backend → Error Handling](/backend).
- **Audit logging** — the Admin Module's audit log viewer gives Admins a record of security-
  relevant actions to investigate after an incident.
- **System health monitoring & alerts** — Admins monitor system health & alerts from the Admin Web
  Portal, per the SAD diagram, as the first signal of an in-progress incident.
- **Dispute / refund overrides** — Admins have an explicit override path for handling disputed
  transactions, which doubles as a containment tool if a payment-related incident needs manual
  intervention.

## Risk Management

- **Vendor oversight** — Ishuko depends on third parties for critical functions: Flutterwave
  (payments), Airtel/Zamtel/MTN (mobile money), and the Location API (geocoding). Each is a
  single point of dependency risk; webhook signature verification and response validation are the
  primary mitigations against a compromised or misbehaving vendor.
- **Escrow as risk containment** — by design, buyer funds are never released until the pickup OTP
  handshake succeeds, which limits Ishuko's exposure to non-delivery or fraud on either side of a
  transaction.
- **Monitoring** — system health & alert monitoring (Admin Web Portal) is the operational control
  that surfaces vendor or infrastructure risk before it becomes an incident.

## Conclusion

Ishuko's security model layers network filtering (WAF), application-level enforcement (JWT, RBAC,
MFA, input validation, rate limiting), and data-level protection (encryption at rest, encrypted
backups, least-privilege access) around the two things that matter most to the platform: buyer
funds and the integrity of the AI grade that trust is built on. Every money-moving action —
webhook receipt or OTP-based pickup — is independently verified before state changes, and every
admin action is both MFA-gated and RBAC-enforced. The main areas to keep maturing as the platform
scales are formalizing vendor risk reviews (Flutterwave, mobile money providers, Location API) and
evolving the Supabase backup replica's role as read/write volume grows.
