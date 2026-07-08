-- CareerSpark Phase 1 Supabase foundation schema.
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists pgcrypto;
create schema if not exists extensions;
create extension if not exists vector with schema extensions;

create table if not exists public.profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  email text,
  full_address text,
  city text,
  state text,
  location_label text,
  latitude double precision,
  longitude double precision,
  institution text,
  current_course text,
  branch text,
  current_year text,
  skills jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  applications jsonb not null default '[]'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  experience_items jsonb not null default '[]'::jsonb,
  resume_file_name text,
  resume_feedback jsonb not null default '{}'::jsonb,
  goal_note text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.roadmap (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_path text not null,
  phases jsonb not null default '[]'::jsonb,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'roadmap_user_id_key'
  ) then
    alter table public.roadmap add constraint roadmap_user_id_key unique (user_id);
  end if;
end $$;

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  provider text,
  status text not null default 'recommended',
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  ats_score integer check (ats_score between 0 and 100),
  feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_version_id uuid references public.resume_versions(id) on delete cascade,
  content text not null,
  embedding vector(384),
  created_at timestamptz not null default now()
);

create table if not exists public.skill_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  current_level integer not null default 0 check (current_level between 0 and 100),
  target_level integer not null default 100 check (target_level between 0 and 100),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'skill_progress_user_skill_key'
  ) then
    alter table public.skill_progress add constraint skill_progress_user_skill_key unique (user_id, skill_name);
  end if;
end $$;

create table if not exists public.saved_internships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  title text not null,
  company text,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  transcript text,
  feedback text,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  username text not null,
  stats jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.profile enable row level security;
alter table public.career_assessments enable row level security;
alter table public.roadmap enable row level security;
alter table public.certifications enable row level security;
alter table public.resume_versions enable row level security;
alter table public.document_chunks enable row level security;
alter table public.skill_progress enable row level security;
alter table public.saved_internships enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.profile_integrations enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.profile to authenticated;
grant select, insert, update, delete on table public.career_assessments to authenticated;
grant select, insert, update, delete on table public.roadmap to authenticated;
grant select, insert, update, delete on table public.certifications to authenticated;
grant select, insert, update, delete on table public.resume_versions to authenticated;
grant select, insert, update, delete on table public.document_chunks to authenticated;
grant select, insert, update, delete on table public.skill_progress to authenticated;
grant select, insert, update, delete on table public.saved_internships to authenticated;
grant select, insert, update, delete on table public.interview_sessions to authenticated;
grant select, insert, update, delete on table public.profile_integrations to authenticated;

create policy "Users can read their own profile"
on public.profile for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own profile"
on public.profile for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
on public.profile for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own profile"
on public.profile for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can manage their own assessments"
on public.career_assessments for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own roadmap"
on public.roadmap for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own certifications"
on public.certifications for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own resume versions"
on public.resume_versions for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own document chunks"
on public.document_chunks for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own skill progress"
on public.skill_progress for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own saved internships"
on public.saved_internships for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own interview sessions"
on public.interview_sessions for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own profile integrations"
on public.profile_integrations for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

do $$
begin
  alter publication supabase_realtime add table public.profile;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.roadmap;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.skill_progress;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.resume_versions;
exception
  when duplicate_object then null;
end $$;
