# Preparação para avaliação do Hack Brasil

Atualizado em 9/11/2026. Consulte [regulamento oficial](https://hackbrasil.com/regulamento) e painel do evento antes da submissão.

## Situação

- A aplicação funciona localmente com Supabase em Docker. Uma demo pública e um Supabase hospedado separados ainda precisam ser configurados; não enviar dados pessoais ou o banco local real para a demo.
- A interface exige login. Preparar uma conta de avaliação isolada com dados fictícios, instruções claras e acesso simples; confirmar com a organização os requisitos de acesso do júri. O vídeo deve ser acessível sem login.
- O repositório precisa permanecer público pelo menos até 15/12. Definir titular e contato na licença proprietária, solicitar revisão jurídica e confirmar sua aceitação pela organização antes da submissão.
- A lista de licenças de dependências e as ressalvas constam em `origem-e-licencas.md`.

## Implantação — sequência

1. Criar projeto Supabase separado, em organização e plano escolhidos pelo titular; nunca reutilizar a base comercial. Anotar o identificador do projeto, sem salvar senhas ou chaves privilegiadas no repositório.
2. Configurar autenticação e aplicar as migrations versionadas ao projeto correto, após conferir o destino. Testar isolamento de duas contas e negar acesso anônimo aos dados privados; validar políticas e restrições do histórico. A tabela de exemplos fictícios é pública somente para leitura.
3. Preparar conta e dados sintéticos para o júri. Não importar a base local de testes do usuário nem arquivos JSON pessoais. Evitar expor privilégios administrativos ou dados de outras contas.
4. Implantar a aplicação HTTPS em hospedagem compatível com o build escolhido. Configurar apenas a URL e chave publicável do Supabase separado; chaves privilegiadas jamais vão para o frontend ou Git. Confirmar que a hospedagem aceita o formato de build.
5. Em janela limpa, testar cadastro/login de demonstração, patrimônio, metas, salvamento, histórico, restauração, logoff, conflitos, erros e responsividade. Manter monitoramento e conta de teste acessíveis durante a avaliação.
6. Preparar vídeo de até 3 minutos acessível sem login, README com instruções reais e links HTTPS, preencher e revisar o painel e enviar até 30/11 às 23h59, Brasília.
7. Para finalistas, respeitar o congelamento do código após o prazo até o início da final em 12/12; manter demo e repositório disponíveis conforme regulamento e confirmar participação até 4/12 às 23h59.

## Verificações registradas

Em 9/11/2026: testes unitários e build passaram; teste automatizado com conta fictícia local cobriu login, salvamento, falhas, conflitos, histórico e logoff. `pnpm audit --prod --audit-level high` não apontou vulnerabilidades conhecidas. Uma varredura de padrões comuns nos arquivos versionáveis não encontrou credenciais; isso não garante ausência de todos os segredos ou problemas de segurança.
