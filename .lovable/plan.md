

# Plano: Documento Word (.docx) — Descrição Completa da Plataforma INCA Coffee Trace

## Objectivo
Gerar um documento Word profissional com a descrição completa da plataforma e todos os seus módulos, pronto para integrar numa apresentação institucional.

## Estrutura do Documento

1. **Capa** — Título "INCA Coffee Trace", subtítulo "Plataforma Nacional de Rastreabilidade do Café de Angola", INCA/MINDCOM/AIPEX
2. **Visão Geral** — Missão, contexto (EUDR, valorização do café angolano), arquitectura geral (28 módulos, 44 rotas, 8 perfis de utilizador, 29 tabelas)
3. **Perfis de Utilizador** — Tabela com os 8 perfis (Admin INCA, Tecnico INCA, Produtor, Cooperativa, Processador, Transportador, Exportador, Comprador) e respectivas permissões
4. **Módulos da Cadeia de Valor** — Descrição detalhada de cada módulo:
   - Produção (Explorações, Parcelas, Colheitas, Manutenção Agrícola)
   - Gestão de Lotes (criação, QR automático, operações split/blend, genealogia SVG, timeline)
   - Secagem e Processamento (registos de secagem, transformação)
   - Torra (perfis, curvas temperatura/tempo, perda de peso)
   - Embalagem (tipo, validade, códigos finais)
   - Armazenamento (stocks, condições ambientais)
   - Logística (rotas, veículos, checkpoints GPS, temperatura/humidade)
   - Exportação e EUDR (embarque, documentação, pacote EUDR)
   - Comercialização (contratos, compradores, Incoterms)
5. **Módulos de Controlo e Qualidade**
   - Validação INCA (workflow aprovação/reprovação)
   - Qualidade e Certificações (análise SCA com gráfico radar, exportação PDF bilingue com hash digital)
   - Checklists PCC (pontos críticos de controlo)
   - Fiscalização (visitas técnicas, acções de controlo, evidências fotográficas)
6. **Módulos de Inteligência e Informação**
   - SIM — Sistema de Informação de Mercado (preços, volumes, comparação regional)
   - Portal Público SIM e Boletim Mensal
   - IoT — Sensores (leituras temperatura/humidade em tempo real)
7. **Módulos de Administração**
   - Dashboard por perfil (8 dashboards especializados)
   - Gestão de utilizadores e roles
   - Auditoria (logs de alterações)
   - Relatórios
   - Mapa interactivo de explorações
8. **Portal Público**
   - Verificação de lotes por QR/referência (sem autenticação)
   - Transparência: origem, qualidade, certificações, timeline
9. **Segurança e Arquitectura Técnica**
   - Autenticação multi-perfil, RLS por função, encriptação PDF, assinatura digital SHA-256
10. **Resumo** — Tabela síntese com todos os módulos, rotas e perfis de acesso

## Detalhes Técnicos

- Geração via biblioteca `docx` (docx-js) em Node.js
- Formatação profissional com estilos Heading1/2/3, tabelas com bordas, cores institucionais
- Paleta: verde escuro (#2C5F2D) + dourado (#B8860B) + branco
- Output: `/mnt/documents/INCA_Coffee_Trace_Descricao.docx`
- Validação e QA do documento gerado

