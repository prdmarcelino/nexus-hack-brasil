-- Histórico privado: registra até 50 versões confirmadas por conta.
create table public.patrimonio_historico (
 id bigint generated always as identity primary key,
 usuario_id uuid not null references auth.users(id) on delete cascade,
 bens jsonb not null,
 metas jsonb not null,
 visao_tranquila boolean not null,
 criado_em timestamptz not null default now()
);
create index patrimonio_historico_usuario_id on public.patrimonio_historico (usuario_id, id desc);
alter table public.patrimonio_historico enable row level security;
revoke all on table public.patrimonio_historico from public, anon, authenticated;
grant select on table public.patrimonio_historico to authenticated;
create policy "usuario consulta seu historico" on public.patrimonio_historico
 for select to authenticated using ((select auth.uid()) = usuario_id);

-- Preserva o estado atual como primeira referência; não cria dados anteriores.
insert into public.patrimonio_historico (usuario_id, bens, metas, visao_tranquila)
 select usuario_id, bens, metas, visao_tranquila from public.patrimonio_usuario;

create function public.registrar_historico_patrimonio() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.patrimonio_historico (usuario_id, bens, metas, visao_tranquila)
 values (new.usuario_id, new.bens, new.metas, new.visao_tranquila);
 delete from public.patrimonio_historico where id in (
  select id from public.patrimonio_historico where usuario_id = new.usuario_id
  order by id desc offset 50
 );
 return new;
end;
$$;
revoke all on function public.registrar_historico_patrimonio() from public, anon, authenticated;
create trigger patrimonio_registrar_historico after insert or update on public.patrimonio_usuario
 for each row execute function public.registrar_historico_patrimonio();
