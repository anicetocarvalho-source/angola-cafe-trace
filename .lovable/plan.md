## Diagnóstico

Quando se clica num item do menu, sente-se o sistema inteiro a recarregar (sidebar, header, perfil, papéis, contagens) e não apenas o conteúdo da página. Isto acontece por duas causas técnicas que se reforçam:

### 1. `DashboardLayout` está dentro de cada página, em vez de envolver as rotas
Cada página (`Mapa`, `Lotes`, `Dashboard`, `LoteDetalhes`, etc.) faz `<DashboardLayout>...</DashboardLayout>` no seu próprio JSX. Como o React Router substitui o elemento da rota a cada navegação, o `DashboardLayout` **desmonta e volta a montar** sempre — ou seja, o header, a sidebar, o `NotificationCenter`, o estado de colapso da sidebar, animações, tudo é recriado do zero a cada clique.

### 2. `useAuth` é um hook isolado, não um contexto partilhado
`src/hooks/useAuth.tsx` é um hook normal: cada componente que o chama (`ProtectedRoute` e `DashboardLayout`) cria a sua **própria instância** com `useState`. Como o layout é remontado a cada navegação:
- `loading` arranca em `true`,
- corre `supabase.auth.getSession()` outra vez,
- corre `fetchRoles()` outra vez,
- enquanto isso o `ProtectedRoute` mostra o spinner de página inteira e o `DashboardLayout` esconde os grupos de menu (porque `filteredGroups` filtra com `loading`).

O resultado visível é o "flash" de recarga global a cada clique.

## Plano

### Passo 1 — Transformar `useAuth` num contexto (AuthProvider único)
- Converter `src/hooks/useAuth.tsx` em `AuthContext` + `AuthProvider` + hook consumidor `useAuth()`.
- A subscrição a `supabase.auth.onAuthStateChange` e o `fetchRoles` passam a viver **uma só vez** no provider, na raiz da app.
- Todos os componentes (`ProtectedRoute`, `DashboardLayout`, páginas) continuam a chamar `useAuth()` com a mesma assinatura — só lêem do contexto, não re-fazem fetch.
- Envolver a app com `<AuthProvider>` em `src/App.tsx`, por dentro do `<BrowserRouter>` (precisa de router para o `navigate` do `signOut`).

Benefício: navegar deixa de disparar novo `getSession`/`fetchRoles`, e `loading` deixa de voltar a `true`.

### Passo 2 — Elevar `DashboardLayout` para uma rota de layout persistente
- Criar um componente `AppLayout` que renderiza `<DashboardLayout><Outlet /></DashboardLayout>` (com `ProtectedRoute` por dentro, opcionalmente, para as rotas privadas).
- Em `src/App.tsx`, reorganizar as `Routes` para que todas as rotas privadas fiquem aninhadas numa rota pai que usa esse layout:
  ```text
  <Route element={<AppLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/mapa" element={<Mapa />} />
    ... (todas as rotas atualmente protegidas)
  </Route>
  ```
- Manter fora deste layout as rotas públicas (`/`, `/auth`, `/verificar`, `/sim-publico`, `/boletim-mercado`).
- Manter as restrições por papel: ou criar pequenos wrappers `<RequireRole role="...">` por rota, ou manter `ProtectedRoute requiredRole` à volta do `<Outlet />` em sub-grupos. A regra atual de cada rota é preservada exatamente.

### Passo 3 — Remover `<DashboardLayout>` do interior de cada página
Em todas as páginas listadas (Mapa, Lotes, LoteDetalhes, Dashboard, Exploracoes, Parcelas, Colheitas, NovaColheita, Manutencao, NovaManutencao, Fiscalizacao, NovaVisita, VisitaDetalhes, Transformacao, Logistica, Comercializacao, Armazenamento, Torra, Embalagem, LoteOperacoes, Exportacao, NovaExportacao, ExportacaoDetalhes, Qualidade, Validacao, Checklists, IoT, Admin, Auditoria, Relatorios, SIM, Perfil, NovoLote, NovaExploracao, NovaParcela, NovaSecagem, NovaAnalise):
- Apagar o `import DashboardLayout` e os wrappers `<DashboardLayout>...</DashboardLayout>`, devolvendo apenas o conteúdo da página.
- O conteúdo passa a ser renderizado dentro do `<Outlet />` do layout persistente.

### Passo 4 — Envolver o `Outlet` com `PageTransition` (uma única instância)
Para manter a animação suave de entrada de página (mas só no conteúdo, não no header/sidebar), o `AppLayout` renderiza:
```text
<DashboardLayout>
  <PageTransition><Outlet /></PageTransition>
</DashboardLayout>
```

### Passo 5 — Verificação
- Navegar entre `/dashboard`, `/mapa`, `/lotes`, `/admin` e confirmar que:
  - O header, a sidebar e o estado colapsado/expandido **não piscam** nem reaparecem.
  - Não aparece o spinner global do `ProtectedRoute` entre páginas.
  - O `NotificationCenter` continua aberto/fechado de forma consistente.
- Confirmar que rotas com restrição de papel (ex.: `/admin`, `/exportacao`, `/iot`) continuam a bloquear utilizadores sem permissão.
- Confirmar que logout (`signOut`) ainda redireciona para `/auth`.

## Notas

- Não há alteração de regras de negócio nem de queries — apenas estrutura de routing e gestão de estado de autenticação.
- A API pública do hook (`user`, `session`, `loading`, `roles`, `hasRole`, `signOut`) mantém-se igual; nenhuma página precisa de ser alterada além da remoção do wrapper de layout.
