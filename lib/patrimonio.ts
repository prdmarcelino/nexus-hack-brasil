export const categorias = ["Investimentos", "Imóveis", "Veículos", "Participações", "Outros bens"] as const;
export type Categoria = typeof categorias[number];
export type Avaliacao = { valor: number; data: string };
export type Bem = { id: string; nome: string; categoria: Categoria; valor: number; data: string; historico?: Avaliacao[] };
export function atualizarBem(anterior: Bem, novo: Bem): Bem {
  const historico = [...(anterior.historico ?? []), { valor: anterior.valor, data: anterior.data }];
  if (anterior.valor === novo.valor && anterior.data === novo.data) return { ...novo, historico: anterior.historico };
  return { ...novo, historico };
}
export function ultimaVariacao(bem: Bem): { anterior: Avaliacao; diferenca: number } | null {
  const anterior = bem.historico?.at(-1);
  return anterior ? { anterior, diferenca: bem.valor - anterior.valor } : null;
}
export const exemplo: Bem[] = [
  { id: "1", nome: "Investimentos de longo prazo", categoria: "Investimentos", valor: 145000, data: "2026-11-01" },
  { id: "2", nome: "Apartamento", categoria: "Imóveis", valor: 420000, data: "2026-08-15" },
  { id: "3", nome: "Veículo", categoria: "Veículos", valor: 48000, data: "2026-10-01" },
  { id: "4", nome: "Reserva financeira", categoria: "Investimentos", valor: 32000, data: "2026-11-01" },
];
export function total(bens: Bem[]): number { return bens.reduce((soma, bem) => soma + bem.valor, 0); }
export function porCategoria(bens: Bem[]): { categoria: Categoria; valor: number }[] {
  return categorias.map(categoria => ({ categoria, valor: total(bens.filter(b => b.categoria === categoria)) })).filter(item => item.valor > 0);
}
export const moeda = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

/** Meses inteiros necessários, sem juros, inflação ou custos. */
export function mesesParaMeta(atual: number, alvo: number, aporteMensal: number): number | null {
  if (![atual, alvo, aporteMensal].every(Number.isFinite) || atual < 0 || alvo <= 0 || aporteMensal < 0) return null;
  const restanteEmCentavos = Math.max(0, Math.round(alvo * 100) - Math.round(atual * 100));
  if (restanteEmCentavos === 0) return 0;
  const aporteEmCentavos = Math.round(aporteMensal * 100);
  return aporteEmCentavos > 0 ? Math.ceil(restanteEmCentavos / aporteEmCentavos) : null;
}
