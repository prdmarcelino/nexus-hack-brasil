"use client";
import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Bem, moeda, mesesParaMeta } from "../lib/patrimonio";
import { Meta, destinadoAoBem, validarDestinacoes, metaPrecisaRevisao } from "../lib/metas";

export default function Metas({ bens, metas, onChange }: { bens: Bem[]; metas: Meta[]; onChange: (metas: Meta[]) => void }) {
 const [editando, setEditando] = useState<string | null>(null);
 const [nome, setNome] = useState(""); const [alvo, setAlvo] = useState("");
 const [valores, setValores] = useState<Record<string,string>>({});
 const [erro, setErro] = useState(""); const [aportes, setAportes] = useState<Record<string,[string,string]>>({});
 const editor = useRef<HTMLHeadingElement>(null);
 const removidos = Object.keys(valores).filter(id => !bens.some(b => b.id === id));
 function limpar() { setEditando(null); setNome(""); setAlvo(""); setValores({}); setErro(""); }
 function editar(meta: Meta) {
  setEditando(meta.id); setNome(meta.nome); setAlvo(String(meta.valor)); setValores(Object.fromEntries(meta.destinacoes.map(d => [d.bemId, String(d.valor)]))); setErro("");
  requestAnimationFrame(() => { editor.current?.scrollIntoView({behavior:"smooth",block:"start"}); editor.current?.focus({preventScroll:true}); });
 }
 function salvar(e: React.FormEvent) {
  e.preventDefault();
  if (removidos.length) { setErro("Remova as associações aos bens excluídos antes de salvar."); return; }
  const destino = bens.filter(b => valores[b.id] !== undefined && valores[b.id] !== "" && Number(valores[b.id]) !== 0).map(b => ({ bemId: b.id, valor: Number(valores[b.id]) }));
  const problema = validarDestinacoes(bens, metas, destino, editando ?? undefined);
  const valorAlvo = Number(alvo);
  if (!nome.trim() || !Number.isFinite(valorAlvo) || Math.round(valorAlvo * 100) <= 0 || problema) { setErro(problema ?? "Informe um nome e um valor válido para a meta."); return; }
  const meta = { id: editando ?? crypto.randomUUID(), nome: nome.trim(), valor: Math.round(valorAlvo * 100) / 100, destinacoes: destino };
  onChange(editando ? metas.map(m => m.id === editando ? meta : m) : [...metas, meta]); limpar();
 }
 return <section className="card goal"><div><div className="eyebrow"><span/> UM PLANO PARA O FUTURO</div><h2>Seus planos, no seu ritmo.</h2><p>Crie objetivos e, quando desejar, defina quanto de cada bem associar. A associação é apenas um planejamento.</p></div>
 {metas.map(meta => {
  const valor = meta.destinacoes.reduce((s,d) => s + d.valor, 0);
  const precisaRevisao = metaPrecisaRevisao(meta, bens, metas);
  const cenarios = aportes[meta.id] ?? ["", ""];
  return <article className="goal-result" key={meta.id}>
   <div className="goal-result-title"><strong>{meta.nome}</strong><span>{moeda(valor)} de {moeda(meta.valor)}</span><span><button className="remove" aria-label={`Editar meta ${meta.nome}`} onClick={() => editar(meta)}><Pencil size={16}/></button><button className="remove" aria-label={`Excluir meta ${meta.nome}`} onClick={() => { if (window.confirm(`Excluir a meta ${meta.nome}? Os bens não serão excluídos.`)) { onChange(metas.filter(m => m.id !== meta.id)); if (editando === meta.id) limpar(); } }}><Trash2 size={16}/></button></span></div>
   <div className="bar goal-bar"><span style={{width: `${Math.min(100, valor/meta.valor*100)}%`,background:"#709b80"}}/></div>
   <small>{meta.destinacoes.length ? meta.destinacoes.map(d => { const bem = bens.find(b => b.id === d.bemId); return `${bem?.nome ?? "Bem removido"}: ${moeda(d.valor)}`; }).join(" · ") : "Nenhum bem associado ainda. Você pode destinar valores quando desejar."}</small>
   {precisaRevisao && <div className="goal-review" role="alert"><strong>Revise as associações desta meta</strong><ul>{meta.destinacoes.map(d => { const bem = bens.find(b => b.id === d.bemId); if (!bem) return <li key={d.bemId}>Bem removido: {moeda(d.valor)} ainda associados.</li>; const destinado = destinadoAoBem(metas, bem.id); return Math.round(destinado*100) > Math.round(bem.valor*100) ? <li key={d.bemId}>{bem.nome}: {moeda(destinado)} destinados entre metas para um valor atual de {moeda(bem.valor)}.</li> : null; })}</ul><button type="button" className="secondary" onClick={() => editar(meta)}>Revisar meta {meta.nome}</button></div>}
   <div className="scenario-section"><strong>Compare dois cenários de aporte mensal</strong><p>Valores simulados não são salvos e não representam uma movimentação.</p>{precisaRevisao ? <p>Revise as associações antes de calcular o prazo.</p> : valor >= meta.valor ? <p>O valor destinado já alcança a meta.</p> : <div className="scenario-grid">{cenarios.map((texto, i) => { const aporte = Number(texto); const meses = texto !== "" && aporte > 0 ? mesesParaMeta(valor, meta.valor, aporte) : null; return <label key={i}>Cenário {i+1} · aporte mensal (R$)<input aria-label={`Cenário ${i+1} da meta ${meta.nome} (R$)`} type="number" min="0" step="0.01" value={texto} onChange={e => { const copia: [string,string] = [...cenarios]; copia[i] = e.target.value; setAportes({...aportes,[meta.id]:copia}); }}/><span>{meses !== null ? `Aproximadamente ${meses} ${meses === 1 ? "mês" : "meses"}` : "Informe um aporte maior que zero."}</span></label>; })}</div>}<small>{!precisaRevisao && `Faltam ${moeda(Math.max(0, meta.valor - valor))} para a meta, conforme os valores destinados. `}Sem rendimentos, inflação, impostos ou custos; bens podem não ter liquidez.</small></div>
  </article>;
 })}
 <form className="goal-editor" onSubmit={salvar}><h3 ref={editor} tabIndex={-1}>{editando ? `Editar meta: ${nome}` : "Criar uma meta"}</h3><div className="goal-fields"><label>Nome da meta<input value={nome} onChange={e => setNome(e.target.value)} maxLength={80} required/></label><label>Valor desejado (R$)<input type="number" min="0.01" step="0.01" value={alvo} onChange={e => setAlvo(e.target.value)} required/></label></div>
 <fieldset className="goal-allocation"><legend>Valores destinados por bem</legend>{removidos.map(id => <div className="removed-allocation" key={id}><span>Bem removido · {moeda(Number(valores[id]))} associados</span><button type="button" className="secondary" onClick={() => setValores(atuais => { const copia = {...atuais}; delete copia[id]; return copia; })}>Remover associação</button></div>)}{bens.length ? bens.map(b => { const restante = b.valor - destinadoAoBem(metas,b.id,editando ?? undefined); return <label key={b.id}><span>{b.nome}<small>Valor do bem: {moeda(b.valor)} · Disponível para esta meta: {moeda(Math.max(0,restante))}{restante < 0 && " · distribuição excedida"}</small><small>{metas.filter(m => m.id !== editando && m.destinacoes.some(d => d.bemId === b.id)).map(m => `${m.nome}: ${moeda(m.destinacoes.find(d => d.bemId === b.id)!.valor)}`).join(" · ") || "Não destinado a outras metas"}</small></span><input aria-label={`Valor destinado de ${b.nome}`} type="number" min="0" step="0.01" value={valores[b.id] ?? ""} onChange={e => setValores({...valores,[b.id]: e.target.value})} placeholder="R$ 0,00"/></label>; }) : <p>Cadastre um bem primeiro.</p>}</fieldset>
 {erro && <p className="error" role="alert">{erro}</p>}<div className="modal-actions">{editando && <button type="button" className="secondary" onClick={limpar}>Cancelar edição</button>}<button type="submit" className="primary">{editando ? "Salvar alterações" : "Criar meta"}</button></div></form>
 <p className="goal-help">Associar bens é opcional. Valores destinados são fixos até serem alterados. Para liberar saldo, edite a meta que já usa o bem e reduza o valor destinado. Não há movimentação nem reserva real de bens.</p></section>;
}
