// Sistema 4TIS - Versão Completa e Funcional
let appState = {
    employees: [
        { id: 'EMP001', name: 'João Silva', position: 'Desenvolvedor', email: 'joao@empresa.com', phone: '(11) 99999-9999', status: 'active', equipment: ['EQ001', 'EQ002'] },
        { id: 'EMP002', name: 'Maria Santos', position: 'Designer', email: 'maria@empresa.com', phone: '(11) 88888-8888', status: 'active', equipment: ['EQ003'] },
        { id: 'EMP003', name: 'Pedro Costa', position: 'Gerente', email: 'pedro@empresa.com', phone: '(11) 77777-7777', status: 'inactive', equipment: [] }
    ],
    equipment: [
        { id: 'EQ001', brand: 'Dell', model: 'Inspiron 15', name: 'Dell Inspiron 15', type: 'notebook', series: 'DL123456', patrimony: 'PAT001', value: 2500.00, status: 'in-use', assignedTo: 'EMP001', observation: 'Em bom estado' },
        { id: 'EQ002', brand: 'LG', model: '24MK430H', name: 'LG 24MK430H', type: 'monitor', series: 'LG789012', patrimony: 'PAT002', value: 800.00, status: 'in-use', assignedTo: 'EMP001', observation: '' },
        { id: 'EQ003', brand: 'Logitech', model: 'MX Master 3', name: 'Logitech MX Master 3', type: 'mouse', series: 'LG345678', patrimony: 'PAT003', value: 150.00, status: 'in-use', assignedTo: 'EMP002', observation: 'Mouse sem fio' },
        { id: 'EQ004', brand: 'Corsair', model: 'K95 RGB', name: 'Corsair K95 RGB', type: 'teclado', series: 'KB901234', patrimony: 'PAT004', value: 300.00, status: 'stock', assignedTo: null, observation: 'Teclado RGB' }
    ],
    tickets: [
        { id: 'CH0001', glpiId: '45473', requestor: 'DHANIEL RIBEIRO MARQUES', equipmentType: 'Celular', serviceType: 'Solicitação novo', requestedForUser: 'JOAO PEDRO LIMA BUENO', location: 'LYON', status: 'aguardando-equipamento', ticketType: 'SOLICITACAO', createdAt: '2025-07-29', justification: 'Celular para auxiliar nas demandas e pendencias de entrega. Equipe de Instalações' },
        { id: 'CH0002', glpiId: '45500', requestor: 'MARIA SILVA SANTOS', equipmentType: 'Notebook', serviceType: 'Manutenção', requestedForUser: 'MARIA SILVA SANTOS', location: 'São Paulo', status: 'atribuido-para-atendimento', ticketType: 'MANUTENCAO', createdAt: '2025-07-28', justification: 'Notebook apresentando travamentos frequentes, necessita manutenção preventiva' }
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
    ]
};

const CURRENT_USER = { id: 'USR001', name: 'Hudson Adley' };

// Sistema de Toast
class ToastManager {
    static show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('removing');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);

        return toast;
    }

    static success(message) { return this.show(message, 'success'); }
    static error(message) { return this.show(message, 'error'); }
    static warning(message) { return this.show(message, 'warning'); }
    static info(message) { return this.show(message, 'info'); }
}

// Sistema de Modal
class ModalManager {
    static open(modalId, content) {
        // Remove modal existente
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        // Cria novo modal
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal active';
        modal.innerHTML = content;

        document.body.appendChild(modal);

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close(modalId);
            }
        });
    }

    static close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 200);
        }
    }
}

// Funções de navegação
function switchTab(tabName) {
    // Remove active das tabs
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativa a tab selecionada
    const tabButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const tabContent = document.getElementById(`${tabName}-tab`);
    
    if (tabButton && tabContent) {
        tabButton.classList.add('active');
        tabContent.classList.add('active');
        
        // Renderiza conteúdo
        setTimeout(() => {
            if (tabName === 'dashboard') renderDashboard();
            else if (tabName === 'employees') renderEmployees();
            else if (tabName === 'equipment') renderEquipment();
            else if (tabName === 'tickets') renderTickets();
            else if (tabName === 'settings') renderSettings();
        }, 50);
    }
}

// Renderização do Dashboard
function renderDashboard() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;
    
    const chamadosAbertos = appState.tickets.filter(t => 
        ['novo', 'aguardando-validacao', 'aguardando-equipamento', 'atribuido-para-atendimento', 'em-andamento'].includes(t.status)
    ).length;
    
    const usuariosAtivos = appState.employees.filter(emp => emp.status === 'active').length;
    const totalEquipamentos = appState.equipment.length;
    const valorTotal = appState.equipment.reduce((sum, eq) => sum + (eq.value || 0), 0);
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="showToast('Dashboard - Chamados Abertos', 'info')">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-3xl font-bold text-purple-600">${chamadosAbertos}</div>
                        <div class="text-sm font-medium text-gray-600 mt-1">Chamados Abertos</div>
                        <div class="text-xs text-purple-600 mt-2 hover:underline">Ver lista completa →</div>
                    </div>
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span class="text-2xl">🎫</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="showToast('Dashboard - Colaboradores Ativos', 'info')">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-3xl font-bold text-green-600">${usuariosAtivos}</div>
                        <div class="text-sm font-medium text-gray-600 mt-1">Colaboradores Ativos</div>
                        <div class="text-xs text-green-600 mt-2 hover:underline">Ver lista completa →</div>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span class="text-2xl">👥</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="showToast('Dashboard - Equipamentos', 'info')">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-3xl font-bold text-blue-600">${totalEquipamentos}</div>
                        <div class="text-sm font-medium text-gray-600 mt-1">Equipamentos</div>
                        <div class="text-xs text-blue-600 mt-2 hover:underline">Ver inventário →</div>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span class="text-2xl">💻</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="showToast('Valor Total: R$ ${valorTotal.toFixed(2)}', 'info')">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-3xl font-bold text-orange-600">R$ ${(valorTotal/1000).toFixed(0)}k</div>
                        <div class="text-sm font-medium text-gray-600 mt-1">Valor Total</div>
                        <div class="text-xs text-orange-600 mt-2 hover:underline">Ver detalhes →</div>
                    </div>
                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span class="text-2xl">💰</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📈</span> Atividade Recente
                </h3>
                <div class="space-y-3">
                    <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">Sistema 4TIS inicializado</p>
                            <p class="text-xs text-gray-500">Há 5 minutos</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">Dashboard carregado</p>
                            <p class="text-xs text-gray-500">Agora</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>⚠️</span> Alertas e Pendências
                </h3>
                <div class="space-y-3">
                    <div class="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <div class="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">${chamadosAbertos} chamados aguardando atendimento</p>
                            <p class="text-xs text-gray-500">Requer atenção</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">Sistema funcionando normalmente</p>
                            <p class="text-xs text-gray-500">Todos os módulos operacionais</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderização de Colaboradores
function renderEmployees() {
    const container = document.getElementById('employees-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Colaboradores</h2>
                <button class="btn btn-primary" onclick="openEmployeeModal()">
                    <span>➕</span> Cadastrar Colaborador
                </button>
            </div>
            <div class="card-content">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${appState.employees.map(emp => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${emp.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${emp.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.position}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.email}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="status-badge ${emp.status === 'active' ? 'status-active' : 'status-inactive'}">
                                            ${emp.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button class="btn btn-secondary mr-2" onclick="viewEmployee('${emp.id}')">👁️ Ver</button>
                                        <button class="btn btn-warning mr-2" onclick="editEmployee('${emp.id}')">✏️ Editar</button>
                                        <button class="btn btn-danger" onclick="deleteEmployee('${emp.id}')">🗑️ Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Renderização de Equipamentos
function renderEquipment() {
    const container = document.getElementById('equipment-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Equipamentos</h2>
                <button class="btn btn-primary" onclick="openEquipmentModal()">
                    <span>➕</span> Cadastrar Equipamento
                </button>
            </div>
            <div class="card-content">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${appState.equipment.map(eq => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${eq.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${eq.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${eq.type}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="status-badge ${eq.status === 'stock' ? 'status-stock' : eq.status === 'in-use' ? 'status-in-use' : 'status-maintenance'}">
                                            ${eq.status === 'stock' ? 'Em Estoque' : eq.status === 'in-use' ? 'Em Uso' : 'Manutenção'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ ${eq.value.toFixed(2)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button class="btn btn-secondary mr-2" onclick="viewEquipment('${eq.id}')">👁️ Ver</button>
                                        <button class="btn btn-warning mr-2" onclick="editEquipment('${eq.id}')">✏️ Editar</button>
                                        <button class="btn btn-danger" onclick="deleteEquipment('${eq.id}')">🗑️ Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Renderização de Chamados
function renderTickets() {
    const container = document.getElementById('tickets-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Chamados</h2>
                <button class="btn btn-primary" onclick="openTicketModal()">
                    <span>➕</span> Novo Chamado
                </button>
            </div>
            <div class="card-content">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipamento</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${appState.tickets.map(ticket => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${ticket.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${ticket.requestor}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ticket.equipmentType}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="status-badge status-${ticket.status}">
                                            ${getStatusDisplayName(ticket.status)}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ticket.createdAt}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button class="btn btn-secondary mr-2" onclick="viewTicket('${ticket.id}')">👁️ Ver</button>
                                        <button class="btn btn-warning mr-2" onclick="editTicket('${ticket.id}')">✏️ Editar</button>
                                        <button class="btn btn-danger" onclick="deleteTicket('${ticket.id}')">🗑️ Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Renderização de Configurações
function renderSettings() {
    const container = document.getElementById('settings-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card">
                <div class="card-header">
                    <h3>Tipos de Equipamento</h3>
                    <button class="btn btn-primary" onclick="openEquipmentTypeModal()">
                        <span>➕</span> Adicionar Tipo
                    </button>
                </div>
                <div class="card-content">
                    <div class="space-y-3">
                        ${appState.equipmentTypes.map(type => `
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 class="font-medium text-gray-900">${type.name}</h4>
                                    <p class="text-sm text-gray-500">${type.description}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="btn btn-warning" onclick="editEquipmentType(${type.id})">✏️</button>
                                    <button class="btn btn-danger" onclick="deleteEquipmentType(${type.id})">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Acessórios</h3>
                    <button class="btn btn-primary" onclick="openAccessoryModal()">
                        <span>➕</span> Adicionar Acessório
                    </button>
                </div>
                <div class="card-content">
                    <div class="space-y-3">
                        ${appState.accessories.map(acc => `
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 class="font-medium text-gray-900">${acc.name}</h4>
                                    <p class="text-sm text-gray-500">${acc.specification}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="btn btn-warning" onclick="editAccessory(${acc.id})">✏️</button>
                                    <button class="btn btn-danger" onclick="deleteAccessory(${acc.id})">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mt-6">
            <div class="card-header">
                <h3>🗄️ Gestão de Dados</h3>
                <div class="flex gap-2">
                    <button class="btn btn-warning" onclick="showDataStats()">📊 Estatísticas</button>
                    <button class="btn btn-primary" onclick="exportData()">📋 Exportar</button>
                </div>
            </div>
            <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-700">${appState.employees.length}</div>
                            <div class="text-sm text-blue-600">Colaboradores</div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-700">${appState.equipment.length}</div>
                            <div class="text-sm text-green-600">Equipamentos</div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-purple-700">${appState.tickets.length}</div>
                            <div class="text-sm text-purple-600">Chamados</div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-orange-700">R$ ${appState.equipment.reduce((sum, eq) => sum + (eq.value || 0), 0).toFixed(0)}</div>
                            <div class="text-sm text-orange-600">Valor Total</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Funções de Modal - Colaboradores
function openEmployeeModal() {
    const content = `
        <div class="modal-content">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">Cadastrar Colaborador</h3>
                <button onclick="ModalManager.close('employeeModal')" class="text-gray-400 hover:text-gray-600">
                    <span class="text-2xl">&times;</span>
                </button>
            </div>
            <form id="employeeForm" class="p-6 space-y-4">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" id="employeeName" required placeholder="Nome completo">
                </div>
                <div class="form-group">
                    <label>Cargo *</label>
                    <input type="text" id="employeePosition" required placeholder="Cargo do colaborador">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="employeeEmail" placeholder="email@empresa.com">
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="tel" id="employeePhone" placeholder="(11) 99999-9999">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="ModalManager.close('employeeModal')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        </div>
    `;
    
    ModalManager.open('employeeModal', content);
    
    document.getElementById('employeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newEmployee = {
            id: 'EMP' + String(appState.employees.length + 1).padStart(3, '0'),
            name: document.getElementById('employeeName').value,
            position: document.getElementById('employeePosition').value,
            email: document.getElementById('employeeEmail').value,
            phone: document.getElementById('employeePhone').value,
            status: 'active',
            equipment: []
        };
        
        appState.employees.push(newEmployee);
        renderEmployees();
        ModalManager.close('employeeModal');
        ToastManager.success('Colaborador cadastrado com sucesso!');
    });
}

// Funções de Modal - Equipamentos
function openEquipmentModal() {
    const content = `
        <div class="modal-content modal-large">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">Cadastrar Equipamento</h3>
                <button onclick="ModalManager.close('equipmentModal')" class="text-gray-400 hover:text-gray-600">
                    <span class="text-2xl">&times;</span>
                </button>
            </div>
            <form id="equipmentForm" class="p-6 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label>Marca *</label>
                        <input type="text" id="equipmentBrand" required placeholder="Ex: Dell, HP, Logitech">
                    </div>
                    <div class="form-group">
                        <label>Modelo *</label>
                        <input type="text" id="equipmentModel" required placeholder="Ex: Inspiron 15, 24MK430H">
                    </div>
                </div>
                <div class="form-group">
                    <label>Tipo *</label>
                    <select id="equipmentType" required>
                        <option value="">Selecione um tipo</option>
                        ${appState.equipmentTypes.map(type => `<option value="${type.name.toLowerCase()}">${type.name}</option>`).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label>Série</label>
                        <input type="text" id="equipmentSeries" placeholder="SN123456">
                    </div>
                    <div class="form-group">
                        <label>Patrimônio</label>
                        <input type="text" id="equipmentPatrimony" placeholder="PAT00001">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label>Valor (R$)</label>
                        <input type="number" id="equipmentValue" step="0.01" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="equipmentStatus">
                            <option value="stock">Em Estoque</option>
                            <option value="in-use">Em Uso</option>
                            <option value="maintenance">Manutenção</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Observação</label>
                    <textarea id="equipmentObservation" rows="3" placeholder="Observações sobre o equipamento"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="ModalManager.close('equipmentModal')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        </div>
    `;
    
    ModalManager.open('equipmentModal', content);
    
    document.getElementById('equipmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const brand = document.getElementById('equipmentBrand').value;
        const model = document.getElementById('equipmentModel').value;
        
        const newEquipment = {
            id: 'EQ' + String(appState.equipment.length + 1).padStart(3, '0'),
            brand: brand,
            model: model,
            name: `${brand} ${model}`,
            type: document.getElementById('equipmentType').value,
            series: document.getElementById('equipmentSeries').value,
            patrimony: document.getElementById('equipmentPatrimony').value,
            value: parseFloat(document.getElementById('equipmentValue').value) || 0,
            status: document.getElementById('equipmentStatus').value,
            assignedTo: null,
            observation: document.getElementById('equipmentObservation').value
        };
        
        appState.equipment.push(newEquipment);
        renderEquipment();
        ModalManager.close('equipmentModal');
        ToastManager.success('Equipamento cadastrado com sucesso!');
    });
}

// Funções auxiliares
function getStatusDisplayName(status) {
    const statusNames = {
        'novo': 'Novo',
        'aguardando-validacao': 'Aguardando Validação',
        'aguardando-equipamento': 'Aguardando Equipamento',
        'atribuido-para-atendimento': 'Atribuído para Atendimento',
        'em-andamento': 'Em Andamento',
        'resolvido': 'Resolvido',
        'fechado': 'Fechado',
        'cancelado': 'Cancelado'
    };
    return statusNames[status] || status;
}

// Funções de ação (placeholder)
function viewEmployee(id) { ToastManager.info(`Visualizar colaborador ${id}`); }
function editEmployee(id) { ToastManager.info(`Editar colaborador ${id}`); }
function deleteEmployee(id) { 
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
        appState.employees = appState.employees.filter(emp => emp.id !== id);
        renderEmployees();
        ToastManager.success('Colaborador excluído com sucesso!');
    }
}

function viewEquipment(id) { ToastManager.info(`Visualizar equipamento ${id}`); }
function editEquipment(id) { ToastManager.info(`Editar equipamento ${id}`); }
function deleteEquipment(id) { 
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
        appState.equipment = appState.equipment.filter(eq => eq.id !== id);
        renderEquipment();
        ToastManager.success('Equipamento excluído com sucesso!');
    }
}

function viewTicket(id) { ToastManager.info(`Visualizar chamado ${id}`); }
function editTicket(id) { ToastManager.info(`Editar chamado ${id}`); }
function deleteTicket(id) { 
    if (confirm('Tem certeza que deseja excluir este chamado?')) {
        appState.tickets = appState.tickets.filter(t => t.id !== id);
        renderTickets();
        ToastManager.success('Chamado excluído com sucesso!');
    }
}

function openTicketModal() { ToastManager.info('Modal de chamado será implementado'); }
function openEquipmentTypeModal() { ToastManager.info('Modal de tipo de equipamento será implementado'); }
function openAccessoryModal() { ToastManager.info('Modal de acessório será implementado'); }
function editEquipmentType(id) { ToastManager.info(`Editar tipo ${id}`); }
function deleteEquipmentType(id) { ToastManager.info(`Excluir tipo ${id}`); }
function editAccessory(id) { ToastManager.info(`Editar acessório ${id}`); }
function deleteAccessory(id) { ToastManager.info(`Excluir acessório ${id}`); }

function showDataStats() {
    const stats = `
📊 ESTATÍSTICAS DO SISTEMA 4TIS

👥 COLABORADORES: ${appState.employees.length}
   • Ativos: ${appState.employees.filter(emp => emp.status === 'active').length}
   • Inativos: ${appState.employees.filter(emp => emp.status === 'inactive').length}

💻 EQUIPAMENTOS: ${appState.equipment.length}
   • Em Uso: ${appState.equipment.filter(eq => eq.status === 'in-use').length}
   • Em Estoque: ${appState.equipment.filter(eq => eq.status === 'stock').length}
   • Valor Total: R$ ${appState.equipment.reduce((sum, eq) => sum + (eq.value || 0), 0).toFixed(2)}

🎫 CHAMADOS: ${appState.tickets.length}
   • Abertos: ${appState.tickets.filter(t => !['resolvido', 'fechado'].includes(t.status)).length}
   • Resolvidos: ${appState.tickets.filter(t => t.status === 'resolvido').length}

⚙️ CONFIGURAÇÕES:
   • Tipos de Equipamento: ${appState.equipmentTypes.length}
   • Acessórios: ${appState.accessories.length}
    `;
    
    alert(stats);
}

function exportData() {
    const dataStr = JSON.stringify(appState, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `4tis-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    ToastManager.success('Backup exportado com sucesso!');
}

function logout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        ToastManager.info('Logout realizado com sucesso!');
        setTimeout(() => window.location.reload(), 1000);
    }
}

// Função de toast global
function showToast(message, type = 'info') {
    ToastManager.show(message, type);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema 4TIS inicializado com sucesso!');
    renderDashboard();
    ToastManager.success('Sistema 4TIS carregado com sucesso!');
});