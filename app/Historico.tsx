"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { lerBackup } from "../lib/backup";
import { assinaturaDados } from "../lib/dados";
import { useDados } from "./DadosProvider";
import { moeda, type Bem } from "../lib/patrimonio";
import type { Meta } from "../lib/metas";
type Versao = { id: number; bens: Bem[]; metas: Meta[]; visao_tranquila: boolean; criado_em: string };
export default function Historico() {
 const {sessao,bens,metas,tranquila,setBens,setMetas,setTranquila,alterado,estado} = useDados();
 const [versoes,setVersoes]=useState<Versao[]>([]); const [carregando,setCarregando]=useState(false); const [erro,setErro]=useState("");
 const [escolhida,setEscolhida]=useState<Versao|null>(null); const [confirmacao,setConfirmacao]=useState(""); const [aviso,setAviso]=useState("");
 useEffect(()=>{
  if(!sessao || !supabase || estado!=="salvo" || alterado)return;
  let ativo=true;setCarregando(true);setErro("");
  Promise.resolve(supabase.from("patrimonio_historico").select("id,bens,metas,visao_tranquila,criado_em").eq("usuario_id",sessao.user.id).order("id",{ascending:false}).limit(20)).then(({data,error})=>{if(!ativo)return;if(error)setErro("Não foi possível carregar o histórico.");else setVersoes(data ?? []);setCarregando(false)}).catch(()=>{if(ativo){setErro("Não foi possível carregar o histórico.");setCarregando(false)}});
  return()=>{ativo=false};
 },[sessao?.user.id,estado,alterado]);
 function fechar(){setEscolhida(null);setConfirmacao("");setErro("")}
 function restaurar(){
  if(!escolhida || confirmacao!=="RESTAURAR" || alterado || estado!=="salvo")return;
  try {const dados=lerBackup(JSON.stringify({formato:"nexus-club-backup",versao:1,dados:{bens:escolhida.bens,metas:escolhida.metas,tranquila:escolhida.visao_tranquila}}));setBens(dados.bens);setMetas(dados.metas);setTranquila(dados.tranquila);fechar();setAviso("Versão carregada. Aguarde a confirmação de salvamento no aviso superior.");} catch {setErro("Não foi possível validar esta versão; os dados atuais não foram alterados.");}
 }
 if(!sessao)return null;
 return <section className="card goal history-versions"><div className="eyebrow"><span/> PROTEÇÃO DOS DADOS</div><h2>Histórico de versões</h2><p>O banco guarda as últimas 20 versões salvas. O histórico começa com a ativação desta função e não substitui sua cópia de segurança.</p>{carregando&&<p role="status">Carregando histórico...</p>}{erro&&!escolhida&&<p className="error" role="alert">{erro}</p>}{aviso&&<p role="status">{aviso}</p>}
 {!carregando && !versoes.length && !erro && <p>Ainda não há versões salvas.</p>}
 <div className="history-versions-list">{versoes.map(v=>{const igual=assinaturaDados({bens:v.bens,metas:v.metas,tranquila:v.visao_tranquila})===assinaturaDados({bens,metas,tranquila});return <div className="history-version" key={v.id}><span><strong>{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(v.criado_em))}</strong><small>{v.bens.length} bens · {v.metas.length} metas {igual ? "· versão em exibição" : ""}</small></span><button className="secondary" disabled={igual||alterado||estado!=="salvo"} onClick={()=>{setAviso("");setEscolhida(v)}}>{igual?"Em exibição":"Conferir versão"}</button></div>})}</div>
 {escolhida && <div className="overlay" onClick={fechar} onKeyDown={e=>{if(e.key==="Escape")fechar()}}><div className="modal delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="historico-titulo" aria-describedby="historico-desc" onClick={e=>e.stopPropagation()}><div className="modal-title"><h2 id="historico-titulo">Restaurar esta versão?</h2></div><p id="historico-desc">A versão de {new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(escolhida.criado_em))} contém {escolhida.bens.length} bens e {escolhida.metas.length} metas. Ela substituirá todos os dados em exibição e será salva na conta.</p><div className="version-preview" aria-label="Conteúdo da versão"><strong>Bens desta versão</strong>{escolhida.bens.length ? <ul>{escolhida.bens.map(bem=><li key={bem.id}><span>{bem.nome}</span><span>{moeda(bem.valor)}</span></li>)}</ul> : <p>Nenhum bem cadastrado.</p>}<strong>Metas desta versão</strong>{escolhida.metas.length ? <ul>{escolhida.metas.map(meta=><li key={meta.id}><span>{meta.nome}</span><span>Objetivo: {moeda(meta.valor)}</span></li>)}</ul> : <p>Nenhuma meta cadastrada.</p>}<small>Esta lista mostra valores informados na época, não cotações atuais.</small></div><div className="delete-warning">Baixe uma cópia de segurança se quiser preservar os dados atuais. Digite <strong>RESTAURAR</strong> para continuar.</div><label className="restore-confirm-label">Digite RESTAURAR<input autoFocus value={confirmacao} onChange={e=>setConfirmacao(e.target.value)} autoComplete="off"/></label>{erro&&<p className="error" role="alert">{erro}</p>}<div className="modal-actions"><button className="secondary" onClick={fechar}>Cancelar</button><button className="danger-button" disabled={confirmacao!=="RESTAURAR" || alterado || estado!=="salvo"} onClick={restaurar}>Restaurar versão</button></div></div></div>}
 </section>;
}
