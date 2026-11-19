import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const caminhoRecuperacao = "/recuperar-senha";
const naRecuperacao = typeof window !== "undefined" &&
  window.location.pathname.replace(/\/$/, "") === caminhoRecuperacao;

// O SDK consome o fragmento durante a inicialização. Registre o tipo antes de criar o cliente.
const fragmento = new URLSearchParams(naRecuperacao ? window.location.hash.slice(1) : "");
export const linkDeRecuperacao = fragmento.get("type") === "recovery";
export const erroNoLink = fragmento.has("error") || fragmento.has("error_code");
export const supabase = url && key && !naRecuperacao ? createClient(url, key) : null;
// Uma sessão anterior deste navegador não deve substituir o titular do link.
export const authRecuperacao = url && key && naRecuperacao ? createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, storageKey: "nexus-recuperacao" },
}).auth : null;
