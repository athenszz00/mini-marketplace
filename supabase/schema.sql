create extension if not exists pgcrypto;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  description text not null check (char_length(description) between 1 and 2000),
  price numeric(10, 2) not null check (price > 0),
  seller_email text not null check (char_length(seller_email) <= 254),
  category text not null check (category in ('Furniture', 'Electronics', 'Home & Garden', 'Clothing', 'Sports', 'Other')),
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Anyone can view listings"
  on public.listings for select
  using (true);

create policy "Anyone can create listings"
  on public.listings for insert
  with check (true);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_name text not null check (char_length(buyer_name) between 1 and 80),
  buyer_email text not null check (char_length(buyer_email) <= 254),
  message text not null check (char_length(message) between 2 and 2000),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Anyone can send a message"
  on public.messages for insert
  with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-photos',
  'marketplace-photos',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

create policy "Anyone can view listing photos"
  on storage.objects for select
  using (bucket_id = 'marketplace-photos');

create policy "Anyone can upload listing photos"
  on storage.objects for insert
  with check (bucket_id = 'marketplace-photos');
