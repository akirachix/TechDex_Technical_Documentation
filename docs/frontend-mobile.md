# Frontend — Mobile (Flutter)

This is the interface that cooperative leaders and wholesale buyers interact with on the mobile
app. The interface differs based on the user persona (cooperative manager vs. wholesale buyer).

## Cooperative Journey

<div class="ishuko-screens">
  <figure>
    <img src="/screenshots/mobile/splash.png" alt="Screen" />
  </figure>
  <figure>
    <img src="/screenshots/mobile/screen1.png" alt="Screen" />
  </figure>
  <figure>
    <img src="/screenshots/mobile/screen2.png" alt="Screen" />
  </figure>
  <figure>
    <img src="/screenshots/mobile/screen3.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen4.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen5.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen6.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen7.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen8.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen9.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen10.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen11.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen12.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen13.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen14.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen15.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen16.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen17.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen18.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen19.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen20.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile/screen21.png" alt="Screen" />
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

## Buyer Journey

<div class="ishuko-screens">
  <figure>
    <img src="/screenshots/mobile-buyer/screen1.png" alt="Screen" />
  </figure>
  <figure>
    <img src="/screenshots/mobile-buyer/screen2.png" alt="Screen" />
  </figure>
  <figure>
    <img src="/screenshots/mobile-buyer/screen3.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen4.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen5.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen6.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen7.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen8.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen9.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen10.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen11.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen12.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen13.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen14.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen15.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen16.png" alt="Screen" />
  </figure>
   <figure>
    <img src="/screenshots/mobile-buyer/screen17.png" alt="Screen" />
  </figure>
</div>

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
