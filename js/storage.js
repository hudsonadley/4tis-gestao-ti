/**
 * 4TIS SaaS - Sistema de Armazenamento
 * Gerenciamento de dados com localStorage e preparação para API
 */

class StorageManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEY;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.cache = new Map();
        
        // Monitora status de conexão
        this.setupConnectionMonitoring();
        
        // Auto-save periódico
        this.setupAutoSave();
    }

    /**
     * Configura monitoramento de conexão
     */
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
            Utils.devLog('Conexão restaurada, processando fila de sincronização');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            Utils.devLog('Conexão perdida, modo offline ativado');
        });
    }

    /**
     * Configura auto-save periódico
     */
    setupAutoSave() {
        if (CONFIG.AUTO_SAVE_INTERVAL > 0) {
            setInterval(() => {
                this.autoSave();
            }, CONFIG.AUTO_SAVE_INTERVAL);
        }
    }

    /**
     * Carrega dados do localStorage
     * @returns {Object|null} Dados carregados ou null se não existir
     */
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;

            const parsedData = JSON.parse(data);
            
            // Valida estrutura dos dados
            if (!this.validateDataStructure(parsedData)) {
                Utils.devLog('Estrutura de dados inválida, retornando dados padrão', 'warn');
                return this.getDefaultData();
            }

            // Atualiza cache
            this.updateCache(parsedData);
            
            Utils.devLog('Dados carregados do localStorage', parsedData);
            return parsedData;
            
        } catch (error) {
            Utils.devLog('Erro ao carregar dados do localStorage', error, 'error');
            ToastManager.error(MESSAGES.ERROR.LOAD);
            return this.getDefaultData();
        }
    }

    /**
     * Salva dados no localStorage
     * @param {Object} data - Dados a serem salvos
     * @returns {boolean} True se salvou com sucesso
     */
    save(data) {
        try {
            // Valida dados antes de salvar
            if (!this.validateDataStructure(data)) {
                throw new Error('Estrutura de dados inválida');
            }

            // Adiciona metadados
            const dataWithMetadata = {
                ...data,
                lastUpdated: new Date().toISOString(),
                version: CONFIG.APP_VERSION,
                userId: CURRENT_USER.id
            };

            // Salva no localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(dataWithMetadata));
            
            // Atualiza cache
            this.updateCache(dataWithMetadata);
            
            // Adiciona à fila de sincronização se offline
            if (!this.isOnline) {
                this.addToSyncQueue('save', dataWithMetadata);
            }

            Utils.devLog('Dados salvos no localStorage', dataWithMetadata);
            return true;
            
        } catch (error) {
            Utils.devLog('Erro ao salvar dados no localStorage', error, 'error');
            ToastManager.error(MESSAGES.ERROR.SAVE);
            return false;
        }
    }

    /**
     * Auto-save inteligente
     */
    autoSave() {
        try {
            const currentData = window.appState;
            if (!currentData) return;

            // Verifica se houve mudanças desde o último save
            const lastSaved = this.cache.get('lastSaved');
            const currentHash = this.generateDataHash(currentData);
            
            if (lastSaved !== currentHash) {
                this.save(currentData);
                this.cache.set('lastSaved', currentHash);
                Utils.devLog('Auto-save executado');
            }
            
        } catch (error) {
            Utils.devLog('Erro no auto-save', error, 'error');
        }
    }

    /**
     * Gera hash dos dados para comparação
     * @param {Object} data - Dados
     * @returns {string} Hash
     */
    generateDataHash(data) {
        return btoa(JSON.stringify(data)).slice(0, 20);
    }

    /**
     * Atualiza cache interno
     * @param {Object} data - Dados
     */
    updateCache(data) {
        this.cache.set('data', Utils.deepClone(data));
        this.cache.set('lastUpdated', Date.now());
    }

    /**
     * Obtém dados do cache
     * @returns {Object|null} Dados do cache
     */
    getFromCache() {
        const cacheAge = Date.now() - (this.cache.get('lastUpdated') || 0);
        
        if (cacheAge < CONFIG.CACHE_DURATION) {
            return this.cache.get('data');
        }
        
        return null;
    }

    /**
     * Valida estrutura dos dados
     * @param {Object} data - Dados a serem validados
     * @returns {boolean} True se válido
     */
    validateDataStructure(data) {
        if (!data || typeof data !== 'object') return false;

        const requiredFields = ['employees', 'equipment', 'tickets', 'equipmentTypes', 'accessories'];
        
        return requiredFields.every(field => {
            return data.hasOwnProperty(field) && Array.isArray(data[field]);
        });
    }

    /**
     * Retorna dados padrão
     * @returns {Object} Estrutura de dados padrão
     */
    getDefaultData() {
        return {
            employees: [
                { 
                    id: 'EMP001', 
                    name: 'João Silva', 
                    position: 'Desenvolvedor', 
                    email: 'joao@empresa.com', 
                    phone: '(11) 99999-9999', 
                    status: 'active', 
                    equipment: ['EQ001', 'EQ002'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: 'EMP002', 
                    name: 'Maria Santos', 
                    position: 'Designer', 
                    email: 'maria@empresa.com', 
                    phone: '(11) 88888-8888', 
                    status: 'active', 
                    equipment: ['EQ003'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: 'EMP003', 
                    name: 'Pedro Costa', 
                    position: 'Gerente', 
                    email: 'pedro@empresa.com', 
                    phone: '(11) 77777-7777', 
                    status: 'inactive', 
                    equipment: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            equipment: [
                { 
                    id: 'EQ001', 
                    brand: 'Dell', 
                    model: 'Inspiron 15', 
                    name: 'Dell Inspiron 15', 
                    type: 'notebook', 
                    series: 'DL123456', 
                    patrimony: 'PAT001', 
                    value: 2500.00, 
                    status: 'in-use', 
                    assignedTo: 'EMP001', 
                    observation: 'Em bom estado',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: 'EQ002', 
                    brand: 'LG', 
                    model: '24MK430H', 
                    name: 'LG 24MK430H', 
                    type: 'monitor', 
                    series: 'LG789012', 
                    patrimony: 'PAT002', 
                    value: 800.00, 
                    status: 'in-use', 
                    assignedTo: 'EMP001', 
                    observation: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: 'EQ003', 
                    brand: 'Logitech', 
                    model: 'MX Master 3', 
                    name: 'Logitech MX Master 3', 
                    type: 'mouse', 
                    series: 'LG345678', 
                    patrimony: 'PAT003', 
                    value: 150.00, 
                    status: 'in-use', 
                    assignedTo: 'EMP002', 
                    observation: 'Mouse sem fio',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            tickets: [
                { 
                    id: 'CH0001', 
                    glpiId: '45473', 
                    requestor: 'DHANIEL RIBEIRO MARQUES', 
                    equipmentType: 'Celular', 
                    serviceType: 'Solicitação novo', 
                    requestedForUser: 'JOAO PEDRO LIMA BUENO', 
                    location: 'LYON', 
                    status: 'aguardando-equipamento', 
                    ticketType: 'SOLICITACAO', 
                    createdAt: '2025-07-29',
                    justification: 'Celular para auxiliar nas demandas e pendencias de entrega. Equipe de Instalações',
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: 'CH0002', 
                    glpiId: '45500', 
                    requestor: 'MARIA SILVA SANTOS', 
                    equipmentType: 'Notebook', 
                    serviceType: 'Manutenção', 
                    requestedForUser: 'MARIA SILVA SANTOS', 
                    location: 'São Paulo', 
                    status: 'aguardando-validacao', 
                    ticketType: 'MANUTENCAO', 
                    createdAt: '2025-07-28',
                    justification: 'Notebook apresentando travamentos frequentes, necessita manutenção preventiva',
                    updatedAt: new Date().toISOString()
                }
            ],
            equipmentTypes: [
                { id: 1, name: 'Notebook', description: 'Computadores portáteis' },
                { id: 2, name: 'Monitor', description: 'Telas e monitores' },
                { id: 3, name: 'Mouse', description: 'Dispositivos de entrada' },
                { id: 4, name: 'Teclado', description: 'Teclados diversos' }
            ],
            accessories: [
                { id: 1, name: 'Cabo HDMI', specification: '2 metros, 4K support' },
                { id: 2, name: 'Hub USB', specification: '4 portas USB 3.0' },
                { id: 3, name: 'Mousepad', specification: 'Tamanho grande, antiderrapante' }
            ],
            version: CONFIG.APP_VERSION,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Reseta todos os dados
     * @returns {boolean} True se resetou com sucesso
     */
    reset() {
        try {
            localStorage.removeItem(this.storageKey);
            this.cache.clear();
            
            Utils.devLog('Dados resetados');
            ToastManager.success('Todos os dados foram removidos');
            return true;
            
        } catch (error) {
            Utils.devLog('Erro ao resetar dados', error, 'error');
            ToastManager.error('Erro ao resetar dados');
            return false;
        }
    }

    /**
     * Exporta dados para arquivo
     * @param {string} format - Formato (json, csv)
     * @returns {boolean} True se exportou com sucesso
     */
    export(format = 'json') {
        try {
            const data = this.load();
            if (!data) {
                ToastManager.warning('Nenhum dado para exportar');
                return false;
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${CONFIG.BACKUP_PREFIX}${timestamp}.${format}`;
            
            Utils.exportFile(data, filename, format);
            
            Utils.devLog(`Dados exportados: ${filename}`);
            ToastManager.success(MESSAGES.SUCCESS.EXPORT);
            return true;
            
        } catch (error) {
            Utils.devLog('Erro ao exportar dados', error, 'error');
            ToastManager.error('Erro ao exportar dados');
            return false;
        }
    }

    /**
     * Importa dados de arquivo
     * @param {File} file - Arquivo a ser importado
     * @returns {Promise<boolean>} Promise que resolve com true se importou com sucesso
     */
    async import(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                ToastManager.error('Nenhum arquivo selecionado');
                resolve(false);
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (!this.validateDataStructure(importedData)) {
                        throw new Error('Estrutura de dados inválida');
                    }

                    // Confirma importação
                    ToastManager.confirm(
                        'Importar dados irá substituir todos os dados atuais. Continuar?',
                        () => {
                            if (this.save(importedData)) {
                                window.appState = importedData;
                                ToastManager.success(MESSAGES.SUCCESS.IMPORT);
                                
                                // Recarrega a página para refletir mudanças
                                setTimeout(() => window.location.reload(), 1000);
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        },
                        () => resolve(false)
                    );
                    
                } catch (error) {
                    Utils.devLog('Erro ao importar dados', error, 'error');
                    ToastManager.error('Arquivo inválido ou corrompido');
                    resolve(false);
                }
            };

            reader.onerror = () => {
                Utils.devLog('Erro ao ler arquivo', reader.error, 'error');
                ToastManager.error('Erro ao ler arquivo');
                resolve(false);
            };

            reader.readAsText(file);
        });
    }

    /**
     * Adiciona operação à fila de sincronização
     * @param {string} operation - Tipo de operação
     * @param {any} data - Dados da operação
     */
    addToSyncQueue(operation, data) {
        this.syncQueue.push({
            id: Utils.generateId('sync'),
            operation,
            data,
            timestamp: Date.now(),
            retries: 0
        });

        Utils.devLog(`Operação adicionada à fila de sincronização: ${operation}`);
    }

    /**
     * Processa fila de sincronização
     */
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;

        Utils.devLog(`Processando ${this.syncQueue.length} operações da fila de sincronização`);

        const queue = [...this.syncQueue];
        this.syncQueue = [];

        for (const item of queue) {
            try {
                await this.syncOperation(item);
                Utils.devLog(`Operação sincronizada: ${item.operation}`);
                
            } catch (error) {
                Utils.devLog(`Erro ao sincronizar operação: ${item.operation}`, error, 'error');
                
                // Recoloca na fila se não excedeu tentativas
                if (item.retries < CONFIG.API_RETRY_ATTEMPTS) {
                    item.retries++;
                    this.syncQueue.push(item);
                }
            }
        }
    }

    /**
     * Sincroniza operação individual (preparação para API)
     * @param {Object} item - Item da fila de sincronização
     */
    async syncOperation(item) {
        // TODO: Implementar chamadas de API quando backend estiver disponível
        Utils.devLog(`Sincronizando operação: ${item.operation}`, item.data);
        
        // Simula delay de API
        if (DEV_CONFIG.MOCK_API_DELAY > 0) {
            await new Promise(resolve => setTimeout(resolve, DEV_CONFIG.MOCK_API_DELAY));
        }
        
        // Por enquanto, apenas loga a operação
        return Promise.resolve();
    }

    /**
     * Obtém estatísticas de armazenamento
     * @returns {Object} Estatísticas
     */
    getStorageStats() {
        try {
            const data = this.load();
            if (!data) return null;

            const dataString = JSON.stringify(data);
            const sizeInBytes = new Blob([dataString]).size;
            
            return {
                totalSize: Utils.formatBytes(sizeInBytes),
                totalItems: {
                    employees: data.employees?.length || 0,
                    equipment: data.equipment?.length || 0,
                    tickets: data.tickets?.length || 0,
                    equipmentTypes: data.equipmentTypes?.length || 0,
                    accessories: data.accessories?.length || 0
                },
                lastUpdated: data.lastUpdated,
                version: data.version,
                cacheSize: this.cache.size,
                syncQueueSize: this.syncQueue.length,
                isOnline: this.isOnline
            };
            
        } catch (error) {
            Utils.devLog('Erro ao obter estatísticas de armazenamento', error, 'error');
            return null;
        }
    }

    /**
     * Limpa cache
     */
    clearCache() {
        this.cache.clear();
        Utils.devLog('Cache limpo');
    }

    /**
     * Verifica integridade dos dados
     * @returns {Object} Resultado da verificação
     */
    checkDataIntegrity() {
        try {
            const data = this.load();
            if (!data) return { valid: false, errors: ['Nenhum dado encontrado'] };

            const errors = [];
            
            // Verifica estrutura básica
            if (!this.validateDataStructure(data)) {
                errors.push('Estrutura de dados inválida');
            }

            // Verifica IDs únicos
            const allIds = new Set();
            ['employees', 'equipment', 'tickets'].forEach(collection => {
                data[collection]?.forEach(item => {
                    if (allIds.has(item.id)) {
                        errors.push(`ID duplicado encontrado: ${item.id}`);
                    }
                    allIds.add(item.id);
                });
            });

            // Verifica referências
            data.equipment?.forEach(eq => {
                if (eq.assignedTo && !data.employees?.find(emp => emp.id === eq.assignedTo)) {
                    errors.push(`Equipamento ${eq.id} referencia colaborador inexistente: ${eq.assignedTo}`);
                }
            });

            return {
                valid: errors.length === 0,
                errors: errors,
                checkedAt: new Date().toISOString()
            };
            
        } catch (error) {
            Utils.devLog('Erro ao verificar integridade dos dados', error, 'error');
            return {
                valid: false,
                errors: ['Erro ao verificar integridade dos dados'],
                checkedAt: new Date().toISOString()
            };
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}

// Exportar para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}