import type { Bem } from "./patrimonio";
export type Destinacao = { bemId: string; valor: number };
export type Meta = { id: string; nome: string; valor: number; destinacoes: Destinacao[] };
export const metasExemplo: Meta[] = [
 { id: "exemplo-meta-1", nome: "Reserva para imprevistos", valor: 50000, destinacoes: [{ bemId: "4", valor: 32000 }] },
 { id: "exemplo-meta-2", nome: "Planos de longo prazo", valor: 250000, destinacoes: [{ bemId: "1", valor: 100000 }] },
];
const centavos = (n: number) => Math.round(n * 100);
export function destinadoAoBem(metas: Meta[], bemId: string, excetoId?: string): number {
 return metas.filter(m => m.id !== excetoId).flatMap(m => m.destinacoes).filter(d => d.bemId === bemId).reduce((s, d) => s + centavos(d.valor), 0) / 100;
}
export function validarDestinacoes(bens: Bem[], metas: Meta[], destinacoes: Destinacao[], excetoId?: string): string | null {
 const vistos = new Set<string>();
 for (const d of destinacoes) {
  const bem = bens.find(b => b.id === d.bemId);
  if (!bem || vistos.has(d.bemId) || !Number.isFinite(d.valor) || centavos(d.valor) <= 0) return "Revise os bens e valores informados.";
  vistos.add(d.bemId);
  if (centavos(destinadoAoBem(metas, d.bemId, excetoId)) + centavos(d.valor) > centavos(bem.valor)) return `O valor destinado para ${bem.nome} ultrapassa o saldo disponível. Revise o valor ou edite a outra meta que utiliza este bem.`;
 }
 return null;
}
