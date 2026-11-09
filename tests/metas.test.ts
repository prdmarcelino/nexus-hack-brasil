import { test } from "node:test";
import { strict as assert } from "node:assert";
import { destinadoAoBem, validarDestinacoes, metasExemplo, type Meta } from "../lib/metas";
import { exemplo, type Bem } from "../lib/patrimonio";
const bens: Bem[] = [{ id:"a", nome:"Reserva", categoria:"Investimentos", valor:100000, data:"2026-01-01" }];
const metas: Meta[] = [{ id:"m1", nome:"Viagem", valor:30000, destinacoes:[{bemId:"a",valor:20000}] }];
test("controla divisão entre metas e não conta duas vezes ao editar", () => {
 assert.equal(destinadoAoBem(metas,"a"),20000);
 assert.equal(validarDestinacoes(bens,metas,[{bemId:"a",valor:80000}]),null);
 assert.match(validarDestinacoes(bens,metas,[{bemId:"a",valor:80000.01}])!,/ultrapassa/);
 assert.equal(validarDestinacoes(bens,metas,[{bemId:"a",valor:100000}],"m1"),null);
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
