-- Dados exclusivamente fictícios para demonstração pública, leitura apenas.
create table public.exemplo_publico (
 id text primary key,
 bens jsonb not null,
 metas jsonb not null
);
alter table public.exemplo_publico enable row level security;
revoke all on table public.exemplo_publico from public, anon, authenticated;
grant select on table public.exemplo_publico to anon, authenticated;
create policy "leitura do exemplo publico" on public.exemplo_publico for select to anon, authenticated using (true);
insert into public.exemplo_publico (id,bens,metas) values ('principal', $json$[{"id": "1", "nome": "Investimentos de longo prazo", "categoria": "Investimentos", "valor": 145000, "data": "2026-11-01"}, {"id": "2", "nome": "Apartamento", "categoria": "Imóveis", "valor": 420000, "data": "2026-08-15"}, {"id": "3", "nome": "Veículo", "categoria": "Veículos", "valor": 48000, "data": "2026-10-01"}, {"id": "4", "nome": "Reserva financeira", "categoria": "Investimentos", "valor": 32000, "data": "2026-11-01"}]$json$::jsonb, $json$[{"id": "exemplo-meta-1", "nome": "Reserva para imprevistos", "valor": 50000, "destinacoes": [{"bemId": "4", "valor": 32000}]}, {"id": "exemplo-meta-2", "nome": "Planos de longo prazo", "valor": 250000, "destinacoes": [{"bemId": "1", "valor": 100000}]}]$json$::jsonb);
