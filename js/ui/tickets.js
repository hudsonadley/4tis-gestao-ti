// Tickets UI Module
class TicketsUI {
    static currentPage = 1;

    static render() {
        const container = document.getElementById('tickets-content');
        if (!container) return;

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Gestão de Chamados</h2>
                    <div class="flex gap-3">
                        <button class="btn btn-primary" onclick="TicketsUI.openGLPIModal()">
                            <span class="icon">📥</span> Abrir Novo Chamado (GLPI)
                        </button>
                        <button class="btn btn-secondary" onclick="TicketsUI.openInternalModal()">
                            <span class="icon">🔧</span> Novo Chamado Interno
                        </button>
                    </div>
                </div>
                
                <div class="card-content">
                    <!-- Filtros -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                            <div class="relative">
                                <input type="text" id="ticketSearch" placeholder="Buscar por ID, usuário, equipamento..." 
                                       class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <span class="text-gray-400">🔍</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status/Origem</label>
                            <select id="ticketStatusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Todos</option>
                                <option value="interno">🔧 Chamados Internos</option>
                                <option value="glpi">📥 Chamados GLPI</option>
                                <option value="">--- STATUS ---</option>
                                <option value="novo">Novo</option>
                                <option value="aguardando-validacao">Aguardando Validação</option>
                                <option value="aguardando-equipamento">Aguardando Equipamento</option>
                                <option value="atribuido-para-atendimento">Atribuído para Atendimento</option>
                                <option value="em-andamento">Em Andamento</option>
                                <option value="resolvido">Resolvido</option>
                                <option value="fechado">Fechado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Tabela de Chamados -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 10%;">ID GLPI</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 10%;">ID Interno</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 8%;">Tipo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 18%;">Criado Por</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 18%;">Para Usuário</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 20%;">Equipamento/Serviço</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 8%;">Local</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 8%;">Status</th>
                                </tr>
                            </thead>
                            <tbody id="ticketsTable" class="bg-white divide-y divide-gray-200">
                                <!-- Dados serão inseridos aqui -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Paginação -->
                    <div class="flex items-center justify-between mt-6">
                        <div class="text-sm text-gray-700">
                            Mostrando <span id="ticketShowingCount">1-10</span> de <span id="ticketTotalCount">0</span> chamados
                        </div>
                        <div class="flex space-x-2" id="ticketPagination">
                            <!-- Paginação será inserida aqui -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.renderTable();
    }

    static setupEventListeners() {
        const searchInput = document.getElementById('ticketSearch');
        const statusFilter = document.getElementById('ticketStatusFilter');

        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.currentPage = 1;
                this.renderTable();
            }, CONFIG.DEBOUNCE_DELAY));
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentPage = 1;
                this.renderTable();
            });
        }
    }

    static renderTable() {
        const tbody = document.getElementById('ticketsTable');
        if (!tbody) return;

        const searchTerm = document.getElementById('ticketSearch')?.value?.toLowerCase() || '';
        const statusFilter = document.getElementById('ticketStatusFilter')?.value || '';

        let filteredTickets = TicketManager.findAll({
            search: searchTerm,
            status: statusFilter
        });

        // Cálculos de paginação
        const totalItems = filteredTickets.length;
        const totalPages = Math.ceil(totalItems / CONFIG.ITEMS_PER_PAGE);

        // Garantir que a página atual seja válida
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        }

        // Calcular itens da página atual
        const startIndex = (this.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
        const endIndex = startIndex + CONFIG.ITEMS_PER_PAGE;
        const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

        tbody.innerHTML = paginatedTickets.map(ticket => {
            // Verificar se os colaboradores existem e estão completos
            const requestorEmployee = ticket.requestorEmployeeId ? 
                EmployeeManager.find(ticket.requestorEmployeeId) : null;
            const assignedEmployee = ticket.assignedToEmployeeId ? 
                EmployeeManager.find(ticket.assignedToEmployeeId) : null;
            
            const requestorAlert = requestorEmployee?.isPreCreated ? 
                '<span class="text-orange-500 mr-1" title="Colaborador pré-cadastrado">⚠️</span>' : '';
            const assignedAlert = assignedEmployee?.isPreCreated ? 
                '<span class="text-orange-500 mr-1" title="Colaborador pré-cadastrado">⚠️</span>' : '';
            
            // Indicador visual se o chamado está atribuído ao usuário atual
            const assignedToCurrentUser = ticket.assignedToUser === CURRENT_USER.id;
            const assignedIndicator = assignedToCurrentUser ? 
                '<span class="text-blue-600 mr-1" title="Atribuído a você">👤</span>' : '';
            
            // Indicador para chamados internos
            const internalIndicator = ticket.isInternal ? 
                '<span class="text-green-600 mr-1" title="Chamado Interno - 4TIS">🔧</span>' : '';
            
            // Classe especial para chamados internos
            const rowClass = ticket.isInternal ? 
                'hover:bg-green-50 cursor-pointer transition-colors border-l-2 border-green-400' : 
                `hover:bg-gray-50 cursor-pointer transition-colors ${assignedToCurrentUser ? 'bg-blue-50' : ''}`;
            
            return `
                <tr class="${rowClass}" onclick="TicketsUI.viewTicket('${ticket.id}')">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" onclick="event.stopPropagation()">
                        ${ticket.isInternal ? 
                            '<span class="text-green-700 font-medium">INTERNO</span>' :
                            (ticket.glpiLink ? 
                                `<a href="${ticket.glpiLink}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline">${ticket.glpiId || '-'}</a>` : 
                                (ticket.glpiId || '-')
                            )
                        }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${internalIndicator}${assignedIndicator}${ticket.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span class="status-badge ${this.getTicketTypeClass(ticket.ticketType || 'SOLICITACAO')}">
                            ${this.getTicketTypeDisplayName(ticket.ticketType || 'SOLICITACAO')}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        <div class="max-w-xs truncate" title="${ticket.requestor}">
                            ${requestorAlert}${ticket.requestor}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        <div class="max-w-xs truncate" title="${ticket.requestedForUser}">
                            ${assignedAlert}${ticket.requestedForUser}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        <div class="max-w-sm">
                            <div class="font-medium truncate" title="${ticket.equipmentType}">${ticket.equipmentType}</div>
                            <div class="text-xs text-gray-400 truncate" title="${ticket.serviceType}">${ticket.serviceType}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div class="max-w-xs truncate" title="${ticket.location}">
                            ${ticket.location}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="status-badge status-${ticket.status}">
                            ${this.getStatusDisplayName(ticket.status)}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        // Atualizar contadores e paginação
        this.updateCounters(totalItems, startIndex, endIndex);
        this.renderPagination(totalPages);
    }

    static updateCounters(totalItems, startIndex, endIndex) {
        const totalCount = document.getElementById('ticketTotalCount');
        const showingCount = document.getElementById('ticketShowingCount');
        
        if (totalCount) totalCount.textContent = totalItems;
        if (showingCount) {
            const showing = totalItems === 0 ? '0-0' : `${startIndex + 1}-${Math.min(endIndex, totalItems)}`;
            showingCount.textContent = showing;
        }
    }

    static renderPagination(totalPages) {
        const container = document.getElementById('ticketPagination');
        if (!container) return;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Botão Anterior
        if (this.currentPage > 1) {
            paginationHTML += `
                <button onclick="TicketsUI.changePage(${this.currentPage - 1})" 
                        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors">
                    ← Anterior
                </button>
            `;
        }

        // Números das páginas
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.currentPage;
            paginationHTML += `
                <button onclick="TicketsUI.changePage(${i})" 
                        class="px-3 py-2 text-sm font-medium ${isActive 
                            ? 'text-white bg-blue-600 border border-blue-600' 
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                        } rounded-lg transition-colors">
                    ${i}
                </button>
            `;
        }

        // Botão Próximo
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <button onclick="TicketsUI.changePage(${this.currentPage + 1})" 
                        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors">
                    Próximo →
                </button>
            `;
        }

        container.innerHTML = paginationHTML;
    }

    static changePage(page) {
        this.currentPage = page;
        this.renderTable();
    }

    static getStatusDisplayName(status) {
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

    static getTicketTypeDisplayName(type) {
        const typeNames = {
            'SOLICITACAO': 'Solicitação',
            'DEVOLUCAO': 'Devolução', 
            'MANUTENCAO': 'Manutenção'
        };
        return typeNames[type] || type;
    }

    static getTicketTypeClass(type) {
        const typeClasses = {
            'SOLICITACAO': 'status-novo',
            'DEVOLUCAO': 'status-aguardando-equipamento',
            'MANUTENCAO': 'status-em-progresso'
        };
        return typeClasses[type] || 'status-novo';
    }

    static viewTicket(id) {
        const ticket = TicketManager.find(id);
        if (!ticket) return;

        const modalData = [
            { label: 'ID', value: ticket.id },
            { label: 'ID GLPI', value: ticket.glpiId || 'N/A' },
            { label: 'Tipo', value: this.getTicketTypeDisplayName(ticket.ticketType || 'SOLICITACAO'), badge: true, badgeClass: this.getTicketTypeClass(ticket.ticketType || 'SOLICITACAO') },
            { label: 'Criado Por', value: ticket.requestor },
            { label: 'Para Usuário', value: ticket.requestedForUser },
            { label: 'Equipamento/Serviço', value: ticket.equipmentType },
            { label: 'Tipo de Serviço', value: ticket.serviceType },
            { label: 'Local', value: ticket.location },
            { label: 'Status', value: this.getStatusDisplayName(ticket.status), badge: true, badgeClass: `status-${ticket.status}` },
            { label: 'Justificativa', value: ticket.justification, multiline: true },
            { label: 'Observação', value: ticket.observation || 'Nenhuma observação' }
        ];

        if (ticket.isInternal) {
            modalData.splice(2, 0, { label: 'Origem', value: 'Chamado Interno - 4TIS', badge: true, badgeClass: 'status-stock' });
        }

        if (ticket.glpiLink) {
            modalData.splice(2, 0, { label: 'Link GLPI', value: `<a href="${ticket.glpiLink}" target="_blank" class="text-blue-600 hover:underline">Abrir no GLPI</a>` });
        }

        ModalsUI.openViewModal('ticket', {
            title: `Chamado: ${ticket.id}`,
            data: modalData,
            actions: [
                { label: 'Editar', action: () => this.editTicket(id), class: 'btn-primary' },
                { label: 'Excluir', action: () => this.deleteTicket(id), class: 'btn-danger' }
            ]
        });
    }

    static editTicket(id) {
        const ticket = TicketManager.find(id);
        if (!ticket) {
            ToastManager.error('Chamado não encontrado');
            return;
        }

        ModalsUI.openTicketModal(ticket);
    }

    static deleteTicket(id) {
        if (confirm('Tem certeza que deseja excluir este chamado?')) {
            if (TicketManager.delete(id)) {
                this.renderTable();
                ModalsUI.closeViewModal();
                ToastManager.success('Chamado excluído com sucesso!');
            }
        }
    }

    static openGLPIModal() {
        ModalsUI.openGLPIImportModal();
    }

    static openInternalModal() {
        ModalsUI.openInternalTicketModal();
    }
}

// Exportar para uso global
window.TicketsUI = TicketsUI;