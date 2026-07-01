# API Base

Rotas implementadas na fase 1.

## Públicas
`GET /health`
- Retorno: `{ "status": "ok", "timestamp": "...", "db": "connected" }`

`POST /auth/register`
- Body: `name`, `email`, `password`, `companyName`
- Cria: Company, User, CompanyUser (OWNER).
- Retorna: `{ user, companies, token }`

`POST /auth/login`
- Body: `email`, `password`
- Retorna: `{ user, companies, token }`

## Protegidas (Requer Header `Authorization: Bearer <token>`)
`POST /auth/select-company`
- Body: `companyId`
- Comportamento: Valida se o usuário pertence à empresa, e se estão ativos.
- Retorna: `{ activeCompany, token }` (Token novo com payload completo contendo role e activeCompanyId).

`GET /auth/me`
- Retorna os dados do usuário autenticado e a empresa ativa conforme extraído do JWT em requisições pós-seleção de empresa.
