-- NXT website forms — run this once in the Supabase SQL Editor.
--
-- Use a Supabase project dedicated to website form submissions and nothing
-- else. Dashboard roles are project-wide: on the Free and Pro plans the lowest
-- role you can grant is Developer, which can read and edit everything in the
-- project. Keeping this project limited to form data is what makes it safe to
-- give HR or a manager access.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.job_applications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  full_name     text not null,
  mobile        text not null,
  email         text not null,
  cv_path       text not null,   -- object key inside the private `cvs` bucket
  cv_filename   text not null,   -- original name, sanitised
  cv_size_bytes integer not null,
  -- Kept for abuse investigation. Both are personal data: include them in your
  -- retention policy, or drop these two columns if you'd rather not hold them.
  source_ip     text,
  user_agent    text
);

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name  text not null,
  mobile     text not null,
  subject    text not null,
  message    text not null,
  source_ip  text,
  user_agent text
);

create index if not exists job_applications_created_at_idx
  on public.job_applications (created_at desc);
create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- RLS on with NO policies = no anon or authenticated access at all. The API
-- functions use the service_role key, which bypasses RLS. This is deliberate:
-- if the anon key ever leaks it still cannot read a single application.

alter table public.job_applications enable row level security;
alter table public.contact_messages enable row level security;

-- ---------------------------------------------------------------------------
-- Storage bucket for CVs
-- ---------------------------------------------------------------------------
-- `false` = private. Never make this public: a public bucket means anyone who
-- guesses or is shown a URL can download an applicant's CV.

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

-- No storage policies are created, so only service_role can read or write.
-- Download CVs through the dashboard (Storage → cvs) or via a signed URL.

-- ---------------------------------------------------------------------------
-- Admin accounts and roles
-- ---------------------------------------------------------------------------
-- Replaces the single shared ADMIN_PASSWORD with named accounts. That password
-- still works as a break-glass owner login, so there is no way to lock
-- everyone out by editing roles.
--
-- A role is a name plus the list of admin pages it may open. Page keys are
-- fixed in api/_lib/permissions.ts; anything else stored here is ignored.

create table if not exists public.admin_roles (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  -- Page keys: applications, messages, awards, users, roles
  pages      text[] not null default '{}',
  -- Marks the built-in Owner role, which keeps every page and cannot be
  -- deleted. Stops an edit from leaving nobody able to manage access.
  is_system  boolean not null default false
);

create unique index if not exists admin_roles_name_key
  on public.admin_roles (lower(name));

create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  email         text not null,
  full_name     text not null,
  -- scrypt, as "scrypt$N$r$p$<salt b64>$<hash b64>". Never a plaintext password.
  password_hash text not null,
  role_id       uuid not null references public.admin_roles (id) on delete restrict,
  is_active     boolean not null default true,
  last_login_at timestamptz
);

create unique index if not exists admin_users_email_key
  on public.admin_users (lower(email));

alter table public.admin_roles enable row level security;
alter table public.admin_users enable row level security;

-- The built-in Owner role. `pages` is overwritten on re-run so a newly added
-- page is granted here automatically.
insert into public.admin_roles (name, pages, is_system)
values ('Owner', array['applications', 'messages', 'awards', 'users', 'roles'], true)
on conflict (lower(name)) do update
  set pages = excluded.pages, is_system = true;

-- ---------------------------------------------------------------------------
-- Awards
-- ---------------------------------------------------------------------------
-- Managed in /admin only. Nothing on the public site reads this yet.

create table if not exists public.awards (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  title       text not null,
  description text not null default '',
  award_date  date,
  -- Object key in the private `awards` bucket; null when no image was attached.
  image_path  text
);

create index if not exists awards_award_date_idx
  on public.awards (award_date desc nulls last, created_at desc);

alter table public.awards enable row level security;

-- Private for the same reason as `cvs`: an award that has not been announced
-- yet should not be reachable by anyone who guesses the URL. When these start
-- appearing on the public site, either flip this to true or keep serving the
-- signed URLs the admin API already returns.
insert into storage.buckets (id, name, public)
values ('awards', 'awards', false)
on conflict (id) do nothing;
