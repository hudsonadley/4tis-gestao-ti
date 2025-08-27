# 📋 Changelog - 4TIS SaaS

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2025-01-27

### 🔥 Adicionado

#### 🏢 Sistema de Offboarding Completo
- **Processo de inativação** que permite colaboradores com equipamentos pendentes
- **Interface de offboarding** com checklist de equipamentos
- **Gestão de devoluções parciais** durante o processo de desligamento
- **Lista automática de colaboradores** com equipamentos pendentes
- **Botão "Resolver Pendência"** para equipamentos devolvidos posteriormente
- **Botão "Desconto em Rescisão"** com geração automática de mensagem para RH
- **Rastreabilidade completa** do processo de desligamento

#### 📥 Importação Inteligente de Chamados
- **Interface de importação** via modal intuitivo
- **Extração automática de dados** usando regex avançado para identificar:
  - Número do chamado
  - Nome do usuário
  - Email do solicitante
  - Descrição do problema
  - Prioridade do chamado
- **Pré-cadastro automático** de colaboradores quando não encontrados
- **Sistema de alertas** para colaboradores pré-cadastrados
- **Preview em tempo real** dos dados extraídos

#### 📦 Histórico Avançado de Equipamentos
- **Rastreabilidade completa** de uso de equipamentos
- **Tempo de uso calculado** automaticamente (em dias)
- **Observações obrigatórias** na devolução individual
- **Histórico permanente** e não editável pelo usuário
- **Interface de devolução** individual melhorada
- **Modal de histórico** com timeline de uso

#### 🔔 Sistema de Alertas
- **Notificações automáticas** no dashboard
- **Alertas para colaboradores pré-cadastrados** que precisam ter cadastro finalizado
- **Badges nas abas** para indicar pendências
- **Resolução de alertas** com um clique
- **API de alertas** para gerenciamento

#### 🏗️ Backend Completo
- **API RESTful** com Node.js + Express
- **Banco PostgreSQL** (Neon Database) para produção
- **Migrations automáticas** na inicialização
- **Transações de banco** para operações críticas
- **Deploy automático** via Railway Platform

### 🔄 Alterado

#### 🎯 Funcionalidades Existentes
- **Processo de inativação** de colaboradores agora permite equipamentos pendentes
- **Devolução de equipamentos** agora registra tempo de uso automaticamente
- **Interface de equipamentos** com botões de histórico e devolução
- **Sistema de colaboradores** com status de pré-cadastro
- **Dashboard** com alertas e notificações integradas

#### 🔧 Melhorias Técnicas
- **Performance otimizada** com queries de banco eficientes
- **Validações robustas** em frontend e backend
- **Tratamento de erros** consistente em toda aplicação
- **Estrutura modular** com separação clara de responsabilidades

### 🛠️ Corrigido

#### 🐛 Bugs Resolvidos
- **Inativação de colaboradores** agora funciona mesmo com equipamentos atribuídos
- **Histórico de equipamentos** agora é preservado permanentemente
- **Observações de devolução** são obrigatórias e validadas
- **Status de equipamentos** atualizado corretamente após devolução
- **Sincronização de dados** entre frontend e backend

#### 🔒 Segurança
- **Validação de entrada** em todas as APIs
- **Sanitização de dados** para prevenir XSS
- **Transações atômicas** para operações críticas
- **Tratamento de erros** sem exposição de dados sensíveis

### 📊 Banco de Dados

#### 🗄️ Novas Tabelas
- `offboarding_records` - Registros de processos de offboarding
- `pending_resolutions` - Resoluções de pendências de equipamentos
- `alerts` - Sistema de alertas e notificações
- `equipment_return_history` - Histórico detalhado de devoluções

#### 🔄 Colunas Adicionadas
- `equipment.assigned_at` - Data de atribuição do equipamento
- `equipment.patrimony` - Número do patrimônio
- `employees.department` - Departamento do colaborador
- `tickets.external_ticket_number` - Número do chamado externo
- `tickets.category` - Categoria do chamado
- `equipment_return_history.usage_days` - Dias de uso calculados

### 🚀 Deploy e Infraestrutura

#### ☁️ Produção
- **Railway Platform** para deploy automático
- **Neon Database** para PostgreSQL em produção
- **GitHub Actions** para CI/CD (futuro)
- **Monitoramento** de performance e erros

#### 🔧 Desenvolvimento
- **Ambiente local** com Node.js
- **Hot reload** para desenvolvimento
- **Logs detalhados** para debugging
- **Estrutura modular** para facilitar manutenção

---

## [1.0.19] - 2025-01-26

### 🔄 Alterado
- Corrigido método resolverPendencia para usar chamadas REST diretas
- Melhorada a gestão de estado dos equipamentos
- Adicionado suporte a observações detalhadas
- Otimizado o processo de devolução de equipamentos
- Implementada validação robusta de dados

### 🛠️ Corrigido
- Método de resolução de pendências
- Performance do sistema
- Bugs no processo de devolução
- Validação no formulário de equipamentos

---

## [1.0.18] - 2025-01-25

### 🔄 Alterado
- Atualização do método de resolução de pendências
- Melhorias na performance do sistema
- Correção de bugs no processo de devolução
- Nova validação no formulário de equipamentos

---

## [1.0.17] - 2025-01-24

### 🔥 Adicionado
- Campo obrigatório de observações na devolução
- Melhorado sistema de registro no histórico
- Interface mais intuitiva na devolução
- Validações de dados reforçadas

---

## [1.0.16] - 2025-01-23

### 🔄 Alterado
- Correção do sistema de inativação e devolução
- Melhoria na performance geral do sistema
- Correções no sistema de changelog
- Interface simplificada para periféricos
- Controle de quantidade aprimorado
- Toast notifications sempre visíveis
- Sistema de valores totais melhorado

---

## [1.0.11] - 2025-01-20

### 🔥 Adicionado
- Sistema de changelog automático
- Notificações de atualização
- Controle de versão aprimorado

### 🔄 Alterado
- Interface de usuário melhorada
- Performance otimizada
- Correções de bugs diversos

---

## [1.0.0] - 2025-01-15

### 🔥 Adicionado
- Sistema completo de gestão de TI
- Gestão de colaboradores
- Inventário de equipamentos
- Sistema de periféricos
- Gestão de chamados
- Dashboard inteligente
- Sistema de configurações
- Interface responsiva
- Armazenamento local
- Sistema de backup/restauração

### 🎯 Funcionalidades Iniciais
- CRUD completo para todas as entidades
- Validações robustas
- Interface moderna e intuitiva
- Sistema de notificações
- Controle de status
- Histórico de atividades
- Estatísticas em tempo real

---

## Tipos de Mudanças

- `🔥 Adicionado` para novas funcionalidades
- `🔄 Alterado` para mudanças em funcionalidades existentes
- `🗑️ Removido` para funcionalidades removidas
- `🛠️ Corrigido` para correção de bugs
- `🔒 Segurança` para vulnerabilidades corrigidas

## Links

- [Repositório](https://github.com/hudsonadley/4tis-gestao-ti)
- [Demo Live](https://4tis-gestao-ti-production.up.railway.app)
- [Issues](https://github.com/hudsonadley/4tis-gestao-ti/issues)
- [Releases](https://github.com/hudsonadley/4tis-gestao-ti/releases)

