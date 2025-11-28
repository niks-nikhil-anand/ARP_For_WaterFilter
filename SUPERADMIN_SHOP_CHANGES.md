# SUPERADMIN Shop Implementation

## Overview
This update ensures that SUPERADMIN users are treated as shops, allowing agents to be assigned to the superadmin just like they can be assigned to regular admin shops.

## Changes Made

### 1. Database Schema
- No schema changes required - the existing `Shop` model already supports any user with `userId` field
- The `Agent` model already has an optional `shopId` field that can reference any shop

### 2. Signup Action ([src/actions/auth/index.ts](src/actions/auth/index.ts))
- Modified the signup logic to create a `Shop` record for both `ADMIN` and `SUPERADMIN` roles
- Previously only `ADMIN` users got a shop, now `SUPERADMIN` users also get one automatically

### 3. Shop Details Page ([src/app/(admin)/admin/shop_details/page.tsx](src/app/(admin)/admin/shop_details/page.tsx))
- Updated to load and display both `ADMIN` and `SUPERADMIN` users
- Added a "Role" column to the table showing whether the shop belongs to an ADMIN or SUPERADMIN
- Updated the page description to reflect that it manages both types

### 4. Agent Assignment
- No changes needed - the existing agent assignment logic already allows assigning agents to any shop
- The agent details page loads all shops from `/api/shops`, which now includes SUPERADMIN shops
- Agents can now be assigned to SUPERADMIN shops through the dropdown

### 5. API Endpoints
- The `/api/shops` endpoint already returns all shops for SUPERADMIN users (no changes needed)
- The `getShops()` action returns all shops without filtering by role

## Migration for Existing Data

If you have existing SUPERADMIN users in your database who don't have Shop records, run the migration script:

### Option 1: Using psql
```bash
psql $DATABASE_URL -f prisma/migrations/manual_add_shop_for_superadmin.sql
```

### Option 2: Using Prisma DB Execute
```bash
npx prisma db execute --file prisma/migrations/manual_add_shop_for_superadmin.sql
```

### Option 3: Manual SQL Query
Connect to your database and run:
```sql
INSERT INTO "Shop" ("name", "userId", "createdAt", "updatedAt")
SELECT
    u.name AS "name",
    u.id AS "userId",
    NOW() AS "createdAt",
    NOW() AS "updatedAt"
FROM "User" u
LEFT JOIN "Shop" s ON s."userId" = u.id
WHERE u.role = 'SUPERADMIN'
  AND s.id IS NULL;
```

## Testing

1. **New SUPERADMIN Signup**: When a new SUPERADMIN signs up, verify they automatically get a shop
2. **Shop Details Page**: Navigate to `/admin/shop_details` and verify both ADMIN and SUPERADMIN shops are listed with their roles
3. **Agent Assignment**: Go to `/admin/agent_details` and verify SUPERADMIN shops appear in the shop dropdown when adding/editing agents
4. **Existing SUPERADMIN**: Run the migration script and verify existing SUPERADMIN users now have shops

## Benefits

- **Consistency**: All admin-level users (both ADMIN and SUPERADMIN) now have shops
- **Agent Management**: Agents can be assigned directly to the superadmin, improving organizational flexibility
- **No Breaking Changes**: Existing functionality remains intact, this is purely additive
- **Backward Compatible**: The migration script handles existing SUPERADMIN users gracefully

## Files Modified

1. [src/actions/auth/index.ts](src/actions/auth/index.ts) - Lines 49-84
2. [src/app/(admin)/admin/shop_details/page.tsx](src/app/(admin)/admin/shop_details/page.tsx) - Multiple sections
3. [prisma/migrations/manual_add_shop_for_superadmin.sql](prisma/migrations/manual_add_shop_for_superadmin.sql) - New file

## No Changes Needed In

- Database schema (prisma/schema.prisma)
- Agent model or API endpoints
- Agent details page (already supports all shops)
- Shop API endpoint (already returns all shops for SUPERADMIN)
