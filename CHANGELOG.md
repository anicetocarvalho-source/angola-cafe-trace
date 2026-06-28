# Changelog

## 2026-06-28 — Actualização: 21 províncias de Angola

Reflexão da reforma político-administrativa de Angola de 2024 em todo o sistema,
portal e materiais do workshop.

### Mudanças face à divisão anterior (18 províncias)
- "Cuando Cubango" → dividida em **Cuando** e **Cubango**
- Nova província **Icolo e Bengo** (desanexada de Luanda)
- Nova província **Moxico Leste** (desanexada de Moxico)

### Lista oficial (21)
Bengo, Benguela, Bié, Cabinda, Cuando, Cuanza Norte, Cuanza Sul, Cubango, Cunene,
Huambo, Huíla, Icolo e Bengo, Luanda, Lunda Norte, Lunda Sul, Malanje, Moxico,
Moxico Leste, Namibe, Uíge, Zaire.

### Código
- `src/lib/provincias.ts` — fonte única `PROVINCIAS_ANGOLA` (21 valores).
- `src/pages/NovaExploracao.tsx` — schema passou a `z.enum(PROVINCIAS_ANGOLA)`,
  impedindo gravação de qualquer valor fora da lista.
- Restantes páginas (`Exploracoes`, `Mapa`, `Relatorios`, dashboards, `Validacao`,
  `Verificar`, `NovaVisita`, `NovaParcela`) derivam dinamicamente da base, pelo
  que reflectem automaticamente a nova divisão.

### Base de dados
- `UPDATE public.exploracoes SET provincia = 'Cuando' WHERE provincia = 'Cuando Cubango';`
  (idempotente; sem linhas afectadas nos dados actuais).

### Testes de regressão
- `src/test/flows/provincias.test.ts` — 8 testes: lista canónica, ordem
  alfabética, ausência do nome antigo, e scanner que bloqueia reintrodução de
  arrays hardcoded em qualquer ficheiro.
- `src/test/flows/provincia-validation.test.ts` — 29 testes do `z.enum`
  (aceitação das 21 válidas, rejeição de "Cuando Cubango", vazios, case
  incorrecto e tipos inválidos).

### Documentação
- `SETUP.md` — nova secção "Cobertura territorial" com a lista oficial.
- `MUKAFE_Workshop_Apresentacao_v2.pptx` — slide de contexto actualizado para
  mencionar explicitamente as 21 províncias e a reforma de 2024.
