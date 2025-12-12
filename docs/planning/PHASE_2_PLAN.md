# Phase 2: Core API Endpoints - Implementation Plan

**Status**: 🚧 Ready to Start  
**Priority**: CRITICAL  
**Estimated Time**: 3-4 days  
**Dependencies**: Phase 1 ✅ Complete

---

## Overview

Phase 2 focuses on implementing all API endpoints that connect the frontend to the backend. This is the critical bridge that enables data persistence and real functionality.

**Current State:**
- ✅ Database schema complete (Phase 1)
- ✅ Storage layer ready (PgStorage)
- ✅ Frontend forms ready (but submitting to mocks)
- ❌ No API endpoints implemented
- ❌ No data persistence

**Goal:**
- Implement all REST API endpoints
- Connect frontend to backend
- Enable real data persistence
- Add validation and error handling

---

## Implementation Tasks

### 1. Public Endpoints (Priority: HIGHEST)

#### `GET /api/items` - List Items
**Purpose**: Get paginated list of active items with filters

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
  items: Array<FoundItem | LostItem>,
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Implementation Steps:**
1. Parse query parameters
2. Validate inputs
3. Call `storage.listFoundItems()` and/or `storage.listLostItems()`
4. Filter by status (only active items)
5. Apply search filters
6. Return paginated results

---

#### `GET /api/items/:id` - Get Item Details
**Purpose**: Get detailed information about a specific item

**Response:**
```typescript
{
  id: string,
  type: 'found' | 'lost',
  // ... full item object
  // Contact info only if user is owner or admin
}
```

**Implementation Steps:**
1. Extract item ID from params
2. Determine if found or lost item
3. Call appropriate storage method
4. Check permissions (contact info visibility)
5. Return item details

---

#### `POST /api/items/found` - Report Found Item
**Purpose**: Create a new found item listing (FREE)

**Request Body:**
```typescript
{
  category: string,
  title: string,
  description: string,
  location: string,
  dateFound: string, // ISO date
  imageUrls?: string[], // base64 or URLs
  contactName: string,
  contactPhone: string, // Rwanda format
  finderEmail?: string,
  finderPhone?: string
}
```

**Response:**
```typescript
{
  id: string,
  receiptNumber: string, // Format: FND-XXXXX
  message: string,
  item: FoundItem
}
```

**Implementation Steps:**
1. Validate request body (Zod schema)
2. Validate phone number format (Rwanda)
3. Generate receipt number (FND-XXXXX)
4. Call `storage.createFoundItem()`
5. Return success response with receipt

---

#### `POST /api/items/lost` - Report Lost Item
**Purpose**: Create a new lost item listing (requires payment)

**Request Body:**
```typescript
{
  category: string,
  title: string,
  description: string,
  location: string,
  dateLost: string, // ISO date
  imageUrls?: string[],
  reward?: number,
  contactName: string,
  contactPhone: string,
  seekerEmail?: string,
  seekerPhone?: string,
  priceTier: 'standard' | 'premium' | 'urgent' | 'custom',
  customPrice?: number // Only if priceTier === 'custom'
}
```

**Response:**
```typescript
{
  id: string,
  paymentUrl: string, // Flutterwave checkout URL (Phase 5)
  paymentReference: string,
  amount: number,
  currency: string
}
```

**Implementation Steps:**
1. Validate request body (Zod schema)
2. Calculate listing fee based on price tier
3. Create lost item with status 'pending', payment_status 'unpaid'
4. Create payment record (Phase 5: Initialize Flutterwave)
5. Return payment URL and reference

---

#### `POST /api/search` - Advanced Search
**Purpose**: Search items with multiple filters

**Request Body:**
```typescript
{
  query?: string,
  type?: 'found' | 'lost' | 'all',
  category?: string,
  location?: string,
  dateFrom?: string,
  dateTo?: string,
  tags?: string[],
  page?: number,
  limit?: number
}
```

**Response:** Same as `GET /api/items`

**Implementation Steps:**
1. Parse search parameters
2. Build search query (full-text + filters)
3. Call storage search methods
4. Apply ranking algorithm
5. Return paginated results

---

#### `POST /api/items/:id/claim` - Submit Claim
**Purpose**: Submit a claim for a found item

**Request Body:**
```typescript
{
  claimantName: string,
  claimantPhone: string, // Rwanda format
  claimantEmail?: string,
  description: string // Min 50 chars, proof of ownership
}
```

**Response:**
```typescript
{
  id: string,
  claimNumber: string, // Format: CLM-XXXXX
  status: 'pending',
  message: string
}
```

**Implementation Steps:**
1. Validate request body
2. Verify item exists and is active
3. Check for duplicate claims (optional)
4. Create claim with status 'pending'
5. Send notification to finder (Phase 6: Email)
6. Return success response

---

### 2. Payment Endpoints (Priority: HIGH)

#### `POST /api/payments/initialize` - Initialize Payment
**Purpose**: Initialize Flutterwave payment for lost item

**Request Body:**
```typescript
{
  lostItemId: string,
  amount: number // In RWF
}
```

**Response:**
```typescript
{
  paymentUrl: string,
  paymentReference: string,
  expiresAt: string // ISO timestamp
}
```

**Implementation Steps:**
1. Validate lost item exists
2. Verify payment status is 'unpaid'
3. Generate unique transaction reference
4. Create payment record
5. Initialize Flutterwave payment (Phase 5)
6. Return payment URL

---

#### `POST /api/webhooks/flutterwave` - Payment Webhook
**Purpose**: Handle Flutterwave payment callbacks

**Implementation Steps:**
1. Verify webhook signature
2. Extract payment details
3. Find payment by transaction reference
4. Update payment status
5. Activate lost item listing (set expires_at, status='active')
6. Return success response

---

### 3. Admin Endpoints (Priority: HIGH)

#### `GET /api/admin/items` - List All Items (Admin)
**Purpose**: Get all items with admin details

**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by type
- `page`: Page number
- `limit`: Items per page

**Response:** Same as `GET /api/items` but includes contact info

**Implementation Steps:**
1. Verify admin authentication (Phase 3)
2. Call storage methods
3. Return items with all fields

---

#### `PATCH /api/admin/items/:id/status` - Update Item Status
**Purpose**: Admin approval/rejection of items

**Request Body:**
```typescript
{
  status: 'pending' | 'active' | 'claimed' | 'archived' | 'rejected',
  notes?: string
}
```

**Implementation Steps:**
1. Verify admin authentication
2. Validate status transition
3. Update item status
4. Store admin notes (if any)
5. Return updated item

---

#### `GET /api/admin/claims` - List All Claims
**Purpose**: Get all claims for admin review

**Implementation Steps:**
1. Verify admin authentication
2. Call `storage.listClaims()`
3. Return claims with item details

---

#### `PATCH /api/admin/claims/:id/status` - Update Claim Status
**Purpose**: Admin verification/rejection of claims

**Request Body:**
```typescript
{
  status: 'pending' | 'verified' | 'rejected' | 'resolved',
  notes?: string
}
```

**Implementation Steps:**
1. Verify admin authentication
2. Update claim status
3. If verified: Share contact info with claimant
4. Store admin notes
5. Return updated claim

---

#### `GET /api/admin/stats` - Platform Statistics
**Purpose**: Get platform statistics for admin dashboard

**Response:**
```typescript
{
  totalFoundItems: number,
  totalLostItems: number,
  activeFoundItems: number,
  activeLostItems: number,
  totalClaims: number,
  pendingClaims: number,
  totalRevenue: number, // In RWF
  itemsByCategory: Record<string, number>,
  itemsByLocation: Record<string, number>
}
```

**Implementation Steps:**
1. Verify admin authentication
2. Query database for statistics
3. Aggregate data
4. Return statistics object

---

### 4. Middleware (Priority: CRITICAL)

#### Request Validation Middleware
**Purpose**: Validate all incoming requests using Zod schemas

**Implementation:**
```typescript
function validateRequest(schema: z.ZodSchema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.message } });
    }
  };
}
```

---

#### Error Handling Middleware
**Purpose**: Centralized error handling

**Implementation:**
```typescript
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', ... } });
  }
  // ... other error types
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', ... } });
});
```

---

#### Authentication Middleware (Phase 3)
**Purpose**: Verify user is authenticated

**Implementation:**
```typescript
function authenticate(req, res, next) {
  if (req.session?.userId) {
    return next();
  }
  res.status(401).json({ error: { code: 'UNAUTHORIZED', ... } });
}
```

---

#### Admin Authorization Middleware (Phase 3)
**Purpose**: Verify user is admin

**Implementation:**
```typescript
function authenticateAdmin(req, res, next) {
  if (req.session?.userId && req.session?.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: { code: 'FORBIDDEN', ... } });
}
```

---

#### Rate Limiting Middleware
**Purpose**: Prevent abuse

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});
```

---

#### CORS Configuration
**Purpose**: Configure cross-origin requests

**Implementation:**
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000'],
  credentials: true
}));
```

---

## Implementation Order

### Step 1: Setup Middleware (Day 1 Morning)
1. Install dependencies (`express-rate-limit`, `cors`)
2. Create validation middleware
3. Create error handling middleware
4. Configure CORS
5. Add rate limiting

### Step 2: Public Endpoints (Day 1-2)
1. `GET /api/items` - List items
2. `GET /api/items/:id` - Get item details
3. `POST /api/items/found` - Report found item
4. `POST /api/items/lost` - Report lost item
5. `POST /api/search` - Advanced search
6. `POST /api/items/:id/claim` - Submit claim

### Step 3: Payment Endpoints (Day 2-3)
1. `POST /api/payments/initialize` - Initialize payment (mock for now)
2. `POST /api/webhooks/flutterwave` - Webhook handler (mock for now)

### Step 4: Admin Endpoints (Day 3-4)
1. `GET /api/admin/items` - List all items
2. `PATCH /api/admin/items/:id/status` - Update item status
3. `GET /api/admin/claims` - List all claims
4. `PATCH /api/admin/claims/:id/status` - Update claim status
5. `GET /api/admin/stats` - Platform statistics

### Step 5: Testing (Day 4)
1. Test all endpoints manually
2. Test error cases
3. Test validation
4. Test pagination
5. Test filters

---

## Files to Create/Modify

### New Files
- `server/middleware/validation.ts` - Validation middleware
- `server/middleware/error-handler.ts` - Error handling
- `server/middleware/auth.ts` - Authentication (Phase 3)
- `server/routes/public.ts` - Public routes
- `server/routes/admin.ts` - Admin routes
- `server/routes/payment.ts` - Payment routes

### Modified Files
- `server/routes.ts` - Register all routes
- `server/index.ts` - Add middleware
- `package.json` - Add dependencies

---

## Dependencies to Install

```bash
npm install express-rate-limit cors
npm install --save-dev @types/express-rate-limit
```

---

## Testing Checklist

- [ ] All endpoints return correct status codes
- [ ] Validation works for all inputs
- [ ] Error handling works correctly
- [ ] Pagination works
- [ ] Filters work correctly
- [ ] Search works (basic implementation)
- [ ] Admin endpoints require authentication (Phase 3)
- [ ] Rate limiting works
- [ ] CORS configured correctly

---

## Success Criteria

Phase 2 is complete when:

- ✅ All public endpoints implemented and tested
- ✅ All admin endpoints implemented (auth can be mocked for now)
- ✅ Payment endpoints stubbed (real integration in Phase 5)
- ✅ Validation middleware working
- ✅ Error handling working
- ✅ Rate limiting configured
- ✅ CORS configured
- ✅ All endpoints documented

---

## Next Steps After Phase 2

1. **Phase 3**: Authentication & Session Management
2. **Phase 4**: Frontend-Backend Integration
3. **Phase 5**: Payment Integration (Flutterwave)

---

**Ready to Start**: ✅ Yes  
**Blockers**: None  
**Estimated Completion**: 3-4 days
