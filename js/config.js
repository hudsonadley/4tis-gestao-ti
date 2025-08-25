/**
 * 4TIS SaaS - Configurações Globais
 * Sistema de Gestão de TI - Versão MVP SaaS
 */

// Configurações do Sistema
const CONFIG = {
    // Informações da Aplicação
    APP_NAME: '4TIS SaaS',
    APP_VERSION: '1.0.0-MVP',
    APP_DESCRIPTION: 'Sistema de Gestão de TI - SaaS MVP',
    
    // Configurações de UI
    ITEMS_PER_PAGE: 10,
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 4000,
    MODAL_ANIMATION_DURATION: 200,
    
    // Configurações de Dados
    STORAGE_KEY: '4tis_saas_data',
    BACKUP_PREFIX: '4tis_backup_',
    AUTO_SAVE_INTERVAL: 30000, // 30 segundos
    
    // Configurações de API (preparação para backend)
    API_BASE_URL: process?.env?.API_URL || 'http://localhost:3000/api',
    API_TIMEOUT: 10000,
    API_RETRY_ATTEMPTS: 3,
    
    // Configurações de Segurança
    MAX_LOGIN_ATTEMPTS: 5,
    SESSION_TIMEOUT: 3600000, // 1 hora
    PASSWORD_MIN_LENGTH: 8,
    
    // Configurações de Performance
    VIRTUAL_SCROLL_THRESHOLD: 100,
    CACHE_DURATION: 300000, // 5 minutos
    
    // Configurações de Tema
    THEME: {
        PRIMARY_COLOR: '#7c3aed',
        SECONDARY_COLOR: '#a855f7',
        SUCCESS_COLOR: '#10b981',
        WARNING_COLOR: '#f59e0b',
        ERROR_COLOR: '#ef4444',
        INFO_COLOR: '#3b82f6'
    },
    
    // Status disponíveis
    TICKET_STATUS: {
        NOVO: 'novo',
        AGUARDANDO_VALIDACAO: 'aguardando-validacao',
        AGUARDANDO_EQUIPAMENTO: 'aguardando-equipamento',
        ATRIBUIDO_ATENDIMENTO: 'atribuido-para-atendimento',
        EM_ANDAMENTO: 'em-andamento',
        RESOLVIDO: 'resolvido',
        FECHADO: 'fechado',
        CANCELADO: 'cancelado'
    },
    
    EQUIPMENT_STATUS: {
        STOCK: 'stock',
        IN_USE: 'in-use',
        MAINTENANCE: 'maintenance',
        RETIRED: 'retired'
    },
    
    EMPLOYEE_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended'
    },
    
    // Tipos de usuário (preparação para auth)
    USER_ROLES: {
        ADMIN: 'admin',
        MANAGER: 'manager',
        TECHNICIAN: 'technician',
        USER: 'user'
    },
    
    // Permissões (preparação para auth)
    PERMISSIONS: {
        EMPLOYEES_READ: 'employees:read',
        EMPLOYEES_WRITE: 'employees:write',
        EQUIPMENT_READ: 'equipment:read',
        EQUIPMENT_WRITE: 'equipment:write',
        TICKETS_READ: 'tickets:read',
        TICKETS_WRITE: 'tickets:write',
        SETTINGS_READ: 'settings:read',
        SETTINGS_WRITE: 'settings:write',
        REPORTS_READ: 'reports:read',
        ADMIN_PANEL: 'admin:panel'
    }
};

// Usuário atual (simulado para MVP)
const CURRENT_USER = {
    id: 'USR001',
    name: 'Hudson Adley',
    email: 'hudson@4tis.com',
    role: CONFIG.USER_ROLES.ADMIN,
    permissions: Object.values(CONFIG.PERMISSIONS),
    avatar: null,
    lastLogin: new Date().toISOString(),
    preferences: {
        theme: 'light',
        language: 'pt-BR',
        notifications: true,
        itemsPerPage: CONFIG.ITEMS_PER_PAGE
    }
};

// Mensagens do sistema
const MESSAGES = {
    SUCCESS: {
        SAVE: 'Dados salvos com sucesso!',
        DELETE: 'Item excluído com sucesso!',
        UPDATE: 'Item atualizado com sucesso!',
        CREATE: 'Item criado com sucesso!',
        EXPORT: 'Dados exportados com sucesso!',
        IMPORT: 'Dados importados com sucesso!'
    },
    ERROR: {
        SAVE: 'Erro ao salvar dados',
        DELETE: 'Erro ao excluir item',
        UPDATE: 'Erro ao atualizar item',
        CREATE: 'Erro ao criar item',
        LOAD: 'Erro ao carregar dados',
        NETWORK: 'Erro de conexão',
        VALIDATION: 'Dados inválidos',
        PERMISSION: 'Sem permissão para esta ação',
        NOT_FOUND: 'Item não encontrado'
    },
    WARNING: {
        UNSAVED_CHANGES: 'Existem alterações não salvas',
        DELETE_CONFIRM: 'Tem certeza que deseja excluir?',
        LOGOUT_CONFIRM: 'Tem certeza que deseja sair?'
    },
    INFO: {
        LOADING: 'Carregando...',
        SAVING: 'Salvando...',
        PROCESSING: 'Processando...',
        NO_DATA: 'Nenhum dado encontrado',
        WELCOME: 'Bem-vindo ao 4TIS SaaS!'
    }
};

// Validações
const VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CNPJ_REGEX: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    
    REQUIRED_FIELDS: {
        EMPLOYEE: ['name', 'position', 'email'],
        EQUIPMENT: ['brand', 'model', 'type'],
        TICKET: ['requestor', 'equipmentType', 'serviceType', 'requestedForUser', 'location', 'justification']
    }
};

// Configurações de desenvolvimento
const DEV_CONFIG = {
    DEBUG: true,
    MOCK_API_DELAY: 500,
    ENABLE_CONSOLE_LOGS: true,
    SHOW_PERFORMANCE_METRICS: true
};

// Exportar configurações globalmente
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.CURRENT_USER = CURRENT_USER;
    window.MESSAGES = MESSAGES;
    window.VALIDATION = VALIDATION;
    window.DEV_CONFIG = DEV_CONFIG;
}

// Exportar para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        CURRENT_USER,
        MESSAGES,
        VALIDATION,
        DEV_CONFIG
    };
}