# Listas DPA (Província → Município → Comuna) nos formulários

O ficheiro enviado é a Divisão Político-Administrativa oficial de Angola (formato ODK choices):
- 21 Províncias
- 326 Municípios (com província-mãe)
- 542 Comunas (com município-mãe)

Vou transformá-lo numa fonte única de verdade em código e ligá-lo aos formulários com selects dependentes (escolher província filtra municípios; escolher município filtra comunas).

## 1. Fonte única de dados

Novo ficheiro: `src/lib/dpa-angola.ts`

Gerado a partir do XLSX (sheet1 contém as três listas com parentes), com normalização de acentos divergentes ("Huila"→"Huíla", "Bie"→"Bié") para casarem com `PROVINCIAS_ANGOLA`:

```ts
export const DPA_ANGOLA: Record<Provincia, Record<string, string[]>> = {
  Bengo: { Ambriz: ["Ambriz", "Bela Vista", ...], ... },
  ...
};
export const MUNICIPIOS_POR_PROVINCIA: Record<Provincia, string[]>;
export const COMUNAS_POR_MUNICIPIO: Record<string, string[]>;
export function getMunicipios(p: Provincia): string[];
export function getComunas(p: Provincia, m: string): string[];
```

`src/lib/provincias.ts` mantém-se (já com 21 nomes canónicos); o novo módulo importa daí.

## 2. Componente reutilizável

Novo: `src/components/forms/LocalizacaoSelect.tsx` — três `Select` encadeados (Província/Município/Comuna) integrados com `react-hook-form` (`Controller`). Ao mudar província limpa município+comuna; ao mudar município limpa comuna. Município e comuna ficam disabled enquanto o pai não estiver escolhido.

## 3. Formulários a actualizar

Substituir os inputs livres de município/comuna por `LocalizacaoSelect` e estender o schema Zod:

- `src/pages/NovaExploracao.tsx` — actualmente `provincia` (enum) + `municipio` (texto livre) + `comuna` (texto livre). Passa a usar selects dependentes; schema valida `municipio ∈ getMunicipios(provincia)` e `comuna ∈ getComunas(provincia, municipio)` (comuna continua opcional).
- `src/pages/NovaParcela.tsx` — se tiver campos de localização, idem.
- `src/pages/NovaVisita.tsx` — idem para o campo de localização da visita, se aplicável.
- Qualquer outro formulário com `provincia`/`municipio`/`comuna` (vou varrer com `rg` no início da implementação para garantir cobertura).

Filtros de leitura (`Exploracoes`, `Mapa`, `Relatorios`) continuam dinâmicos via `SELECT DISTINCT` — não mexer.

## 4. Testes de regressão

- `src/test/flows/dpa-angola.test.ts` (novo):
  - 21 províncias e cada uma com ≥1 município.
  - 326 municípios no total, sem duplicados, todos pertencem a uma das 21 províncias.
  - 542 comunas no total, sem duplicados, cada uma pertence a um município existente.
  - `getMunicipios("Huíla")` e `getComunas("Huíla", "Lubango")` retornam listas não-vazias (sanidade).
- `src/test/flows/provincia-validation.test.ts` — estender: município fora de `getMunicipios(provincia)` é rejeitado; comuna fora do município é rejeitada.

## 5. Dados existentes na BD

Os registos actuais em `exploracoes` têm `municipio`/`comuna` como texto livre. Não vou alterar dados antigos — apenas validar no insert/update. (Opcional, posso adicionar um relatório no `/admin → Integridade de Dados` listando registos cujo município/comuna não casa com a DPA oficial; diz se queres.)

## Detalhes técnicos

- Geração da constante: script Python local (não fica no repo) lê o XLSX e emite `src/lib/dpa-angola.ts` ordenado alfabeticamente, com `as const` para tipagem estrita.
- Normalização: tabela de aliases `{ "Huila":"Huíla", "Bie":"Bié" }` aplicada durante a geração para alinhar com `PROVINCIAS_ANGOLA`.
- O `Select` do shadcn/Radix permanece envolvido fora do `FormControl` conforme regra do projecto.
- Sem migração SQL — toda a mudança é frontend + lib + testes.
