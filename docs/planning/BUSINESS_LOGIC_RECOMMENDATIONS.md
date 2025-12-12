# Business Logic Recommendations

**Date**: 2024  
**Context**: SafiLocate - Lost & Found Platform for Rwanda  
**Considerations**: Low operating costs, mobile-first, 3G networks, Rwanda market

> 📚 **Documentation Index**: See the [Documentation README](../../README.md) for all available documentation.

**Related Documents:**
- [Developer Handbook](../reference/DEVELOPER_HANDBOOK.md) - Complete technical specification (includes confirmed decisions)
- [Code Review & Action Plan](./CODE_REVIEW_AND_ACTION_PLAN.md) - Implementation roadmap
- [Phase 1 Completion Report](./PHASE_1_COMPLETE.md) - Phase 1 implementation summary

---

## 1. Payment Amount: Fixed or Configurable?

### Recommendation: **Tiered Fixed Pricing with Admin Override**

**Proposed Structure:**
```typescript
const LISTING_PRICES = {
  standard: 1000,  // RWF - Default for most items
  premium: 2000,   // RWF - For high-value items (electronics, laptops)
  urgent: 3000,    // RWF - For urgent/priority listings
};
```

**Implementation:**
- Default: 1000 RWF (standard listing)
- User can select tier during form submission
- Admin can override price in admin dashboard
- Price stored in `lost_items.price_tier` or `lost_items.custom_price`

**Rationale:**
- ✅ **Fixed tiers** reduce decision fatigue (better UX)
- ✅ **Admin override** provides flexibility for edge cases
- ✅ **Tiered pricing** allows upselling without complexity
- ✅ **Simple** aligns with "low operating costs" constraint

**Database Schema:**
```typescript
lost_items {
  // ... other fields
  price_tier: 'standard' | 'premium' | 'urgent' | 'custom',
  custom_price?: number, // Only if price_tier === 'custom'
  listing_fee: number, // Actual amount paid (for records)
}
```

---

## 2. Listing Duration: Fixed or Configurable?

### Recommendation: **Fixed 30 Days with Renewal Option**

**Proposed Structure:**
- **Default Duration**: 30 days from payment confirmation
- **Auto-expiration**: Status changes to `expired` after 30 days
- **Renewal**: User can pay again to extend for another 30 days
- **Grace Period**: 7 days after expiration where item is archived but can be renewed

**Implementation:**
```typescript
// On payment confirmation
expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

// On expiration check (cron job or scheduled task)
if (expires_at < now && status === 'active') {
  status = 'expired';
  // Notify user via email/SMS (optional)
}

// Renewal flow
if (status === 'expired' && expires_at > now - 7 days) {
  // Allow renewal without creating new listing
  // Just extend expires_at
}
```

**Rationale:**
- ✅ **Fixed duration** is simple and predictable
- ✅ **30 days** is reasonable for lost items (not too short, not too long)
- ✅ **Renewal option** provides flexibility without complexity
- ✅ **Grace period** prevents accidental permanent loss

**Future Enhancement:**
- Could add "Urgent" tier with 60-day duration (premium pricing)

---

## 3. Admin Creation: How are Admins Created?

### Recommendation: **Manual Database Insert + Admin Invite System**

**Phase 1 (MVP):**
- Manual database insert for initial admin(s)
- Seed script: `npm run seed:admin`
- Single admin account initially

**Phase 2 (Post-MVP):**
- Admin invite system: Existing admin can invite new admins
- Invite link sent via email
- New admin sets password on first login
- Role-based access (Super Admin, Moderator)

**Implementation:**

**Seed Script (`script/seed-admin.ts`):**
```typescript
import { storage } from '../server/storage';
import bcrypt from 'bcrypt';

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('secure-password', 12);
  const admin = await storage.createUser({
    username: 'admin',
    password: hashedPassword,
    role: 'admin', // Add role field to users table
  });
  console.log('Admin created:', admin.id);
}
```

**Database Schema:**
```typescript
users {
  // ... existing fields
  role: 'user' | 'admin' | 'moderator', // Default: 'user'
  created_by?: string, // FK to users.id (for tracking who created admin)
  is_active: boolean, // Default: true
}
```

**Rationale:**
- ✅ **Manual seed** is simplest for MVP
- ✅ **Invite system** provides security (no public signup)
- ✅ **Role-based** allows future expansion
- ✅ **Trackable** (know who created which admin)

---

## 4. Notifications: How Should Finders be Notified of Claims?

### Recommendation: **Email Primary + SMS Optional (Future)**

**Phase 1 (MVP):**
- **Email notifications** only
- Use free tier service (SendGrid, Mailgun, or Resend)
- Notification sent when claim is submitted
- Simple email template with claim details

**Phase 2 (Post-MVP):**
- **SMS notifications** via Twilio/AfricasTalking (Rwanda-focused)
- SMS for urgent claims (high-value items)
- Email for all claims
- In-app notifications (future)

**Implementation:**

**Email Service:**
```typescript
// server/services/notification.service.ts
async function notifyFinderOfClaim(claim: Claim, item: FoundItem) {
  const email = {
    to: item.finderEmail, // Store email in found_items
    subject: `New Claim on Your Found Item: ${item.title}`,
    template: 'claim-notification',
    data: {
      itemTitle: item.title,
      claimantName: claim.claimantName,
      claimantPhone: claim.claimantPhone, // Masked: 078 *** 0000
      claimDescription: claim.description,
      claimLink: `${BASE_URL}/admin/claims/${claim.id}`,
    }
  };
  await emailService.send(email);
}
```

**Database Schema:**
```typescript
found_items {
  // ... existing fields
  finder_email: string, // For notifications
  finder_phone: string, // For SMS (optional)
  notification_preferences: {
    email: boolean, // Default: true
    sms: boolean,    // Default: false
  }
}
```

**Rationale:**
- ✅ **Email is free/low-cost** (aligns with budget constraint)
- ✅ **SMS is valuable** in Rwanda (high mobile penetration)
- ✅ **Phased approach** allows MVP launch without SMS costs
- ✅ **Preference-based** respects user choice

**Cost Consideration:**
- Email: Free tier (SendGrid: 100/day free)
- SMS: ~50-100 RWF per SMS (only for premium/urgent)

---

## 5. Image Limits: Max Size? Max Per Item?

### Recommendation: **Conservative Limits for 3G Networks**

**Proposed Limits:**
- **Max File Size**: 5MB per image
- **Max Images**: 3 images per item
- **Formats**: JPEG, PNG, WebP only
- **Auto-optimization**: Resize to max 1200x1200px, compress to 80% quality

**Implementation:**
```typescript
// Frontend validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 3;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Backend processing
async function processImage(file: Buffer) {
  // Resize to max 1200x1200
  // Compress to 80% quality
  // Convert to WebP if possible (smaller file size)
  // Return optimized buffer
}
```

**Rationale:**
- ✅ **5MB limit** prevents slow uploads on 3G
- ✅ **3 images** is sufficient (main + 2 details)
- ✅ **Auto-optimization** reduces bandwidth usage
- ✅ **WebP format** reduces file size by ~30%

**User Experience:**
- Show upload progress
- Validate before upload
- Show file size warnings
- Allow removal before submit

---

## 6. Search Ranking: How to Order Results?

### Recommendation: **Multi-Factor Ranking with Relevance Score**

**Proposed Algorithm:**
```typescript
relevanceScore = (
  textMatchScore * 0.4 +      // Full-text search match quality
  tagMatchScore * 0.3 +       // Tag overlap
  locationProximity * 0.2 +   // Location match (if provided)
  recencyScore * 0.1          // How recent (newer = higher)
)

// Then sort by:
1. Status: active > pending > expired
2. Relevance score (descending)
3. Created date (newer first)
```

**Implementation:**
```typescript
// PostgreSQL full-text search with ranking
SELECT 
  *,
  ts_rank(
    to_tsvector('english', title || ' ' || description),
    plainto_tsquery('english', $1)
  ) as text_rank,
  (
    SELECT COUNT(*) 
    FROM unnest(tags) tag 
    WHERE tag = ANY($2::text[])
  )::float / NULLIF(array_length(tags, 1), 0) as tag_match_ratio
FROM found_items
WHERE status = 'active'
ORDER BY 
  text_rank DESC,
  tag_match_ratio DESC,
  created_at DESC
LIMIT 20;
```

**Rationale:**
- ✅ **Text match** prioritizes relevant descriptions
- ✅ **Tag matching** improves accuracy
- ✅ **Location** helps local users
- ✅ **Recency** ensures fresh results
- ✅ **Status priority** ensures active items first

**Future Enhancement:**
- Machine learning ranking (if data available)
- User location-based proximity (GPS)

---

## 7. Claim Verification: What Proof is Required?

### Recommendation: **Description-Based with Optional Evidence**

**Phase 1 (MVP):**
- **Required**: Detailed description of unique features
- **Optional**: Additional photos (if item has distinguishing marks)
- **Verification**: Finder reviews and decides
- **Admin**: Can verify/reject if finder doesn't respond

**Phase 2 (Post-MVP):**
- **Document upload**: For ID documents, upload photo of ID
- **Verification questions**: Pre-set questions based on category
- **Automated matching**: Compare descriptions using AI

**Implementation:**

**Claim Form:**
```typescript
claimSchema = {
  claimantName: string (required),
  claimantPhone: string (required, Rwanda format),
  claimantEmail: string (optional),
  description: string (required, min 50 chars), // Detailed proof
  evidencePhotos: File[] (optional, max 3),
  verificationAnswers: {
    // Category-specific questions
    // e.g., for phone: "What's the lock screen wallpaper?"
    // e.g., for wallet: "What cards are inside?"
  }
}
```

**Verification Flow:**
1. Claimant submits claim with description
2. Finder receives notification
3. Finder reviews description
4. Finder can:
   - Verify (share contact info)
   - Request more info
   - Reject (with reason)
5. Admin can override if finder doesn't respond in 7 days

**Rationale:**
- ✅ **Description-based** is simple and accessible
- ✅ **Optional photos** adds flexibility
- ✅ **Finder decides** maintains trust
- ✅ **Admin override** prevents abuse
- ✅ **7-day timeout** ensures responsiveness

---

## 8. Expired Listings: Auto-Archive or Manual?

### Recommendation: **Auto-Archive with Manual Review Option**

**Proposed Flow:**
```typescript
// Scheduled job (runs daily)
async function archiveExpiredListings() {
  const expired = await storage.getExpiredListings();
  
  for (const item of expired) {
    // Auto-archive after 30 days
    if (item.expires_at < now) {
      await storage.updateItemStatus(item.id, 'archived');
      
      // Notify user (optional)
      if (item.seeker_email) {
        await notifyUser({
          email: item.seeker_email,
          subject: 'Your listing has expired',
          message: 'You can renew it within 7 days',
          renewalLink: `${BASE_URL}/renew/${item.id}`
        });
      }
    }
  }
}
```

**Grace Period:**
- **7 days** after expiration: Can renew without new payment
- After 7 days: Archived, requires new listing

**Admin Override:**
- Admin can manually extend expiration
- Admin can restore archived listings
- Admin can permanently delete (GDPR compliance)

**Rationale:**
- ✅ **Auto-archive** reduces manual work
- ✅ **Grace period** prevents accidental loss
- ✅ **Scheduled job** ensures consistency
- ✅ **Admin override** provides flexibility
- ✅ **Notification** improves UX

**Implementation:**
- Use `node-cron` or similar for scheduled tasks
- Or use database triggers (PostgreSQL)
- Or use external cron service (Vercel Cron, etc.)

---

## 9. Duplicate Prevention: How to Prevent Duplicate Reports?

### Recommendation: **Multi-Layer Duplicate Detection**

**Layer 1: Client-Side Warning**
```typescript
// Before submit, check if similar item exists
const similarItems = await apiRequest('GET', `/api/items/check-duplicate`, {
  title: formData.title,
  category: formData.category,
  location: formData.location,
});

if (similarItems.length > 0) {
  // Show warning: "Similar items found. Are you sure this is new?"
  // User can proceed or cancel
}
```

**Layer 2: Backend Validation**
```typescript
// On item creation
async function checkDuplicates(item: InsertItem) {
  const similar = await db.query(`
    SELECT id, title, created_at
    FROM ${item.type === 'found' ? 'found_items' : 'lost_items'}
    WHERE 
      category = $1
      AND LOWER(title) % LOWER($2) -- Fuzzy match
      AND location ILIKE $3
      AND created_at > NOW() - INTERVAL '7 days'
      AND status IN ('active', 'pending')
    LIMIT 5
  `, [item.category, item.title, `%${item.location}%`]);
  
  if (similar.length > 0) {
    throw new DuplicateItemError('Similar item found', similar);
  }
}
```

**Layer 3: Admin Review**
- Admin dashboard shows potential duplicates
- Admin can merge or mark as separate
- Admin can flag suspicious duplicates

**Rationale:**
- ✅ **Client-side warning** prevents accidental duplicates
- ✅ **Backend validation** ensures data quality
- ✅ **Fuzzy matching** catches variations
- ✅ **7-day window** prevents old duplicates
- ✅ **Admin review** handles edge cases

**Fuzzy Matching:**
- Use PostgreSQL `pg_trgm` extension for similarity
- Or use Levenshtein distance
- Threshold: 80% similarity = potential duplicate

---

## 10. Reporting: Should Users Report Suspicious Items/Claims?

### Recommendation: **Yes, with Moderation System**

**Proposed Features:**

**1. Report Suspicious Item**
- Button on item detail page: "Report as Suspicious"
- Reasons: Spam, Scam, Wrong Category, Inappropriate Content
- Anonymous reporting (no account required)
- Admin reviews reports

**2. Report Suspicious Claim**
- On claim details (admin view)
- Reasons: Fraudulent, Harassment, Spam
- Admin can ban claimant if verified

**Implementation:**

**Database Schema:**
```typescript
reports {
  id: uuid (PK),
  item_id: uuid (FK to found_items/lost_items),
  claim_id: uuid (FK to claims, nullable),
  reporter_email: string (optional, for follow-up),
  reason: 'spam' | 'scam' | 'wrong_category' | 'inappropriate' | 'fraudulent' | 'harassment',
  description: text (optional),
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
  reviewed_by: uuid (FK to users, nullable),
  reviewed_at: timestamp (nullable),
  created_at: timestamp,
}
```

**Workflow:**
1. User clicks "Report"
2. Selects reason + optional description
3. Report stored with status 'pending'
4. Admin sees in dashboard
5. Admin reviews and takes action:
   - Dismiss (false positive)
   - Hide item (temporary)
   - Delete item (permanent)
   - Ban user (if repeated)

**Rationale:**
- ✅ **Community moderation** improves trust
- ✅ **Multiple reasons** helps categorization
- ✅ **Anonymous** encourages reporting
- ✅ **Admin review** prevents abuse
- ✅ **Action tracking** provides accountability

**Anti-Abuse:**
- Rate limit: Max 3 reports per IP per day
- Require email for serious reports (scam, fraud)
- Track reporter history (repeated false reports = ban)

---

## Summary of Recommendations

| Question | Recommendation | Priority | Complexity |
|----------|---------------|----------|------------|
| 1. Payment Amount | Tiered fixed pricing + admin override | High | Low |
| 2. Listing Duration | Fixed 30 days + renewal | High | Low |
| 3. Admin Creation | Manual seed + invite system (Phase 2) | Medium | Medium |
| 4. Notifications | Email (MVP) + SMS (Phase 2) | High | Low |
| 5. Image Limits | 5MB, 3 images, auto-optimize | High | Medium |
| 6. Search Ranking | Multi-factor relevance score | High | Medium |
| 7. Claim Verification | Description + optional photos | High | Low |
| 8. Expired Listings | Auto-archive + 7-day grace period | Medium | Low |
| 9. Duplicate Prevention | 3-layer detection system | Medium | High |
| 10. Reporting | Yes, with moderation system | Medium | Medium |

---

## Implementation Priority

### Must Have for MVP
1. ✅ Payment: Tiered pricing (at least standard tier)
2. ✅ Duration: Fixed 30 days
3. ✅ Notifications: Email only
4. ✅ Images: 5MB, 3 images limit
5. ✅ Search: Basic relevance ranking
6. ✅ Verification: Description-based
7. ✅ Expiration: Auto-archive

### Can Defer to Phase 2
- Admin invite system
- SMS notifications
- Duplicate detection (basic only for MVP)
- Reporting system (can add later)

---

## Next Steps

1. **Review these recommendations** with stakeholders
2. **Confirm or adjust** based on business needs
3. **Update Developer Handbook** with final decisions
4. **Update database schema** accordingly
5. **Begin implementation** with confirmed logic

---

**Status**: ✅ Recommendations Complete  
**Ready for**: Stakeholder Review → Confirmation → Implementation
