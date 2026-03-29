# Nexus Signal AI

Nexus Signal AI is a real-time AI-powered trading signal platform for stocks and crypto. The platform generates directional trade signals, ranks them by quality, and tracks each signal from entry to outcome.

## Overview

Nexus Signal AI is built to surface high-probability setups using a weighted signal engine that evaluates:

* Confidence
* Risk/Reward
* Momentum
* Volume

Only signals that meet the platform’s quality threshold are shown. The highest-ranked opportunity is highlighted as the **Best Setup Right Now**.

## Core Features

* Real-time stock and crypto signal feed
* AI-ranked trade setups
* LONG / SHORT directional signals
* Entry, stop loss, and TP1–TP3 targets
* Signal confidence scoring
* Signal lifecycle tracking
* Results and performance validation
* Telegram bot integration
* Subscription paywall with free trial support
* Multi-source market data infrastructure

## Signal Logic

Signals are ranked using the following weighted model:

* Confidence: 40%
* Risk/Reward: 25%
* Momentum: 20%
* Volume: 15%

### Visibility Rules

* 70%+ confidence: Strong Setup
* 65–69% confidence: Moderate Setup
* Below 65% confidence: Not shown

### Feed Rules

* Maximum 20 active signals shown
* Top-ranked signal labeled **🔥 Best Setup Right Now**

## Tech Stack

### Frontend

* React
* Deployed on Vercel

### Backend

* Node.js
* Express
* Deployed on Render

### ML / Signal Engine

* Python service
* Deployed on Render

### Database

* MongoDB Atlas

## Live URLs

* Website: `https://www.nexussignal.ai`
* API: `https://api.nexussignal.ai`
* ML Service: `https://nexus-signal-ml.onrender.com`

## Product Structure

### Website

The website is the full product experience and includes:

* Signal feed
* Signal detail pages
* Analytics
* Paywall and subscriptions
* Performance tracking

### Telegram

Telegram acts as a distribution and teaser layer:

* Signal previews
* Pricing access
* Results updates
* Community and announcement flow

Telegram does not generate signals independently. It consumes backend data only.

## Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm start
```

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
```

## Environment Variables

Create a `.env` file and configure the required environment variables for your environment.

Typical categories include:

* API base URLs
* Database connection strings
* Authentication secrets
* Telegram bot credentials
* X integration credentials
* Third-party market data provider keys
* Payment provider keys

Do not commit secrets to source control.

## Deployment

Nexus Signal AI is deployed across:

* **Vercel** for frontend hosting
* **Render** for backend and ML services
* **MongoDB Atlas** for database infrastructure

## Security

If you discover a security issue, please report it responsibly:

* Security: `security@nexussignal.ai`
* Support: `support@nexussignal.ai`

See the repository security policy for full disclosure guidelines.

## Status

Nexus Signal AI is actively developed and production deployed.

## License

Proprietary. All rights reserved.

