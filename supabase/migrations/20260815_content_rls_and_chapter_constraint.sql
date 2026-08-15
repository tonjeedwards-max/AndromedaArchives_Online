-- Andromeda Archives content bridge
-- Keeps the public reader read-only and gives admin users write access.

create unique index if not exists chapters_story_chapter_unique
  on public.chapters(story_id, chapter_number);

alter table public.stories enable row level security;
alter table public.chapters enable row level security;
alter table public.blogs enable row level security;

drop policy if exists "Public can read visible stories" on public.stories;
create policy "Public can read visible stories"
  on public.stories for select
  using (hidden = false);

drop policy if exists "Admins can manage stories" on public.stories;
create policy "Admins can manage stories"
  on public.stories for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public can read published chapters" on public.chapters;
create policy "Public can read published chapters"
  on public.chapters for select
  using (published = true);

drop policy if exists "Admins can manage chapters" on public.chapters;
create policy "Admins can manage chapters"
  on public.chapters for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public can read published blogs" on public.blogs;
create policy "Public can read published blogs"
  on public.blogs for select
  using (published = true);

drop policy if exists "Admins can manage blogs" on public.blogs;
create policy "Admins can manage blogs"
  on public.blogs for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
