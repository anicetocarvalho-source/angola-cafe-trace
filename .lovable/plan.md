# Apresentação Workshop MUKAFE — PPTX Institucional

Gerar um ficheiro `MUKAFE_Workshop_Apresentacao.pptx` (~25 slides, pt-PT, tom executivo) para o workshop de apresentação do projecto, distribuído em `/mnt/documents/` para download.

## Identidade visual
- Paleta inspirada na marca actual do INCA Coffee Trace (Burnt Sienna / espresso): fundo escuro `#1A0F0A`, cobre `#B85042`, areia `#E7E8D1`, sage `#A7BEAE`, off-white `#F5F0E8`.
- Tipografia: títulos Georgia bold, corpo Calibri (compatível PowerPoint nativo, sem necessidade de fontes externas).
- Motivo recorrente: barra cobre fina à esquerda + numeração de slide em canto inferior direito; slides de secção em fundo escuro, conteúdo em fundo claro (estrutura "sandwich").

## Estrutura (25 slides)

**Abertura (3)**
1. Capa — Logo + "MUKAFE — Sistema Nacional de Rastreabilidade do Café" + INCA + data do workshop.
2. Agenda do workshop.
3. Contexto — Café angolano, desafios de rastreabilidade, exigência EUDR.

**Visão & Objectivos (3)**
4. Visão do MUKAFE.
5. Objectivos estratégicos (4 cards: rastreabilidade, conformidade EUDR, qualidade SCA, inclusão digital de produtores).
6. Beneficiários (produtor → cooperativa → processador → transportador → exportador → comprador → INCA).

**Arquitectura do Sistema (4)**
7. Visão geral da plataforma (PWA offline-first, multi-perfil, mobile + desktop).
8. Os 8 perfis RBAC e o que cada um faz.
9. Stack tecnológico de alto nível (PWA, base de dados segura com RLS, mapas OSM, sincronização offline).
10. Segurança e governança de dados (RLS, auditoria imutável, RNPA/IDF).

**Módulos Funcionais (8)**
11. Gestão de Produtores e Explorações (RNPA/IDF, parcelas com GPS).
12. Colheitas e Manutenção Agrícola.
13. Lotes e Genealogia (formato `LOT-YYYY-NNNNNN`, split/blend até 5 níveis).
14. Qualidade & Perfil Sensorial SCA (radar, PDF cifrado).
15. Logística & Checkpoints de Transporte (temperatura, humidade, GPS).
16. Processamento, Armazenamento, Torra e Embalagem.
17. Exportação & Conformidade EUDR (workflow completo).
18. SIM — Sistema de Informação de Mercado + Boletins.

**Diferenciadores (4)**
19. Portal Público de Verificação por QR (sem PII).
20. IoT — Ingestão de sensores com HMAC.
21. Offline-first & Sincronização (fila local, conflitos).
22. Fiscalização INCA (visitas técnicas, galeria fotográfica, checklists).

**Encerramento (3)**
23. Status actual e roadmap (módulos implementados vs próximos passos).
24. Impacto esperado (exportação conforme, valorização do café angolano, inclusão digital).
25. Obrigado + contactos / chamada para acção.

## Conteúdo dos slides
- Cada slide com 1 ideia principal, ≤4 bullets, títulos 40-54pt, corpo 24-32pt.
- Slides de stats com números grandes (ex.: "8 perfis RBAC", "5 níveis de blend", "100% rastreável EUDR").
- Slides de processo com setas/numeração (ex.: cadeia produtor→colheita→lote→exportação).
- Sem imagens externas (evita dependências) — uso de formas, ícones unicode discretos e blocos de cor para criar interesse visual.

## Detalhes técnicos
1. Confirmar `pptxgenjs` disponível (`npm install -g pptxgenjs` se necessário).
2. Escrever script `/tmp/mukafe/build_deck.js` usando pptxgenjs, com:
   - Layout master 16:9 com paleta definida.
   - Slide masters: capa, secção (dark), conteúdo (light), encerramento.
   - Funções auxiliares `addSectionDivider`, `addContentSlide`, `addStatRow`.
3. Gerar `/mnt/documents/MUKAFE_Workshop_Apresentacao.pptx`.
4. QA obrigatório: converter para PDF via `run_libreoffice.py`, depois `pdftoppm` em JPG e inspeccionar todos os 25 slides para detectar overflow, sobreposição, contraste, alinhamento; corrigir e re-renderizar.
5. Validar texto com `python -m markitdown` para confirmar conteúdo, ordem e ausência de placeholders.
6. Entregar com tag `<presentation-artifact>` para download imediato.

## Fora do âmbito
- Não altera código da aplicação.
- Não inclui screenshots reais do sistema (podem ser adicionados depois, se desejado).
- Não cria rota `/apresentacao` no app.
