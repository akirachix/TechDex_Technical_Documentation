# Database & Security

Ishuko uses **PostgreSQL** as its primary database, accessed from the backend via the
**SQLAlchemy** ORM. The schema is organized around 6 main tables.

## User Table

Describes system users; details are captured at signup.

<div class="ishuko-table-wrapper">

| Attribute              | SQL Type     | FastAPI Type | Constraints               | Description                                             |
| ---------------------- | ------------ | ------------ | ------------------------- | ------------------------------------------------------- |
| `user_id`              | UUID         | uuid         | PRIMARY KEY               | Unique identifier for the user                          |
| `first_name`           | VARCHAR(255) | str          | NOT NULL                  | First name                                              |
| `last_name`            | VARCHAR(255) | str          | NOT NULL                  | Last name                                               |
| `email`                | VARCHAR(100) | str          | NOT NULL                  | Email address                                           |
| `phone_number`         | VARCHAR(20)  | str          | UNIQUE, NOT NULL          | Mobile money/SMS-linked number (Airtel, Zamtel, or MTN) |
| `encrypted_pswrd`      | VARCHAR(255) | str          | NOT NULL                  | Hashed password                                         |
| `status`               | ENUM         | enum         | NOT NULL                  | `ACTIVE`, `DEACTIVATED`, `BANNED`                       |
| `role`                 | ENUM         | enum         | NOT NULL                  | `Buyer`, `Cooperative Manager`, `Admin`                 |
| `reset_pin`            | VARCHAR(6)   | str          | NULLABLE                  | Temporary 6-digit verification code                     |
| `reset_pin_expires_at` | TIMESTAMP    | datetime     | NULLABLE                  | Timezone-aware expiration for the reset code            |
| `created_at`           | TIMESTAMP    | datetime     | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp                              |
| `updated_at`           | TIMESTAMP    | datetime     | NOT NULL                  | Last update timestamp                                   |

</div>

## Cooperative Table

Captures cooperative registration data.

<div class="ishuko-table-wrapper">

| Attribute          | SQL Type     | FastAPI Type | Constraints                   | Description                      |
| ------------------ | ------------ | ------------ | ----------------------------- | -------------------------------- |
| `coop_id`          | UUID         | uuid         | PRIMARY KEY                   | Unique identifier                |
| `cooperative_name` | VARCHAR(255) | str          | NOT NULL                      | Registered cooperative name      |
| `coop_leader_id`   | UUID         | uuid         | FOREIGN KEY → `user(user_id)` | The leader's user account        |
| `longitude`        | Numeric(9,6) | float        | NOT NULL                      | GPS longitude captured on device |
| `latitude`         | Numeric(9,6) | float        | NOT NULL                      | GPS latitude captured on device  |
| `created_at`       | TIMESTAMP    | datetime     | DEFAULT CURRENT_TIMESTAMP     | Record creation time             |
| `updated_at`       | TIMESTAMP    | datetime     | NOT NULL                      | Last update time                 |

</div>

## Produce Listing Table

Describes the produce a cooperative is selling — displayed on the marketplace. `price_per_kg`
comes from the WFP HDX Zambia Food Prices dataset; `assigned_grade` comes from the AI quality
checker.

<div class="ishuko-table-wrapper">

| Attribute        | SQL Type      | FastAPI Type | Constraints                          | Description                                                         |
| ---------------- | ------------- | ------------ | ------------------------------------ | ------------------------------------------------------------------- |
| `listing_id`     | UUID          | uuid         | PRIMARY KEY                          | Unique listing identifier                                           |
| `coop_id`        | UUID          | uuid         | FOREIGN KEY → `cooperative(coop_id)` | Owning cooperative                                                  |
| `crop_type`      | VARCHAR(10)   | str          | NOT NULL                             | Crop type being listed                                              |
| `quantity`       | DECIMAL(10,2) | float        | NOT NULL                             | Batch volume                                                        |
| `assigned_grade` | VARCHAR(20)   | str          | NULLABLE                             | AI-assigned grade (A, B, C, D, REJECT)                              |
| `price_per_kg`   | DECIMAL(10,2) | float        | NULLABLE                             | Dynamic calculation from grade + live WFP price                     |
| `created_at`     | TIMESTAMP     | datetime     | NOT NULL                             | Listing creation time                                               |
| `updated_at`     | TIMESTAMP     | datetime     | NOT NULL                             | Last update time                                                    |
| `status`         | ENUM          | enum         | NOT NULL, DEFAULT `PENDING_GRADE`    | `PENDING_GRADE`, `MARKETPLACE`, `REJECTED`, `RESERVED`, `COMPLETED` |

</div>

## AI Grading Result Table

Stores output from the AI quality checker needed for grade assignment.

<div class="ishuko-table-wrapper">

| Attribute         | SQL Type     | FastAPI Type | Constraints                                 | Description                                         |
| ----------------- | ------------ | ------------ | ------------------------------------------- | --------------------------------------------------- |
| `grade_id`        | UUID         | uuid         | PRIMARY KEY                                 | Unique AI assessment identifier                     |
| `listing_id`      | UUID         | uuid         | FOREIGN KEY → `produce_listing(listing_id)` | The batch evaluated                                 |
| `insect_dmg_pct`  | DECIMAL(5,2) | float        | NOT NULL                                    | Insect/pest/weevil damage percentage                |
| `discoloured_pct` | DECIMAL(5,2) | float        | NOT NULL                                    | Discoloration/moldy seed percentage                 |
| `broken_pct`      | DECIMAL(5,2) | float        | NOT NULL                                    | Chipped/broken seed percentage                      |
| `extraneous_pct`  | DECIMAL(5,2) | float        | NOT NULL                                    | Non-grain matter percentage (stones, cob fragments) |
| `assessed_at`     | TIMESTAMP    | datetime     | NOT NULL                                    | Time the AI inference completed                     |

</div>

## Payment Table

Details of buyer payments after an order is placed; sourced from the Flutterwave webhook.

<div class="ishuko-table-wrapper">

| Attribute          | SQL Type      | FastAPI Type | Constraints                     | Description                                      |
| ------------------ | ------------- | ------------ | ------------------------------- | ------------------------------------------------ |
| `payment_id`       | UUID          | uuid         | PRIMARY KEY                     | Unique transaction identifier                    |
| `order_id`         | UUID          | uuid         | FOREIGN KEY → `order(order_id)` | The related order                                |
| `gross_amount`     | DECIMAL(10,2) | float        | NOT NULL                        | Total amount paid by the wholesaler              |
| `platform_fee`     | DECIMAL(10,2) | float        | NOT NULL                        | System fee (2% of gross amount)                  |
| `net_disbursement` | DECIMAL(10,2) | float        | NOT NULL                        | Final payout to the cooperative (98%)            |
| `escrow_status`    | ENUM          | enum         | NOT NULL, DEFAULT `HELD`        | `HELD`, `DISBURSED`, `REFUNDED`                  |
| `transaction_ref`  | VARCHAR(100)  | str          | NOT NULL                        | External webhook receipt token from telecom APIs |
| `flutterwave_ref`  | VARCHAR(100)  | str          | NULLABLE                        | Flutterwave's internal receipt token             |
| `created_at`       | TIMESTAMP     | datetime     | DEFAULT CURRENT_TIMESTAMP       | Payment fulfillment time                         |

</div>

## Order Table

Individual orders placed by buyers; a token number is generated per order.

<div class="ishuko-table-wrapper">

| Attribute      | SQL Type   | FastAPI Type | Constraints                                 | Description                                            |
| -------------- | ---------- | ------------ | ------------------------------------------- | ------------------------------------------------------ |
| `order_id`     | UUID       | uuid         | PRIMARY KEY                                 | Unique order identifier                                |
| `listing_id`   | UUID       | uuid         | FOREIGN KEY → `produce_listing(listing_id)` | The AI-verified batch purchased                        |
| `buyer_id`     | UUID       | uuid         | FOREIGN KEY → `user(buyer_id)`              | The purchasing wholesaler                              |
| `pickup_date`  | DATE       | date         | NOT NULL                                    | Buyer-selected pickup date                             |
| `token_number` | VARCHAR(6) | str          | NOT NULL                                    | Single-use code for the depot handshake                |
| `created_at`   | TIMESTAMP  | datetime     | NOT NULL                                    | Order placement time                                   |
| `updated_at`   | TIMESTAMP  | datetime     | NOT NULL                                    | Last update time                                       |
| `order_status` | ENUM       | enum         | NOT NULL                                    | `AWAITING_DEPOSIT`, `ESCROWED`, `COLLECTED`, `EXPIRED` |

</div>

## Backup & Replication

Per the system architecture diagram, Postgres is backed up via **encrypted backup replication** to
a **Supabase** instance. This is currently a backup target rather than a live read replica — see
[Scalability Strategy](/architecture#scalability-strategy) for how this could evolve into read
scaling. Regular backups are encrypted at rest, in line with the
[Data Security](/security#data-security) controls.
