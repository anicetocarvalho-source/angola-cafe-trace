// Divisão político-administrativa de Angola — 21 províncias (reforma de 2024).
// Fonte única de verdade para selects, filtros e validações.
export const PROVINCIAS_ANGOLA = [
  "Bengo",
  "Benguela",
  "Bié",
  "Cabinda",
  "Cuando",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cubango",
  "Cunene",
  "Huambo",
  "Huíla",
  "Icolo e Bengo",
  "Luanda",
  "Lunda Norte",
  "Lunda Sul",
  "Malanje",
  "Moxico",
  "Moxico Leste",
  "Namibe",
  "Uíge",
  "Zaire",
] as const;

export type ProvinciaAngola = (typeof PROVINCIAS_ANGOLA)[number];
