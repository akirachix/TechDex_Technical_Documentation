# Frontend — Mobile (Flutter)

This is the interface that cooperative leaders and wholesale buyers interact with on the mobile
app. The interface differs based on the user persona (cooperative manager vs. wholesale buyer).

## Overview

The Ishuko mobile app is the primary, customer-facing surface of the platform — it serves two
distinct personas from a single codebase: **Cooperative Managers**, who register their cooperative,
run AI grading sessions, and manage listings; and **Wholesale Buyers**, who browse the marketplace,
place orders, and complete pickup. Role is determined at signup and drives which screen set a user
sees after authentication.

## Tech Stack

|                       |                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------- |
| **Framework**         | Flutter                                                                                      |
| **Language**          | Dart                                                                                         |
| **Routing**           | `go_router`                                                                                  |
| **State/data access** | `http` client + a `viewmodel/` layer                                                         |
| **Local storage**     | `shared_preferences` (non-sensitive), `flutter_secure_storage` (sensitive — e.g. auth token) |
| **Auth provider**     | Email/password + `google_sign_in`                                                            |
| **Location**          | `geolocator` + `geocoding`                                                                   |
| **Camera/media**      | `image_picker` (camera-only in this flow — see [Security Measures](#security-measures))      |

Full dependency list: see [Dependencies](#dependencies-pubspec-yaml) below.

## Screens

<div class="ishuko-screens">
  <figure>
    <img src="/screenshots/mobile/onboarding.png" alt="Onboarding Carousel" />
    <figcaption>Onboarding carousel</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/sign-up.png" alt="Sign Up Screen" />
    <figcaption>Sign Up (Buyer / Cooperative toggle)</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/login.png" alt="Login Screen" />
    <figcaption>Login Flow</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/forgot-password.png" alt="Forgot Password Screen" />
    <figcaption>Forgot password flow</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/otp-verification.png" alt="OTP Verification Screen" />
    <figcaption>OTP verification</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/allow-location.png" alt="Allow Location Screen" />
    <figcaption>Location permission</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/password-reset.png" alt="Password Reset Screen" />
    <figcaption>Password reset completion</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile-buyer/buyer-home.png" alt="Buyer Home Dashboard" />
    <figcaption>Buyer home dashboard</figcaption>
  </figure>
</div>

### Cooperative screens

<div class="ishuko-screens">
  <figure>
    <img src="/screenshots/mobile/listings-history.png" alt="Listings History" />
    <figcaption>Listings history</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/orders-history.png" alt="Orders History" />
    <figcaption>Orders history</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/payment-history.png" alt="Payment History" />
    <figcaption>Payment history</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/photo-grading.png" alt="3-Photo Grading Input" />
    <figcaption>3-photo grading input</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/ai-analysis.png" alt="AI Analysis Engine" />
    <figcaption>AI analysis pipeline</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/ai-quality-report.png" alt="AI Quality Report" />
    <figcaption>AI Quality Report</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/listing-preview.png" alt="Listing Preview" />
    <figcaption>Listing preview</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/pickup-verification.png" alt="Pickup Verification" />
    <figcaption>Pickup verification (6-digit code)</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/coop-profile.png" alt="Cooperative Profile" />
    <figcaption>Cooperative Profile</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile/coop-support.png" alt="Cooperative Support" />
    <figcaption>Support console</figcaption>
  </figure>
</div>

### Buyer screens

<div class="ishuko-screens">
  <figure>
    <img src="/screenshots/mobile-buyer/marketplace-browse.png" alt="Marketplace Browse" />
    <figcaption>Marketplace browse</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile-buyer/shopping-cart.png" alt="Shopping Cart" />
    <figcaption>Shopping cart</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile-buyer/pickup-date-picker.png" alt="Pickup Date Picker" />
    <figcaption>Pickup date picker (7-day max)</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile-buyer/notifications.png" alt="Notifications Screen" />
    <figcaption>Notifications feed</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile-buyer/buyer-profile.png" alt="Buyer Profile" />
    <figcaption>Profile panel</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/mobile-buyer/buyer-support.png" alt="Contact Support" />
    <figcaption>Contact support</figcaption>
  </figure>
</div>

## How It Works — Cooperative Manager

1. **Registration** — A cooperative manager registers via the mobile app, providing GPS
   coordinates to establish their physical depot location. Sign-up with Google is also available.
   Location is required only for the cooperative flow.
2. **On-Site Grading Session** — To upload a product listing, the manager initializes a grading
   session by uploading **exactly 3 images** of the same batch via the native Ishuko camera
   interface (gallery upload is disabled to prevent reuse of old images).
3. **Grading** — Photos are processed by the centralized AI classification model, which outputs an
   objective grade tag. See [Core Features](/core-features) and the
   [AI Quality Assessment Module](/ai-quality-module) for the grading thresholds and pipeline.
4. **Marketplace Pipeline** — The assigned grade, total weight, and AI image details combine into a
   **Quality Assessment Report**, which includes the auto-assigned market price (sourced from the
   WFP HDX market prices document).
5. **Secure Escrow Lifecycle** — The cooperative manager retrieves money deposited by the buyer
   from a temporary escrow account. The buyer provides a 6-digit code to the manager, granting
   access to retrieve the funds.
6. **Handover & Settlement** — On arrival at the depot, the buyer inspects the batch and hands over
   the 6-digit code. Submitting the code instantly triggers settlement scripts, releasing escrowed
   payment to the seller.

## How It Works — Wholesale Buyer

1. **Registration** — A buyer registers using full name, valid email, and valid phone number.
   Location is **not** required for buyer registration.
2. **Explore Marketplace** — The buyer browses listings posted by cooperative managers. Listings
   show price, grade, and quantity; the buyer cannot purchase a partial quantity.
3. **Placing an Order** — The buyer adds to cart, then selects a pickup date. The pickup date must
   be within **7 days** of the order placement date — dates outside that window are automatically
   disabled.
4. **Notification** — Once funds are deposited into escrow, the buyer receives a notification with
   the cooperative's location and the 6-digit code used by the manager to retrieve funds. The code
   expires within 7 days; an uncollected order is refunded to the buyer with a **5% loss** for
   wasting the cooperative's time.
5. **Collection** — The cycle ends when the buyer receives their order and gives the 6-digit code
   to the cooperative manager, who then retrieves the payment.

## Data Flow Pipelines

Ishuko processes data across three micro-ecosystems: the mobile app (cooperative side), the
centralized FastAPI/AI backend, and the public app marketplace.

**AI Grading**

1. The cooperative manager takes 3 images of the produce via the mobile app camera.
2. The images are sent to the AI, analyzed, and assigned a grade and market price.
3. A Quality Assurance Report is generated.
4. The report is sent to the backend for storage.

**Produce Listings**

- The cooperative manager initializes a listing.
- The app packages raw harvest inputs (quantity, crop type) with the grading image and transmits
  structured multipart form data to the backend via `POST /produce_listings/`.

**Marketplace**

- When a buyer clicks purchase, they select a pickup date within 7 days of order placement.
- A transaction record is created; the backend captures the payment amount, stores it in an
  isolated escrow ledger, and dispatches a cryptographically random, hashed 6-digit OTP to the
  buyer via mobile notification.
- At pickup, the buyer provides the code to the cooperative leader, who submits it via
  `POST /transactions/{id}/release`. If the hash matches, `escrow_status` toggles to `RELEASED`
  and funds are pushed to the seller's mobile money balance.

## Architecture Layers

The `lib/` folder follows a lightweight MVVM-flavored layering rather than a strict framework:

- **`models/`** — plain data classes for API responses (`grade_report_model.dart`,
  `home_model.dart`, `payment_model.dart`) — no business logic, just shape.
- **`viewmodel/`** — mediates between a screen and its services (e.g. `signup_viewmodel.dart`
  drives the sign-up screen's validation and submission state).
- **`services/`** — talks to the outside world: the API (`camera_services.dart`'s upload path,
  `cart_service.dart`), device capabilities (`location_services.dart`), and OS-level features
  (`notification_service.dart`).
- **`screens/`** — the UI layer, split by persona (`buyer/`, `cooperative/`) plus shared
  auth/onboarding screens at the top level.
- **`widgets/` / `components/`** — small, reusable UI pieces shared across screens (e.g.
  `app_bottom_nav_bar.dart`).

## Core Components

- **Routing (`go_router`)** — declarative, role-aware navigation; routes buyers into `screens/buyer/`
  and cooperative managers into `screens/cooperative/` after authentication.
- **API service** — a shared `http`-based client used by the various `services/` files to call the
  FastAPI backend, attaching the stored JWT to authenticated requests.
- **Auth service** — backs login, signup, Google sign-in, and the forgot-password/OTP/reset flow;
  persists the session token via `flutter_secure_storage` rather than `shared_preferences`.
- **Sync/notification service** (`notification_service.dart`) — surfaces OTP codes, pickup
  reminders, and order-status updates pushed from the backend.

## Security Measures

- **Camera-only capture, no gallery import** — the grading flow overrides the native image picker
  configuration to disable gallery selection entirely, so a cooperative manager can only submit
  freshly captured photos, not pre-existing/potentially stale or tampered images.
- **Exactly-3-image validation** — the grading session enforces exactly 3 images client-side before
  the "Grade" action is enabled, matching the AI pipeline's expected input (see
  [AI Quality Assessment Module](/ai-quality-module)).
- **Secure token storage** — the JWT issued at login is stored via `flutter_secure_storage`
  (OS-level encrypted storage), not plain `shared_preferences`, so a lost/rooted device doesn't
  trivially leak an active session.
- **Field-level input validation** — email format, phone number format, and exact 6-digit OTP
  input are all validated client-side before submission (see [Quality Assurance → Unit
  Testing](/quality-assurance)).
- **Location permission is explicit and scoped** — GPS is requested only during cooperative
  registration, with a clear in-app explanation of why ("Your location will be used to direct
  buyers to your depot for produce pickup").

## Installation

**Prerequisites**

- **Flutter SDK** (stable channel) and **Dart** (bundled with Flutter)
- Android Studio / Xcode for platform-specific builds, or a configured emulator/simulator
- A running backend instance (local or the hosted API) reachable from the device/emulator

**Setup**

```bash
cd ishuko
flutter pub get
```

Create a `.env` file (loaded via `flutter_dotenv`) with the backend base URL:

```
API_BASE_URL=http://localhost:8000
```

Run the app:

```bash
flutter run
```

## Troubleshooting

| Symptom                                             | Likely Cause / Fix                                                                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Camera won't open during grading                    | Camera permission was denied — check `permission_handler` request flow and OS-level app permissions                                                          |
| "Allow Location" screen loops or GPS never resolves | Location permission denied, or device location services are off — required only for cooperative registration                                                 |
| OTP not received                                    | SMS/notification gateway delay, or the code already expired (7-day window) — use the in-app "Resend" action                                                  |
| Grading stuck on "Calculating Grade"                | AI service cold start or network timeout — verify the AI microservice health endpoint is reachable (see [Deployment Guide](/deployment-guide))               |
| Google Sign-In fails silently                       | Missing/incorrect OAuth client configuration for the platform (Android/iOS) in `google_sign_in` setup                                                        |
| App can't reach the backend locally                 | `API_BASE_URL` in `.env` points to `localhost` but the app is running on a physical device/emulator that can't resolve it — use the machine's LAN IP instead |

## Folder Structure (`ishuko/`)

```
ishuko/
├── analysis_options.yaml
├── pubspec.yaml
├── README.md
├── android/
├── assets/
│   └── images/
├── fonts/
├── ios/
├── lib/
│   ├── main.dart
│   ├── mock_data.dart
│   ├── components/
│   ├── constants/
│   ├── data/
│   ├── models/
│   ├── screens/
│   ├── services/
│   ├── viewmodel/
│   └── widgets/
├── linux/
├── macos/
├── test/
├── web/
└── windows/
```

### `lib/` — Main Working Directory

```
lib/
├── main.dart
├── mock_data.dart
├── components/
│   ├── nav_arrow_icons.dart
│   └── transition.dart
├── constants/
│   └── app_colors.dart
├── data/
│   └── mock_data.dart
├── models/
│   ├── grade_report_model.dart
│   ├── home_model.dart
│   └── payment_model.dart
├── screens/
│   ├── ai_report_result_screen.dart
│   ├── background.dart
│   ├── forgot_password_otp_screen.dart
│   ├── forgot_password_screen.dart
│   ├── fourth_screen.dart
│   ├── grade_capture_screen.dart
│   ├── home_screen.dart
│   ├── listing_history_screen.dart
│   ├── loading_page.dart
│   ├── loading_screen.dart
│   ├── location_screen.dart
│   ├── login.dart
│   ├── new_password_screen.dart
│   ├── orders_history_screen.dart
│   ├── otp_verification_screen.dart
│   ├── payment_history_screen.dart
│   ├── second_screen.dart
│   ├── signup_screen.dart
│   ├── splashscreen.dart
│   ├── third_screen.dart
│   ├── buyer/
│   │   ├── buyer_home_screen.dart
│   │   ├── buyer_notifications_screen.dart
│   │   ├── marketplace_screen.dart
│   │   ├── orders_screen.dart
│   │   ├── payment_screen.dart
│   │   ├── pickup_date_screen.dart
│   │   └── shopping_cart_screen.dart
│   └── cooperative/
│       ├── listing_preview_screen.dart
│       └── quality_report_screen.dart
├── services/
│   ├── camera_services.dart
│   ├── cart_service.dart
│   ├── location_services.dart
│   └── notification_service.dart
├── viewmodel/
│   └── signup_viewmodel.dart
└── widgets/
    └── app_bottom_nav_bar.dart
```

## Dependencies (`pubspec.yaml`)

**Production**

| Package                  | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `flutter`                | Core Flutter framework                    |
| `cupertino_icons`        | iOS-style icon library                    |
| `http`                   | HTTP client for network requests          |
| `smooth_page_indicator`  | Page indicator for page views             |
| `google_sign_in`         | Google authentication sign-in integration |
| `geolocator`             | Get device GPS location coordinates       |
| `flutter_dotenv`         | Load environment variables from files     |
| `shared_preferences`     | Persistent key-value local storage        |
| `flutter_secure_storage` | Secure storage for sensitive credentials  |
| `go_router`              | Navigation routing for Flutter apps       |
| `image_picker`           | Select images from device storage         |
| `permission_handler`     | Request runtime device permissions        |
| `geocoding`              | Convert GPS coordinates to addresses      |
| `flutter_launcher_icons` | Generate app launcher icons automatically |

**Dev**

| Package                   | Purpose                             |
| ------------------------- | ----------------------------------- |
| `flutter_test`            | Flutter testing framework and tools |
| `flutter_lints`           | Recommended Dart/Flutter lint rules |
| `change_app_package_name` | Change app package name utility     |
