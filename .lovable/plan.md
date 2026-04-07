
# Analise de Requisitos vs Implementacao - INCA Coffee Trace

## Metodologia
Cruzamento sistematico do documento "Levantamento de Requisitos para o Sistema Digital da Cadeia do Cafe" (18 paginas) com o estado actual da base de dados, rotas e componentes do sistema.

---

## A) MAPEAMENTO DIGITAL - Estado Actual

### Implementado
| Requisito | Estado | Detalhes |
|-----------|--------|----------|
| Producao (exploracoes, parcelas, GPS) | COMPLETO | Tabelas `exploracoes`, `parcelas` com coordenadas, area, varietais, praticas agricolas |
| Colheita | COMPLETO | Tabela `colheitas` com data, metodo, volume, campanha, ligada a parcela |
| Processamento | COMPLETO | Tabela `transformacoes` com etapa, parametros JSON, rendimento, lote resultado |
| Secagem | COMPLETO | Tabela `secagens` com metodo, humidade final, temperatura, tempo |
| Armazenamento | COMPLETO | Tabela `armazenamento` com humidade, temperatura, quantidade, tipo movimento |
| Transporte/Logistica | COMPLETO | Tabela `logistica` com checkpoints JSON, temp/humidade media, rota, veiculo |
| Exportacao | COMPLETO | Tabela `exportacoes` com EUDR, documentos, porto, navio |
| Comercializacao | COMPLETO | Tabela `comercializacao` com contrato, preco, incoterm, moeda |
| Lote com ID unico | COMPLETO | Funcao `generate_lot_reference()`, campo `referencia_lote` |
| QR Code | COMPLETO | Funcao `generate_qr_code()`, campo `qr_code` em lotes |
| RFID (opcional) | COMPLETO | Campo `rfid_uid` em lotes |

### Em Falta ou Incompleto
| Requisito do Documento | Estado | Prioridade |
|------------------------|--------|------------|
| **Torra** (perfil, curva tempo/temp, perda peso) | EM FALTA | Media |
| **Embalagem** (tipo, data, validade, codigo QR final) | EM FALTA | Media |
| **Divisao/Agregacao de Lotes** (sub-lotes, blends com rastreio de origem) | EM FALTA | Alta |
| Insumos utilizados (fertilizantes, pesticidas) na producao | PARCIAL | Media |
| Percentagem de frutos maduros na colheita | EM FALTA | Baixa |
| Tempo de fermentacao e pH no processamento | PARCIAL | Media |
| Consumo de agua no processamento | EM FALTA | Baixa |

---

## B) INTEGRACAO DE QUALIDADE - Estado Actual

### Implementado
| Requisito | Estado | Detalhes |
|-----------|--------|----------|
| Classificacao SCA (0-100) | COMPLETO | Campo `classificacao_sensorial` em lotes |
| Certificacoes (UTZ, Fair Trade, Rainforest, etc.) | COMPLETO | Tabela `qualidade_certificacoes` com array de certificacoes |
| Humidade (%) | COMPLETO | Campos em lotes, secagens, armazenamento |
| Defeitos fisicos | COMPLETO | Campo `defeitos_ppm` em lotes |
| Laboratorio | COMPLETO | Campo `laboratorio` em qualidade_certificacoes |
| Parametros de teste (JSON) | COMPLETO | Campo `parametros` em qualidade_certificacoes |
| Visitas tecnicas / inspecao de campo | COMPLETO | Tabela `visitas_tecnicas` com conformidade, fotos, acoes |
| Accoes de controlo | COMPLETO | Tabela `acoes_controlo` com prazos e estados |

### Em Falta ou Incompleto
| Requisito do Documento | Estado | Prioridade |
|------------------------|--------|------------|
| **Checklists digitais por etapa** (mobile, aprovado/reprovado/condicional) | EM FALTA | Alta |
| **Limites aceitaveis por PCC** (regras automaticas de alerta) | EM FALTA | Alta |
| **Perfil sensorial detalhado** (aroma, acidez, corpo, sabor separados) | PARCIAL | Media |
| Validacao multi-nivel (operacional -> tecnico -> auditoria) | PARCIAL | Media |
| Integracao com referenciais internacionais (Fairtrade, Rainforest como indicadores) | PARCIAL | Baixa |

---

## C) RASTREABILIDADE - Estado Actual

### Implementado
| Requisito | Estado | Detalhes |
|-----------|--------|----------|
| ID unico por lote (formato PAIS-REGIAO-...) | COMPLETO | `generate_lot_reference()` |
| QR Code na embalagem | COMPLETO | Gerado automaticamente |
| Registo de eventos (colheita, processamento, secagem, etc.) | COMPLETO | Via tabelas separadas ligadas ao lote |
| Portal publico de verificacao | COMPLETO | Rota `/verificar` com busca por referencia |
| Historico do lote | COMPLETO | Pagina `/lotes/:id` com tabs (origem, secagem, qualidade) |
| Auditoria / logs | COMPLETO | Tabelas `auditoria` e `audit_logs` |
| Blockchain hash (preparado) | COMPLETO | Campo `blockchain_tx_hash` em lotes e auditoria |

### Em Falta ou Incompleto
| Requisito do Documento | Estado | Prioridade |
|------------------------|--------|------------|
| **Linha do tempo visual do lote** (timeline completa todas as etapas) | PARCIAL | Alta |
| **Divisao e agregacao de lotes** com rastreio de genealogia | EM FALTA | Alta |
| **Funcionamento offline + sincronizacao** | EM FALTA | Alta |
| Consulta publica via QR com dados de qualidade e certificacoes | PARCIAL | Media |

---

## D) INTERFACE E ACESSO - Estado Actual

### Implementado
| Requisito | Estado |
|-----------|--------|
| Perfis de utilizador (8 roles) | COMPLETO |
| Permissoes por perfil (RLS + RBAC) | COMPLETO |
| Dashboard por perfil | COMPLETO |
| Plataforma web | COMPLETO |
| Registo de accoes (log) | COMPLETO |

### Em Falta
| Requisito do Documento | Estado | Prioridade |
|------------------------|--------|------------|
| **App mobile nativa** (campo e unidades de processamento) | EM FALTA | Alta |
| **Interface simples para nao-tecnicos** (simplificacao UX) | PARCIAL | Media |

---

## E) SIM (Sistema de Informacao ao Mercado)

### Implementado
| Requisito | Estado |
|-----------|--------|
| Tabela `sim_mercado` com indicadores, precos, volumes | COMPLETO |
| Dashboard SIM com graficos | COMPLETO |
| Portal SIM publico | COMPLETO |
| Boletim de mercado | COMPLETO |

---

## RESUMO EXECUTIVO - Gaps Prioritarios

### Prioridade ALTA (funcionalidades core do documento nao implementadas)
1. **Divisao e Agregacao de Lotes** - O documento exige rastrear sub-lotes e blends mantendo genealogia. Actualmente nao existe logica de parent/child entre lotes.
2. **Checklists Digitais por Etapa** - Formularios de verificacao mobile por PCC com resultado automatico (aprovado/reprovado/condicional).
3. **Linha do Tempo Visual Completa do Lote** - Timeline unificada mostrando todos os eventos (colheita -> processamento -> secagem -> armazenamento -> transporte -> exportacao) num unico painel.
4. **Funcionamento Offline** - O documento exige explicitamente funcionamento offline com sincronizacao automatica. Isto requer PWA com service workers ou app nativa.

### Prioridade MEDIA (funcionalidades parciais ou campos em falta)
5. **Modulo de Torra** - Etapa nao coberta (perfil de torra, curva tempo/temperatura, perda de peso).
6. **Modulo de Embalagem** - Etapa nao coberta (tipo embalagem, validade, lote final).
7. **Perfil Sensorial Detalhado** - Campos separados para aroma, acidez, corpo, sabor, aftertaste (actualmente so existe score global SCA).
8. **Limites e Alertas Automaticos por PCC** - Definir limites aceitaveis (ex: humidade 10-12%) com alertas automaticos quando ultrapassados.

### Prioridade BAIXA (nice-to-have)
9. Consumo de agua no processamento
10. Percentagem de frutos maduros na colheita
11. pH no processamento

---

## Plano de Implementacao Recomendado

### Fase 1 - Genealogia de Lotes e Timeline (impacto alto)
- Adicionar campos `parent_lote_ids` e `tipo_transformacao` (divisao/agregacao) na tabela `lotes`
- Criar componente visual de timeline completa do lote
- Enriquecer portal publico `/verificar` com timeline

### Fase 2 - Checklists e PCC (qualidade)
- Criar tabela `checklists` com items por etapa, limites, resultados
- Interface mobile-friendly para preenchimento rapido
- Alertas automaticos quando limites sao ultrapassados

### Fase 3 - Torra e Embalagem
- Criar tabelas `torras` e `embalagens`
- Adicionar paginas de registo e consulta
- Integrar na timeline do lote

### Fase 4 - PWA / Offline
- Configurar service worker e manifest
- Cache de dados criticos
- Sincronizacao em background

**Ficheiros a alterar:** Migracao de base de dados (novas tabelas/campos), novos componentes React, actualizacao de `App.tsx` com novas rotas, actualizacao de `DashboardLayout.tsx` com novos menus.
