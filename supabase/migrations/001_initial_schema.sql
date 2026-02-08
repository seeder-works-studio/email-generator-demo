-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on user signup
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Generated emails table
create table generated_emails (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  recipient_name text not null,
  recipient_title text not null,
  company_name text not null,
  company_url text not null,
  industry text not null,
  tone text not null,
  scraped_context jsonb,
  variations jsonb not null,
  selected_variation int,
  created_at timestamptz default now()
);

alter table generated_emails enable row level security;

create policy "Users can view own emails"
  on generated_emails for select using (auth.uid() = user_id);
create policy "Users can insert own emails"
  on generated_emails for insert with check (auth.uid() = user_id);
create policy "Users can update own emails"
  on generated_emails for update using (auth.uid() = user_id);
create policy "Users can delete own emails"
  on generated_emails for delete using (auth.uid() = user_id);
create policy "Admins can view all emails"
  on generated_emails for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Activity logs table
create table activity_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  user_email text,
  action text not null,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

alter table activity_logs enable row level security;

create policy "Admins can view all logs"
  on activity_logs for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "Anyone can insert logs"
  on activity_logs for insert with check (true);

-- Indexes for performance
create index idx_generated_emails_user_id on generated_emails(user_id);
create index idx_generated_emails_created_at on generated_emails(created_at desc);
create index idx_activity_logs_created_at on activity_logs(created_at desc);
create index idx_activity_logs_user_id on activity_logs(user_id);
create index idx_activity_logs_action on activity_logs(action);
