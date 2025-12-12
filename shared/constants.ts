/**
 * Business Logic Constants
 * Confirmed pricing, limits, and configuration values
 */

// Listing Pricing Tiers (RWF)
export const LISTING_PRICES = {
  standard: 1000,  // Default for most items
  premium: 2000,   // For high-value items (electronics, laptops)
  urgent: 3000,    // For urgent/priority listings
} as const;

export type PriceTier = keyof typeof LISTING_PRICES;

// Listing Duration (in days)
export const LISTING_DURATION_DAYS = 30;
export const LISTING_GRACE_PERIOD_DAYS = 7; // Days after expiration for renewal

// Image Limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const MAX_IMAGES_PER_ITEM = 3;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_DIMENSION = 1200; // Max width/height in pixels
export const IMAGE_QUALITY = 0.8; // 80% quality for compression

// Claim Verification
export const MIN_CLAIM_DESCRIPTION_LENGTH = 50; // Minimum characters for claim description

// Search Configuration
export const SEARCH_PAGE_SIZE = 20; // Default items per page
export const SEARCH_MAX_PAGE_SIZE = 100; // Maximum items per page
export const SEARCH_RANKING_WEIGHTS = {
  textMatch: 0.4,
  tagMatch: 0.3,
  locationProximity: 0.2,
  recency: 0.1,
} as const;

// Duplicate Detection
export const DUPLICATE_SIMILARITY_THRESHOLD = 0.8; // 80% similarity = potential duplicate
export const DUPLICATE_CHECK_WINDOW_DAYS = 7; // Check duplicates within last 7 days

// Reporting
export const MAX_REPORTS_PER_IP_PER_DAY = 3;

// Receipt Number Format
export const RECEIPT_PREFIXES = {
  found: 'FND',
  lost: 'LST',
  claim: 'CLM',
  payment: 'PAY',
} as const;

// Phone Number Validation (Rwanda)
export const RWANDA_PHONE_REGEX = /^(\+?250|0)7[0-9]{8}$/;

// Item Categories
export const ITEM_CATEGORIES = [
  'id_document',
  'electronics',
  'wallet',
  'keys',
  'clothing',
  'other',
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];

// Item Statuses
export const ITEM_STATUSES = [
  'pending',
  'active',
  'claimed',
  'archived',
  'expired',
  'rejected',
] as const;

export type ItemStatus = typeof ITEM_STATUSES[number];

// Payment Statuses
export const PAYMENT_STATUSES = [
  'unpaid',
  'pending',
  'paid',
  'failed',
  'cancelled',
] as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[number];

// Claim Statuses
export const CLAIM_STATUSES = [
  'pending',
  'verified',
  'rejected',
  'resolved',
] as const;

export type ClaimStatus = typeof CLAIM_STATUSES[number];
