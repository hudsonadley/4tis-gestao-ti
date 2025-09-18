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
    
    const equipamentosVinculados = allEquipamentos.filter(eq => eq.vinculadoA === colaboradorId);
    
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

async function openEquipmentDetails(equipamentoId) {
    const allEquipamentos = await supabaseService.getEquipamentos();
    const allColaboradores = await supabaseService.getCollaboradores();
    const equipamento = allEquipamentos.find(eq => eq.id === equipamentoId);
    if (!equipamento) return;
    
    let vinculadoInfo = 'Em Estoque';
    if (equipamento.vinculadoA) {
        const colaborador = allColaboradores.find(c => c.id === equipamento.vinculadoA);
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

