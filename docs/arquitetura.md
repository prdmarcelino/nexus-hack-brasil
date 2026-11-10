# Arquitetura proposta

Aplicação web responsiva em Next.js, React e TypeScript. O Supabase local fornece autenticação e PostgreSQL com RLS. O acesso exige autenticação; contas carregam e salvam dados automaticamente no banco configurado. Os exemplos fictícios podem ser carregados pela página Conta. Não há hospedagem pública configurada. A sessão de autenticação pode ser mantida no navegador; dados patrimoniais antigos são preservados para recuperação até que uma cópia idêntica seja confirmada no banco.

Organizar separadamente apresentação, modelos de patrimônio e cálculos, com testes para regras financeiras. A aplicação deve distinguir preço informado, valor estimado e data de avaliação; a visão tranquila não deve eliminar a possibilidade de consultar detalhes.

O projeto usa infraestrutura independente do Nexus comercial, autenticação e políticas de isolamento por conta. A aplicação hospedada e a autenticação na nuvem ainda precisam ser validadas. Não usar credenciais ou dados de produção na demo.
