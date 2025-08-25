/**
 * Dashboard UI Module - Funcional
 */

class DashboardUI {
    static render() {
        const container = document.getElementById('dashboard-content');
        if (!container) return;

        const stats = this.calculateStats();
        
        container.innerHTML = `
            <!-- Cards de Estatísticas -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <!-- Card: Valor Total -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-blue-600">${stats.valorTotal}</div>
                            <div class="text-sm font-medium text-gray-600 mt-1">Valor Total</div>
                            <div class="text-xs text-blue-600 mt-2">Patrimônio da TI</div>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span class="text-2xl">💰</span>
                        </div>
                    </div>
                </div>

                <!-- Card: Valor em Uso -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-green-600">${stats.valorEmUso}</div>
                            <div class="text-sm font-medium text-gray-600 mt-1">Valor em Uso</div>
                            <div class="text-xs text-green-600 mt-2">Equipamentos Ativos</div>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span class="text-2xl">📱</span>
                        </div>
                    </div>
                </div>

                <!-- Card: Valor Disponível -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-yellow-600">${stats.valorDisponivel}</div>
                            <div class="text-sm font-medium text-gray-600 mt-1">Valor Disponível</div>
                            <div class="text-xs text-yellow-600 mt-2">Em Estoque</div>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span class="text-2xl">📦</span>
                        </div>
                    </div>
                </div>

                <!-- Card: Colaboradores Ativos -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-purple-600">${stats.activeEmployees}</div>
                            <div class="text-sm font-medium text-gray-600 mt-1">Colaboradores</div>
                            <div class="text-xs text-purple-600 mt-2">Ativos no Sistema</div>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span class="text-2xl">👥</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráficos e Chamados -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Coluna Esquerda: Chamados -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Chamados Recentes -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div class="p-6 border-b border-gray-100">
                            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <span>🎫</span> Chamados Recentes
                                <span class="ml-2 text-sm font-normal text-gray-500">(${stats.openTickets} abertos)</span>
                            </h3>
                        </div>
                        <div class="p-6">
                            ${this.renderRecentTickets()}
                        </div>
                    </div>

                    <!-- Atividades Recentes -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div class="p-6 border-b border-gray-100">
                            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <span>📈</span> Atividades Recentes
                            </h3>
                        </div>
                        <div class="p-6">
                            ${this.renderRecentActivity()}
                        </div>
                    </div>
                </div>

                <!-- Coluna Direita: Gráficos -->
                <div class="space-y-6">
                    <!-- Status dos Equipamentos -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div class="p-6 border-b border-gray-100">
                            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <span>📊</span> Status dos Equipamentos
                            </h3>
                        </div>
                        <div class="p-6">
                            ${this.renderEquipmentStats()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static calculateStats() {
        const appState = window.appState || {};
        const equipment = appState.equipment || [];
        
        // Calcula valores dos equipamentos
        const valorTotal = equipment.reduce((total, eq) => {
            const valorBase = parseFloat(eq.value) || 0;
            const valorPerifericos = (eq.peripherals || []).reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
            return total + valorBase + valorPerifericos;
        }, 0);

        const valorEmUso = equipment.filter(eq => eq.status === 'in-use').reduce((total, eq) => {
            const valorBase = parseFloat(eq.value) || 0;
            const valorPerifericos = (eq.peripherals || []).reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
            return total + valorBase + valorPerifericos;
        }, 0);

        const valorDisponivel = equipment.filter(eq => eq.status === 'stock').reduce((total, eq) => {
            const valorBase = parseFloat(eq.value) || 0;
            const valorPerifericos = (eq.peripherals || []).reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
            return total + valorBase + valorPerifericos;
        }, 0);

        return {
            openTickets: appState.tickets?.filter(t => t.status === 'open').length || 0,
            pendingValidation: appState.tickets?.filter(t => t.status === 'pending_validation').length || 0,
            activeEmployees: appState.employees?.filter(e => e.status === 'active').length || 0,
            valorTotal: Utils.formatCurrency(valorTotal),
            valorEmUso: Utils.formatCurrency(valorEmUso),
            valorDisponivel: Utils.formatCurrency(valorDisponivel)
        };
    }

    static renderRecentTickets() {
        const appState = window.appState || {};
        const tickets = appState.tickets || [];
        
        if (tickets.length === 0) {
            return '<p class="text-gray-500 italic">Nenhum chamado registrado.</p>';
        }

        return tickets
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(ticket => `
                <div class="p-4 border-b border-gray-100 last:border-0">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <span class="text-lg">🎫</span>
                            <div>
                                <h4 class="font-medium text-gray-900">${ticket.title}</h4>
                                <p class="text-sm text-gray-500">${ticket.description}</p>
                            </div>
                        </div>
                        <span class="status-badge status-${ticket.status}">${ticket.status}</span>
                    </div>
                </div>
            `).join('');
    }

    static renderRecentActivity() {
        const appState = window.appState || {};
        const activities = appState.activities || [];

        if (activities.length === 0) {
            return '<p class="text-gray-500 italic">Nenhuma atividade registrada.</p>';
        }

        return activities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(activity => `
                <div class="p-4 border-b border-gray-100 last:border-0">
                    <div class="flex items-center space-x-3">
                        <span class="text-lg">${activity.icon || '📝'}</span>
                        <div>
                            <p class="text-gray-900">${activity.description}</p>
                            <p class="text-sm text-gray-500">${new Date(activity.date).toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            `).join('');
    }

    static renderEquipmentStats() {
        const appState = window.appState || {};
        const equipment = appState.equipment || [];
        
        const stats = {
            total: equipment.length,
            inUse: equipment.filter(eq => eq.status === 'in-use').length,
            stock: equipment.filter(eq => eq.status === 'stock').length,
            maintenance: equipment.filter(eq => eq.status === 'maintenance').length
        };

        return `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Total</span>
                    <span class="font-bold">${stats.total}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Em Uso</span>
                    <span class="text-green-600 font-bold">${stats.inUse}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Em Estoque</span>
                    <span class="text-blue-600 font-bold">${stats.stock}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Em Manutenção</span>
                    <span class="text-orange-600 font-bold">${stats.maintenance}</span>
                </div>
            </div>
        `;
    }

    static setupEventListeners() {
        // Implementar listeners necessários
    }
}
