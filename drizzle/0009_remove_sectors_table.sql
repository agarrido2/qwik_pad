-- Migration: Remove unused sectors table and simplify call_flow_templates
-- Date: 2026-02-21
-- Reason: sectors table not used in code, sectors are hardcoded constants

-- Step 1: Remove FK constraint and old column from call_flow_templates
ALTER TABLE "call_flow_templates" DROP COLUMN IF EXISTS "sector_id";

-- Step 2: Add new text column for sector
ALTER TABLE "call_flow_templates" ADD COLUMN "sector" text;

-- Step 3: Drop unused sectors table
DROP TABLE IF EXISTS "sectors";
