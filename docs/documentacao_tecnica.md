# 4TIS - Sistema de Gestão de TI
## Documentação Técnica Completa v1.0.18

## Sumário
1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Arquitetura](#2-arquitetura)
3. [Tecnologias Utilizadas](#3-tecnologias-utilizadas)
4. [Estrutura do Banco de Dados](#4-estrutura-do-banco-de-dados)
5. [Módulos do Sistema](#5-módulos-do-sistema)
6. [Regras de Negócio](#6-regras-de-negócio)
7. [Integrações](#7-integrações)
8. [Fluxos de Dados](#8-fluxos-de-dados)
9. [Guia de Instalação](#9-guia-de-instalação)
10. [Manutenção e Atualizações](#10-manutenção-e-atualizações)

## 1. Visão Geral do Sistema

### 1.1 Propósito
O 4TIS é um sistema de gestão de TI desenvolvido para controlar equipamentos, periféricos e colaboradores em uma organização. O sistema gerencia o ciclo de vida completo dos ativos de TI, desde sua aquisição até o descarte.

### 1.2 Funcionalidades Principais
- Gestão de Colaboradores
- Gestão de Equipamentos
- Gestão de Periféricos
- Controle de Atribuições
- Histórico de Movimentações
- Sistema de Inativação e Devolução
- Notificações e Alertas

## 2. Arquitetura

### 2.1 Stack Tecnológica
- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript Vanilla
- **Backend**: Node.js com Express.js
- **Banco de Dados**: PostgreSQL
- **API**: REST
- **Autenticação**: JWT (JSON Web Tokens)

### 2.2 Estrutura de Diretórios
\`\`\`
/
├── api/                    # Endpoints da API
├── config/                 # Configurações do sistema
├── css/                    # Estilos e temas
├── js/                    # Lógica frontend
│   ├── ui/               # Componentes de interface
│   └── utils/            # Utilitários
├── migrations/            # Scripts de migração do banco
└── scripts/              # Scripts de automação
\`\`\`

## 3. Tecnologias Utilizadas

### 3.1 Frontend
- **HTML5**: Estrutura semântica
- **CSS3/Tailwind**: Framework CSS utilitário
- **JavaScript ES6+**: Vanilla JS sem frameworks
- **Módulos Principais**:
  - Storage Manager (Gerenciamento de Estado)
  - Toast Manager (Notificações)
  - Modal Manager (Janelas Modais)
  - API Client (Comunicação com Backend)

### 3.2 Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework Web
- **Módulos NPM**:
  - cors: Segurança CORS
  - dotenv: Variáveis de ambiente
  - pg: Driver PostgreSQL
  - jsonwebtoken: Autenticação
  - bcrypt: Hash de senhas

### 3.3 Banco de Dados
- **PostgreSQL**: Sistema de banco de dados relacional
- **Extensões**:
  - uuid-ossp: Geração de IDs únicos
  - pgcrypto: Criptografia

## 4. Estrutura do Banco de Dados

### 4.1 Tabelas Principais

#### employees
\`\`\`sql
CREATE TABLE employees (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    position VARCHAR NOT NULL,
    email VARCHAR,
    phone VARCHAR,
    status VARCHAR DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### equipment
\`\`\`sql
CREATE TABLE equipment (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    brand VARCHAR,
    model VARCHAR,
    serial_number VARCHAR,
    value DECIMAL(10,2),
    status VARCHAR DEFAULT 'stock',
    assigned_to VARCHAR REFERENCES employees(id),
    return_history JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### peripherals
\`\`\`sql
CREATE TABLE peripherals (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    model VARCHAR,
    quantity INTEGER DEFAULT 1,
    quantity_in_use INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### 4.2 Relacionamentos
- employees ← equipment (assigned_to)
- equipment ← peripheral_assignments (equipment_id)
- peripherals ← peripheral_assignments (peripheral_id)

## 5. Módulos do Sistema

### 5.1 Módulo de Colaboradores (employees.js)
- **Funcionalidades**:
  - Cadastro/Edição/Exclusão
  - Inativação com devolução de equipamentos
  - Histórico de equipamentos
  - Notificação para RH
  - Resolução de pendências

#### Fluxo de Inativação:
1. Verificação de equipamentos vinculados
2. Interface de devolução com checklist
3. Validação de observações obrigatórias
4. Atualização de status de equipamentos
5. Geração de histórico
6. Notificação automática para RH

### 5.2 Módulo de Equipamentos (equipment.js)
- **Funcionalidades**:
  - Cadastro completo
  - Vinculação com colaboradores
  - Histórico de movimentações
  - Controle de status
  - Gestão de valor patrimonial

#### Estados de Equipamento:
- stock: Disponível no estoque
- in_use: Em uso por colaborador
- maintenance: Em manutenção
- disposed: Descartado

### 5.3 Módulo de Periféricos (peripherals.js)
- **Funcionalidades**:
  - Controle de quantidade
  - Vinculação com equipamentos
  - Histórico de uso
  - Gestão de estoque

## 6. Regras de Negócio

### 6.1 Inativação de Colaboradores
1. Colaborador só pode ser inativado após:
   - Devolução ou registro de todos os equipamentos
   - Preenchimento de observações obrigatórias
   - Validação do estado dos equipamentos

2. Equipamentos não devolvidos:
   - Permanecem vinculados ao colaborador
   - Geram notificação para RH
   - Ficam pendentes de resolução

### 6.2 Gestão de Equipamentos
1. Todo equipamento deve ter:
   - ID único
   - Tipo definido
   - Status atual
   - Histórico de movimentações

2. Vinculação:
   - Equipamento só pode estar vinculado a um colaborador
   - Deve registrar data e motivo da vinculação
   - Alterações geram histórico automático

### 6.3 Controle de Periféricos
1. Quantidade:
   - Controle de estoque total
   - Monitoramento de itens em uso
   - Validação de disponibilidade

2. Vinculação:
   - Múltiplos periféricos por equipamento
   - Controle de quantidade por vinculação
   - Histórico de uso

## 7. Integrações

### 7.1 API REST
- **Base URL**: `/api/v1`
- **Autenticação**: JWT Bearer Token
- **Endpoints Principais**:
  - `/employees`
  - `/equipment`
  - `/peripherals`
  - `/assignments`

### 7.2 Storage Manager
- Gerenciamento de estado local
- Sincronização com backend
- Cache de dados frequentes

## 8. Fluxos de Dados

### 8.1 Inativação de Colaborador
\`\`\`mermaid
sequenceDiagram
    Actor U as Usuário
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Inicia inativação
    F->>A: Busca equipamentos
    A->>D: SELECT equipment
    D-->>A: Retorna dados
    A-->>F: Lista equipamentos
    F->>U: Mostra checklist
    U->>F: Marca devoluções
    F->>A: Atualiza status
    A->>D: UPDATE status
    F->>U: Notifica conclusão
\`\`\`

### 8.2 Vinculação de Equipamento
\`\`\`mermaid
sequenceDiagram
    Actor U as Usuário
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Seleciona equipamento
    F->>A: Verifica disponibilidade
    A->>D: CHECK status
    D-->>A: Retorna status
    A-->>F: Confirma disponibilidade
    U->>F: Seleciona colaborador
    F->>A: Realiza vinculação
    A->>D: UPDATE assigned_to
    F->>U: Confirma operação
\`\`\`

## 9. Guia de Instalação

### 9.1 Requisitos
- Node.js 14+
- PostgreSQL 12+
- NPM ou Yarn

### 9.2 Passos
1. Clone o repositório
\`\`\`bash
git clone https://github.com/hudsonadley/4tis-gestao-ti.git
\`\`\`

2. Instale dependências
\`\`\`bash
npm install
\`\`\`

3. Configure o banco de dados
\`\`\`bash
npm run migrate
\`\`\`

4. Inicie o servidor
\`\`\`bash
npm start
\`\`\`

## 10. Manutenção e Atualizações

### 10.1 Versionamento
- Sistema de versionamento semântico
- Changelog automático
- Migrações automáticas do banco

### 10.2 Backup
- Backup diário do banco de dados
- Exportação de dados em JSON
- Histórico de alterações Git

### 10.3 Monitoramento
- Logs de sistema
- Registro de erros
- Métricas de uso

## Anexos

### A1. Diagrama ER
[Diagrama ER detalhado do banco de dados]

### A2. Mapa de Navegação
[Fluxograma de navegação entre telas]

### A3. Lista de Endpoints
[Documentação completa da API]
