# Preparação para avaliação do Hack Brasil

Atualizado em 18/11/2026. Consulte o [regulamento oficial](https://hackbrasil.com/regulamento) e o painel do evento antes da submissão.

## Cronograma interno definido pelo responsável

- **Até 20/11/2026:** concluir as melhorias e testes locais de patrimônio, metas e demais partes da aplicação. A versão para avaliação deve estar pronta para publicação.
- **De 20/11 a 28/11/2026:** publicar e validar a aplicação na nuvem, incluindo acesso do júri, dados fictícios e funcionamento dos fluxos. O desenvolvimento de melhorias fica encerrado em 20/11; alterações no código após esse marco ficam restritas à correção de bugs graves. Problemas de infraestrutura ou configuração devem ser tratados nessa janela, respeitando essa restrição para mudanças no código.
- **Até 28/11/2026:** concluir as verificações da aplicação hospedada e preparar a submissão, o vídeo e os links para avaliação. Qualquer correção grave deve ser verificada antes da entrega.
- **Prazo externo registrado:** submissão até 30/11/2026 às 23h59, horário de Brasília. O cronograma interno antecipa a preparação; não substitui o envio formal pelo painel. Reconfirmar datas e exigências no regulamento e no painel do evento.

O regulamento registrado prevê regras adicionais de congelamento do repositório para finalistas após o fim das submissões. Consultar a organização sobre correções urgentes durante esse período.

## Situação

- Em 18/11, a aplicação foi publicada na ShardCloud a partir do ZIP do commit `ca09de6` da `main`. O painel não estava conectado ao GitHub. A demo passou pelo teste de login, edição, recarga e simulação de meta em uma sessão de navegador separada. [Abrir a demo](https://nexushackbrasil.shardweb.app)
- A aplicação funciona localmente com Supabase em Docker. O projeto Supabase hospedado separado foi criado e recebeu as quatro migrations em 9/11/2026; não recebeu dados pessoais nem cópia do banco local. O projeto foi reativado em 18/11 e a API respondeu com os exemplos fictícios.
- A interface exige login. A conta isolada de avaliação foi preparada com quatro bens e duas metas fictícias. Entregar as instruções de acesso ao júri pelo canal da avaliação. O vídeo deve ser acessível sem login.
- O repositório precisa permanecer público pelo menos até 15/12. Definir titular e contato na licença proprietária, solicitar revisão jurídica e confirmar sua aceitação pela organização antes da submissão.
- A lista de licenças de dependências e as ressalvas constam em `origem-e-licencas.md`.

## Implantação — sequência

1. Projeto Supabase separado criado pelo titular e vinculado à CLI; nunca reutilizar a base comercial. Não salvar senhas ou chaves privilegiadas no repositório.
2. Quatro migrations aplicadas e verificadas no projeto remoto. Testes SQL transacionais com identidades fictícias confirmaram isolamento de leitura e escrita e do histórico; acesso anônimo às tabelas privadas foi bloqueado. A tabela de exemplos fictícios é pública somente para leitura. A aplicação hospedada foi testada com uma conta fictícia em 18/11.
3. Preparar conta e dados sintéticos para o júri. Não importar a base local de testes do usuário nem arquivos JSON pessoais. Evitar expor privilégios administrativos ou dados de outras contas.
4. Implantar a aplicação HTTPS em hospedagem compatível com o build escolhido. Configurar apenas a URL e chave publicável do Supabase separado; chaves privilegiadas jamais vão para o frontend ou Git. Confirmar que a hospedagem aceita o formato de build.
5. Em janela limpa, testar cadastro/login de demonstração, patrimônio, metas, salvamento, histórico, restauração, logoff, conflitos, erros e responsividade. Manter monitoramento e conta de teste acessíveis durante a avaliação.
6. Preparar vídeo de até 3 minutos acessível sem login, README com instruções reais e links HTTPS, preencher e revisar o painel e enviar até 30/11 às 23h59, Brasília.
7. Para finalistas, respeitar o congelamento do código após o prazo até o início da final em 12/12; manter demo e repositório disponíveis conforme regulamento e confirmar participação até 4/12 às 23h59.

### Publicar o Next.js na ShardCloud

1. No painel da ShardCloud, escolha **Basic, 2 GB, cobrança mensal** para uma aplicação Node.js. O plano custa R$ 11,90 por mês na [tabela consultada em 18/11](https://shardcloud.app/pt-br/pricing). O projeto existente em supabase.com fornece o banco, o login e a API. O subdomínio HTTPS da hospedagem atende à demonstração.
2. Em **Config → Integrations**, conecte o GitHub e selecione o repositório `prdmarcelino/nexus-hack-brasil`. Na aplicação, abra **Deploys** e escolha a branch `main` e a raiz do repositório. [Guia de integração](https://docs.shardcloud.app/tutorials/platform/git-integration)
3. Nas variáveis da aplicação, configure `NEXT_PUBLIC_SUPABASE_URL` com a URL do projeto do Hack e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com a **chave publicável** desse mesmo projeto. Salve antes de compilar. Se a primeira compilação começou antes da configuração, solicite um novo deploy para incorporar os valores ao frontend.
4. A configuração em `.shardcloud` solicita 2 GB, instala as dependências do lockfile, compila a aplicação e inicia o Next.js na porta 80. Verifique nos logs o fim do build e a inicialização do servidor. O subdomínio solicitado é `nexushackbrasil`. Use a URL HTTPS efetivamente atribuída pelo painel. [Guia de Next.js](https://docs.shardcloud.app/tutorials/website/nextjs)
5. No Supabase do Hack, ajuste **Authentication → URL Configuration → Site URL** para essa URL. Abra-a em janela anônima, entre com a conta fictícia do júri e confira se os exemplos carregam. Altere um bem fictício, aguarde a confirmação do salvamento e recarregue a tela. Registre o link no rascunho de submissão depois da validação.

## Verificações registradas

### 18 de novembro de 2026

- Na URL pública, o teste autenticou a conta fictícia, carregou os exemplos, alterou uma avaliação, confirmou o salvamento e verificou os centavos após recarga. Ao final, repôs os exemplos e conferiu o total de R$ 645.000,00 e a simulação de 36 meses. A URL de retorno do Supabase Auth foi ajustada para o domínio HTTPS da demo.

- Os 16 testes unitários passaram. A validação de bens, metas e cópias JSON passou a aceitar avaliações como R$ 10.000.000,12 e a recusar frações de centavo. O build de produção concluiu a compilação e a verificação de tipos. A auditoria das dependências de produção retornou sem alertas conhecidos.
- O comando `pnpm test:fluxo` passou no Edge com o build de produção e um banco Supabase local isolado. Cobriu login, salvamento e recarga, nova tentativa após queda de conexão, perda da resposta após gravação, saída e novo login, restauração do histórico, atualização entre abas e conflito entre sessões.
- Na janela de 390 px, o teste carregou o exemplo fictício e conferiu R$ 645.000,00 de patrimônio, dos quais R$ 132.000,00 destinados às metas. Uma avaliação de R$ 10.000.000,12 persistiu após recarga. Para os R$ 18.000,00 restantes na meta de reserva, os aportes simulados de R$ 500,00 e R$ 1.000,00 resultaram em 36 e 18 meses. Ao final, o teste restaurou a cópia JSON baixada antes de carregar o exemplo e confirmou a recuperação de um bem após recarga.

### 9 de novembro de 2026

Em 9/11/2026: testes unitários e build passaram; teste automatizado com conta fictícia local cobriu login, salvamento, falhas, conflitos, histórico e logoff. `pnpm audit --prod --audit-level high` não apontou vulnerabilidades conhecidas. Uma varredura de padrões comuns nos arquivos versionáveis não encontrou credenciais; isso não garante ausência de todos os segredos ou problemas de segurança.

Em 9/11/2026, o banco remoto respondeu com quatro bens e duas metas fictícias; a tabela de patrimônio das contas estava vazia. O provedor de e-mail padrão hospedado é limitado; preparar a conta do júri e validar confirmação de cadastro e recuperação antes da submissão.
