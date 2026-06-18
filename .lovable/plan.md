## Objectivo
Redesenhar a página `/auth` para um visual moderno e premium, baseado na direcção escolhida "Premium coffee roast": fundo espresso escuro com gradiente radial, card central glassmorphic, acento cobre (#8b5e3c), tipografia Sora (títulos) + Manrope (corpo). Manter 100% da funcionalidade existente (tabs Entrar/Registar, login email/password, grelha de login rápido por papel, link de regresso, redirect automático).

## O que muda
- Layout centrado, max-width ~28rem, com cabeçalho de marca acima do card (logo em quadrado com gradiente cobre, título Sora 3xl, subtítulo discreto).
- Card glassmorphic: fundo `white/5`, blur, borda `white/10`, raio 3xl, sombra forte.
- Tabs Entrar/Registar dentro de um track preto translúcido, com o tab activo em cobre sólido.
- Inputs em `white/5` com borda `white/10`, label uppercase tracking-widest, focus ring cobre.
- Botão primário "Entrar" cobre cheio com hover mais claro e `active:scale-[0.98]`.
- Divisória "Login Rápido (Testes)" com linha + chip de texto sobre o fundo do card.
- Grelha 2 colunas com os 8 papéis (Admin, Técnico, Produtor, Cooperativa, Processador, Transportador, Exportador, Comprador) como chips translúcidos.
- Linha "Password padrão: Teste123!" e link "← Voltar à página inicial" no rodapé do card.
- Microinterações subtis: focus ring, transições em hover e `active:scale` no CTA.

## O que NÃO muda
- Lógica de autenticação, hooks, validações, navegação e tradução pt-PT.
- Rota `/auth`, redirect quando já autenticado, toasts existentes.
- Conjunto e nomes dos papéis de teste e a password de teste.

## Passos técnicos
1. Instalar fontes via fontsource: `@fontsource/sora` e `@fontsource/manrope`, importar em `src/main.tsx` e adicionar `fontFamily.sora` / `fontFamily.manrope` em `tailwind.config.ts`.
2. Adicionar tokens semânticos da paleta Burnt Sienna ao `src/index.css` (variáveis HSL para `--auth-bg`, `--auth-bg-grad`, `--auth-surface`, `--auth-border`, `--copper`, `--copper-foreground`, `--copper-glow`) — sem hardcode de cores nos componentes.
3. Reescrever `src/pages/Auth.tsx`:
   - manter `useAuth`, `signIn`, `signUp`, `quickLogin`, `useEffect` de redirect e estados existentes;
   - aplicar a nova estrutura visual (header de marca + card glass + tabs + form + divisória + grelha de papéis + link de retorno) usando classes Tailwind com os novos tokens.
4. Verificar build e abrir `/auth` no preview para confirmar o resultado em desktop e mobile.

## Ficheiros afectados
- `src/pages/Auth.tsx` (reescrita visual)
- `src/index.css` (novos tokens da página auth)
- `tailwind.config.ts` (famílias Sora/Manrope + eventuais cores semânticas)
- `src/main.tsx` (imports de fontsource)
- `package.json` (dependências de fontes)
