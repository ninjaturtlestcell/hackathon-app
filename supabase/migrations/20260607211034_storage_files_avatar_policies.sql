-- 'files' bucket: public + per-user (own-folder) write policies for avatars.

update storage.buckets set public = true where id = 'files';

-- Anyone can read (public bucket)
create policy "files_select_public"
  on storage.objects for select to public
  using (bucket_id = 'files');

-- Users can only write within their own folder: files/<uid>/...
create policy "files_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "files_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "files_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
