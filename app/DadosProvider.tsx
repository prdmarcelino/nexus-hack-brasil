"use client";
import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { exemplo, type Bem } from "../lib/patrimonio";
import { metasExemplo, type Meta } from "../lib/metas";
import { lerBackup } from "../lib/backup";
import { assinaturaDados } from "../lib/dados";
type Dados = { bens: Bem[]; metas: Meta[]; tranquila: boolean };
type Estado = "salvo" | "aguardando" | "salvando" | "erro" | "conflito";
type Contexto = Dados & { setBens: Dispatch<SetStateAction<Bem[]>>; setMetas: Dispatch<SetStateAction<Meta[]>>; setTranquila: Dispatch<SetStateAction<boolean>>; sessao: Session | null; pronto: boolean; erroDados: string; alterado: boolean; estado: Estado; tentarNovamente: () => void; revisaoLegado: number; };
const DadosContext = createContext<Contexto | null>(null);
const assinar = (d: Dados) => assinaturaDados({bens:d.bens,metas:d.metas,tranquila:d.tranquila});
function validar(d: {bens:unknown;metas:unknown;visao_tranquila:unknown}): Dados { return lerBackup(JSON.stringify({formato:"nexus-club-backup",versao:1,dados:{bens:d.bens,metas:d.metas,tranquila:d.visao_tranquila}})); }
function limparAntigos(id: string, dados: Dados) {
 try { for (const chave of [`nexus-conta-v1:${id}`, "nexus-demo-v1", "nexus-visitante-v1"]) { const antigo = localStorage.getItem(chave); if (!antigo) continue; try { const lido = lerBackup(JSON.stringify({formato:"nexus-club-backup",versao:1,dados:JSON.parse(antigo)})); if (assinar(lido) === assinar(dados)) localStorage.removeItem(chave); } catch { /* preserva dados não validados */ } } } catch { /* limpeza é opcional */ }
}
export function DadosProvider({children}:{children:React.ReactNode}) {
 const [sessao,setSessao]=useState<Session|null>(null); const [resolvido,setResolvido]=useState(false);
 const [bens,setBens]=useState<Bem[]>([]); const [metas,setMetas]=useState<Meta[]>([]); const [tranquila,setTranquila]=useState(true);
 const [identidadeCarregada,setIdentidadeCarregada]=useState<string|null>(null); const [referencia,setReferencia]=useState(""); const [erroDados,setErroDados]=useState("");
 const [estado,setEstado]=useState<Estado>("salvo"); const [revisaoLegado,setRevisaoLegado]=useState(0);
 const versao = useRef<string|null>(null); const emCurso = useRef(false); const geracao = useRef(0);
 const identidade = resolvido ? sessao?.user.id ?? "visitante" : null;
 useEffect(() => { if (!supabase) { setResolvido(true); return; } const {data}=supabase.auth.onAuthStateChange((_evento,s)=>{setSessao(s);setResolvido(true)}); return ()=>data.subscription.unsubscribe(); },[]);
 useEffect(() => {
  if (!identidade) return; const atual=++geracao.current; setIdentidadeCarregada(null);setErroDados("");setEstado("salvo");versao.current=null;emCurso.current=false;
  function aplicar(d:Dados, v:string|null) { if(atual!==geracao.current)return; setBens(d.bens);setMetas(d.metas);setTranquila(d.tranquila);setReferencia(assinar(d));versao.current=v;setIdentidadeCarregada(identidade); }
  if (identidade==="visitante") { aplicar({bens:exemplo,metas:metasExemplo,tranquila:true},null); return; }
  if (!supabase) { setErroDados("Banco não configurado.");setIdentidadeCarregada(identidade);return; }
  Promise.resolve(supabase.from("patrimonio_usuario").select("bens,metas,visao_tranquila,atualizado_em").eq("usuario_id",identidade).maybeSingle()).then(({data,error})=>{
   if(atual!==geracao.current)return;
   if(error){setErroDados("Não foi possível carregar os dados da conta. Nenhum dado foi substituído no banco.");setIdentidadeCarregada(identidade);return;}
   try { const dados = data ? validar(data) : {bens:[],metas:[],tranquila:true}; if(data){limparAntigos(identidade,dados);setRevisaoLegado(v=>v+1)} aplicar(dados,data?.atualizado_em ?? null); } catch {setErroDados("Os dados da conta não passaram na validação. Nenhum dado foi substituído.");setIdentidadeCarregada(identidade);}
  }).catch(()=>{if(atual===geracao.current){setErroDados("Não foi possível acessar o banco.");setIdentidadeCarregada(identidade)}});
  return ()=>{if(geracao.current===atual)geracao.current++};
 },[identidade]);
 const pronto=!!identidade && identidadeCarregada===identidade;
 const atual:Dados={bens,metas,tranquila}; const assinatura=assinar(atual);
 const alterado=pronto && !!sessao && !erroDados && assinatura!==referencia;
 useEffect(()=>{if(!alterado && estado!=="salvando")return; const aviso=(evento:BeforeUnloadEvent)=>{evento.preventDefault()};window.addEventListener("beforeunload",aviso);return()=>window.removeEventListener("beforeunload",aviso)},[alterado,estado]);
 useEffect(()=>{
  if(!pronto || !sessao || erroDados || !alterado || estado==="erro" || estado==="conflito" || emCurso.current || !supabase)return;
  const id=sessao.user.id; const inicio=geracao.current; const snapshot:Dados={bens,metas,tranquila}; const assinaturaEnviada=assinar(snapshot);
  setEstado("aguardando");
  const timer=setTimeout(async()=>{
   if(!supabase || inicio!==geracao.current || emCurso.current)return;
   emCurso.current=true;setEstado("salvando");
   try {
    const payload={usuario_id:id,bens:snapshot.bens,metas:snapshot.metas,visao_tranquila:snapshot.tranquila};
    const resultado=versao.current === null
     ? await supabase.from("patrimonio_usuario").insert(payload).select("bens,metas,visao_tranquila,atualizado_em").single()
     : await supabase.from("patrimonio_usuario").update(payload).eq("usuario_id",id).eq("atualizado_em",versao.current).select("bens,metas,visao_tranquila,atualizado_em").maybeSingle();
    if(inicio!==geracao.current)return;
    if(resultado.error){setEstado(resultado.error.code==="23505" ? "conflito" : "erro");return;}
    if(!resultado.data){setEstado("conflito");return;}
    const confirmado=validar(resultado.data); if(assinar(confirmado)!==assinaturaEnviada) {setEstado("erro");return;}
    versao.current=resultado.data.atualizado_em; setReferencia(assinaturaEnviada); limparAntigos(id,confirmado);setRevisaoLegado(v=>v+1);setEstado("salvo");
   } catch { if(inicio===geracao.current)setEstado("erro"); }
   finally { if(inicio===geracao.current)emCurso.current=false; }
  },700);
  return ()=>clearTimeout(timer);
 },[pronto,sessao?.user.id,erroDados,alterado,assinatura,referencia,estado]);
 function tentarNovamente(){if(estado==="erro")setEstado("salvo")}
 return <DadosContext.Provider value={{bens,metas,tranquila,setBens,setMetas,setTranquila,sessao,pronto,erroDados,alterado,estado,tentarNovamente,revisaoLegado}}>{children}</DadosContext.Provider>;
}
export function useDados(){const c=useContext(DadosContext);if(!c)throw new Error("DadosProvider ausente");return c}
