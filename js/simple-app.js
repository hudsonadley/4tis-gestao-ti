// Sistema 4TIS - Versão com Neon Database
let appState = {
    employees: [],
    equipment: [],
    tickets: []
};

// Inicializar API Client
const apiClient = new ApiClient();

// Carregar dados da API
async function loadData() {
    try {
        showToast('Carregando dados...', 'info');
        
        const [employees, equipment, tickets] = await Promise.all([
            apiClient.getEmployees(),
            apiClient.getEquipment(),
            apiClient.getTickets()
        ]);
        
        appState.employees = employees || [];
        appState.equipment = equipment || [];
        appState.tickets = tickets || [];
        
        console.log('Dados carregados:', {
            employees: appState.employees.length,
            equipment: appState.equipment.length,
            tickets: appState.tickets.length
        });
        
        showToast('Dados carregados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados: ' + error.message, 'error');
        
        // Garantir arrays vazios em caso de erro
        appState.employees = appState.employees || [];
        appState.equipment = appState.equipment || [];
        appState.tickets = appState.tickets || [];
    }
}

const CURRENT_USER = { id: 'USR001', name: 'Hudson Adley' };

// Toast funcional
function showToast(message, type = 'info') {
    // Garante que o container existe
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed top-5 right-5 space-y-3 pointer-events-none';
        container.style.zIndex = '10001'; // Acima dos modais
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.zIndex = '10001';
    toast.style.pointerEvents = 'auto';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 4000);
}

// Toast especial para modais
function showModalToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white font-medium shadow-lg`;
    toast.style.zIndex = '10002';
    toast.style.backgroundColor = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : '#3b82f6';
    toast.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Gerar ID único
function generateId(prefix) {
    return prefix + Date.now().toString().slice(-6);
}

// Modal genérico
function openModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '9999';
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

function closeModal(modal) {
    if (modal && modal.parentNode) {
        modal.remove();
    }
}

// Navegação entre abas
function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const tabButton = document.querySelector(`[onclick*="switchTab('${tabName}')"]`);
    const tabContent = document.getElementById(`${tabName}-tab`);
    
    if (tabButton && tabContent) {
        tabButton.classList.add('active');
        tabContent.classList.add('active');
        
        if (tabName === 'dashboard') renderDashboard();
        else if (tabName === 'employees') renderEmployees();
        else if (tabName === 'equipment') renderEquipment();
        else if (tabName === 'tickets') renderTickets();
        else if (tabName === 'settings') renderSettings();
    }
}

// Dashboard
function renderDashboard() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;
    
    const chamadosAbertos = appState.tickets.filter(t => 
        ['novo', 'aguardando-validacao', 'aguardando-equipamento'].includes(t.status)
    ).length;
    
    const usuariosAtivos = appState.employees.filter(emp => emp.status === 'active').length;
    const totalEquipamentos = appState.equipment.length;
    const valorTotal = appState.equipment.reduce((sum, eq) => sum + (eq.value || 0), 0);
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="switchTab('tickets')">
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
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="switchTab('employees')">
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
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="switchTab('equipment')">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-3xl font-bold text-blue-600">${totalEquipamentos}</div>
                        <div class="text-sm font-medium text-gray-600 mt-1">Equipamentos</div>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span class="text-2xl">💻</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-3xl font-bold text-orange-600">R$ ${(valorTotal/1000).toFixed(0)}k</div>
                        <div class="text-sm font-medium text-gray-600 mt-1">Valor Total</div>
                    </div>
                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span class="text-2xl">💰</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Bem-vindo ao Sistema 4TIS</h3>
            <p class="text-gray-600">Sistema de gestão de TI para controle de equipamentos, colaboradores e chamados.</p>
            <div class="mt-4 space-y-2">
                <p class="text-sm text-gray-500">• Clique nos cards acima para navegar</p>
                <p class="text-sm text-gray-500">• Clique nas linhas das tabelas para ver detalhes</p>
                <p class="text-sm text-gray-500">• Use os botões de cadastro para adicionar novos itens</p>
            </div>
        </div>
    `;
}

// Estado da paginação
let paginationState = {
    employees: { page: 1, limit: 10, search: '', status: '' },
    equipment: { page: 1, limit: 10, search: '', type: '' },
    tickets: { page: 1, limit: 10, search: '', status: '' }
};

// Colaboradores
function renderEmployees() {
    const container = document.getElementById('employees-content');
    if (!container) return;
    
    const { page, limit, search, status } = paginationState.employees;
    let filteredEmployees = appState.employees;
    
    // Filtros
    if (search) {
        filteredEmployees = filteredEmployees.filter(emp => 
            emp.name.toLowerCase().includes(search.toLowerCase()) ||
            emp.position.toLowerCase().includes(search.toLowerCase()) ||
            emp.email.toLowerCase().includes(search.toLowerCase())
        );
    }
    if (status) {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === status);
    }
    
    // Paginação
    const totalItems = filteredEmployees.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + limit);
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold">Colaboradores (${totalItems})</h2>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="openEmployeeModal()">
                    ➕ Cadastrar Colaborador
                </button>
            </div>
            
            <!-- Filtros -->
            <div class="p-4 border-b border-gray-200 bg-gray-50">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Buscar por nome, cargo ou email..." 
                           value="${search}" onkeyup="updateEmployeeFilter('search', this.value)"
                           class="px-3 py-2 border border-gray-300 rounded-lg">
                    <select onchange="updateEmployeeFilter('status', this.value)" class="px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">Todos os status</option>
                        <option value="active" ${status === 'active' ? 'selected' : ''}>Ativo</option>
                        <option value="inactive" ${status === 'inactive' ? 'selected' : ''}>Inativo</option>
                    </select>
                    <select onchange="updateEmployeeFilter('limit', this.value)" class="px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="10" ${limit === 10 ? 'selected' : ''}>10 por página</option>
                        <option value="25" ${limit === 25 ? 'selected' : ''}>25 por página</option>
                        <option value="50" ${limit === 50 ? 'selected' : ''}>50 por página</option>
                        <option value="100" ${limit === 100 ? 'selected' : ''}>100 por página</option>
                    </select>
                    <button onclick="clearEmployeeFilters()" class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        🗑️ Limpar
                    </button>
                </div>
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
                            ${paginatedEmployees.map(emp => {
                                const hasPendingEquipment = emp.pending_equipment || false;
                                return `
                                <tr class="hover:bg-gray-50 cursor-pointer ${hasPendingEquipment ? 'bg-red-50' : ''}" onclick="viewEmployeeDetails('${emp.id}')">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${emp.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        ${emp.name}
                                        ${hasPendingEquipment ? '<span class="ml-2 text-red-600">⚠️</span>' : ''}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${emp.position}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${emp.email}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                            ${emp.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                        ${hasPendingEquipment ? '<div class="text-xs text-red-600 mt-1">(Pendente de Devolução)</div>' : ''}
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Paginação -->
                ${renderPagination('employees', page, totalPages, totalItems)}
            </div>
        </div>
    `;
}

// Modal de cadastro de colaborador
function openEmployeeModal(employee = null) {
    const isEdit = !!employee;
    const title = isEdit ? 'Editar Colaborador' : 'Cadastrar Colaborador';
    
    const modalContent = `
        <div class="modal-content max-w-md w-full mx-4">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                    <span class="text-2xl">&times;</span>
                </button>
            </div>
            <form id="employeeForm" class="p-6 space-y-4">
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Nome Completo *</label>
                    <input type="text" id="employeeName" required 
                           value="${employee ? employee.name : ''}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Nome completo">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Cargo *</label>
                    <input type="text" id="employeePosition" required 
                           value="${employee ? employee.position : ''}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Cargo do colaborador">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Email</label>
                    <input type="email" id="employeeEmail" 
                           value="${employee ? employee.email || '' : ''}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="email@empresa.com">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Telefone</label>
                    <input type="tel" id="employeePhone" 
                           value="${employee ? employee.phone || '' : ''}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="(11) 99999-9999">
                </div>
                ${isEdit ? `
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Status</label>
                    <select id="employeeStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="active" ${employee.status === 'active' ? 'selected' : ''}>Ativo</option>
                        <option value="inactive" ${employee.status === 'inactive' ? 'selected' : ''}>Inativo</option>
                    </select>
                </div>
                ` : ''}
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        ${isEdit ? 'Atualizar' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    const modal = openModal(modalContent);
    
    // Event listener do formulário
    document.getElementById('employeeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEmployee(employee, modal);
    });
}

// Salvar colaborador
async function saveEmployee(existingEmployee, modal) {
    const name = document.getElementById('employeeName').value.trim();
    const position = document.getElementById('employeePosition').value.trim();
    const email = document.getElementById('employeeEmail').value.trim();
    const phone = document.getElementById('employeePhone').value.trim();
    const status = document.getElementById('employeeStatus')?.value || 'active';

    if (!name || !position) {
        showToast('Nome e cargo são obrigatórios', 'error');
        return;
    }

    try {
        if (existingEmployee) {
            // Editar
            await apiClient.updateEmployee(existingEmployee.id, {
                name, position, email, phone, status
            });
            showToast('Colaborador atualizado com sucesso!', 'success');
        } else {
            // Criar novo
            const newEmployee = {
                id: generateId('EMP'),
                name, position, email, phone, status
            };
            await apiClient.createEmployee(newEmployee);
            showToast('Colaborador cadastrado com sucesso!', 'success');
        }

        closeModal(modal);
        await loadData();
        renderEmployees();
    } catch (error) {
        showToast('Erro ao salvar colaborador: ' + error.message, 'error');
    }
}

// Ver detalhes do colaborador
async function viewEmployeeDetails(id) {
    const employee = appState.employees.find(emp => emp.id === id);
    if (!employee) return;

    try {
        const [assignments, tickets] = await Promise.all([
            apiClient.getEmployeeAssignments(id),
            apiClient.getTicketsByEmployee(id)
        ]);
        
        const activeAssignments = assignments.filter(a => a.status === 'active');
        const pendingAssignments = assignments.filter(a => a.status === 'pending_return');
        
        const modalContent = `
            <div class="modal-content max-w-4xl w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">Detalhes: ${employee.name}</h3>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <span class="text-2xl">&times;</span>
                    </button>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Informações Básicas -->
                        <div class="space-y-4">
                            <h4 class="font-semibold text-gray-900">Informações Básicas</h4>
                            <div><strong>ID:</strong> ${employee.id}</div>
                            <div><strong>Nome:</strong> ${employee.name}</div>
                            <div><strong>Cargo:</strong> ${employee.position}</div>
                            <div><strong>Email:</strong> ${employee.email || 'Não informado'}</div>
                            <div><strong>Telefone:</strong> ${employee.phone || 'Não informado'}</div>
                            <div><strong>Status:</strong> 
                                <span class="px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                    ${employee.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Equipamentos Vinculados -->
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <h4 class="font-semibold text-gray-900">Equipamentos Vinculados</h4>
                                ${employee.status === 'active' ? `<button class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700" onclick="openEquipmentSearchModal('${id}')">
                                    ➕ Vincular Equipamento
                                </button>` : ''}
                            </div>
                            
                            <!-- Valor Total -->
                            ${activeAssignments.length > 0 ? `
                                <div class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                    <div class="font-semibold text-blue-900">💰 Valor Total: R$ ${activeAssignments.reduce((sum, a) => sum + parseFloat(a.value || 0), 0).toFixed(2)}</div>
                                    <div class="text-xs text-blue-600 mt-1">Equipamentos + Periféricos vinculados</div>
                                </div>
                            ` : ''}
                            
                            <div class="equipment-list max-h-60 overflow-y-auto">
                                ${activeAssignments.length > 0 ? 
                                    activeAssignments.map(assignment => `
                                        <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg mb-2">
                                            <div>
                                                <div class="font-medium">${assignment.name}</div>
                                                <div class="text-sm text-gray-600">${assignment.type} - ${assignment.brand} ${assignment.model}</div>
                                                <div class="text-xs text-gray-500">Serial: ${assignment.serial_number || 'N/A'} | R$ ${parseFloat(assignment.value || 0).toFixed(2)}</div>
                                            </div>
                                            <button class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700" onclick="returnEquipment(${assignment.id})">
                                                Devolver
                                            </button>
                                        </div>
                                    `).join('') : 
                                    '<div class="text-center text-gray-500 py-4">Nenhum equipamento vinculado</div>'
                                }
                                ${pendingAssignments.length > 0 ? `
                                    <div class="mt-4">
                                        <h5 class="font-medium text-red-600 mb-2">⚠️ Pendente de Devolução</h5>
                                        ${pendingAssignments.map(assignment => `
                                            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg mb-2">
                                                <div>
                                                    <div class="font-medium text-red-800">${assignment.name}</div>
                                                    <div class="text-sm text-red-600">${assignment.type} - R$ ${assignment.value}</div>
                                                    <div class="text-xs text-red-500">Serial: ${assignment.serial_number || 'N/A'}</div>
                                                </div>
                                                <button class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700" onclick="resolvePendency(${assignment.id})">
                                                    Resolver
                                                </button>
                                            </div>
                                        `).join('')}
                                        <button class="w-full mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700" onclick="generateHRMessage('${id}')">
                                            📋 SINALIZAR RH
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Histórico de Chamados -->
                    <div class="mt-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="font-semibold text-gray-900">Histórico de Chamados</h4>
                            <button class="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700" onclick="viewEmployeeTickets('${id}')">
                                Ver Todos (${tickets.length})
                            </button>
                        </div>
                        <div class="text-sm text-gray-600">
                            ${tickets.length > 0 ? `Últimos chamados: ${tickets.slice(0, 3).map(t => t.title).join(', ')}` : 'Nenhum chamado encontrado'}
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
                    <button class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300" onclick="this.closest('.modal').remove()">
                        Fechar
                    </button>
                    <div class="space-x-3">
                        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="this.closest('.modal').remove(); openEmployeeModal(appState.employees.find(e => e.id === '${id}'))">
                            Editar
                        </button>
                        ${employee.status === 'active' ? `
                            <button class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700" onclick="inactivateEmployee('${id}', this.closest('.modal'))">
                                Inativar
                            </button>
                        ` : ''}
                        <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onclick="deleteEmployee('${id}', this.closest('.modal'))">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        openModal(modalContent);
    } catch (error) {
        showToast('Erro ao carregar detalhes: ' + error.message, 'error');
    }
}

// Excluir colaborador
async function deleteEmployee(id, modal) {
    const employee = appState.employees.find(emp => emp.id === id);
    if (!employee) return;

    if (confirm(`Tem certeza que deseja excluir o colaborador "${employee.name}"?`)) {
        try {
            await apiClient.deleteEmployee(id);
            showToast('Colaborador excluído com sucesso!', 'success');
            closeModal(modal);
            await loadData();
            renderEmployees();
        } catch (error) {
            showToast('Erro ao excluir colaborador: ' + error.message, 'error');
        }
    }
}

// Equipamentos
function renderEquipment() {
    const container = document.getElementById('equipment-content');
    if (!container) return;
    
    const { page, limit, search, type } = paginationState.equipment;
    let filteredEquipment = appState.equipment;
    
    // Filtros
    if (search) {
        filteredEquipment = filteredEquipment.filter(eq => 
            (eq.name && eq.name.toLowerCase().includes(search.toLowerCase())) ||
            (eq.model && eq.model.toLowerCase().includes(search.toLowerCase())) ||
            (eq.brand && eq.brand.toLowerCase().includes(search.toLowerCase())) ||
            (eq.serial_number && eq.serial_number.toLowerCase().includes(search.toLowerCase()))
        );
    }
    if (type) {
        filteredEquipment = filteredEquipment.filter(eq => eq.type === type);
    }
    
    // Paginação
    const totalItems = filteredEquipment.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedEquipment = filteredEquipment.slice(startIndex, startIndex + limit);
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold">Equipamentos (${totalItems})</h2>
                <div class="space-x-3">
                    <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700" onclick="openPeripheralsManagementModal()">
                        🔌 Gerenciar Periféricos
                    </button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="openEquipmentModal()">
                        ➕ Cadastrar Equipamento
                    </button>
                </div>
            </div>
            
            <!-- Filtros -->
            <div class="p-4 border-b border-gray-200 bg-gray-50">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Buscar por nome, modelo, marca ou série..." 
                           value="${search}" onkeyup="updateEquipmentFilter('search', this.value)"
                           class="px-3 py-2 border border-gray-300 rounded-lg">
                    <select onchange="updateEquipmentFilter('type', this.value)" class="px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">Todos os tipos</option>
                        <option value="notebook" ${type === 'notebook' ? 'selected' : ''}>Notebook</option>
                        <option value="desktop" ${type === 'desktop' ? 'selected' : ''}>Desktop</option>
                        <option value="monitor" ${type === 'monitor' ? 'selected' : ''}>Monitor</option>
                        <option value="celular" ${type === 'celular' ? 'selected' : ''}>Celular</option>
                        <option value="chip" ${type === 'chip' ? 'selected' : ''}>CHIP</option>
                    </select>
                    <select onchange="updateEquipmentFilter('limit', this.value)" class="px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="10" ${limit === 10 ? 'selected' : ''}>10 por página</option>
                        <option value="25" ${limit === 25 ? 'selected' : ''}>25 por página</option>
                        <option value="50" ${limit === 50 ? 'selected' : ''}>50 por página</option>
                        <option value="100" ${limit === 100 ? 'selected' : ''}>100 por página</option>
                    </select>
                    <button onclick="clearEquipmentFilters()" class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        🗑️ Limpar
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Série</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${paginatedEquipment.map(eq => {
                                const totalValue = parseFloat(eq.value || 0) + parseFloat(eq.peripherals_value || 0);
                                return `
                                <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewEquipmentDetails('${eq.id}')">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${eq.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${eq.model || eq.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${eq.serial_number || 'N/A'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${eq.type}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full ${
                                            eq.assigned_to ? 'bg-yellow-100 text-yellow-800' :
                                            eq.status === 'available' ? 'bg-green-100 text-green-800' :
                                            eq.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }">
                                            ${
                                                eq.assigned_to ? 'Em Uso' :
                                                eq.status === 'available' ? 'Disponível' :
                                                eq.status === 'maintenance' ? 'Manutenção' :
                                                'Desativado'
                                            }
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>R$ ${totalValue.toFixed(2)}</div>
                                        ${eq.peripherals_value > 0 ? `<div class="text-xs text-gray-400">(+R$ ${parseFloat(eq.peripherals_value).toFixed(2)} periféricos)</div>` : ''}
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Paginação -->
                ${renderPagination('equipment', page, totalPages, totalItems)}
            </div>
        </div>
    `;
}

// Modal de cadastro de equipamento
function openEquipmentModal(equipment = null) {
    const isEdit = !!equipment;
    const title = isEdit ? 'Editar Equipamento' : 'Cadastrar Equipamento';
    
    const modalContent = `
        <div class="modal-content max-w-lg w-full mx-4">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                    <span class="text-2xl">&times;</span>
                </button>
            </div>
            <form id="equipmentForm" class="p-6 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-800 mb-2">Nome do Equipamento *</label>
                        <input type="text" id="equipmentName" required 
                               value="${equipment ? equipment.name : ''}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Ex: Dell Inspiron 15">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-800 mb-2">Tipo *</label>
                        <select id="equipmentType" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Selecione o tipo</option>
                            <option value="notebook" ${equipment?.type === 'notebook' ? 'selected' : ''}>Notebook</option>
                            <option value="desktop" ${equipment?.type === 'desktop' ? 'selected' : ''}>Desktop</option>
                            <option value="monitor" ${equipment?.type === 'monitor' ? 'selected' : ''}>Monitor</option>
                            <option value="mouse" ${equipment?.type === 'mouse' ? 'selected' : ''}>Mouse</option>
                            <option value="teclado" ${equipment?.type === 'teclado' ? 'selected' : ''}>Teclado</option>
                            <option value="celular" ${equipment?.type === 'celular' ? 'selected' : ''}>Celular</option>
                            <option value="tablet" ${equipment?.type === 'tablet' ? 'selected' : ''}>Tablet</option>
                            <option value="impressora" ${equipment?.type === 'impressora' ? 'selected' : ''}>Impressora</option>
                            <option value="chip" ${equipment?.type === 'chip' ? 'selected' : ''}>CHIP</option>
                            <option value="outros" ${equipment?.type === 'outros' ? 'selected' : ''}>Outros</option>
                        </select>
                        <div class="text-xs text-gray-500 mt-1">💡 Tipos podem ser gerenciados nas Configurações</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-800 mb-2">Marca *</label>
                        <input type="text" id="equipmentBrand" required 
                               value="${equipment ? equipment.brand : ''}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Ex: Dell, HP, Lenovo">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-800 mb-2">Modelo *</label>
                        <input type="text" id="equipmentModel" required 
                               value="${equipment ? equipment.model : ''}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Ex: Inspiron 15, ThinkPad X1">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-800 mb-2">Patrimônio *</label>
                        <input type="text" id="equipmentPatrimony" required
                               value="${equipment ? equipment.patrimony || '' : ''}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Número do patrimônio">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-800 mb-2">Número de Série</label>
                        <input type="text" id="equipmentSerial" 
                               value="${equipment ? equipment.serial_number || '' : ''}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Número de série">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-800 mb-2">Valor (R$) *</label>
                        <input type="number" id="equipmentValue" required step="0.01" min="0"
                               value="${equipment ? equipment.value || '' : ''}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-800 mb-2">Status *</label>
                        <select id="equipmentStatus" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="available" ${equipment?.status === 'available' ? 'selected' : ''}>Disponível</option>
                            <option value="in_use" ${equipment?.status === 'in_use' ? 'selected' : ''}>Em Uso</option>
                            <option value="maintenance" ${equipment?.status === 'maintenance' ? 'selected' : ''}>Em Manutenção</option>
                            <option value="retired" ${equipment?.status === 'retired' ? 'selected' : ''}>Desativado</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Observações</label>
                    <textarea id="equipmentObservations" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Observações sobre o equipamento...">${equipment ? equipment.observations || '' : ''}</textarea>
                </div>
                

                
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        ${isEdit ? 'Atualizar' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    const modal = openModal(modalContent);
    
    // Event listener do formulário
    document.getElementById('equipmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEquipment(equipment, modal);
    });
}

// Salvar equipamento
async function saveEquipment(existingEquipment, modal) {
    const name = document.getElementById('equipmentName').value.trim();
    const type = document.getElementById('equipmentType').value;
    const brand = document.getElementById('equipmentBrand').value.trim();
    const model = document.getElementById('equipmentModel').value.trim();
    const patrimony = document.getElementById('equipmentPatrimony').value.trim();
    const serial_number = document.getElementById('equipmentSerial').value.trim();
    const value = parseFloat(document.getElementById('equipmentValue').value);
    const status = document.getElementById('equipmentStatus').value;
    const observations = document.getElementById('equipmentObservations').value.trim();

    if (!name || !type || !brand || !model || !patrimony || !value) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    try {
        if (existingEquipment) {
            // Editar
            await apiClient.updateEquipment(existingEquipment.id, {
                name, type, brand, model, patrimony, serial_number, value, status, observations
            });
            showToast('Equipamento atualizado com sucesso!', 'success');
        } else {
            // Criar novo
            const newEquipment = {
                id: generateId('EQ'),
                name, type, brand, model, patrimony, serial_number, value, status, observations
            };
            await apiClient.createEquipment(newEquipment);
            showToast('Equipamento cadastrado com sucesso!', 'success');
        }

        closeModal(modal);
        await loadData();
        renderEquipment();
    } catch (error) {
        showToast('Erro ao salvar equipamento: ' + error.message, 'error');
    }
}

// Ver detalhes do equipamento
async function viewEquipmentDetails(id) {
    const equipment = appState.equipment.find(eq => eq.id === id);
    if (!equipment) return;

    try {
        // Busca colaborador que está usando o equipamento
        const assignedEmployee = equipment.assigned_to ? 
            appState.employees.find(emp => emp.id === equipment.assigned_to) : null;
        
        const modalContent = `
            <div class="modal-content max-w-2xl w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">Detalhes: ${equipment.name}</h3>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <span class="text-2xl">&times;</span>
                    </button>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h4 class="font-semibold text-gray-900">Informações do Equipamento</h4>
                            <div><strong>ID:</strong> ${equipment.id}</div>
                            <div><strong>Nome:</strong> ${equipment.name}</div>
                            <div><strong>Tipo:</strong> ${equipment.type}</div>
                            <div><strong>Marca:</strong> ${equipment.brand}</div>
                            <div><strong>Modelo:</strong> ${equipment.model}</div>
                            <div><strong>Número de Série:</strong> ${equipment.serial_number || 'Não informado'}</div>
                            <div><strong>Valor:</strong> R$ ${parseFloat(equipment.value || 0).toFixed(2)}</div>
                            <div><strong>Status:</strong> 
                                <span class="px-2 py-1 text-xs font-medium rounded-full ${
                                    equipment.status === 'available' ? 'bg-green-100 text-green-800' :
                                    equipment.status === 'in-use' ? 'bg-yellow-100 text-yellow-800' :
                                    equipment.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }">
                                    ${
                                        equipment.status === 'available' ? 'Disponível' :
                                        equipment.status === 'in-use' ? 'Em Uso' :
                                        equipment.status === 'maintenance' ? 'Manutenção' :
                                        'Aposentado'
                                    }
                                </span>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <h4 class="font-semibold text-gray-900">Atribuição</h4>
                            ${assignedEmployee ? `
                                <div class="p-4 bg-blue-50 rounded-lg">
                                    <div class="font-medium text-blue-900">${assignedEmployee.name}</div>
                                    <div class="text-sm text-blue-700">${assignedEmployee.position}</div>
                                    <div class="text-xs text-blue-600">${assignedEmployee.email}</div>
                                    <button class="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700" onclick="this.closest('.modal').remove(); viewEmployeeDetails('${assignedEmployee.id}')">
                                        Ver Colaborador
                                    </button>
                                </div>
                            ` : '<div class="text-gray-500">Equipamento não atribuído</div>'}
                        </div>
                    </div>
                    
                    <!-- Periféricos Vinculados -->
                    <div class="mt-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="font-semibold text-gray-900">Periféricos Vinculados</h4>
                            <button class="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700" onclick="openPeripheralLinkModal('${id}')">
                                🔗 Vincular Periféricos
                            </button>
                        </div>
                        <div id="equipmentPeripherals-${id}" class="text-sm text-gray-600">
                            Carregando periféricos...
                        </div>
                    </div>
                    
                    <!-- Histórico de Devolução -->
                    <div class="mt-6">
                        <h4 class="font-semibold text-gray-900 mb-4">📋 Histórico de Devolução</h4>
                        <div id="equipmentHistory-${id}" class="text-sm text-gray-600">
                            Carregando histórico...
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300" onclick="this.closest('.modal').remove()">
                        Fechar
                    </button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="this.closest('.modal').remove(); openEquipmentModal(appState.equipment.find(e => e.id === '${id}'))">
                        Editar
                    </button>
                    <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onclick="deleteEquipment('${id}', this.closest('.modal'))">
                        Excluir
                    </button>
                </div>
            </div>
        `;
        
        openModal(modalContent);
        
        // Carregar periféricos do equipamento
        loadEquipmentPeripherals(id);
        
        // Carregar histórico de devolução se existir
        loadEquipmentHistory(id);
    } catch (error) {
        showToast('Erro ao carregar detalhes: ' + error.message, 'error');
    }
}

// Carregar periféricos do equipamento
async function loadEquipmentPeripherals(equipmentId) {
    try {
        const peripherals = await apiClient.getEquipmentPeripherals(equipmentId);
        const container = document.getElementById(`equipmentPeripherals-${equipmentId}`);
        
        if (container) {
            if (peripherals.length > 0) {
                // Calcular valor total dos periféricos
                const totalPeripheralsValue = peripherals.reduce((sum, p) => sum + parseFloat(p.value || 0), 0);
                
                container.innerHTML = `
                    <div class="mb-3 p-2 bg-blue-50 rounded text-sm">
                        <strong>Valor total dos periféricos: R$ ${totalPeripheralsValue.toFixed(2)}</strong>
                    </div>
                    ${peripherals.map(p => `
                        <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg mb-2">
                            <div>
                                <div class="font-medium">${p.name}</div>
                                <div class="text-sm text-gray-600">${p.model || 'Sem modelo'}</div>
                                <div class="text-xs text-green-600">Valor: R$ ${parseFloat(p.value || 0).toFixed(2)}</div>
                            </div>
                            <button class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700" onclick="unlinkPeripheralFromEquipment('${equipmentId}', ${p.peripheral_id})">
                                Desvincular
                            </button>
                        </div>
                    `).join('')}
                `;
            } else {
                container.innerHTML = '<div class="text-center text-gray-500 py-4">Nenhum periférico vinculado</div>';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar periféricos:', error);
    }
}

// Carregar histórico de devolução do equipamento
async function loadEquipmentHistory(equipmentId) {
    try {
        const history = await apiClient.getEquipmentHistory(equipmentId);
        const container = document.getElementById(`equipmentHistory-${equipmentId}`);
        
        if (container) {
            if (history.length > 0) {
                container.innerHTML = `
                    <div class="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                        📊 Histórico completo de todos os colaboradores que tiveram posse deste equipamento
                    </div>
                    ${history.map((record, index) => `
                        <div class="p-4 bg-gray-50 rounded-lg mb-3 border-l-4 ${
                            record.return_notes.includes('NÃO devolvido') ? 'border-red-500 bg-red-50' : record.return_notes.includes('AVARIA') ? 'border-orange-500 bg-orange-50' : 'border-green-500'
                        }">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="text-lg">👤</span>
                                        <div class="font-semibold text-gray-900">${record.employee_name}</div>
                                        <span class="px-2 py-1 text-xs rounded-full ${
                                            record.return_notes.includes('NÃO devolvido') ? 'bg-red-100 text-red-800' :
                                            record.return_notes.includes('AVARIA') ? 'bg-orange-100 text-orange-800' : 
                                            'bg-green-100 text-green-800'
                                        }">
                                            ${record.return_notes.includes('NÃO devolvido') ? '❌ Não Devolvido' :
                                              record.return_notes.includes('AVARIA') ? '⚠️ Devolvido com Avaria' :
                                              '✅ Devolvido'}
                                        </span>
                                    </div>
                                    <div class="text-sm text-gray-600 mb-2">
                                        <span class="inline-flex items-center gap-1">
                                            <span>📅</span>
                                            <span>Data: ${new Date(record.return_date).toLocaleDateString('pt-BR', {
                                                year: 'numeric',
                                                month: 'long', 
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </span>
                                    </div>
                                    <div class="text-sm text-gray-700 mb-2 p-2 bg-white rounded border">
                                        <span class="font-medium">📝 Observações:</span><br>
                                        ${record.return_notes}
                                    </div>
                                    <div class="text-xs text-gray-500 flex items-center gap-1">
                                        <span>⚙️</span>
                                        <span>Processado por: <strong>${record.returned_by}</strong></span>
                                    </div>
                                    ${record.return_notes.includes('NÃO devolvido') ? `
                                        <div class="mt-2 px-3 py-2 bg-red-100 text-red-800 text-xs rounded">
                                            <span class="font-medium">⚠️ Atenção:</span> Este equipamento permanece sob responsabilidade do ex-colaborador
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="text-xs text-gray-400 text-center">
                                    <div class="mb-1">🔒</div>
                                    <div>Registro<br>Permanente</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                `;
            } else {
                container.innerHTML = `
                    <div class="text-center text-gray-500 py-8">
                        <div class="text-4xl mb-2">📄</div>
                        <div class="font-medium">Nenhuma devolução registrada</div>
                        <div class="text-sm mt-1">Este equipamento ainda não possui histórico de devoluções</div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        const container = document.getElementById(`equipmentHistory-${equipmentId}`);
        if (container) {
            container.innerHTML = `
                <div class="text-center text-orange-500 py-4">
                    <div class="mb-2">⚠️ Tabela de histórico não encontrada</div>
                    <button onclick="createMissingTables()" class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        🔧 Criar Tabelas
                    </button>
                </div>
            `;
        }
    }
}

// Função para criar tabelas faltantes
async function createMissingTables() {
    try {
        showToast('Criando tabelas faltantes...', 'info');
        
        // Executar script de criação de tabelas
        const response = await fetch('/api/create-tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            showToast('Tabelas criadas com sucesso!', 'success');
            // Recarregar página para atualizar
            setTimeout(() => location.reload(), 1000);
        } else {
            throw new Error('Erro ao criar tabelas');
        }
    } catch (error) {
        showToast('Erro ao criar tabelas: ' + error.message, 'error');
    }
}

// Ver detalhes do periférico
async function viewPeripheralDetails(peripheralId) {
    try {
        const peripherals = await apiClient.getPeripherals();
        const peripheral = peripherals.find(p => p.id === peripheralId);
        
        if (!peripheral) return;
        
        const modalContent = `
            <div class="modal-content max-w-2xl w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">Detalhes: ${peripheral.name}</h3>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <span class="text-2xl">&times;</span>
                    </button>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h4 class="font-semibold text-gray-900">Informações do Periférico</h4>
                            <div><strong>ID:</strong> ${peripheral.id}</div>
                            <div><strong>Nome:</strong> ${peripheral.name}</div>
                            <div><strong>Modelo:</strong> ${peripheral.model || 'Não informado'}</div>
                            <div><strong>Quantidade Total:</strong> 
                                <span class="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                                    📦 ${peripheral.quantity || 1} unidades
                                </span>
                            </div>
                            <div><strong>Observações:</strong> ${peripheral.observations || 'Nenhuma observação'}</div>
                        </div>
                        
                        <div class="space-y-4">
                            <h4 class="font-semibold text-gray-900">Status de Uso</h4>
                            <div id="peripheralUsage-${peripheral.id}" class="text-sm text-gray-600">
                                Carregando informações de uso...
                            </div>
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300" onclick="this.closest('.modal').remove()">
                        Fechar
                    </button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="this.closest('.modal').remove(); editPeripheral(${peripheral.id})">
                        Editar
                    </button>
                    <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onclick="deletePeripheral(${peripheral.id}); this.closest('.modal').remove()">
                        Excluir
                    </button>
                </div>
            </div>
        `;
        
        openModal(modalContent);
        loadPeripheralUsage(peripheral.id);
    } catch (error) {
        showToast('Erro ao carregar detalhes: ' + error.message, 'error');
    }
}

// Carregar informações de uso do periférico
async function loadPeripheralUsage(peripheralId) {
    try {
        const [equipment, peripherals] = await Promise.all([
            apiClient.getEquipment(),
            apiClient.getPeripherals()
        ]);
        
        const peripheral = peripherals.find(p => p.id === peripheralId);
        const peripheralLinks = [];
        
        for (const eq of equipment) {
            try {
                const links = await apiClient.getEquipmentPeripherals(eq.id);
                const thisPeripheralLinks = links.filter(link => link.peripheral_id === peripheralId);
                peripheralLinks.push(...thisPeripheralLinks.map(link => ({...link, equipment_name: eq.name})));
            } catch (error) {
                console.error(`Erro ao carregar periféricos do equipamento ${eq.id}:`, error);
            }
        }
        
        const container = document.getElementById(`peripheralUsage-${peripheralId}`);
        if (container) {
            const totalQuantity = peripheral ? peripheral.quantity || 1 : 1;
            const usedQuantity = peripheralLinks.length;
            const availableQuantity = totalQuantity - usedQuantity;
            
            if (peripheralLinks.length > 0) {
                container.innerHTML = `
                    <div class="space-y-2">
                        <div class="grid grid-cols-3 gap-2 text-sm">
                            <div class="text-center p-2 bg-blue-50 rounded">
                                <div class="font-bold text-blue-600">${totalQuantity}</div>
                                <div class="text-xs text-blue-500">Total</div>
                            </div>
                            <div class="text-center p-2 bg-green-50 rounded">
                                <div class="font-bold text-green-600">${usedQuantity}</div>
                                <div class="text-xs text-green-500">Em Uso</div>
                            </div>
                            <div class="text-center p-2 bg-gray-50 rounded">
                                <div class="font-bold text-gray-600">${availableQuantity}</div>
                                <div class="text-xs text-gray-500">Disponível</div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <div class="text-sm font-medium text-green-600 mb-2">📊 Equipamentos usando:</div>
                            ${peripheralLinks.map(link => `
                                <div class="p-2 bg-green-50 rounded border-l-4 border-green-500 mb-1">
                                    <div class="font-medium text-green-800">${link.equipment_name}</div>
                                    <div class="text-xs text-green-600">Valor: R$ ${parseFloat(link.value || 0).toFixed(2)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="text-center p-4 bg-gray-50 rounded">
                        <div class="text-2xl mb-2">📦</div>
                        <div class="text-gray-600">Todas as ${totalQuantity} unidades disponíveis</div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar uso do periférico:', error);
    }
}

// Excluir equipamento
async function deleteEquipment(id, modal) {
    const equipment = appState.equipment.find(eq => eq.id === id);
    if (!equipment) return;

    if (equipment.status === 'in-use') {
        showToast('Não é possível excluir equipamento em uso', 'error');
        return;
    }

    if (confirm(`Tem certeza que deseja excluir o equipamento "${equipment.name}"?`)) {
        try {
            await apiClient.deleteEquipment(id);
            showToast('Equipamento excluído com sucesso!', 'success');
            closeModal(modal);
            await loadData();
            renderEquipment();
        } catch (error) {
            showToast('Erro ao excluir equipamento: ' + error.message, 'error');
        }
    }
}

// Chamados (similar)
function renderTickets() {
    const container = document.getElementById('tickets-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold">Chamados</h2>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="openTicketModal()">
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
                                <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewTicketDetails('${ticket.id}')">
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

function openTicketModal() {
    showToast('Modal de chamado funcionando!', 'info');
}

function viewTicketDetails(id) {
    showToast(`Visualizando chamado ${id}`, 'info');
}

// Configurações
function renderSettings() {
    const container = document.getElementById('settings-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Tipos de Equipamento -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold">🏷️ Tipos de Equipamento</h3>
                    <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" onclick="openEquipmentTypeModal()">
                        ➕ Novo Tipo
                    </button>
                </div>
                <div class="p-6">
                    <div id="equipmentTypesList" class="space-y-2">
                        Carregando tipos...
                    </div>
                </div>
            </div>
            
            <!-- Estatísticas -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-lg font-semibold">📊 Estatísticas do Sistema</h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">${appState.employees.length}</div>
                            <div class="text-sm text-gray-600">Colaboradores</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-600">${appState.equipment.length}</div>
                            <div class="text-sm text-gray-600">Equipamentos</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-purple-600">${appState.tickets.length}</div>
                            <div class="text-sm text-gray-600">Chamados</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Ações do Sistema -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-lg font-semibold">🔧 Ações do Sistema</h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="exportData()">
                            📥 Exportar Dados
                        </button>
                        <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onclick="resetData()">
                            🗑️ Limpar Dados
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Carregar tipos de equipamento
    loadEquipmentTypes();
}

// Carregar tipos de equipamento
async function loadEquipmentTypes() {
    try {
        const types = await apiClient.getEquipmentTypes();
        const container = document.getElementById('equipmentTypesList');
        
        if (container) {
            if (types.length > 0) {
                container.innerHTML = types.map(type => `
                    <div class="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                        <div class="flex items-center space-x-3">
                            <span class="text-2xl">${type.icon || '📦'}</span>
                            <div>
                                <div class="font-medium">${type.name}</div>
                                <div class="text-sm text-gray-500">${type.description || 'Sem descrição'}</div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="px-2 py-1 text-xs rounded-full ${
                                type.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }">
                                ${type.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                            <button class="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700" onclick="editEquipmentType(${type.id})">
                                Editar
                            </button>
                            <button class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700" onclick="deleteEquipmentType(${type.id})">
                                Excluir
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhum tipo cadastrado</div>';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar tipos:', error);
        const container = document.getElementById('equipmentTypesList');
        if (container) {
            container.innerHTML = `
                <div class="text-center text-orange-500 py-8">
                    <div class="mb-2">⚠️ Tabelas não encontradas</div>
                    <button onclick="createMissingTables()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        🔧 Criar Tabelas
                    </button>
                </div>
            `;
        }
    }
}

// Modal para tipo de equipamento
function openEquipmentTypeModal(type = null) {
    const isEdit = !!type;
    const title = isEdit ? 'Editar Tipo' : 'Novo Tipo';
    
    const modalContent = `
        <div class="modal-content max-w-md w-full mx-4">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                    <span class="text-2xl">&times;</span>
                </button>
            </div>
            <form id="equipmentTypeForm" class="p-6 space-y-4">
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Nome *</label>
                    <input type="text" id="typeName" required 
                           value="${type ? type.name : ''}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Ex: Notebook, Desktop">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Ícone</label>
                    <input type="text" id="typeIcon" 
                           value="${type ? type.icon || '' : ''}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="📱 💻 🖥️ 🖱️ ⌨️">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Descrição</label>
                    <textarea id="typeDescription" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Descrição do tipo de equipamento...">${type ? type.description || '' : ''}</textarea>
                </div>
                ${isEdit ? `
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Status</label>
                    <select id="typeStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="active" ${type.status === 'active' ? 'selected' : ''}>Ativo</option>
                        <option value="inactive" ${type.status === 'inactive' ? 'selected' : ''}>Inativo</option>
                    </select>
                </div>
                ` : ''}
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        ${isEdit ? 'Atualizar' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    const modal = openModal(modalContent);
    
    document.getElementById('equipmentTypeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEquipmentType(type, modal);
    });
}

// Salvar tipo de equipamento
async function saveEquipmentType(existingType, modal) {
    const name = document.getElementById('typeName').value.trim();
    const icon = document.getElementById('typeIcon').value.trim();
    const description = document.getElementById('typeDescription').value.trim();
    const status = document.getElementById('typeStatus')?.value || 'active';

    if (!name) {
        showToast('Nome é obrigatório', 'error');
        return;
    }

    try {
        const typeData = { name, icon, description, status };
        
        if (existingType) {
            await apiClient.updateEquipmentType(existingType.id, typeData);
            showToast('Tipo atualizado com sucesso!', 'success');
        } else {
            await apiClient.createEquipmentType(typeData);
            showToast('Tipo cadastrado com sucesso!', 'success');
        }

        closeModal(modal);
        loadEquipmentTypes();
    } catch (error) {
        showToast('Erro ao salvar tipo: ' + error.message, 'error');
    }
}

// Editar tipo de equipamento
async function editEquipmentType(typeId) {
    try {
        const types = await apiClient.getEquipmentTypes();
        const type = types.find(t => t.id === typeId);
        if (type) {
            openEquipmentTypeModal(type);
        }
    } catch (error) {
        showToast('Erro ao carregar tipo: ' + error.message, 'error');
    }
}

// Excluir tipo de equipamento
async function deleteEquipmentType(typeId) {
    if (!confirm('Tem certeza que deseja excluir este tipo? Equipamentos deste tipo não serão afetados.')) return;
    
    try {
        await apiClient.deleteEquipmentType(typeId);
        showToast('Tipo excluído com sucesso!', 'success');
        loadEquipmentTypes();
    } catch (error) {
        showToast('Erro ao excluir tipo: ' + error.message, 'error');
    }
}

function exportData() { 
    showToast('Dados exportados com sucesso!', 'success'); 
}

function resetData() { 
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        showToast('Dados resetados!', 'warning'); 
    }
}

// Busca de equipamentos para vincular
async function openEquipmentSearchModal(employeeId) {
    try {
        const equipment = await apiClient.getEquipment();
        const availableEquipment = equipment.filter(eq => eq.status === 'available');
        
        const modalContent = `
            <div class="modal-content max-w-2xl w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">Vincular Equipamento</h3>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <span class="text-2xl">&times;</span>
                    </button>
                </div>
                <div class="p-6">
                    <div class="mb-4">
                        <input type="text" id="equipmentSearch" placeholder="Buscar por nome, tipo, marca ou patrimônio..." 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                               oninput="filterEquipment()">
                    </div>
                    <div class="mb-4">
                        <select id="equipmentTypeFilter" class="px-3 py-2 border border-gray-300 rounded-lg" onchange="filterEquipment()">
                            <option value="">Todos os tipos</option>
                            <option value="notebook">Notebook</option>
                            <option value="desktop">Desktop</option>
                            <option value="monitor">Monitor</option>
                            <option value="mouse">Mouse</option>
                            <option value="teclado">Teclado</option>
                            <option value="celular">Celular</option>
                        </select>
                    </div>
                    <div id="equipmentList" class="max-h-96 overflow-y-auto space-y-2">
                        ${availableEquipment.map(eq => `
                            <div class="equipment-item p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" 
                                 data-name="${eq.name.toLowerCase()}" 
                                 data-type="${eq.type}" 
                                 data-brand="${eq.brand}" 
                                 data-serial="${eq.serial_number || ''}" 
                                 onclick="selectEquipment('${employeeId}', '${eq.id}', this.closest('.modal'))">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="font-medium">${eq.name}</div>
                                        <div class="text-sm text-gray-600">${eq.type} - ${eq.brand} ${eq.model}</div>
                                        <div class="text-xs text-gray-500">Serial: ${eq.serial_number || 'N/A'} | Valor: R$ ${eq.value}</div>
                                    </div>
                                    <button class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                        Vincular
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        openModal(modalContent);
    } catch (error) {
        showToast('Erro ao carregar equipamentos: ' + error.message, 'error');
    }
}

// Filtrar equipamentos na busca
function filterEquipment() {
    const search = document.getElementById('equipmentSearch').value.toLowerCase();
    const typeFilter = document.getElementById('equipmentTypeFilter').value;
    const items = document.querySelectorAll('.equipment-item');
    
    items.forEach(item => {
        const name = item.dataset.name;
        const type = item.dataset.type;
        const brand = item.dataset.brand.toLowerCase();
        const serial = item.dataset.serial.toLowerCase();
        
        const matchesSearch = name.includes(search) || brand.includes(search) || serial.includes(search);
        const matchesType = !typeFilter || type === typeFilter;
        
        item.style.display = matchesSearch && matchesType ? 'block' : 'none';
    });
}

// Selecionar equipamento para vincular
async function selectEquipment(employeeId, equipmentId, modal) {
    try {
        await apiClient.assignEquipment(employeeId, equipmentId);
        showToast('Equipamento vinculado com sucesso!', 'success');
        closeModal(modal);
        await loadData();
        viewEmployeeDetails(employeeId);
    } catch (error) {
        showToast('Erro ao vincular equipamento: ' + error.message, 'error');
    }
}

// Devolver equipamento
async function returnEquipment(assignmentId) {
    let notes;
    do {
        notes = prompt('Observações sobre a devolução (OBRIGATÓRIO):');
        if (notes === null) return;
        if (!notes.trim()) {
            alert('As observações sobre a devolução são obrigatórias!');
        }
    } while (!notes.trim());
    
    try {
        // Busca o assignment para pegar o equipment_id e employee info
        const assignments = await apiClient.getEmployeeAssignments();
        const assignment = assignments.find(a => a.id === assignmentId);
        
        if (assignment) {
            // Atualiza status do equipamento para 'available'
            await apiClient.updateEquipment(assignment.equipment_id, {
                status: 'available',
                assigned_to: null
            });
            
            // Salva histórico de devolução com informações do colaborador
            const employee = appState.employees.find(emp => emp.id === assignment.employee_id);
            const returnData = {
                equipment_id: assignment.equipment_id,
                employee_id: assignment.employee_id,
                employee_name: employee ? employee.name : 'Colaborador não encontrado',
                return_date: new Date().toISOString(),
                return_notes: notes,
                returned_by: CURRENT_USER.name
            };
            
            await apiClient.saveReturnHistory(returnData);
        }
        
        await apiClient.returnEquipment(assignmentId, notes);
        showToast('Equipamento devolvido com sucesso!', 'success');
        await loadData();
        // Recarrega a modal atual
        const modal = document.querySelector('.modal.active');
        if (modal) {
            const employeeId = modal.querySelector('[onclick*="viewEmployeeDetails"]')?.onclick?.toString().match(/'([^']+)'/)?.[1];
            if (employeeId) {
                modal.remove();
                viewEmployeeDetails(employeeId);
            }
        }
    } catch (error) {
        showToast('Erro ao devolver equipamento: ' + error.message, 'error');
    }
}

// Inativar colaborador
async function inactivateEmployee(employeeId, modal) {
    try {
        const assignments = await apiClient.getEmployeeAssignments(employeeId);
        const activeAssignments = assignments.filter(a => a.status === 'active');
        const employee = appState.employees.find(emp => emp.id === employeeId);
        
        if (activeAssignments.length > 0) {
            const confirmModal = `
                <div class="modal-content max-w-2xl w-full mx-4">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">Inativar Colaborador: ${employee.name}</h3>
                    </div>
                    <div class="p-6">
                        <p class="mb-4 text-gray-700">Este colaborador possui ${activeAssignments.length} equipamento(s) vinculado(s).</p>
                        
                        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 class="font-semibold text-blue-900 mb-3">📋 Equipamentos Vinculados:</h4>
                            <div class="space-y-3">
                                ${activeAssignments.map(assignment => `
                                    <div class="equipment-return-item p-3 bg-white border border-gray-200 rounded">
                                        <div class="flex items-start justify-between mb-2">
                                            <div class="flex-1">
                                                <div class="font-medium text-gray-900">${assignment.name}</div>
                                                <div class="text-sm text-gray-600">${assignment.type} - ${assignment.brand} ${assignment.model}</div>
                                                <div class="text-xs text-gray-500">Serial: ${assignment.serial_number || 'N/A'} | Valor: R$ ${parseFloat(assignment.value || 0).toFixed(2)}</div>
                                            </div>
                                            <div class="ml-4">
                                                <label class="flex items-center text-sm">
                                                    <input type="checkbox" class="mr-2 equipment-returned" data-assignment-id="${assignment.id}" data-equipment-id="${assignment.equipment_id}" onchange="toggleDamageOptions(this)">
                                                    <span class="text-green-700 font-medium">✅ Devolvido</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="damage-options" style="display: none;">
                                            <label class="flex items-center text-sm mb-2">
                                                <input type="checkbox" class="mr-2 damage-checkbox" onchange="toggleDamageDetails(this)">
                                                <span class="text-orange-700">⚠️ Avaria / Detalhes</span>
                                            </label>
                                            <div class="damage-details" style="display: none;">
                                                <textarea class="w-full px-3 py-2 border border-gray-300 rounded text-sm damage-notes" 
                                                          placeholder="Descreva a avaria ou detalhes da devolução..." rows="2"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="termSigned" class="mr-2" required>
                                <span class="font-medium">📝 Termo de devolução assinado pelo colaborador *</span>
                            </label>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300" onclick="this.closest('.modal').remove()">
                                Cancelar
                            </button>
                            <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onclick="confirmInactivation('${employeeId}')">
                                Inativar Colaborador
                            </button>
                        </div>
                    </div>
                </div>
            `;
            openModal(confirmModal);
        } else {
            if (confirm('Tem certeza que deseja inativar este colaborador?')) {
                await apiClient.updateEmployee(employeeId, { status: 'inactive' });
                showToast('Colaborador inativado com sucesso!', 'success');
                closeModal(modal);
                await loadData();
                renderEmployees();
            }
        }
    } catch (error) {
        showToast('Erro ao inativar colaborador: ' + error.message, 'error');
    }
}

// Toggle opções de avaria
function toggleDamageOptions(checkbox) {
    const damageOptions = checkbox.closest('.equipment-return-item').querySelector('.damage-options');
    damageOptions.style.display = checkbox.checked ? 'block' : 'none';
    
    if (!checkbox.checked) {
        const damageCheckbox = damageOptions.querySelector('.damage-checkbox');
        const damageDetails = damageOptions.querySelector('.damage-details');
        damageCheckbox.checked = false;
        damageDetails.style.display = 'none';
    }
}

// Toggle detalhes de avaria
function toggleDamageDetails(checkbox) {
    const damageDetails = checkbox.closest('.damage-options').querySelector('.damage-details');
    damageDetails.style.display = checkbox.checked ? 'block' : 'none';
}

// Confirmar inativação
async function confirmInactivation(employeeId) {
    const termSigned = document.getElementById('termSigned').checked;
    
    if (!termSigned) {
        showModalToast('Termo de devolução é obrigatório!', 'error');
        return;
    }
    
    try {
        const employee = appState.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            showToast('Colaborador não encontrado', 'error');
            return;
        }
        
        // Processar cada equipamento individualmente
        const equipmentItems = document.querySelectorAll('.equipment-return-item');
        
        for (const item of equipmentItems) {
            const returnedCheckbox = item.querySelector('.equipment-returned');
            const assignmentId = returnedCheckbox.dataset.assignmentId;
            const equipmentId = returnedCheckbox.dataset.equipmentId;
            const equipment = appState.equipment.find(eq => eq.id === equipmentId);
            
            if (returnedCheckbox.checked) {
                // Equipamento foi devolvido - volta ao estoque
                const damageCheckbox = item.querySelector('.damage-checkbox');
                let returnNotes = `Equipamento devolvido no desligamento do colaborador ${employee.name}.`;
                
                if (damageCheckbox && damageCheckbox.checked) {
                    const damageNotes = item.querySelector('.damage-notes').value.trim();
                    if (damageNotes) {
                        returnNotes += ` AVARIA/DETALHES: ${damageNotes}`;
                    } else {
                        returnNotes += ` Equipamento devolvido com avaria (detalhes não especificados).`;
                    }
                } else {
                    returnNotes += ` Equipamento devolvido íntegro.`;
                }
                
                // Salvar histórico de devolução
                const returnData = {
                    equipment_id: equipmentId,
                    employee_id: employeeId,
                    employee_name: employee.name,
                    return_date: new Date().toISOString(),
                    return_notes: returnNotes,
                    returned_by: CURRENT_USER.name
                };
                
                await apiClient.saveReturnHistory(returnData);
                await apiClient.returnEquipment(assignmentId, returnNotes);
                
                // Equipamento volta ao estoque como disponível
                if (equipment) {
                    await apiClient.updateEquipment(equipmentId, {
                        name: equipment.name,
                        type: equipment.type,
                        brand: equipment.brand,
                        model: equipment.model,
                        patrimony: equipment.patrimony,
                        serial_number: equipment.serial_number,
                        value: equipment.value,
                        observations: equipment.observations,
                        status: 'available',
                        assigned_to: null
                    });
                }
            } else {
                // Equipamento NÃO foi devolvido - permanece vinculado ao colaborador inativo
                const returnNotes = `Equipamento NÃO devolvido no desligamento do colaborador ${employee.name}. Equipamento permanece sob responsabilidade do ex-colaborador.`;
                
                // Salvar histórico indicando não devolução
                const returnData = {
                    equipment_id: equipmentId,
                    employee_id: employeeId,
                    employee_name: employee.name,
                    return_date: new Date().toISOString(),
                    return_notes: returnNotes,
                    returned_by: CURRENT_USER.name
                };
                
                await apiClient.saveReturnHistory(returnData);
                
                // Marcar assignment como não devolvido
                await apiClient.updateAssignmentStatus(assignmentId, 'not_returned', returnNotes);
                
                // Atualizar status do equipamento para 'in_use_inactive'
                if (equipment) {
                    await apiClient.updateEquipment(equipmentId, {
                        name: equipment.name,
                        type: equipment.type,
                        brand: equipment.brand,
                        model: equipment.model,
                        patrimony: equipment.patrimony,
                        serial_number: equipment.serial_number,
                        value: equipment.value,
                        observations: `${equipment.observations || ''}\nEquipamento com colaborador inativo desde ${new Date().toLocaleDateString('pt-BR')}`,
                        status: 'in_use_inactive',
                        assigned_to: employeeId
                    });
                }
            }
        }
        
        // Inativa colaborador
        await apiClient.updateEmployee(employeeId, { 
            name: employee.name,
            position: employee.position,
            email: employee.email,
            phone: employee.phone,
            status: 'inactive' 
        });
        
        showToast('Colaborador inativado com sucesso!', 'success');
        document.querySelectorAll('.modal').forEach(m => m.remove());
        await loadData();
        renderEmployees();
    } catch (error) {
        showToast('Erro ao inativar colaborador: ' + error.message, 'error');
    }
}

// Ver chamados do colaborador
async function viewEmployeeTickets(employeeId) {
    try {
        const tickets = await apiClient.getTicketsByEmployee(employeeId);
        const employee = appState.employees.find(e => e.id === employeeId);
        
        const modalContent = `
            <div class="modal-content max-w-4xl w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">Chamados - ${employee.name}</h3>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <span class="text-2xl">&times;</span>
                    </button>
                </div>
                <div class="p-6">
                    ${tickets.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${tickets.map(ticket => `
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${ticket.id}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${ticket.title}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                    ${ticket.status}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(ticket.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<div class="text-center text-gray-500 py-8">Nenhum chamado encontrado</div>'}
                </div>
            </div>
        `;
        
        openModal(modalContent);
    } catch (error) {
        showToast('Erro ao carregar chamados: ' + error.message, 'error');
    }
}

// Gerar mensagem para RH
async function generateHRMessage(employeeId) {
    try {
        const employee = appState.employees.find(e => e.id === employeeId);
        const assignments = await apiClient.getEmployeeAssignments(employeeId);
        const pendingAssignments = assignments.filter(a => a.status === 'pending_return');
        
        let equipmentList = '';
        let totalValue = 0;
        
        for (const assignment of pendingAssignments) {
            const equipValue = parseFloat(assignment.value || 0);
            totalValue += equipValue;
            
            // Buscar periféricos do equipamento
            let peripheralsList = '';
            let peripheralsValue = 0;
            try {
                const peripherals = await apiClient.getEquipmentPeripherals(assignment.equipment_id);
                if (peripherals.length > 0) {
                    peripheralsList = peripherals.map(p => 
                        `  • ${p.name} ${p.model || ''} - R$ ${parseFloat(p.value || 0).toFixed(2)}`
                    ).join('\n');
                    peripheralsValue = peripherals.reduce((sum, p) => sum + parseFloat(p.value || 0), 0);
                    totalValue += peripheralsValue;
                }
            } catch (error) {
                console.error('Erro ao buscar periféricos:', error);
            }
            
            equipmentList += `- ${assignment.name}, (Serial: ${assignment.serial_number || 'N/A'}), (Valor: R$ ${equipValue.toFixed(2)})\n`;
            if (peripheralsList) {
                equipmentList += `  Periféricos:\n${peripheralsList}\n`;
            }
        }
        
        const message = `Prezado(a) Gestão e Gente,

Solicitamos o desconto dos seguintes equipamentos na rescisão do colaborador ${employee.name}, cargo ${employee.position}, por não devolução:

Equipamentos não devolvidos:
${equipmentList}
VALOR TOTAL: R$ ${totalValue.toFixed(2)}

Data da solicitação: ${new Date().toLocaleDateString()}
Responsável pela solicitação: ${CURRENT_USER.name}

Atenciosamente,
Equipe de TI`;
        
        // Copia para clipboard
        await navigator.clipboard.writeText(message);
        showToast('Mensagem copiada para a área de transferência!', 'success');
        
    } catch (error) {
        showToast('Erro ao gerar mensagem: ' + error.message, 'error');
    }
}

// Resolver pendência
async function resolvePendency(assignmentId) {
    const notes = prompt('Observações sobre a resolução (ex: Valor descontado na rescisão):');
    if (notes === null) return;
    
    try {
        await apiClient.returnEquipment(assignmentId, notes);
        showToast('Pendência resolvida com sucesso!', 'success');
        await loadData();
        // Recarrega a modal atual
        const modal = document.querySelector('.modal.active');
        if (modal) {
            const employeeId = modal.querySelector('[onclick*="viewEmployeeDetails"]')?.onclick?.toString().match(/'([^']+)'/)?.[1];
            if (employeeId) {
                modal.remove();
                viewEmployeeDetails(employeeId);
            }
        }
    } catch (error) {
        showToast('Erro ao resolver pendência: ' + error.message, 'error');
    }
}

// Modal de gerenciamento geral de periféricos (na aba equipamentos)
async function openPeripheralsManagementModal() {
    try {
        const peripherals = await apiClient.getPeripherals();
        
        const modalContent = `
            <div class="modal-content max-w-3xl w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">Gerenciar Periféricos</h3>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <span class="text-2xl">&times;</span>
                    </button>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold text-gray-900">Periféricos Cadastrados</h4>
                        <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" onclick="openPeripheralForm()">
                            ➕ Novo Periférico
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${peripherals.map(peripheral => `
                                    <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewPeripheralDetails(${peripheral.id})">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${peripheral.name}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${peripheral.model || '-'}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">📦 Qtd: ${peripheral.quantity || 1}</span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            Clique para detalhes
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        openModal(modalContent);
    } catch (error) {
        showToast('Erro ao carregar periféricos: ' + error.message, 'error');
    }
}

// Modal para vincular periféricos a um equipamento específico
async function openPeripheralLinkModal(equipmentId) {
    try {
        const [peripherals, linkedPeripherals] = await Promise.all([
            apiClient.getPeripherals(),
            equipmentId !== 'new' ? apiClient.getEquipmentPeripherals(equipmentId) : Promise.resolve([])
        ]);
        
        const modalContent = `
            <div class="modal-content max-w-3xl w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">Vincular Periféricos</h3>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <span class="text-2xl">&times;</span>
                    </button>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Periféricos Disponíveis -->
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-4">Periféricos Disponíveis</h4>
                            <div class="max-h-96 overflow-y-auto space-y-2" id="availablePeripheralsList">
                                Carregando...
                            </div>
                        </div>
                        
                        <!-- Periféricos Vinculados -->
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-4">Periféricos Vinculados</h4>
                            <div class="max-h-96 overflow-y-auto space-y-2">
                                ${linkedPeripherals.length > 0 ? 
                                    linkedPeripherals.map(link => `
                                        <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <div class="flex-1">
                                                <div class="font-medium">${link.name}</div>
                                                <div class="text-sm text-gray-600">${link.model || 'Sem modelo'}</div>
                                                <div class="text-xs text-green-600">Valor: R$ ${link.value}</div>
                                            </div>
                                            <button class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700" onclick="unlinkPeripheralFromEquipment('${equipmentId}', ${link.peripheral_id})">
                                                Desvincular
                                            </button>
                                        </div>
                                    `).join('') : 
                                    '<div class="text-center text-gray-500 py-8">Nenhum periférico vinculado</div>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        openModal(modalContent);
        
        // Carregar periféricos disponíveis com quantidade
        loadAvailablePeripherals(equipmentId);
    } catch (error) {
        showToast('Erro ao carregar periféricos: ' + error.message, 'error');
    }
}

// Carregar periféricos disponíveis
async function loadAvailablePeripherals(equipmentId) {
    const container = document.getElementById('availablePeripheralsList');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-4">⏳ Carregando periféricos...</div>';
    
    try {
        const peripherals = await apiClient.getPeripherals();
        
        if (peripherals.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhum periférico cadastrado</div>';
            return;
        }
        
        // Simplificar - mostrar todos os periféricos com quantidade
        container.innerHTML = peripherals.map(peripheral => `
            <div class="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                <div class="flex-1">
                    <div class="font-medium">${peripheral.name}</div>
                    <div class="text-sm text-gray-600">${peripheral.model || 'Sem modelo'}</div>
                    <div class="text-xs text-blue-600">📦 Quantidade: ${peripheral.quantity || 1}</div>
                </div>
                <button class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700" onclick="linkPeripheralToEquipment('${equipmentId}', ${peripheral.id})">
                    Vincular
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar periféricos:', error);
        container.innerHTML = '<div class="text-center text-red-500 py-4">❌ Erro ao carregar</div>';
    }
}

// Formulário de periférico
function openPeripheralForm(peripheral = null) {
    const isEdit = !!peripheral;
    const title = isEdit ? 'Editar Periférico' : 'Novo Periférico';
    
    const modalContent = `
        <div class="modal-content max-w-md w-full mx-4">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                    <span class="text-2xl">&times;</span>
                </button>
            </div>
            <form id="peripheralForm" class="p-6 space-y-4">
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Nome *</label>
                    <input type="text" id="peripheralName" required 
                           value="${peripheral ? peripheral.name : ''}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Ex: Mouse, Teclado, Carregador">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Modelo</label>
                    <input type="text" id="peripheralModel" 
                           value="${peripheral ? peripheral.model || '' : ''}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Modelo do periférico">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Quantidade *</label>
                    <input type="number" id="peripheralQuantity" required min="1" 
                           value="${peripheral ? peripheral.quantity || 1 : 1}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Quantidade disponível">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-800 mb-2">Observações</label>
                    <textarea id="peripheralObservations" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Observações sobre o periférico...">${peripheral ? peripheral.observations || '' : ''}</textarea>
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        ${isEdit ? 'Atualizar' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    const modal = openModal(modalContent);
    
    document.getElementById('peripheralForm').addEventListener('submit', (e) => {
        e.preventDefault();
        savePeripheral(peripheral, modal);
    });
}

// Toggle campo chip
function toggleChipField() {
    const isChip = document.getElementById('isChip').checked;
    const chipField = document.getElementById('chipNumberField');
    chipField.style.display = isChip ? 'block' : 'none';
    
    if (!isChip) {
        document.getElementById('chipNumber').value = '';
    }
}

// Salvar periférico
async function savePeripheral(existingPeripheral, modal) {
    const name = document.getElementById('peripheralName').value.trim();
    const model = document.getElementById('peripheralModel').value.trim();
    const quantity = parseInt(document.getElementById('peripheralQuantity').value);
    const observations = document.getElementById('peripheralObservations').value.trim();

    if (!name || !quantity || quantity < 1) {
        showToast('Nome e quantidade são obrigatórios', 'error');
        return;
    }

    try {
        const peripheralData = {
            name, 
            model, 
            quantity,
            observations
        };
        
        if (existingPeripheral) {
            await apiClient.updatePeripheral(existingPeripheral.id, peripheralData);
            showToast('Periférico atualizado com sucesso!', 'success');
        } else {
            await apiClient.createPeripheral(peripheralData);
            showToast('Periférico cadastrado com sucesso!', 'success');
        }

        closeModal(modal);
        // Recarrega modal de periféricos se estiver aberto
        const peripheralsModal = document.querySelector('.modal.active');
        if (peripheralsModal) {
            peripheralsModal.remove();
            // Reabre com dados atualizados
            setTimeout(() => openPeripheralsManagementModal(), 100);
        }
    } catch (error) {
        showToast('Erro ao salvar periférico: ' + error.message, 'error');
    }
}

// Vincular periférico ao equipamento
async function linkPeripheralToEquipment(equipmentId, peripheralId) {
    try {
        // Buscar periférico e verificar quantidade disponível
        const peripherals = await apiClient.getPeripherals();
        const peripheral = peripherals.find(p => p.id === peripheralId);
        
        if (!peripheral) {
            showToast('Periférico não encontrado', 'error');
            return;
        }
        
        // Contar quantas unidades já estão em uso
        const equipment = await apiClient.getEquipment();
        let usedCount = 0;
        
        for (const eq of equipment) {
            try {
                const links = await apiClient.getEquipmentPeripherals(eq.id);
                usedCount += links.filter(link => link.peripheral_id === peripheralId).length;
            } catch (error) {
                console.error('Erro ao contar uso:', error);
            }
        }
        
        const available = (peripheral.quantity || 1) - usedCount;
        
        if (available <= 0) {
            showToast('Não há unidades disponíveis deste periférico', 'warning');
            return;
        }
        
        const quantity = prompt(`Quantas unidades vincular? (Disponível: ${available})`, '1');
        if (quantity === null) return;
        
        const qty = parseInt(quantity) || 1;
        
        if (qty > available) {
            showToast(`Apenas ${available} unidade(s) disponível(is)`, 'error');
            return;
        }
        
        const value = prompt('Valor unitário do periférico (R$):', '0');
        if (value === null) return;
        
        const unitValue = parseFloat(value) || 0;
        
        for (let i = 0; i < qty; i++) {
            await apiClient.linkPeripheral(equipmentId, peripheralId, unitValue);
        }
        
        showToast(`${qty} unidade(s) vinculada(s) com sucesso!`, 'success');
        
        // Recarrega modal
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.remove();
            setTimeout(() => openPeripheralLinkModal(equipmentId), 100);
        }
    } catch (error) {
        showToast('Erro ao vincular periférico: ' + error.message, 'error');
    }
}

// Desvincular periférico do equipamento
async function unlinkPeripheralFromEquipment(equipmentId, peripheralId) {
    if (!confirm('Tem certeza que deseja desvincular este periférico?')) return;
    
    try {
        await apiClient.unlinkPeripheral(equipmentId, peripheralId);
        showToast('Periférico desvinculado com sucesso!', 'success');
        
        // Recarregar dados para atualizar tudo
        await loadData();
        
        // Recarrega modal
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.remove();
            setTimeout(() => openPeripheralLinkModal(equipmentId), 100);
        }
    } catch (error) {
        showToast('Erro ao desvincular periférico: ' + error.message, 'error');
    }
}

// Editar periférico
async function editPeripheral(peripheralId) {
    try {
        const peripherals = await apiClient.getPeripherals();
        const peripheral = peripherals.find(p => p.id === peripheralId);
        if (peripheral) {
            openPeripheralForm(peripheral);
        }
    } catch (error) {
        showToast('Erro ao carregar periférico: ' + error.message, 'error');
    }
}

// Funções de paginação
function renderPagination(type, currentPage, totalPages, totalItems) {
    if (totalPages <= 1) return '';
    
    let pagination = `
        <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div class="text-sm text-gray-700">
                Mostrando ${((currentPage - 1) * paginationState[type].limit) + 1} a ${Math.min(currentPage * paginationState[type].limit, totalItems)} de ${totalItems} registros
            </div>
            <div class="flex space-x-2">
    `;
    
    // Botão anterior
    pagination += `
        <button onclick="changePage('${type}', ${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}
                class="px-3 py-2 text-sm border rounded-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">
            Anterior
        </button>
    `;
    
    // Números das páginas
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        pagination += `
            <button onclick="changePage('${type}', ${i})" 
                    class="px-3 py-2 text-sm border rounded-lg ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                ${i}
            </button>
        `;
    }
    
    // Botão próximo
    pagination += `
        <button onclick="changePage('${type}', ${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}
                class="px-3 py-2 text-sm border rounded-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">
            Próximo
        </button>
    `;
    
    pagination += '</div></div>';
    return pagination;
}

function changePage(type, page) {
    if (page < 1) return;
    paginationState[type].page = page;
    
    if (type === 'employees') renderEmployees();
    else if (type === 'equipment') renderEquipment();
    else if (type === 'tickets') renderTickets();
}

// Funções de filtro
function updateEmployeeFilter(field, value) {
    paginationState.employees[field] = field === 'limit' ? parseInt(value) : value;
    paginationState.employees.page = 1;
    renderEmployees();
}

function clearEmployeeFilters() {
    paginationState.employees = { page: 1, limit: 10, search: '', status: '' };
    renderEmployees();
}

function updateEquipmentFilter(field, value) {
    paginationState.equipment[field] = field === 'limit' ? parseInt(value) : value;
    paginationState.equipment.page = 1;
    renderEquipment();
}

function clearEquipmentFilters() {
    paginationState.equipment = { page: 1, limit: 10, search: '', type: '' };
    renderEquipment();
}

async function deletePeripheral(peripheralId) {
    if (!confirm('Tem certeza que deseja excluir este periférico? Todos os vínculos com equipamentos serão removidos.')) return;
    
    try {
        // Primeiro remove todos os vínculos do periférico
        await apiClient.unlinkAllPeripheralConnections(peripheralId);
        
        // Depois exclui o periférico
        await apiClient.deletePeripheral(peripheralId);
        showToast('Periférico excluído com sucesso!', 'success');
        
        // Recarrega modal se estiver aberto
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.remove();
            setTimeout(() => openPeripheralsManagementModal(), 100);
        }
    } catch (error) {
        showToast('Erro ao excluir periférico: ' + error.message, 'error');
    }
}

function logout() { 
    if(confirm('Sair do sistema?')) location.reload(); 
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Sistema 4TIS inicializado');
    
    try {
        // Carregar dados da API
        await loadData();
        
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            const appContainer = document.getElementById('appContainer');
            
            if (loadingScreen && appContainer) {
                loadingScreen.style.display = 'none';
                appContainer.style.display = 'block';
            }
            
            renderDashboard();
            
            // Verificar atualizações
            if (window.checkForUpdates) {
                setTimeout(() => {
                    window.checkForUpdates();
                }, 1500);
            }
            
            showToast('Sistema conectado!', 'success');
        }, 1000);
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showToast('Erro ao carregar sistema: ' + error.message, 'error');
        
        // Mostrar app mesmo com erro
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            const appContainer = document.getElementById('appContainer');
            
            if (loadingScreen && appContainer) {
                loadingScreen.style.display = 'none';
                appContainer.style.display = 'block';
            }
            
            renderDashboard();
        }, 2000);
    }
});