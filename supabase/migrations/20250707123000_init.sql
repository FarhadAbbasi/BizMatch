-- Migration: initial schema for BizMatch

-- 1. business_profiles table
create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_uid uuid references auth.users(id) on delete cascade,
  name text not null,
  industry text not null,
  location text not null,
  services text[] not null default '{}',
  tags text[] not null default '{}',
  linkedin_url text,
  logo_url text,
  view_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- index for tag search
create index if not exists business_profiles_tags_gin on public.business_profiles using gin (tags);

-- RLS policies
alter table public.business_profiles enable row level security;
-- Owners can select/update/delete their own profiles
create policy "Business owner access" on public.business_profiles for all
  using (owner_uid = auth.uid()) with check (owner_uid = auth.uid());

-- 2. swipes table
create type swipe_direction as enum ('left','right');

create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_uid uuid references auth.users(id) on delete cascade,
  target_business_id uuid references public.business_profiles(id) on delete cascade,
  direction swipe_direction not null,
  created_at timestamptz not null default now()
);

-- composite index to speed reciprocal lookup
create index if not exists swipes_swiper_target_idx on public.swipes (swiper_uid, target_business_id);

alter table public.swipes enable row level security;
-- Users can insert/select their own swipes
create policy "Swipe owner access" on public.swipes for select using (swiper_uid = auth.uid());
create policy "Insert own swipes" on public.swipes for insert with check (swiper_uid = auth.uid());

-- function to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

create trigger business_profiles_set_updated_at before update on public.business_profiles
for each row execute procedure public.set_updated_at(); 