"use client";
import { useEffect, useState } from "react";
import { useDados } from "./DadosProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Check, CircleHelp, Download, Eye, EyeOff, House, Leaf, UserRound, Pencil, Plus, RotateCcw, ShieldCheck, Sparkles, Trash2, Wallet, X } from "lucide-react";
import { Bem, Categoria, categorias, exemplo, moeda, porCategoria, total, atualizarBem, ultimaVariacao, avaliacaoAntiga } from "../lib/patrimonio";

import Metas from "./Metas";
import Conta from "./Conta";
import Historico from "./Historico";
import { supabase } from "../lib/supabase";
import { lerBackup } from "../lib/backup";
import { Meta, destinadoAoBem, metasExemplo } from "../lib/metas";

const cores = ["#477a72", "#b1c2a0", "#caa77e", "#9caaba", "#d6c8b6"];
export default function Home() {
 const caminho = usePathname();
 const inicio = caminho === "/";
 const patrimonio = caminho === "/patrimonio";
 const metasAtivas = caminho === "/metas";
 const contaAtiva = caminho === "/conta";
 const { bens, metas, tranquila, setBens, setMetas, setTranquila, sessao, pronto: carregado, erroDados, alterado, visitanteAlterado, temRegistro, estado, tentarNovamente, revisaoLegado } = useDados();
 const emailConta = sessao?.user.email ?? null;
 const usuarioId = sessao?.user.id ?? null;
 const [temDadosAnteriores, setTemDadosAnteriores] = useState(false);
 const [hojeLocal, setHojeLocal] = useState<string | null>(null);
 useEffect(() => { const agora = new Date(); setHojeLocal(`${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,"0")}-${String(agora.getDate()).padStart(2,"0")}`); }, []);
 const [saindo, setSaindo] = useState(false);
 const [erroSaida, setErroSaida] = useState("");
 async function sairPeloMenu() {
  if (!supabase || saindo) return;
  if (estado === "salvando") { setErroSaida("Aguarde o salvamento terminar antes de sair."); return; }
  if (alterado) { setErroSaida("Há alterações pendentes. Aguarde o salvamento ou baixe uma cópia em Conta antes de sair."); return; }
  setSaindo(true); setErroSaida("");
  try { const { error } = await supabase.auth.signOut(); if (error) setErroSaida("Não foi possível sair. Tente novamente."); }
  catch { setErroSaida("Não foi possível sair. Tente novamente."); }
  finally { setSaindo(false); }
 }
 const [erroBackup, setErroBackup] = useState("");
 const [restauracaoAberta, setRestauracaoAberta] = useState(false);
 const [confirmacaoRestauracao, setConfirmacaoRestauracao] = useState("");
 const [restaurando, setRestaurando] = useState(false);
 const [erroRestauracao, setErroRestauracao] = useState("");
 const [aberto, setAberto] = useState(false);
 const [editando, setEditando] = useState<string | null>(null);
 const [bemParaExcluir, setBemParaExcluir] = useState<Bem | null>(null);
 const [nome, setNome] = useState("");
 const [categoria, setCategoria] = useState<Categoria>("Investimentos");
 const [valor, setValor] = useState("");
 const [data, setData] = useState("");
 const [erro, setErro] = useState("");
 useEffect(() => {
  try { setTemDadosAnteriores(Boolean((usuarioId && localStorage.getItem(`nexus-conta-v1:${usuarioId}`)) || localStorage.getItem("nexus-demo-v1"))); } catch { setTemDadosAnteriores(false); }
 }, [usuarioId, revisaoLegado]);
 function recuperarDadosAnteriores() {
  try {
   const texto = (usuarioId && localStorage.getItem(`nexus-conta-v1:${usuarioId}`)) || localStorage.getItem("nexus-demo-v1");
   if (!texto) { setErroBackup("Não há dados anteriores neste navegador."); return; }
   const dados = lerBackup(JSON.stringify({formato:"nexus-club-backup",versao:1,dados:JSON.parse(texto)}));
   if (!window.confirm(`Recuperar ${dados.bens.length} bens e ${dados.metas.length} metas de uma versão anterior neste espaço? Os dados atuais em exibição serão substituídos e salvos automaticamente na conta.`)) return;
   setBens(dados.bens); setMetas(dados.metas); setTranquila(dados.tranquila); setErroBackup("");
  } catch { setErroBackup("Não foi possível validar os dados anteriores. Nada foi alterado."); }
 }
 const grupos = porCategoria(bens); const soma = total(bens);
 function adicionar(e: React.FormEvent) {
  e.preventDefault(); const quantia = Number(valor);
  if (!nome.trim() || !Number.isFinite(quantia) || quantia <= 0 || !data) { setErro("Preencha o nome, uma data e um valor maior que zero."); return; }
  const bem = { id: editando ?? crypto.randomUUID(), nome: nome.trim(), categoria, valor: Math.round(quantia * 100) / 100, data };
  if (editando && Math.round(destinadoAoBem(metas, editando) * 100) > Math.round(bem.valor * 100) && !window.confirm("O novo valor é menor que o total destinado às metas. A distribuição ficará excedida até você revisá-la. Deseja continuar?")) return;
  setBens(editando ? bens.map(item => item.id === editando ? atualizarBem(item, bem) : item) : [...bens, bem]);
  fechar();
 }
 function fechar() { setNome(""); setValor(""); setData(""); setCategoria("Investimentos"); setErro(""); setEditando(null); setAberto(false); }
 function editar(bem: Bem) { setNome(bem.nome); setCategoria(bem.categoria); setValor(String(bem.valor)); setData(bem.data); setEditando(bem.id); setErro(""); setAberto(true); }
 function exportarBackup() {
  try {
   const dados = { formato: "nexus-club-backup", versao: 1, criadoEm: new Date().toISOString(), dados: { bens, tranquila, metas } };
   const arquivo = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
   const url = URL.createObjectURL(arquivo); const link = document.createElement("a");
   link.href = url; link.download = `nexus-club-backup-${new Date().toISOString().slice(0,10)}.json`;
   document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); setErroBackup("");
  } catch { setErroBackup("Não foi possível criar o arquivo. Seus dados no navegador não foram alterados."); }
 }
 async function importarBackup(e: React.ChangeEvent<HTMLInputElement>) {
  const input = e.currentTarget; const arquivo = input.files?.[0];
  if (!arquivo) return;
  try {
   if (arquivo.size > 5 * 1024 * 1024) throw new Error("O arquivo ultrapassa o limite de 5 MB.");
   const dados = lerBackup(await arquivo.text());
   if (!sessao) throw new Error("Entre na conta antes de restaurar a cópia no banco.");
   if (window.confirm(`Restaurar ${dados.bens.length} bens e ${dados.metas.length} metas diretamente no banco desta conta? Os dados existentes na conta serão substituídos. Confirme se esta é a conta correta.`)) {
    setBens(dados.bens); setMetas(dados.metas); setTranquila(dados.tranquila); setErroBackup("");
   }
  } catch (erro) { setErroBackup(erro instanceof Error ? erro.message : "Não foi possível ler a cópia. Seus dados não foram alterados."); }
  finally { input.value = ""; }
 }
 function fecharRestauracao() { if (restaurando) return; setRestauracaoAberta(false); setConfirmacaoRestauracao(""); setErroRestauracao(""); }
 async function restaurar() {
  if (!sessao || confirmacaoRestauracao !== "EXCLUIR" || restaurando) return;
  if (!supabase) { setErroRestauracao("O banco de exemplos não está configurado. Seus dados não foram alterados."); return; }
  setRestaurando(true); setErroRestauracao("");
  try {
   const {data,error} = await supabase.from("exemplo_publico").select("bens,metas").eq("id","principal").single();
   if (error || !data) throw new Error("Não foi possível carregar os exemplos do banco. Seus dados não foram alterados.");
   const dados = lerBackup(JSON.stringify({formato:"nexus-club-backup",versao:1,dados:{bens:data.bens,metas:data.metas,tranquila:true}}));
   setBens(dados.bens); setMetas(dados.metas); setTranquila(true); setErroBackup(""); setRestauracaoAberta(false); setConfirmacaoRestauracao("");
  } catch { setErroRestauracao("Não foi possível carregar e validar os exemplos. Seus dados não foram alterados."); }
  finally { setRestaurando(false); }
 }
 function confirmarExclusao() {
  if (!bemParaExcluir) return;
  setBens(atuais => atuais.filter(item => item.id !== bemParaExcluir.id));
  setBemParaExcluir(null);
 }
 const metasAfetadas = bemParaExcluir ? metas.filter(meta => meta.destinacoes.some(destino => destino.bemId === bemParaExcluir.id)) : [];
 if (saindo) return <main className="session-loading" role="status">Encerrando sessão...</main>;
 if (!carregado) return <main className="session-loading" role="status">Preparando seu espaço...</main>;
 if (erroDados) return <main className="session-loading" role="alert">{erroDados} Recarregue a página para tentar novamente.</main>;
 if (!sessao) return <main className="login-shell"><div className="login-wrap"><div className="login-brand"><span className="brand-icon"><Leaf size={20}/></span><span>nexus.club</span></div><p className="login-eyebrow">SEU PATRIMÔNIO, COM CALMA</p><Conta visitanteAlterado={false} aoSair={sairPeloMenu} saindo={saindo} erroSaida={erroSaida}/></div></main>;
 return <main className="shell">
  <aside className="sidebar"><div className="brand"><span className="brand-icon"><Leaf size={20}/></span><span>nexus.club<small>SEU PATRIMÔNIO, COM CALMA</small></span></div>
   <div className="side-label">SEU ESPAÇO</div><nav className="navigation" aria-label="Menu principal"><Link className={`nav-item ${inicio ? "active" : ""}`} href="/"><House size={18}/> Visão geral</Link><Link className={`nav-item ${patrimonio ? "active" : ""}`} href="/patrimonio"><Wallet size={18}/> Patrimônio</Link><Link className={`nav-item ${metasAtivas ? "active" : ""}`} href="/metas"><Sparkles size={18}/> Metas</Link><Link className={`nav-item ${contaAtiva ? "active" : ""}`} href="/conta"><UserRound size={18}/> Conta</Link></nav><div className="sidebar-bottom"><span className="mini-icon"><ShieldCheck size={17}/></span><div className="sidebar-account">{emailConta ? <><span>Conta conectada</span><small title={emailConta}>{emailConta}</small><button type="button" className="sidebar-signout" onClick={sairPeloMenu} disabled={saindo}>{saindo ? "Saindo..." : "Sair"}</button>{erroSaida && <small className="sidebar-error" role="alert">{erroSaida}</small>}</> : <><span>Modo visitante</span><small>Acesse sua conta pelo menu</small></>}</div></div>
  </aside>
  <section className="main"><nav className="mobile-nav" aria-label="Menu principal"><Link href="/" aria-current={inicio ? "page" : undefined}>Visão geral</Link><Link href="/patrimonio" aria-current={patrimonio ? "page" : undefined}>Patrimônio</Link><Link href="/metas" aria-current={metasAtivas ? "page" : undefined}>Metas</Link><Link href="/conta" aria-current={contaAtiva ? "page" : undefined}>Conta</Link></nav><header className="topbar"><span>{inicio ? "VISÃO GERAL" : patrimonio ? "PATRIMÔNIO" : metasAtivas ? "METAS" : "CONTA"} <span className="top-slash">/</span> SEU ESPAÇO</span><span className="top-right"><span className="status-dot"/> DEMONSTRAÇÃO</span></header>
   <div className="content"><div className="intro"><div><div className="eyebrow"><span/> {inicio ? "UM OLHAR PARA O QUE IMPORTA" : patrimonio ? "SEU PATRIMÔNIO" : metasAtivas ? "SEUS OBJETIVOS" : "SEU ACESSO"}</div><h1>{inicio ? <>Seu patrimônio,<br/><em>no seu tempo.</em></> : patrimonio ? <>Tudo o que você<br/><em>construiu.</em></> : metasAtivas ? <>Seus planos,<br/><em>no seu ritmo.</em></> : <>Sua conta,<br/><em>seu espaço.</em></>}</h1><p>{inicio ? "Mais clareza para enxergar tudo o que você construiu." : patrimonio ? "Organize os bens e direitos que fazem parte da sua história." : metasAtivas ? "Organize seus objetivos e os valores destinados a cada um." : "Acesse sua conta e acompanhe o salvamento dos dados."}</p></div>{patrimonio && <button className="primary" onClick={() => setAberto(true)}><Plus size={17}/> Adicionar patrimônio</button>}</div>
   <div className={`demo-note sync-note ${estado === "erro" || estado === "conflito" ? "sync-problem" : estado === "salvando" || alterado ? "sync-pending" : "sync-ok"}`} role="status" aria-live="polite"><CircleHelp size={16}/><span>{estado === "conflito" ? "Conflito: seus dados ainda não foram salvos. Faça uma cópia antes de recarregar." : estado === "erro" ? "Falha ao salvar. Seus dados continuam nesta tela, mas ainda não foram confirmados no banco." : estado === "salvando" ? "Salvando alterações no banco..." : alterado ? "Alterações aguardando salvamento..." : temRegistro ? "Dados salvos no banco local." : "Conta nova: ainda não há dados salvos."}</span><div className="sync-actions">{estado === "erro" && <button onClick={tentarNovamente}>Tentar novamente</button>}{(estado === "erro" || estado === "conflito") && <Link href="/conta">Baixar cópia</Link>}</div></div>
   {contaAtiva && <><div className="backup-panel"><div><strong>Cópia de segurança</strong><small>Baixe um arquivo para guardar seus bens e metas. Ele contém as informações exibidas neste navegador; guarde-o em local seguro.</small>{erroBackup && <small className="error" role="alert">{erroBackup}</small>}</div><div className="backup-actions"><button className="secondary backup-button" onClick={exportarBackup} disabled={!carregado}><Download size={15}/> Baixar cópia de segurança</button><label className="secondary backup-button backup-import">Restaurar cópia<input type="file" accept=".json,application/json" onChange={importarBackup} disabled={!carregado}/></label>{usuarioId && temDadosAnteriores && <button className="secondary backup-button" onClick={recuperarDadosAnteriores}>Recuperar dados da versão anterior</button>}</div></div>{sessao && <section className="restore-example-panel"><div><strong>Restaurar dados de exemplo</strong><small>Substitui os bens e metas da conta pelos dados fictícios. As alterações são salvas automaticamente.</small></div><button className="restore-example-button" onClick={() => setRestauracaoAberta(true)} disabled={!carregado}><RotateCcw size={15}/> Substituir dados exibidos por exemplo</button></section>}</>}
   {erroBackup && !contaAtiva && <p className="error" role="alert">{erroBackup}</p>}
   {inicio && <><div className="grid"><section className="hero card"><div className="card-top"><span className="section-label">PATRIMÔNIO CADASTRADO</span><span className="soft-icon"><Wallet size={17}/></span></div><div className="hero-value">{moeda(soma)}</div><p className="hero-caption">A soma dos valores informados por você.</p><div className="hero-divider"/><div className="hero-bottom"><span className="round-check"><Check size={14}/></span><span>Uma visão do seu patrimônio <strong>em um só lugar.</strong></span></div><span className="hero-decoration"/></section>
   <section className="calm card"><div className="card-top"><span className="section-label">DO SEU JEITO</span><span className="calm-icon"><Leaf size={17}/></span></div><h2>Menos ruído.<br/><em>Mais tranquilidade.</em></h2><p>Escolha se deseja ver a diferença entre os valores que você registrou em cada avaliação.</p><button className="toggle-row" onClick={() => setTranquila(!tranquila)} aria-pressed={tranquila}><span className="toggle-text">{tranquila ? <EyeOff size={17}/> : <Eye size={17}/>} Visão tranquila <small>{tranquila ? "Ativada" : "Desativada"}</small></span><span className={`switch ${tranquila ? "on" : ""}`}><i/></span></button></section></div><div className="dashboard-links"><Link href="/patrimonio" className="summary-link"><span><strong>Meu patrimônio</strong><small>{bens.length} itens cadastrados</small></span><ArrowUpRight size={19}/></Link><Link href="/metas" className="summary-link"><span><strong>Minhas metas</strong><small>{metas.length} {metas.length === 1 ? "meta cadastrada" : "metas cadastradas"}</small></span><ArrowUpRight size={19}/></Link></div></>}
   {patrimonio && <><div className="lower-heading"><div><div className="eyebrow"><span/> UMA VISÃO COMPLETA</div><h2>O que você construiu</h2><p>Os valores são informados por você e podem precisar de revisão com o tempo.</p></div><span className="count">{bens.length} {bens.length === 1 ? "item cadastrado" : "itens cadastrados"}</span></div>
   <div className="lower-grid"><section className="card assets"><div className="list-head"><span>SEUS BENS E DIREITOS</span><span>VALOR INFORMADO</span></div>{bens.length === 0 ? <p className="empty">Nenhum bem cadastrado. Adicione o primeiro para começar.</p> : bens.map((bem, i) => <div className="asset" key={bem.id}><span className="asset-icon" style={{ background: ["#e7f0eb", "#f2eadf", "#e9edf1", "#f2ece5"][i % 4] }}>{bem.categoria === "Imóveis" ? <House size={18}/> : <Wallet size={18}/>}</span><div className="asset-name"><strong>{bem.nome}</strong><small>{bem.categoria} · Avaliado em {new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(bem.data + "T00:00:00Z"))}</small>{hojeLocal && avaliacaoAntiga(bem.data, hojeLocal) && <small className="valuation-age">Avaliação informada há pelo menos 12 meses</small>}</div><div className="asset-value">{moeda(bem.valor)}<small>Valor informado</small>{!tranquila && ultimaVariacao(bem) && <small className="variation">{ultimaVariacao(bem)!.diferenca >= 0 ? "+" : "−"}{moeda(Math.abs(ultimaVariacao(bem)!.diferenca))} desde {new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(ultimaVariacao(bem)!.anterior.data + "T00:00:00Z"))}</small>}</div><button className="remove" onClick={() => editar(bem)} aria-label={`Editar ${bem.nome}`}><Pencil size={16}/></button><button className="remove" onClick={() => setBemParaExcluir(bem)} aria-label={`Remover ${bem.nome}`}><Trash2 size={16}/></button></div>)}{!tranquila && bens.filter(b => (b.historico?.length ?? 0) > 0).length > 0 && <div className="history"><div className="section-label">HISTÓRICO DE AVALIAÇÕES INFORMADAS</div>{bens.filter(b => (b.historico?.length ?? 0) > 0).map(bem => <details key={bem.id}><summary>{bem.nome}<span>{bem.historico!.length + 1} avaliações</span></summary><div className="history-list">{[{valor:bem.valor,data:bem.data}, ...[...bem.historico!].reverse()].map((avaliacao, index) => <div key={`${bem.id}-${index}`}><span>{index === 0 ? "Atual · " : "Anterior · "}{new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(avaliacao.data + "T00:00:00Z"))}</span><strong>{moeda(avaliacao.valor)}</strong></div>)}</div></details>)}<p>Valores informados manualmente, apresentados na ordem de registro. Alterações podem refletir correções, não apenas variações de mercado.</p></div>}<div className="list-foot"><button onClick={() => setAberto(true)}><Plus size={15}/> Adicionar outro item</button></div></section>
   <section className="card composition"><div className="section-label">COMPOSIÇÃO</div><h3>Seu patrimônio<br/><em>por categoria.</em></h3><div className="bar" aria-label="Composição por categoria">{grupos.map((g, i) => <span key={g.categoria} style={{width: `${g.valor / soma * 100}%`, background: cores[categorias.indexOf(g.categoria)]}}/>)}</div><div className="legend">{grupos.length === 0 ? <p>Adicione um item para ver a composição.</p> : grupos.map(g => <div key={g.categoria}><span><i style={{background: cores[categorias.indexOf(g.categoria)]}}/>{g.categoria}</span><strong>{(g.valor / soma * 100).toFixed(0)}%</strong></div>)}</div></section></div></>}
   {metasAtivas && <Metas bens={bens} metas={metas} onChange={setMetas}/>}
   {contaAtiva && <><Conta visitanteAlterado={visitanteAlterado} aoSair={sairPeloMenu} saindo={saindo} erroSaida={erroSaida}/><Historico/></>}
   {inicio && <div className="footer-note"><Sparkles size={15}/> <span>{tranquila ? "Visão tranquila ativada: aqui, as oscilações diárias não estão em destaque." : "Visão tranquila desativada: mostramos a diferença para a avaliação anterior registrada, quando disponível. Não há cotações automáticas."}</span></div>}<footer>Construído para acompanhar o que importa. <span>NEXUS.CLUB · DEMONSTRAÇÃO</span></footer>
   </div></section>
   {restauracaoAberta && sessao && <div className="overlay" onClick={fecharRestauracao} onKeyDown={evento => { if (evento.key === "Escape") fecharRestauracao(); }}><div className="modal delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="restaurar-titulo" aria-describedby="restaurar-descricao" onClick={evento => evento.stopPropagation()}><div className="modal-title"><h2 id="restaurar-titulo">Restaurar dados de exemplo?</h2><button className="icon-button" onClick={fecharRestauracao} disabled={restaurando} aria-label="Fechar"><X size={20}/></button></div><p id="restaurar-descricao">Os bens e as metas da conta serão substituídos pelos dados fictícios e salvos automaticamente. Sua cópia de segurança baixada não será alterada.</p><div className="delete-warning">Para continuar, digite <strong>EXCLUIR</strong>. Se ainda precisar dos dados atuais, baixe uma cópia de segurança antes.</div><label className="restore-confirm-label">Digite EXCLUIR<input autoFocus value={confirmacaoRestauracao} onChange={evento => setConfirmacaoRestauracao(evento.target.value)} autoComplete="off" disabled={restaurando}/></label>{erroRestauracao && <p className="error" role="alert">{erroRestauracao}</p>}<div className="modal-actions"><button className="secondary" onClick={fecharRestauracao} disabled={restaurando}>Cancelar</button><button className="danger-button" onClick={restaurar} disabled={confirmacaoRestauracao !== "EXCLUIR" || restaurando}>{restaurando ? "Restaurando..." : "Apagar e restaurar exemplo"}</button></div></div></div>}
   {bemParaExcluir && <div className="overlay" onClick={() => setBemParaExcluir(null)} onKeyDown={evento => { if (evento.key === "Escape") setBemParaExcluir(null); }}><div className="modal delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="excluir-titulo" aria-describedby="excluir-descricao" onClick={evento => evento.stopPropagation()}><div className="modal-title"><h2 id="excluir-titulo">Excluir patrimônio?</h2><button className="icon-button" onClick={() => setBemParaExcluir(null)} aria-label="Fechar"><X size={20}/></button></div><p id="excluir-descricao">Você está prestes a excluir <strong>{bemParaExcluir.nome}</strong>. Esta ação remove o item e a alteração será salva automaticamente na conta.</p>{metasAfetadas.length > 0 ? <div className="delete-warning"><strong>Este patrimônio está associado {metasAfetadas.length === 1 ? "à seguinte meta" : "às seguintes metas"}:</strong><ul>{metasAfetadas.map(meta => <li key={meta.id}>{meta.nome} — {moeda(meta.destinacoes.filter(d => d.bemId === bemParaExcluir.id).reduce((soma,d) => soma + d.valor,0))} destinados</li>)}</ul><p>Se continuar, as metas permanecerão, mas precisarão ser revisadas. Para manter a associação, cancele e edite as metas primeiro.</p></div> : <p>Este item não está associado a metas.</p>}<div className="modal-actions"><button className="secondary" autoFocus onClick={() => setBemParaExcluir(null)}>Cancelar</button><button className="danger-button" onClick={confirmarExclusao}>Excluir patrimônio</button></div></div></div>}
   {aberto && <div className="overlay" onClick={fechar}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()}><div className="modal-title"><div><div className="eyebrow"><span/> SEU PATRIMÔNIO</div><h2 id="modal-title">{editando ? "Editar item" : "Adicionar item"}</h2></div><button className="icon-button" onClick={fechar} aria-label="Fechar"><X size={20}/></button></div><p>Adicione um bem ou direito usando valores fictícios.</p><form onSubmit={adicionar}><label>Nome<input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Apartamento" maxLength={80} required/></label><label>Categoria<select value={categoria} onChange={e => setCategoria(e.target.value as Categoria)}>{categorias.map(c => <option key={c}>{c}</option>)}</select></label><label>Valor estimado (R$)<input type="number" min="0.01" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" required/></label><p className="valuation-hint">Ao alterar valor ou data, a avaliação anterior fica registrada. Informe valores e datas fictícios.</p><label>Data da avaliação<input type="date" value={data} onChange={e => setData(e.target.value)} required/></label>{erro && <p className="error" role="alert">{erro}</p>}<div className="modal-actions"><button type="button" className="secondary" onClick={fechar}>Cancelar</button><button className="primary" type="submit">{editando ? "Salvar alterações" : "Adicionar item"} <ArrowUpRight size={16}/></button></div></form></div></div>}
 </main>;
}
