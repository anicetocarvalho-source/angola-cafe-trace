

# Inventário Completo — INCA Coffee Trace

## 1. Módulos, Rotas e Componentes

| Módulo | Rota(s) | Componentes Principais | Dependências Externas | Estado |
|--------|---------|------------------------|-----------------------|--------|
| **Landing Page** | `/` | `Index.tsx` | — | Completo |
| **Autenticação** | `/auth` | `Auth.tsx`, `ProtectedRoute.tsx`, `useAuth.tsx` | Lovable Cloud Auth | Completo |
| **Perfil** | `/perfil` | `Perfil.tsx` | Tabela `profiles` | Completo |
| **Dashboard** | `/dashboard` | `Dashboard.tsx`, `AdminDashboard`, `ProducerDashboard`, `CooperativaDashboard`, `ProcessadorDashboard`, `TransportadorDashboard`, `ExportadorDashboard`, `CompradorDashboard`, `IoTSensorStatus`, `MarketDataWidget`, `ComplianceMetrics`, `RecentNotifications`, `UrgentActions` | Tabelas `lotes`, `exploracoes`, `notifications` | Completo |
| **Mapa Interactivo** | `/mapa` | `Mapa.tsx`, `InteractiveMap.tsx` | Leaflet / tiles | Completo |
| **Explorações** | `/exploracoes`, `/exploracoes/nova` | `Exploracoes.tsx`, `NovaExploracao.tsx` | Tabela `exploracoes` | Completo |
| **Parcelas** | `/parcelas`, `/parcelas/nova` | `Parcelas.tsx`, `NovaParcela.tsx` | Tabela `parcelas` | Completo |
| **Colheitas** | `/colheitas`, `/colheitas/nova`, `/colheitas/:id/editar` | `Colheitas.tsx`, `NovaColheita.tsx` | Tabela `colheitas` | Completo |
| **Manutenção Agrícola** | `/manutencao`, `/manutencao/nova`, `/manutencao/:id/editar` | `ManutencaoAgricola.tsx`, `NovaManutencao.tsx` | Tabela `manutencao_agricola` | Completo |
| **Lotes** | `/lotes`, `/lotes/novo`, `/lotes/:id` | `Lotes.tsx`, `NovoLote.tsx`, `LoteDetalhes.tsx`, `LoteTimeline.tsx`, `LoteGenealogy.tsx` | Tabela `lotes` (QR, RFID, blockchain hash) | Completo |
| **Divisão/Blend de Lotes** | `/lotes/operacoes` | `LoteOperacoes.tsx` | Tabela `lotes` (`parent_lote_ids`, `tipo_transformacao`) | Completo |
| **Genealogia SVG** | (tab em `/lotes/:id`) | `LoteGenealogy.tsx` | Tabela `lotes` (recursivo) | Completo |
| **Transformação** | `/transformacao` | `Transformacao.tsx` | Tabela `transformacoes` | Completo |
| **Secagem** | `/secagem/nova` | `NovaSecagem.tsx` | Tabela `secagens` | Completo |
| **Torra** | `/torra` | `Torra.tsx` | Tabela `torras` | Completo |
| **Embalagem** | `/embalagem` | `Embalagem.tsx` | Tabela `embalagens` | Completo |
| **Armazenamento** | `/armazenamento` | `Armazenamento.tsx` | Tabela `armazenamento` | Completo |
| **Logística** | `/logistica` | `Logistica.tsx` | Tabela `logistica` | Completo |
| **Comercialização** | `/comercializacao` | `Comercializacao.tsx` | Tabela `comercializacao` | Completo |
| **Exportação** | `/exportacao`, `/nova-exportacao`, `/exportacao/:id` | `Exportacao.tsx`, `NovaExportacao.tsx`, `ExportacaoDetalhes.tsx` | Tabela `exportacoes` (EUDR) | Completo |
| **Qualidade / Certificações** | `/qualidade`, `/nova-analise` | `Qualidade.tsx`, `NovaAnalise.tsx` | Tabela `qualidade_certificacoes` | Completo |
| **Checklists PCC** | `/checklists` | `Checklists.tsx` | Tabela `checklists` | Completo |
| **Validação de Lotes** | `/validacao` | `Validacao.tsx` | Tabela `lotes` (estado) | Completo |
| **Fiscalização (Visitas)** | `/fiscalizacao`, `/fiscalizacao/nova`, `/fiscalizacao/:id` | `Fiscalizacao.tsx`, `NovaVisita.tsx`, `VisitaDetalhes.tsx`, `PhotoGalleryUpload.tsx` | Tabelas `visitas_tecnicas`, `acoes_controlo` | Completo |
| **IoT / Sensores** | `/iot` | `IoT.tsx` | Tabelas `iot_sensors`, `iot_leituras`, `sensor_readings` | Completo |
| **SIM (Mercado)** | `/sim`, `/sim-publico`, `/boletim-mercado` | `SIM.tsx`, `SIMPublico.tsx`, `BoletimMercado.tsx`, `RegionalComparison.tsx` | Tabela `sim_mercado` | Completo |
| **Relatórios** | `/relatorios` | `Relatorios.tsx` | Múltiplas tabelas | Completo |
| **Verificação Pública** | `/verificar`, `/verificar/:referencia` | `Verificar.tsx` | Tabela `lotes` (público) | Completo |
| **Auditoria** | `/auditoria` | `Auditoria.tsx` | Tabelas `auditoria`, `audit_logs` | Completo |
| **Administração** | `/admin` | `Admin.tsx` | Tabelas `user_roles`, `entities`, `profiles` | Completo |
| **Notificações** | (global, header) | `NotificationCenter.tsx` | Tabela `notifications` | Completo |
| **QR Scanner** | (global, header) | `QRScanner.tsx` | Camera API | Completo |

## 2. Edge Functions (Backend)

| Função | Propósito | Estado |
|--------|-----------|--------|
| `check-action-deadlines` | Verificação diária de prazos de acções de controlo (pg_cron 08:00) | Completo |
| `create-test-users` | Criação de utilizadores de teste com roles pré-definidos | Completo |
| `send-notification-email` | Envio de emails de notificação | Completo |

## 3. Componentes Transversais

| Componente | Função |
|------------|--------|
| `DashboardLayout.tsx` | Layout principal com sidebar colapsável, navegação por perfil, tema claro/escuro, ripple effect |
| `ProtectedRoute.tsx` | Guard de rotas com verificação de role |
| `PageTransition.tsx` | Animações de transição (Framer Motion) |
| `Breadcrumbs.tsx` | Navegação contextual |
| `DataTablePagination.tsx` | Paginação reutilizável |
| `FileUpload.tsx` | Upload de ficheiros genérico |
| `LoadingSkeleton.tsx` | Skeletons de carregamento |

## 4. Integrações e Dependências Externas

| Integração | Tecnologia | Estado |
|------------|-----------|--------|
| Base de dados PostgreSQL | Lovable Cloud (Supabase) | Completo |
| Autenticação | Lovable Cloud Auth | Completo |
| RLS / RBAC (8 roles) | Policies + `has_role()` SECURITY DEFINER | Completo |
| Mapa interactivo | Leaflet + OpenStreetMap tiles | Completo |
| QR Codes | Geração automática via DB function | Completo |
| Blockchain (hash) | Campo preparado, integração real por fazer | Parcial |
| EUDR compliance | Campo `eudr_pacote_id` em exportações | Parcial |
| SMS/Email externo | Edge function preparada, provider por configurar | Parcial |
| RNPA/IDF sync | Não implementado | Por fazer |
| PWA / Offline | Não implementado | Por fazer |

## 5. Resumo de Gaps (do plano existente)

| Gap | Prioridade | Estado |
|-----|-----------|--------|
| PWA com suporte offline + sincronização | Alta | Por fazer |
| Integração blockchain real | Media | Por fazer |
| Submissão EUDR automática | Media | Por fazer |
| Sincronização RNPA/IDF | Baixa | Por fazer |
| App mobile nativa | Alta | Por fazer |
| Perfil sensorial detalhado (aroma, acidez, corpo separados) | Media | Parcial |
| Limites e alertas automáticos por PCC | Media | Parcial |

---

**Totais**: 28 módulos com UI | 44 rotas | 22 tabelas de base de dados | 3 edge functions | 8 roles de utilizador

