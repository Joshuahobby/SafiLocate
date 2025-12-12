# SafiLocate

A centralized digital platform for lost and found items in Rwanda. SafiLocate connects people who have lost items with those who have found them, making the recovery process efficient and accessible.

> 📘 **For detailed technical documentation**, see the [Developer Handbook](./docs/reference/DEVELOPER_HANDBOOK.md) - a comprehensive Functional Specification Document covering architecture, API specs, database schema, integrations, and more.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Management](#database-management)
- [API Structure](#api-structure)
- [Architecture Overview](#architecture-overview)
- [Security Considerations](#security-considerations)
- [Image Handling](#image-handling)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Current Implementation Status](#current-implementation-status)
- [Performance Optimization](#performance-optimization)
- [Documentation](#documentation)

## Features

- **Report Found Items** - Free, frictionless reporting for finders
- **Report Lost Items** - Paid listings for seekers to post detailed inquiries
- **Search & Match** - Mobile-optimized search with filters (category, location)
- **Secure Claiming** - Verification process for ownership claims
- **Admin Dashboard** - Back-office tools for content moderation and platform management

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (via Drizzle ORM)
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI + shadcn/ui

## Quick Start

Get up and running in 5 minutes:

```bash
# 1. Clone and install
git clone <repository-url>
cd SafiLocate
npm install

# 2. Set up environment variables
cp .env.example .env  # Create from template (if exists)
# Or create .env manually with at minimum:
# DATABASE_URL=postgresql://user:password@localhost:5432/safilocate
# SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 3. Set up database
npm run db:push

# 4. Start development server
npm run dev

# Open http://localhost:5000
```

## Prerequisites

- Node.js (v20 or higher recommended)
- PostgreSQL database (local or cloud-hosted)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SafiLocate
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see [Environment Variables](#environment-variables) section below)

4. Push database schema:
```bash
npm run db:push
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables

- **`DATABASE_URL`** - PostgreSQL database connection string
  ```
  DATABASE_URL=postgresql://username:password@localhost:5432/safilocate
  ```
  For cloud providers (e.g., Neon, Supabase), use the connection string provided by your database service.

- **`SESSION_SECRET`** - Secret key for encrypting session cookies (generate a strong random string)
  ```
  SESSION_SECRET=your-super-secret-session-key-change-this-in-production
  ```
  **Security Note**: Use a cryptographically secure random string in production. You can generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Optional Variables

- **`PORT`** - Server port number (defaults to `5000`)
  ```
  PORT=5000
  ```

- **`NODE_ENV`** - Environment mode (`development` or `production`)
  ```
  NODE_ENV=development
  ```

### Payment Integration (Flutterwave)

Required for production payment processing. Currently using mock payments in development:

- **`FLUTTERWAVE_PUBLIC_KEY`** - Flutterwave public API key
  ```
  FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxx
  ```

- **`FLUTTERWAVE_SECRET_KEY`** - Flutterwave secret API key
  ```
  FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxx
  ```

- **`FLUTTERWAVE_ENCRYPTION_KEY`** - Flutterwave encryption key (for secure payment requests)
  ```
  FLUTTERWAVE_ENCRYPTION_KEY=xxxxxxxxxxxxx
  ```

- **`FLUTTERWAVE_WEBHOOK_SECRET`** - Secret for verifying Flutterwave webhook signatures
  ```
  FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret
  ```

### AI Integration (OpenAI)

Required for AI-powered item tagging and normalization:

- **`OPENAI_API_KEY`** - OpenAI API key for GPT-4o-mini model
  ```
  OPENAI_API_KEY=sk-xxxxxxxxxxxxx
  ```

### Image Storage (Optional)

Currently, images are stored as base64 data URLs. For production, consider cloud storage:

- **`CLOUDINARY_CLOUD_NAME`** - Cloudinary cloud name (if using Cloudinary)
  ```
  CLOUDINARY_CLOUD_NAME=your-cloud-name
  ```

- **`CLOUDINARY_API_KEY`** - Cloudinary API key
  ```
  CLOUDINARY_API_KEY=xxxxxxxxxxxxx
  ```

- **`CLOUDINARY_API_SECRET`** - Cloudinary API secret
  ```
  CLOUDINARY_API_SECRET=xxxxxxxxxxxxx
  ```

### Replit-Specific Variables (Optional)

These are automatically set when running on Replit and can be ignored for local development:

- `REPL_ID` - Replit instance identifier
- `REPLIT_INTERNAL_APP_DOMAIN` - Internal app domain for Replit
- `REPLIT_DEV_DOMAIN` - Development domain for Replit

### Example `.env` File

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/safilocate

# Server
PORT=5000
NODE_ENV=development

# Security
SESSION_SECRET=your-generated-secret-key-here

# Payments (Flutterwave)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-test-xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-test-xxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=test-xxxxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_SECRET=test-webhook-secret

# AI (OpenAI)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Image Storage (Optional - Cloudinary)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=xxxxxxxxxxxxx
# CLOUDINARY_API_SECRET=xxxxxxxxxxxxx
```

## Running the Application

### Development Mode

Run both the client and server in development mode:

```bash
# Start the development server (runs on port 5000 by default)
npm run dev
```

The server will start on the port specified by `PORT` environment variable (default: 5000). The client is served through Vite's development server.

### Client-Only Development

To run only the client development server:

```bash
npm run dev:client
```

This starts Vite dev server on port 5000.

### Production Build

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Database Management

### Push Schema Changes

After modifying the schema in `shared/schema.ts`, push changes to the database:

```bash
npm run db:push
```

**Note**: Ensure `DATABASE_URL` is set in your environment before running this command.

## Project Structure

```
SafiLocate/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
│   └── public/          # Static assets
├── server/              # Backend Express server
│   ├── index.ts        # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database storage interface
│   └── vite.ts          # Vite middleware setup
├── shared/              # Shared code between client and server
│   └── schema.ts        # Database schema (Drizzle ORM)
├── script/              # Build scripts
└── migrations/          # Database migrations (generated)
```

## Available Scripts

- `npm run dev` - Start development server (client + API)
- `npm run dev:client` - Start Vite dev server only (port 5000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## API Structure

All API routes are prefixed with `/api` and should be defined in `server/routes.ts`.

### Current API Endpoints

The API structure is currently being developed. Routes should follow RESTful conventions:

- `GET /api/items` - List items (with optional query parameters for filtering)
- `POST /api/items/found` - Report a found item
- `POST /api/items/lost` - Report a lost item (requires payment)
- `GET /api/items/:id` - Get item details
- `POST /api/items/:id/claim` - Submit a claim for an item
- `GET /api/search` - Search items with filters

### Authentication

The application uses Passport.js with local strategy for authentication. Session management is handled via `express-session` with PostgreSQL session storage (`connect-pg-simple`).

**Note**: Authentication routes are not yet fully implemented. When adding authentication:

1. Configure session middleware in `server/index.ts`
2. Initialize Passport with local strategy
3. Create login/logout routes in `server/routes.ts`
4. Protect admin routes with authentication middleware

### Client-Server Communication

The frontend uses TanStack Query for data fetching. API requests are made through:

- `apiRequest()` - For mutations (POST, PUT, DELETE)
- `getQueryFn()` - For queries (GET)

All requests include `credentials: "include"` for cookie-based session management.

## Architecture Overview

```
┌─────────────────┐
│   React Client  │ (Vite Dev Server / Static Files)
│   (Port 5000)   │
└────────┬────────┘
         │ HTTP/HTTPS
         │ (credentials: include)
         ▼
┌─────────────────┐
│ Express Server  │
│  (Port 5000)    │
├─────────────────┤
│  /api/* routes  │ → Business Logic
│  Static Files   │ → Production only
│  Vite Middleware│ → Development only
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│PostgreSQL│ │  External    │
│Database │ │  Services    │
└─────────┘ │              │
           │ - Flutterwave │
           │ - OpenAI      │
           │ - Cloudinary  │
           └──────────────┘
```

## Security Considerations

### Session Security

- Sessions are stored in PostgreSQL using `connect-pg-simple`
- Ensure `SESSION_SECRET` is a strong, randomly generated string
- In production, use HTTPS to protect session cookies
- Configure secure cookie flags: `secure: true`, `httpOnly: true`, `sameSite: 'strict'`

### Database Security

- Never commit `.env` files or database credentials
- Use connection pooling for database connections
- Validate and sanitize all user inputs using Zod schemas
- Use parameterized queries (Drizzle ORM handles this automatically)

### API Security

- Implement rate limiting for API endpoints (consider `express-rate-limit`)
- Validate request bodies using Zod schemas
- Implement CSRF protection for state-changing operations
- Use HTTPS in production

### Payment Security

- Never expose Flutterwave secret keys to the client
- Verify webhook signatures from Flutterwave
- Store payment records securely in the database
- Implement idempotency keys for payment requests

## Image Handling

Currently, images are handled client-side as base64 data URLs. For production:

1. **Upload to Cloud Storage**: Implement server-side upload endpoint
2. **Process Images**: Resize/optimize images before storage
3. **CDN**: Serve images through a CDN for better performance
4. **File Size Limits**: Enforce maximum file size (currently 5MB client-side)

The `ImageUpload` component in `client/src/components/image-upload.tsx` handles client-side image selection and preview.

## Troubleshooting

### Database Connection Issues

```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check if database exists
psql $DATABASE_URL -c "\l"
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
npm run build
```

### TypeScript Errors

```bash
# Type check without building
npm run check

# Verify tsconfig.json is correct
cat tsconfig.json
```

### Session Not Persisting

- Verify `SESSION_SECRET` is set
- Check that `connect-pg-simple` table exists in PostgreSQL
- Ensure cookies are enabled in the browser
- Check browser console for cookie-related errors

### Vite HMR Not Working

- Ensure you're accessing via the correct port
- Check browser console for WebSocket connection errors
- Verify `NODE_ENV=development` is set

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SESSION_SECRET`
- [ ] Configure production database URL
- [ ] Set up Flutterwave production keys
- [ ] Configure OpenAI API key
- [ ] Set up image storage (Cloudinary or similar)
- [ ] Enable HTTPS
- [ ] Configure CORS for your domain
- [ ] Set up monitoring and error tracking
- [ ] Configure database backups
- [ ] Set up webhook endpoints for Flutterwave
- [ ] Test payment flow end-to-end

### Build for Production

```bash
# Build the application
npm run build

# The build output will be in:
# - dist/index.cjs (server bundle)
# - dist/public/ (client static files)

# Start production server
npm start
```

### Environment-Specific Configuration

- **Development**: Uses Vite dev server with HMR
- **Production**: Serves static files from `dist/public/`
- **Replit**: Automatically detects Replit environment and configures accordingly

## Contributing

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Ensure TypeScript compiles: `npm run check`
4. Test locally: `npm run dev`
5. Update database schema if needed: `npm run db:push`
6. Commit and push your changes

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use Zod for validation schemas
- Prefix API routes with `/api`
- Use TanStack Query for data fetching
- Follow React best practices (hooks, functional components)

### Database Schema Changes

1. Modify `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Test migrations on a development database first
4. Document schema changes in commit messages

## Current Implementation Status

### ✅ Completed

- Frontend UI components and pages (Home, Report Found, Report Lost, Search, Admin)
- Database schema definition (Drizzle ORM)
- Image upload component (client-side base64)
- Payment page UI (mocked flow)
- Project structure and build system
- TypeScript configuration
- Tailwind CSS styling system

### 🚧 In Progress / TODO

- **API Routes**: Implement actual API endpoints in `server/routes.ts`
- **Database Storage**: Migrate from `MemStorage` to PostgreSQL implementation
- **Authentication**: Configure Passport.js and session management
- **Payment Integration**: Implement Flutterwave payment gateway
- **AI Integration**: Add OpenAI API for item tagging and normalization
- **Image Storage**: Implement cloud storage (Cloudinary) for production
- **Webhook Handling**: Set up Flutterwave webhook endpoints
- **Email Notifications**: Implement email service for claims and notifications
- **Search Functionality**: Backend search implementation with filters
- **Admin Authentication**: Secure admin routes with authentication

### 📋 Known Limitations

- Currently using in-memory storage (`MemStorage`) - data is lost on server restart
- Payment flow is mocked - needs real Flutterwave integration
- Images stored as base64 - not scalable for production
- No authentication system implemented yet
- No rate limiting or security middleware configured
- Session storage not configured (using default memory store)

## Development Notes

- The application uses a monorepo structure with shared TypeScript types
- Database schema is defined in `shared/schema.ts` using Drizzle ORM
- The server serves both API routes (`/api/*`) and static files in production
- In development, Vite middleware handles client-side routing and hot module replacement
- The application is optimized for mobile-first, 3G network performance

## Performance Optimization

- **Code Splitting**: Vite automatically handles code splitting
- **Image Optimization**: Implement image compression and lazy loading
- **Database Indexing**: Add indexes on frequently queried fields (category, location, status)
- **Caching**: Implement Redis for session storage and query caching
- **CDN**: Use CDN for static assets and images

## Documentation

All documentation is organized in the [`docs/`](./docs/) directory. See the [Documentation Index](./docs/README.md) for a complete overview.

### Quick Links

- **[Developer Handbook](./docs/reference/DEVELOPER_HANDBOOK.md)** - Complete technical specification (FSD)
- **[Quick Start Testing](./docs/guides/setup/QUICK_START_TESTING.md)** - Get up and running in 5 minutes
- **[Environment Setup](./docs/guides/setup/SETUP_ENV.md)** - Configure environment variables
- **[Testing Guide](./docs/guides/testing/TESTING_GUIDE.md)** - Comprehensive testing procedures
- **[Code Review & Action Plan](./docs/planning/CODE_REVIEW_AND_ACTION_PLAN.md)** - Implementation roadmap
- **[Business Logic Recommendations](./docs/planning/BUSINESS_LOGIC_RECOMMENDATIONS.md)** - Confirmed decisions

### Documentation Structure

- **[Guides](./docs/guides/)** - Setup and testing guides
- **[Reference](./docs/reference/)** - Technical reference documentation
- **[Planning](./docs/planning/)** - Project planning and action plans
- **[Specifications](./docs/specs/)** - Product specs and architecture

### Additional Resources

- `shared/schema.ts` - Database schema definitions
- `server/routes.ts` - API route structure
- `client/src/` - Frontend component documentation

## License

MIT
