# 📦 Sistema de Almoxarifado

Um sistema simples e eficaz para gestão de almoxarifado, desenvolvido com HTML, CSS e JavaScript puro.

## 🚀 Funcionalidades

### 👥 Gestão de Colaboradores
- **CRUD Completo**: Criar, visualizar, editar e excluir colaboradores
- **Filtros Avançados**: Busca por nome, cargo, email e status
- **Paginação**: Controle de quantidade de itens por página
- **Status**: Ativo/Inativo com controle automático

### 💻 Gestão de Equipamentos
- **Dois Tipos de Equipamentos**:
  - **Uso Único**: Equipamentos individuais com serial/IMEI e patrimônio (ex: notebooks, celulares)
  - **Uso Múltiplo**: Equipamentos em quantidade (ex: mouse pads, cabos)
- **CRUD Completo**: Criar, visualizar, editar e excluir equipamentos
- **Filtros Avançados**: Busca por nome, marca, modelo, tipo e status
- **Status Automático**: Em Estoque, Vinculado, Inativo

### 🔗 Sistema de Vínculos
- **Vinculação Inteligente**: Vincular equipamentos a colaboradores
- **Busca de Equipamentos**: Interface para encontrar equipamentos disponíveis
- **Controle de Uso Único**: Equipamentos únicos não podem ser vinculados a múltiplos colaboradores
- **Devolução Individual**: Devolver equipamentos específicos
- **Devolução em Massa**: Devolver todos os equipamentos de um colaborador

### 🏢 Regras de Negócio

#### Colaboradores
- **Inativação Automática**: Ao inativar um colaborador, todos os equipamentos são devolvidos automaticamente
- **Proteção de Exclusão**: Não é possível excluir colaboradores com equipamentos vinculados
- **Histórico Preservado**: Informações são mantidas para auditoria

#### Equipamentos
- **Uso Único vs Múltiplo**:
  - Uso único: Campos obrigatórios (serial/IMEI, patrimônio)
  - Uso múltiplo: Campo quantidade obrigatório
- **Controle de Disponibilidade**: Equipamentos vinculados não aparecem na lista de disponíveis
- **Proteção de Exclusão**: Não é possível excluir equipamentos vinculados

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo e moderno
- **JavaScript ES6+**: Lógica de negócio e interatividade
- **LocalStorage**: Persistência de dados no navegador

## 📱 Interface

### Design Responsivo
- **Desktop**: Layout otimizado para telas grandes
- **Mobile**: Interface adaptada para dispositivos móveis
- **Tablet**: Experiência intermediária balanceada

### Componentes
- **Modais**: Interfaces para CRUD e vinculação
- **Filtros**: Busca e filtros em tempo real
- **Paginação**: Navegação eficiente entre páginas
- **Status Badges**: Indicadores visuais de status

## 🚀 Como Usar

### 1. Abrir a Aplicação
Abra o arquivo `index.html` em qualquer navegador moderno.

### 2. Cadastrar Colaboradores
1. Clique em "Cadastrar Colaborador"
2. Preencha os dados obrigatórios (nome, cargo, email)
3. Defina o status (ativo/inativo)
4. Salve o cadastro

### 3. Cadastrar Equipamentos
1. Vá para a aba "Equipamentos"
2. Clique em "Cadastrar Equipamento"
3. Preencha nome, marca e modelo
4. Escolha o tipo:
   - **Uso Único**: Marque a checkbox e preencha serial/patrimônio
   - **Uso Múltiplo**: Deixe desmarcado e informe a quantidade
5. Salve o cadastro

### 4. Vincular Equipamentos
1. Clique em um colaborador para ver seus detalhes
2. Clique em "Vincular Equipamento"
3. Busque e selecione o equipamento desejado
4. O equipamento será vinculado automaticamente

### 5. Devolver Equipamentos
- **Individual**: Clique no botão "Devolver" ao lado do equipamento
- **Em Massa**: Clique em "Devolver Tudo" nos detalhes do colaborador
- **Automática**: Acontece automaticamente ao inativar um colaborador

## 📊 Dados de Exemplo

A aplicação vem com dados de exemplo para demonstração:

### Colaboradores
- João Silva (Desenvolvedor) - Ativo
- Maria Santos (Analista de TI) - Ativo  
- Pedro Costa (Gerente de Projetos) - Inativo

### Equipamentos
- Notebook Dell Inspiron (Uso Único)
- Mouse Pad Logitech (Uso Múltiplo - 50 unidades)
- iPhone 13 (Uso Único - Vinculado ao João)

## 🔧 Estrutura do Projeto

```
almoxarifado-app/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
└── README.md           # Documentação
```

## 💾 Armazenamento

Os dados são salvos automaticamente no **LocalStorage** do navegador:
- Persistência entre sessões
- Não requer servidor
- Dados ficam no dispositivo do usuário

## 🎯 Próximas Melhorias

- [ ] Relatórios e estatísticas
- [ ] Exportação de dados (CSV/PDF)
- [ ] Histórico de movimentações
- [ ] Notificações de vencimento
- [ ] Backup e restauração
- [ ] Integração com APIs externas

## 🤝 Contribuição

Este é um projeto de código aberto. Contribuições são bem-vindas!

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para simplificar a gestão de almoxarifado**

