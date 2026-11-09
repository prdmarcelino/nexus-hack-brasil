import type { Metadata } from "next";
import "./globals.css";
import { DadosProvider } from "./DadosProvider";

export const metadata: Metadata = { title: "nexus.club | Seu patrimônio, com calma", description: "Uma forma tranquila de acompanhar seu patrimônio." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><DadosProvider>{children}</DadosProvider></body></html>;
}
