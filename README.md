# Cliente em Dia

O **Cliente em Dia** é uma plataforma focada em organizar pequenos negócios, ajudando a gerenciar clientes, atendimentos, orçamentos, follow-ups e comunicação. O MVP atual visa centralizar dados dispersos em planilhas e cadernos.

## 🚀 Funcionalidades (Módulos Principais)
- **Clientes:** Cadastro, listagem e gestão completa (CRM leve).
- **Atendimentos:** Funil de oportunidades por status.
- **Tarefas / Follow-ups:** Gestão de pendências e datas importantes.
- **Orçamentos:** Geração e controle do pipeline financeiro.
- **Mensagens (WhatsApp manual):** Templates inteligentes com preenchimento de variáveis dinâmicas e logs de disparo de links para WhatsApp.
- **Relatórios / Dashboard:** Painel gerencial resumido com base nos indicadores reais do sistema.
- **UX Polish:** Melhoria na experiência com onboarding inicial, empty states em todas as listas, máscaras de inputs (CPF, telefone, moeda) e mensagens de erro inline amigáveis.

## 🛠 Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, React Router, React Hook Form, Zod.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT, bcrypt.
- **Autenticação:** Multiempresa (Tenancy via `companyId` no JWT token).

## 📂 Estrutura de Pastas
```
cliente-em-dia/
├── backend/            # API REST
│   ├── prisma/         # Schema do Prisma, Migrations e Seed
│   └── src/
│       ├── config/     # Configuração de env e singleton prisma
│       ├── errors/     # Tratamento de AppError
│       ├── middlewares/# Autenticação e Error handler global
│       └── modules/    # Lógica de domínio segregada (auth, customers, quotes, etc)
├── frontend/           # Aplicação Web (SPA)
│   └── src/
│       ├── components/ # Componentes reutilizáveis
│       ├── contexts/   # AuthContext e globais
│       ├── pages/      # Views principais por rota
│       └── services/   # Requisições Axios centralizadas
└── docs/               # Checklists (deploy, security, smoke-test)
```

## ⚙️ Configurando o Ambiente

### 1. Banco de Dados
Configure o arquivo `backend/.env` (use `.env.example` como base).
Defina as variáveis `DATABASE_URL` e `DIRECT_URL` apontando para o seu banco PostgreSQL. O `JWT_SECRET` deve ser preenchido para ambiente local.

```bash
cd backend
npx prisma generate
npx prisma migrate dev
# Opcional: Gerar massa de dados demo
npx prisma db seed
```

### 2. Rodando o Backend
```bash
cd backend
npm install
npm run dev
# Typecheck: npx tsc --noEmit
# Build prod: npm run build
```

### 3. Rodando o Frontend
Configure o arquivo `frontend/.env` (use `.env.example`).
Certifique-se de que `VITE_API_URL` aponte para o backend local (ex: `http://localhost:3333`).

```bash
cd frontend
npm install
npm run dev
# Typecheck: npx tsc --noEmit
# Build prod: npm run build
```

## 🐳 Rodando com Docker (Dockerização Local)
Para executar o ambiente completo de forma reproduzível via Docker:

1. Acesse a pasta do backend e crie o seu arquivo `.env.docker`:
   ```bash
   cp backend/.env.docker.example backend/.env.docker
   ```
2. Edite o arquivo `backend/.env.docker` recém-criado, preenchendo o `DATABASE_URL` e `DIRECT_URL` apontando para o seu banco Supabase externo, e gerando um `JWT_SECRET`.
   *(Nota: O banco de dados continua sendo externo, o Docker roda apenas a API e a SPA).*

3. Na raiz do projeto, execute o build e suba os contêineres:
   ```bash
   docker compose build
   docker compose up -d
   ```

Acessos:
- **Frontend (SPA via Nginx):** http://localhost:8080
- **Backend (API Healthcheck):** http://localhost:3333/health

> **Importante:** Como o Vite injeta a variável `VITE_API_URL` durante a fase de build (build-time), qualquer alteração na URL da API exigirá um rebuild completo da imagem do frontend (`docker compose build frontend`).

## 🔐 Observações de Segurança
- A senha trafega exclusivamente via *Body* no `/auth/login`.
- Tokens gerados nunca possuem senha ou `passwordHash` contidos.
- Os dados multiempresa são rigorosamente isolados pelo `activeCompanyId` recuperado diretamente do Token JWT no backend.
- A comunicação em Produção é projetada para rodar estritamente via HTTPS, com JWT e CORS restrito.
- A instância do Prisma utiliza o padrão *Singleton* para evitar vazamentos de conexão.
- Para regras completas consulte `docs/security-checklist.md`.

## 🎭 Formatadores e Validação (UX Polish)
Para garantir que a UI apresente dados amigáveis sem impactar a persistência, o frontend possui formatadores e normalizadores:
- `formatPhone` / `normalizePhone`: Exibe o telefone com máscara, mas limpa a pontuação (`(/\D/g)`) para envio à API.
- `formatDocument` / `normalizeDocument`: Aplica máscara de CPF/CNPJ conforme digitação, mas envia os números limpos para backend.
- `formatCurrencyMask` / `BRLInputToCents`: A UI exibe `R$ 10,00` e converte para `1000` (centavos) para evitar erros de ponto flutuante no banco.
*A regra principal é: a tela pode ter formatação, mas a API recebe sempre os dados brutos e normalizados no payload.*

## 📌 Pendências Futuras / Próximos Passos
- **Code Splitting / Lazy Loading**: Redução do Bundle Size inicial aplicando `React.lazy()` no React Router.
- Refinamento de Exportações de CSV e Relatórios avançados.
- Testes E2E (Playwright / Cypress).
