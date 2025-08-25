/**
 * 4TIS SaaS - Módulo de Alertas
 * Sistema para gerenciar alertas e notificações
 */

class AlertsManager {
    constructor() {
        this.alerts = [];
        this.setupEventListeners();
        this.loadAlerts();
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Verifica alertas a cada 30 segundos
        setInterval(() => {
            this.loadAlerts();
        }, 30000);

        // Event listener para quando a aba de colaboradores for carregada
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeAlertsDisplay();
        });
    }

    /**
     * Carrega alertas do servidor
     */
    async loadAlerts() {
        try {
            const response = await fetch('/api/alerts');
            if (response.ok) {
                this.alerts = await response.json();
                this.updateAlertsDisplay();
                this.updateBadges();
            }
        } catch (error) {
            console.error('Erro ao carregar alertas:', error);
        }
    }

    /**
     * Carrega colaboradores pré-cadastrados
     */
    async loadPreRegisteredEmployees() {
        try {
            const response = await fetch('/api/alerts/pre-registered-employees');
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('Erro ao carregar colaboradores pré-cadastrados:', error);
            return [];
        }
    }

    /**
     * Cria alerta para colaborador pré-cadastrado
     */
    async createPreRegisteredAlert(employee) {
        try {
            const alert = {
                type: 'pre-registered-employee',
                title: 'Colaborador Pré-cadastrado',
                message: `O colaborador "${employee.name}" foi pré-cadastrado durante a importação de um chamado. Complete o cadastro com as informações necessárias.`,
                employee_id: employee.id,
                priority: 'medium'
            };

            const response = await fetch('/api/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(alert)
            });

            if (response.ok) {
                const createdAlert = await response.json();
                this.alerts.push(createdAlert);
                this.updateAlertsDisplay();
                this.updateBadges();
                return createdAlert;
            }
        } catch (error) {
            console.error('Erro ao criar alerta:', error);
        }
    }

    /**
     * Marca alerta como resolvido
     */
    async dismissAlert(alertId) {
        try {
            const response = await fetch(`/api/alerts/${alertId}/dismiss`, {
                method: 'PUT'
            });

            if (response.ok) {
                // Remove o alerta da lista local
                this.alerts = this.alerts.filter(alert => alert.id !== alertId);
                this.updateAlertsDisplay();
                this.updateBadges();
                
                if (window.ToastManager) {
                    ToastManager.success('Alerta marcado como resolvido');
                }
            }
        } catch (error) {
            console.error('Erro ao resolver alerta:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao resolver alerta');
            }
        }
    }

    /**
     * Inicializa exibição de alertas
     */
    initializeAlertsDisplay() {
        // Adiciona seção de alertas no dashboard se não existir
        this.addAlertsSection();
    }

    /**
     * Adiciona seção de alertas no dashboard
     */
    addAlertsSection() {
        const dashboardContent = document.getElementById('dashboard-content');
        if (!dashboardContent) return;

        // Verifica se a seção já existe
        if (document.getElementById('alerts-section')) return;

        const alertsSection = document.createElement('div');
        alertsSection.id = 'alerts-section';
        alertsSection.className = 'alerts-section mb-6';
        alertsSection.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border p-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                        <span class="mr-2">🔔</span>
                        Alertas e Notificações
                    </h3>
                    <span id="alerts-count" class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        0
                    </span>
                </div>
                <div id="alerts-list" class="space-y-2">
                    <p class="text-gray-500 text-sm">Nenhum alerta no momento</p>
                </div>
            </div>
        `;

        // Insere no início do dashboard
        dashboardContent.insertBefore(alertsSection, dashboardContent.firstChild);
    }

    /**
     * Atualiza exibição de alertas
     */
    updateAlertsDisplay() {
        const alertsList = document.getElementById('alerts-list');
        const alertsCount = document.getElementById('alerts-count');
        
        if (!alertsList || !alertsCount) return;

        // Atualiza contador
        alertsCount.textContent = this.alerts.length;
        alertsCount.className = this.alerts.length > 0 ? 
            'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full' :
            'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full';

        // Atualiza lista
        if (this.alerts.length === 0) {
            alertsList.innerHTML = '<p class="text-gray-500 text-sm">Nenhum alerta no momento</p>';
            return;
        }

        alertsList.innerHTML = this.alerts.map(alert => `
            <div class="alert-item bg-${this.getPriorityColor(alert.priority)}-50 border border-${this.getPriorityColor(alert.priority)}-200 rounded-lg p-3">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center mb-1">
                            <span class="text-${this.getPriorityColor(alert.priority)}-600 font-medium text-sm">
                                ${this.getAlertIcon(alert.type)} ${alert.title}
                            </span>
                            <span class="ml-2 text-xs text-gray-500">
                                ${this.formatDate(alert.created_at)}
                            </span>
                        </div>
                        <p class="text-sm text-gray-700">${alert.message}</p>
                        ${alert.employee_name ? `
                            <p class="text-xs text-gray-600 mt-1">
                                Colaborador: ${alert.employee_name}
                            </p>
                        ` : ''}
                    </div>
                    <div class="flex space-x-2 ml-4">
                        ${alert.type === 'pre-registered-employee' ? `
                            <button 
                                class="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                onclick="alertsManager.goToEmployee('${alert.employee_id}')"
                                title="Ir para o colaborador"
                            >
                                Editar
                            </button>
                        ` : ''}
                        <button 
                            class="text-gray-600 hover:text-gray-800 text-xs font-medium"
                            onclick="alertsManager.dismissAlert('${alert.id}')"
                            title="Marcar como resolvido"
                        >
                            ✓ Resolver
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Atualiza badges de alerta nas abas
     */
    updateBadges() {
        const employeeAlertBadge = document.getElementById('employeeAlertBadge');
        
        if (employeeAlertBadge) {
            const preRegisteredAlerts = this.alerts.filter(alert => 
                alert.type === 'pre-registered-employee'
            );
            
            if (preRegisteredAlerts.length > 0) {
                employeeAlertBadge.textContent = preRegisteredAlerts.length;
                employeeAlertBadge.classList.remove('hidden');
            } else {
                employeeAlertBadge.classList.add('hidden');
            }
        }
    }

    /**
     * Navega para o colaborador
     */
    goToEmployee(employeeId) {
        // Muda para a aba de colaboradores
        if (window.switchTab) {
            window.switchTab('employees');
        }
        
        // Aguarda um pouco para a aba carregar e então destaca o colaborador
        setTimeout(() => {
            this.highlightEmployee(employeeId);
        }, 500);
    }

    /**
     * Destaca colaborador na lista
     */
    highlightEmployee(employeeId) {
        // Procura pelo elemento do colaborador e destaca
        const employeeElements = document.querySelectorAll(`[data-employee-id="${employeeId}"]`);
        employeeElements.forEach(element => {
            element.classList.add('bg-yellow-100', 'border-yellow-300');
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Remove o destaque após alguns segundos
            setTimeout(() => {
                element.classList.remove('bg-yellow-100', 'border-yellow-300');
            }, 3000);
        });
    }

    /**
     * Obtém cor baseada na prioridade
     */
    getPriorityColor(priority) {
        switch (priority) {
            case 'high': return 'red';
            case 'medium': return 'yellow';
            case 'low': return 'blue';
            default: return 'gray';
        }
    }

    /**
     * Obtém ícone baseado no tipo de alerta
     */
    getAlertIcon(type) {
        switch (type) {
            case 'pre-registered-employee': return '👤';
            case 'equipment-pending': return '📦';
            case 'ticket-overdue': return '⏰';
            default: return '🔔';
        }
    }

    /**
     * Formata data para exibição
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }
}

// Inicializa o gerenciador de alertas
const alertsManager = new AlertsManager();

// Exporta para uso global
window.alertsManager = alertsManager;

