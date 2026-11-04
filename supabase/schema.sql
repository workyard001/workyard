-- WORKYARD schema. Run in Supabase SQL Editor as project owner.
create extension if not exists pgcrypto;

create type public.user_role as enum ('client','worker','admin');
create type public.verification_state as enum ('unverified','pending','verified','rejected');
create type public.job_state as enum ('open','assigned','done');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  phone text not null unique,
  role public.user_role not null default 'client',
  lga text not null,
  verification_status public.verification_state not null default 'unverified',
  nin_url text,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.workers (
  user_id uuid primary key references public.users(id) on delete cascade,
  skill text not null,
  price_range text,
  bio text check (char_length(bio) <= 1000),
  rating_avg numeric(3,2) not null default 0 check (rating_avg between 0 and 5),
  is_verified boolean not null default false,
  lga text not null,
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  skill_needed text not null,
  lga text not null,
  description text not null check (char_length(description) between 10 and 3000),
  budget numeric(12,2) check (budget is null or budget >= 0),
  status public.job_state not null default 'open',
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 150),
  price numeric(12,2) not null check (price >= 0),
  lga text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.users(id) on delete cascade,
  client_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  constraint reviews_no_self_review check (worker_id <> client_id),
  unique (worker_id, client_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  reported_user_id uuid not null references public.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 1000),
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_user_id)
);

-- Admin status is assigned only by trusted SQL/service role, never by client input.
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admins where user_id = auth.uid()); $$;

alter table public.users enable row level security;
alter table public.workers enable row level security;
alter table public.jobs enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.admins enable row level security;

-- Public user directory exposes only verified worker accounts. Owners can read their own row.
-- Never expose phone numbers through public users reads.
create policy "users owner or admin read"
on public.users for select using (id = auth.uid() or public.is_admin());

create or replace function public.is_verified_worker(uid uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.users u where u.id=uid and u.role='worker'
  and u.verification_status='verified' and not u.is_banned); $$;

-- Safe public directory: deliberately excludes phone and identity-document URL.
create or replace view public.public_workers as
select w.user_id, u.name, w.skill, w.price_range, w.bio, w.rating_avg, w.is_verified, w.lga
from public.workers w join public.users u on u.id=w.user_id
where w.is_verified and u.verification_status='verified' and not u.is_banned;
create policy "users insert self" on public.users for insert
with check (id = auth.uid() and role in ('client','worker') and not is_banned);
create policy "users update self limited" on public.users for update
using (id = auth.uid() or public.is_admin())
with check ((id = auth.uid() and role in ('client','worker')) or public.is_admin());
-- Prevent self-updating sensitive fields through a trigger.
create or replace function public.protect_user_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.verification_status := old.verification_status;
    new.nin_url := old.nin_url;
    new.is_banned := old.is_banned;
  end if;
  return new;
end; $$;
create trigger users_protect_fields before update on public.users
for each row execute function public.protect_user_fields();

create policy "workers public verified only"
on public.workers for select using (
  (is_verified and public.is_verified_worker(user_id))
  or user_id = auth.uid() or public.is_admin()
);
create policy "workers owner insert" on public.workers for insert
with check (user_id = auth.uid() and exists(select 1 from public.users u where u.id=auth.uid() and u.role='worker'));
create policy "workers owner update" on public.workers for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "jobs visible in own LGA or owner"
on public.jobs for select using (
  client_id = auth.uid() or (status='open' and lga = (select u.lga from public.users u where u.id=auth.uid())) or public.is_admin()
);
create policy "clients create jobs" on public.jobs for insert
with check (client_id = auth.uid() and exists(select 1 from public.users u where u.id=auth.uid() and u.role='client' and not u.is_banned));
create policy "job owner update" on public.jobs for update
using (client_id = auth.uid() or public.is_admin())
with check (client_id = auth.uid() or public.is_admin());

create policy "approved products public" on public.products for select
using (is_approved or seller_id=auth.uid() or public.is_admin());
create policy "seller insert product" on public.products for insert
with check (seller_id=auth.uid() and exists(select 1 from public.users u where u.id=auth.uid() and not u.is_banned));
create policy "seller update product" on public.products for update
using (seller_id=auth.uid() or public.is_admin())
with check (seller_id=auth.uid() or public.is_admin());

create policy "reviews public read" on public.reviews for select using (true);
create policy "client create review" on public.reviews for insert
with check (client_id=auth.uid() and exists(select 1 from public.jobs j where j.client_id=auth.uid() and j.status='done'));
create policy "review admin update" on public.reviews for update using (public.is_admin()) with check (public.is_admin());

create policy "reporter or admin read reports" on public.reports for select
using (reporter_id=auth.uid() or public.is_admin());
create policy "authenticated users submit reports" on public.reports for insert
with check (reporter_id=auth.uid() and reporter_id <> reported_user_id);
create policy "admin manage reports" on public.reports for all
using (public.is_admin()) with check (public.is_admin());

create policy "admins read admins table" on public.admins for select using (public.is_admin());

-- Helpful indexes
create index workers_lga_skill_idx on public.workers(lga, skill);
create index jobs_lga_status_idx on public.jobs(lga, status, created_at desc);
create index products_lga_approved_idx on public.products(lga, is_approved);
create index reports_created_idx on public.reports(created_at desc);

-- Storage: private identity documents. Uploads are limited to 2 MB by bucket config.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('identity-documents','identity-documents',false,2097152,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public=false,file_size_limit=2097152;
create policy "worker upload own identity file" on storage.objects for insert
with check (bucket_id='identity-documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "owner or admin read identity file" on storage.objects for select
using (bucket_id='identity-documents' and (auth.uid()::text=(storage.foldername(name))[1] or public.is_admin()));
create policy "owner replace own identity file" on storage.objects for update
using (bucket_id='identity-documents' and auth.uid()::text=(storage.foldername(name))[1])
with check (bucket_id='identity-documents' and auth.uid()::text=(storage.foldername(name))[1]);

-- Admin moderation operations should run through trusted Edge Functions/service role.
-- Rate limiting job creation: use Edge Function with per-user/IP limits before inserting.
