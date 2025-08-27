/**
 * 4TIS SaaS - Módulo de Offboarding
 * Sistema para gerenciar processo de desligamento de colaboradores
 */

class OffboardingManager {
    constructor() {
        this.currentEmployee = null;
        this.equipmentList = [];
        this.setupEventListeners();
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeOffboardingInterface();
        });
    }

    /**
     * Inicializa interface de offboarding
     */
    initializeOffboardingInterface() {
        // Adiciona botões de offboarding na interface de colaboradores
        this.addOffboardingButtons();
    }

    /**
     * Adiciona botões de offboarding na interface
     */
    addOffboardingButtons() {
        // Será chamado quando necessário
    }

    /**
     * Inicia processo de offboarding
     */
    async initiateOffboarding(employeeId) {
        try {
            // Buscar dados do colaborador
            const employeeResponse = await fetch(`/api/employees/${employeeId}`);
            if (!employeeResponse.ok) {
                throw new Error('Colaborador não encontrado');
            }
            
            this.currentEmployee = await employeeResponse.json();
            
            // Buscar equipamentos do colaborador
            const equipmentResponse = await fetch(`/api/offboarding/employee/${employeeId}/equipment`);
            if (!equipmentResponse.ok) {
                throw new Error('Erro ao buscar equipamentos');
            }
            
            this.equipmentList = await equipmentResponse.json();
            
            // Mostrar modal de offboarding
            this.showOffboardingModal();
            
        } catch (error) {
            console.error('Erro ao iniciar offboarding:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao iniciar processo de offboarding: ' + error.message);
            }
        }
    }

    /**
     * Mostra modal de offboarding
     */
    showOffboardingModal() {
        const modal = this.createOffboardingModal();
        document.body.appendChild(modal);
    }

    /**
     * Cria modal de offboarding
     */
    createOffboardingModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3>Processo de Offboarding - ${this.currentEmployee.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-3">Informações do Colaborador</h4>
                        <div class="bg-gray-50 p-4 rounded border">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>Nome:</strong> ${this.currentEmployee.name}</div>
                                <div><strong>Cargo:</strong> ${this.currentEmployee.position || 'N/A'}</div>
                                <div><strong>Departamento:</strong> ${this.currentEmployee.department || 'N/A'}</div>
                                <div><strong>Email:</strong> ${this.currentEmployee.email || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-3">Equipamentos Atribuídos (${this.equipmentList.length})</h4>
                        ${this.equipmentList.length === 0 ? 
                            '<p class="text-gray-500">Nenhum equipamento atribuído a este colaborador.</p>' :
                            `<div class="space-y-3" id="equipment-checklist">
                                ${this.equipmentList.map(equipment => `
                                    <div class="equipment-item bg-white border rounded-lg p-4">
                                        <div class="flex items-start justify-between">
                                            <div class="flex-1">
                                                <div class="flex items-center mb-2">
                                                    <span class="text-2xl mr-3">${equipment.type_icon || '📦'}</span>
                                                    <div>
                                                        <h5 class="font-medium">${equipment.name}</h5>
                                                        <p class="text-sm text-gray-600">
                                                            ${equipment.type_name || equipment.type} • 
                                                            Série: ${equipment.serial_number || 'N/A'} • 
                                                            Patrimônio: ${equipment.patrimony || 'N/A'}
                                                        </p>
                                                        <p class="text-sm font-medium text-green-600">
                                                            Valor: R$ ${(equipment.value || 0).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="flex items-center space-x-4">
                                                <label class="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        class="equipment-returned mr-2" 
                                                        data-equipment-id="${equipment.id}"
                                                        onchange="offboardingManager.toggleEquipmentReturn('${equipment.id}')"
                                                    >
                                                    <span class="text-sm font-medium">Devolvido</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="mt-3 hidden" id="notes-${equipment.id}">
                                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                                Observações sobre a devolução:
                                            </label>
                                            <textarea 
                                                class="form-control text-sm" 
                                                rows="2" 
                                                placeholder="Descreva o estado do equipamento, observações relevantes..."
                                                data-equipment-id="${equipment.id}"
                                            ></textarea>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>`
                        }
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Observações Gerais do Offboarding:
                        </label>
                        <textarea 
                            id="offboarding-notes" 
                            class="form-control" 
                            rows="3" 
                            placeholder="Observações gerais sobre o processo de desligamento..."
                        ></textarea>
                    </div>

                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <span class="text-yellow-600 mr-2">⚠️</span>
                            <div class="text-sm">
                                <p class="font-medium text-yellow-800">Importante:</p>
                                <p class="text-yellow-700">
                                    O colaborador será inativado mesmo que não tenha devolvido todos os equipamentos. 
                                    Equipamentos não devolvidos permanecerão vinculados para posterior resolução.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="offboardingManager.processOffboarding()">
                        Processar Offboarding
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Alterna estado de devolução do equipamento
     */
    toggleEquipmentReturn(equipmentId) {
        const checkbox = document.querySelector(`input[data-equipment-id="${equipmentId}"]`);
        const notesDiv = document.getElementById(`notes-${equipmentId}`);
        
        if (checkbox.checked) {
            notesDiv.classList.remove('hidden');
        } else {
            notesDiv.classList.add('hidden');
        }
    }

    /**
     * Processa o offboarding
     */
    async processOffboarding() {
        try {
            // Coletar dados dos equipamentos
            const equipmentReturns = this.equipmentList.map(equipment => {
                const checkbox = document.querySelector(`input[data-equipment-id="${equipment.id}"]`);
                const notesTextarea = document.querySelector(`textarea[data-equipment-id="${equipment.id}"]`);
                
                return {
                    equipment_id: equipment.id,
                    returned: checkbox.checked,
                    notes: notesTextarea ? notesTextarea.value : ''
                };
            });

            const generalNotes = document.getElementById('offboarding-notes').value;

            // Enviar dados para o servidor
            const response = await fetch('/api/offboarding/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employee_id: this.currentEmployee.id,
                    equipment_returns: equipmentReturns,
                    notes: generalNotes
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao processar offboarding');
            }

            const result = await response.json();

            // Fechar modal
            document.querySelector('.modal-overlay').remove();

            // Mostrar resultado
            this.showOffboardingResult(result);

            // Atualizar interface
            if (window.switchTab) {
                window.switchTab('employees');
            }

        } catch (error) {
            console.error('Erro ao processar offboarding:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao processar offboarding: ' + error.message);
            }
        }
    }

    /**
     * Mostra resultado do offboarding
     */
    showOffboardingResult(result) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>Offboarding Processado</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-6">
                        <div class="text-6xl mb-4">✅</div>
                        <h4 class="text-xl font-semibold text-green-600 mb-2">
                            Offboarding processado com sucesso!
                        </h4>
                        <p class="text-gray-600">
                            O colaborador ${result.employee.name} foi inativado.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 class="font-semibold text-green-800 mb-2">
                                📦 Equipamentos Devolvidos
                            </h5>
                            <p class="text-2xl font-bold text-green-600 mb-1">
                                ${result.returned_equipment.length}
                            </p>
                            <p class="text-sm text-green-700">
                                Equipamentos retornaram ao estoque
                            </p>
                        </div>

                        ${result.pending_equipment.length > 0 ? `
                            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h5 class="font-semibold text-yellow-800 mb-2">
                                    ⏳ Equipamentos Pendentes
                                </h5>
                                <p class="text-2xl font-bold text-yellow-600 mb-1">
                                    ${result.pending_equipment.length}
                                </p>
                                <p class="text-sm text-yellow-700">
                                    Aguardando resolução
                                </p>
                            </div>
                        ` : `
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 class="font-semibold text-blue-800 mb-2">
                                    ✨ Status
                                </h5>
                                <p class="text-lg font-medium text-blue-600">
                                    Completo
                                </p>
                                <p class="text-sm text-blue-700">
                                    Todos os equipamentos foram devolvidos
                                </p>
                            </div>
                        `}
                    </div>

                    ${result.pending_equipment.length > 0 ? `
                        <div class="bg-gray-50 border rounded-lg p-4">
                            <h5 class="font-semibold mb-3">Próximos Passos:</h5>
                            <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
                                <li>O colaborador aparecerá na lista de "Colaboradores com Pendências"</li>
                                <li>Use os botões "Resolver Pendência" ou "Desconto em Rescisão" conforme necessário</li>
                                <li>O departamento de RH será notificado sobre equipamentos não devolvidos</li>
                            </ul>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                        Entendido
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Notificar sucesso
        if (window.ToastManager) {
            ToastManager.success('Offboarding processado com sucesso!');
        }
    }

    /**
     * Mostra colaboradores com pendências
     */
    async showPendingEmployees() {
        try {
            const response = await fetch('/api/offboarding/pending-employees');
            if (!response.ok) {
                throw new Error('Erro ao buscar colaboradores com pendências');
            }

            const pendingEmployees = await response.json();
            this.showPendingEmployeesModal(pendingEmployees);

        } catch (error) {
            console.error('Erro ao buscar colaboradores com pendências:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao buscar colaboradores com pendências');
            }
        }
    }

    /**
     * Mostra modal com colaboradores pendentes
     */
    showPendingEmployeesModal(employees) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3>Colaboradores com Equipamentos Pendentes</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${employees.length === 0 ? 
                        '<p class="text-center text-gray-500 py-8">Nenhum colaborador com equipamentos pendentes.</p>' :
                        `<div class="space-y-4">
                            ${employees.map(employee => `
                                <div class="bg-white border rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex-1">
                                            <h5 class="font-semibold">${employee.name}</h5>
                                            <p class="text-sm text-gray-600">
                                                ${employee.position || 'N/A'} • ${employee.department || 'N/A'}
                                            </p>
                                            <p class="text-sm font-medium text-yellow-600">
                                                ${employee.pending_equipment_count} equipamento(s) pendente(s)
                                            </p>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button 
                                                class="btn btn-sm btn-primary"
                                                onclick="offboardingManager.showEmployeePendencies('${employee.id}')"
                                            >
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>`
                    }
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Fechar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Mostra pendências específicas de um colaborador
     */
    async showEmployeePendencies(employeeId) {
        try {
            // Buscar dados do colaborador
            const employeeResponse = await fetch(`/api/employees/${employeeId}`);
            const employee = await employeeResponse.json();

            // Buscar equipamentos pendentes
            const equipmentResponse = await fetch(`/api/offboarding/employee/${employeeId}/equipment`);
            const equipment = await equipmentResponse.json();

            // Fechar modal atual
            document.querySelector('.modal-overlay').remove();

            // Mostrar modal de pendências
            this.showEmployeePendenciesModal(employee, equipment);

        } catch (error) {
            console.error('Erro ao buscar pendências:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao buscar pendências do colaborador');
            }
        }
    }

    /**
     * Mostra modal de pendências do colaborador
     */
    showEmployeePendenciesModal(employee, equipment) {
        const totalValue = equipment.reduce((sum, eq) => sum + (parseFloat(eq.value) || 0), 0);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3>Pendências de Equipamentos - ${employee.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="mb-6">
                        <div class="bg-gray-50 p-4 rounded border">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>Nome:</strong> ${employee.name}</div>
                                <div><strong>Cargo:</strong> ${employee.position || 'N/A'}</div>
                                <div><strong>Departamento:</strong> ${employee.department || 'N/A'}</div>
                                <div><strong>Status:</strong> <span class="text-red-600 font-medium">Inativo</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-lg font-semibold">Equipamentos Pendentes</h4>
                            <div class="text-right">
                                <p class="text-sm text-gray-600">Valor Total:</p>
                                <p class="text-xl font-bold text-red-600">R$ ${totalValue.toFixed(2)}</p>
                            </div>
                        </div>

                        <div class="space-y-3">
                            ${equipment.map(eq => `
                                <div class="bg-white border border-red-200 rounded-lg p-4">
                                    <div class="flex items-start justify-between">
                                        <div class="flex-1">
                                            <div class="flex items-center mb-2">
                                                <span class="text-2xl mr-3">${eq.type_icon || '📦'}</span>
                                                <div>
                                                    <h5 class="font-medium">${eq.name}</h5>
                                                    <p class="text-sm text-gray-600">
                                                        ${eq.type_name || eq.type} • 
                                                        Série: ${eq.serial_number || 'N/A'} • 
                                                        Patrimônio: ${eq.patrimony || 'N/A'}
                                                    </p>
                                                    <p class="text-sm font-medium text-red-600">
                                                        Valor: R$ ${(eq.value || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button 
                                                class="btn btn-sm btn-success"
                                                onclick="offboardingManager.resolvePendency('${employee.id}', '${eq.id}', 'returned')"
                                                title="Equipamento foi devolvido"
                                            >
                                                ✅ Resolver
                                            </button>
                                            <button 
                                                class="btn btn-sm btn-warning"
                                                onclick="offboardingManager.generateHRMessage('${employee.id}')"
                                                title="Gerar mensagem para desconto em rescisão"
                                            >
                                                💰 Desconto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 class="font-semibold text-blue-800 mb-2">Ações Disponíveis:</h5>
                        <ul class="list-disc list-inside space-y-1 text-sm text-blue-700">
                            <li><strong>Resolver:</strong> Use quando o equipamento for devolvido ou reposto</li>
                            <li><strong>Desconto:</strong> Gera mensagem para o RH processar desconto em rescisão</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Fechar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Resolve pendência de equipamento
     */
    async resolvePendency(employeeId, equipmentId, resolutionType) {
        try {
            const notes = prompt('Observações sobre a resolução (opcional):');
            if (notes === null) return; // Usuário cancelou

            const response = await fetch('/api/offboarding/resolve-pending', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employee_id: employeeId,
                    equipment_id: equipmentId,
                    resolution_type: resolutionType,
                    notes: notes
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao resolver pendência');
            }

            const result = await response.json();

            // Fechar modal atual
            document.querySelector('.modal-overlay').remove();

            // Notificar sucesso
            if (window.ToastManager) {
                ToastManager.success('Pendência resolvida com sucesso!');
            }

            // Recarregar lista de pendências
            this.showPendingEmployees();

        } catch (error) {
            console.error('Erro ao resolver pendência:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao resolver pendência: ' + error.message);
            }
        }
    }

    /**
     * Gera mensagem para RH
     */
    async generateHRMessage(employeeId) {
        try {
            const response = await fetch('/api/offboarding/generate-hr-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employee_id: employeeId
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao gerar mensagem');
            }

            const result = await response.json();
            this.showHRMessageModal(result);

        } catch (error) {
            console.error('Erro ao gerar mensagem para RH:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao gerar mensagem para RH: ' + error.message);
            }
        }
    }

    /**
     * Mostra modal com mensagem para RH
     */
    showHRMessageModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Mensagem para Gestão e Gente</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="mb-4">
                        <p class="text-sm text-gray-600 mb-3">
                            Mensagem gerada automaticamente para comunicar o desconto em rescisão:
                        </p>
                        
                        <div class="bg-gray-50 border rounded-lg p-4 mb-4">
                            <textarea 
                                id="hr-message" 
                                class="w-full h-64 p-3 border rounded resize-none font-mono text-sm"
                                readonly
                            >${data.message}</textarea>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div class="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                                <p class="text-sm text-blue-600">Colaborador</p>
                                <p class="font-semibold">${data.employee.name}</p>
                            </div>
                            <div class="bg-red-50 border border-red-200 rounded p-3 text-center">
                                <p class="text-sm text-red-600">Valor Total</p>
                                <p class="font-semibold text-lg">R$ ${data.total_value.toFixed(2)}</p>
                            </div>
                            <div class="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
                                <p class="text-sm text-yellow-600">Itens</p>
                                <p class="font-semibold">${data.equipment_count}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Fechar
                    </button>
                    <button class="btn btn-primary" onclick="offboardingManager.copyHRMessage()">
                        📋 Copiar Mensagem
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Copia mensagem para área de transferência
     */
    async copyHRMessage() {
        try {
            const textarea = document.getElementById('hr-message');
            await navigator.clipboard.writeText(textarea.value);
            
            if (window.ToastManager) {
                ToastManager.success('Mensagem copiada para a área de transferência!');
            }
        } catch (error) {
            console.error('Erro ao copiar mensagem:', error);
            if (window.ToastManager) {
                ToastManager.error('Erro ao copiar mensagem');
            }
        }
    }
}

// Inicializa o gerenciador de offboarding
const offboardingManager = new OffboardingManager();

// Exporta para uso global
window.offboardingManager = offboardingManager;

