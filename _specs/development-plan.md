# Development Plan

We will build this iteratively, focusing on the "Happy Path" first.

## Phase 1: Foundation & Brand (MVP Setup)
*Goal: Set up the visual identity, database schema, and project structure.*
1.  **Design System Setup:** Define typography (clean, trustworthy sans-serif), color palette (SafiLocate Blue), and core UI components.
2.  **Database Modeling:** Implement the schema for `users`, `found_items`, `lost_items` in `shared/schema.ts`.
3.  **Landing Page:** Build a high-performance, mobile-first homepage with clear "Report Lost" and "Report Found" Call-to-Actions (CTAs).

## Phase 2: The "Found" Flow (Growth Engine)
*Goal: Populate the database with items. This is the free side of the market.*
1.  **Found Item Form:** Create a multi-step form for reporting found items (Category, Location, Contact, Photo).
2.  **Image Handling:** Implement basic image upload (local storage or cloud blob for MVP).
3.  **Success State:** Generate a "Digital Receipt" for the finder to prove they reported it.

## Phase 3: The "Lost" Flow (Revenue Engine)
*Goal: Enable monetization and paid listings.*
1.  **Lost Item Form:** Create the form for reporting lost items (similar to Found, but with Reward fields).
2.  **Payment Mockup:** Since we are in a dev environment, implement a "Mock Payment" flow to simulate the Flutterwave experience (Pending -> Paid -> Active).
3.  **Listing Activation:** Logic to only show lost items after "payment" is confirmed.

## Phase 4: Search & Discovery
*Goal: Connect the two sides of the market.*
1.  **Search Interface:** robust search bar with filters for Category and Location.
2.  **Listing Cards:** Design clear, scannable cards for items (optimized for mobile scrolling).
3.  **Item Details:** A dedicated page for each item with a "Claim" button.

## Phase 5: Administration & Claims
*Goal: Trust and Safety.*
1.  **Claim Flow:** A simple form for a seeker to submit a claim to a finder.
2.  **Admin Dashboard:** A secured route to view all listings, approve/reject content, and view claims.

## Phase 6: AI & Polish (Nice-to-Have)
1.  **AI Tagging:** Integrate a mock or real AI service to auto-tag descriptions.
2.  **Performance Tuning:** Ensure all images are optimized and queries are fast.
