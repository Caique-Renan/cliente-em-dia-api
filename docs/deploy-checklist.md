# Deploy Checklist - Cliente em Dia

Este documento contém os passos necessários para preparar e realizar o deploy do MVP em ambiente de produção.

## 1. Banco de Dados
- [ ] Configurar banco de dados de produção (ex: PostgreSQL no Supabase, AWS RDS, etc).
- [ ] Rodar as migrations no banco de produção (`npx prisma migrate deploy`).
- [ ] Configurar backups diários do banco.
- [ ] Definir estratégia de rollback em caso de falha na migração (ex: snapshot antes do deploy).

## 2. Variáveis de Ambiente
- [ ] Criar arquivo `.env` seguro no servidor baseando-se no `.env.example`.
- [ ] Configurar `DATABASE_URL` (e `DIRECT_URL` se aplicável).
- [ ] Gerar e configurar um `JWT_SECRET` forte (ex: string aleatória de 64 caracteres).
- [ ] Configurar `PORT` no backend e garantir liberação de firewall.
- [ ] Revisar rigorosamente a `CORS_ORIGIN` no backend para aceitar apenas o domínio exato do frontend.

## 3. Segurança e Infraestrutura
- [ ] Habilitar **HTTPS obrigatório** para todas as requisições (especialmente login).
- [ ] Revisar cookies e tokens para garantir que transitam com `Secure`, `HttpOnly` (se aplicável), e `SameSite`.
- [ ] Revisar logs de erro do PM2/Docker para garantir que não vazem dados sensíveis (senhas, hashes).
- [ ] Revisar permissões multiempresa e endpoints expostos.

## 4. Validação Pré-Deploy
- [ ] Validar build do backend (`npm run build` / `npx tsc --noEmit`).
- [ ] Validar build do frontend (`npm run build`).

## 5. Validação Pós-Deploy
- [ ] Fazer chamada para a rota `GET /health` e verificar retorno HTTP 200.
- [ ] Validar autenticação (login completo e geração de token no frontend).
- [ ] Validar navegação por rotas privadas e garantir que o Token está sendo validado.
- [ ] Validar seed demo, se usado.
- [ ] Validar F5 (refresh) nas rotas privadas.
- [ ] Validar empty states visuais nas listagens.
- [ ] Validar responsividade mobile (especialmente Dashboard e forms).
