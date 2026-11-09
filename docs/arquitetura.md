# Arquitetura proposta

Aplicação web responsiva em Next.js, React e TypeScript. O Supabase local fornece autenticação e PostgreSQL com RLS. O modo visitante utiliza dados fictícios em memória; contas carregam e salvam dados automaticamente no banco local. Não há hospedagem pública configurada. A sessão de autenticação pode ser mantida no navegador; dados patrimoniais antigos são preservados para recuperação até que uma cópia idêntica seja confirmada no banco.

Organizar separadamente apresentação, modelos de patrimônio e cálculos, com testes para regras financeiras. A aplicação deve distinguir preço informado, valor estimado e data de avaliação; a visão tranquila não deve eliminar a possibilidade de consultar detalhes.

Se forem adicionadas contas e persistência, selecionar infraestrutura independente do Nexus comercial e implementar autenticação, isolamento de dados, políticas de acesso e testes. Não usar credenciais ou dados de produção na demo.
