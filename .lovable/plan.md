

# Plano: Adicionar Diagramas ao Documento Word

## Objectivo
Gerar uma versão actualizada do documento Word (`INCA_Coffee_Trace_Descricao_v2.docx`) com dois diagramas visuais integrados:

1. **Diagrama de Arquitectura do Sistema** — camadas da plataforma (Frontend, API, Base de Dados, Integrações externas)
2. **Diagrama do Fluxo da Cadeia de Valor** — desde a produção até ao consumidor final

## Abordagem Técnica

Como o `docx-js` não suporta desenho vectorial nativo, os diagramas serão:
1. Gerados como imagens PNG via scripts Python (usando `matplotlib` ou construção manual com `Pillow`)
2. Inseridos no documento Word como `ImageRun`

### Diagrama 1 — Arquitectura do Sistema
Diagrama em camadas horizontais com caixas coloridas:
- **Camada Frontend**: React/Vite, PWA, Dashboards por perfil
- **Camada API/Auth**: Supabase Auth, RLS, Edge Functions
- **Camada Dados**: PostgreSQL, 29 tabelas, Triggers, Auditoria
- **Integrações**: IoT, EUDR, RNPA, Blockchain, Certificações
- Setas de conexão entre camadas

### Diagrama 2 — Fluxo da Cadeia de Valor
Diagrama horizontal com setas sequenciais:
```text
Produção → Colheita → Secagem → Processamento → Torra → Embalagem → Armazenamento → Logística → Exportação → Comercialização
```
- Cada etapa numa caixa com ícone/cor distinta
- Indicação dos perfis de utilizador responsáveis
- Pontos de controlo de qualidade (SCA, PCC) marcados

### Paleta
Mantém as cores institucionais: verde escuro (#2C5F2D), dourado (#B8860B), branco, cinza escuro.

## Passos de Implementação

1. Criar script Python para gerar os 2 diagramas como PNG (`matplotlib`)
2. Regenerar o documento Word completo com os diagramas inseridos após as secções "Visão Geral" e "Módulos da Cadeia de Valor"
3. QA: converter para PDF, inspeccionar visualmente cada página
4. Output: `/mnt/documents/INCA_Coffee_Trace_Descricao_v2.docx`

