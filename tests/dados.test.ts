import { test } from "node:test";
import { strict as assert } from "node:assert";
import { assinaturaDados } from "../lib/dados";
test("compara objetos JSON do banco sem depender da ordem das chaves", () => {
 assert.equal(assinaturaDados({bens:[{id:"1",valor:100,nome:"Teste"}],metas:[],tranquila:true}), assinaturaDados({tranquila:true,metas:[],bens:[{nome:"Teste",valor:100,id:"1"}]}));
 assert.notEqual(assinaturaDados({bens:[1,2]}),assinaturaDados({bens:[2,1]}));
});
