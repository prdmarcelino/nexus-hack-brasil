import { categorias, type Bem } from "./patrimonio";
import type { Meta } from "./metas";
type Dados = { bens: Bem[]; metas: Meta[]; tranquila: boolean };
export function lerBackup(texto: string): Dados {
 const arquivo = JSON.parse(texto);
 const d = arquivo?.dados;
 if (arquivo?.formato !== "nexus-club-backup" || arquivo?.versao !== 1 || !d || !Array.isArray(d.bens) || !Array.isArray(d.metas) || typeof d.tranquila !== "boolean") throw new Error("Formato de cópia inválido ou não reconhecido.");
 const ids = new Set<string>();
 for (const b of d.bens) {
  if (!b || typeof b.id !== "string" || !b.id || ids.has(b.id) || typeof b.nome !== "string" || !b.nome.trim() || !categorias.includes(b.categoria) || typeof b.valor !== "number" || !Number.isFinite(b.valor) || b.valor <= 0 || typeof b.data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.data) || Number.isNaN(Date.parse(b.data))) throw new Error("A cópia contém um bem inválido.");
  ids.add(b.id);
  if (b.historico !== undefined && (!Array.isArray(b.historico) || !b.historico.every((a: { valor: number; data: string }) => typeof a?.valor === "number" && Number.isFinite(a.valor) && a.valor > 0 && typeof a.data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(a.data) && !Number.isNaN(Date.parse(a.data))))) throw new Error("A cópia contém um histórico inválido.");
 }
 const idsMetas = new Set<string>();
 for (const m of d.metas) {
  if (!m || typeof m.id !== "string" || !m.id || idsMetas.has(m.id) || typeof m.nome !== "string" || !m.nome.trim() || typeof m.valor !== "number" || !Number.isFinite(m.valor) || m.valor <= 0 || !Array.isArray(m.destinacoes) || !m.destinacoes.every((a: { bemId: string; valor: number }) => typeof a?.bemId === "string" && !!a.bemId && typeof a.valor === "number" && Number.isFinite(a.valor) && a.valor > 0)) throw new Error("A cópia contém uma meta inválida.");
  idsMetas.add(m.id);
 }
 return { bens: d.bens, metas: d.metas, tranquila: d.tranquila };
}
