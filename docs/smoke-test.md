# Smoke Test Manual

Checklist de validação manual para garantia da qualidade antes de liberar o projeto ou nova versão.

## 1. Autenticação
- [ ] `register`: Criar uma conta nova com nome, email, senha, e empresa.
- [ ] `login`: Entrar com a conta criada e validar geração do token.
- [ ] `select-company`: Logar e selecionar a empresa ativa.
- [ ] `logout`: Limpar o localStorage e garantir o redirecionamento.
- [ ] `F5 em rota privada`: O contexto `AuthContext` deve recarregar a sessão automaticamente.
- [ ] `token inválido`: Alterar manualmente o JWT no localStorage e garantir o logout forçado.

## 2. Fluxo Comercial Principal
- [ ] Criar cliente validando formatações (telefone, CPF/CNPJ).
- [ ] Criar atendimento e vinculá-lo ao cliente recém criado.
- [ ] Alterar status do atendimento no modal.
- [ ] Criar follow-up (tarefa) e setar um prazo futuro.
- [ ] Criar orçamento vinculado ao cliente e ao atendimento.
- [ ] Alterar o status do orçamento para "Aceito".
- [ ] Criar template de mensagem no menu Mensagens.
- [ ] Abrir modal "Enviar WhatsApp" via Atendimento, carregar o template com variáveis substituídas e clicar em "Copiar" (deve registrar log).
- [ ] Validar no Dashboard / Relatórios se todas as métricas refletem a jornada acima (novos clientes, orçamento aceito, mensagem enviada, etc).

## 3. Roteamento (Views)
- [ ] `/dashboard`
- [ ] `/customers`
- [ ] `/customers/:id`
- [ ] `/attendances`
- [ ] `/attendances/:id`
- [ ] `/tasks`
- [ ] `/quotes`
- [ ] `/quotes/:id`
- [ ] `/messages`
- [ ] `/reports`

## 4. UX Polish (Módulos e UI)
- [ ] **Dashboard Onboarding:** Conta zerada exibe card "Vamos começar?" e não card de Empty State genérico.
- [ ] **Empty States Funcionais:**
  - [ ] `/customers`: Exibe arte com "Ainda não há dados..."
  - [ ] `/attendances`: Exibe arte com "Ainda não há dados..."
  - [ ] `/tasks`: Exibe arte com "Ainda não há dados..."
  - [ ] `/quotes`: Exibe arte com "Ainda não há dados..."
  - [ ] `/messages`: Exibe arte com "Ainda não há dados..."
  - [ ] `/reports`: Exibe arte com "Ainda não há dados suficientes..."
- [ ] **Diferenciação Vazio x Busca:** Quando pesquisar algo que não existe (via header), exibe apenas "Nenhum resultado encontrado" e não o Empty State de conta zerada.
- [ ] **Máscaras e Normalização:**
  - [ ] Campo Telefone aplica máscara visual.
  - [ ] Campo Documento (CPF/CNPJ) aplica máscara visual.
  - [ ] Campo Moeda (BRL) aplica máscara.
  - [ ] Validar pelo painel Network (DevTools) se a API recebe payload com os números `limpos` (sem pontuação e em centavos).
- [ ] **Validação Inline:** Submeter modais com erro forçado valida se a classe `<p className="mt-1 text-sm text-red-600">` renderiza imediatamente debaixo do campo.
