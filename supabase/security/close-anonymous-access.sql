create or replace function public.security_allowed_sales_user() returns boolean language sql stable security definer set search_path=pg_catalog as $f$
select exists(select 1 from auth.users where id=auth.uid() and email in ('yuubae96@gmail.com','fuucha96@yahoo.co.jp') and email_confirmed_at is not null) $f$;
revoke execute on function public.security_allowed_sales_user() from public,anon;
grant execute on function public.security_allowed_sales_user() to authenticated;
do $block$ declare r record; begin
for r in select schemaname,tablename,policyname from pg_policies where schemaname in ('public','storage') loop execute format('drop policy %I on %I.%I',r.policyname,r.schemaname,r.tablename); end loop;
for r in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') loop
 execute format('alter table public.%I enable row level security',r.relname);
 execute format('revoke all on table public.%I from anon',r.relname);
 execute format('grant select,insert,update,delete on table public.%I to authenticated',r.relname);
 execute format('create policy security_verified_sales_user on public.%I for all to authenticated using(public.security_allowed_sales_user()) with check(public.security_allowed_sales_user())',r.relname);
end loop; end $block$;
revoke execute on all functions in schema public from anon;
revoke all on storage.objects from anon;
grant select,insert,update,delete on storage.objects to authenticated;
create policy security_sales_private_files on storage.objects for all to authenticated using(bucket_id in ('company-drawings','business-cards') and public.security_allowed_sales_user()) with check(bucket_id in ('company-drawings','business-cards') and public.security_allowed_sales_user());