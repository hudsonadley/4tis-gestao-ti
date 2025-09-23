import { SupabaseService } from './supabase-service.js';

const supabaseService = new SupabaseService();

// Sistema de Almoxarifado - JavaScript Principal

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



// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("Iniciando a aplicação...");
        setupEventListeners();
        await switchTab(currentState.activeTab);
        console.log("Aplicação inicializada com sucesso.");
    } catch (error) {
        console.error("Erro durante a inicialização da aplicação:", error);
        alert("Ocorreu um erro ao carregar a aplicação. Verifique o console para mais detalhes.");
    }
});

function setupEventListeners() {
    // Navegação entre abas
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Botões de cadastro
    document.querySelector('[onclick="openAddCollaboratorModal()"').addEventListener('click', openAddCollaboratorModal);
    document.querySelector('[onclick="openAddEquipmentModal()"').addEventListener('click', openAddEquipmentModal);

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

    document.querySelector('[onclick="clearFiltersCollaborators()"').addEventListener('click', clearFiltersCollaborators);

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

    document.querySelector('[onclick="clearFiltersEquipments()"').addEventListener('click', clearFiltersEquipments);
}

// A função initializeApp original não é mais necessária como async top-level
// As chamadas de setupEventListeners e switchTab foram movidas para o DOMContentLoaded listener
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

// Renderização de colaboradoresasync function renderCollaborators() {
    const tbody = document.getElementById("collaboratorsTableBody");
    const filters = currentState.colaboradoresFilters;
    
    console.log("Buscando colaboradores...");
    const allColaboradores = await supabaseService.getCollaboradores();
    console.log("Colaboradores encontrados:", allColaboradores);
    const allEquipamentos = await supabaseService.getEquipamentos();boradores encontrados:", allColaboradores);
    const allEquipamentos = await supabaseService.getEquipamentos();

    // Filtrar dados
    let filteredData = allColaboradores.filter(colaborador => {
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
            const equipamentosVinculados = allEquipamentos.filter(eq => eq.vinculado_a === colaborador.id);
            
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
async function renderEquipments() {
    const tbody = document.getElementById("equipmentsTableBody");
    const filters = currentState.equipamentosFilters;
    
    const allEquipamentos = await supabaseService.getEquipamentos();
    const allColaboradores = await supabaseService.getCollaboradores();

    // Filtrar dados
    let filteredData = allEquipamentos.filter(equipamento => {
        const matchesSearch = !filters.search || 
            equipamento.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
            equipamento.marca.toLowerCase().includes(filters.search.toLowerCase()) ||
            equipamento.modelo.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesStatus = !filters.status || equipamento.status === filters.status;
        
        const matchesType = !filters.type || 
            (filters.type === "unico" && equipamento.uso_unico) ||
            (filters.type === "multiplo" && !equipamento.uso_unico);
        
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
            let vinculadoA = "Em Estoque";
            if (equipamento.vinculado_a) {
                const colaborador = allColaboradores.find(c => c.id === equipamento.vinculado_a);
                vinculadoA = colaborador ? colaborador.nome : "Colaborador não encontrado";
            }
            
            return `
                <tr onclick="openEquipmentDetails('${equipamento.id}')">
                    <td>${equipamento.nome}</td>
                    <td>${equipamento.marca}</td>
                    <td>${equipamento.modelo}</td>
                    <td>${equipamento.uso_unico ? "Uso Único" : "Uso Múltiplo"}</td>
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

async function saveCollaborator() {
    const nome = document.getElementById("nome").value;
    const cargo = document.getElementById("cargo").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const dataAdmissao = document.getElementById("dataAdmissao").value;
    const status = document.getElementById("status").value;

    if (!nome || !cargo || !email) {
        alert("Por favor, preencha todos os campos obrigatórios (Nome, Cargo, Email).");
        return;
    }

    const newCollaborator = {
        nome,
        cargo,
        email,
        telefone,
        dataAdmissao,
        status
    };

    const { data, error } = await supabaseService.createColaborador(newCollaborator);

    if (error) {
        alert(`Erro ao cadastrar colaborador: ${error.message}`);
        console.error("Erro ao cadastrar colaborador:", error);
        return;
    }

    closeModal();
    renderCollaborators();
    alert("Colaborador cadastrado com sucesso!");
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
                                    <label for="serial">Serial/IMEI</label>
                                    <input type="text" id="serial" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="patrimonio">Patrimônio</label>
                                    <input type="text" id="patrimonio" class="form-control">
                                </div>
                            </div>
                        </div>
                        <div id="usoMultiploFields" style="display: block;">
                            <div class="form-group">
                                <label for="quantidade">Quantidade</label>
                                <input type="number" id="quantidade" class="form-control" value="1" min="1">
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
    toggleUsoUnico(); // Inicializa o estado dos campos de uso único/múltiplo
}

function toggleUsoUnico() {
    const usoUnicoCheckbox = document.getElementById('usoUnico');
    const usoUnicoFields = document.getElementById('usoUnicoFields');
    const usoMultiploFields = document.getElementById('usoMultiploFields');

    if (usoUnicoCheckbox.checked) {
        usoUnicoFields.style.display = 'block';
        usoMultiploFields.style.display = 'none';
        document.getElementById('quantidade').value = '1'; // Quantidade sempre 1 para uso único
    } else {
        usoUnicoFields.style.display = 'none';
        usoMultiploFields.style.display = 'block';
    }
}

async function saveEquipment() {
    const nome = document.getElementById("nomeEquipamento").value;
    const marca = document.getElementById("marcaEquipamento").value;
    const modelo = document.getElementById("modeloEquipamento").value;
    const usoUnico = document.getElementById("usoUnico").checked;
    const serial = document.getElementById("serial").value;
    const patrimonio = document.getElementById("patrimonio").value;
    const quantidade = document.getElementById("quantidade").value;

    if (!nome || !marca || !modelo) {
        alert("Por favor, preencha todos os campos obrigatórios (Nome, Marca, Modelo).");
        return;
    }

    if (usoUnico && (!serial || !patrimonio)) {
        alert("Para equipamentos de uso único, os campos Serial/IMEI e Patrimônio são obrigatórios.");
        return;
    }

    if (!usoUnico && !quantidade) {
        alert("Para equipamentos de uso múltiplo, o campo Quantidade é obrigatório.");
        return;
    }

    const newEquipment = {
        nome,
        marca,
        modelo,
        usoUnico,
        serial,
        patrimonio,
        quantidade: usoUnico ? 1 : parseInt(quantidade)
    };

    const { data, error } = await supabaseService.createEquipamento(newEquipment);

    if (error) {
        alert(`Erro ao cadastrar equipamento: ${error.message}`);
        console.error("Erro ao cadastrar equipamento:", error);
        return;
    }

    closeModal();
    renderEquipments();
    alert("Equipamento cadastrado com sucesso!");
}

async function openCollaboratorDetails(colaboradorId) {
    const allColaboradores = await supabaseService.getCollaboradores();
    const allEquipamentos = await supabaseService.getEquipamentos();
    const colaborador = allColaboradores.find(c => c.id === colaboradorId);
    if (!colaborador) return;
    
    const equipamentosVinculados = allEquipamentos.filter(eq => eq.vinculado_a === colaboradorId);
    
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
                                <input type="date" id="editDataAdmissao" class="form-control" value="${colaborador.data_admissao || ''}">
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
                                            ${eq.uso_unico ? `<p><strong>Serial:</strong> ${eq.serial} | <strong>Patrimônio:</strong> ${eq.patrimonio}</p>` : ''}
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

async function updateCollaborator(colaboradorId) {
    const nome = document.getElementById('editNome').value;
    const cargo = document.getElementById('editCargo').value;
    const email = document.getElementById('editEmail').value;
    const telefone = document.getElementById('editTelefone').value;
    const dataAdmissao = document.getElementById('editDataAdmissao').value;
    const status = document.getElementById('editStatus').value;

    if (!nome || !cargo || !email) {
        alert("Por favor, preencha todos os campos obrigatórios (Nome, Cargo, Email).");
        return;
    }

    const updatedCollaborator = {
        nome,
        cargo,
        email,
        telefone,
        dataAdmissao,
        status
    };

    const { error } = await supabaseService.updateColaborador(colaboradorId, updatedCollaborator);

    if (error) {
        alert(`Erro ao atualizar colaborador: ${error.message}`);
        console.error("Erro ao atualizar colaborador:", error);
        return;
    }

    closeModal();
    renderCollaborators();
    alert("Colaborador atualizado com sucesso!");
}

async function deleteCollaborator(colaboradorId) {
    if (!confirm("Tem certeza que deseja excluir este colaborador? Esta ação é irreversível.")) {
        return;
    }

    const allEquipamentos = await supabaseService.getEquipamentos();
    const equipamentosVinculados = allEquipamentos.filter(eq => eq.vinculado_a === colaboradorId);

    if (equipamentosVinculados.length > 0) {
        alert("Não é possível excluir um colaborador que possui equipamentos vinculados. Por favor, desvincule todos os equipamentos primeiro.");
        return;
    }

    const { error } = await supabaseService.deleteColaborador(colaboradorId);

    if (error) {
        alert(`Erro ao excluir colaborador: ${error.message}`);
        console.error("Erro ao excluir colaborador:", error);
        return;
    }

    closeModal();
    renderCollaborators();
    alert("Colaborador excluído com sucesso!");
}

async function inactivateCollaborator(colaboradorId) {
    if (!confirm("Tem certeza que deseja inativar este colaborador? Todos os equipamentos vinculados serão devolvidos.")) {
        return;
    }

    const allEquipamentos = await supabaseService.getEquipamentos();
    const equipamentosVinculados = allEquipamentos.filter(eq => eq.vinculado_a === colaboradorId);

    for (const eq of equipamentosVinculados) {
        const { error } = await supabaseService.devolverEquipamento(eq.id);
        if (error) {
            console.error(`Erro ao devolver equipamento ${eq.nome}:`, error);
            alert(`Erro ao devolver equipamento ${eq.nome}. A inativação foi cancelada.`);
            return;
        }
    }

    const { error } = await supabaseService.updateColaborador(colaboradorId, { status: 'inativo' });

    if (error) {
        alert(`Erro ao inativar colaborador: ${error.message}`);
        console.error("Erro ao inativar colaborador:", error);
        return;
    }

    closeModal();
    renderCollaborators();
    alert("Colaborador inativado e equipamentos devolvidos com sucesso!");
}

async function openEquipmentDetails(equipamentoId) {
    const allEquipamentos = await supabaseService.getEquipamentos();
    const allColaboradores = await supabaseService.getCollaboradores();
    const equipamento = allEquipamentos.find(eq => eq.id === equipamentoId);
    if (!equipamento) return;
    
    let vinculadoInfo = 'Em Estoque';
    if (equipamento.vinculado_a) {
        const colaborador = allColaboradores.find(c => c.id === equipamento.vinculado_a);
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
                                    <input type="checkbox" id="editUsoUnico" ${equipamento.uso_unico ? 'checked' : ''} onchange="toggleEditUsoUnico()">
                                    <label for="editUsoUnico">Uso Único</label>
                                </div>
                            </div>
                        </div>
                        
                        <div id="editUsoUnicoFields" style="display: ${equipamento.uso_unico ? 'block' : 'none'};">
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
                        
                        <div id="editUsoMultiploFields" style="display: ${!equipamento.uso_unico ? 'block' : 'none'};">
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

function toggleEditUsoUnico() {
    const usoUnicoCheckbox = document.getElementById('editUsoUnico');
    const usoUnicoFields = document.getElementById('editUsoUnicoFields');
    const usoMultiploFields = document.getElementById('editUsoMultiploFields');

    if (usoUnicoCheckbox.checked) {
        usoUnicoFields.style.display = 'block';
        usoMultiploFields.style.display = 'none';
        document.getElementById('editQuantidade').value = '1'; // Quantidade sempre 1 para uso único
    } else {
        usoUnicoFields.style.display = 'none';
        usoMultiploFields.style.display = 'block';
    }
}

async function updateEquipment(equipamentoId) {
    const nome = document.getElementById('editNomeEquipamento').value;
    const marca = document.getElementById('editMarcaEquipamento').value;
    const modelo = document.getElementById('editModeloEquipamento').value;
    const usoUnico = document.getElementById('editUsoUnico').checked;
    const serial = document.getElementById('editSerial').value;
    const patrimonio = document.getElementById('editPatrimonio').value;
    const quantidade = document.getElementById('editQuantidade').value;
    const status = document.getElementById('editStatusEquipamento').value;

    if (!nome || !marca || !modelo) {
        alert("Por favor, preencha todos os campos obrigatórios (Nome, Marca, Modelo).");
        return;
    }

    if (usoUnico && (!serial || !patrimonio)) {
        alert("Para equipamentos de uso único, os campos Serial/IMEI e Patrimônio são obrigatórios.");
        return;
    }

    if (!usoUnico && !quantidade) {
        alert("Para equipamentos de uso múltiplo, o campo Quantidade é obrigatório.");
        return;
    }

    const updatedEquipment = {
        nome,
        marca,
        modelo,
        usoUnico,
        serial,
        patrimonio,
        quantidade: usoUnico ? 1 : parseInt(quantidade),
        status
    };

    const { error } = await supabaseService.updateEquipamento(equipamentoId, updatedEquipment);

    if (error) {
        alert(`Erro ao atualizar equipamento: ${error.message}`);
        console.error("Erro ao atualizar equipamento:", error);
        return;
    }

    closeModal();
    renderEquipments();
    alert("Equipamento atualizado com sucesso!");
}

async function deleteEquipment(equipamentoId) {
    if (!confirm("Tem certeza que deseja excluir este equipamento? Esta ação é irreversível.")) {
        return;
    }

    const allEquipamentos = await supabaseService.getEquipamentos();
    const equipamento = allEquipamentos.find(eq => eq.id === equipamentoId);

    if (equipamento.vinculado_a) {
        alert("Não é possível excluir um equipamento que está vinculado a um colaborador. Por favor, desvincule-o primeiro.");
        return;
    }

    const { error } = await supabaseService.deleteEquipamento(equipamentoId);

    if (error) {
        alert(`Erro ao excluir equipamento: ${error.message}`);
        console.error("Erro ao excluir equipamento:", error);
        return;
    }

    closeModal();
    renderEquipments();
    alert("Equipamento excluído com sucesso!");
}

async function openLinkEquipmentModal(colaboradorId) {
    const allEquipamentos = await supabaseService.getEquipamentos();
    const equipamentosDisponiveis = allEquipamentos.filter(eq => eq.status === 'estoque');

    const modalHTML = `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Vincular Equipamento</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="searchAvailableEquipment" class="form-control" placeholder="Buscar equipamento...">
                    <div class="equipment-selection-list">
                        ${equipamentosDisponiveis.length === 0 ? 
                            '<p class="empty-state">Nenhum equipamento disponível para vincular.</p>' :
                            equipamentosDisponiveis.map(eq => `
                                <div class="equipment-selection-item">
                                    <span>${eq.nome} (${eq.marca} ${eq.modelo})</span>
                                    <button class="btn btn-primary btn-small" onclick="linkEquipment('${eq.id}', '${colaboradorId}')">Vincular</button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modalHTML;

    document.getElementById('searchAvailableEquipment').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredEquipments = equipamentosDisponiveis.filter(eq => 
            eq.nome.toLowerCase().includes(searchTerm) ||
            eq.marca.toLowerCase().includes(searchTerm) ||
            eq.modelo.toLowerCase().includes(searchTerm)
        );
        const listContainer = document.querySelector('.equipment-selection-list');
        listContainer.innerHTML = filteredEquipments.length === 0 ? 
            '<p class="empty-state">Nenhum equipamento encontrado.</p>' :
            filteredEquipments.map(eq => `
                <div class="equipment-selection-item">
                    <span>${eq.nome} (${eq.marca} ${eq.modelo})</span>
                    <button class="btn btn-primary btn-small" onclick="linkEquipment('${eq.id}', '${colaboradorId}')">Vincular</button>
                </div>
            `).join('');
    });
}

async function linkEquipment(equipamentoId, colaboradorId) {
    const { error } = await supabaseService.vincularEquipamento(equipamentoId, colaboradorId);

    if (error) {
        alert(`Erro ao vincular equipamento: ${error.message}`);
        console.error("Erro ao vincular equipamento:", error);
        return;
    }

    closeModal();
    openCollaboratorDetails(colaboradorId); // Reabre os detalhes do colaborador para atualizar a lista
    renderEquipments();
    alert("Equipamento vinculado com sucesso!");
}

async function returnEquipment(equipamentoId, colaboradorId) {
    if (!confirm("Tem certeza que deseja devolver este equipamento?")) {
        return;
    }

    const { error } = await supabaseService.devolverEquipamento(equipamentoId);

    if (error) {
        alert(`Erro ao devolver equipamento: ${error.message}`);
        console.error("Erro ao devolver equipamento:", error);
        return;
    }

    closeModal();
    openCollaboratorDetails(colaboradorId); // Reabre os detalhes do colaborador para atualizar a lista
    renderEquipments();
    alert("Equipamento devolvido com sucesso!");
}

async function returnAllEquipments(colaboradorId) {
    if (!confirm("Tem certeza que deseja devolver TODOS os equipamentos deste colaborador?")) {
        return;
    }

    const allEquipamentos = await supabaseService.getEquipamentos();
    const equipamentosVinculados = allEquipamentos.filter(eq => eq.vinculado_a === colaboradorId);

    for (const eq of equipamentosVinculados) {
        const { error } = await supabaseService.devolverEquipamento(eq.id);
        if (error) {
            console.error(`Erro ao devolver equipamento ${eq.nome}:`, error);
            alert(`Erro ao devolver equipamento ${eq.nome}. A devolução em massa foi interrompida.`);
            return;
        }
    }

    closeModal();
    openCollaboratorDetails(colaboradorId); // Reabre os detalhes do colaborador para atualizar a lista
    renderEquipments();
    alert("Todos os equipamentos foram devolvidos com sucesso!");
}

// Funções de modal
function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
}

// Inicialização dos eventos de navegação e filtros
setupEventListeners();

// Renderiza a aba ativa ao carregar a página
switchTab(currentState.activeTab);



// Chamada direta para inicializar a aplicação (para garantir execução em ambientes como Netlify)
initializeApp();

