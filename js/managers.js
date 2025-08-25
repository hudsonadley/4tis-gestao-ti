/**
 * 4TIS SaaS - Gerenciadores de Entidades
 * Classes para gerenciar CRUD das entidades principais
 */

/**
 * Classe base para gerenciadores
 */
class BaseManager {
    constructor(entityName, storageManager) {
        this.entityName = entityName;
        this.storageManager = storageManager;
        this.cache = new Map();
    }

    /**
     * Valida dados da entidade
     * @param {Object} data - Dados a serem validados
     * @returns {Object} Resultado da validação
     */
    validate(data) {
        const errors = [];
        const requiredFields = VALIDATION.REQUIRED_FIELDS[this.entityName.toUpperCase()] || [];
        
        // Verifica campos obrigatórios
        requiredFields.forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
                errors.push(`Campo obrigatório: ${field}`);
            }
        });

        // Validações específicas por tipo
        if (data.email && !Utils.isValidEmail(data.email)) {
            errors.push('Email inválido');
        }

        if (data.phone && !Utils.isValidPhone(data.phone)) {
            errors.push('Telefone inválido');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Gera ID único para a entidade
     * @returns {string} ID único
     */
    generateId() {
        const prefix = this.entityName.substring(0, 3).toUpperCase();
        return Utils.generateId(prefix);
    }

    /**
     * Salva dados no storage
     * @param {Object} appState - Estado da aplicação
     * @returns {boolean} Sucesso da operação
     */
    saveToStorage(appState) {
        try {
            const success = this.storageManager.save(appState);
            if (success) {
                // Atualiza estado global
                window.appState = appState;
                
                // Limpa cache
                this.cache.clear();
                
                Utils.devLog(`${this.entityName} salvo com sucesso`);
            }
            return success;
        } catch (error) {
            Utils.devLog(`Erro ao salvar ${this.entityName}`, error, 'error');
            return false;
        }
    }

    /**
     * Obtém dados do cache ou storage
     * @returns {Array} Lista de entidades
     */
    getAll() {
        const cacheKey = `${this.entityName}_all`;
        
        // Verifica cache primeiro
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            const cacheAge = Date.now() - cached.timestamp;
            
            if (cacheAge < CONFIG.CACHE_DURATION) {
                return cached.data;
            }
        }

        // Carrega do storage
        const appState = this.storageManager.load() || window.appState;
        const data = appState?.[this.entityName] || [];
        
        // Atualiza cache
        this.cache.set(cacheKey, {
            data: Utils.deepClone(data),
            timestamp: Date.now()
        });

        return data;
    }

    /**
     * Busca entidade por ID
     * @param {string} id - ID da entidade
     * @returns {Object|null} Entidade encontrada ou null
     */
    findById(id) {
        const all = this.getAll();
        return all.find(item => item.id === id) || null;
    }

    /**
     * Filtra entidades
     * @param {Object} filters - Filtros a serem aplicados
     * @returns {Array} Entidades filtradas
     */
    filter(filters = {}) {
        let data = this.getAll();

        // Aplica filtros
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '') {
                if (key === 'search') {
                    // Busca textual
                    data = Utils.filterBySearch(data, value);
                } else {
                    // Filtro exato
                    data = data.filter(item => item[key] === value);
                }
            }
        });

        return data;
    }

    /**
     * Cria nova entidade
     * @param {Object} data - Dados da entidade
     * @returns {Object|null} Entidade criada ou null se erro
     */
    create(data) {
        try {
            // Valida dados
            const validation = this.validate(data);
            if (!validation.isValid) {
                ToastManager.error(`Erro de validação: ${validation.errors.join(', ')}`);
                return null;
            }

            // Prepara dados
            const entity = {
                id: this.generateId(),
                ...data,
                createdAt: new Date().toISOString(),
                createdBy: CURRENT_USER.id,
                updatedAt: new Date().toISOString(),
                updatedBy: CURRENT_USER.id
            };

            // Carrega estado atual
            const appState = this.storageManager.load() || window.appState;
            if (!appState[this.entityName]) {
                appState[this.entityName] = [];
            }

            // Adiciona entidade
            appState[this.entityName].push(entity);

            // Salva
            if (this.saveToStorage(appState)) {
                ToastManager.success(MESSAGES.SUCCESS.CREATE);
                Utils.devLog(`${this.entityName} criado`, entity);
                return entity;
            }

            return null;

        } catch (error) {
            Utils.devLog(`Erro ao criar ${this.entityName}`, error, 'error');
            ToastManager.error(MESSAGES.ERROR.CREATE);
            return null;
        }
    }

    /**
     * Atualiza entidade
     * @param {string} id - ID da entidade
     * @param {Object} data - Dados atualizados
     * @returns {Object|null} Entidade atualizada ou null se erro
     */
    update(id, data) {
        try {
            // Valida dados
            const validation = this.validate(data);
            if (!validation.isValid) {
                ToastManager.error(`Erro de validação: ${validation.errors.join(', ')}`);
                return null;
            }

            // Carrega estado atual
            const appState = this.storageManager.load() || window.appState;
            const entities = appState[this.entityName] || [];
            
            // Encontra entidade
            const index = entities.findIndex(item => item.id === id);
            if (index === -1) {
                ToastManager.error(MESSAGES.ERROR.NOT_FOUND);
                return null;
            }

            // Atualiza entidade
            const oldEntity = entities[index];
            const updatedEntity = {
                ...oldEntity,
                ...data,
                updatedAt: new Date().toISOString(),
                updatedBy: CURRENT_USER.id
            };

            entities[index] = updatedEntity;

            // Salva
            if (this.saveToStorage(appState)) {
                ToastManager.success(MESSAGES.SUCCESS.UPDATE);
                Utils.devLog(`${this.entityName} atualizado`, { old: oldEntity, new: updatedEntity });
                return updatedEntity;
            }

            return null;

        } catch (error) {
            Utils.devLog(`Erro ao atualizar ${this.entityName}`, error, 'error');
            ToastManager.error(MESSAGES.ERROR.UPDATE);
            return null;
        }
    }

    /**
     * Remove entidade
     * @param {string} id - ID da entidade
     * @returns {boolean} Sucesso da operação
     */
    delete(id) {
        try {
            // Carrega estado atual
            const appState = this.storageManager.load() || window.appState;
            const entities = appState[this.entityName] || [];
            
            // Encontra entidade
            const index = entities.findIndex(item => item.id === id);
            if (index === -1) {
                ToastManager.error(MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Remove entidade
            const deletedEntity = entities.splice(index, 1)[0];

            // Salva
            if (this.saveToStorage(appState)) {
                ToastManager.success(MESSAGES.SUCCESS.DELETE);
                Utils.devLog(`${this.entityName} removido`, deletedEntity);
                return true;
            }

            return false;

        } catch (error) {
            Utils.devLog(`Erro ao remover ${this.entityName}`, error, 'error');
            ToastManager.error(MESSAGES.ERROR.DELETE);
            return false;
        }
    }

    /**
     * Conta entidades com filtros
     * @param {Object} filters - Filtros
     * @returns {number} Quantidade de entidades
     */
    count(filters = {}) {
        return this.filter(filters).length;
    }

    /**
     * Obtém estatísticas da entidade
     * @returns {Object} Estatísticas
     */
    getStats() {
        const all = this.getAll();
        
        return {
            total: all.length,
            createdToday: all.filter(item => {
                const created = new Date(item.createdAt);
                const today = new Date();
                return created.toDateString() === today.toDateString();
            }).length,
            createdThisWeek: all.filter(item => {
                const created = new Date(item.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created >= weekAgo;
            }).length,
            createdThisMonth: all.filter(item => {
                const created = new Date(item.createdAt);
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return created >= monthAgo;
            }).length
        };
    }
}

/**
 * Gerenciador de Colaboradores
 */
class EmployeeManager extends BaseManager {
    constructor(storageManager) {
        super('employees', storageManager);
    }

    /**
     * Validação específica para colaboradores
     */
    validate(data) {
        const baseValidation = super.validate(data);
        
        // Validações específicas
        if (data.email && !Utils.isValidEmail(data.email)) {
            baseValidation.errors.push('Email inválido');
        }

        if (data.phone && data.phone.trim() && !Utils.isValidPhone(data.phone)) {
            baseValidation.errors.push('Telefone inválido (formato: (11) 99999-9999)');
        }

        baseValidation.isValid = baseValidation.errors.length === 0;
        return baseValidation;
    }

    /**
     * Busca colaboradores ativos
     */
    getActive() {
        return this.filter({ status: CONFIG.EMPLOYEE_STATUS.ACTIVE });
    }

    /**
     * Busca colaboradores inativos
     */
    getInactive() {
        return this.filter({ status: CONFIG.EMPLOYEE_STATUS.INACTIVE });
    }

    /**
     * Obtém equipamentos de um colaborador
     */
    getEquipment(employeeId) {
        const equipmentManager = new EquipmentManager(this.storageManager);
        return equipmentManager.filter({ assignedTo: employeeId });
    }

    /**
     * Obtém chamados de um colaborador
     */
    getTickets(employeeId) {
        const ticketManager = new TicketManager(this.storageManager);
        const appState = this.storageManager.load() || window.appState;
        const employee = this.findById(employeeId);
        
        if (!employee) return [];

        return appState.tickets?.filter(ticket => 
            ticket.requestor === employee.name || 
            ticket.requestedForUser === employee.name ||
            ticket.assignedToUser === employeeId
        ) || [];
    }
}

/**
 * Gerenciador de Equipamentos
 */
class EquipmentManager extends BaseManager {
    constructor(storageManager) {
        super('equipment', storageManager);
    }

    /**
     * Validação específica para equipamentos
     */
    validate(data) {
        const baseValidation = super.validate(data);
        
        // Validações específicas
        if (data.value && (isNaN(data.value) || data.value < 0)) {
            baseValidation.errors.push('Valor deve ser um número positivo');
        }

        baseValidation.isValid = baseValidation.errors.length === 0;
        return baseValidation;
    }

    /**
     * Busca equipamentos em estoque
     */
    getInStock() {
        return this.filter({ status: CONFIG.EQUIPMENT_STATUS.STOCK });
    }

    /**
     * Busca equipamentos em uso
     */
    getInUse() {
        return this.filter({ status: CONFIG.EQUIPMENT_STATUS.IN_USE });
    }

    /**
     * Busca equipamentos em manutenção
     */
    getInMaintenance() {
        return this.filter({ status: CONFIG.EQUIPMENT_STATUS.MAINTENANCE });
    }

    /**
     * Atribui equipamento a colaborador
     */
    assignTo(equipmentId, employeeId) {
        const equipment = this.findById(equipmentId);
        if (!equipment) {
            ToastManager.error('Equipamento não encontrado');
            return false;
        }

        if (equipment.status !== CONFIG.EQUIPMENT_STATUS.STOCK) {
            ToastManager.error('Equipamento não está disponível para atribuição');
            return false;
        }

        const employeeManager = new EmployeeManager(this.storageManager);
        const employee = employeeManager.findById(employeeId);
        if (!employee) {
            ToastManager.error('Colaborador não encontrado');
            return false;
        }

        return this.update(equipmentId, {
            assignedTo: employeeId,
            status: CONFIG.EQUIPMENT_STATUS.IN_USE,
            assignedAt: new Date().toISOString()
        });
    }

    /**
     * Remove atribuição de equipamento
     */
    unassign(equipmentId) {
        return this.update(equipmentId, {
            assignedTo: null,
            status: CONFIG.EQUIPMENT_STATUS.STOCK,
            unassignedAt: new Date().toISOString()
        });
    }

    /**
     * Calcula valor total dos equipamentos
     */
    getTotalValue(filters = {}) {
        const equipment = this.filter(filters);
        return equipment.reduce((total, eq) => total + (eq.value || 0), 0);
    }

    /**
     * Obtém estatísticas específicas de equipamentos
     */
    getStats() {
        const baseStats = super.getStats();
        const all = this.getAll();
        
        return {
            ...baseStats,
            byStatus: {
                stock: this.count({ status: CONFIG.EQUIPMENT_STATUS.STOCK }),
                inUse: this.count({ status: CONFIG.EQUIPMENT_STATUS.IN_USE }),
                maintenance: this.count({ status: CONFIG.EQUIPMENT_STATUS.MAINTENANCE }),
                retired: this.count({ status: CONFIG.EQUIPMENT_STATUS.RETIRED })
            },
            totalValue: this.getTotalValue(),
            averageValue: all.length > 0 ? this.getTotalValue() / all.length : 0,
            byType: this.getTypeDistribution()
        };
    }

    /**
     * Obtém distribuição por tipo
     */
    getTypeDistribution() {
        const all = this.getAll();
        const distribution = {};
        
        all.forEach(eq => {
            const type = eq.type || 'Não definido';
            distribution[type] = (distribution[type] || 0) + 1;
        });
        
        return distribution;
    }
}

/**
 * Gerenciador de Chamados
 */
class TicketManager extends BaseManager {
    constructor(storageManager) {
        super('tickets', storageManager);
    }

    /**
     * Busca chamados abertos
     */
    getOpen() {
        const openStatuses = [
            CONFIG.TICKET_STATUS.NOVO,
            CONFIG.TICKET_STATUS.AGUARDANDO_VALIDACAO,
            CONFIG.TICKET_STATUS.AGUARDANDO_EQUIPAMENTO,
            CONFIG.TICKET_STATUS.ATRIBUIDO_ATENDIMENTO,
            CONFIG.TICKET_STATUS.EM_ANDAMENTO
        ];
        
        return this.getAll().filter(ticket => openStatuses.includes(ticket.status));
    }

    /**
     * Busca chamados fechados
     */
    getClosed() {
        const closedStatuses = [
            CONFIG.TICKET_STATUS.RESOLVIDO,
            CONFIG.TICKET_STATUS.FECHADO,
            CONFIG.TICKET_STATUS.CANCELADO
        ];
        
        return this.getAll().filter(ticket => closedStatuses.includes(ticket.status));
    }

    /**
     * Busca chamados por status
     */
    getByStatus(status) {
        return this.filter({ status });
    }

    /**
     * Busca chamados atribuídos a um usuário
     */
    getAssignedTo(userId) {
        return this.filter({ assignedToUser: userId });
    }

    /**
     * Atribui chamado a usuário
     */
    assignTo(ticketId, userId) {
        const userManager = new EmployeeManager(this.storageManager);
        const user = userManager.findById(userId);
        
        if (!user) {
            ToastManager.error('Usuário não encontrado');
            return false;
        }

        return this.update(ticketId, {
            assignedToUser: userId,
            assignedToUserName: user.name,
            assignedAt: new Date().toISOString(),
            status: CONFIG.TICKET_STATUS.ATRIBUIDO_ATENDIMENTO
        });
    }

    /**
     * Muda status do chamado
     */
    changeStatus(ticketId, newStatus, comment = null) {
        const ticket = this.findById(ticketId);
        if (!ticket) {
            ToastManager.error('Chamado não encontrado');
            return false;
        }

        const updateData = {
            status: newStatus,
            statusChangedAt: new Date().toISOString(),
            statusChangedBy: CURRENT_USER.id
        };

        // Adiciona campos específicos por status
        if (newStatus === CONFIG.TICKET_STATUS.RESOLVIDO) {
            updateData.resolvedAt = new Date().toISOString();
            updateData.resolvedBy = CURRENT_USER.id;
        } else if (newStatus === CONFIG.TICKET_STATUS.FECHADO) {
            updateData.closedAt = new Date().toISOString();
            updateData.closedBy = CURRENT_USER.id;
        }

        if (comment) {
            updateData.lastComment = comment;
            updateData.commentedAt = new Date().toISOString();
        }

        return this.update(ticketId, updateData);
    }

    /**
     * Calcula tempo médio de resolução
     */
    getAverageResolutionTime() {
        const resolvedTickets = this.filter({ status: CONFIG.TICKET_STATUS.RESOLVIDO });
        
        if (resolvedTickets.length === 0) return 0;

        const totalTime = resolvedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.createdAt);
            const resolved = new Date(ticket.resolvedAt || ticket.updatedAt);
            return sum + (resolved - created);
        }, 0);

        return totalTime / resolvedTickets.length;
    }

    /**
     * Obtém estatísticas específicas de chamados
     */
    getStats() {
        const baseStats = super.getStats();
        const all = this.getAll();
        
        return {
            ...baseStats,
            byStatus: {
                open: this.getOpen().length,
                closed: this.getClosed().length,
                novo: this.count({ status: CONFIG.TICKET_STATUS.NOVO }),
                aguardandoValidacao: this.count({ status: CONFIG.TICKET_STATUS.AGUARDANDO_VALIDACAO }),
                aguardandoEquipamento: this.count({ status: CONFIG.TICKET_STATUS.AGUARDANDO_EQUIPAMENTO }),
                atribuidoAtendimento: this.count({ status: CONFIG.TICKET_STATUS.ATRIBUIDO_ATENDIMENTO }),
                emAndamento: this.count({ status: CONFIG.TICKET_STATUS.EM_ANDAMENTO }),
                resolvido: this.count({ status: CONFIG.TICKET_STATUS.RESOLVIDO }),
                fechado: this.count({ status: CONFIG.TICKET_STATUS.FECHADO }),
                cancelado: this.count({ status: CONFIG.TICKET_STATUS.CANCELADO })
            },
            averageResolutionTime: this.getAverageResolutionTime(),
            byType: this.getTypeDistribution(),
            byPriority: this.getPriorityDistribution()
        };
    }

    /**
     * Obtém distribuição por tipo
     */
    getTypeDistribution() {
        const all = this.getAll();
        const distribution = {};
        
        all.forEach(ticket => {
            const type = ticket.ticketType || 'SOLICITACAO';
            distribution[type] = (distribution[type] || 0) + 1;
        });
        
        return distribution;
    }

    /**
     * Obtém distribuição por prioridade
     */
    getPriorityDistribution() {
        const all = this.getAll();
        const distribution = {};
        
        all.forEach(ticket => {
            const priority = ticket.priority || 'media';
            distribution[priority] = (distribution[priority] || 0) + 1;
        });
        
        return distribution;
    }
}

/**
 * Gerenciador de Configurações
 */
class ConfigManager extends BaseManager {
    constructor(storageManager) {
        super('config', storageManager);
    }

    /**
     * Obtém configuração por chave
     */
    get(key, defaultValue = null) {
        const appState = this.storageManager.load() || window.appState;
        const config = appState.config || {};
        return config[key] !== undefined ? config[key] : defaultValue;
    }

    /**
     * Define configuração
     */
    set(key, value) {
        const appState = this.storageManager.load() || window.appState;
        if (!appState.config) {
            appState.config = {};
        }
        
        appState.config[key] = value;
        appState.config.updatedAt = new Date().toISOString();
        
        return this.saveToStorage(appState);
    }

    /**
     * Define múltiplas configurações
     */
    setMultiple(configs) {
        const appState = this.storageManager.load() || window.appState;
        if (!appState.config) {
            appState.config = {};
        }
        
        Object.assign(appState.config, configs);
        appState.config.updatedAt = new Date().toISOString();
        
        return this.saveToStorage(appState);
    }

    /**
     * Remove configuração
     */
    remove(key) {
        const appState = this.storageManager.load() || window.appState;
        if (appState.config && appState.config[key] !== undefined) {
            delete appState.config[key];
            appState.config.updatedAt = new Date().toISOString();
            return this.saveToStorage(appState);
        }
        return true;
    }

    /**
     * Obtém todas as configurações
     */
    getAll() {
        const appState = this.storageManager.load() || window.appState;
        return appState.config || {};
    }

    /**
     * Reseta configurações para padrão
     */
    reset() {
        const appState = this.storageManager.load() || window.appState;
        appState.config = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return this.saveToStorage(appState);
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BaseManager = BaseManager;
    window.EmployeeManager = EmployeeManager;
    window.EquipmentManager = EquipmentManager;
    window.TicketManager = TicketManager;
    window.ConfigManager = ConfigManager;
}

// Exportar para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseManager,
        EmployeeManager,
        EquipmentManager,
        TicketManager,
        ConfigManager
    };
}