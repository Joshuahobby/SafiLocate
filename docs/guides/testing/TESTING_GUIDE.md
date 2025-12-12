# Phase 1 Testing Guide

This guide will help you test Phase 1 (Database Setup) to ensure everything is working correctly.

> 📚 **Documentation Index**: See the [Documentation README](../../README.md) for all available documentation.

**Related Documents:**
- [Quick Start Testing](../setup/QUICK_START_TESTING.md) - Fast setup guide
- [Environment Setup](../setup/SETUP_ENV.md) - Environment variable configuration
- [Phase 1 Completion Report](../../planning/PHASE_1_COMPLETE.md) - What was implemented
- [Developer Handbook](../../reference/DEVELOPER_HANDBOOK.md) - Complete technical reference

---

---

## Prerequisites

Before testing, ensure you have:

1. ✅ Node.js installed (v20+)
2. ✅ PostgreSQL database running
3. ✅ Dependencies installed (`npm install`)
4. ✅ `.env` file with `DATABASE_URL`

---

## Step-by-Step Testing

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `bcrypt` for password hashing
- `pg` for PostgreSQL
- `drizzle-orm` for database operations

**Expected Output**: Packages installed successfully

---

### Step 2: Verify Environment Variables

Check your `.env` file has:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/safilocate
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-secret-key-here
```

**Test Connection:**
```bash
# Test PostgreSQL connection (optional)
psql $DATABASE_URL -c "SELECT version();"
```

**Expected Output**: PostgreSQL version information

---

### Step 3: Push Database Schema

This creates all tables, enums, and indexes:

```bash
npm run db:push
```

**Expected Output:**
```
✓ Generated SQL
✓ Pushed to database
```

**What This Does:**
- Creates 6 tables (users, found_items, lost_items, claims, payments, reports)
- Creates 7 enums (user_role, item_status, payment_status, etc.)
- Creates indexes for performance
- Sets up relationships

**Verify Tables Created:**
```bash
# Using psql
psql $DATABASE_URL -c "\dt"

# Should show:
#  found_items
#  lost_items
#  claims
#  payments
#  reports
#  users
```

---

### Step 4: Create Admin User

```bash
npm run seed:admin
```

**Expected Output:**
```
🌱 Starting admin seed...
✅ Admin user created successfully!
   Username: admin
   Email: admin@safilocate.com
   Role: admin
   ID: <uuid>

⚠️  IMPORTANT: Change the default password after first login!
```

**With Custom Password:**
```bash
ADMIN_PASSWORD=your-secure-password npm run seed:admin
```

**Verify Admin Created:**
```bash
psql $DATABASE_URL -c "SELECT username, role FROM users WHERE role = 'admin';"
```

**Expected Output:**
```
 username | role
----------+-------
 admin    | admin
```

---

### Step 5: Run Automated Tests

Run the comprehensive test suite:

```bash
npm run test:phase1
```

**Expected Output:**
```
🧪 Phase 1 Testing Suite

==================================================
✅ Database Connection: Successfully connected to PostgreSQL

✅ Table: users: Table exists
✅ Table: found_items: Table exists
✅ Table: lost_items: Table exists
✅ Table: claims: Table exists
✅ Table: payments: Table exists
✅ Table: reports: Table exists

✅ Enum: user_role: Enum exists
✅ Enum: item_status: Enum exists
✅ Enum: payment_status: Enum exists
✅ Enum: claim_status: Enum exists
✅ Enum: report_reason: Enum exists
✅ Enum: report_status: Enum exists
✅ Enum: price_tier: Enum exists

✅ Index: idx_users_username: Index exists
✅ Index: idx_found_items_category: Index exists
... (more indexes)

✅ Constants: Pricing: Pricing constants defined correctly
✅ Storage: Create Found Item: Created item with ID: <uuid>
✅ Storage: Get Found Item: Successfully retrieved item
✅ Storage: Create Lost Item: Created item with ID: <uuid>
✅ Admin User: Admin user exists

==================================================

📊 Test Summary:
   Total Tests: 25+
   ✅ Passed: 25+
   ❌ Failed: 0

🎉 All tests passed! Phase 1 is ready.
```

---

### Step 6: Manual Database Verification

#### Check Table Structure

```bash
psql $DATABASE_URL -c "\d found_items"
```

**Expected Output**: Table structure with all columns, types, and constraints

#### Check Enums

```bash
psql $DATABASE_URL -c "SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'item_status');"
```

**Expected Output:**
```
   enumlabel
---------------
 pending
 active
 claimed
 archived
 expired
 rejected
```

#### Check Indexes

```bash
psql $DATABASE_URL -c "\di"
```

**Expected Output**: List of all indexes including:
- `idx_users_username`
- `idx_found_items_category`
- `idx_found_items_status`
- `idx_lost_items_category`
- etc.

---

### Step 7: Test Storage Operations (Optional)

Create a test file `test-storage.ts`:

```typescript
import { storage } from "./server/storage";

async function test() {
  // Test creating found item
  const found = await storage.createFoundItem({
    category: "electronics",
    title: "Test Phone",
    description: "Testing storage",
    location: "Kigali",
    dateFound: "2024-01-01",
    contactName: "Test",
    contactPhone: "+250788000000",
  });
  console.log("Created:", found);

  // Test listing
  const list = await storage.listFoundItems({});
  console.log("Listed:", list.items.length, "items");
}

test();
```

Run: `tsx test-storage.ts`

---

## Troubleshooting

### Error: "DATABASE_URL environment variable is required"

**Solution:**
- Create `.env` file in project root
- Add `DATABASE_URL=postgresql://user:pass@localhost:5432/dbname`

### Error: "relation does not exist"

**Solution:**
- Run `npm run db:push` to create tables
- Check database connection string is correct

### Error: "enum type does not exist"

**Solution:**
- Run `npm run db:push` again
- Drizzle should create enums automatically

### Error: "Admin user already exists"

**Solution:**
- This is normal if you've run seed before
- To recreate: Delete admin user first, then run seed again

### Error: "password authentication failed"

**Solution:**
- Check PostgreSQL username/password
- Verify database exists
- Check connection string format

### Tables exist but indexes don't

**Solution:**
- Indexes are defined in schema but may need manual creation
- Check `DEVELOPER_HANDBOOK.md` for SQL to create full-text indexes

---

## Success Criteria

Phase 1 is complete when:

- ✅ All 6 tables exist in database
- ✅ All 7 enums are created
- ✅ All indexes are created (or at least critical ones)
- ✅ Admin user can be created
- ✅ Storage operations work (create, read, list)
- ✅ TypeScript compiles without errors (`npm run check`)
- ✅ Test suite passes (`npm run test:phase1`)

---

## Next Steps After Testing

Once all tests pass:

1. ✅ **Phase 1 Complete** - Database foundation is ready
2. 🚀 **Move to Phase 2** - Start implementing API endpoints
3. 📝 **Update Documentation** - Note any issues found during testing

---

## Quick Test Checklist

- [ ] `npm install` completes successfully
- [ ] `npm run db:push` creates all tables
- [ ] `npm run seed:admin` creates admin user
- [ ] `npm run test:phase1` passes all tests
- [ ] `npm run check` (TypeScript) compiles without errors
- [ ] Can query tables using `psql` or database client
- [ ] Storage operations work (create/list items)

---

**Status**: Ready for testing  
**Estimated Time**: 10-15 minutes  
**Difficulty**: Easy (with proper setup)
