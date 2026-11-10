# Preparação para avaliação do Hack Brasil

Atualizado em 9/11/2026. Consulte [regulamento oficial](https://hackbrasil.com/regulamento) e painel do evento antes da submissão.

## Cronograma interno definido pelo responsável

- **Até 20/11/2026:** concluir as melhorias e testes locais de patrimônio, metas e demais partes da aplicação. A versão para avaliação deve estar pronta para publicação.
- **De 20/11 a 28/11/2026:** publicar e validar a aplicação na nuvem, incluindo acesso do júri, dados fictícios e funcionamento dos fluxos. O desenvolvimento de melhorias fica encerrado em 20/11; alterações no código após esse marco ficam restritas à correção de bugs graves. Problemas de infraestrutura ou configuração devem ser tratados nessa janela, respeitando essa restrição para mudanças no código.
- **Até 28/11/2026:** concluir as verificações da aplicação hospedada e preparar a submissão, o vídeo e os links para avaliação. Qualquer correção grave deve ser verificada antes da entrega.
- **Prazo externo registrado:** submissão até 30/11/2026 às 23h59, horário de Brasília. O cronograma interno antecipa a preparação; não substitui o envio formal pelo painel. Reconfirmar datas e exigências no regulamento e no painel do evento.

O regulamento registrado prevê regras adicionais de congelamento do repositório para finalistas após o fim das submissões. Consultar a organização sobre correções urgentes durante esse período.

## Situação

- A aplicação funciona localmente com Supabase em Docker. O projeto Supabase hospedado separado foi criado e recebeu as quatro migrations em 9/11/2026; não recebeu dados pessoais nem cópia do banco local. A aplicação web pública ainda não foi implantada.
- A interface exige login. Preparar uma conta de avaliação isolada com dados fictícios, instruções claras e acesso simples; confirmar com a organização os requisitos de acesso do júri. O vídeo deve ser acessível sem login.
- O repositório precisa permanecer público pelo menos até 15/12. Definir titular e contato na licença proprietária, solicitar revisão jurídica e confirmar sua aceitação pela organização antes da submissão.
- A lista de licenças de dependências e as ressalvas constam em `origem-e-licencas.md`.

## Implantação — sequência

1. Projeto Supabase separado criado pelo titular e vinculado à CLI; nunca reutilizar a base comercial. Não salvar senhas ou chaves privilegiadas no repositório.
2. Quatro migrations aplicadas e verificadas no projeto remoto. Testes SQL transacionais com identidades fictícias confirmaram isolamento de leitura e escrita e do histórico; acesso anônimo às tabelas privadas foi bloqueado. A tabela de exemplos fictícios é pública somente para leitura. Ainda é preciso validar a autenticação e o acesso pela aplicação hospedada.
3. Preparar conta e dados sintéticos para o júri. Não importar a base local de testes do usuário nem arquivos JSON pessoais. Evitar expor privilégios administrativos ou dados de outras contas.
4. Implantar a aplicação HTTPS em hospedagem compatível com o build escolhido. Configurar apenas a URL e chave publicável do Supabase separado; chaves privilegiadas jamais vão para o frontend ou Git. Confirmar que a hospedagem aceita o formato de build.
5. Em janela limpa, testar cadastro/login de demonstração, patrimônio, metas, salvamento, histórico, restauração, logoff, conflitos, erros e responsividade. Manter monitoramento e conta de teste acessíveis durante a avaliação.
6. Preparar vídeo de até 3 minutos acessível sem login, README com instruções reais e links HTTPS, preencher e revisar o painel e enviar até 30/11 às 23h59, Brasília.
7. Para finalistas, respeitar o congelamento do código após o prazo até o início da final em 12/12; manter demo e repositório disponíveis conforme regulamento e confirmar participação até 4/12 às 23h59.

## Verificações registradas

Em 9/11/2026: testes unitários e build passaram; teste automatizado com conta fictícia local cobriu login, salvamento, falhas, conflitos, histórico e logoff. `pnpm audit --prod --audit-level high` não apontou vulnerabilidades conhecidas. Uma varredura de padrões comuns nos arquivos versionáveis não encontrou credenciais; isso não garante ausência de todos os segredos ou problemas de segurança.

Em 9/11/2026, o banco remoto respondeu com quatro bens e duas metas fictícias; a tabela de patrimônio das contas estava vazia. O provedor de e-mail padrão hospedado é limitado; preparar a conta do júri e validar confirmação de cadastro e recuperação antes da submissão.
