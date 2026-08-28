# Core Features

This page consolidates Ishuko's key features.

## 1. Computer Vision Quality Grading

- Ishuko uses AI to analyze photos of produce and assign an objective quality grade.
- Grades are predefined; every image of maize is classified based on color, insect damage, and
  broken grains.
- A user snaps a photo of a sample placed on a dark, high-contrast mat; the YOLOv8 neural network
  runs a multi-point quality check:
  1. **Damage Detection** — identifies and counts physical surface defects (bruising, punctures,
     insect bites, mechanical damage).
  2. **Maturity & Color Grading** — analyzes color distribution to determine ripeness.
  3. **Pest Detection (e.g. weevils)** — reduces quality and lowers the overall grade.

**Technical approach:** Computer Vision AI + timestamped image metadata. See
[AI Quality Assessment Module](/ai-quality-module) for the full pipeline.

## 2. Grade Assignment Metrics

A strict **weakest-link** evaluation applies: if any single defect parameter crosses a threshold
tier boundary, the entire batch drops to that lower grade.

| Quality Parameter (Defect Class)          | Grade A (Excellent) | Grade B (Good) | Grade C (Average) | Grade D (Poor) | Reject  |
| ----------------------------------------- | ------------------- | -------------- | ----------------- | -------------- | ------- |
| Insect / Pest Damage                      | < 3.0%              | < 6.0%         | < 9.0%            | < 15.0%        | ≥ 15.0% |
| Discolored / Moldy Grain                  | < 3.0%              | < 6.0%         | < 9.0%            | < 15.0%        | ≥ 15.0% |
| Broken / Chipped Grains                   | < 6.0%              | < 7.0%         | < 8.0%            | < 9.0%         | ≥ 9.0%  |
| Extraneous Matter (stones, cob fragments) | < 1.0%              | < 1.5%         | < 2.0%            | < 2.5%         | ≥ 2.5%  |

## 3. Dynamic Pricing Engine

- Once a grade is assigned, price is calculated from **live market prices** pulled from the
  [UN WFP Humanitarian Data Exchange — Zambia Food Prices](https://data.humdata.org/dataset/wfp-food-prices-for-zambia).
- Price modifiers by grade (per the PRD): Excellent = market price, Good = −5%, Average = −15%,
  Poor = −25%.
- The AI technical brief's reference implementation uses: Grade A ×1.10, Grade B ×1.00,
  Grade C ×0.90, Grade D ×0.75, Reject ×0.50 — reconcile these two schemes before launch.
- The displayed price includes the platform fee, which the cooperative is shown transparently.
  **Platform fee: 2% of total price.**

**Technical approach:** price is computed server-side from the grade + the latest WFP price
snapshot and stored on the produce listing (`price_per_kg`).

## 4. Escrow-Backed Transactions

- A temporary escrow account holds buyer funds until the sale is settled, building trust between
  buyer and cooperative.
- Buyers deposit money into escrow after placing an order.
- At pickup, the buyer gives a 6-digit code to the cooperative manager.
- When the cooperative manager enters the code, funds are released instantly to their account and
  the buyer can collect the order.

**Technical approach:** Escrow account API + a deterministic backend timer for automated release /
expiry handling. Backed by the `payment` table's `escrow_status` (`HELD`, `DISBURSED`, `REFUNDED`).

## 5. Secure Dispatch Notifications (OTP)

- After funds are deposited, the buyer receives a notification with the cooperative's location and
  a 6-digit code.
- The code is a cryptographically random, hashed OTP dispatched via mobile notification/SMS
  gateway.
- The code expires within **7 days**; if the buyer has not collected produce by then, they are
  refunded with a **5% cancellation penalty** (compensating the cooperative for wasted time).

**Technical approach:** SMS gateway API + cryptographic token library for single-use code
generation, validated against a stored hash server-side.

## 6. Marketplace

- Bridges cooperative managers and wholesale buyers.
- Displays what each cooperative is selling, including price, grade, and quantity — buyers cannot
  purchase a partial quantity of a listing.
- Buyers select a pickup date **within 7 days** of order placement; dates outside that window are
  disabled in the UI.

## Feature Summary Table

| Feature                         | Description                                                          | Technical Approach                                                    |
| ------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Computer Vision Quality Grading | Analyzes timestamped photos to assign an objective grade (A–D)       | Computer Vision AI (OpenCV + YOLOv8), timestamped image metadata      |
| Escrow-Backed Transactions      | Buyer funds held in escrow, released on 6-digit code match at pickup | Escrow Account API, deterministic backend timer for automated release |
| Secure Dispatch Notifications   | 6-digit OTP sent to buyer to confirm produce pickup                  | SMS gateway API                                                       |
| Dynamic Pricing Engine          | Market-price-linked, grade-adjusted pricing with a 2% platform fee   | Live WFP HDX price feed + grade modifier lookup                       |
| Marketplace                     | Cooperative listings browsable by grade, price, and quantity         | Produce listing API + 7-day pickup date constraint                    |
