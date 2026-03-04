

## Análise: Estado Actual vs Requisitos do Documento

### Resumo Executivo

O documento descreve dois sistemas integrados: (1) Sistema Digital de Qualidade e Rastreabilidade do Café e (2) Sistema de Informação ao Mercado (SIM). A implementação actual cobre a estrutura base de ambos, mas várias funcionalidades críticas estão incompletas ou ausentes.

---

### O QUE JÁ ESTÁ IMPLEMENTADO

**Sistema de Rastreabilidade (parcialmente completo)**
- Cadastro de produtores, explorações e parcelas com georreferenciação
- Gestão de lotes com identificador único, QR Code automático e referência
- Registo de colheitas, secagem e manutenção agrícola
- Controlo de qualidade (SCA score, humidade, defeitos, certificações)
- Workflow de validação INCA (aprovar/reprovar lotes e explorações)
- Portal público de verificação via referência do lote
- Gestão de exportações com documentação (BL, booking, certificados)
- Conformidade EUDR (campo eudr_pacote_id, verificação básica)
- Perfis de acesso diferenciados (8 roles com RLS)
- Fiscalização e visitas técnicas com acções de controlo
- Auditoria com logs de alterações
- IoT (sensores e leituras)
- Mapa de explorações
- Relatórios com exportação PDF
- Notificações e alertas de prazos

**SIM (implementação básica)**
- Página com dados mock de preços e volumes
- Tabela sim_mercado na base de dados
- Indicadores de bolsa (ICE Arábica/Robusta)

---

### O QUE FALTA IMPLEMENTAR

#### Prioridade Alta - Funcionalidades Core

1. **SIM com dados reais da base de dados**
   - A página SIM usa dados mock hardcoded; deveria consultar a tabela `sim_mercado`
   - Faltam gráficos de séries temporais com recharts (evolução de preços)
   - Faltam filtros por período, região e tipo de café
   - Falta análise de tendências e sazonalidade

2. **Módulo de Armazenamento**
   - Não existe página nem tabela para gestão de armazéns
   - Falta: entrada/saída de stock por lote, condições de armazenamento, histórico

3. **Módulo de Transformação (UI)**
   - Tabela `transformacoes` existe mas não há página/formulário
   - Falta: registo de fermentação, beneficiamento, rendimento

4. **Logística e Transporte (UI completa)**
   - Tabela `logistica` existe mas sem interface para transportadores
   - Falta: registo de checkpoints, timeline visual, condições de transporte

5. **Comercialização (UI)**
   - Tabela `comercializacao` existe mas sem interface
   - Falta: registo de contratos, preços, compradores

#### Prioridade Média - Funcionalidades Estratégicas

6. **SIM - Dashboards analíticos avançados**
   - Dashboards executivos com KPIs
   - Boletins de mercado periódicos (mensal/trimestral)
   - Análise comparativa por região e qualidade
   - Impacto da certificação nos preços
   - Custos logísticos e comerciais

7. **SIM - Portal Público de Informação de Mercado**
   - Página pública (sem login) com estatísticas agregadas do sector
   - Volumes de produção/exportação, destinos, tendências

8. **Relatórios avançados**
   - Relatório de produção por região
   - Relatório de qualidade e certificações
   - Relatório de conformidade EUDR
   - Relatório de exportações
   - Boletins de mercado em PDF

9. **Verificação pública melhorada**
   - Adicionar timeline de processamento ao portal
   - Mostrar certificações associadas
   - Mapa simplificado da origem

#### Prioridade Baixa - Funcionalidades Futuras

10. **API REST pública** - para integração com MINDCOM, AIPEX e parceiros
11. **App móvel offline-first** - recolha de dados no campo (fora do scope React web)
12. **Blockchain** - registos imutáveis (feature flag existe, implementação pendente)
13. **Interoperabilidade** - integração com RNPA/IDF, sistemas de certificação
14. **Encriptação AES-256 e WORM logs** - segurança avançada

---

### Plano de Implementação Recomendado

**Fase 1 - SIM funcional** (maior impacto imediato)
- Ligar página SIM à tabela `sim_mercado` com dados reais
- Adicionar gráficos de séries temporais (recharts)
- Adicionar filtros e análise de tendências
- Criar portal público SIM (sem login)

**Fase 2 - Completar cadeia de valor**
- Criar UI para Transformação
- Criar UI para Logística/Transporte
- Criar UI para Comercialização
- Criar módulo de Armazenamento (tabela + UI)

**Fase 3 - Relatórios e Boletins**
- Relatórios avançados por tipo (produção, qualidade, EUDR, exportação)
- Boletins de mercado em PDF
- Dashboard executivo para decisores

**Fase 4 - Integrações e segurança**
- API REST documentada
- Melhorias de segurança
- Feature flags para blockchain/RFID

---

### Conclusão

A implementação actual cobre aproximadamente **60-65%** dos requisitos do documento. A base de dados está bem estruturada e suporta a maioria dos módulos descritos. As maiores lacunas são: (1) o SIM que usa dados mock em vez de dados reais, (2) ausência de UI para transformação, logística, comercialização e armazenamento, e (3) relatórios/boletins avançados.

