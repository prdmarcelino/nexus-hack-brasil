import { test } from "node:test";
import { strict as assert } from "node:assert";
import { lerBackup } from "../lib/backup";
test("valida e recupera cópia de bens e metas", () => {
 const dados = { bens: [{id:"1",nome:"Casa",categoria:"Imóveis",valor:200,data:"2026-01-01"}], metas: [{id:"m",nome:"Meta",valor:300,destinacoes:[{bemId:"1",valor:100}]}], tranquila:true };
 assert.deepEqual(lerBackup(JSON.stringify({formato:"nexus-club-backup",versao:1,dados})),dados);
 assert.throws(() => lerBackup(JSON.stringify({formato:"outro",versao:1,dados})));
 assert.throws(() => lerBackup(JSON.stringify({formato:"nexus-club-backup",versao:1,dados:{...dados,bens:[{...dados.bens[0],valor:-1}]}})));
});
