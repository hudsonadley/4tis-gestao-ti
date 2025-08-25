/**
 * 4TIS SaaS - Aplicação Principal
 * Sistema de Gestão de TI - MVP SaaS
 */

class App {
    constructor() {
        this.storageManager = null;
        this.appState = null;
        this.currentTab = 'dashboard';
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleUnload = this.handleUnload.bind(this);
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            Utils.devLog('Iniciando aplicação 4TIS SaaS...');
            
            // Configura handlers globais
            this.setupGlobalHandlers();
            
            // Inicializa gerenciador de armazenamento
            this.storageManager = new StorageManager();
            
            // Carrega dados
            await this.loadData();
            
            // Inicializa UI
            this.initializeUI();
            
            // Configura event listeners
            this.setupEventListeners();
            
            // Renderiza dashboard inicial
            this.switchTab('dashboard');
            
            // Marca como inicializado
            this.isInitialized = true;
            
            // Notifica sucesso
            ToastManager.success(MESSAGES.INFO.WELCOME);
            
            Utils.devLog('Aplicação inicializada com sucesso!');
            
        } catch (error) {
            this.handleError('Erro na inicialização da aplicação', error);
        }
    }

    /**
     * Configura handlers globais
     */
    setupGlobalHandlers() {
        // Handler de erros globais
        window.addEventListener('error', (event) => {
            this.handleError('Erro JavaScript global', event.error);
        });

        // Handler de promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Promise rejeitada não tratada', event.reason);
        });

        // Handler de beforeunload
        window.addEventListener('beforeunload', this.handleUnload);

        // Handler de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isInitialized) {
                this.refreshData();
            }
        });
    }

    /**
     * Carrega dados da aplicação
     */
    async loadData() {
        try {
            // Tenta carregar dados existentes
            let data = this.storageManager.load();
            
            // Se não existir, usa dados padrão
            if (!data) {
                data = this.storageManager.getDefaultData();
                this.storageManager.save(data);
                Utils.devLog('Dados padrão criados');
            }
            
            // Define estado global
            this.appState = data;
            window.appState = data;
            
            Utils.devLog('Dados carregados', data);
            
        } catch (error) {
            throw new Error(`Erro ao carregar dados: ${error.message}`);
        }
    }

    /**
     * Inicializa componentes da UI
     */
    initializeUI() {
        // Atualiza informações do usuário no header
        this.updateUserInfo();
        
        // Inicializa tooltips e outros componentes
        this.initializeTooltips();
        
        // Configura atalhos de teclado
        this.setupKeyboardShortcuts();
    }

    /**
     * Atualiza informações do usuário no header
     */
    updateUserInfo() {
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement && CURRENT_USER) {
            userInfoElement.innerHTML = `
                <div class="user-avatar">${CURRENT_USER.name.charAt(0)}</div>
                <span>${CURRENT_USER.name}</span>
            `;
        }
    }

    /**
     * Inicializa tooltips
     */
    initializeTooltips() {
        // Adiciona tooltips a elementos com data-tooltip
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip);
            element.addEventListener('mouseleave', this.hideTooltip);
        });
    }

    /**
     * Configura atalhos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + S para salvar
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                this.saveData();
                ToastManager.info('Dados salvos manualmente');
            }
            
            // Ctrl/Cmd + K para busca global
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                this.openGlobalSearch();
            }
            
            // Escape para fechar modais
            if (event.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Atalhos numéricos para tabs (1-5)
            if (event.altKey && event.key >= '1' && event.key <= '5') {
                event.preventDefault();
                const tabs = ['dashboard', 'employees', 'equipment', 'tickets', 'settings'];
                const tabIndex = parseInt(event.key) - 1;
                if (tabs[tabIndex]) {
                    this.switchTab(tabs[tabIndex]);
                }
            }
        });
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Navegação por tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('onclick')?.match(/switchTab\('(.+)'\)/)?.[1];
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Botão de logout
        const logoutBtn = document.querySelector('[onclick="logout()"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Auto-save em mudanças de formulário
        document.addEventListener('input', Utils.debounce(() => {
            if (this.isInitialized) {
                this.autoSave();
            }
        }, 2000));
    }

    /**
     * Troca de tab
     * @param {string} tabName - Nome da tab
     */
    switchTab(tabName) {
        if (!this.isInitialized) return;
        
        try {
            Utils.devLog(`Mudando para tab: ${tabName}`);
            
            // Remove active das tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Ativa a tab selecionada
            const tabButton = document.querySelector(`[onclick*="switchTab('${tabName}')"]`);
            const tabContent = document.getElementById(`${tabName}-tab`);
            
            if (tabButton && tabContent) {
                tabButton.classList.add('active');
                tabContent.classList.add('active');
                
                // Atualiza estado atual
                this.currentTab = tabName;
                
                // Renderiza conteúdo da tab
                setTimeout(() => {
                    this.renderTabContent(tabName);
                }, 50);
                
                // Atualiza URL (sem recarregar página)
                if (history.pushState) {
                    history.pushState(null, null, `#${tabName}`);
                }
            }
            
        } catch (error) {
            this.handleError(`Erro ao trocar para tab ${tabName}`, error);
        }
    }

    /**
     * Renderiza conteúdo da tab
     * @param {string} tabName - Nome da tab
     */
    renderTabContent(tabName) {
        try {
            switch (tabName) {
                case 'dashboard':
                    this.renderDashboard();
                    break;
                case 'employees':
                    this.renderEmployees();
                    break;
                case 'equipment':
                    this.renderEquipment();
                    break;
                case 'tickets':
                    this.renderTickets();
                    break;
                case 'settings':
                    this.renderSettings();
                    break;
                default:
                    Utils.devLog(`Tab desconhecida: ${tabName}`, null, 'warn');
            }
        } catch (error) {
            this.handleError(`Erro ao renderizar tab ${tabName}`, error);
        }
    }

    /**
     * Renderiza dashboard
     */
    renderDashboard() {
        if (typeof DashboardUI !== 'undefined') {
            DashboardUI.render();
        } else {
            console.error('DashboardUI não carregado');
        }
    }

    /**
     * Cria card de estatística
     */
    createStatCard(title, value, icon, textColor, bgColor) {
        return `
            <div class="card hover:shadow-md transition-shadow cursor-pointer" onclick="app.handleStatCardClick('${title}')">
                <div class="card-content">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold ${textColor}">${value}</div>
                            <div class="text-sm font-medium text-gray-600 mt-1">${title}</div>
                            <div class="text-xs ${textColor} mt-2 hover:underline">Ver detalhes →</div>
                        </div>
                        <div class="w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center">
                            <span class="text-2xl">${icon}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Calcula estatísticas do dashboard
     */
    calculateStats() {
        const openTickets = this.appState.tickets.filter(t => 
            !['resolvido', 'fechado', 'cancelado'].includes(t.status)
        ).length;
        
        const activeEmployees = this.appState.employees.filter(emp => 
            emp.status === 'active'
        ).length;
        
        const totalEquipment = this.appState.equipment.length;
        
        const totalValue = this.appState.equipment.reduce((sum, eq) => 
            sum + (eq.value || 0), 0
        );

        return {
            openTickets,
            activeEmployees,
            totalEquipment,
            totalValue
        };
    }

    /**
     * Renderiza atividade recente
     */
    renderRecentActivity() {
        // Simula atividades recentes
        const activities = [
            { type: 'success', message: 'Sistema inicializado', time: 'há 5 minutos' },
            { type: 'info', message: 'Dashboard carregado', time: 'agora' },
            { type: 'warning', message: 'Backup automático realizado', time: 'há 1 hora' }
        ];

        return `
            <div class="space-y-3">
                ${activities.map(activity => `
                    <div class="flex items-start gap-3 p-3 bg-${activity.type === 'success' ? 'green' : activity.type === 'warning' ? 'yellow' : 'blue'}-50 rounded-lg">
                        <div class="w-2 h-2 bg-${activity.type === 'success' ? 'green' : activity.type === 'warning' ? 'yellow' : 'blue'}-500 rounded-full mt-2"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">${activity.message}</p>
                            <p class="text-xs text-gray-500">${activity.time}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Renderiza alertas
     */
    renderAlerts() {
        const stats = this.calculateStats();
        const alerts = [];

        if (stats.openTickets > 0) {
            alerts.push({
                type: 'warning',
                message: `${stats.openTickets} chamados aguardando atendimento`,
                action: () => this.switchTab('tickets')
            });
        }

        if (alerts.length === 0) {
            alerts.push({
                type: 'success',
                message: 'Sistema funcionando normalmente',
                action: null
            });
        }

        return `
            <div class="space-y-3">
                ${alerts.map(alert => `
                    <div class="flex items-start gap-3 p-3 bg-${alert.type === 'success' ? 'green' : 'orange'}-50 rounded-lg ${alert.action ? 'cursor-pointer hover:bg-opacity-75' : ''}" ${alert.action ? `onclick="${alert.action}"` : ''}>
                        <div class="w-2 h-2 bg-${alert.type === 'success' ? 'green' : 'orange'}-500 rounded-full mt-2"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">${alert.message}</p>
                            <p class="text-xs text-gray-500">${alert.type === 'warning' ? 'Requer atenção' : 'Tudo funcionando'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Renderiza colaboradores
     */
    renderEmployees() {
        if (typeof EmployeesUI !== 'undefined') {
            EmployeesUI.render();
        } else {
            console.error('EmployeesUI não carregado');
        }
    }

    renderEquipment() {
        const container = document.getElementById('equipment-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Equipamentos</h2>
                    <button class="btn btn-primary" onclick="app.openEquipmentModal()">
                        ➕ Cadastrar Equipamento
                    </button>
                </div>
                <div class="card-content">
                    <p class="text-gray-600">Módulo de equipamentos será implementado...</p>
                </div>
            </div>
        `;
    }

    renderTickets() {
        const container = document.getElementById('tickets-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Chamados</h2>
                    <button class="btn btn-primary" onclick="app.openTicketModal()">
                        ➕ Novo Chamado
                    </button>
                </div>
                <div class="card-content">
                    <p class="text-gray-600">Módulo de chamados será implementado...</p>
                </div>
            </div>
        `;
    }

    renderSettings() {
        const container = document.getElementById('settings-content');
        if (!container) return;
        
        const stats = this.storageManager.getStorageStats();
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>⚙️ Configurações do Sistema</h2>
                </div>
                <div class="card-content">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-semibold mb-4">📊 Estatísticas</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span>Colaboradores:</span>
                                    <span class="font-medium">${stats?.totalItems.employees || 0}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Equipamentos:</span>
                                    <span class="font-medium">${stats?.totalItems.equipment || 0}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Chamados:</span>
                                    <span class="font-medium">${stats?.totalItems.tickets || 0}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Tamanho dos dados:</span>
                                    <span class="font-medium">${stats?.totalSize || '0 B'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold mb-4">🔧 Ações</h3>
                            <div class="space-y-3">
                                <button class="btn btn-primary w-full" onclick="app.exportData()">
                                    📥 Exportar Dados
                                </button>
                                <button class="btn btn-warning w-full" onclick="app.importData()">
                                    📤 Importar Dados
                                </button>
                                <button class="btn btn-danger w-full" onclick="app.resetData()">
                                    🗑️ Limpar Todos os Dados
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Handlers de ações
     */
    handleStatCardClick(cardTitle) {
        ToastManager.info(`Clicou em: ${cardTitle}`);
    }

    openEmployeeModal() {
        ToastManager.info('Modal de colaborador será implementado');
    }

    openEquipmentModal() {
        ToastManager.info('Modal de equipamento será implementado');
    }

    openTicketModal() {
        ToastManager.info('Modal de chamado será implementado');
    }

    /**
     * Salva dados
     */
    saveData() {
        if (this.storageManager && this.appState) {
            return this.storageManager.save(this.appState);
        }
        return false;
    }

    /**
     * Auto-save
     */
    autoSave() {
        if (this.isInitialized) {
            this.saveData();
        }
    }

    /**
     * Atualiza dados
     */
    refreshData() {
        try {
            const newData = this.storageManager.load();
            if (newData) {
                this.appState = newData;
                window.appState = newData;
                this.renderTabContent(this.currentTab);
            }
        } catch (error) {
            this.handleError('Erro ao atualizar dados', error);
        }
    }

    /**
     * Exporta dados
     */
    exportData() {
        this.storageManager.export('json');
    }

    /**
     * Importa dados
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const success = await this.storageManager.import(file);
                if (success) {
                    this.refreshData();
                }
            }
        };
        input.click();
    }

    /**
     * Reseta dados
     */
    resetData() {
        ToastManager.confirm(
            'Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.',
            () => {
                if (this.storageManager.reset()) {
                    this.appState = this.storageManager.getDefaultData();
                    window.appState = this.appState;
                    this.renderTabContent(this.currentTab);
                }
            }
        );
    }

    /**
     * Busca global
     */
    openGlobalSearch() {
        ToastManager.info('Busca global será implementada (Ctrl+K)');
    }

    /**
     * Fecha todos os modais
     */
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    /**
     * Logout
     */
    logout() {
        ToastManager.confirm(
            MESSAGES.WARNING.LOGOUT_CONFIRM,
            () => {
                // Salva dados antes de sair
                this.saveData();
                
                // Limpa dados sensíveis
                this.cleanup();
                
                // Notifica e recarrega
                ToastManager.success('Logout realizado com sucesso!');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        );
    }

    /**
     * Limpeza antes de sair
     */
    cleanup() {
        // Remove event listeners
        window.removeEventListener('beforeunload', this.handleUnload);
        
        // Limpa cache se necessário
        if (this.storageManager) {
            this.storageManager.clearCache();
        }
        
        Utils.devLog('Limpeza realizada');
    }

    /**
     * Handler de beforeunload
     */
    handleUnload(event) {
        // Salva dados antes de sair
        if (this.isInitialized) {
            this.saveData();
        }
    }

    /**
     * Handler de erros
     */
    handleError(message, error) {
        Utils.devLog(message, error, 'error');
        
        // Mostra toast de erro
        ToastManager.error(`${message}: ${error?.message || 'Erro desconhecido'}`);
        
        // Em desenvolvimento, mostra detalhes no console
        if (DEV_CONFIG.DEBUG) {
            console.error('Detalhes do erro:', error);
        }
    }

    /**
     * Mostra tooltip
     */
    showTooltip(event) {
        const element = event.target;
        const text = element.getAttribute('data-tooltip');
        
        if (!text) return;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
        
        element._tooltip = tooltip;
    }

    /**
     * Esconde tooltip
     */
    hideTooltip(event) {
        const element = event.target;
        if (element._tooltip) {
            element._tooltip.remove();
            delete element._tooltip;
        }
    }
}

// Instância global da aplicação
const app = new App();

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    app.init();
}

// Exporta para uso global
window.app = app;

// Funções globais para compatibilidade
window.switchTab = (tabName) => app.switchTab(tabName);
window.logout = () => app.logout();