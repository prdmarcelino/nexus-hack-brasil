# Plano de persistência — em preparação

Estado: a aplicação conecta-se ao Supabase local e carrega dados após o login. Alterações são enviadas automaticamente ao banco; falhas e conflitos são mostrados na interface. A cópia JSON é um arquivo local não criptografado. Guardar em local protegido. A restauração local substitui os dados atuais somente após confirmação.

## Próxima etapa

A migration inicial proposta está em `supabase/migrations/202611090001_patrimonio.sql`: um registro por usuário, com bens e metas em JSON e RLS por usuário. Ela foi aplicada no banco local separado. Foram feitos testes transacionais de leitura e escrita isoladas entre dois usuários e verificação de ausência de SELECT para anon; as quatro migrations também foram aplicadas ao projeto separado na nuvem em 9/11/2026. O formato é adequado ao protótipo, mas não garante validação completa dos dados ou resolução de conflitos entre dispositivos.

O projeto Supabase exclusivo para o hack foi criado pelo titular, separado do Nexus comercial, com PostgreSQL e políticas por usuário. A conexão da aplicação hospedada e a autenticação na nuvem ainda precisam ser validadas. Antes de migrar dados: modelar e versionar o schema, habilitar RLS e permissões mínimas, testar acesso permitido do proprietário e acesso negado entre contas e sem login, e revisar riscos e privacidade. Nunca expor chaves privilegiadas no navegador ou no repositório.

A migração precisa ser explícita, após autenticação: comparar bens e metas de origem e destino, informar conflitos, pedir confirmação antes de substituir dados, e manter a cópia local até conferência. A migração não deve presumir que dados do navegador são fictícios. Não coletar ou publicar dados pessoais reais de terceiros na demo do hack.

Não executar migrations nem conectar em um projeto existente sem verificar que é o projeto separado escolhido para esta aplicação. Para a demonstração pública, fornecer ao júri acesso de teste com dados sintéticos, sem acesso a dados de usuários reais.

## Executar localmente

Requisitos: Docker em execução e dependências instaladas com `pnpm install`. O projeto usa Supabase CLI com stack experimental e rede Docker `nexus-hack-local`, configurada para vincular portas em 127.0.0.1. Na primeira execução em outra máquina, crie a rede com `docker network create -o com.docker.network.bridge.host_binding_ipv4=127.0.0.1 nexus-hack-local`; em seguida execute `pnpm supabase:start`. Use `pnpm supabase:stop` para parar; não execute `db reset` sobre dados que queira preservar. Não compartilhe a saída de comandos que exponham credenciais locais.

A aplicação não grava novos dados patrimoniais no navegador. Após login carrega os dados do banco; alterações são salvas automaticamente. A restauração de JSON exige conta e confirmação e grava diretamente no banco. Há proteção contra sobrescrita em caso de alterações simultâneas em outra sessão; conflitos exigem ação do usuário. Dados das versões anteriores são preservados até que uma cópia idêntica seja confirmada no banco; a autenticação pode manter dados de sessão no navegador. Os exemplos públicos do banco são fictícios e somente leitura; restaurar o exemplo carrega o registro público. As portas locais podem mudar. A nuvem e a demo pública precisam de configuração independente, dados sintéticos e validação antes da avaliação.

## Histórico de versões

A migration `202611090003_historico.sql` cria um histórico privado com até 20 versões confirmadas por conta (limite atualizado pela migration `202611090004_limitar_historico.sql`) e cria uma referência do estado existente na ativação. Escritas e leitura entre contas e acesso anônimo foram verificados em uma transação de teste. O histórico não recupera dados anteriores à ativação e não substitui cópia externa. Restaurar uma versão exige confirmação explícita e salva uma nova versão.

## Verificação do projeto hospedado

Em 9/11/2026, as quatro migrations foram aplicadas com a CLI, com conferência posterior do histórico. RLS estava ativa nas três tabelas; testes transacionais com duas identidades fictícias validaram isolamento de dados e histórico; acesso anônimo às tabelas privadas foi negado e o exemplo público respondeu em modo somente leitura. Nenhum dado de usuário local foi transferido. A verificação é pontual e não substitui testes da aplicação implantada.
