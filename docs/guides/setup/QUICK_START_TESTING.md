# Quick Start: Testing Phase 1

Follow these steps to test Phase 1 setup:

> 📚 **Documentation Index**: See the [Documentation README](../../README.md) for all available documentation.

**Related Documents:**
- [Environment Setup](./SETUP_ENV.md) - Detailed environment variable configuration
- [Testing Guide](../testing/TESTING_GUIDE.md) - Comprehensive testing procedures
- [Phase 1 Completion Report](../../planning/PHASE_1_COMPLETE.md) - What was implemented
- [Developer Handbook](../../reference/DEVELOPER_HANDBOOK.md) - Complete technical reference

---

## Step 1: Set Up Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/safilocate
```

**Important**: Replace `username`, `password`, and `safilocate` with your actual PostgreSQL credentials.

---

## Step 2: Ensure PostgreSQL is Running

**Check if PostgreSQL is running:**
```bash
# On Linux/Mac
sudo systemctl status postgresql
# or
pg_isready

# On Windows
# Check Services panel for PostgreSQL
```

**Create database if it doesn't exist:**
```bash
psql -U postgres -c "CREATE DATABASE safilocate;"
```

---

## Step 3: Push Database Schema

This creates all tables, enums, and indexes:

```bash
npm run db:push
```

**Expected Output:**
```
✓ Generated SQL
✓ Pushed to database
```

**If you get an error:**
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Ensure database exists
- Check user has CREATE permissions

---

## Step 4: Create Admin User

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
```

**To use a custom password:**
```bash
ADMIN_PASSWORD=your-secure-password npm run seed:admin
```

---

## Step 5: Run Automated Tests

```bash
npm run test:phase1
```

This will test:
- ✅ Database connection
- ✅ All tables exist
- ✅ All enums exist
- ✅ All indexes exist
- ✅ Constants are defined
- ✅ Storage operations work
- ✅ Admin user exists

**Expected Output:**
```
🧪 Phase 1 Testing Suite

==================================================
✅ Database Connection: Successfully connected to PostgreSQL
✅ Table: users: Table exists
✅ Table: found_items: Table exists
... (more tests)

📊 Test Summary:
   Total Tests: 25+
   ✅ Passed: 25+
   ❌ Failed: 0

🎉 All tests passed! Phase 1 is ready.
```

---

## Step 6: Verify Manually (Optional)

**Check tables:**
```bash
psql $DATABASE_URL -c "\dt"
```

**Check admin user:**
```bash
psql $DATABASE_URL -c "SELECT username, role FROM users WHERE role = 'admin';"
```

**Check a table structure:**
```bash
psql $DATABASE_URL -c "\d found_items"
```

---

## Troubleshooting

### "DATABASE_URL environment variable is required"
- Create `.env` file
- Set `DATABASE_URL` with correct credentials

### "relation does not exist"
- Run `npm run db:push` to create tables

### "password authentication failed"
- Check PostgreSQL username/password
- Verify database exists
- Check connection string format

### "Admin user already exists"
- Normal if you've run seed before
- To recreate: Delete admin user, then run seed again

---

## Success Indicators

You're ready for Phase 2 when:

- ✅ `npm run db:push` completes without errors
- ✅ `npm run seed:admin` creates admin user
- ✅ `npm run test:phase1` shows all tests passing
- ✅ `npm run check` compiles without errors
- ✅ Can query tables using `psql` or database client

---

## Next Steps

Once all tests pass:

1. ✅ **Phase 1 Complete** - Database foundation ready
2. 🚀 **Move to Phase 2** - Start implementing API endpoints
3. 📝 **Review Results** - Check test output for any warnings

---

**Estimated Time**: 5-10 minutes  
**Difficulty**: Easy (with PostgreSQL set up)
