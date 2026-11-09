create table public.job_requests (
  id uuid primary key default gen_random_uuid(),
  company text not null check (char_length(company) between 1 and 160),
  email text not null check (char_length(email) between 3 and 254),
  title text not null check (char_length(title) between 1 and 160),
  location text not null check (char_length(location) between 1 and 160),
  description text not null check (char_length(description) between 1 and 10000),
  status text not null default 'pending' check (status in ('pending', 'published', 'closed')),
  created_at timestamptz not null default now()
);
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_requests(id) on delete set null,
  job_title text not null,
  company text not null,
  name text not null check (char_length(name) between 1 and 160),
  email text not null check (char_length(email) between 3 and 254),
  message text not null default '' check (char_length(message) <= 10000),
  created_at timestamptz not null default now(),
  unique (job_id, email)
);
create index job_requests_status_idx on public.job_requests(status, created_at desc);
create index job_applications_job_idx on public.job_applications(job_id);
alter table public.job_requests enable row level security;
alter table public.job_applications enable row level security;
revoke all on public.job_requests, public.job_applications from anon, authenticated;
grant select on public.job_requests, public.job_applications to authenticated;
create policy admin_read_jobs on public.job_requests for select to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy admin_read_applications on public.job_applications for select to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');
-- Lock the listing so a concurrent closure cannot accept a late application.
create function public.apply_to_job(p_job_id uuid, p_name text, p_email text, p_message text)
returns void language plpgsql security definer set search_path = '' as $$
declare job public.job_requests;
begin
  select * into job from public.job_requests where id = p_job_id for update;
  if not found or job.status <> 'published' then
    raise exception 'Position unavailable' using errcode = 'P0001';
  end if;
  insert into public.job_applications(job_id, job_title, company, name, email, message)
  values (job.id, job.title, job.company, p_name, lower(p_email), p_message);
end;
$$;
revoke all on function public.apply_to_job(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.apply_to_job(uuid, text, text, text) to service_role;
