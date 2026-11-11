create table public.job_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 160)
);

-- Canonical names are registered here too, so aliases and names share one namespace.
create table public.job_role_aliases (
  role_id uuid not null references public.job_roles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  normalized_name text generated always as (
    lower(btrim(regexp_replace(name, '[[:space:]]+', ' ', 'g')))
  ) stored primary key
);

create table public.artist_job_roles (
  artist_id bigint not null references public.artists(id) on delete cascade,
  role_id uuid not null references public.job_roles(id),
  primary key (artist_id, role_id)
);

alter table public.job_requests add column role_id uuid references public.job_roles(id);
alter table public.job_applications add column role_id uuid references public.job_roles(id);

alter table public.job_roles enable row level security;
alter table public.job_role_aliases enable row level security;
alter table public.artist_job_roles enable row level security;
revoke all on public.job_roles, public.job_role_aliases, public.artist_job_roles from anon, authenticated;
grant select on public.job_roles, public.job_role_aliases, public.artist_job_roles to authenticated;
grant select, insert, update, delete on public.job_roles, public.job_role_aliases, public.artist_job_roles to service_role;

create policy admin_read_roles on public.job_roles for select to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy admin_read_role_aliases on public.job_role_aliases for select to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy admin_read_artist_roles on public.artist_job_roles for select to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create function public.create_job_role(p_name text)
returns jsonb language plpgsql set search_path = '' as $$
declare role_row public.job_roles;
begin
  insert into public.job_roles(name) values (p_name) returning * into role_row;
  insert into public.job_role_aliases(role_id, name) values (role_row.id, p_name);
  return to_jsonb(role_row);
end;
$$;

create function public.set_artist_job_roles(p_artist_id bigint, p_role_ids uuid[])
returns void language plpgsql set search_path = '' as $$
begin
  perform 1 from public.artists where id = p_artist_id for update;
  if not found then
    raise exception 'Artist unavailable' using errcode = 'P0001';
  end if;
  delete from public.artist_job_roles where artist_id = p_artist_id;
  insert into public.artist_job_roles(artist_id, role_id)
    select distinct p_artist_id, role_id from unnest(p_role_ids) as roles(role_id);
end;
$$;

revoke all on function public.create_job_role(text), public.set_artist_job_roles(bigint, uuid[]) from public, anon, authenticated;
grant execute on function public.create_job_role(text), public.set_artist_job_roles(bigint, uuid[]) to service_role;

create function public.match_job_role() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.role_id is null and new.status = 'pending' then
    select role_id into new.role_id
    from public.job_role_aliases
    where normalized_name = lower(btrim(regexp_replace(new.title, '[[:space:]]+', ' ', 'g')));
  end if;
  return new;
end;
$$;
create trigger match_job_role before insert on public.job_requests
for each row execute function public.match_job_role();

create or replace function public.apply_to_job(p_job_id uuid, p_name text, p_email text, p_message text)
returns void language plpgsql security definer set search_path = '' as $$
declare job public.job_requests;
begin
  select * into job from public.job_requests where id = p_job_id for update;
  if not found or job.status <> 'published' then
    raise exception 'Position unavailable' using errcode = 'P0001';
  end if;
  insert into public.job_applications(job_id, job_title, company, name, email, message, role_id)
  values (job.id, job.title, job.company, p_name, lower(p_email), p_message, job.role_id);
end;
$$;

-- Classify earlier applications once, while preserving roles already recorded.
create function public.classify_unassigned_applications() returns trigger
language plpgsql set search_path = '' as $$
begin
  update public.job_applications set role_id = new.role_id
    where job_id = new.id and role_id is null;
  return new;
end;
$$;
create trigger classify_unassigned_applications after update of role_id on public.job_requests
for each row when (new.role_id is not null and old.role_id is distinct from new.role_id)
execute function public.classify_unassigned_applications();
