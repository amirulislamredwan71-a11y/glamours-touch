-- ============================================================================
--  Glamour's Touch — Security Lockdown FIX  (run AFTER security_lockdown.sql)
--  The first migration enabled RLS but the ORIGINAL developer had leftover
--  permissive "allow all" policies on some tables — so the anon key could still
--  READ orders (customer PII). This drops EVERY policy on the 8 app tables and
--  recreates ONLY the intended ones, guaranteeing a clean, correct state.
--  Safe & idempotent. Run in Supabase → SQL Editor → paste all → Run.
-- ============================================================================

-- 1) Nuke every existing policy on the app tables (removes old "allow all" ones)
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('products','categories','blogs','orders','profiles',
                        'contact_messages','newsletter_subscribers','bot_conversations')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 2) Admin identity helper (idempotent)
create or replace function public.is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = any (array[
    'glamourstouch26@gmail.com',
    'khondokartowsif171@gmail.com',
    'amirulislamredwan71@gmail.com'
  ]);
$$;

-- 3) Ensure RLS is ON everywhere
alter table public.products               enable row level security;
alter table public.categories             enable row level security;
alter table public.blogs                  enable row level security;
alter table public.orders                 enable row level security;
alter table public.profiles               enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.bot_conversations      enable row level security;

-- 4) Recreate ONLY the intended policies
create policy gt_products_read    on public.products   for select using (true);
create policy gt_products_admin   on public.products   for all using (public.is_admin()) with check (public.is_admin());

create policy gt_categories_read  on public.categories for select using (true);
create policy gt_categories_admin on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy gt_blogs_read       on public.blogs      for select using (published = true or public.is_admin());
create policy gt_blogs_admin      on public.blogs      for all using (public.is_admin()) with check (public.is_admin());

-- orders: NO anon access at all (checkout/tracking go through the RPCs); admin full
create policy gt_orders_admin     on public.orders     for all using (public.is_admin()) with check (public.is_admin());

create policy gt_profiles_self    on public.profiles   for all using (auth.uid() = id) with check (auth.uid() = id);
create policy gt_profiles_admin   on public.profiles   for all using (public.is_admin()) with check (public.is_admin());

create policy gt_contact_insert   on public.contact_messages for insert with check (true);
create policy gt_contact_admin    on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

create policy gt_news_insert      on public.newsletter_subscribers for insert with check (true);
create policy gt_news_admin       on public.newsletter_subscribers for all using (public.is_admin()) with check (public.is_admin());

create policy gt_botconv_insert   on public.bot_conversations for insert with check (true);
create policy gt_botconv_admin    on public.bot_conversations for all using (public.is_admin()) with check (public.is_admin());

-- 5) Show the final policy set (so we can confirm it's clean)
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
