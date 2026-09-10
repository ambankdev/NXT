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
