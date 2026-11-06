create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.request_status as enum ('pending', 'accepted', 'rejected', 'completed', 'cancelled');
create type public.report_status as enum ('pending', 'reviewing', 'resolved', 'rejected');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  icon text not null default 'Sparkles',
  description_ar text,
  description_en text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;

create table public.professions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  icon text,
  created_at timestamptz not null default now()
);
grant select on public.professions to anon, authenticated;
grant insert, update, delete on public.professions to authenticated;
grant all on public.professions to service_role;
alter table public.professions enable row level security;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('provider', 'customer')),
  governorate text,
  area text,
  bio text,
  bio_en text,
  experience_years int not null default 0,
  profession_id uuid references public.professions(id) on delete set null,
  is_available boolean not null default true,
  is_verified boolean not null default false,
  is_suspended boolean not null default false,
  language text not null default 'ar',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create table public.provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  profession_id uuid references public.professions(id) on delete set null,
  title_ar text not null,
  title_en text not null default '',
  description_ar text,
  description_en text,
  price numeric(10,2) not null default 0 check (price >= 0),
  duration text,
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.provider_services to anon;
grant select, insert, update, delete on public.provider_services to authenticated;
grant all on public.provider_services to service_role;
alter table public.provider_services enable row level security;

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  day smallint not null check (day between 0 and 6),
  start_time time not null default '09:00',
  end_time time not null default '17:00',
  is_available boolean not null default true,
  unique (provider_id, day)
);
grant select on public.availability to anon;
grant select, insert, update, delete on public.availability to authenticated;
grant all on public.availability to service_role;
alter table public.availability enable row level security;

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid references public.provider_services(id) on delete set null,
  description text not null,
  location text,
  requested_date date,
  requested_time time,
  budget numeric(10,2),
  notes text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.service_requests to authenticated;
grant all on public.service_requests to service_role;
alter table public.service_requests enable row level security;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.service_requests(id) on delete set null,
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index messages_pair_idx on public.messages (sender_id, receiver_id, created_at);
grant select, insert, update, delete on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, provider_id)
);
grant select, insert, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title_ar text not null,
  title_en text not null,
  message_ar text,
  message_en text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('provider', 'service', 'review', 'message')),
  target_id uuid not null,
  reason text not null,
  description text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;

create policy "Public read categories" on public.categories for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Public read professions" on public.professions for select to anon, authenticated using (true);
create policy "Admins manage professions" on public.professions for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Public read providers" on public.profiles for select to anon
  using (role = 'provider' and not is_suspended);
create policy "Authenticated read profiles" on public.profiles for select to authenticated
  using (
    (role = 'provider' and not is_suspended)
    or id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.service_requests r where (r.customer_id = auth.uid() and r.provider_id = profiles.id) or (r.provider_id = auth.uid() and r.customer_id = profiles.id))
    or exists (select 1 from public.messages m where (m.sender_id = auth.uid() and m.receiver_id = profiles.id) or (m.receiver_id = auth.uid() and m.sender_id = profiles.id))
  );
create policy "Users update own profile" on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins delete profiles" on public.profiles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Public read services" on public.provider_services for select to anon, authenticated using (true);
create policy "Providers insert own services" on public.provider_services for insert to authenticated
  with check (provider_id = auth.uid());
create policy "Providers update own services" on public.provider_services for update to authenticated
  using (provider_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (provider_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Providers delete own services" on public.provider_services for delete to authenticated
  using (provider_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Public read availability" on public.availability for select to anon, authenticated using (true);
create policy "Providers manage availability" on public.availability for all to authenticated
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());

create policy "Participants read requests" on public.service_requests for select to authenticated
  using (customer_id = auth.uid() or provider_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Customers create requests" on public.service_requests for insert to authenticated
  with check (customer_id = auth.uid() and status = 'pending' and provider_id <> auth.uid());
create policy "Participants update requests" on public.service_requests for update to authenticated
  using (customer_id = auth.uid() or provider_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (customer_id = auth.uid() or provider_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins delete requests" on public.service_requests for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Participants read messages" on public.messages for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "Users send messages" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and receiver_id <> auth.uid());
create policy "Receivers mark read" on public.messages for update to authenticated
  using (receiver_id = auth.uid()) with check (receiver_id = auth.uid());

create policy "Public read reviews" on public.reviews for select to anon, authenticated using (true);
create policy "Eligible customers review" on public.reviews for insert to authenticated
  with check (
    customer_id = auth.uid()
    and exists (select 1 from public.service_requests r where r.id = request_id and r.customer_id = auth.uid() and r.provider_id = reviews.provider_id and r.status = 'completed')
  );
create policy "Admins delete reviews" on public.reviews for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Customers read favorites" on public.favorites for select to authenticated using (customer_id = auth.uid());
create policy "Customers add favorites" on public.favorites for insert to authenticated with check (customer_id = auth.uid());
create policy "Customers remove favorites" on public.favorites for delete to authenticated using (customer_id = auth.uid());

create policy "Users read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users delete own notifications" on public.notifications for delete to authenticated using (user_id = auth.uid());

create policy "Users create reports" on public.reports for insert to authenticated with check (reporter_id = auth.uid() and status = 'pending');
create policy "Read own or admin reports" on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins update reports" on public.reports for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete reports" on public.reports for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger services_touch before update on public.provider_services for each row execute function public.touch_updated_at();

create or replace function public.protect_profile_fields() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.has_role(auth.uid(), 'admin') then
    new.is_verified = old.is_verified;
    new.is_suspended = old.is_suspended;
    new.email = old.email;
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles for each row execute function public.protect_profile_fields();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, email, phone, role, governorate, area, profession_id, language)
  values (
    new.id,
    coalesce(meta->>'full_name', ''),
    new.email,
    meta->>'phone',
    case when meta->>'role' = 'provider' then 'provider' else 'customer' end,
    meta->>'governorate',
    meta->>'area',
    (select p.id from public.professions p where p.id::text = meta->>'profession_id' limit 1),
    case when meta->>'language' = 'en' then 'en' else 'ar' end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.validate_request_update() returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is null or public.has_role(auth.uid(), 'admin') then
    new.updated_at = now(); return new;
  end if;
  if new.customer_id <> old.customer_id or new.provider_id <> old.provider_id then
    raise exception 'not_allowed';
  end if;
  if new.status <> old.status then
    if auth.uid() = old.provider_id then
      if not ((old.status = 'pending' and new.status in ('accepted', 'rejected'))
           or (old.status = 'accepted' and new.status in ('completed', 'cancelled'))) then
        raise exception 'invalid_transition';
      end if;
    elsif auth.uid() = old.customer_id then
      if not (old.status in ('pending', 'accepted') and new.status = 'cancelled') then
        raise exception 'invalid_transition';
      end if;
    else
      raise exception 'not_allowed';
    end if;
  end if;
  new.updated_at = now();
  return new;
end $$;
create trigger requests_validate before update on public.service_requests for each row execute function public.validate_request_update();

create or replace function public.notify_request_events() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, type, title_ar, title_en, message_ar, message_en, link)
    values (new.provider_id, 'new_request', 'لديك طلب خدمة جديد.', 'You have a new service request.',
            left(new.description, 120), left(new.description, 120), '/provider/requests');
  elsif new.status <> old.status then
    if new.status = 'accepted' then
      insert into public.notifications (user_id, type, title_ar, title_en, message_ar, message_en, link)
      values (new.customer_id, 'request_accepted', 'تم قبول طلبك.', 'Your request was accepted.', 'تقدر تتواصل مع مقدم الخدمة دلوقتي.', 'You can now chat with the provider.', '/customer/requests');
    elsif new.status = 'rejected' then
      insert into public.notifications (user_id, type, title_ar, title_en, message_ar, message_en, link)
      values (new.customer_id, 'request_rejected', 'تم رفض طلبك.', 'Your request was declined.', 'جرّب مقدم خدمة تاني مناسب ليك.', 'Try another provider that fits your needs.', '/customer/requests');
    elsif new.status = 'completed' then
      insert into public.notifications (user_id, type, title_ar, title_en, message_ar, message_en, link)
      values (new.customer_id, 'review_ready', 'يمكنك الآن تقييم الخدمة.', 'You can now rate the service.', 'رأيك بيساعد غيرك يختار صح.', 'Your feedback helps others choose well.', '/customer/requests');
    elsif new.status = 'cancelled' then
      insert into public.notifications (user_id, type, title_ar, title_en, message_ar, message_en, link)
      values (case when auth.uid() = new.customer_id then new.provider_id else new.customer_id end,
              'request_cancelled', 'تم إلغاء طلب.', 'A request was cancelled.', null, null,
              case when auth.uid() = new.customer_id then '/provider/requests' else '/customer/requests' end);
    end if;
  end if;
  return new;
end $$;
create trigger requests_notify after insert or update on public.service_requests for each row execute function public.notify_request_events();

create or replace function public.notify_new_message() returns trigger language plpgsql security definer set search_path = public as $$
declare r text;
begin
  select role into r from public.profiles where id = new.receiver_id;
  insert into public.notifications (user_id, type, title_ar, title_en, message_ar, message_en, link)
  values (new.receiver_id, 'new_message', 'لديك رسالة جديدة.', 'You have a new message.', left(new.message, 100), left(new.message, 100),
          case when r = 'provider' then '/provider/messages' else '/customer/messages' end);
  return new;
end $$;
create trigger messages_notify after insert on public.messages for each row execute function public.notify_new_message();

create or replace function public.provider_stats()
returns table (provider_id uuid, avg_rating numeric, review_count int, completed_count int, total_requests int, responded_requests int)
language sql stable security definer set search_path = public as $$
  select p.id,
    coalesce((select round(avg(rv.rating)::numeric, 1) from public.reviews rv where rv.provider_id = p.id), 0),
    (select count(*)::int from public.reviews rv where rv.provider_id = p.id),
    (select count(*)::int from public.service_requests sr where sr.provider_id = p.id and sr.status = 'completed'),
    (select count(*)::int from public.service_requests sr where sr.provider_id = p.id),
    (select count(*)::int from public.service_requests sr where sr.provider_id = p.id and sr.status <> 'pending')
  from public.profiles p
  where p.role = 'provider' and not p.is_suspended
$$;
grant execute on function public.provider_stats() to anon, authenticated;

create or replace function public.admin_stats() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare res jsonb;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'not_allowed'; end if;
  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'providers', (select count(*) from public.profiles where role = 'provider'),
    'customers', (select count(*) from public.profiles where role = 'customer'),
    'services', (select count(*) from public.provider_services),
    'requests', (select count(*) from public.service_requests),
    'completed', (select count(*) from public.service_requests where status = 'completed'),
    'avg_rating', (select coalesce(round(avg(rating)::numeric, 2), 0) from public.reviews),
    'reports_pending', (select count(*) from public.reports where status = 'pending'),
    'by_status', (select coalesce(jsonb_object_agg(status, c), '{}'::jsonb) from (select status, count(*) c from public.service_requests group by status) s),
    'by_category', (select coalesce(jsonb_agg(jsonb_build_object('name_ar', c.name_ar, 'name_en', c.name_en, 'count', x.cnt) order by x.cnt desc), '[]'::jsonb)
                    from public.categories c join (select pr.category_id, count(*) cnt from public.provider_services s join public.professions pr on pr.id = s.profession_id group by pr.category_id) x on x.category_id = c.id)
  ) into res;
  return res;
end $$;
grant execute on function public.admin_stats() to authenticated;

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.service_requests;
alter publication supabase_realtime add table public.notifications;