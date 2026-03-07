

# Diagnóstico: Sidebar "duplica" ao navegar + toggles da topbar com comportamento estranho

## Causa raiz

### 1. `layoutId="activeIndicator"` no framer-motion (linha 199)
Este é o principal culpado. O `layoutId` cria uma animação partilhada entre todos os elementos com o mesmo ID no DOM. Quando se clica num item da sidebar e a rota muda:
- O componente `DashboardLayout` re-renderiza com o novo `location.pathname`
- O framer-motion tenta animar o indicador ativo da posição antiga para a nova
- Durante essa animação, o indicador "voa" pelo ecrã, criando a ilusão visual de que uma segunda sidebar aparece momentaneamente

Como o `PageTransition` também usa `key={location.pathname}` com animações de entrada/saída, ambos os sistemas de animação colidem, causando flickers visuais.

### 2. `AnimatePresence mode="wait"` nos labels dos grupos (linha 154)
O `mode="wait"` força o framer-motion a esperar que a animação de saída termine antes de iniciar a de entrada. Durante uma navegação, todos os labels dos grupos animam exit → enter, contribuindo para o efeito de "piscar".

### 3. `whileHover` com `motion.div` a envolver os Links (linha 181-225)
Cada item de nav está envolvido em `motion.div` com animações de hover. Quando o componente re-renderiza (mudança de rota), estes wrappers re-montam e causam micro-animações indesejadas.

## Plano de correção

### A. Remover `layoutId` do indicador ativo
Substituir a animação `layoutId="activeIndicator"` por uma simples transição CSS. O indicador aparece/desaparece no local correto sem "voar" entre posições.

### B. Simplificar `AnimatePresence` nos labels
Remover `mode="wait"` dos `AnimatePresence` dos group labels para evitar o atraso na transição. Usar transições CSS simples em vez de framer-motion para a visibilidade dos labels.

### C. Estabilizar os wrappers `motion.div` dos items
Adicionar `layout={false}` aos `motion.div` dos items de nav para evitar re-cálculos de layout durante a navegação. Manter apenas o `whileHover` sem animações de montagem.

### D. Verificar conflitos na topbar
Os toggles da topbar (tema, notificações, menu utilizador) usam o `useEffect` na linha 36-40 que fecha tudo ao mudar de rota. Isto está correto, mas o `handleNotificationsChange` e `handleUserMenuChange` forçam o fecho dos outros menus ao abrir um, o que pode causar um flash visual se o Popover/DropdownMenu animarem a saída. Adicionar `forceMount` ou simplificar a lógica de exclusão mútua.

## Ficheiro a alterar
- `src/components/DashboardLayout.tsx` — todas as correções acima

Sem alterações na base de dados.

