# Arquitetura proposta

Aplicação web responsiva em Next.js, React e TypeScript. O Supabase do Hack na nuvem e o ambiente local em Docker fornecem, cada um para as suas contas, autenticação e PostgreSQL com RLS. O acesso exige autenticação; contas carregam e salvam dados automaticamente no banco configurado. Os exemplos fictícios podem ser carregados pela página Conta. A ShardCloud hospeda a aplicação pública. A sessão de autenticação pode ser mantida no navegador; dados patrimoniais antigos são preservados para recuperação até que uma cópia idêntica seja confirmada no banco.

Organizar separadamente apresentação, modelos de patrimônio e cálculos, com testes para regras financeiras. A aplicação deve distinguir preço informado, valor estimado e data de avaliação; a visão tranquila não deve eliminar a possibilidade de consultar detalhes.

O projeto usa infraestrutura independente do Nexus comercial, autenticação e políticas de isolamento por conta. Login por senha, salvamento e recarga foram verificados na demo pública em 18/11/2026. Não usar credenciais ou dados de produção na demo.
