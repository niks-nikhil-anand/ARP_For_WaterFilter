-- Migration: Add Shop records for existing SUPERADMIN users who don't have one
-- This ensures all SUPERADMIN users have a shop so agents can be assigned to them

-- Insert Shop records for SUPERADMIN users who don't have one
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

-- This migration ensures backward compatibility for existing SUPERADMIN users
-- New SUPERADMIN users will automatically get a shop via the signup action
