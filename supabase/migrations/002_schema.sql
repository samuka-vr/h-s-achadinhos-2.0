begin;
create type public.app_role as enum ('owner','admin','editor','analyst');
create type public.product_status as enum ('draft','published','archived');
create type public.media_type as enum ('image','video');
create type public.import_status as enum ('pending','running','completed','failed');

create table public.site_settings (
  id smallint primary key default 1 check (id=1),
  brand_name text not null default 'H&S Achadinhos',
  tagline text not null default 'Descobertas que valem a pena.',
  description text not null default 'Curadoria de produtos encontrados nas redes sociais.',
  logo_url text,
  social_links jsonb not null default '{}'::jsonb,
  homepage jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  indexing_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique,
  description text,
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique check (public_code ~ '^HS-[0-9A-HJ-NP-Z]{5}$'),
  name text not null check (char_length(name) between 3 and 160),
  slug text not null unique,
  short_description text,
  description text,
  price_text text,
  external_url text not null check (external_url ~ '^https?://'),
  affiliate_network text,
  category_id uuid references public.categories(id) on delete set null,
  status public.product_status not null default 'draft',
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  cover_url text,
  video_url text,
  search_document tsvector not null default ''::tsvector,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  type public.media_type not null,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  target_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analytics_sessions (
  id uuid primary key default gen_random_uuid(),
  anonymous_id uuid not null unique,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  landing_path text,
  last_path text,
  referrer_host text,
  device_type text not null default 'unknown' check (device_type in ('mobile','tablet','desktop','unknown'))
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.analytics_sessions(id) on delete cascade,
  event_type text not null check (event_type in ('page_view','search','category_view','outbound_click')),
  product_id uuid references public.products(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  path text,
  target_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  source text not null,
  status public.import_status not null default 'pending',
  item_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index products_search_idx on public.products using gin(search_document);
create index products_name_trgm_idx on public.products using gin(name gin_trgm_ops);
create index products_status_published_idx on public.products(status,published_at desc) where deleted_at is null;
create index products_category_idx on public.products(category_id,status) where deleted_at is null;
create index analytics_events_created_idx on public.analytics_events(created_at desc);
create index analytics_events_product_idx on public.analytics_events(product_id,event_type,created_at desc);
create index analytics_sessions_last_seen_idx on public.analytics_sessions(last_seen_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create or replace function public.set_product_search_document() returns trigger language plpgsql as $$
begin
  new.search_document :=
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.name,''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.short_description,''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.description,''))), 'C');
  return new;
end $$;
create trigger set_site_settings_updated before update on public.site_settings for each row execute function public.set_updated_at();
create trigger set_categories_updated before update on public.categories for each row execute function public.set_updated_at();
create trigger set_products_updated before update on public.products for each row execute function public.set_updated_at();
create trigger set_products_search before insert or update of name,short_description,description on public.products for each row execute function public.set_product_search_document();
create trigger set_banners_updated before update on public.banners for each row execute function public.set_updated_at();
create trigger set_user_roles_updated before update on public.user_roles for each row execute function public.set_updated_at();
commit;
