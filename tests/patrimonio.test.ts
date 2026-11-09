import { test } from "node:test";
import { strict as assert } from "node:assert";
import { total, porCategoria, atualizarBem, ultimaVariacao, mesesParaMeta, avaliacaoAntiga, type Bem } from "../lib/patrimonio";

test("soma valores e distribui categorias sem duplicar bens", () => {
 const bens: Bem[] = [
  { id: "1", nome: "Casa", categoria: "Imóveis", valor: 200000, data: "2026-01-01" },
  { id: "2", nome: "Reserva", categoria: "Investimentos", valor: 25000, data: "2026-01-01" },
  { id: "3", nome: "Outro", categoria: "Investimentos", valor: 5000, data: "2026-01-01" },
 ];
 assert.equal(total(bens), 230000);
 assert.deepEqual(porCategoria(bens), [{ categoria: "Investimentos", valor: 30000 }, { categoria: "Imóveis", valor: 200000 }]);
 assert.equal(total([]), 0);
 assert.deepEqual(porCategoria([]), []);
});


test("mantém avaliação anterior somente quando valor ou data mudam", () => {
 const original: Bem = { id: "1", nome: "Casa", categoria: "Imóveis", valor: 600000, data: "2026-01-01" };
 const renomeado = atualizarBem(original, { ...original, nome: "Casa de praia" });
 assert.equal(ultimaVariacao(renomeado), null);
 const atualizado = atualizarBem(renomeado, { ...renomeado, valor: 580000, data: "2026-11-01" });
 assert.deepEqual(ultimaVariacao(atualizado), { anterior: { valor: 600000, data: "2026-01-01" }, diferenca: -20000 });
 const novamente = atualizarBem(atualizado, { ...atualizado, valor: 590000, data: "2026-12-01" });
 assert.equal(novamente.historico?.length, 2);
 assert.equal(ultimaVariacao(novamente)?.diferenca, 10000);
});


test("estima meses sem rendimento, arredondando para cima", () => {
 assert.equal(mesesParaMeta(1000, 2000, 300), 4);
 assert.equal(mesesParaMeta(2000, 2000, 0), 0);
 assert.equal(mesesParaMeta(500, 1000, 0), null);
 assert.equal(mesesParaMeta(0, 1000, -1), null);
 assert.equal(mesesParaMeta(0.1, 0.3, 0.1), 2);
});


test("identifica avaliações com pelo menos um ano usando datas de calendário", () => {
 assert.equal(avaliacaoAntiga("2025-11-09", "2026-11-09"), true);
 assert.equal(avaliacaoAntiga("2025-11-10", "2026-11-09"), false);
 assert.equal(avaliacaoAntiga("2027-01-01", "2026-11-09"), false);
 assert.equal(avaliacaoAntiga("2025-02-28", "2026-02-28"), true);
 assert.equal(avaliacaoAntiga("2023-02-28", "2024-02-29"), true);
 assert.equal(avaliacaoAntiga("2025-02-30", "2026-03-01"), false);
});
