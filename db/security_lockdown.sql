-- ============================================================================
--  Glamour's Touch — Security Lockdown   (Supabase project fmcltrjnuvuooarkvufn)
--  HOW TO APPLY:  Supabase Dashboard → SQL Editor → New query → paste all → Run.
--  Safe & idempotent (re-running does no harm).
--
--  WHY: before this, the public anon key (visible in the site's JS) could
--  DELETE and READ every product, order and customer record with no login.
--  After this: the storefront still reads products & places/tracks orders, but
--  only the logged-in admin can change data, and the orders table (customer
--  name/phone/address) is no longer readable by the public.
-- ============================================================================

-- 0) Who counts as an admin (real Supabase Auth users with these emails) ------
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = any (array[
    'glamourstouch26@gmail.com',
    'khondokartowsif171@gmail.com',
    'amirulislamredwan71@gmail.com'
  ]);
$$;

-- 1) PRODUCTS / CATEGORIES / BLOGS : public READ, admin-only WRITE ------------
alter table public.products   enable row level security;
alter table public.categories enable row level security;
alter table public.blogs      enable row level security;

drop policy if exists gt_products_read  on public.products;
drop policy if exists gt_products_admin on public.products;
create policy gt_products_read  on public.products for select using (true);
create policy gt_products_admin on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists gt_categories_read  on public.categories;
drop policy if exists gt_categories_admin on public.categories;
create policy gt_categories_read  on public.categories for select using (true);
create policy gt_categories_admin on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists gt_blogs_read  on public.blogs;
drop policy if exists gt_blogs_admin on public.blogs;
create policy gt_blogs_read  on public.blogs for select using (published = true or public.is_admin());
create policy gt_blogs_admin on public.blogs for all using (public.is_admin()) with check (public.is_admin());

-- 2) ORDERS : no public access; admin full; customers go through the 2 RPCs ---
alter table public.orders enable row level security;
drop policy if exists gt_orders_admin on public.orders;
create policy gt_orders_admin on public.orders for all using (public.is_admin()) with check (public.is_admin());

-- Checkout uses this. Runs with elevated rights so anon can place an order,
-- but cannot otherwise touch the table.
create or replace function public.place_order(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into public.orders (user_id, items, total, status, shipping_address, shipping_cost, created_at)
  values (
    nullif(p_payload->>'user_id','')::uuid,
    coalesce(p_payload->'items', '[]'::jsonb),
    coalesce((p_payload->>'total')::numeric, 0),
    coalesce(nullif(p_payload->>'status',''), 'Pending'),
    coalesce(p_payload->'shipping_address', '{}'::jsonb),
    coalesce((p_payload->>'shipping_cost')::numeric,
             (p_payload#>>'{shipping_address,shippingCost}')::numeric, 0),
    coalesce((p_payload->>'created_at')::timestamptz, now())
  )
  returning id into v_id;
  return jsonb_build_object('id', v_id);
end; $$;
revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- Order Tracking uses this. Returns ONLY the one matching order (by the last 8
-- characters of its id, optionally + phone) — no way to enumerate the table.
create or replace function public.track_order(p_ref text, p_phone text default null)
returns table (id uuid, status text, total numeric, created_at timestamptz, items jsonb, shipping_address jsonb)
language sql security definer set search_path = public as $$
  select o.id, o.status, o.total, o.created_at, o.items, o.shipping_address
  from public.orders o
  where upper(right(o.id::text, 8)) = upper(replace(replace(coalesce(p_ref,''),'#',''),' ',''))
    and (coalesce(p_phone,'') = '' or (o.shipping_address->>'phone') ilike '%'||p_phone||'%')
  limit 1;
$$;
revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- 3) CONTACT / NEWSLETTER : anyone may submit (insert), only admin may read ----
alter table public.contact_messages       enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists gt_contact_insert on public.contact_messages;
drop policy if exists gt_contact_admin  on public.contact_messages;
create policy gt_contact_insert on public.contact_messages for insert with check (true);
create policy gt_contact_admin  on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists gt_news_insert on public.newsletter_subscribers;
drop policy if exists gt_news_admin  on public.newsletter_subscribers;
create policy gt_news_insert on public.newsletter_subscribers for insert with check (true);
create policy gt_news_admin  on public.newsletter_subscribers for all using (public.is_admin()) with check (public.is_admin());

-- 4) PROFILES : each user manages only their own row; admin can read all -------
alter table public.profiles enable row level security;
drop policy if exists gt_profiles_self  on public.profiles;
drop policy if exists gt_profiles_admin on public.profiles;
create policy gt_profiles_self  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy gt_profiles_admin on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- 5) BOT_CONVERSATIONS : bot may log (insert); only admin may read ------------
alter table public.bot_conversations enable row level security;
drop policy if exists gt_botconv_insert on public.bot_conversations;
drop policy if exists gt_botconv_admin  on public.bot_conversations;
create policy gt_botconv_insert on public.bot_conversations for insert with check (true);
create policy gt_botconv_admin  on public.bot_conversations for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- ROLLBACK (only if something breaks and you need the old behaviour back):
--   alter table public.orders     disable row level security;
--   alter table public.products   disable row level security;
--   alter table public.categories disable row level security;
--   alter table public.blogs      disable row level security;
-- ============================================================================
