// Sistema de Almoxarifado - JavaScript Principal

// Dados da aplicação
let appData = {
    colaboradores: [],
    equipamentos: [],
    vinculos: []
};

// Configurações de paginação
const ITEMS_PER_PAGE = {
    colaboradores: 10,
    equipamentos: 10
};

// Estado atual da aplicação
let currentState = {
    activeTab: 'colaboradores',
    colaboradoresPage: 1,
    equipamentosPage: 1,
    colaboradoresFilters: {
        search: '',
        status: '',
        itemsPerPage: 10
    },
    equipamentosFilters: {
        search: '',
        status: '',
        type: '',
        itemsPerPage: 10
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadDataFromStorage();
    setupEventListeners();
    renderCollaborators();
    
    // Dados de exemplo para desenvolvimento
    if (appData.colaboradores.length === 0) {
        loadSampleData();
    }
}

function loadSampleData() {
    // Colaboradores de exemplo
    appData.colaboradores = [
        {
            id: 'COL001',
            nome: 'João Silva',
            cargo: 'Desenvolvedor',
            email: 'joao.silva@empresa.com',
            telefone: '(11) 99999-1111',
            status: 'ativo',
            dataAdmissao: '2023-01-15'
        },
        {
            id: 'COL002',
            nome: 'Maria Santos',
            cargo: 'Analista de TI',
            email: 'maria.santos@empresa.com',
            telefone: '(11) 99999-2222',
            status: 'ativo',
            dataAdmissao: '2023-02-20'
        },
        {
            id: 'COL003',
            nome: 'Pedro Costa',
            cargo: 'Gerente de Projetos',
            email: 'pedro.costa@empresa.com',
            telefone: '(11) 99999-3333',
            status: 'inativo',
            dataAdmissao: '2022-08-10'
        }
    ];

    // Equipamentos de exemplo
    appData.equipamentos = [
        {
            id: 'EQ001',
            nome: 'Notebook Dell Inspiron',
            marca: 'Dell',
            modelo: 'Inspiron 15 3000',
            usoUnico: true,
            serial: 'DL123456789',
            patrimonio: 'PAT001',
            status: 'estoque',
            vinculadoA: null
        },
        {
            id: 'EQ002',
            nome: 'Mouse Pad',
            marca: 'Logitech',
            modelo: 'Standard',
            usoUnico: false,
            quantidade: 50,
            status: 'estoque',
            vinculadoA: null
        },
        {
            id: 'EQ003',
            nome: 'iPhone 13',
            marca: 'Apple',
            modelo: 'iPhone 13 128GB',
            usoUnico: true,
            serial: 'AP987654321',
            patrimonio: 'PAT002',
            status: 'vinculado',
            vinculadoA: 'COL001'
        }
    ];

    saveDataToStorage();
}

// Gerenciamento de dados
function saveDataToStorage() {
    localStorage.setItem('almoxarifadoData', JSON.stringify(appData));
}

function loadDataFromStorage() {
    const savedData = localStorage.getItem('almoxarifadoData');
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

// Event Listeners
function setupEventListeners() {
    // Navegação entre abas
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Filtros de colaboradores
    document.getElementById('searchCollaborators').addEventListener('input', function() {
        currentState.colaboradoresFilters.search = this.value;
        currentState.colaboradoresPage = 1;
        renderCollaborators();
    });

    document.getElementById('statusFilter').addEventListener('change', function() {
        currentState.colaboradoresFilters.status = this.value;
        currentState.colaboradoresPage = 1;
        renderCollaborators();
    });

    document.getElementById('itemsPerPageCollaborators').addEventListener('change', function() {
        currentState.colaboradoresFilters.itemsPerPage = parseInt(this.value);
        currentState.colaboradoresPage = 1;
        renderCollaborators();
    });

    // Filtros de equipamentos
    document.getElementById('searchEquipments').addEventListener('input', function() {
        currentState.equipamentosFilters.search = this.value;
        currentState.equipamentosPage = 1;
        renderEquipments();
    });

    document.getElementById('equipmentStatusFilter').addEventListener('change', function() {
        currentState.equipamentosFilters.status = this.value;
        currentState.equipamentosPage = 1;
        renderEquipments();
    });

    document.getElementById('equipmentTypeFilter').addEventListener('change', function() {
        currentState.equipamentosFilters.type = this.value;
        currentState.equipamentosPage = 1;
        renderEquipments();
    });

    document.getElementById('itemsPerPageEquipments').addEventListener('change', function() {
        currentState.equipamentosFilters.itemsPerPage = parseInt(this.value);
        currentState.equipamentosPage = 1;
        renderEquipments();
    });
}

// Navegação entre abas
function switchTab(tabName) {
    // Atualizar botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    currentState.activeTab = tabName;

    // Renderizar dados da aba ativa
    if (tabName === 'colaboradores') {
        renderCollaborators();
    } else if (tabName === 'equipamentos') {
        renderEquipments();
    }
}

// Funções de limpeza de filtros
function clearFiltersCollaborators() {
    document.getElementById('searchCollaborators').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('itemsPerPageCollaborators').value = '10';
    
    currentState.colaboradoresFilters = {
        search: '',
        status: '',
        itemsPerPage: 10
    };
    currentState.colaboradoresPage = 1;
    
    renderCollaborators();
}

function clearFiltersEquipments() {
    document.getElementById('searchEquipments').value = '';
    document.getElementById('equipmentStatusFilter').value = '';
    document.getElementById('equipmentTypeFilter').value = '';
    document.getElementById('itemsPerPageEquipments').value = '10';
    
    currentState.equipamentosFilters = {
        search: '',
        status: '',
        type: '',
        itemsPerPage: 10
    };
    currentState.equipamentosPage = 1;
    
    renderEquipments();
}

// Renderização de colaboradores
function renderCollaborators() {
    const tbody = document.getElementById('collaboratorsTableBody');
    const filters = currentState.colaboradoresFilters;
    
    // Filtrar dados
    let filteredData = appData.colaboradores.filter(colaborador => {
        const matchesSearch = !filters.search || 
            colaborador.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
            colaborador.cargo.toLowerCase().includes(filters.search.toLowerCase()) ||
            colaborador.email.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesStatus = !filters.status || colaborador.status === filters.status;
        
        return matchesSearch && matchesStatus;
    });

    // Paginação
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / filters.itemsPerPage);
    const startIndex = (currentState.colaboradoresPage - 1) * filters.itemsPerPage;
    const endIndex = startIndex + filters.itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Renderizar tabela
    if (paginatedData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <h3>Nenhum colaborador encontrado</h3>
                    <p>Tente ajustar os filtros ou cadastre um novo colaborador</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = paginatedData.map(colaborador => {
            const equipamentosVinculados = appData.equipamentos.filter(eq => eq.vinculadoA === colaborador.id);
            
            return `
                <tr onclick="openCollaboratorDetails('${colaborador.id}')">
                    <td>${colaborador.nome}</td>
                    <td>${colaborador.cargo}</td>
                    <td>${colaborador.email}</td>
                    <td><span class="status-badge status-${colaborador.status}">${colaborador.status.charAt(0).toUpperCase() + colaborador.status.slice(1)}</span></td>
                    <td>${equipamentosVinculados.length} equipamento(s)</td>
                </tr>
            `;
        }).join('');
    }

    // Renderizar paginação
    renderPagination('collaboratorsPagination', currentState.colaboradoresPage, totalPages, (page) => {
        currentState.colaboradoresPage = page;
        renderCollaborators();
    });
}

// Renderização de equipamentos
function renderEquipments() {
    const tbody = document.getElementById('equipmentsTableBody');
    const filters = currentState.equipamentosFilters;
    
    // Filtrar dados
    let filteredData = appData.equipamentos.filter(equipamento => {
        const matchesSearch = !filters.search || 
            equipamento.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
            equipamento.marca.toLowerCase().includes(filters.search.toLowerCase()) ||
            equipamento.modelo.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesStatus = !filters.status || equipamento.status === filters.status;
        
        const matchesType = !filters.type || 
            (filters.type === 'unico' && equipamento.usoUnico) ||
            (filters.type === 'multiplo' && !equipamento.usoUnico);
        
        return matchesSearch && matchesStatus && matchesType;
    });

    // Paginação
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / filters.itemsPerPage);
    const startIndex = (currentState.equipamentosPage - 1) * filters.itemsPerPage;
    const endIndex = startIndex + filters.itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Renderizar tabela
    if (paginatedData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <h3>Nenhum equipamento encontrado</h3>
                    <p>Tente ajustar os filtros ou cadastre um novo equipamento</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = paginatedData.map(equipamento => {
            let vinculadoA = 'Em Estoque';
            if (equipamento.vinculadoA) {
                const colaborador = appData.colaboradores.find(c => c.id === equipamento.vinculadoA);
                vinculadoA = colaborador ? colaborador.nome : 'Colaborador não encontrado';
            }
            
            return `
                <tr onclick="openEquipmentDetails('${equipamento.id}')">
                    <td>${equipamento.nome}</td>
                    <td>${equipamento.marca}</td>
                    <td>${equipamento.modelo}</td>
                    <td>${equipamento.usoUnico ? 'Uso Único' : 'Uso Múltiplo'}</td>
                    <td><span class="status-badge status-${equipamento.status}">${equipamento.status.charAt(0).toUpperCase() + equipamento.status.slice(1)}</span></td>
                    <td>${vinculadoA}</td>
                </tr>
            `;
        }).join('');
    }

    // Renderizar paginação
    renderPagination('equipmentsPagination', currentState.equipamentosPage, totalPages, (page) => {
        currentState.equipamentosPage = page;
        renderEquipments();
    });
}

// Renderização de paginação
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Botão anterior
    paginationHTML += `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1}, '${containerId}')">
            ← Anterior
        </button>
    `;

    // Números das páginas
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `<button onclick="changePage(${i}, '${containerId}')">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<span>...</span>`;
        }
    }

    // Botão próximo
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1}, '${containerId}')">
            Próximo →
        </button>
    `;

    container.innerHTML = paginationHTML;
}

// Função auxiliar para mudança de página
function changePage(page, containerId) {
    if (containerId === 'collaboratorsPagination') {
        currentState.colaboradoresPage = page;
        renderCollaborators();
    } else if (containerId === 'equipmentsPagination') {
        currentState.equipamentosPage = page;
        renderEquipments();
    }
}

// Modal de cadastro de colaborador
function openAddCollaboratorModal() {
    const modalHTML = `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cadastrar Novo Colaborador</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="collaboratorForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="nome">Nome *</label>
                                <input type="text" id="nome" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="cargo">Cargo *</label>
                                <input type="text" id="cargo" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="telefone">Telefone</label>
                                <input type="tel" id="telefone" class="form-control">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="dataAdmissao">Data de Admissão</label>
                                <input type="date" id="dataAdmissao" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="status">Status</label>
                                <select id="status" class="form-control">
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="saveCollaborator()">Salvar</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
}

// Modal de cadastro de equipamento
function openAddEquipmentModal() {
    const modalHTML = `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cadastrar Novo Equipamento</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="equipmentForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="nomeEquipamento">Nome do Equipamento *</label>
                                <input type="text" id="nomeEquipamento" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="marcaEquipamento">Marca *</label>
                                <input type="text" id="marcaEquipamento" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="modeloEquipamento">Modelo *</label>
                                <input type="text" id="modeloEquipamento" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <div class="checkbox-group">
                                    <input type="checkbox" id="usoUnico" onchange="toggleUsoUnico()">
                                    <label for="usoUnico">Uso Único</label>
                                </div>
                            </div>
                        </div>
                        <div id="usoUnicoFields" style="display: none;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="serial">Serial/IMEI *</label>
                                    <input type="text" id="serial" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="patrimonio">Patrimônio *</label>
                                    <input type="text" id="patrimonio" class="form-control">
                                </div>
                            </div>
                        </div>
                        <div id="usoMultiploFields">
                            <div class="form-group">
                                <label for="quantidade">Quantidade *</label>
                                <input type="number" id="quantidade" class="form-control" min="1">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="saveEquipment()">Salvar</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
}

// Toggle campos de uso único
function toggleUsoUnico() {
    const usoUnico = document.getElementById('usoUnico').checked;
    const usoUnicoFields = document.getElementById('usoUnicoFields');
    const usoMultiploFields = document.getElementById('usoMultiploFields');
    const quantidadeField = document.getElementById('quantidade');
    const serialField = document.getElementById('serial');
    const patrimonioField = document.getElementById('patrimonio');
    
    if (usoUnico) {
        usoUnicoFields.style.display = 'block';
        usoMultiploFields.style.display = 'none';
        quantidadeField.removeAttribute('required');
        serialField.setAttribute('required', 'required');
        patrimonioField.setAttribute('required', 'required');
    } else {
        usoUnicoFields.style.display = 'none';
        usoMultiploFields.style.display = 'block';
        quantidadeField.setAttribute('required', 'required');
        serialField.removeAttribute('required');
        patrimonioField.removeAttribute('required');
    }
}

// Salvar colaborador
function saveCollaborator() {
    const form = document.getElementById('collaboratorForm');
    const formData = new FormData(form);
    
    // Validação básica
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const colaborador = {
        id: 'COL' + Date.now(),
        nome: document.getElementById('nome').value,
        cargo: document.getElementById('cargo').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        dataAdmissao: document.getElementById('dataAdmissao').value,
        status: document.getElementById('status').value
    };
    
    appData.colaboradores.push(colaborador);
    saveDataToStorage();
    closeModal();
    renderCollaborators();
    
    alert('Colaborador cadastrado com sucesso!');
}

// Salvar equipamento
function saveEquipment() {
    const form = document.getElementById('equipmentForm');
    
    // Validação básica
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const usoUnico = document.getElementById('usoUnico').checked;
    
    const equipamento = {
        id: 'EQ' + Date.now(),
        nome: document.getElementById('nomeEquipamento').value,
        marca: document.getElementById('marcaEquipamento').value,
        modelo: document.getElementById('modeloEquipamento').value,
        usoUnico: usoUnico,
        status: 'estoque',
        vinculadoA: null
    };
    
    if (usoUnico) {
        equipamento.serial = document.getElementById('serial').value;
        equipamento.patrimonio = document.getElementById('patrimonio').value;
    } else {
        equipamento.quantidade = parseInt(document.getElementById('quantidade').value);
    }
    
    appData.equipamentos.push(equipamento);
    saveDataToStorage();
    closeModal();
    renderEquipments();
    
    alert('Equipamento cadastrado com sucesso!');
}

// Fechar modal
function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
}

// Placeholder para detalhes do colaborador (será implementado na próxima fase)
function openCollaboratorDetails(colaboradorId) {
    const colaborador = appData.colaboradores.find(c => c.id === colaboradorId);
    if (!colaborador) return;
    
    const equipamentosVinculados = appData.equipamentos.filter(eq => eq.vinculadoA === colaboradorId);
    
    const modalHTML = `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalhes do Colaborador</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-section">
                        <h4>Informações Básicas</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nome</label>
                                <input type="text" id="editNome" class="form-control" value="${colaborador.nome}">
                            </div>
                            <div class="form-group">
                                <label>Cargo</label>
                                <input type="text" id="editCargo" class="form-control" value="${colaborador.cargo}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="editEmail" class="form-control" value="${colaborador.email}">
                            </div>
                            <div class="form-group">
                                <label>Telefone</label>
                                <input type="tel" id="editTelefone" class="form-control" value="${colaborador.telefone || ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Data de Admissão</label>
                                <input type="date" id="editDataAdmissao" class="form-control" value="${colaborador.dataAdmissao || ''}">
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select id="editStatus" class="form-control">
                                    <option value="ativo" ${colaborador.status === 'ativo' ? 'selected' : ''}>Ativo</option>
                                    <option value="inativo" ${colaborador.status === 'inativo' ? 'selected' : ''}>Inativo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-section">
                        <h4>Equipamentos Vinculados (${equipamentosVinculados.length})</h4>
                        <button class="btn btn-primary btn-small" onclick="openLinkEquipmentModal('${colaboradorId}')">
                            ➕ Vincular Equipamento
                        </button>
                        ${equipamentosVinculados.length > 0 ? `
                            <button class="btn btn-warning btn-small" onclick="returnAllEquipments('${colaboradorId}')">
                                📦 Devolver Tudo
                            </button>
                        ` : ''}
                        
                        <div class="equipment-list">
                            ${equipamentosVinculados.length === 0 ? 
                                '<p class="empty-state">Nenhum equipamento vinculado</p>' :
                                equipamentosVinculados.map(eq => `
                                    <div class="equipment-item">
                                        <div class="equipment-info">
                                            <h5>${eq.nome}</h5>
                                            <p>${eq.marca} ${eq.modelo}</p>
                                            ${eq.usoUnico ? `<p><strong>Serial:</strong> ${eq.serial} | <strong>Patrimônio:</strong> ${eq.patrimonio}</p>` : ''}
                                        </div>
                                        <button class="btn btn-warning btn-small" onclick="returnEquipment('${eq.id}', '${colaboradorId}')">
                                            📦 Devolver
                                        </button>
                                    </div>
                                `).join('')
                            }
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                    <button class="btn btn-primary" onclick="updateCollaborator('${colaboradorId}')">Salvar Alterações</button>
                    <button class="btn btn-warning" onclick="inactivateCollaborator('${colaboradorId}')">Inativar</button>
                    <button class="btn btn-danger" onclick="deleteCollaborator('${colaboradorId}')">Excluir</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
}

// Placeholder para detalhes do equipamento (será implementado na próxima fase)
function openEquipmentDetails(equipamentoId) {
    const equipamento = appData.equipamentos.find(eq => eq.id === equipamentoId);
    if (!equipamento) return;
    
    let vinculadoInfo = 'Em Estoque';
    if (equipamento.vinculadoA) {
        const colaborador = appData.colaboradores.find(c => c.id === equipamento.vinculadoA);
        vinculadoInfo = colaborador ? colaborador.nome : 'Colaborador não encontrado';
    }
    
    const modalHTML = `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalhes do Equipamento</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-section">
                        <h4>Informações Básicas</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nome do Equipamento</label>
                                <input type="text" id="editNomeEquipamento" class="form-control" value="${equipamento.nome}">
                            </div>
                            <div class="form-group">
                                <label>Marca</label>
                                <input type="text" id="editMarcaEquipamento" class="form-control" value="${equipamento.marca}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Modelo</label>
                                <input type="text" id="editModeloEquipamento" class="form-control" value="${equipamento.modelo}">
                            </div>
                            <div class="form-group">
                                <div class="checkbox-group">
                                    <input type="checkbox" id="editUsoUnico" ${equipamento.usoUnico ? 'checked' : ''} onchange="toggleEditUsoUnico()">
                                    <label for="editUsoUnico">Uso Único</label>
                                </div>
                            </div>
                        </div>
                        
                        <div id="editUsoUnicoFields" style="display: ${equipamento.usoUnico ? 'block' : 'none'};">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Serial/IMEI</label>
                                    <input type="text" id="editSerial" class="form-control" value="${equipamento.serial || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Patrimônio</label>
                                    <input type="text" id="editPatrimonio" class="form-control" value="${equipamento.patrimonio || ''}">
                                </div>
                            </div>
                        </div>
                        
                        <div id="editUsoMultiploFields" style="display: ${!equipamento.usoUnico ? 'block' : 'none'};">
                            <div class="form-group">
                                <label>Quantidade</label>
                                <input type="number" id="editQuantidade" class="form-control" value="${equipamento.quantidade || 1}" min="1">
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-section">
                        <h4>Status e Vinculação</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Status</label>
                                <select id="editStatusEquipamento" class="form-control">
                                    <option value="estoque" ${equipamento.status === 'estoque' ? 'selected' : ''}>Em Estoque</option>
                                    <option value="vinculado" ${equipamento.status === 'vinculado' ? 'selected' : ''}>Vinculado</option>
                                    <option value="inativo" ${equipamento.status === 'inativo' ? 'selected' : ''}>Inativo</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Vinculado a</label>
                                <input type="text" class="form-control" value="${vinculadoInfo}" readonly>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                    <button class="btn btn-primary" onclick="updateEquipment('${equipamentoId}')">Salvar Alterações</button>
                    <button class="btn btn-warning" onclick="inactivateEquipment('${equipamentoId}')">Inativar</button>
                    <button class="btn btn-danger" onclick="deleteEquipment('${equipamentoId}')">Excluir</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
}


// Toggle campos de uso único na edição
function toggleEditUsoUnico() {
    const usoUnico = document.getElementById('editUsoUnico').checked;
    const usoUnicoFields = document.getElementById('editUsoUnicoFields');
    const usoMultiploFields = document.getElementById('editUsoMultiploFields');
    
    if (usoUnico) {
        usoUnicoFields.style.display = 'block';
        usoMultiploFields.style.display = 'none';
    } else {
        usoUnicoFields.style.display = 'none';
        usoMultiploFields.style.display = 'block';
    }
}

// Atualizar colaborador
function updateCollaborator(colaboradorId) {
    const colaborador = appData.colaboradores.find(c => c.id === colaboradorId);
    if (!colaborador) return;
    
    colaborador.nome = document.getElementById('editNome').value;
    colaborador.cargo = document.getElementById('editCargo').value;
    colaborador.email = document.getElementById('editEmail').value;
    colaborador.telefone = document.getElementById('editTelefone').value;
    colaborador.dataAdmissao = document.getElementById('editDataAdmissao').value;
    colaborador.status = document.getElementById('editStatus').value;
    
    saveDataToStorage();
    closeModal();
    renderCollaborators();
    
    alert('Colaborador atualizado com sucesso!');
}

// Atualizar equipamento
function updateEquipment(equipamentoId) {
    const equipamento = appData.equipamentos.find(eq => eq.id === equipamentoId);
    if (!equipamento) return;
    
    equipamento.nome = document.getElementById('editNomeEquipamento').value;
    equipamento.marca = document.getElementById('editMarcaEquipamento').value;
    equipamento.modelo = document.getElementById('editModeloEquipamento').value;
    equipamento.usoUnico = document.getElementById('editUsoUnico').checked;
    
    if (equipamento.usoUnico) {
        equipamento.serial = document.getElementById('editSerial').value;
        equipamento.patrimonio = document.getElementById('editPatrimonio').value;
        delete equipamento.quantidade;
    } else {
        equipamento.quantidade = parseInt(document.getElementById('editQuantidade').value);
        delete equipamento.serial;
        delete equipamento.patrimonio;
    }
    
    saveDataToStorage();
    closeModal();
    renderEquipments();
    
    alert('Equipamento atualizado com sucesso!');
}

// Inativar colaborador
function inactivateCollaborator(colaboradorId) {
    if (!confirm('Tem certeza que deseja inativar este colaborador? Todos os equipamentos vinculados serão devolvidos automaticamente.')) {
        return;
    }
    
    const colaborador = appData.colaboradores.find(c => c.id === colaboradorId);
    if (!colaborador) return;
    
    // Devolver todos os equipamentos
    returnAllEquipments(colaboradorId, false);
    
    // Inativar colaborador
    colaborador.status = 'inativo';
    
    saveDataToStorage();
    closeModal();
    renderCollaborators();
    
    alert('Colaborador inativado com sucesso! Todos os equipamentos foram devolvidos.');
}

// Inativar equipamento
function inactivateEquipment(equipamentoId) {
    if (!confirm('Tem certeza que deseja inativar este equipamento?')) {
        return;
    }
    
    const equipamento = appData.equipamentos.find(eq => eq.id === equipamentoId);
    if (!equipamento) return;
    
    // Se estiver vinculado, desvincular primeiro
    if (equipamento.vinculadoA) {
        equipamento.vinculadoA = null;
    }
    
    equipamento.status = 'inativo';
    
    saveDataToStorage();
    closeModal();
    renderEquipments();
    
    alert('Equipamento inativado com sucesso!');
}

// Excluir colaborador
function deleteCollaborator(colaboradorId) {
    const colaborador = appData.colaboradores.find(c => c.id === colaboradorId);
    if (!colaborador) return;
    
    const equipamentosVinculados = appData.equipamentos.filter(eq => eq.vinculadoA === colaboradorId);
    
    if (equipamentosVinculados.length > 0) {
        alert('Não é possível excluir um colaborador com equipamentos vinculados. Primeiro devolva todos os equipamentos ou inative o colaborador.');
        return;
    }
    
    if (!confirm('Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    appData.colaboradores = appData.colaboradores.filter(c => c.id !== colaboradorId);
    
    saveDataToStorage();
    closeModal();
    renderCollaborators();
    
    alert('Colaborador excluído com sucesso!');
}

// Excluir equipamento
function deleteEquipment(equipamentoId) {
    const equipamento = appData.equipamentos.find(eq => eq.id === equipamentoId);
    if (!equipamento) return;
    
    if (equipamento.vinculadoA) {
        alert('Não é possível excluir um equipamento que está vinculado a um colaborador. Primeiro devolva o equipamento.');
        return;
    }
    
    if (!confirm('Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    appData.equipamentos = appData.equipamentos.filter(eq => eq.id !== equipamentoId);
    
    saveDataToStorage();
    closeModal();
    renderEquipments();
    
    alert('Equipamento excluído com sucesso!');
}

// Modal para vincular equipamento
function openLinkEquipmentModal(colaboradorId) {
    const equipamentosDisponiveis = appData.equipamentos.filter(eq => 
        eq.status === 'estoque' && !eq.vinculadoA
    );
    
    const modalHTML = `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Vincular Equipamento</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="equipment-search">
                        <input type="text" id="equipmentSearchInput" placeholder="Buscar equipamento..." class="form-control" oninput="filterAvailableEquipments()">
                    </div>
                    
                    <div class="equipment-search-results" id="availableEquipmentsList">
                        ${equipamentosDisponiveis.length === 0 ? 
                            '<p class="empty-state">Nenhum equipamento disponível para vinculação</p>' :
                            equipamentosDisponiveis.map(eq => `
                                <div class="equipment-search-item" onclick="linkEquipmentToCollaborator('${eq.id}', '${colaboradorId}')">
                                    <h5>${eq.nome}</h5>
                                    <p>${eq.marca} ${eq.modelo}</p>
                                    ${eq.usoUnico ? `<p><strong>Serial:</strong> ${eq.serial} | <strong>Patrimônio:</strong> ${eq.patrimonio}</p>` : `<p><strong>Quantidade disponível:</strong> ${eq.quantidade}</p>`}
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
}

// Filtrar equipamentos disponíveis
function filterAvailableEquipments() {
    const searchTerm = document.getElementById('equipmentSearchInput').value.toLowerCase();
    const equipamentosDisponiveis = appData.equipamentos.filter(eq => 
        eq.status === 'estoque' && !eq.vinculadoA &&
        (eq.nome.toLowerCase().includes(searchTerm) ||
         eq.marca.toLowerCase().includes(searchTerm) ||
         eq.modelo.toLowerCase().includes(searchTerm))
    );
    
    const container = document.getElementById('availableEquipmentsList');
    
    if (equipamentosDisponiveis.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum equipamento encontrado</p>';
    } else {
        container.innerHTML = equipamentosDisponiveis.map(eq => `
            <div class="equipment-search-item" onclick="linkEquipmentToCollaborator('${eq.id}', '${currentLinkingCollaboratorId}')">
                <h5>${eq.nome}</h5>
                <p>${eq.marca} ${eq.modelo}</p>
                ${eq.usoUnico ? `<p><strong>Serial:</strong> ${eq.serial} | <strong>Patrimônio:</strong> ${eq.patrimonio}</p>` : `<p><strong>Quantidade disponível:</strong> ${eq.quantidade}</p>`}
            </div>
        `).join('');
    }
}

// Variável global para armazenar o ID do colaborador durante a vinculação
let currentLinkingCollaboratorId = null;

// Atualizar a função openLinkEquipmentModal para usar a variável global
function openLinkEquipmentModal(colaboradorId) {
    currentLinkingCollaboratorId = colaboradorId;
    
    const equipamentosDisponiveis = appData.equipamentos.filter(eq => 
        eq.status === 'estoque' && !eq.vinculadoA
    );
    
    const modalHTML = `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Vincular Equipamento</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="equipment-search">
                        <input type="text" id="equipmentSearchInput" placeholder="Buscar equipamento..." class="form-control" oninput="filterAvailableEquipments()">
                    </div>
                    
                    <div class="equipment-search-results" id="availableEquipmentsList">
                        ${equipamentosDisponiveis.length === 0 ? 
                            '<p class="empty-state">Nenhum equipamento disponível para vinculação</p>' :
                            equipamentosDisponiveis.map(eq => `
                                <div class="equipment-search-item" onclick="linkEquipmentToCollaborator('${eq.id}', '${colaboradorId}')">
                                    <h5>${eq.nome}</h5>
                                    <p>${eq.marca} ${eq.modelo}</p>
                                    ${eq.usoUnico ? `<p><strong>Serial:</strong> ${eq.serial} | <strong>Patrimônio:</strong> ${eq.patrimonio}</p>` : `<p><strong>Quantidade disponível:</strong> ${eq.quantidade}</p>`}
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
}

// Vincular equipamento ao colaborador
function linkEquipmentToCollaborator(equipamentoId, colaboradorId) {
    const equipamento = appData.equipamentos.find(eq => eq.id === equipamentoId);
    const colaborador = appData.colaboradores.find(c => c.id === colaboradorId);
    
    if (!equipamento || !colaborador) {
        alert('Erro: Equipamento ou colaborador não encontrado');
        return;
    }
    
    if (equipamento.status !== 'estoque' || equipamento.vinculadoA) {
        alert('Este equipamento não está disponível para vinculação');
        return;
    }
    
    // Para equipamentos de uso único, verificar se já está vinculado
    if (equipamento.usoUnico) {
        equipamento.vinculadoA = colaboradorId;
        equipamento.status = 'vinculado';
    } else {
        // Para equipamentos de uso múltiplo, criar uma nova instância ou decrementar quantidade
        // Por simplicidade, vamos tratar como se fosse uma unidade
        equipamento.vinculadoA = colaboradorId;
        equipamento.status = 'vinculado';
    }
    
    saveDataToStorage();
    closeModal();
    
    // Reabrir detalhes do colaborador para mostrar a atualização
    openCollaboratorDetails(colaboradorId);
    
    alert(`Equipamento "${equipamento.nome}" vinculado com sucesso ao colaborador "${colaborador.nome}"!`);
}

// Devolver equipamento individual
function returnEquipment(equipamentoId, colaboradorId) {
    if (!confirm('Tem certeza que deseja devolver este equipamento?')) {
        return;
    }
    
    const equipamento = appData.equipamentos.find(eq => eq.id === equipamentoId);
    if (!equipamento) return;
    
    equipamento.vinculadoA = null;
    equipamento.status = 'estoque';
    
    saveDataToStorage();
    
    // Reabrir detalhes do colaborador para mostrar a atualização
    openCollaboratorDetails(colaboradorId);
    
    alert('Equipamento devolvido com sucesso!');
}

// Devolver todos os equipamentos
function returnAllEquipments(colaboradorId, showConfirm = true) {
    if (showConfirm && !confirm('Tem certeza que deseja devolver todos os equipamentos deste colaborador?')) {
        return;
    }
    
    const equipamentosVinculados = appData.equipamentos.filter(eq => eq.vinculadoA === colaboradorId);
    
    equipamentosVinculados.forEach(equipamento => {
        equipamento.vinculadoA = null;
        equipamento.status = 'estoque';
    });
    
    saveDataToStorage();
    
    if (showConfirm) {
        // Reabrir detalhes do colaborador para mostrar a atualização
        openCollaboratorDetails(colaboradorId);
        alert(`${equipamentosVinculados.length} equipamento(s) devolvido(s) com sucesso!`);
    }
}

