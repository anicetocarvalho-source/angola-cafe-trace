# Setup do Sistema INCA Coffee Trace

## Dados Demo Carregados ✅

O sistema já tem dados de demonstração carregados:

### Entidades
- **Cooperativa Café Huambo** (Produtor) - Huambo
- **Fazenda São José** (Produtor) - Benguela
- **Associação Produtores Bié** (Cooperativa) - Bié
- **Café Angola Processing SA** (Processador) - Luanda
- **Angola Coffee Exports Lda** (Exportador) - Luanda

### Explorações Agrícolas
- 5 explorações com coordenadas GPS reais de Angola
- 4 validadas, 1 pendente de validação
- Distribuídas por Huambo, Benguela e Bié

### Lotes de Café
- 8 lotes demo em diferentes estados:
  - 5 aprovados (com SCA scores entre 82-89)
  - 2 pendentes
  - 1 reprovado
- Com dados de humidade, temperatura e classificação sensorial

### Dados SIM (Mercado)
- Preços spot nacionais e internacionais
- Volumes de produção e exportação 2024

---

## Como Testar o Sistema

### 1. Criar uma conta
Aceda a `/auth` e crie uma nova conta com email e password.

### 2. Atribuir perfis (requer acesso admin)
Para testar diferentes funcionalidades, precisará de ter perfis atribuídos:

**Perfis disponíveis:**
- `admin_inca` - Acesso total ao sistema
- `tecnico_inca` - Validar explorações e lotes, controlo de qualidade
- `produtor` - Registar explorações, lotes, colheitas
- `cooperativa` - Gestão multi-produtor
- `processador` - Transformação e processamento
- `transportador` - Logística e checkpoints
- `exportador` - Gestão de exportações
- `comprador` - Consulta e verificação

**Para atribuir perfis:**
1. Primeiro utilizador registado deve ter o role `admin_inca` atribuído manualmente na base de dados
2. Depois pode usar o painel Admin (`/admin`) para atribuir perfis aos outros utilizadores

**SQL para tornar primeiro utilizador admin (execute na base de dados):**
```sql
-- Obter ID do primeiro utilizador
SELECT id, email FROM auth.users ORDER BY created_at LIMIT 1;

-- Atribuir role admin (substitua USER_ID_AQUI pelo ID obtido acima)
INSERT INTO public.user_roles (user_id, role) 
VALUES ('USER_ID_AQUI', 'admin_inca');
```

### 3. Testar Funcionalidades

**Como Admin INCA:**
- Dashboard com KPIs gerais
- Gestão de utilizadores em `/admin`
- Aprovar/reprovar em `/validacao`

**Como Técnico INCA:**
- Validar explorações pendentes
- Avaliar qualidade de lotes (atribuir SCA score)
- Aprovar/reprovar lotes

**Como Produtor:**
- Registar novas explorações em `/exploracoes/nova`
- Criar lotes em `/lotes/novo`
- Registar secagem em `/secagem/nova`

**Público (sem login):**
- Verificar lotes aprovados em `/verificar`
- Ver origem, qualidade e certificações

---

## Estrutura do Sistema

### Módulos Implementados ✅
- ✅ Autenticação multi-perfil
- ✅ Dashboard por papel (Admin, Técnico, Produtor)
- ✅ Gestão de explorações agrícolas
- ✅ Gestão de lotes (com QR automático)
- ✅ Mapa de explorações (com filtros)
- ✅ Portal público de verificação
- ✅ Workflow de validação INCA
- ✅ Controlo de qualidade e certificações
- ✅ Admin panel (gestão users/roles)
- ✅ Módulo de secagem
- ✅ SIM - Sistema de Informação de Mercado
- ✅ Módulo de exportação (base)

### Base de Dados Completa ✅
- 15 tabelas principais
- RLS policies por perfil
- Triggers automáticos (QR, referências, timestamps)
- Enums para tipos e estados
- Relações completas entre entidades

### Próximos Passos (Opcionais)
- [ ] Integração real com Leaflet no mapa
- [ ] Upload de ficheiros (fotos, documentos)
- [ ] Módulo de transformação
- [ ] Logística com GPS tracking
- [ ] Integração IoT para sensores
- [ ] Blockchain para imutabilidade
- [ ] Geração de relatórios PDF
- [ ] Submissão EUDR real
- [ ] Gráficos avançados no SIM

---

## Acesso Rápido

- **Landing**: `/`
- **Login**: `/auth`
- **Dashboard**: `/dashboard`
- **Verificação Pública**: `/verificar`
- **Mapa**: `/mapa`
- **Admin**: `/admin` (requer role admin_inca)

---

Para suporte técnico, consulte a documentação em `/relatorios` ou contacte o INCA.
