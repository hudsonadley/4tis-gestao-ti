// Inicialização simples do sistema 4TIS
let appState = {
    employees: [
        { id: 'EMP001', name: 'João Silva', position: 'Desenvolvedor', email: 'joao@empresa.com', phone: '(11) 99999-9999', status: 'active', equipment: ['EQ001', 'EQ002'] },
        { id: 'EMP002', name: 'Maria Santos', position: 'Designer', email: 'maria@empresa.com', phone: '(11) 88888-8888', status: 'active', equipment: ['EQ003'] }
    ],
    equipment: [
        { id: 'EQ001', brand: 'Dell', model: 'Inspiron 15', name: 'Dell Inspiron 15', type: 'notebook', series: 'DL123456', patrimony: 'PAT001', value: 2500.00, status: 'in-use', assignedTo: 'EMP001' },
        { id: 'EQ002', brand: 'LG', model: '24MK430H', name: 'LG 24MK430H', type: 'monitor', series: 'LG789012', patrimony: 'PAT002', value: 800.00, status: 'in-use', assignedTo: 'EMP001' }
    ],
    tickets: [
        { id: 'CH0001', glpiId: '45473', requestor: 'DHANIEL RIBEIRO MARQUES', equipmentType: 'Celular', serviceType: 'Solicitação novo', requestedForUser: 'JOAO PEDRO LIMA BUENO', location: 'LYON', status: 'aguardando-equipamento', ticketType: 'SOLICITACAO', createdAt: '2025-07-29' }
    ],
    equipmentTypes: [
        { id: 1, name: 'Notebook', description: 'Computadores portáteis' },
        { id: 2, name: 'Monitor', description: 'Telas e monitores' }
    ],
    accessories: [
        { id: 1, name: 'Cabo HDMI', specification: '2 metros, 4K support' },
        { id: 2, name: 'Hub USB', specification: '4 portas USB 3.0' }
    ]
};

const CURRENT_USER = { id: 'USR001', name: 'Hudson Adley' };

// Funções básicas
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
        if (tabName === 'dashboard') {
            renderDashboard();
        } else if (tabName === 'employees') {
            renderEmployees();
        } else if (tabName === 'equipment') {
            renderEquipment();
        } else if (tabName === 'tickets') {
            renderTickets();
        } else if (tabName === 'settings') {
            renderSettings();
        }
    }
}

function renderDashboard() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;
    
    const chamadosAbertos = appState.tickets.filter(t => 
        ['novo', 'aguardando-validacao', 'aguardando-equipamento', 'atribuido-para-atendimento', 'em-andamento'].includes(t.status)
    ).length;
    
    const usuariosAtivos = appState.employees.filter(emp => emp.status === 'active').length;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-3xl font-bold text-purple-600">${chamadosAbertos}</div>
                        <div class="text-sm font-medium text-gray-600 mt-1">Chamados Abertos</div>
                    </div>
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span class="text-2xl">🎫</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-3xl font-bold text-green-600">${usuariosAtivos}</div>
                        <div class="text-sm font-medium text-gray-600 mt-1">Colaboradores Ativos</div>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span class="text-2xl">👥</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-3xl font-bold text-blue-600">${appState.equipment.length}</div>
                        <div class="text-sm font-medium text-gray-600 mt-1">Equipamentos</div>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span class="text-2xl">💻</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Bem-vindo ao Sistema 4TIS</h3>
            <p class="text-gray-600">Sistema de gestão de TI para controle de equipamentos, colaboradores e chamados.</p>
        </div>
    `;
}

function renderEmployees() {
    const container = document.getElementById('employees-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold">Colaboradores</h2>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    ➕ Cadastrar Colaborador
                </button>
            </div>
            <div class="p-6">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${appState.employees.map(emp => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${emp.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${emp.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.position}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.email}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                            ${emp.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
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

function renderEquipment() {
    const container = document.getElementById('equipment-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold">Equipamentos</h2>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    ➕ Cadastrar Equipamento
                </button>
            </div>
            <div class="p-6">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${appState.equipment.map(eq => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${eq.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${eq.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${eq.type}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full ${eq.status === 'in-use' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                                            ${eq.status === 'in-use' ? 'Em Uso' : 'Disponível'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ ${eq.value.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderTickets() {
    const container = document.getElementById('tickets-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold">Chamados</h2>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    ➕ Novo Chamado
                </button>
            </div>
            <div class="p-6">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipamento</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${appState.tickets.map(ticket => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${ticket.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${ticket.requestor}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ticket.equipmentType}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                            ${ticket.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ticket.createdAt}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderSettings() {
    const container = document.getElementById('settings-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
                <h2 class="text-xl font-semibold">Configurações</h2>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-medium mb-4">Tipos de Equipamento</h3>
                        <div class="space-y-2">
                            ${appState.equipmentTypes.map(type => `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div class="font-medium">${type.name}</div>
                                        <div class="text-sm text-gray-500">${type.description}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-medium mb-4">Acessórios</h3>
                        <div class="space-y-2">
                            ${appState.accessories.map(acc => `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div class="font-medium">${acc.name}</div>
                                        <div class="text-sm text-gray-500">${acc.specification}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function logout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        window.location.reload();
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema 4TIS inicializado');
    renderDashboard();
});