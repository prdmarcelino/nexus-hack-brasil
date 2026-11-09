-- Estrutura inicial para projeto Supabase exclusivo do nexus.club.
-- Não aplicar em projetos existentes sem conferir o destino e testar RLS.
create table public.patrimonio_usuario (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  bens jsonb not null default '[]'::jsonb check (jsonb_typeof(bens) = 'array'),
  metas jsonb not null default '[]'::jsonb check (jsonb_typeof(metas) = 'array'),
  visao_tranquila boolean not null default true,
  atualizado_em timestamptz not null default now()
);

alter table public.patrimonio_usuario enable row level security;
revoke all on table public.patrimonio_usuario from public, anon, authenticated;
grant select, insert, update, delete on table public.patrimonio_usuario to authenticated;

create policy "usuario le seus dados" on public.patrimonio_usuario
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "usuario cria seus dados" on public.patrimonio_usuario
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "usuario atualiza seus dados" on public.patrimonio_usuario
  for update to authenticated using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);
create policy "usuario remove seus dados" on public.patrimonio_usuario
  for delete to authenticated using ((select auth.uid()) = usuario_id);

create function public.atualizar_data_patrimonio() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;
create trigger patrimonio_atualizado_em before update on public.patrimonio_usuario
  for each row execute function public.atualizar_data_patrimonio();
