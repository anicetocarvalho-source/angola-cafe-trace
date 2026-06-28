## Objectivo

Actualizar o sistema MUKAFE/INCA Coffee Trace para reflectir a divisão político-administrativa actual de Angola, com **21 províncias** (reforma de 2024), em vez das 18 anteriores.

## Lista oficial das 21 províncias

Bengo, Benguela, Bié, Cabinda, Cuando, Cuanza Norte, Cuanza Sul, Cubango, Cunene, Huambo, Huíla, Icolo e Bengo, Luanda, Lunda Norte, Lunda Sul, Malanje, Moxico, Moxico Leste, Namibe, Uíge, Zaire.

Mudanças face à lista antiga (18):
- "Cuando Cubango" → dividida em **Cuando** e **Cubango**
- Nova província **Icolo e Bengo** (desanexada de Luanda)
- Nova província **Moxico Leste** (desanexada de Moxico)

## Alterações no código

1. **`src/pages/NovaExploracao.tsx`** — substituir o array `provincias` (linhas 17–21) pela lista alfabética das 21 províncias.

2. **Centralizar a lista** num novo ficheiro `src/lib/provincias.ts` exportando `PROVINCIAS_ANGOLA` (array) para evitar futuras divergências, e importá-lo em `NovaExploracao.tsx`. Assim qualquer página futura usa a mesma fonte.

3. **Verificação dos restantes locais** — todos os outros ficheiros (`Exploracoes.tsx`, `Mapa.tsx`, `Relatorios.tsx`, etc.) derivam a lista dinamicamente dos dados em base (`SELECT DISTINCT provincia`), pelo que não precisam de mudança de código.

## Alterações nos dados (Lovable Cloud)

Verificação actual: a tabela `exploracoes` só contém Benguela, Bié e Huambo — nenhuma referência a "Cuando Cubango", logo **não é necessária migração de dados de produção**.

Será apenas adicionada uma actualização defensiva (idempotente) caso surjam registos antigos:
- `UPDATE exploracoes SET provincia = 'Cuando' WHERE provincia = 'Cuando Cubango';` (executado via tool de insert/update; não corre se não houver linhas afectadas).

## Portal público

O portal público (`/verificar`, `/sim-publico`, landing `Index.tsx`) exibe a província proveniente da base de dados, sem listas fixas. Fica automaticamente alinhado após a alteração acima.

## Fora do âmbito

- Não há textos visíveis no UI a mencionar "18 províncias".
- Não há alterações no PPTX já gerado (o pedido refere-se ao sistema/portal).
- Não são alteradas tabelas, RLS, nem tipos gerados.

## Validação

- `tsgo` para garantir que o novo `src/lib/provincias.ts` compila.
- Abrir `/exploracoes/nova` e confirmar que o `Select` mostra as 21 províncias em ordem alfabética, incluindo Cuando, Cubango, Icolo e Bengo e Moxico Leste.
