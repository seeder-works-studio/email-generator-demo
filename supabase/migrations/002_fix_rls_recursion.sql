-- Fix infinite recursion in RLS policies by using a security definer function

-- 1. Create a secure function to check admin status
-- "security definer" means this function runs with the privileges of the creator (postgres/admin),
-- bypassing RLS on the profiles table, thus avoiding the recursion loop.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$ language sql security definer;

-- 2. Update Profiles policies to use the function
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles"
  on profiles for select using (is_admin());

-- 3. Update Generated Emails policies to use the function
drop policy if exists "Admins can view all emails" on generated_emails;
create policy "Admins can view all emails"
  on generated_emails for select using (is_admin());

-- 4. Update Activity Logs policies to use the function
drop policy if exists "Admins can view all logs" on activity_logs;
create policy "Admins can view all logs"
  on activity_logs for select using (is_admin());
