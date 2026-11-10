import { test } from "node:test";
import { strict as assert } from "node:assert";
import { destinadoAoBem, validarDestinacoes, metaPrecisaRevisao, resumoDestinacoes, metasExemplo, type Meta } from "../lib/metas";
import { exemplo, type Bem } from "../lib/patrimonio";
const bens: Bem[] = [{ id:"a", nome:"Reserva", categoria:"Investimentos", valor:100000, data:"2026-01-01" }];
const metas: Meta[] = [{ id:"m1", nome:"Viagem", valor:30000, destinacoes:[{bemId:"a",valor:20000}] }];
test("controla divisão entre metas e não conta duas vezes ao editar", () => {
 assert.equal(destinadoAoBem(metas,"a"),20000);
 assert.equal(validarDestinacoes(bens,metas,[{bemId:"a",valor:80000}]),null);
 assert.match(validarDestinacoes(bens,metas,[{bemId:"a",valor:80000.01}])!,/ultrapassa/);
 assert.equal(validarDestinacoes(bens,metas,[{bemId:"a",valor:100000}],"m1"),null);
});

test("pede revisão para bem removido ou distribuição excedida entre metas", () => {
 assert.equal(metaPrecisaRevisao(metas[0], bens, metas), false);
 assert.equal(metaPrecisaRevisao(metas[0], [], metas), true);
 const outra: Meta = {id:"m2",nome:"Outra",valor:100000,destinacoes:[{bemId:"a",valor:80000.01}]};
 assert.equal(metaPrecisaRevisao(metas[0], bens, [...metas, outra]), true);
});
test("resume somente valores válidos sem contar bens removidos ou distribuir mais que o patrimônio", () => {
 assert.deepEqual(resumoDestinacoes(bens, metas), {destinado:20000, disponivel:80000});
 assert.deepEqual(resumoDestinacoes(bens, []), {destinado:0, disponivel:100000});
 assert.equal(resumoDestinacoes([], metas), null);
 const outra: Meta = {id:"m2",nome:"Outra",valor:100000,destinacoes:[{bemId:"a",valor:80000.01}]};
 assert.equal(resumoDestinacoes(bens, [...metas, outra]), null);
 const fracao: Bem[] = [{...bens[0],valor:0.3}];
 assert.deepEqual(resumoDestinacoes(fracao, [{...metas[0],destinacoes:[{bemId:"a",valor:0.1}]}]), {destinado:0.1,disponivel:0.2});
});
test("rejeita valores inválidos, duplicados e bens inexistentes", () => {
 assert.equal(validarDestinacoes(bens,metas,[]), null);
 assert.ok(validarDestinacoes(bens,metas,[{bemId:"a",valor:-1}]));
 assert.ok(validarDestinacoes(bens,metas,[{bemId:"ausente",valor:1}]));
 assert.ok(validarDestinacoes(bens,metas,[{bemId:"a",valor:1},{bemId:"a",valor:1}]));
});

 test("metas de exemplo usam bens existentes sem exceder seus valores", () => {
 assert.equal(metasExemplo.length, 2);
 for (const m of metasExemplo) assert.equal(validarDestinacoes(exemplo, metasExemplo, m.destinacoes, m.id), null);
 });
