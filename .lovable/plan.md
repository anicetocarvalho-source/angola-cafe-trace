

## Revisao Completa do Sistema INCA Coffee Trace

Este e um projecto ambicioso que toca praticamente todo o sistema. Proponho dividir em **4 fases** para manter a qualidade e evitar erros. Vamos comecar pela Fase 1 agora.

---

### Fase 1 — Layout Premium, Transicoes e Dashboards por Perfil

#### 1. Transicoes de Pagina Animadas

Criar um componente `PageTransition` com `framer-motion` que envolve o conteudo de cada pagina, aplicando um fade+slide suave na entrada/saida. Integrar no `DashboardLayout` para que todas as paginas internas tenham transicao automatica baseada na mudanca de rota (`useLocation`).

#### 2. Layout Premium do DashboardLayout

Melhorar o layout do painel:
- Sidebar colapsavel no desktop (mini-mode com apenas icones, expandivel ao hover ou clique)
- Header mais refinado com gradiente subtil, avatar com iniciais estilizadas, separacao visual entre logo e accoes
- Indicador visual da rota activa na sidebar (barra lateral colorida + fundo destacado)
- Footer discreto na sidebar com versao do sistema

#### 3. Dashboards Dedicados por Perfil

Actualmente so existem 3 variantes (Admin/Tecnico, Produtor, Default). Criar dashboards dedicados para os restantes perfis:

- **Cooperativa**: KPIs de produtores associados, area total, volumes agregados, colheitas recentes e accoes rapidas
- **Processador**: KPIs de transformacoes, rendimento medio, lotes processados, stock em armazem
- **Transportador**: KPIs de movimentos logisticos, rotas activas, condicoes medias de transporte
- **Exportador**: KPIs de exportacoes, lotes disponiveis, status EUDR, contratos comerciais
- **Comprador**: KPIs de compras, contratos activos, volumes adquiridos

Cada dashboard tera: saudacao personalizada, 4 cards KPI, 2 widgets de contexto e accoes rapidas relevantes.

#### 4. Correcoes de Consistencia nas Rotas

Alinhar `requiredRole` em todas as rotas protegidas:
- `/qualidade` → requiredRole `tecnico_inca`
- `/iot` → requiredRole `tecnico_inca`
- `/logistica` → requiredRole `transportador`
- `/comercializacao` → requiredRole `exportador`
- `/armazenamento` → requiredRole `processador`
- `/exportacao` → requiredRole `exportador`
- `/transformacao` → requiredRole `processador`

(O `ProtectedRoute` ja permite admin_inca aceder a tudo, por isso estas restricoes apenas afectam os perfis incorrectos.)

#### 5. Loading States Consistentes

Substituir os `<p>A carregar...</p>` em Exploracoes, Lotes e outras paginas por componentes `Skeleton` ou spinner consistente com o padrao ja usado no ProducerDashboard.

---

### Fases Futuras (apos aprovar e implementar Fase 1)

- **Fase 2**: Breadcrumbs em todas as paginas, filtros avancados e paginacao nas tabelas
- **Fase 3**: Dark mode toggle integrado no header, responsive polish em todas as paginas internas
- **Fase 4**: Notificacoes em tempo real, melhorias de performance e audit final

---

### Ficheiros Afectados na Fase 1

| Ficheiro | Alteracao |
|---|---|
| `src/components/DashboardLayout.tsx` | Sidebar colapsavel, header premium, transicao de pagina |
| `src/components/PageTransition.tsx` | Novo componente de transicao animada |
| `src/pages/Dashboard.tsx` | Routing para dashboards por perfil |
| `src/components/dashboard/CooperativaDashboard.tsx` | Novo |
| `src/components/dashboard/ProcessadorDashboard.tsx` | Novo |
| `src/components/dashboard/TransportadorDashboard.tsx` | Novo |
| `src/components/dashboard/ExportadorDashboard.tsx` | Novo |
| `src/components/dashboard/CompradorDashboard.tsx` | Novo |
| `src/App.tsx` | Correcao de requiredRole nas rotas |
| `src/pages/Exploracoes.tsx` | Loading skeleton |
| `src/pages/Lotes.tsx` | Loading skeleton |

Aproximadamente 11 ficheiros, 5 novos componentes de dashboard.

