-- Audit Section 13 Issue 12 (D4 §5.4) — version-control the remaining private
-- storage buckets and their RLS so they are not relied on as manually-created
-- dashboard state. `kyc-documents` (00002) and `job-documents` (00003) are
-- already migrated; this adds `job-photos` and `profile-assets`.
--
-- Both are private. Objects are namespaced by owner: the first path segment is
-- the owner's auth.uid(), so the owner-path policies below isolate every user
-- to their own folder — matching the cleanup paths in the delete-account and
-- delete-team-member Edge Functions (`${userId}/...`).

-- ── job-photos: Rex session jobsite photos ──────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS job_photos_owner_read ON storage.objects;
CREATE POLICY job_photos_owner_read ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'job-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS job_photos_owner_write ON storage.objects;
CREATE POLICY job_photos_owner_write ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'job-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS job_photos_owner_delete ON storage.objects;
CREATE POLICY job_photos_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'job-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ── profile-assets: profile/company imagery ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-assets', 'profile-assets', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS profile_assets_owner_read ON storage.objects;
CREATE POLICY profile_assets_owner_read ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS profile_assets_owner_write ON storage.objects;
CREATE POLICY profile_assets_owner_write ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS profile_assets_owner_update ON storage.objects;
CREATE POLICY profile_assets_owner_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS profile_assets_owner_delete ON storage.objects;
CREATE POLICY profile_assets_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
