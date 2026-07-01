# Banco de Dados

## ORM e Conexão
Utilizamos Prisma para gerenciar o esquema e migrações do banco PostgreSQL.

## Dicionário de Dados
As tabelas principais são focadas no contexto multitenant (`companyId` obrigatório) e controle de status.

- **Company**: Representa o Tenant (a loja/agência).
- **User**: O perfil de usuário global do sistema.
- **CompanyUser**: Tabela pivô de vínculo entre User e Company, definindo as Roles (OWNER, MANAGER, ATTENDANT) e controle de acesso (ativo/inativo).
- **Customer**: Tabela de Clientes, com indexação de telefone para evitar cadastros duplicados lógicos (embora geridos pela aplicação).
- **Attendance**: Os atendimentos ou negociações. Equivalente aos "Cards" num funil Kanban. Um cliente pode ter múltiplos atendimentos ao longo da vida útil.
- **Quote / QuoteItem**: Modelagem de Orçamento (cabeçalho) e itens, contendo valores em centavos numéricos (`Int`) para segurança monetária.
- **Task**: Tarefas de follow-up, reuniões ou tarefas em geral atreladas a clientes, atendimentos ou orçamentos.
- **MessageTemplate / MessageLog**: O modelo de mensagens rápidas da empresa e log do que foi falado/copiado com determinado cliente (registro da jornada).
- **ActivityLog**: Registro de auditoria do sistema.
