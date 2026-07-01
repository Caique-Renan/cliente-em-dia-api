# Arquitetura do Sistema

## Stack Tecnológica
- **Frontend**: React.js, Vite, TypeScript, Tailwind CSS (se desejado futuramente), React Router.
- **Backend**: Node.js, Express, TypeScript.
- **Banco de Dados**: PostgreSQL.
- **ORM**: Prisma.
- **Validação**: Zod.
- **Autenticação**: JWT.

## Multitenant (Multiempresa)
A arquitetura é single-database e logical-isolation. Isso significa que todas as tabelas de negócio possuem a coluna `companyId`.

**Regras de Segurança:**
1. Nenhum registro é consultado sem um `where: { companyId }`.
2. A camada da API não aceita o `companyId` no body ou query param em rotas seguras.
3. O `companyId` sempre vem do contexto de autenticação do usuário logado, contido no Payload do JWT (`activeCompanyId`).

## Módulos
O backend é estruturado em subpastas dentro de `src/modules/*` separando lógicas de rotas, controllers e services por domínio de negócio.
