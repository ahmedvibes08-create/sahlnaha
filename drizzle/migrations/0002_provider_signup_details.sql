create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, email, phone, role, governorate, area, profession_id, language, bio, experience_years)
  values (
    new.id, coalesce(meta->>'full_name', ''), new.email, meta->>'phone',
    case when meta->>'role' = 'provider' then 'provider' else 'customer' end,
    meta->>'governorate', meta->>'area',
    (select p.id from public.professions p where p.id::text = meta->>'profession_id' limit 1),
    case when meta->>'language' = 'en' then 'en' else 'ar' end,
    nullif(left(meta->>'bio', 1000), ''),
    least(greatest(coalesce(case when meta->>'experience_years' ~ '^\d{1,2}$' then (meta->>'experience_years')::int end, 0), 0), 60)
  );
  return new;
end $$;