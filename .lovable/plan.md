

# Relatório de Testes de Rotas da Plataforma

## Resultados dos Testes

### Rotas Públicas (sem autenticação) — TODAS OK
| Rota | Resultado |
|------|-----------|
| `/` (Homepage) | Carrega correctamente com hero, KPIs animados, navegação |
| `/auth` | Formulário de login/registo funcional, login rápido disponível |
| `/verificar` | Portal público de verificação de lotes funcional |
| `/sim-publico` | Dashboard SIM público com 8 indicadores, 202 registos |
| `/boletim-mercado` | Boletim mensal funcional (dados zerados para abril 2026) |

### Rota 404 — OK
| Rota | Resultado |
|------|-----------|
| `/rota-inexistente-xyz` | Mostra página 404 com link "Return to Home" |

### Rotas Protegidas — Redirect OK
| Rota | Resultado |
|------|-----------|
| `/dashboard` (sem auth) | Redireciona correctamente para `/auth` |

### Rotas Protegidas (com auth Admin) — Via Sidebar OK
| Rota | Resultado |
|------|-----------|
| `/dashboard` | Dashboard Administrativo carrega (com flash "Conta Configurada") |
| `/admin` | Página de administração carrega (erro de FK profiles↔user_roles) |
| `/lotes` | Carrega via sidebar com 11 lotes listados |

## Problemas Encontrados

### 1. Flash "Conta Configurada" persiste no login (MODERADO)
Apesar da correcção anterior ao `useAuth`, o dashboard ainda mostra brevemente o fallback "Conta Configurada / Nenhum atribuído" antes de carregar o dashboard correcto. O problema é que o `onAuthStateChange` dispara antes dos roles serem carregados, e o componente Dashboard já começa a renderizar. A correcção actual usa `isFullyLoaded = !loading && !rolesLoading`, mas o `rolesLoading` inicia como `true` e o `loading` é colocado a `false` antes de `rolesLoading` em certos caminhos de execução.

### 2. Lotes com prefixo TEMP- não normalizados (MENOR)
Existem 2 lotes na base de dados com referências `TEMP-1775654026722-1` e `TEMP-1775654025842-0` que não foram apanhados pela migração anterior (que só corrigiu `TEMP-BLEND%`). Estes lotes com prefixo `TEMP-` devem ser normalizados.

### 3. Erro FK profiles↔user_roles na página Admin (MODERADO)
A página `/admin` tenta fazer join entre `profiles` e `user_roles` mas não existe FK definida no schema, resultando no erro PGRST200.

### 4. Página de 404 em inglês (MENOR)
A página NotFound mostra "Oops! Page not found" e "Return to Home" em inglês, inconsistente com o resto da plataforma que está em português.

## Plano de Correcções

### Passo 1: Corrigir flash "Conta Configurada" no Dashboard
- No `Dashboard.tsx`, verificar se `loading` inclui o estado dos roles antes de renderizar o conteúdo
- Alternativa: adicionar um skeleton/spinner no Dashboard enquanto roles carregam

### Passo 2: Normalizar lotes TEMP- restantes
- Migração SQL: `UPDATE lotes SET referencia_lote = public.generate_lot_reference() WHERE referencia_lote LIKE 'TEMP-%'`
- Actualizar trigger para também capturar `TEMP-%` (não apenas `PLACEHOLDER-`)

### Passo 3: Corrigir join FK na página Admin
- Alterar a query em `Admin.tsx` para fazer queries separadas (profiles + user_roles) em vez de join directo, ou criar a FK necessária

### Passo 4: Traduzir página 404 para português
- Actualizar `NotFound.tsx`: "Página não encontrada", "Voltar à página inicial"

