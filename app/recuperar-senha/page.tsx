"use client";

import { useEffect, useState, type FormEvent } from "react";
import { authRecuperacao, caminhoRecuperacao, erroNoLink, linkDeRecuperacao } from "../../lib/supabase";

type Etapa = "carregando" | "solicitar" | "redefinir" | "enviado" | "concluido";
const linkInvalido = "Este link expirou ou já foi utilizado. Solicite um novo e-mail abaixo.";

export default function RecuperarSenha() {
  const [etapa, setEtapa] = useState<Etapa>("carregando");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function abrir() {
      if (authRecuperacao && linkDeRecuperacao) {
        const { data, error } = await authRecuperacao.getSession();
        if (!ativo) return;
        if (data.session && !error) {
          setEmail(data.session.user.email ?? "");
          setEtapa("redefinir");
          return;
        }
      }
      if (linkDeRecuperacao || erroNoLink) setAviso(linkInvalido);
      setEtapa("solicitar");
    }
    abrir().catch(() => {
      if (ativo) { setAviso(linkInvalido); setEtapa("solicitar"); }
    });
    return () => { ativo = false; };
  }, []);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!authRecuperacao || ocupado) return;
    setAviso("");
    if (etapa === "redefinir" && senha !== confirmacao) {
      setAviso("As senhas digitadas são diferentes.");
      return;
    }
    setOcupado(true);
    try {
      if (etapa === "solicitar") {
        const { error } = await authRecuperacao.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + caminhoRecuperacao,
        });
        if (error) {
          setAviso(error.status === 429 ? "Limite de envio atingido. Aguarde para tentar novamente." : "Não foi possível solicitar o e-mail. Tente novamente mais tarde.");
        } else {
          setEtapa("enviado");
        }
      } else if (etapa === "redefinir") {
        const { error } = await authRecuperacao.updateUser({ password: senha });
        if (error) {
          setAviso(error.code === "same_password" ? "Escolha uma senha diferente da anterior." : "Não foi possível atualizar a senha. Confira a nova senha ou solicite outro link.");
        } else {
          setSenha(""); setConfirmacao(""); setEtapa("concluido");
          await authRecuperacao.signOut({ scope: "local" });
        }
      }
    } catch {
      setAviso("Falha na conexão com o serviço de autenticação. Tente novamente.");
    } finally {
      setOcupado(false);
    }
  }

  return <main className="login-shell"><div className="login-wrap">
    <div className="login-brand">nexus.club</div>
    <section className="card goal account">
      <h1>{etapa === "redefinir" ? "Escolha sua nova senha" : "Recuperar senha"}</h1>
      {etapa === "carregando" && <p role="status">Verificando o acesso…</p>}
      {etapa === "solicitar" && <form onSubmit={enviar}>
        <label>E-mail cadastrado<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}/></label>
        <button className="primary" disabled={ocupado || !authRecuperacao}>{ocupado ? "Enviando…" : "Enviar link de recuperação"}</button>
      </form>}
      {etapa === "redefinir" && <form onSubmit={enviar}>
        <p>Defina uma nova senha para {email}.</p>
        <label>Nova senha (mínimo de 8 caracteres)<input autoComplete="new-password" type="password" minLength={8} required value={senha} onChange={e => setSenha(e.target.value)}/></label>
        <label>Confirme a nova senha<input autoComplete="new-password" type="password" minLength={8} required value={confirmacao} onChange={e => setConfirmacao(e.target.value)}/></label>
        <button className="primary" disabled={ocupado}>{ocupado ? "Salvando…" : "Salvar nova senha"}</button>
      </form>}
      {etapa === "enviado" && <p role="status">Se o e-mail estiver cadastrado, você receberá um link de recuperação. Confira também a pasta de spam.</p>}
      {etapa === "concluido" && <p role="status">Senha atualizada. Entre com a nova senha.</p>}
      {aviso && <p role="alert" className="account-notice">{aviso}</p>}
      <p><a href="/conta">Voltar para entrar</a></p>
    </section>
  </div></main>;
}
