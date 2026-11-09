# Plano de persistência — em preparação

Estado: a aplicação conecta-se ao Supabase local e carrega dados após o login. Alterações são enviadas automaticamente ao banco; falhas e conflitos são mostrados na interface. A cópia JSON é um arquivo local não criptografado. Guardar em local protegido. A restauração local substitui os dados atuais somente após confirmação.

## Próxima etapa

A migration inicial proposta está em `supabase/migrations/202611090001_patrimonio.sql`: um registro por usuário, com bens e metas em JSON e RLS por usuário. Ela foi aplicada no banco local separado. Foram feitos testes transacionais de leitura e escrita isoladas entre dois usuários e verificação de ausência de SELECT para anon; nada foi aplicado na nuvem. O formato é adequado ao protótipo, mas não garante validação completa dos dados ou resolução de conflitos entre dispositivos.

Criar um projeto Supabase exclusivo para o hack, separado do Nexus comercial. Usar autenticação, PostgreSQL e políticas por usuário. Antes de migrar dados: modelar e versionar o schema, habilitar RLS e permissões mínimas, testar acesso permitido do proprietário e acesso negado entre contas e sem login, e revisar riscos e privacidade. Nunca expor chaves privilegiadas no navegador ou no repositório.

A migração precisa ser explícita, após autenticação: comparar bens e metas de origem e destino, informar conflitos, pedir confirmação antes de substituir dados, e manter a cópia local até conferência. A migração não deve presumir que dados do navegador são fictícios. Não coletar ou publicar dados pessoais reais de terceiros na demo do hack.

Não executar migrations nem conectar em um projeto existente sem verificar que é o projeto separado escolhido para esta aplicação. A demonstração pública deve continuar funcionando com dados sintéticos, inclusive sem acesso de escrita a dados de usuários reais.

## Executar localmente

Requisitos: Docker em execução e dependências instaladas com `pnpm install`. O projeto usa Supabase CLI com stack experimental e rede Docker `nexus-hack-local`, configurada para vincular portas em 127.0.0.1. Na primeira execução em outra máquina, crie a rede com `docker network create -o com.docker.network.bridge.host_binding_ipv4=127.0.0.1 nexus-hack-local`; em seguida execute `pnpm supabase:start`. Use `pnpm supabase:stop` para parar; não execute `db reset` sobre dados que queira preservar. Não compartilhe a saída de comandos que exponham credenciais locais.

A aplicação não grava novos dados patrimoniais no navegador. Após login carrega os dados do banco; alterações são salvas automaticamente. A restauração de JSON exige conta e confirmação e grava diretamente no banco. Há proteção contra sobrescrita em caso de alterações simultâneas em outra sessão; conflitos exigem ação do usuário. Dados das versões anteriores são preservados até que uma cópia idêntica seja confirmada no banco; a autenticação pode manter dados de sessão no navegador. Os exemplos públicos do banco são fictícios e somente leitura; restaurar o exemplo carrega o registro público. As portas locais podem mudar. A nuvem e a demo pública precisam de configuração independente, dados sintéticos e validação antes da avaliação.
