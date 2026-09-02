# Overview

**Product:** Ishuko — Maize grading and selling platform

## What Ishuko Does

Ishuko is an agri-tech mobile app that bridges the gap between the cooperatives that sell maize
produce and wholesale buyers that need this maize product. The mobile app allows cooperatives
to obtain quality assessment grades for their maize produce by taking maize images via the app.
The app uses Computer Vision AI to grade the maize into one of four categories:

- **Grade A** — Excellent
- **Grade B** — Good
- **Grade C** — Average
- **Grade D** — Poor

A Quality Assessment Report is generated on the platform that the cooperative can use to market
their produce to buyers on the integrated marketplace. Buyers can place orders and pay for them
via the mobile app. The Ishuko mobile app is built using the Flutter framework.

## Problem Statement

Despite digital platforms providing market access for smallholder farmers in Zambia, smallholder
farmers still have limited access to market and buyers due to poor quality produce, leading to
exploitation by middlemen. Commercial buyers remain highly reluctant to source directly from
small scale farmers due to a critical lack of quality assurance.

## Key Features

Ishuko's core differentiators are covered in full on the [Core Features](/core-features) tab —
in short: AI computer-vision grading, weakest-link quality thresholds, a live-market-price pricing
engine, escrow-backed transactions, OTP-verified pickup, and a grade-first marketplace.

## Workflow Overview

At a high level, a single transaction flows through five stages:

1. **Grade** — a cooperative manager captures exactly 3 photos of a produce sample; the AI pipeline
   assigns a grade (A–D) and generates a Quality Assessment Report.
2. **List** — the graded batch is priced automatically (live market price × grade modifier) and
   published to the marketplace.
3. **Order** — a wholesale buyer browses the marketplace, places an order for a full listed
   quantity, and selects a pickup date within 7 days.
4. **Pay into escrow** — the buyer deposits payment, which is held in escrow rather than paid
   directly to the cooperative; the buyer receives the depot location and a 6-digit pickup code.
5. **Verify & settle** — at the depot, the buyer hands the cooperative manager the code; a
   successful match instantly releases escrowed funds to the cooperative and closes the order.

See [Architecture → Data Flow](/architecture) for the same journey traced through system
components, and [Core Features](/core-features) for the mechanics behind each stage.

## Product Objectives

The Ishuko mobile app aims to solve for:

- **Market access** — smallholder farmers' cooperatives face challenges accessing buyers willing
  to pay market price, solved by automatically allocating market price based on the assigned grade.
- **Subjective grading** — traditional crop grading relies on manual visual inspection by farmers
  or experts, which can lead to arbitrary downgrading and low pricing. This is addressed by an AI
  grading system that assigns a grade based on an image.
- **Cooperative invisibility** — lack of verification and trust is addressed through an AI-generated
  quality assurance grade.

## Intended Users

1. **Cooperative Manager / Leader (Seller)** — registers on the platform, logs harvest quantities,
   and uses the mobile camera to execute AI-driven quality grading sessions.
2. **Wholesale Buyer** — a corporate entity seeking bulk volumes of maize via the platform's
   digital marketplace.

## Out of Scope

| Feature                        | Description                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| Direct-to-Consumer Marketplace | Retail customers buying small quantities directly from farmers          |
| Logistics Fleet Management     | A transport network managing produce movement from farm → depot → buyer |

## Assumptions

- A photographic sample captured by the cooperative leader is a statistically accurate
  representation of the entire aggregated batch, allowing the AI to assign a reliable grade.
- Objective AI grading will bridge the trust gap with wholesalers, eliminating inspection delays
  and ensuring immediate payment to the cooperative.
- Buyers will be willing to pay for produce in full before pickup.
- Most cooperatives and buyers have and use mobile money options like Airtel and Zamtel.
- The buyer can place a later date to pick up their produce.

## Dependencies

- **Airtel Africa Developer Portal (Airtel Money Zambia)** — secure authentication handshakes and
  C2B/B2B/Transaction Refund API access
- **Production SSL & Routing Layer (HTTPS/TLS)** — for asynchronous transaction confirmations and
  telecom webhooks
- **Camera Hardware Bridge Module** — locks image resolution parameters, blocks gallery uploads
- **Image Compression Unit** — compresses images to minimize data usage during transmission
- **Cryptographic Token Library** — generates single-use 6-digit codes
- **YOLOv8 Framework** — scans the image and outputs a grade
- **OpenCV** — handles preprocessing (spatial transforms, exposure normalization, contrast
  enhancement) before quality checking
- **Live Market Data (UN WFP Humanitarian Data Exchange)** — real-time pricing feed:
  [wfp-food-prices-for-zambia](https://data.humdata.org/dataset/wfp-food-prices-for-zambia)
