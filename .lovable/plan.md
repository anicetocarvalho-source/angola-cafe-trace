

# Fluxos de Utilizador — INCA Coffee Trace

Este documento é apenas de referência/documentação. Nenhuma alteração de código é necessária.

---

## Fluxo 1: Registo e Onboarding

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Utilizador acede a `/auth` → tab "Registar" → preenche nome, email, password → clica "Criar Conta" → 2. Redirect automático para `/dashboard` → 3. Dashboard mostra mensagem "contacte o administrador para atribuição de perfil" (sem role atribuído) |
| **Ecrãs** | `/auth`, `/dashboard` |
| **Dados** | nome, email, password (min 6 chars) |
| **Erros** | Email já registado; password demasiado curta; falha de rede; email inválido |

---

## Fluxo 2: Login → Dashboard → Logout

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. `/auth` → tab "Entrar" → email + password → "Entrar" → 2. Redirect para `/dashboard` (dashboard específico por role) → 3. Menu utilizador (dropdown) → "Sair" → redirect para `/auth` |
| **Ecrãs** | `/auth`, `/dashboard`, `/perfil` |
| **Dados** | email, password |
| **Erros** | Credenciais inválidas; conta sem role (dashboard genérico); sessão expirada |

---

## Fluxo 3: Produtor — Registar Exploração e Lote

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Login como produtor → `/dashboard` (ProducerDashboard) → 2. Sidebar "Explorações" → `/exploracoes` → 3. "Nova Exploração" → `/exploracoes/nova` → preenche designação, província, município, coordenadas GPS, área → submete → 4. Exploração fica com status "pendente" → 5. Sidebar "Parcelas" → `/parcelas/nova` → associa parcela à exploração → 6. Sidebar "Colheitas" → `/colheitas/nova` → regista colheita na parcela → 7. Sidebar "Lotes" → `/lotes/novo` → cria lote associado à colheita → lote fica "pendente" com QR gerado automaticamente |
| **Ecrãs** | `/dashboard`, `/exploracoes`, `/exploracoes/nova`, `/parcelas/nova`, `/colheitas/nova`, `/lotes/novo` |
| **Dados** | Exploração (designação, localização, área, GPS); Parcela (código, área, varietais); Colheita (datas, volume, método); Lote (tipo, volume, humidade) |
| **Erros** | Campos obrigatórios em falta; exploração não validada impede certas operações; RLS bloqueia acesso a explorações de outros produtores |

---

## Fluxo 4: Técnico INCA — Validação e Qualidade

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Login como técnico → AdminDashboard → 2. `/validacao` → lista de lotes/explorações pendentes → aprovar/reprovar com observações → 3. `/qualidade` → `/nova-analise` → regista análise de qualidade (SCA score, parâmetros) → 4. `/checklists` → preenche checklist PCC por etapa → 5. `/fiscalizacao/nova` → agenda visita técnica → `/fiscalizacao/:id` → regista observações + fotos + acções de controlo |
| **Ecrãs** | `/dashboard`, `/validacao`, `/qualidade`, `/nova-analise`, `/checklists`, `/fiscalizacao`, `/fiscalizacao/nova`, `/fiscalizacao/:id` |
| **Dados** | Decisão (aprovar/reprovar); SCA score; parâmetros de qualidade; itens checklist + limites PCC; dados visita (objectivo, conformidade, fotos, acções) |
| **Erros** | Lote não encontrado; tentativa de aprovar lote já aprovado; prazo de acção de controlo ultrapassado |

---

## Fluxo 5: Processador — Transformação e Operações de Lote

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Login como processador → ProcessadorDashboard → 2. `/lotes/operacoes` → dividir lote (split) ou criar blend (merge) → gera sub-lotes com `parent_lote_ids` → 3. `/transformacao` → regista etapa de transformação (lavagem, descasque, etc.) → 4. `/torra` → regista perfil de torra (temperatura, tempo, curva) → 5. `/embalagem` → regista embalagem final → 6. `/armazenamento` → regista entrada/saída de armazém |
| **Ecrãs** | `/dashboard`, `/lotes/operacoes`, `/transformacao`, `/torra`, `/embalagem`, `/armazenamento` |
| **Dados** | Operação split/blend (lotes origem, volumes); Transformação (etapa, rendimento); Torra (perfil, temperatura, tempo); Embalagem (tipo, peso, validade) |
| **Erros** | Volume dos sub-lotes excede o original; lote origem não encontrado; lote já processado |

---

## Fluxo 6: Transportador — Logística

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Login como transportador → TransportadorDashboard → 2. `/logistica` → regista transporte de lote (rota, veículo, checkpoints GPS, temperatura/humidade média) |
| **Ecrãs** | `/dashboard`, `/logistica` |
| **Dados** | Lote ID, rota, veículo, checkpoints (JSON com coordenadas + timestamps), temperatura média, humidade média |
| **Erros** | Lote não existe; checkpoint com coordenadas inválidas |

---

## Fluxo 7: Exportador — Exportação EUDR

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Login como exportador → ExportadorDashboard → 2. `/exportacao` → lista de exportações → 3. `/nova-exportacao` → selecciona lotes, preenche dados de embarque (navio, BL, porto, país destino) → 4. `/exportacao/:id` → acompanha status, anexa documentos (packing list, invoice, certificado origem), campo `eudr_pacote_id` → 5. `/comercializacao` → regista contrato de venda (comprador, preço, incoterm) |
| **Ecrãs** | `/dashboard`, `/exportacao`, `/nova-exportacao`, `/exportacao/:id`, `/comercializacao` |
| **Dados** | Lotes (array), dados embarque, documentos, EUDR package ID, contrato (comprador, preço, moeda, incoterm) |
| **Erros** | Lote não aprovado para exportação; documentos em falta; lote já exportado |

---

## Fluxo 8: Verificação Pública (sem login)

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Acede a `/verificar` → 2. Introduz referência do lote ou lê QR code → 3. Sistema mostra dados do lote aprovado: origem, qualidade, certificações, timeline |
| **Ecrãs** | `/verificar`, `/verificar/:referencia` |
| **Dados** | Referência do lote (texto ou QR scan) |
| **Erros** | Referência não encontrada; lote não aprovado (não visível publicamente) |

---

## Fluxo 9: Admin — Gestão de Utilizadores e Auditoria

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Login como admin → AdminDashboard (KPIs globais) → 2. `/admin` → lista utilizadores → atribui/remove roles → associa utilizador a entidade → 3. `/auditoria` → consulta logs de alterações (tabela, acção, dados antigos/novos, utilizador, timestamp) |
| **Ecrãs** | `/dashboard`, `/admin`, `/auditoria` |
| **Dados** | User ID + role a atribuir; entidade a associar; filtros de auditoria |
| **Erros** | Tentativa de atribuir role inexistente; utilizador não encontrado; acesso negado (não-admin) |

---

## Fluxo 10: Consulta de Mercado (SIM)

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Público: `/sim-publico` ou `/boletim-mercado` → consulta preços e volumes → 2. Autenticado: `/sim` → dados completos com comparação regional, tendências, fontes |
| **Ecrãs** | `/sim-publico`, `/boletim-mercado`, `/sim` |
| **Dados** | Indicadores de mercado (preço, volume, localização, fonte, data) |
| **Erros** | Sem dados para período seleccionado |

---

## Fluxo 11: Comprador — Consulta e Aquisição

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Login como comprador → CompradorDashboard → 2. `/lotes` → consulta lotes disponíveis (aprovados) → `/lotes/:id` → detalhes + genealogia SVG + timeline → 3. `/comercializacao` → visualiza contratos existentes |
| **Ecrãs** | `/dashboard`, `/lotes`, `/lotes/:id`, `/comercializacao` |
| **Dados** | Filtros de pesquisa (tipo, estado, qualidade); detalhes do lote |
| **Erros** | Lote não encontrado; acesso negado a dados restritos |

---

## Fluxo 12: Cooperativa — Gestão Multi-Produtor

| Campo | Detalhe |
|-------|---------|
| **Passos** | 1. Login como cooperativa → CooperativaDashboard → 2. Acesso a Explorações, Parcelas, Colheitas, Lotes dos produtores associados → 3. `/lotes/operacoes` → pode criar blends de lotes de diferentes produtores → 4. `/armazenamento` → gestão de armazém colectivo |
| **Ecrãs** | `/dashboard`, `/exploracoes`, `/parcelas`, `/colheitas`, `/lotes`, `/lotes/operacoes`, `/armazenamento` |
| **Dados** | Mesmos do produtor, mas com visão agregada multi-produtor |
| **Erros** | Tentativa de aceder a exploração não associada à cooperativa |

---

## Resumo de Condições de Erro Transversais

| Erro | Impacto | Ecrã |
|------|---------|------|
| Sessão expirada | Redirect automático para `/auth` | Qualquer rota protegida |
| Role insuficiente | Mensagem "Acesso Negado" | Rotas com `requiredRole` |
| RLS policy bloqueio | Query retorna vazio ou erro 403 | Qualquer operação CRUD |
| Rede indisponível | Toast de erro genérico | Global |
| Dados obrigatórios em falta | Validação client-side (HTML5 required) | Formulários |

