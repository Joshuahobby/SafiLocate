# Tech Stack Proposal

Given the Replit environment and the need for a low-budget, high-performance MVP, here is the recommended stack:

## Frontend: React + Vite + Tailwind CSS
*   **Why:** Extremely fast load times (crucial for 3G), efficient development, and responsive mobile-first UI components. The `wouter` router is lightweight and perfect for this scale.

## Backend: Node.js + Express
*   **Why:** Robust, stateless, and integrates natively with Replit's environment. It handles payment callbacks and API logic efficiently.

## Database: PostgreSQL (via Replit or Neon)
*   **Why:** Structured relational data is essential for matching items (Categories, Locations, timestamps). SQL allows for powerful filtering queries.

## AI Integration: OpenAI (GPT-4o-mini or similar lightweight model)
*   **Why:** We need "intelligence on a budget." We will use single-shot calls to normalize messy user inputs into clean tags (e.g., input "Samsung S21 broken screen" -> Tags: `Phone`, `Samsung`, `Damaged`) without expensive continuous agents.

## Payments: Flutterwave
*   **Why:** The standard for payments in Rwanda/East Africa. Supports Mobile Money (MoMo), which is critical for mass adoption.
