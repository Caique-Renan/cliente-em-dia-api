# Security Checklist - Cliente em Dia

Regras e premissas de segurança mantidas no projeto Cliente em Dia:

## Autenticação
- [x] A senha **sempre** trafega via `body` no formato JSON durante o login.
- [x] Nunca enviar `password` via Headers, Query Params, ou URL.
- [x] Nunca enviar token de `Authorization` na chamada `/auth/login`.
- [x] HTTPS é obrigatório em produção.

## Armazenamento e Retorno de Dados
- [x] O `passwordHash` jamais é retornado para o frontend pelas rotas de `/me` ou `/login`.
- [x] Senhas nunca são guardadas no `localStorage` ou `sessionStorage`.
- [x] Apenas o `token` JWT (e primaryToken) e dados base do usuário (sem campos sensíveis) residem no browser.

## Isolamento Multiempresa (Tenancy)
- [x] O `companyId` ativo nunca vem do client side (frontend body/query) para inserções e listagens sensíveis.
- [x] O `companyId` é sempre extraído com segurança via token JWT (`req.user.activeCompanyId`).
- [x] Consultas no banco usam cláusulas `where: { companyId }` em conjunto com demais parâmetros.

## Banco de Dados e Conexões
- [x] Prisma ORM configurado com o padrão Singleton para evitar vazamento de conexões, garantindo que o pool não exceda o limite em desenvolvimento e produção.

## Logs e Documentação
- [x] Nunca imprimir logs usando `console.log(password)` ou o payload de autenticação.
- [x] Nunca logar o token JWT completo.
- [x] Dados sensíveis identificados em logs ou erros são mascarados com `[REDACTED]`.
- [x] Documentos públicos ou commits de documentação não contêm senhas de banco ou JWT secrets reais.

## Rede (Network)
- [x] `CORS` deve ser restrito ao domínio oficial do frontend em ambiente produtivo.
