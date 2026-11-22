-- File bytes live on R2; Supabase owns metadata and attachment lifetimes.
create table public.photo_assets (
  id uuid primary key,
  key text not null unique check (key ~ '^(artists|works)/[0-9a-f-]+\.(jpg|png|webp)$'),
  url text not null,
  owner_id uuid references auth.users(id) on delete set null,
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  size integer not null check (size between 1 and 10485760),
  status text not null default 'pending' check (status in ('pending', 'publishing', 'ready')),
  created_at timestamptz not null default now()
);
create table public.photo_deletions (
  key text primary key,
  created_at timestamptz not null default now()
);
alter table public.photo_assets enable row level security;
alter table public.photo_deletions enable row level security;
revoke all on public.photo_assets, public.photo_deletions from anon, authenticated;
grant all on public.photo_assets, public.photo_deletions to service_role;

alter table public.artists add column if not exists image_key text references public.photo_assets(key);
alter table public.works add column if not exists image_key text references public.photo_assets(key);
create index on public.artists(image_key) where image_key is not null;
create index on public.works(image_key) where image_key is not null;
create index on public.photo_assets(created_at);

-- Always derive managed URLs from verified metadata, not from the request body.
create function public.validate_photo_attachment() returns trigger
language plpgsql security definer set search_path = '' as $$
declare asset public.photo_assets;
begin
  if new.image_key is not null then
    select * into asset from public.photo_assets where key = new.image_key for share;
    if not found or asset.status <> 'ready' then
      raise exception 'Foto non pronta o inesistente';
    end if;
    new.url_image := asset.url;
  end if;
  return new;
end;
$$;
create trigger artist_photo_validate before insert or update of image_key, url_image on public.artists
  for each row execute function public.validate_photo_attachment();
create trigger work_photo_validate before insert or update of image_key, url_image on public.works
  for each row execute function public.validate_photo_attachment();

-- Queue storage cleanup in the same transaction as the record change.
create function public.queue_photo_deletion() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    if old.image_key is not null then
      insert into public.photo_deletions(key) values (old.image_key) on conflict do nothing;
    end if;
    return old;
  end if;
  if old.image_key is not null and old.image_key is distinct from new.image_key then
    insert into public.photo_deletions(key) values (old.image_key) on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger artist_photo_cleanup after update of image_key or delete on public.artists
  for each row execute function public.queue_photo_deletion();
create trigger work_photo_cleanup after update of image_key or delete on public.works
  for each row execute function public.queue_photo_deletion();

create function public.queue_asset_deletion() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.photo_deletions(key) values (old.key), ('_uploads/' || old.id::text) on conflict do nothing;
  return old;
end;
$$;
create trigger photo_asset_cleanup after delete on public.photo_assets
  for each row execute function public.queue_asset_deletion();

revoke all on function public.validate_photo_attachment(), public.queue_photo_deletion(), public.queue_asset_deletion() from public;

-- Extend the existing atomic artist + roles creation RPC with photo metadata.
drop function public.create_artist_with_roles(text, text, bigint, text, uuid[]);
create function public.create_artist_with_roles(
  p_name text, p_description text, p_genre_id bigint, p_url_image text,
  p_role_ids uuid[], p_image_key text default null
) returns jsonb language plpgsql set search_path = '' as $$
declare artist_row public.artists;
begin
  insert into public.artists(name, description, genre_id, url_image, image_key)
    values (p_name, p_description, p_genre_id, p_url_image, p_image_key) returning * into artist_row;
  insert into public.artist_job_roles(artist_id, role_id)
    select distinct artist_row.id, role_id from unnest(p_role_ids) as roles(role_id);
  return to_jsonb(artist_row);
end;
$$;
revoke all on function public.create_artist_with_roles(text, text, bigint, text, uuid[], text) from public, anon, authenticated;
grant execute on function public.create_artist_with_roles(text, text, bigint, text, uuid[], text) to service_role;

-- Do not let old attached photos starve the abandoned-draft batch.
create function public.prune_photo_drafts() returns void
language plpgsql set search_path = '' as $$
declare candidate uuid;
begin
  for candidate in
    select p.id from public.photo_assets p
    where p.created_at < now() - interval '24 hours'
      and not exists (select 1 from public.artists a where a.image_key = p.key)
      and not exists (select 1 from public.works w where w.image_key = p.key)
    order by p.created_at limit 25
  loop
    begin
      delete from public.photo_assets where id = candidate;
    exception when foreign_key_violation then
      -- A concurrent save attached the photo after the candidate query.
      null;
    end;
  end loop;
end;
$$;
revoke all on function public.prune_photo_drafts() from public, anon, authenticated;
grant execute on function public.prune_photo_drafts() to service_role;
