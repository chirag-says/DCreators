-- ============================================================================
-- DCreators — one-off manual apply script
-- Generated 2026-08-26. Paste into the Supabase SQL editor and run ONCE.
--
-- Equivalent to:
--   supabase migration repair --status applied <the 22 pre-August versions>
--   supabase db push
--
-- Safe to re-run: every statement is idempotent (IF EXISTS / IF NOT EXISTS /
-- ON CONFLICT DO NOTHING / CREATE OR REPLACE).
--
-- PART A records the 22 migrations that were applied by hand months ago but
--        never recorded, so the CLI stops seeing them as pending. No DDL.
-- PART B applies the three new migrations.
-- PART C records those three.
-- ============================================================================

BEGIN;

-- ── PART A: baseline the existing history ───────────────────────────────────
-- These migrations are already live in the database. This only writes their
-- version numbers into the history table. It changes no schema and no data.
INSERT INTO supabase_migrations.schema_migrations (version) VALUES
  ('20260628120100'), ('20260628120200'), ('20260628120300'), ('20260628120400'),
  ('20260628120500'), ('20260628120600'), ('20260628120700'), ('20260628120800'),
  ('20260628120900'), ('20260628121000'), ('20260628121100'), ('20260628121200'),
  ('20260628121300'), ('20260628121400'),
  ('20260629120100'), ('20260629120200'), ('20260629120300'), ('20260629120400'),
  ('20260629120500'),
  ('20260630120100'), ('20260630120200'), ('20260630120300')
ON CONFLICT (version) DO NOTHING;

-- ── PART B: 20260826120100_add_bid_creative_item ─────────────────
-- Give bid requests a creative item, so a project born from a bid has a real
-- assignment title instead of falling back to the role ("Hire Designer").
--
-- AssignProjectScreen and HireConsultantScreen already ask the client to pick
-- a creative item and write it to projects.assignment_details[0]. CreateBid
-- did not, so acceptBidCandidate() inserted assignment_details: null and every
-- downstream surface degraded to assignment_type. Same gap on the booking
-- flow, but BookConsultantScreen builds its project payload client-side and
-- needs no column of its own.
--
-- Additive and nullable: existing rows stay valid, no backfill required,
-- no rewrite of the table. Safe to run on a live database.

ALTER TABLE bid_requests ADD COLUMN IF NOT EXISTS creative_item TEXT;

COMMENT ON COLUMN bid_requests.creative_item IS
  'Concrete deliverable chosen by the client (e.g. "Logo Design"). Copied into projects.assignment_details[0] when a candidate accepts.';

-- ── PART B: 20260826120200_assert_rls_baseline ─────────────────
-- Re-assert the two security-critical RLS states from the June audit.
--
-- WHY THIS EXISTS: the migrations that first fixed these were applied by hand
-- in the SQL editor, and the remote migration history table was empty, so
-- there is no record proving either one actually landed. Rather than guess,
-- this migration makes both states true unconditionally. It is idempotent and
-- safe to run any number of times, on a database where the fixes already
-- applied and on one where they never did.
--
-- Supersedes, without replacing:
--   20260629120400_fix_notifications_insert_policy.sql
--   20260629120500_fix_payments_overpermissive_policy.sql

-- ── 1. payments: kill the over-permissive catch-all ───────────────
-- add_cashfree_columns.sql created "Service role manages all payments" as
-- FOR ALL USING (true) WITH CHECK (true) with no `TO service_role`, so it
-- applied to every role. Postgres ORs permissive policies together, so that
-- one policy handed every authenticated user SELECT/UPDATE/DELETE on every
-- other user's payment rows (amounts, Cashfree order and payment IDs).
-- The webhook uses the service-role key, which bypasses RLS anyway, so the
-- policy was redundant for its stated purpose. The per-payer policies remain.
DROP POLICY IF EXISTS "Service role manages all payments" ON payments;

-- ── 2. notifications: restore the missing INSERT policy ───────────
-- notifications had RLS enabled with SELECT/UPDATE policies but no INSERT
-- policy, so default-deny silently blocked every cross-user notification.
-- src/lib/notifications.ts swallows the error, so all 16 sendNotification()
-- call sites had been failing invisibly.
--
-- Postgres has no CREATE POLICY IF NOT EXISTS, so drop-then-create is the
-- only idempotent form.
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
CREATE POLICY "Authenticated users can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── 3. verify RLS is actually enabled on both ─────────────────────
-- Policies are inert if RLS itself is off. Cheap to assert, expensive to miss.
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ── PART B: 20260826120300_add_consultant_ratings_view ─────────────────
-- Aggregate rating per consultant, so clients can see a score before they book.
--
-- Reviews have been collected since add_reviews_table.sql and read back on the
-- consultant's own earnings screen, but no client-facing surface (creator
-- profile, featured cards, booking screen) showed a single star. A client was
-- being asked to commit money on portfolio images alone.
--
-- A view rather than denormalised columns on consultant_profiles: an average
-- that lives in two places drifts the first time a review is deleted or
-- edited, and there is no volume here that would justify that risk.
--
-- reviews.consultant_id is the consultant's auth user_id (profiles.id) since
-- fix_reviews_consultant_id_fk.sql, so this keys on user_id throughout.

CREATE OR REPLACE VIEW consultant_ratings
WITH (security_invoker = true) AS
  SELECT
    r.consultant_id                      AS consultant_user_id,
    ROUND(AVG(r.rating)::numeric, 2)     AS average_rating,
    COUNT(*)::int                        AS review_count
  FROM reviews r
  WHERE r.consultant_id IS NOT NULL
  GROUP BY r.consultant_id;

COMMENT ON VIEW consultant_ratings IS
  'Average rating and review count per consultant user_id. security_invoker so the caller''s RLS on reviews applies.';

-- reviews already carries a permissive "Anyone can read reviews" SELECT policy,
-- so an invoker-rights view is readable by both roles without widening anything.
GRANT SELECT ON consultant_ratings TO authenticated, anon;

-- ── PART C: record the three new migrations ─────────────────────────────────
INSERT INTO supabase_migrations.schema_migrations (version) VALUES
  ('20260826120100'), ('20260826120200'), ('20260826120300')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ── Verify (run separately, after COMMIT) ───────────────────────────────────
-- Expect 25 rows, newest last:
--   SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;
-- Expect the over-permissive payments policy to be GONE and the notifications
-- INSERT policy to be PRESENT:
--   SELECT tablename, policyname, cmd FROM pg_policies
--    WHERE tablename IN ('payments','notifications') ORDER BY tablename, policyname;
-- Expect the ratings view to answer (0 rows is fine, it means no reviews yet):
--   SELECT * FROM consultant_ratings;
