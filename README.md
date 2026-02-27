Real-Time Payment Analytics Dashboard
Overview

This project is a full-stack real-time payment analytics dashboard that simulates a payment processing system and provides live analytics. It demonstrates backend data aggregation, real-time streaming using WebSockets, and a responsive frontend dashboard built with Next.js.

The system continuously generates simulated payment events, stores them in MongoDB, computes analytics metrics, and updates the dashboard in real time without page refresh.

Key Features
Backend (Node.js + Express + MongoDB)

REST APIs for payment analytics:

/api/analytics/metrics – summary metrics

/api/analytics/trends – time-series trend data

MongoDB aggregation pipelines for analytics calculations

Multi-tenant filtering support (tenantId)

Indexed database for performance optimization

WebSocket server for real-time event broadcasting

Rate limiting for API protection

Request logging middleware for monitoring

Structured error handling

Frontend (Next.js)

Real-time analytics dashboard

Metric cards:

Total Volume

Success Rate

Average Amount

Peak Hour

Top Payment Method

Live payment feed

Time-series trend chart

WebSocket auto-reconnect

Pagination for live payments

Connection status indicator

Responsive modern UI

Real-Time System

Automatic payment simulation

WebSocket event broadcasting

Instant dashboard updates

No manual refresh required

Technology Stack

Frontend

Next.js (React)

Recharts (data visualization)

WebSocket API

Backend

Node.js

Express.js

MongoDB

Mongoose

ws (WebSocket library)

Database

MongoDB (local)

Project Architecture
Frontend (Next.js)
      │
      │ REST API
      ▼
Backend (Express)
      │
      ├── MongoDB (storage)
      │
      └── WebSocket Server (real-time events)
Folder Structure
payment-dashboard/
│
├── backend/
│   ├── models/
│   │   └── Payment.js
│   ├── routes/
│   │   └── analytics.js
│   ├── websocket.js
│   ├── db.js
│   └── index.js
│
├── frontend/
│   ├── app/
│   │   └── page.tsx
│   └── package.json
│
└── README.md
Setup Instructions
Prerequisites

Install:

Node.js (v18+)

MongoDB (local installation)

npm

Verify installation:

node -v
npm -v
mongod --version
Backend Setup

Navigate to backend folder:

cd backend
npm install

Start backend:

node index.js

Backend runs on:

http://localhost:4000

WebSocket runs on:

ws://localhost:8080
Frontend Setup

Open new terminal:

cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:3000
API Endpoints
1. Metrics API
GET /api/analytics/metrics

Response:

{
  "totalVolume": 54200,
  "successRate": "95.00",
  "averageAmount": 542,
  "peakHour": 14,
  "topPaymentMethod": "UPI"
}

Optional tenant filter:

GET /api/analytics/metrics?tenantId=tenant_1
2. Trends API
GET /api/analytics/trends?period=day

Parameters:

day

week

month

Response:

[
  {
    "timestamp": 14,
    "amount": 3500,
    "count": 5,
    "successRate": "100.00"
  }
]
WebSocket Event Format

WebSocket URL:

ws://localhost:8080

Event structure:

{
  "type": "payment_received",
  "payment": {
    "tenantId": "tenant_1",
    "amount": 500,
    "method": "UPI",
    "status": "success"
  },
  "timestamp": "2026-02-25T10:30:00Z"
}
Database Schema

Payment document:

{
  tenantId: String,
  amount: Number,
  method: String,
  status: String,
  createdAt: Date
}

Indexes added for:

createdAt

status

tenantId

method

Real-Time Flow

Backend simulates payment

Payment stored in MongoDB

WebSocket broadcasts event

Frontend receives event

Dashboard updates automatically

Performance & Scalability Enhancements

Implemented:

MongoDB indexes

Aggregation pipelines

API rate limiting

WebSocket auto-reconnect

Pagination

Efficient rendering

Assumptions

Payments are simulated automatically

MongoDB runs locally

Single-node deployment

No authentication required for assignment scope

Possible Future Improvements

User authentication

Redis caching

Docker deployment

Cloud deployment (AWS / Azure)

Advanced analytics

Role-based access

Historical data export

How to Test

Start MongoDB

Start backend

Start frontend

Open dashboard:

http://localhost:3000

Observe live updates

Screenshots

### Dashboard Overview
### Connection status and Trend Chart overview 
dashboard-1.png 
### New payment upadation and Load More button overview
dashboard-2.png
(./assests/dashboard.png)

Author

Technical Assignment Submission
Real-Time Payment Analytics Dashboard

Conclusion

This project demonstrates a scalable, real-time analytics system using modern full-stack technologies, including WebSockets, MongoDB aggregation, and Next.js frontend integration.