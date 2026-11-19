# nexus.club — Hack Brasil

Protótipo web para a trilha 05 — Pagamentos e finanças — do Hack Brasil 2026. A proposta é ajudar pessoas a acompanhar diferentes tipos de patrimônio com uma experiência tranquila, adequada a quem prefere não acompanhar as oscilações diárias do mercado.

[Abrir a demonstração do nexus.club](https://usenexus.shardweb.app)

A aplicação está publicada na ShardCloud e usa o projeto Supabase do Hack para login e dados. O ambiente de desenvolvimento usa o Supabase local. As alterações são salvas automaticamente na conta, com indicador de estado e detecção de conflitos. O banco mantém até 20 versões confirmadas, acessíveis pelo proprietário em Conta. O acesso à interface exige login; contas novas começam vazias e podem carregar exemplos fictícios na página Conta. Uma cópia JSON pode ser baixada e restaurada diretamente no banco da conta, mediante confirmação. Dados anteriores no navegador são removidos apenas quando idênticos a dados confirmados no banco; outras cópias antigas são preservadas. Não há cotações nem recomendações de investimento.

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

Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em `.env.local` com os valores do projeto Supabase local. Nunca publique a chave privilegiada ou o arquivo de ambiente. Abra http://localhost:3000. Para verificar os cálculos e compilar para produção, execute `pnpm test` e `pnpm build`. O vídeo de apresentação está pendente. A [licença proprietária limitada](LICENSE) é uma minuta pendente de identificação do titular, revisão e confirmação da organização; prevê acesso para avaliação do Hack e reserva os demais direitos.

## Testar o percurso da demonstração

Com as migrations aplicadas, execute `pnpm build` e `pnpm start` apontando para o Supabase local de teste. Em outro terminal, configure `TEST_URL` e `TEST_KEY` com a URL e a chave publicável desse mesmo banco. Com a aplicação em `http://localhost:3000`, execute `pnpm test:fluxo`.

O teste cria uma conta fictícia com endereço único no banco local. A configuração local deve permitir cadastro sem confirmação de e-mail. No Windows o teste usa o Microsoft Edge instalado. Em outros sistemas, instale o navegador do Playwright com `pnpm exec playwright install chromium`.
