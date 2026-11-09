# nexus.club — Hack Brasil

Protótipo web para a trilha 05 — Pagamentos e finanças — do Hack Brasil 2026. A proposta é ajudar pessoas a acompanhar diferentes tipos de patrimônio com uma experiência tranquila, adequada a quem prefere não acompanhar as oscilações diárias do mercado.

**Estado:** protótipo local. Com login, o patrimônio é carregado do Supabase local e as alterações são salvas automaticamente no banco local, com indicador de estado e detecção de conflitos. O banco local mantém até 20 versões confirmadas, acessíveis pelo proprietário em Conta. O acesso à interface exige login; contas novas começam vazias e podem carregar exemplos fictícios na página Conta. Uma cópia JSON pode ser baixada e restaurada diretamente no banco da conta, mediante confirmação. Dados anteriores no navegador são removidos apenas quando idênticos a dados confirmados no banco; outras cópias antigas são preservadas. Não há cotações nem recomendações de investimento.

## Documentação

- [Visão do produto](docs/visao-do-produto.md)
- [Escopo inicial](docs/escopo-mvp.md)
- [Arquitetura proposta](docs/arquitetura.md)
- [Regras e prazos do Hack](docs/regras-hack.md)
- [Origem e licenças](docs/origem-e-licencas.md)
- [Preparação para publicação e avaliação](docs/plano-publicacao-hack.md)
- [Rascunho da submissão](docs/rascunho-submissao-hack.md)
- [Roteiro do vídeo](docs/roteiro-video-hack.md)

## Executar localmente

Pré-requisitos: Node.js 20.9 ou superior e pnpm.

```bash
pnpm install
# Configure o Supabase local conforme docs/plano-dados.md e .env.example.
pnpm dev
```

Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em `.env.local` com os valores do projeto Supabase local. Nunca publique a chave privilegiada ou o arquivo de ambiente. Abra http://localhost:3000. Para verificar os cálculos e compilar para produção, execute `pnpm test` e `pnpm build`. A demo online e o vídeo ainda não foram publicados. A [licença proprietária limitada](LICENSE) é uma minuta pendente de identificação do titular, revisão e confirmação da organização; prevê acesso para avaliação do Hack e reserva os demais direitos.
