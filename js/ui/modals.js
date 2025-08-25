// Modals UI Module
class ModalsUI {
    static openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            // Limpar formulários
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    static openViewModal(type, config) {
        // Remover modal existente se houver
        const existingModal = document.getElementById('viewModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal active" id="viewModal">
                <div class="modal-content modal-large max-w-2xl w-full mx-4">
                    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">${config.title}</h3>
                        <button onclick="ModalsUI.closeViewModal()" class="text-gray-400 hover:text-gray-600">
                            <span class="text-2xl">&times;</span>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="space-y-4">
                            ${config.data.map(item => `
                                <div class="flex ${item.multiline ? 'flex-col' : 'justify-between items-center'} py-2 border-b border-gray-100">
                                    <span class="font-medium text-gray-700 ${item.multiline ? 'mb-2' : ''}">${item.label}:</span>
                                    <span class="text-gray-900 ${item.badge ? `status-badge ${item.badgeClass}` : ''} ${item.capitalize ? 'capitalize' : ''} ${item.multiline ? 'whitespace-pre-line' : ''}">
                                        ${item.value}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                        ${config.actions ? `
                            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                                ${config.actions.map(action => `
                                    <button onclick="${action.action.toString().replace('function', '').replace('()', '()')}" class="btn ${action.class}">
                                        ${action.label}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    static closeViewModal() {
        const modal = document.getElementById('viewModal');
        if (modal) {
            modal.remove();
        }
    }

    static openEmployeeModal(employee = null) {
        const isEdit = !!employee;
        const modalId = 'employeeModal';
        
        // Remover modal existente se houver
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal active" id="${modalId}">
                <div class="modal-content max-w-md w-full mx-4">
                    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">
                            ${isEdit ? (employee.isPreCreated ? '⚠️ Finalizar Cadastro - ' + employee.name : 'Editar Colaborador') : 'Cadastrar Colaborador'}
                        </h3>
                        <button onclick="ModalsUI.closeModal('${modalId}')" class="text-gray-400 hover:text-gray-600">
                            <span class="text-2xl">&times;</span>
                        </button>
                    </div>
                    <form id="employeeForm" class="p-6 space-y-4">
                        ${employee?.isPreCreated ? `
                            <div class="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div class="flex items-start">
                                    <span class="text-orange-500 mr-2">⚠️</span>
                                    <div>
                                        <h4 class="text-sm font-medium text-orange-800">Finalizar Cadastro</h4>
                                        <p class="text-sm text-orange-700 mt-1">
                                            Complete os dados obrigatórios para finalizar o cadastro deste colaborador.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                            <input type="text" id="employeeName" required 
                                   value="${employee?.name || ''}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Nome completo">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Cargo *</label>
                            <input type="text" id="employeePosition" required 
                                   value="${employee?.position && employee.position !== 'A definir' ? employee.position : ''}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Cargo do colaborador">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email ${employee?.isPreCreated ? '*' : ''}</label>
                            <input type="email" id="employeeEmail" ${employee?.isPreCreated ? 'required' : ''}
                                   value="${employee?.email || ''}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="email@empresa.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                            <input type="tel" id="employeePhone" 
                                   value="${employee?.phone || ''}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="(11) 99999-9999">
                        </div>
                        ${isEdit ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select id="employeeStatus" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="active" ${employee.status === 'active' ? 'selected' : ''}>Ativo</option>
                                    <option value="inactive" ${employee.status === 'inactive' ? 'selected' : ''}>Inativo</option>
                                </select>
                            </div>
                        ` : ''}
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="ModalsUI.closeModal('${modalId}')">Cancelar</button>
                            <button type="submit" class="btn btn-primary">
                                ${isEdit ? (employee.isPreCreated ? 'FINALIZAR CADASTRO' : 'Salvar Alterações') : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Configurar event listener
        const form = document.getElementById('employeeForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const data = {
                    name: document.getElementById('employeeName').value.trim(),
                    position: document.getElementById('employeePosition').value.trim(),
                    email: document.getElementById('employeeEmail').value.trim(),
                    phone: document.getElementById('employeePhone').value.trim()
                };

                if (isEdit) {
                    data.status = document.getElementById('employeeStatus').value;
                    
                    // Validar dados obrigatórios para colaboradores pré-criados
                    if (employee.isPreCreated && (!data.name || !data.position || !data.email)) {
                        ToastManager.warning('⚠️ Dados obrigatórios faltando!\n\nPreencha: Nome, Cargo e Email para finalizar o cadastro.');
                        return;
                    }
                    
                    if (EmployeeManager.update(employee.id, data)) {
                        this.closeModal(modalId);
                        if (window.EmployeesUI) EmployeesUI.renderTable();
                        if (employee.isPreCreated) {
                            ToastManager.success(`✅ Cadastro de ${data.name} FINALIZADO com sucesso!\n\nTodos os dados obrigatórios foram preenchidos.`, 6000);
                        } else {
                            ToastManager.success('Colaborador atualizado com sucesso!');
                        }
                    }
                } else {
                    if (EmployeeManager.create(data)) {
                        this.closeModal(modalId);
                        if (window.EmployeesUI) EmployeesUI.renderTable();
                    }
                }
            });
        }
    }

    static openEquipmentModal(equipment = null) {
        const isEdit = !!equipment;
        const modalId = 'equipmentModal';
        
        // Remover modal existente se houver
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal active" id="${modalId}">
                <div class="modal-content modal-large max-w-2xl w-full mx-4">
                    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">${isEdit ? 'Editar Equipamento' : 'Cadastrar Equipamento'}</h3>
                        <button onclick="ModalsUI.closeModal('${modalId}')" class="text-gray-400 hover:text-gray-600">
                            <span class="text-2xl">&times;</span>
                        </button>
                    </div>
                    <form id="equipmentForm" class="p-6 space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                                <input type="text" id="equipmentBrand" required 
                                       value="${equipment?.brand || ''}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       placeholder="Ex: Dell, HP, Logitech">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                                <input type="text" id="equipmentModel" required 
                                       value="${equipment?.model || ''}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       placeholder="Ex: Inspiron 15, 24MK430H">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                            <select id="equipmentType" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Selecione um tipo</option>
                                <option value="notebook" ${equipment?.type === 'notebook' ? 'selected' : ''}>Notebook</option>
                                <option value="monitor" ${equipment?.type === 'monitor' ? 'selected' : ''}>Monitor</option>
                                <option value="mouse" ${equipment?.type === 'mouse' ? 'selected' : ''}>Mouse</option>
                                <option value="teclado" ${equipment?.type === 'teclado' ? 'selected' : ''}>Teclado</option>
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Série</label>
                                <input type="text" id="equipmentSeries" 
                                       value="${equipment?.series || ''}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       placeholder="SN123456">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Patrimônio</label>
                                <input type="text" id="equipmentPatrimony" 
                                       value="${equipment?.patrimony || ''}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       placeholder="PAT00001">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                                <input type="number" id="equipmentValue" step="0.01" 
                                       value="${equipment?.value || ''}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       placeholder="0.00">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select id="equipmentStatus" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="stock" ${equipment?.status === 'stock' ? 'selected' : ''}>Em Estoque</option>
                                    <option value="in-use" ${equipment?.status === 'in-use' ? 'selected' : ''}>Em Uso</option>
                                    <option value="maintenance" ${equipment?.status === 'maintenance' ? 'selected' : ''}>Manutenção</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Observação</label>
                            <textarea id="equipmentObservation" rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Observações sobre o equipamento">${equipment?.observation || ''}</textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="ModalsUI.closeModal('${modalId}')">Cancelar</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Alterações' : 'Salvar'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Configurar event listener
        const form = document.getElementById('equipmentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const brand = document.getElementById('equipmentBrand').value.trim();
                const model = document.getElementById('equipmentModel').value.trim();
                
                const data = {
                    brand: brand,
                    model: model,
                    name: `${brand} ${model}`,
                    type: document.getElementById('equipmentType').value,
                    series: document.getElementById('equipmentSeries').value.trim(),
                    patrimony: document.getElementById('equipmentPatrimony').value.trim(),
                    value: parseFloat(document.getElementById('equipmentValue').value) || 0,
                    status: document.getElementById('equipmentStatus').value,
                    observation: document.getElementById('equipmentObservation').value.trim()
                };

                if (isEdit) {
                    if (EquipmentManager.update(equipment.id, data)) {
                        this.closeModal(modalId);
                        if (window.EquipmentUI) EquipmentUI.renderTable();
                        ToastManager.success('Equipamento atualizado com sucesso!');
                    }
                } else {
                    if (EquipmentManager.create(data)) {
                        this.closeModal(modalId);
                        if (window.EquipmentUI) EquipmentUI.renderTable();
                    }
                }
            });
        }
    }

    static openEquipmentTypeModal(type = null) {
        const isEdit = !!type;
        const modalId = 'equipmentTypeModal';
        
        // Remover modal existente se houver
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal active" id="${modalId}">
                <div class="modal-content max-w-md w-full mx-4">
                    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">${isEdit ? 'Editar Tipo de Equipamento' : 'Adicionar Tipo de Equipamento'}</h3>
                        <button onclick="ModalsUI.closeModal('${modalId}')" class="text-gray-400 hover:text-gray-600">
                            <span class="text-2xl">&times;</span>
                        </button>
                    </div>
                    <form id="equipmentTypeForm" class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Tipo *</label>
                            <input type="text" id="equipmentTypeName" required 
                                   value="${type?.name || ''}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Ex: Notebook">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                            <textarea id="equipmentTypeDescription" rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Descrição do tipo de equipamento">${type?.description || ''}</textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="ModalsUI.closeModal('${modalId}')">Cancelar</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Alterações' : 'Adicionar'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Configurar event listener
        const form = document.getElementById('equipmentTypeForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const data = {
                    name: document.getElementById('equipmentTypeName').value.trim(),
                    description: document.getElementById('equipmentTypeDescription').value.trim()
                };

                const appState = window.appState;
                if (!appState) return;

                if (isEdit) {
                    const typeIndex = appState.equipmentTypes.findIndex(t => t.id === type.id);
                    if (typeIndex !== -1) {
                        appState.equipmentTypes[typeIndex] = { ...type, ...data };
                        window.storageManager?.save(appState);
                        this.closeModal(modalId);
                        if (window.SettingsUI) SettingsUI.renderEquipmentTypes();
                        ToastManager.success('Tipo de equipamento atualizado com sucesso!');
                    }
                } else {
                    const newType = {
                        id: Math.max(0, ...appState.equipmentTypes.map(t => t.id)) + 1,
                        ...data
                    };
                    appState.equipmentTypes.push(newType);
                    window.storageManager?.save(appState);
                    this.closeModal(modalId);
                    if (window.SettingsUI) SettingsUI.renderEquipmentTypes();
                    ToastManager.success('Tipo de equipamento adicionado com sucesso!');
                }
            });
        }
    }

    static openAccessoryModal(accessory = null) {
        const isEdit = !!accessory;
        const modalId = 'accessoryModal';
        
        // Remover modal existente se houver
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal active" id="${modalId}">
                <div class="modal-content max-w-md w-full mx-4">
                    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">${isEdit ? 'Editar Acessório' : 'Adicionar Acessório'}</h3>
                        <button onclick="ModalsUI.closeModal('${modalId}')" class="text-gray-400 hover:text-gray-600">
                            <span class="text-2xl">&times;</span>
                        </button>
                    </div>
                    <form id="accessoryForm" class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Acessório *</label>
                            <input type="text" id="accessoryName" required 
                                   value="${accessory?.name || ''}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Ex: Mouse">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Especificação</label>
                            <textarea id="accessorySpecification" rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Especificação do acessório">${accessory?.specification || ''}</textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="ModalsUI.closeModal('${modalId}')">Cancelar</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Alterações' : 'Adicionar'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Configurar event listener
        const form = document.getElementById('accessoryForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const data = {
                    name: document.getElementById('accessoryName').value.trim(),
                    specification: document.getElementById('accessorySpecification').value.trim()
                };

                const appState = window.appState;
                if (!appState) return;

                if (isEdit) {
                    const accessoryIndex = appState.accessories.findIndex(a => a.id === accessory.id);
                    if (accessoryIndex !== -1) {
                        appState.accessories[accessoryIndex] = { ...accessory, ...data };
                        window.storageManager?.save(appState);
                        this.closeModal(modalId);
                        if (window.SettingsUI) SettingsUI.renderAccessories();
                        ToastManager.success('Acessório atualizado com sucesso!');
                    }
                } else {
                    const newAccessory = {
                        id: Math.max(0, ...appState.accessories.map(a => a.id)) + 1,
                        ...data
                    };
                    appState.accessories.push(newAccessory);
                    window.storageManager?.save(appState);
                    this.closeModal(modalId);
                    if (window.SettingsUI) SettingsUI.renderAccessories();
                    ToastManager.success('Acessório adicionado com sucesso!');
                }
            });
        }
    }

    static openGLPIImportModal() {
        ToastManager.info('Modal de importação GLPI será implementado em breve');
    }

    static openInternalTicketModal() {
        ToastManager.info('Modal de chamado interno será implementado em breve');
    }

    static openTicketModal(ticket = null) {
        ToastManager.info('Modal de edição de chamado será implementado em breve');
    }
}

// Exportar para uso global
window.ModalsUI = ModalsUI;