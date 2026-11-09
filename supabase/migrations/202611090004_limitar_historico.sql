-- Mantém apenas as 20 versões mais recentes por conta.
create or replace function public.registrar_historico_patrimonio() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.patrimonio_historico (usuario_id, bens, metas, visao_tranquila)
 values (new.usuario_id, new.bens, new.metas, new.visao_tranquila);
 delete from public.patrimonio_historico where id in (
  select id from public.patrimonio_historico where usuario_id = new.usuario_id
  order by id desc offset 20
 );
 return new;
end;
$$;
revoke all on function public.registrar_historico_patrimonio() from public, anon, authenticated;

-- Aplica o novo limite às versões já existentes de cada conta.
with excedentes as (
 select id, row_number() over (partition by usuario_id order by id desc) as posicao
 from public.patrimonio_historico
)
delete from public.patrimonio_historico where id in (
 select id from excedentes where posicao > 20
);
