create function public.create_artist_with_roles(
  p_name text,
  p_description text,
  p_genre_id bigint,
  p_url_image text,
  p_role_ids uuid[]
)
returns jsonb language plpgsql set search_path = '' as $$
declare
  artist_row public.artists;
begin
  insert into public.artists(name, description, genre_id, url_image)
    values (p_name, p_description, p_genre_id, p_url_image)
    returning * into artist_row;

  insert into public.artist_job_roles(artist_id, role_id)
    select distinct artist_row.id, role_id from unnest(p_role_ids) as roles(role_id);

  return to_jsonb(artist_row);
end;
$$;

revoke all on function public.create_artist_with_roles(text, text, bigint, text, uuid[]) from public, anon, authenticated;
grant execute on function public.create_artist_with_roles(text, text, bigint, text, uuid[]) to service_role;
