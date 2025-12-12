# SafiLocate - Functional Specification Document (Developer Handbook)

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Active Development

> 📚 **Documentation Index**: See the [Documentation README](../../README.md) for all available documentation.

**Related Documents:**
- [Code Review & Action Plan](../planning/CODE_REVIEW_AND_ACTION_PLAN.md) - Implementation roadmap
- [Business Logic Recommendations](../planning/BUSINESS_LOGIC_RECOMMENDATIONS.md) - Confirmed business decisions
- [Testing Guide](../guides/testing/TESTING_GUIDE.md) - Testing procedures
- [Quick Start Guide](../guides/setup/QUICK_START_TESTING.md) - Setup instructions

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture & Design](#architecture--design)
4. [Database Schema & Data Models](#database-schema--data-models)
5. [API Specifications](#api-specifications)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [User Flows & Use Cases](#user-flows--use-cases)
9. [Integration Specifications](#integration-specifications)
10. [Security Specifications](#security-specifications)
11. [Performance Requirements](#performance-requirements)
12. [Error Handling & Validation](#error-handling--validation)
13. [Testing Strategy](#testing-strategy)
14. [Deployment & DevOps](#deployment--devops)
15. [Development Guidelines](#development-guidelines)
16. [Appendix](#appendix)

---

## Executive Summary

### Project Overview

SafiLocate is a centralized digital platform for lost and found items in Rwanda. The platform connects people who have lost items with those who have found them, making the recovery process efficient, accessible, and trustworthy.

### Business Model

- **Free Side**: Found item reporting (encourages platform growth)
- **Paid Side**: Lost item listings (primary revenue stream)
- **Target Market**: Rwanda, with focus on mobile-first users

### Key Metrics

- **Performance Target**: <1.5s page load on 3G networks
- **Mobile-First**: 80%+ of users access via mobile devices
- **Availability**: 99.5% uptime target

---

## System Overview

### Problem Statement

In Rwanda, recovering lost items (IDs, phones, documents) is inefficient, relying on fragmented word-of-mouth, radio announcements, or informal social media posts. There is no centralized, trusted digital registry.

### Solution

A mobile-first web platform that:
- Enables free reporting of found items
- Provides paid listings for lost items
- Connects seekers with finders through intelligent search
- Ensures trust through verification and moderation

### Target Users

1. **Everyday Citizens**: People who lose or find personal items
2. **"Super Finders"**: Moto drivers, taxi operators, cleaners, security guards
3. **Venues/Institutions**: Banks, bars, transport cooperatives managing lost property

### Core Features

1. **Report Found Item** (Free) - Frictionless form for finders
2. **Report Lost Item** (Paid) - Detailed listing with payment
3. **Search & Match** - Mobile-optimized search with filters
4. **Claiming Process** - Secure ownership verification
5. **Admin Dashboard** - Content moderation and management

---

## Architecture & Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Home   │  │  Search  │  │  Report  │  │  Admin   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  State Management: TanStack Query                            │
│  Routing: Wouter                                             │
│  Styling: Tailwind CSS + Radix UI                           │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/HTTPS (REST API)
                        │ WebSocket (Real-time updates)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 Application Layer (Express)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Public API   │  │  Admin API   │  │  Webhooks    │       │
│  │  Routes      │  │  Routes      │  │  Handlers    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Auth        │  │  Payment     │  │  AI Service  │       │
│  │  Service     │  │  Service     │  │  (OpenAI)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │ Flutterwave  │ │   OpenAI     │
│  Database    │ │   Gateway    │ │     API      │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.1.9
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 4.1.14
- **UI Components**: Radix UI + shadcn/ui
- **Routing**: Wouter 3.3.5
- **State Management**: TanStack Query 5.60.5
- **Forms**: React Hook Form 7.66.0 + Zod 3.25.76
- **Animations**: Framer Motion 12.23.24

#### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express 4.21.2
- **Language**: TypeScript 5.6.3
- **ORM**: Drizzle ORM 0.39.3
- **Authentication**: Passport.js 0.7.0 + Passport Local 1.0.0
- **Sessions**: Express Session 1.18.1 + connect-pg-simple 10.0.0
- **Validation**: Zod 3.25.76

#### Database
- **Database**: PostgreSQL
- **Migration Tool**: Drizzle Kit 0.31.4

#### External Services
- **Payments**: Flutterwave
- **AI**: OpenAI (GPT-4o-mini)
- **Image Storage**: Cloudinary (planned)

### Design Principles

1. **Mobile-First**: All designs prioritize mobile experience
2. **Performance**: Optimize for 3G networks (<1.5s load time)
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Stateless**: Backend is stateless for horizontal scaling
5. **Type Safety**: Full TypeScript coverage

---

## Database Schema & Data Models

### Current Schema (IMPLEMENTED)

#### Users Table

```typescript
users {
  id: varchar (PK, UUID, default: gen_random_uuid())
  username: text (NOT NULL, UNIQUE)
  password: text (NOT NULL, hashed with bcrypt)
  role: enum ('user', 'admin', 'moderator') (default: 'user')
  email: text (nullable)
  phone: text (nullable, Rwanda format)
  is_active: boolean (default: true)
  created_by: varchar (FK -> users.id, nullable)
  created_at: timestamp (default: now())
  updated_at: timestamp (default: now())
}
```

**Zod Schema:**
```typescript
insertUserSchema = {
  username: string (min 3, max 50)
  password: string (min 8)
  email: string (optional, email format)
  phone: string (optional, Rwanda format)
  role: 'user' | 'admin' | 'moderator' (default: 'user')
}
```

### Implemented Schema (Phase 1 Complete)

#### Found Items Table (IMPLEMENTED)

```typescript
found_items {
  id: varchar (PK, UUID)
  category: varchar (NOT NULL) // id_document, electronics, wallet, keys, clothing, other
  title: varchar (NOT NULL, max 200)
  description: text (NOT NULL)
  location: varchar (NOT NULL)
  date_found: date (NOT NULL)
  image_urls: text[] (nullable, max 3 images)
  contact_name: varchar (NOT NULL)
  contact_phone: varchar (NOT NULL) // Rwanda format: +2507XXXXXXXX
  finder_email: text (nullable) // For notifications
  finder_phone: text (nullable) // For SMS notifications
  status: enum (default: 'pending') // pending, active, claimed, archived, expired, rejected
  tags: text[] // AI-generated tags
  receipt_number: varchar (UNIQUE) // Format: FND-XXXXX
  finder_id: varchar (FK -> users.id, nullable)
  created_at: timestamp (default: now())
  updated_at: timestamp (default: now())
}
```

**Business Logic (Confirmed):**
- ✅ Free to report
- ✅ Status starts as 'pending'
- ✅ Admin approval required before 'active'
- ✅ Receipt number auto-generated (FND-XXXXX)
- ✅ Max 3 images per item
- ✅ Email notifications for claims

#### Lost Items Table (IMPLEMENTED)

```typescript
lost_items {
  id: varchar (PK, UUID)
  category: varchar (NOT NULL)
  title: varchar (NOT NULL, max 200)
  description: text (NOT NULL)
  location: varchar (NOT NULL) // Last seen location
  date_lost: date (NOT NULL)
  image_urls: text[] (nullable, max 3 images)
  reward: decimal (nullable) // Optional reward amount
  contact_name: varchar (NOT NULL)
  contact_phone: varchar (NOT NULL)
  seeker_email: text (nullable) // For notifications
  seeker_phone: text (nullable) // For SMS notifications
  status: enum (default: 'pending') // pending, active, claimed, archived, expired, rejected
  payment_status: enum (default: 'unpaid') // unpaid, pending, paid, failed, cancelled
  price_tier: enum (default: 'standard') // standard, premium, urgent, custom
  custom_price: decimal (nullable) // Only if price_tier === 'custom'
  listing_fee: decimal (NOT NULL) // Actual amount paid
  expires_at: timestamp (nullable) // 30 days from payment confirmation
  tags: text[] // AI-generated tags
  seeker_id: varchar (FK -> users.id, nullable)
  created_at: timestamp (default: now())
  updated_at: timestamp (default: now())
}
```

**Business Logic (Confirmed):**
- ✅ Payment required (tiered pricing: standard 1000, premium 2000, urgent 3000 RWF)
- ✅ Admin can override with custom price
- ✅ Fixed 30-day duration from payment
- ✅ 7-day grace period for renewal
- ✅ Auto-archive after expiration
- ✅ Max 3 images per item

#### Claims Table (IMPLEMENTED)

```typescript
claims {
  id: varchar (PK, UUID)
  item_id: varchar (NOT NULL) // FK to found_items.id or lost_items.id
  item_type: varchar (NOT NULL) // 'found' or 'lost'
  claimant_name: varchar (NOT NULL)
  claimant_phone: varchar (NOT NULL) // Rwanda format
  claimant_email: varchar (nullable)
  description: text (NOT NULL) // Proof of ownership (min 50 chars)
  evidence_photos: text[] (nullable) // Optional evidence photos
  status: enum (default: 'pending') // pending, verified, rejected, resolved
  verified_at: timestamp (nullable)
  verified_by: varchar (FK -> users.id, nullable) // Finder or admin
  admin_notes: text (nullable) // Admin-only notes
  created_at: timestamp (default: now())
  updated_at: timestamp (default: now())
}
```

**Business Logic (Confirmed):**
- ✅ Multiple claims allowed per item
- ✅ Description-based verification (min 50 chars)
- ✅ Optional evidence photos
- ✅ Finder decides verification
- ✅ Admin can override
- ✅ Email notification sent to finder

#### Payments Table (IMPLEMENTED)

```typescript
payments {
  id: varchar (PK, UUID)
  lost_item_id: varchar (FK -> lost_items.id, NOT NULL)
  amount: decimal (NOT NULL)
  currency: varchar (default: 'RWF')
  flutterwave_tx_ref: varchar (UNIQUE, NOT NULL) // Unique transaction reference
  flutterwave_id: varchar (nullable) // Flutterwave transaction ID
  status: enum (NOT NULL) // pending, success, failed, cancelled
  payment_method: varchar (nullable) // card, mobile_money, bank_transfer
  paid_at: timestamp (nullable) // When payment was confirmed
  created_at: timestamp (default: now())
  updated_at: timestamp (default: now())
}
```

**Business Logic (Confirmed):**
- ✅ Payment via Flutterwave gateway
- ✅ Supports Mobile Money and Card payments
- ✅ Webhook verification for security
- ✅ Payment status tracked throughout lifecycle

#### Reports Table (IMPLEMENTED)

```typescript
reports {
  id: varchar (PK, UUID)
  item_id: varchar (FK -> found_items.id or lost_items.id, nullable)
  claim_id: varchar (FK -> claims.id, nullable)
  reporter_email: text (nullable) // Optional, for follow-up
  reason: enum (NOT NULL) // spam, scam, wrong_category, inappropriate, fraudulent, harassment
  description: text (nullable) // Optional additional details
  status: enum (default: 'pending') // pending, reviewed, resolved, dismissed
  reviewed_by: varchar (FK -> users.id, nullable) // Admin who reviewed
  reviewed_at: timestamp (nullable)
  created_at: timestamp (default: now())
}
```

**Business Logic (Confirmed):**
- ✅ Users can report suspicious items/claims
- ✅ Anonymous reporting (email optional)
- ✅ Admin reviews and takes action
- ✅ Rate limiting: Max 3 reports per IP per day

#### Sessions Table (connect-pg-simple)

```typescript
session {
  sid: varchar (PK)
  sess: json (NOT NULL)
  expire: timestamp (NOT NULL)
}
```

**Note:** This table is created automatically by `connect-pg-simple` when session middleware is configured.

### Indexes (IMPLEMENTED)

All indexes are defined in the schema using Drizzle's `index()` function. The following indexes are automatically created:

**Found Items Indexes:**
- `idx_found_items_category` - Category filtering
- `idx_found_items_status` - Status filtering
- `idx_found_items_location` - Location filtering
- `idx_found_items_created_at` - Date sorting
- `idx_found_items_tags` - GIN index for tag array searches
- `idx_found_items_receipt_number` - Receipt lookup

**Lost Items Indexes:**
- `idx_lost_items_category` - Category filtering
- `idx_lost_items_status` - Status filtering
- `idx_lost_items_payment_status` - Payment status filtering
- `idx_lost_items_location` - Location filtering
- `idx_lost_items_expires_at` - Expiration date filtering
- `idx_lost_items_tags` - GIN index for tag array searches
- `idx_lost_items_created_at` - Date sorting

**Claims Indexes:**
- `idx_claims_item_id` - Item lookup
- `idx_claims_status` - Status filtering
- `idx_claims_created_at` - Date sorting

**Payments Indexes:**
- `idx_payments_lost_item_id` - Item lookup
- `idx_payments_tx_ref` - Transaction reference lookup
- `idx_payments_status` - Status filtering
- `idx_payments_created_at` - Date sorting

**Reports Indexes:**
- `idx_reports_item_id` - Item lookup
- `idx_reports_claim_id` - Claim lookup
- `idx_reports_status` - Status filtering
- `idx_reports_created_at` - Date sorting

**Full-Text Search:**
Full-text search indexes can be added via migration:
```sql
CREATE INDEX idx_found_items_search ON found_items USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_lost_items_search ON lost_items USING GIN(to_tsvector('english', title || ' ' || description));
```

### Relationships (IMPLEMENTED)

```
users (1) ──< (0..*) found_items (via finder_id)
users (1) ──< (0..*) lost_items (via seeker_id)
users (1) ──< (0..*) claims (via verified_by)
users (1) ──< (0..*) reports (via reviewed_by)
users (1) ──< (0..*) users (via created_by, for admin tracking)

found_items (1) ──< (0..*) claims (via item_id where item_type='found')
lost_items (1) ──< (0..*) claims (via item_id where item_type='lost')
lost_items (1) ──< (1..*) payments (via lost_item_id)

found_items (1) ──< (0..*) reports (via item_id)
lost_items (1) ──< (0..*) reports (via item_id)
claims (1) ──< (0..*) reports (via claim_id)
```

---

## Confirmed Business Logic Decisions

### Pricing Structure

**Tiered Fixed Pricing:**
```typescript
const LISTING_PRICES = {
  standard: 1000,  // RWF - Default for most items
  premium: 2000,   // RWF - For high-value items (electronics, laptops)
  urgent: 3000,    // RWF - For urgent/priority listings
  custom: null,    // Admin can set custom price
};
```

- Default: 1000 RWF (standard tier)
- User selects tier during form submission
- Admin can override with custom price
- Price stored in `lost_items.price_tier` and `lost_items.listing_fee`

### Listing Duration

- **Fixed Duration**: 30 days from payment confirmation
- **Auto-Expiration**: Status changes to `expired` after 30 days
- **Grace Period**: 7 days after expiration where item can be renewed
- **Renewal**: User can pay again to extend for another 30 days
- **Auto-Archive**: Expired items are archived after grace period

### Image Limits

- **Max File Size**: 5MB per image
- **Max Images**: 3 images per item
- **Formats**: JPEG, PNG, WebP only
- **Auto-Optimization**: Resize to max 1200x1200px, compress to 80% quality

### Notifications

**Phase 1 (MVP):**
- Email notifications only (free tier service)
- Notification sent when claim is submitted
- Simple email template with claim details

**Phase 2 (Post-MVP):**
- SMS notifications via Twilio/AfricasTalking
- SMS for urgent claims (high-value items)
- In-app notifications (future)

### Search Ranking

Multi-factor relevance scoring:
```typescript
relevanceScore = (
  textMatchScore * 0.4 +      // Full-text search match quality
  tagMatchScore * 0.3 +       // Tag overlap
  locationProximity * 0.2 +   // Location match (if provided)
  recencyScore * 0.1          // How recent (newer = higher)
)

// Sort order:
1. Status: active > pending > expired
2. Relevance score (descending)
3. Created date (newer first)
```

### Claim Verification

- **Required**: Detailed description (min 50 chars) of unique features
- **Optional**: Evidence photos (max 3)
- **Verification**: Finder reviews and decides
- **Admin Override**: Admin can verify/reject if finder doesn't respond in 7 days
- **Multiple Claims**: Allowed per item
- **Contact Sharing**: Only after verification

### Duplicate Prevention

3-layer detection system:
1. **Client-Side**: Warning before submit if similar items found
2. **Backend Validation**: Fuzzy matching on title/location (80% similarity threshold)
3. **Admin Review**: Dashboard shows potential duplicates for manual review

### Reporting System

- Users can report suspicious items/claims
- Reasons: spam, scam, wrong_category, inappropriate, fraudulent, harassment
- Anonymous reporting (email optional)
- Admin reviews and takes action
- Rate limiting: Max 3 reports per IP per day

---

## API Specifications

### Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://safilocate.com`

### Authentication

#### Session-Based Authentication

All authenticated endpoints require a valid session cookie. Sessions are managed via `express-session` with PostgreSQL storage.

**Headers:**
```
Cookie: connect.sid=<session-id>
```

#### Admin Authentication

Admin endpoints require additional role verification:
- User must be authenticated
- User must have `role: 'admin'` in session

### API Endpoints

#### Public Endpoints

##### GET /api/items

List all active items (found and lost).

**Query Parameters:**
- `type`: `'found' | 'lost' | 'all'` (default: `'all'`)
- `category`: Category filter (optional)
- `location`: Location filter (optional)
- `search`: Text search query (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```typescript
{
  items: Array<{
    id: string;
    type: 'found' | 'lost';
    category: string;
    title: string;
    description: string;
    location: string;
    dateFound?: string;
    dateLost?: string;
    imageUrl?: string;
    reward?: number;
    status: string;
    createdAt: string;
    tags?: string[];
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid query parameters
- `500`: Server error

##### GET /api/items/:id

Get detailed information about a specific item.

**Response:**
```typescript
{
  id: string;
  type: 'found' | 'lost';
  category: string;
  title: string;
  description: string;
  location: string;
  dateFound?: string;
  dateLost?: string;
  imageUrl?: string;
  reward?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  contactName?: string; // Only if user is owner or admin
  contactPhone?: string; // Only if user is owner or admin
}
```

**Status Codes:**
- `200`: Success
- `404`: Item not found
- `500`: Server error

##### POST /api/items/found

Report a found item (free).

**Request Body:**
```typescript
{
  category: string; // Required
  title: string; // Required, min 3 chars
  description: string; // Required, min 10 chars
  location: string; // Required, min 3 chars
  dateFound: string; // Required, ISO date format
  imageUrl?: string; // Optional, base64 or URL
  contactName: string; // Required, min 2 chars
  contactPhone: string; // Required, Rwanda format: +2507XXXXXXXX
}
```

**Response:**
```typescript
{
  id: string;
  receiptNumber: string; // Format: FND-XXXXX
  message: string;
  item: {
    // Full item object
  };
}
```

**Status Codes:**
- `201`: Created
- `400`: Validation error
- `500`: Server error

##### POST /api/items/lost

Report a lost item (requires payment).

**Request Body:**
```typescript
{
  category: string; // Required
  title: string; // Required, min 3 chars
  description: string; // Required, min 10 chars
  location: string; // Required, min 3 chars
  dateLost: string; // Required, ISO date format
  imageUrl?: string; // Optional
  reward?: number; // Optional
  contactName: string; // Required
  contactPhone: string; // Required, Rwanda format
}
```

**Response:**
```typescript
{
  id: string;
  paymentUrl: string; // Flutterwave payment URL
  paymentReference: string; // Unique payment reference
  amount: number;
  currency: string;
}
```

**Status Codes:**
- `201`: Created, payment required
- `400`: Validation error
- `500`: Server error

##### POST /api/search

Advanced search with filters.

**Request Body:**
```typescript
{
  query?: string; // Text search
  type?: 'found' | 'lost' | 'all';
  category?: string;
  location?: string;
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  tags?: string[]; // Array of tags
  page?: number;
  limit?: number;
}
```

**Response:** Same as `GET /api/items`

##### POST /api/items/:id/claim

Submit a claim for an item.

**Request Body:**
```typescript
{
  claimantName: string; // Required
  claimantPhone: string; // Required, Rwanda format
  claimantEmail?: string; // Optional
  description: string; // Required, proof of ownership
}
```

**Response:**
```typescript
{
  id: string;
  claimNumber: string; // Format: CLM-XXXXX
  status: 'pending';
  message: string;
}
```

**Status Codes:**
- `201`: Claim submitted
- `400`: Validation error
- `404`: Item not found
- `409`: Claim already exists
- `500`: Server error

#### Payment Endpoints

##### POST /api/payments/initialize

Initialize a payment for a lost item listing.

**Request Body:**
```typescript
{
  lostItemId: string; // Required
  amount: number; // Required, in RWF
}
```

**Response:**
```typescript
{
  paymentUrl: string; // Flutterwave checkout URL
  paymentReference: string; // Unique reference
  expiresAt: string; // ISO timestamp
}
```

##### POST /api/webhooks/flutterwave

Flutterwave webhook endpoint for payment callbacks.

**Headers:**
```
verif-hash: <Flutterwave webhook hash>
```

**Request Body:** (Flutterwave webhook payload)

**Response:**
```typescript
{
  status: 'success' | 'failed';
  message: string;
}
```

**Status Codes:**
- `200`: Webhook processed
- `400`: Invalid webhook
- `401`: Invalid signature
- `500`: Server error

#### Admin Endpoints

All admin endpoints require authentication and admin role.

##### GET /api/admin/items

Get all items with admin details.

**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by type
- `page`: Page number
- `limit`: Items per page

**Response:**
```typescript
{
  items: Array<{
    // Full item object with all fields including contact info
  }>;
  pagination: PaginationObject;
}
```

##### PATCH /api/admin/items/:id/status

Update item status.

**Request Body:**
```typescript
{
  status: 'pending' | 'active' | 'claimed' | 'archived' | 'rejected';
  notes?: string; // Admin notes
}
```

##### GET /api/admin/claims

Get all claims.

**Query Parameters:**
- `status`: Filter by status
- `itemId`: Filter by item ID
- `page`: Page number
- `limit`: Items per page

##### PATCH /api/admin/claims/:id/status

Update claim status.

**Request Body:**
```typescript
{
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
  notes?: string;
}
```

##### GET /api/admin/stats

Get platform statistics.

**Response:**
```typescript
{
  totalFoundItems: number;
  totalLostItems: number;
  activeFoundItems: number;
  activeLostItems: number;
  totalClaims: number;
  pendingClaims: number;
  totalRevenue: number; // In RWF
  itemsByCategory: Record<string, number>;
  itemsByLocation: Record<string, number>;
}
```

### Error Response Format

All errors follow this format:

```typescript
{
  error: {
    code: string; // Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
    message: string; // Human-readable message
    details?: Record<string, any>; // Additional error details
    field?: string; // Field name for validation errors
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `PAYMENT_REQUIRED`: Payment needed for this action
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## Frontend Architecture

### Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── image-upload.tsx # Image upload component
│   │   └── item-card.tsx    # Item display card
│   ├── pages/
│   │   ├── home.tsx         # Landing page
│   │   ├── report-found.tsx # Found item form
│   │   ├── report-lost.tsx # Lost item form
│   │   ├── search.tsx       # Search page
│   │   ├── item-detail.tsx  # Item details page
│   │   ├── payment.tsx      # Payment page
│   │   ├── admin.tsx        # Admin dashboard
│   │   └── not-found.tsx    # 404 page
│   ├── hooks/
│   │   ├── use-mobile.tsx   # Mobile detection hook
│   │   └── use-toast.ts     # Toast notifications
│   ├── lib/
│   │   ├── queryClient.ts   # TanStack Query setup
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/
│   ├── favicon.png
│   └── opengraph.jpg
└── index.html
```

### Routing

Routes are defined in `App.tsx` using Wouter:

```typescript
/                    → Home
/report-found        → Report Found Item
/report-lost         → Report Lost Item
/payment             → Payment Page (with query params)
/search              → Search Page
/item/:id            → Item Detail Page
/admin               → Admin Dashboard
/*                   → 404 Not Found
```

### State Management

#### TanStack Query

Used for server state management:

```typescript
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});
```

#### Local State

- Form state: React Hook Form
- UI state: React useState/useReducer
- Theme: next-themes (planned)

### Form Handling

#### Validation Schema (Zod)

**Found Item Schema:**
```typescript
const foundItemSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please provide more detail"),
  location: z.string().min(3, "Location is required"),
  dateFound: z.string().min(1, "Date is required"),
  imageUrl: z.string().optional(),
  contactPhone: z.string()
    .min(10, "Valid phone number required")
    .regex(/^(\+?250|0)7[0-9]{8}$/, "Must be a valid Rwanda phone number"),
  contactName: z.string().min(2, "Name is required"),
});
```

**Lost Item Schema:**
```typescript
const lostItemSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  dateLost: z.string().min(1),
  imageUrl: z.string().optional(),
  reward: z.string().optional(),
  contactPhone: z.string()
    .min(10)
    .regex(/^(\+?250|0)7[0-9]{8}$/),
  contactName: z.string().min(2),
});
```

#### Multi-Step Forms

Both report forms use a 3-step wizard:
1. **Details**: Category, title, description
2. **Location**: Location, date, image
3. **Contact**: Contact info (and reward for lost items)

### Components

#### ImageUpload Component

```typescript
interface ImageUploadProps {
  value: string | null; // base64 data URL
  onChange: (value: string | null) => void;
  className?: string;
}
```

**Features:**
- Drag and drop support
- File validation (image/*, max 5MB)
- Preview with remove option
- Mobile-optimized

#### ItemCard Component

```typescript
interface ItemCardProps {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  type: 'found' | 'lost';
  image?: string;
  className?: string;
}
```

**Features:**
- Responsive card layout
- Category icon display
- Image lazy loading
- Click to navigate to detail page

### API Client

#### Request Function

```typescript
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response>
```

**Features:**
- Automatic JSON serialization
- Credentials included (cookies)
- Error handling
- Type-safe responses

### Styling

#### Tailwind CSS Configuration

- Custom color palette (SafiLocate Blue)
- Mobile-first breakpoints
- Dark mode support (planned)
- Custom animations

#### Component Styling

- Utility-first approach
- Consistent spacing scale
- Responsive typography
- Accessible color contrasts

---

## Backend Architecture

### Project Structure

```
server/
├── index.ts        # Server entry point
├── routes.ts       # API route definitions
├── storage.ts      # Database interface
├── static.ts       # Static file serving
└── vite.ts         # Vite middleware (dev only)
```

### Server Setup

#### Express Configuration

```typescript
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: false }));

// Request logging
app.use((req, res, next) => {
  // Logging middleware
});

// Error handling
app.use((err, req, res, next) => {
  // Error handler
});
```

#### Session Configuration

```typescript
import session from 'express-session';
import pgSession from 'connect-pg-simple';

const pgStore = pgSession(session);

app.use(session({
  store: new pgStore({
    pool: dbPool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict'
  }
}));
```

### Storage Layer

#### Storage Interface

```typescript
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Found Items
  createFoundItem(item: InsertFoundItem): Promise<FoundItem>;
  getFoundItem(id: string): Promise<FoundItem | undefined>;
  listFoundItems(filters: FoundItemFilters): Promise<FoundItem[]>;
  updateFoundItemStatus(id: string, status: string): Promise<FoundItem>;
  
  // Lost Items
  createLostItem(item: InsertLostItem): Promise<LostItem>;
  getLostItem(id: string): Promise<LostItem | undefined>;
  listLostItems(filters: LostItemFilters): Promise<LostItem[]>;
  updateLostItemStatus(id: string, status: string): Promise<LostItem>;
  
  // Claims
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaim(id: string): Promise<Claim | undefined>;
  listClaims(filters: ClaimFilters): Promise<Claim[]>;
  updateClaimStatus(id: string, status: string): Promise<Claim>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByTxRef(txRef: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: string, status: string): Promise<Payment>;
}
```

#### Current Implementation

Currently using `MemStorage` (in-memory). **TODO**: Implement PostgreSQL storage using Drizzle ORM.

### Route Registration

```typescript
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Public routes
  app.get('/api/items', getItemsHandler);
  app.get('/api/items/:id', getItemHandler);
  app.post('/api/items/found', createFoundItemHandler);
  app.post('/api/items/lost', createLostItemHandler);
  app.post('/api/search', searchItemsHandler);
  app.post('/api/items/:id/claim', createClaimHandler);
  
  // Payment routes
  app.post('/api/payments/initialize', initializePaymentHandler);
  app.post('/api/webhooks/flutterwave', flutterwaveWebhookHandler);
  
  // Admin routes (protected)
  app.get('/api/admin/items', authenticateAdmin, getAdminItemsHandler);
  app.patch('/api/admin/items/:id/status', authenticateAdmin, updateItemStatusHandler);
  app.get('/api/admin/claims', authenticateAdmin, getAdminClaimsHandler);
  app.patch('/api/admin/claims/:id/status', authenticateAdmin, updateClaimStatusHandler);
  app.get('/api/admin/stats', authenticateAdmin, getAdminStatsHandler);
  
  return httpServer;
}
```

### Authentication Middleware

```typescript
export function authenticate(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    return next();
  }
  res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
}

export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId && req.session?.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
}
```

### Service Layer (Planned)

```
server/
├── services/
│   ├── auth.service.ts      # Authentication logic
│   ├── payment.service.ts    # Flutterwave integration
│   ├── ai.service.ts         # OpenAI integration
│   ├── image.service.ts      # Image processing/upload
│   └── notification.service.ts # Email/SMS notifications
```

---

## User Flows & Use Cases

### UC-1: Report Found Item (Free)

**Actor**: Finder  
**Preconditions**: None  
**Flow**:

1. User navigates to `/report-found`
2. User fills Step 1: Category, Title, Description
3. User fills Step 2: Location, Date Found, Image (optional)
4. User fills Step 3: Contact Name, Contact Phone
5. User submits form
6. System validates input
7. System generates receipt number (FND-XXXXX)
8. System stores item with status 'pending'
9. System displays success page with receipt
10. Admin reviews and activates item

**Postconditions**: Item is listed (pending admin approval)

**Business Rules**:
- No payment required
- Item status starts as 'pending'
- Admin must approve before public listing
- Receipt number is unique and trackable

### UC-2: Report Lost Item (Paid)

**Actor**: Seeker  
**Preconditions**: None  
**Flow**:

1. User navigates to `/report-lost`
2. User fills Step 1: Category, Title, Description
3. User fills Step 2: Location, Date Lost, Image (optional)
4. User fills Step 3: Contact Info, Reward (optional)
5. User submits form
6. System validates input
7. System creates lost item with status 'pending'
8. System calculates listing fee (e.g., 1000 RWF)
9. System redirects to payment page
10. User completes payment via Flutterwave
11. Flutterwave sends webhook
12. System updates item status to 'active'
13. System sets expiration date (30 days)
14. User sees confirmation page

**Postconditions**: Item is listed and searchable

**Business Rules**:
- Payment required before activation
- Listing expires after 30 days
- Can be renewed with additional payment
- Reward is optional but increases visibility

### UC-3: Search & Browse Items

**Actor**: User (Seeker/Finder)  
**Preconditions**: None  
**Flow**:

1. User navigates to `/search` or homepage
2. User enters search query (optional)
3. User applies filters (category, location, type)
4. System queries database
5. System returns matching items
6. User browses results
7. User clicks on item card
8. System displays item details
9. User can claim item (if found) or contact seeker (if lost)

**Postconditions**: User views item details

**Business Rules**:
- Only active items are shown
- Expired lost items are hidden
- Search uses full-text search + tags
- Results paginated (20 per page)

### UC-4: Claim Found Item

**Actor**: Seeker  
**Preconditions**: Found item exists and is active  
**Flow**:

1. User views found item details
2. User clicks "Claim This Item"
3. User fills claim form: Name, Phone, Email, Proof of Ownership
4. User submits claim
5. System validates input
6. System creates claim with status 'pending'
7. System notifies finder (email/SMS)
8. Finder reviews claim
9. Finder contacts seeker directly
10. Finder updates claim status (verified/rejected)
11. Admin can also verify/reject claims

**Postconditions**: Claim is created and finder is notified

**Business Rules**:
- Multiple claims allowed per item
- Finder decides on verification
- Admin can override finder decision
- Contact info shared only after verification

### UC-5: Admin Moderation

**Actor**: Admin  
**Preconditions**: Admin is authenticated  
**Flow**:

1. Admin navigates to `/admin`
2. Admin views dashboard with statistics
3. Admin filters items by status
4. Admin reviews pending items
5. Admin approves/rejects items
6. Admin views claims
7. Admin verifies/rejects claims
8. Admin adds notes

**Postconditions**: Items/claims status updated

**Business Rules**:
- Only admins can access dashboard
- All actions are logged
- Rejected items are archived
- Admin notes are visible only to admins

---

## Integration Specifications

### Flutterwave Payment Integration

#### Configuration

```typescript
const flutterwaveConfig = {
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
  encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY!,
  webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET!,
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.flutterwave.com/v3'
    : 'https://api.flutterwave.com/v3', // Use test mode
};
```

#### Payment Flow

1. **Initialize Payment**:
   ```typescript
   POST https://api.flutterwave.com/v3/payments
   {
     tx_ref: string, // Unique reference
     amount: number,
     currency: 'RWF',
     redirect_url: string,
     customer: { email, name, phone },
     customizations: { title, description }
   }
   ```

2. **User Redirects**: User redirected to Flutterwave checkout

3. **Payment Callback**: Flutterwave redirects to `redirect_url` with `tx_ref`

4. **Webhook Verification**: Flutterwave sends webhook to `/api/webhooks/flutterwave`

5. **Status Update**: System updates payment and item status

#### Webhook Security

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', flutterwaveConfig.webhookSecret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}
```

### OpenAI Integration

#### Configuration

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
```

#### AI Tagging Service

```typescript
async function generateTags(description: string): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a tagging assistant. Extract relevant tags from item descriptions. Return only a JSON array of tags (max 5 tags).'
      },
      {
        role: 'user',
        content: `Extract tags from: "${description}"`
      }
    ],
    temperature: 0.3,
    max_tokens: 100,
  });
  
  return JSON.parse(response.choices[0].message.content || '[]');
}
```

#### Usage

- Called when item is created
- Tags stored in database `tags` array column
- Used for search and matching
- Cached to reduce API calls

### Image Storage (Cloudinary)

#### Configuration

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});
```

#### Upload Flow

```typescript
async function uploadImage(base64Data: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: 'safilocate',
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' },
      { format: 'auto' }
    ]
  });
  return result.secure_url;
}
```

---

## Security Specifications

### Authentication & Authorization

#### Password Security

- Passwords hashed using bcrypt (cost factor: 12)
- Minimum 8 characters required
- No password storage in plain text

#### Session Security

- Sessions stored in PostgreSQL
- Secure cookies in production (HTTPS only)
- HttpOnly flag prevents XSS
- SameSite: 'strict' prevents CSRF
- Session expiration: 30 days

#### API Security

- Rate limiting: 100 requests/minute per IP
- CORS configured for allowed origins
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)

### Data Protection

#### Sensitive Data

- Contact information only visible to:
  - Item owner
  - Claimant (after verification)
  - Admins
- Phone numbers masked in public listings
- Email addresses never exposed publicly

#### Payment Data

- No card details stored
- Payment references stored securely
- PCI compliance via Flutterwave

### Security Headers

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

---

## Performance Requirements

### Performance Targets

- **Page Load Time**: <1.5s on 3G (First Contentful Paint)
- **Time to Interactive**: <3s
- **API Response Time**: <200ms (p95)
- **Database Query Time**: <50ms (p95)
- **Image Load Time**: <500ms

### Optimization Strategies

#### Frontend

- Code splitting by route
- Image lazy loading
- Component lazy loading
- Service worker for caching (planned)
- CDN for static assets

#### Backend

- Database query optimization
- Indexes on frequently queried fields
- Connection pooling
- Response caching (Redis planned)
- Pagination for large datasets

#### Database

- Proper indexing strategy
- Query optimization
- Connection pooling
- Read replicas (planned for scale)

---

## Error Handling & Validation

### Validation Rules

#### Found Item Validation

```typescript
{
  category: ['required', 'in:id_document,electronics,wallet,keys,clothing,other'],
  title: ['required', 'string', 'min:3', 'max:200'],
  description: ['required', 'string', 'min:10', 'max:2000'],
  location: ['required', 'string', 'min:3', 'max:200'],
  dateFound: ['required', 'date', 'before_or_equal:today'],
  imageUrl: ['optional', 'string', 'url'],
  contactName: ['required', 'string', 'min:2', 'max:100'],
  contactPhone: ['required', 'string', 'regex:/^(\+?250|0)7[0-9]{8}$/'],
}
```

#### Lost Item Validation

```typescript
{
  // Same as found item, plus:
  reward: ['optional', 'numeric', 'min:0', 'max:1000000'],
  dateLost: ['required', 'date', 'before_or_equal:today'],
}
```

### Error Handling

#### Client-Side

```typescript
try {
  const response = await apiRequest('POST', '/api/items/found', data);
  // Success handling
} catch (error) {
  if (error.status === 400) {
    // Validation errors
    toast.error(error.message);
  } else if (error.status === 500) {
    // Server errors
    toast.error('Something went wrong. Please try again.');
  }
}
```

#### Server-Side

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details
      }
    });
  }
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

---

## Testing Strategy

### Unit Tests

- **Frontend**: Component tests (React Testing Library)
- **Backend**: Service/utility function tests (Jest)
- **Coverage Target**: 80%

### Integration Tests

- **API Tests**: Endpoint testing (Supertest)
- **Database Tests**: Schema and query tests
- **Coverage Target**: 70%

### E2E Tests

- **User Flows**: Critical paths (Playwright/Cypress)
- **Coverage**: Main user journeys

### Test Structure

```
tests/
├── unit/
│   ├── frontend/
│   └── backend/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    ├── report-found.spec.ts
    ├── report-lost.spec.ts
    └── search.spec.ts
```

---

## Deployment & DevOps

### Environment Setup

#### Development

```bash
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/safilocate_dev
PORT=5000
SESSION_SECRET=<dev-secret>
```

#### Staging

```bash
NODE_ENV=staging
DATABASE_URL=<staging-db-url>
PORT=5000
SESSION_SECRET=<staging-secret>
# ... other env vars
```

#### Production

```bash
NODE_ENV=production
DATABASE_URL=<production-db-url>
PORT=5000
SESSION_SECRET=<production-secret>
# ... all production env vars
```

### Build Process

```bash
# Install dependencies
npm install

# Type check
npm run check

# Build
npm run build

# Start production server
npm start
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] CDN configured
- [ ] Monitoring setup
- [ ] Error tracking setup
- [ ] Backup strategy configured
- [ ] Load balancer configured (if needed)

### Monitoring

- **Application**: Error tracking (Sentry)
- **Performance**: APM (New Relic/DataDog)
- **Uptime**: Health checks
- **Database**: Query performance monitoring

---

## Development Guidelines

### Code Style

#### TypeScript

- Strict mode enabled
- No `any` types
- Interfaces for object shapes
- Enums for constants

#### Naming Conventions

- **Files**: kebab-case (`report-found.tsx`)
- **Components**: PascalCase (`ReportFound`)
- **Functions**: camelCase (`getItems`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

#### Git Workflow

1. Create feature branch from `main`
2. Make changes
3. Write tests
4. Run linter and tests
5. Commit with descriptive messages
6. Push and create PR
7. Code review
8. Merge to `main`

### Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Example: `feat(api): add found item creation endpoint`

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
```

---

## Appendix

### A. Phone Number Format

Rwanda phone numbers:
- Format: `+2507XXXXXXXX` or `07XXXXXXXX`
- Length: 12 digits (with country code) or 10 digits (local)
- Validation regex: `/^(\+?250|0)7[0-9]{8}$/`

### B. Currency

- Primary currency: RWF (Rwandan Franc)
- Payment amounts in RWF
- Display format: `1,000 RWF`

### C. Date Formats

- **API**: ISO 8601 (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`)
- **Display**: Locale-specific (`DD MMM YYYY`)

### D. Item Categories

```typescript
enum ItemCategory {
  ID_DOCUMENT = 'id_document',
  ELECTRONICS = 'electronics',
  WALLET = 'wallet',
  KEYS = 'keys',
  CLOTHING = 'clothing',
  OTHER = 'other'
}
```

### E. Item Statuses

**Found Items:**
- `pending`: Awaiting admin approval
- `active`: Listed and searchable
- `claimed`: Successfully claimed
- `archived`: No longer active

**Lost Items:**
- `pending`: Created but not paid
- `paid`: Payment received, awaiting activation
- `active`: Listed and searchable
- `claimed`: Successfully claimed
- `expired`: Listing expired (30 days)
- `archived`: No longer active

### F. Claim Statuses

- `pending`: Awaiting verification
- `verified`: Verified by finder/admin
- `rejected`: Rejected by finder/admin
- `resolved`: Claim resolved (item returned)

### G. Payment Statuses

- `pending`: Payment initiated
- `success`: Payment completed
- `failed`: Payment failed
- `cancelled`: Payment cancelled

### H. API Rate Limits

- **Public Endpoints**: 100 requests/minute per IP
- **Authenticated Endpoints**: 200 requests/minute per user
- **Admin Endpoints**: 500 requests/minute per admin

### I. File Upload Limits

- **Max File Size**: 5MB
- **Allowed Types**: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`
- **Max Dimensions**: 4000x4000px (will be resized)

### J. Search Parameters

- **Max Query Length**: 200 characters
- **Max Tags**: 10 tags per search
- **Max Results**: 100 per page (default: 20)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024 | Development Team | Initial FSD |

---

**End of Document**
