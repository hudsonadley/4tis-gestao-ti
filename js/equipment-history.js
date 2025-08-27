/**
 * 4TIS SaaS - Módulo de Histórico de Equipamentos
 * Sistema para gerenciar histórico e rastreabilidade de equipamentos
 */

class EquipmentHistoryManager {
    constructor() {
        this.setupEventListeners();
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeHistoryInterface();
        });
    }

    /**
     * Inicializa interface de histórico
     */
    initializeHistoryInterface() {
        // Adiciona botões de histórico na interface de equipamentos
        this.addHistoryButtons();
    }

    /**
     * Adiciona botões de histórico na interface
     */
    addHistoryButtons() {
        // Será chamado quando necessário
    }

    /**
     * Mostra histórico de um equipamento
     */
    async showEquipmentHistory(equipmentId) {
        try {
            // Buscar dados do equipamento
            const equipmentResponse = await fetch(`/api/equipment/${equipmentId}`);
            if (!equipmentResponse.ok) {
                throw new Error('Equipamento não encontrado');
            }
            
            const equipment = await equipmentResponse.json();
            
            // Buscar histórico
            const historyResponse = await fetch(`/api/equipment/${equipmentId}/history`);
            if (!historyResponse.ok) {
                throw new Error('Erro ao buscar histórico');
            }
            
            const history = await historyResponse.json();
            
            // Mostrar modal de histórico
            this.showHistoryModal(equipment, history);
            
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao buscar histórico: ' + error.message);
            }
        }
    }

    /**
     * Mostra modal de histórico
     */
    showHistoryModal(equipment, history) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3>Histórico do Equipamento - ${equipment.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-3">Informações do Equipamento</h4>
                        <div class="bg-gray-50 p-4 rounded border">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div><strong>Nome:</strong> ${equipment.name}</div>
                                <div><strong>Tipo:</strong> ${equipment.type}</div>
                                <div><strong>Marca:</strong> ${equipment.brand || 'N/A'}</div>
                                <div><strong>Modelo:</strong> ${equipment.model || 'N/A'}</div>
                                <div><strong>Série:</strong> ${equipment.serial_number || 'N/A'}</div>
                                <div><strong>Patrimônio:</strong> ${equipment.patrimony || 'N/A'}</div>
                                <div><strong>Valor:</strong> R$ ${(equipment.value || 0).toFixed(2)}</div>
                                <div><strong>Status:</strong> <span class="status-badge status-${equipment.status}">${this.getStatusLabel(equipment.status)}</span></div>
                                <div><strong>Atribuído a:</strong> ${equipment.assigned_to || 'Disponível'}</div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-lg font-semibold">Histórico de Uso</h4>
                            <span class="text-sm text-gray-600">${history.length} registro(s)</span>
                        </div>

                        ${history.length === 0 ? 
                            '<p class="text-center text-gray-500 py-8">Nenhum histórico de uso registrado.</p>' :
                            `<div class="space-y-4">
                                ${history.map((record, index) => `
                                    <div class="bg-white border rounded-lg p-4">
                                        <div class="flex items-start justify-between mb-3">
                                            <div class="flex-1">
                                                <div class="flex items-center mb-2">
                                                    <span class="text-2xl mr-3">👤</span>
                                                    <div>
                                                        <h5 class="font-medium">${record.employee_name}</h5>
                                                        <p class="text-sm text-gray-600">
                                                            Colaborador ID: ${record.employee_id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <p class="text-sm text-gray-600">Devolução #${index + 1}</p>
                                                <p class="text-sm font-medium">
                                                    ${this.formatDate(record.return_date)}
                                                </p>
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div class="bg-blue-50 border border-blue-200 rounded p-3">
                                                <p class="text-sm text-blue-600 mb-1">Tempo de Uso</p>
                                                <p class="font-semibold text-blue-800">
                                                    ${record.usage_days ? `${record.usage_days} dias` : 'Não calculado'}
                                                </p>
                                            </div>
                                            <div class="bg-green-50 border border-green-200 rounded p-3">
                                                <p class="text-sm text-green-600 mb-1">Devolvido por</p>
                                                <p class="font-semibold text-green-800">
                                                    ${record.returned_by || 'Sistema'}
                                                </p>
                                            </div>
                                        </div>

                                        <div class="bg-gray-50 border rounded p-3">
                                            <p class="text-sm text-gray-600 mb-1">Observações da Devolução:</p>
                                            <p class="text-sm">
                                                ${record.return_notes || 'Nenhuma observação registrada'}
                                            </p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>`
                        }
                    </div>

                    ${equipment.assigned_to ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div class="flex items-center">
                                <span class="text-yellow-600 mr-2">⚠️</span>
                                <div>
                                    <p class="font-medium text-yellow-800">Equipamento Atualmente em Uso</p>
                                    <p class="text-sm text-yellow-700">
                                        Este equipamento está atribuído a um colaborador. 
                                        Use o botão "Devolver" para registrar a devolução.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    ${equipment.assigned_to ? `
                        <button 
                            class="btn btn-warning" 
                            onclick="equipmentHistoryManager.showReturnModal('${equipment.id}')"
                        >
                            📦 Devolver Equipamento
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Fechar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Mostra modal de devolução
     */
    showReturnModal(equipmentId) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Devolver Equipamento</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Observações sobre a devolução (OBRIGATÓRIO):
                        </label>
                        <textarea 
                            id="return-notes" 
                            class="form-control" 
                            rows="4" 
                            placeholder="Descreva o estado do equipamento, observações relevantes, motivo da devolução..."
                            required
                        ></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Responsável pela devolução:
                        </label>
                        <input 
                            type="text" 
                            id="returned-by" 
                            class="form-control" 
                            placeholder="Nome do responsável que recebeu o equipamento"
                            value="Sistema"
                        >
                    </div>

                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <span class="text-blue-600 mr-2">ℹ️</span>
                            <div class="text-sm">
                                <p class="font-medium text-blue-800">Importante:</p>
                                <p class="text-blue-700">
                                    As observações serão registradas permanentemente no histórico do equipamento 
                                    e são essenciais para rastreabilidade e controle de qualidade.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button 
                        class="btn btn-primary" 
                        onclick="equipmentHistoryManager.processReturn('${equipmentId}')"
                    >
                        Confirmar Devolução
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Processa devolução do equipamento
     */
    async processReturn(equipmentId) {
        try {
            const returnNotes = document.getElementById('return-notes').value.trim();
            const returnedBy = document.getElementById('returned-by').value.trim();

            if (!returnNotes) {
                if (window.ToastManager) {
                    ToastManager.error('As observações sobre a devolução são obrigatórias');
                }
                return;
            }

            const response = await fetch('/api/equipment/return', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    equipment_id: equipmentId,
                    return_notes: returnNotes,
                    returned_by: returnedBy || 'Sistema'
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao processar devolução');
            }

            const result = await response.json();

            // Fechar modais
            document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());

            // Notificar sucesso
            if (window.ToastManager) {
                ToastManager.success('Equipamento devolvido com sucesso!');
            }

            // Mostrar resultado
            this.showReturnResult(result);

            // Atualizar interface se necessário
            if (window.switchTab) {
                // Pode atualizar a aba atual
            }

        } catch (error) {
            console.error('Erro ao processar devolução:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao processar devolução: ' + error.message);
            }
        }
    }

    /**
     * Mostra resultado da devolução
     */
    showReturnResult(result) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Devolução Processada</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-6">
                        <div class="text-6xl mb-4">✅</div>
                        <h4 class="text-xl font-semibold text-green-600 mb-2">
                            Devolução registrada com sucesso!
                        </h4>
                        <p class="text-gray-600">
                            O equipamento ${result.equipment.name} foi devolvido.
                        </p>
                    </div>

                    <div class="bg-gray-50 border rounded-lg p-4 mb-4">
                        <div class="grid grid-cols-1 gap-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Colaborador:</span>
                                <span class="font-medium">${result.employee ? result.employee.name : 'N/A'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Tempo de uso:</span>
                                <span class="font-medium">${result.usage_days} dias</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Status atual:</span>
                                <span class="font-medium text-green-600">Disponível</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p class="text-sm text-blue-700">
                            O equipamento retornou ao estoque e está disponível para nova atribuição. 
                            Todas as informações foram registradas no histórico.
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                        Entendido
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Obtém label do status
     */
    getStatusLabel(status) {
        const statusLabels = {
            'available': 'Disponível',
            'assigned': 'Em Uso',
            'maintenance': 'Manutenção',
            'retired': 'Aposentado',
            'in_stock': 'Em Estoque'
        };
        return statusLabels[status] || status;
    }

    /**
     * Formata data para exibição
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Inicializa o gerenciador de histórico
const equipmentHistoryManager = new EquipmentHistoryManager();

// Exporta para uso global
window.equipmentHistoryManager = equipmentHistoryManager;

