# Repository Structure

> 📚 **Documentation Index**: See the [Documentation README](../../README.md) for all available documentation.

**Related Documents:**
- [System Architecture](./system-architecture.md) - System design
- [Developer Handbook](../reference/DEVELOPER_HANDBOOK.md) - Complete technical specification

---

This structure maps to the current Replit monorepo standard.

*   **`client/src/`**
    *   `pages/` - Route components (Home, Search, PostLost, PostFound, Admin).
    *   `components/` - Reusable UI blocks (ItemCard, SearchBar, Forms).
    *   `hooks/` - Data fetching and state logic.
    *   `lib/` - Frontend utilities (dates, formatting).
*   **`server/`**
    *   `routes.ts` - API endpoint definitions.
    *   `storage.ts` - Database interface (Drizzle ORM).
    *   `services/` - Isolated logic for AI and Payments.
*   **`shared/`**
    *   `schema.ts` - Database schema and shared TypeScript types (Zod).
*   **`attached_assets/`** - Static images, logos, and generated assets.
