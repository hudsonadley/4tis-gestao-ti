// Equipment UI Module
class EquipmentUI {
    static currentPage = 1;
    static itemsPerPage = 10;
    static filters = { search: '', type: '', status: '' };

    static viewReturnHistory(id) {
        const appState = window.appState || {};
        const equipment = appState.equipment?.find(eq => eq.id === id);
        
        if (!equipment) {
            ToastManager.error('Equipamento não encontrado');
            return;
        }

        const returnHistory = equipment.returnHistory || [];
        let historyHTML = '';

        if (returnHistory.length === 0) {
            historyHTML = '<p class="text-gray-500 italic">Nenhuma devolução registrada ainda.</p>';
        } else {
            historyHTML = returnHistory.map(history => `
                <div class="border-l-4 border-blue-500 pl-4 mb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold">${history.type === 'devolvido' ? '✅ Devolvido' : '❌ Não Devolvido'}</p>
                            <p>Por: ${history.employeeName}</p>
                        </div>
                        <div class="text-sm text-gray-500">
                            ${new Date(history.date).toLocaleString('pt-BR')}
                        </div>
                    </div>
                    <p class="mt-2 text-gray-600">${history.reason || 'Nenhuma observação'}</p>
                </div>
            `).join('');
        }

        const modalHTML = `
            <div class="modal active" id="returnHistoryModal">
                <div class="modal-content max-w-lg w-full mx-4">
                    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">Histórico de Devoluções - ${equipment.name}</h3>
                        <button onclick="EquipmentUI.closeModal('returnHistoryModal')" class="text-gray-400 hover:text-gray-600">
                            <span class="text-2xl">&times;</span>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="space-y-4">
                            ${historyHTML}
                        </div>
                        <div class="mt-6 flex justify-end">
                            <button class="btn btn-secondary" onclick="EquipmentUI.closeModal('returnHistoryModal')">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    static openBindModal(equipmentId) {
        const appState = window.appState || {};
        const equipment = appState.equipment?.find(eq => eq.id === equipmentId);
        
        if (!equipment) {
            ToastManager.error('Equipamento não encontrado');
            return;
        }

        // Filtrar apenas colaboradores ativos
        const activeEmployees = appState.employees?.filter(emp => emp.status === 'active') || [];
        const availablePeripherals = appState.peripherals?.filter(p => p.quantity > this.getPeripheralInUseCount(p.id)) || [];

        const modalHTML = `
            <div class="modal active" id="bindModal">
                <div class="modal-content max-w-lg w-full mx-4">
                    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">Vincular ${equipment.name}</h3>
                        <button onclick="EquipmentUI.closeModal('bindModal')" class="text-gray-400 hover:text-gray-600">
                            <span class="text-2xl">&times;</span>
                        </button>
                    </div>
                    <div class="p-6">
                        <form id="bindForm" class="space-y-4">
                            <div class="form-group">
                                <label>Colaborador:</label>
                                <select id="employeeSelect" class="w-full" required>
                                    <option value="">Selecione um colaborador</option>
                                    ${activeEmployees.map(emp => 
                                        `<option value="${emp.id}">${emp.name} (${emp.position})</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Periféricos Disponíveis:</label>
                                <div class="space-y-2 max-h-60 overflow-y-auto">
                                    ${availablePeripherals.map(p => {
                                        const available = p.quantity - this.getPeripheralInUseCount(p.id);
                                        return `
                                            <div class="flex items-center justify-between p-2 border rounded">
                                                <div>
                                                    <input type="checkbox" id="peripheral_${p.id}" 
                                                           data-peripheral-id="${p.id}" class="mr-2">
                                                    <label for="peripheral_${p.id}">
                                                        ${p.name} (${available} disponíveis)
                                                    </label>
                                                </div>
                                                <div class="text-sm text-gray-600">R$ ${p.value || 0}</div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            <div class="mt-6 flex justify-end space-x-3">
                                <button type="button" class="btn btn-secondary" onclick="EquipmentUI.closeModal('bindModal')">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    Vincular
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('bindForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBind(equipmentId);
        });
    }

    static getPeripheralInUseCount(peripheralId) {
        const appState = window.appState || {};
        return appState.equipment?.reduce((count, eq) => {
            return count + (eq.peripherals?.filter(p => p.id === peripheralId).length || 0);
        }, 0) || 0;
    }

    static handleBind(equipmentId) {
        const appState = window.appState || {};
        const employeeId = document.getElementById('employeeSelect').value;
        
        if (!employeeId) {
            ToastManager.error('Selecione um colaborador');
            return;
        }

        // Coletar periféricos selecionados
        const selectedPeripherals = [];
        const peripheralCheckboxes = document.querySelectorAll('[data-peripheral-id]');
        peripheralCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const peripheralId = checkbox.dataset.peripheralId;
                const peripheral = appState.peripherals.find(p => p.id === peripheralId);
                if (peripheral) {
                    selectedPeripherals.push({
                        id: peripheralId,
                        name: peripheral.name,
                        value: peripheral.value
                    });
                }
            }
        });

        // Atualizar equipamento
        const equipmentIndex = appState.equipment.findIndex(eq => eq.id === equipmentId);
        if (equipmentIndex !== -1) {
            appState.equipment[equipmentIndex].assignedTo = employeeId;
            appState.equipment[equipmentIndex].status = 'in-use';
            appState.equipment[equipmentIndex].peripherals = selectedPeripherals;
        }

        // Salvar alterações
        const storageManager = new StorageManager();
        if (storageManager.save(appState)) {
            window.appState = appState;
            this.closeModal('bindModal');
            this.renderTable();
            ToastManager.success('Equipamento vinculado com sucesso!');
        }
    }

    // ... (resto do código permanece igual)
}
