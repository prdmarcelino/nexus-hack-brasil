import { test } from "node:test";
import { strict as assert } from "node:assert";
import { lerBackup } from "../lib/backup";
test("valida e recupera cópia de bens e metas", () => {
 const dados = { bens: [{id:"1",nome:"Casa",categoria:"Imóveis",valor:200,data:"2026-01-01"}], metas: [{id:"m",nome:"Meta",valor:300,destinacoes:[{bemId:"1",valor:100}]}], tranquila:true };
 assert.deepEqual(lerBackup(JSON.stringify({formato:"nexus-club-backup",versao:1,dados})),dados);
 assert.throws(() => lerBackup(JSON.stringify({formato:"outro",versao:1,dados})));
 assert.throws(() => lerBackup(JSON.stringify({formato:"nexus-club-backup",versao:1,dados:{...dados,bens:[{...dados.bens[0],valor:-1}]}})));
});

test("rejeita datas inexistentes no bem e no histórico sem rejeitar ano bissexto válido", () => {
 const bem = {id:"1",nome:"Casa",categoria:"Imóveis",valor:200,data:"2024-02-29"};
 const arquivo = (b: object) => JSON.stringify({formato:"nexus-club-backup",versao:1,dados:{bens:[b],metas:[],tranquila:true}});
 assert.equal(lerBackup(arquivo(bem)).bens[0].data, "2024-02-29");
 assert.throws(() => lerBackup(arquivo({...bem,data:"2025-02-29"})), /bem inválido/);
 assert.throws(() => lerBackup(arquivo({...bem,historico:[{valor:100,data:"2026-02-30"}]})), /histórico inválido/);
});

test("rejeita valores com fração de centavo e associações duplicadas", () => {
 const arquivo = (dados: object) => JSON.stringify({formato:"nexus-club-backup",versao:1,dados});
 const dados = {bens:[{id:"1",nome:"Casa",categoria:"Imóveis",valor:200,data:"2026-01-01"}],metas:[],tranquila:true};
 assert.throws(() => lerBackup(arquivo({...dados,bens:[{...dados.bens[0],valor:0.001}]})), /bem inválido/);
 assert.throws(() => lerBackup(arquivo({...dados,bens:[{...dados.bens[0],valor:Number.MAX_SAFE_INTEGER}]})), /bem inválido/);
 const meta = {id:"m",nome:"Meta",valor:100,destinacoes:[{bemId:"1",valor:0.001}]};
 assert.throws(() => lerBackup(arquivo({...dados,metas:[meta]})), /meta inválida/);
 assert.throws(() => lerBackup(arquivo({...dados,metas:[{...meta,destinacoes:[{bemId:"1",valor:10},{bemId:"1",valor:20}]}]})), /meta inválida/);
});
