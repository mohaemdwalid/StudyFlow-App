-- ================================================================
-- StudyFlow Supabase Schema
-- Run this entire file in Supabase SQL Editor → New Query
-- ================================================================

-- ── Profiles (extends auth.users) ───────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  avatar_url      text,
  streak          integer not null default 0,
  total_focus_min integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ── Subjects ────────────────────────────────────────────────────
create table if not exists public.subjects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  color      text not null default '#6C63FF',
  teacher    text,
  created_at timestamptz not null default now()
);

-- ── Class Sessions ──────────────────────────────────────────────
create table if not exists public.class_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  day        integer not null, -- 0=Mon … 6=Sun
  start_time text not null,
  end_time   text not null,
  location   text,
  repeat     text not null default 'weekly'
);

-- ── Exams ───────────────────────────────────────────────────────
create table if not exists public.exams (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title      text not null,
  date       text not null,
  time       text,
  location   text,
  weight     numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ── Exam Topics ─────────────────────────────────────────────────
create table if not exists public.exam_topics (
  id        uuid primary key default gen_random_uuid(),
  exam_id   uuid not null references public.exams(id) on delete cascade,
  label     text not null,
  completed boolean not null default false
);

-- ── Tasks ───────────────────────────────────────────────────────
create table if not exists public.tasks (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  subject_id          uuid references public.subjects(id) on delete set null,
  title               text not null,
  type                text not null default 'homework', -- homework | study | project | exam
  status              text not null default 'pending',  -- pending | completed | overdue
  priority            text not null default 'medium',   -- low | medium | high
  due_date            text,
  due_time            text,
  estimated_minutes   integer,
  notes               text,
  created_at          timestamptz not null default now()
);

-- ── Subtasks ────────────────────────────────────────────────────
create table if not exists public.subtasks (
  id        uuid primary key default gen_random_uuid(),
  task_id   uuid not null references public.tasks(id) on delete cascade,
  title     text not null,
  completed boolean not null default false
);

-- ── Grade Items ─────────────────────────────────────────────────
create table if not exists public.grade_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  category   text not null default 'homework', -- homework | quiz | exam | project
  label      text not null,
  score      numeric not null,
  total      numeric not null,
  date       text,
  created_at timestamptz not null default now()
);

-- ── Focus Sessions ──────────────────────────────────────────────
create table if not exists public.focus_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  task_id    uuid references public.tasks(id) on delete set null,
  duration   integer not null,    -- minutes
  date       text not null,
  quality    integer,             -- 1-5
  completed  boolean not null default true,
  note       text,
  created_at timestamptz not null default now()
);

-- ── Plant Sessions (Garden) ─────────────────────────────────────
create table if not exists public.plant_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete set null,
  plant_type  text not null,
  plant_emoji text not null,
  duration    integer not null,
  status      text not null default 'growing', -- growing | grown | withered
  stage       text not null default 'seed',    -- seed | sprout | growing | flower
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  strict_mode boolean not null default false
);

-- ================================================================
-- Row Level Security — every user sees ONLY their own rows
-- ================================================================

alter table public.profiles       enable row level security;
alter table public.subjects        enable row level security;
alter table public.class_sessions  enable row level security;
alter table public.exams           enable row level security;
alter table public.exam_topics     enable row level security;
alter table public.tasks           enable row level security;
alter table public.subtasks        enable row level security;
alter table public.grade_items     enable row level security;
alter table public.focus_sessions  enable row level security;
alter table public.plant_sessions  enable row level security;

-- Profiles
create policy "own profile" on public.profiles for all using (id = auth.uid());

-- User-owned tables
do $$ 
declare t text;
begin
  foreach t in array array['subjects','class_sessions','exams','tasks','grade_items','focus_sessions','plant_sessions']
  loop
    execute format('create policy "own %I" on public.%I for all using (user_id = auth.uid())', t, t);
  end loop;
end $$;

-- Exam topics — via parent exam ownership
create policy "own exam_topics" on public.exam_topics for all using (
  exam_id in (select id from public.exams where user_id = auth.uid())
);

-- Subtasks — via parent task ownership
create policy "own subtasks" on public.subtasks for all using (
  task_id in (select id from public.tasks where user_id = auth.uid())
);

-- ================================================================
-- Auto-create profile on sign-up
-- ================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
