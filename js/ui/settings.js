


// Settings UI Module
class SettingsUI {
    static render() {
        const container = document.getElementById('settings-content');
        if (!container) return;

        container.innerHTML = `
            <!-- Gestão de Dados -->
            <div class="card mb-6">
                <div class="card-header">
                    <h3>🗄️ Gestão de Dados</h3>
                    <div class="flex gap-2">
                        <button class="btn btn-warning" onclick="SettingsUI.showDataStats()">
                            <span class="icon">📊</span> Estatísticas
                        </button>
                        <button class="btn btn-primary" onclick="ReportManager.showReportModal()">
                            <span class="icon">📋</span> Relatórios
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <!-- Cards de estatísticas -->
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-700" id="stats-employees">0</div>
                                <div class="text-sm text-blue-600">Colaboradores</div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-green-700" id="stats-equipment">0</div>
                                <div class="text-sm text-green-600">Equipamentos</div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-700" id="stats-tickets">0</div>
                                <div class="text-sm text-purple-600">Chamados</div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-orange-700" id="stats-value">R$ 0</div>
                                <div class="text-sm text-orange-600">Valor Total</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-t pt-6">
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Operações de Dados</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Backup -->
                            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h5 class="font-medium text-blue-900 mb-2">📦 Backup</h5>
                                <p class="text-sm text-blue-700 mb-3">Exportar todos os dados para um arquivo JSON</p>
                                <button class="btn btn-primary w-full" onclick="SettingsUI.exportData()">
                                    <span class="icon">⬇️</span> Exportar Backup
                                </button>
                            </div>
                            
                            <!-- Restore -->
                            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h5 class="font-medium text-green-900 mb-2">📥 Restaurar</h5>
                                <p class="text-sm text-green-700 mb-3">Importar dados de um arquivo de backup</p>
                                <input type="file" id="importFile" accept=".json" onchange="SettingsUI.importData(event)" class="hidden">
                                <button class="btn btn-warning w-full" onclick="document.getElementById('importFile').click()">
                                    <span class="icon">⬆️</span> Importar Backup
                                </button>
                            </div>
                            
                            <!-- Reset -->
                            <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                                <h5 class="font-medium text-red-900 mb-2">🗑️ Limpar Tudo</h5>
                                <p class="text-sm text-red-700 mb-3">⚠️ APAGAR TODOS OS DADOS - deixa o sistema completamente vazio</p>
                                <button class="btn btn-danger w-full" onclick="SettingsUI.resetData()">
                                    <span class="icon">🚨</span> APAGAR TODOS OS DADOS
                                </button>
                            </div>
                        </div>
                        
                        <div class="mt-4 p-3 bg-gray-100 rounded-lg">
                            <p class="text-sm text-gray-600">
                                <strong>📍 Última atualização:</strong> <span id="lastUpdated">-</span><br>
                                <strong>💾 Dados salvos automaticamente no navegador</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Tipos de Equipamento -->
                <div class="card">
                    <div class="card-header">
                        <h3>Tipos de Equipamento</h3>
                        <button class="btn btn-primary" onclick="SettingsUI.openEquipmentTypeModal()">
                            <span class="icon">➕</span> Adicionar Tipo
                        </button>
                    </div>
                    <div class="card-content">
                        <div class="mb-4">
                            <div class="relative">
                                <input type="text" id="typeSearch" placeholder="Buscar tipo..." 
                                       class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <span class="text-gray-400">🔍</span>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-3" id="equipmentTypesList">
                            <!-- Lista de tipos será inserida aqui -->
                        </div>
                    </div>
                </div>

                <!-- Acessórios -->
                <div class="card">
                    <div class="card-header">
                        <h3>Acessórios</h3>
                        <button class="btn btn-primary" onclick="SettingsUI.openAccessoryModal()">
                            <span class="icon">➕</span> Adicionar Acessório
                        </button>
                    </div>
                    <div class="card-content">
                        <div class="mb-4">
                            <div class="relative">
                                <input type="text" id="accessorySearch" placeholder="Buscar acessório..." 
                                       class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <span class="text-gray-400">🔍</span>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-3" id="accessoriesList">
                            <!-- Lista de acessórios será inserida aqui -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateDataStats();
        this.renderEquipmentTypes();
        this.renderAccessories();
        this.setupEventListeners();
    }

    static setupEventListeners() {
        const typeSearch = document.getElementById('typeSearch');
        const accessorySearch = document.getElementById('accessorySearch');

        if (typeSearch) {
            typeSearch.addEventListener('input', Utils.debounce(() => {
                this.renderEquipmentTypes();
            }, CONFIG.DEBOUNCE_DELAY));
        }

        if (accessorySearch) {
            accessorySearch.addEventListener('input', Utils.debounce(() => {
                this.renderAccessories();
            }, CONFIG.DEBOUNCE_DELAY));
        }
    }

    static updateDataStats() {
        const appState = window.appState;
        if (!appState) return;

        const statsEmployees = document.getElementById('stats-employees');
        const statsEquipment = document.getElementById('stats-equipment');
        const statsTickets = document.getElementById('stats-tickets');
        const statsValue = document.getElementById('stats-value');
        const lastUpdated = document.getElementById('lastUpdated');
        
        if (statsEmployees) {
            statsEmployees.textContent = appState.employees.length;
        }
        
        if (statsEquipment) {
            statsEquipment.textContent = appState.equipment.length;
        }
        
        if (statsTickets) {
            statsTickets.textContent = appState.tickets.length;
        }
        
        if (statsValue) {
            const totalValue = appState.equipment.reduce((sum, eq) => sum + (eq.value || 0), 0);
            statsValue.textContent = Utils.formatCurrency(totalValue);
        }
        
        if (lastUpdated && appState.lastUpdated) {
            const date = new Date(appState.lastUpdated);
            lastUpdated.textContent = date.toLocaleString('pt-BR');
        }
    }

    static renderEquipmentTypes() {
        const container = document.getElementById('equipmentTypesList');
        if (!container) return;
        
        const searchTerm = document.getElementById('typeSearch')?.value?.toLowerCase() || '';
        const appState = window.appState;
        
        if (!appState || !appState.equipmentTypes) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Nenhum tipo de equipamento cadastrado</p>';
            return;
        }
        
        const filteredTypes = appState.equipmentTypes.filter(type => 
            type.name.toLowerCase().includes(searchTerm)
        );
        
        if (filteredTypes.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Nenhum tipo encontrado</p>';
            return;
        }
        
        container.innerHTML = filteredTypes.map(type => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                    <h4 class="font-medium text-gray-900">${type.name}</h4>
                    <p class="text-sm text-gray-500">${type.description}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="SettingsUI.editEquipmentType(${type.id})" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</button>
                    <button onclick="SettingsUI.deleteEquipmentType(${type.id})" class="text-red-600 hover:text-red-900 text-sm">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    static renderAccessories() {
        const container = document.getElementById('accessoriesList');
        if (!container) return;
        
        const searchTerm = document.getElementById('accessorySearch')?.value?.toLowerCase() || '';
        const appState = window.appState;
        
        if (!appState || !appState.accessories) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Nenhum acessório cadastrado</p>';
            return;
        }
        
        const filteredAccessories = appState.accessories.filter(accessory => 
            accessory.name.toLowerCase().includes(searchTerm)
        );
        
        if (filteredAccessories.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Nenhum acessório encontrado</p>';
            return;
        }
        
        container.innerHTML = filteredAccessories.map(accessory => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                    <h4 class="font-medium text-gray-900">${accessory.name}</h4>
                    <p class="text-sm text-gray-500">${accessory.specification}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="SettingsUI.editAccessory(${accessory.id})" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</button>
                    <button onclick="SettingsUI.deleteAccessory(${accessory.id})" class="text-red-600 hover:text-red-900 text-sm">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    static showDataStats() {
        const appState = window.appState;
        if (!appState) return;

        const activeEmployees = appState.employees.filter(emp => emp.status === 'active').length;
        const equipmentInUse = appState.equipment.filter(eq => eq.status === 'in-use').length;
        const equipmentInStock = appState.equipment.filter(eq => eq.status === 'stock').length;
        const newTickets = appState.tickets.filter(t => t.status === 'novo').length;
        const resolvedTickets = appState.tickets.filter(t => t.status === 'resolvido').length;
        
        const stats = `
📊 ESTATÍSTICAS DETALHADAS - 4TIS SYSTEM

👥 COLABORADORES:
   • Total: ${appState.employees.length}
   • Ativos: ${activeEmployees}
   • Inativos: ${appState.employees.length - activeEmployees}

💻 EQUIPAMENTOS:
   • Total: ${appState.equipment.length}
   • Em Uso: ${equipmentInUse}
   • Em Estoque: ${equipmentInStock}
   • Em Manutenção: ${appState.equipment.filter(eq => eq.status === 'maintenance').length}
   • Valor Total: ${Utils.formatCurrency(appState.equipment.reduce((sum, eq) => sum + (eq.value || 0), 0))}

🎫 CHAMADOS:
   • Total: ${appState.tickets.length}
   • Novos: ${newTickets}
   • Em Progresso: ${appState.tickets.filter(t => t.status === 'em-progresso').length}
   • Resolvidos: ${resolvedTickets}
   • Fechados: ${appState.tickets.filter(t => t.status === 'fechado').length}

⚙️ CONFIGURAÇÕES:
   • Tipos de Equipamento: ${appState.equipmentTypes.length}
   • Acessórios: ${appState.accessories.length}

💾 SISTEMA:
   • Versão: ${appState.version || '1.0.0'}
   • Última Atualização: ${appState.lastUpdated ? new Date(appState.lastUpdated).toLocaleString('pt-BR') : 'N/A'}
        `;
        
        alert(stats);
    }

    static exportData() {
        const storageManager = window.storageManager;
        if (storageManager) {
            storageManager.export();
        } else {
            ToastManager.error('Erro ao exportar dados');
        }
    }

    static importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const storageManager = window.storageManager;
        if (!storageManager) {
            ToastManager.error('Erro ao importar dados');
            return;
        }

        storageManager.import(file).then(importedData => {
            window.appState = importedData;
            
            // Renderizar todas as abas
            if (window.EmployeesUI) EmployeesUI.renderTable();
            if (window.EquipmentUI) EquipmentUI.renderTable();
            if (window.TicketsUI) TicketsUI.renderTable();
            this.updateDataStats();
            this.renderEquipmentTypes();
            this.renderAccessories();
            
            ToastManager.success('Dados importados com sucesso!');
        }).catch(error => {
            console.error('Erro na importação:', error);
            ToastManager.error('Erro ao importar dados');
        });
    }

    static resetData() {
        if (!confirm('⚠️ ATENÇÃO!\n\nEsta ação irá APAGAR TODOS OS DADOS do sistema permanentemente.\n\nTem certeza que deseja continuar?')) {
            return;
        }

        const storageManager = window.storageManager;
        if (storageManager && storageManager.reset()) {
            window.appState = {
                employees: [],
                equipment: [],
                tickets: [],
                equipmentTypes: [],
                accessories: [],
                version: CONFIG.VERSION,
                lastUpdated: new Date().toISOString()
            };
            
            // Renderizar todas as abas vazias
            if (window.EmployeesUI) EmployeesUI.renderTable();
            if (window.EquipmentUI) EquipmentUI.renderTable();
            if (window.TicketsUI) TicketsUI.renderTable();
            this.updateDataStats();
            this.renderEquipmentTypes();
            this.renderAccessories();
            
            ToastManager.success('Todos os dados foram apagados!');
        }
    }

    static openEquipmentTypeModal() {
        ModalsUI.openEquipmentTypeModal();
    }

    static openAccessoryModal() {
        ModalsUI.openAccessoryModal();
    }

    static editEquipmentType(id) {
        const type = window.appState?.equipmentTypes?.find(t => t.id === id);
        if (type) {
            ModalsUI.openEquipmentTypeModal(type);
        }
    }

    static editAccessory(id) {
        const accessory = window.appState?.accessories?.find(a => a.id === id);
        if (accessory) {
            ModalsUI.openAccessoryModal(accessory);
        }
    }

    static deleteEquipmentType(id) {
        if (confirm('Tem certeza que deseja excluir este tipo de equipamento?')) {
            const appState = window.appState;
            if (appState && appState.equipmentTypes) {
                appState.equipmentTypes = appState.equipmentTypes.filter(t => t.id !== id);
                window.storageManager?.save(appState);
                this.renderEquipmentTypes();
                ToastManager.success('Tipo de equipamento excluído com sucesso!');
            }
        }
    }

    static deleteAccessory(id) {
        if (confirm('Tem certeza que deseja excluir este acessório?')) {
            const appState = window.appState;
            if (appState && appState.accessories) {
                appState.accessories = appState.accessories.filter(a => a.id !== id);
                window.storageManager?.save(appState);
                this.renderAccessories();
                ToastManager.success('Acessório excluído com sucesso!');
            }
        }
    }
}

// Exportar para uso global
window.SettingsUI = SettingsUI;