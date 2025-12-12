# Environment Variables Setup Guide

> 📚 **Documentation Index**: See the [Documentation README](../../README.md) for all available documentation.

**Related Documents:**
- [Quick Start Testing](./QUICK_START_TESTING.md) - Get up and running quickly
- [Testing Guide](../testing/TESTING_GUIDE.md) - Comprehensive testing procedures
- [Developer Handbook](../../reference/DEVELOPER_HANDBOOK.md) - Complete technical reference

---

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and update these REQUIRED variables:**

   ```env
   # Database - REQUIRED
   DATABASE_URL=postgresql://username:password@localhost:5432/safilocate
   
   # Session Secret - REQUIRED
   SESSION_SECRET=your-generated-secret-key-here
   ```

3. **Generate a secure SESSION_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste it as your `SESSION_SECRET` value.

---

## Required Variables for Phase 1

### DATABASE_URL (REQUIRED)
PostgreSQL connection string.

**Format:**
```
postgresql://username:password@host:port/database
```

**Examples:**
```env
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/safilocate

# Cloud database (Neon, Supabase, etc.)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/safilocate
```

**How to get it:**
- Local: Use your PostgreSQL credentials
- Cloud: Get from your database provider's dashboard

### SESSION_SECRET (REQUIRED)
Secret key for encrypting session cookies.

**Generate one:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example:**
```env
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### PORT (Optional)
Server port number. Defaults to 5000 if not set.

```env
PORT=5000
```

### NODE_ENV (Optional)
Environment mode. Defaults to development.

```env
NODE_ENV=development  # or production
```

### ADMIN_PASSWORD (Optional - for seed script)
Default admin password. Change after first login!

```env
ADMIN_PASSWORD=admin123
```

### ADMIN_EMAIL (Optional - for seed script)
Admin email address.

```env
ADMIN_EMAIL=admin@safilocate.com
```

---

## Optional Variables (For Later Phases)

These are commented out in `.env.example` and not needed for Phase 1 testing:

- **Flutterwave** (Phase 5 - Payment Integration)
- **OpenAI** (Phase 6 - AI Integration)
- **Cloudinary** (Phase 7 - Image Storage)

---

## Example Complete .env File

```env
# Database
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/safilocate

# Server
PORT=5000
NODE_ENV=development

# Session Security
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Admin (for seed script)
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@safilocate.com
```

---

## Verification

After setting up `.env`, verify it works:

```bash
# Check if file exists
ls -la .env

# Test database connection (if psql is installed)
psql $DATABASE_URL -c "SELECT version();"

# Run database migration
npm run db:push

# Create admin user
npm run seed:admin

# Run tests
npm run test:phase1
```

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` to git (it's in `.gitignore`)
- Use strong `SESSION_SECRET` in production
- Change default `ADMIN_PASSWORD` after first login
- Keep `DATABASE_URL` secure (contains credentials)

---

## Troubleshooting

### "DATABASE_URL environment variable is required"
- Make sure `.env` file exists
- Check `DATABASE_URL` is set correctly
- Verify no extra spaces around `=`

### "password authentication failed"
- Check PostgreSQL username/password
- Verify database exists
- Check connection string format

### "relation does not exist"
- Run `npm run db:push` to create tables
- Check database connection is working

---

**Ready to test Phase 1?** See `QUICK_START_TESTING.md` for next steps!
