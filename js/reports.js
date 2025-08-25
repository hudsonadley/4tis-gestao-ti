// Sistema de relatórios e exportação
class ReportManager {
    static generateEmployeeReport() {
        const employees = EmployeeManager.findAll();
        const activeCount = employees.filter(emp => emp.status === 'active').length;
        const inactiveCount = employees.filter(emp => emp.status === 'inactive').length;
        const incompleteCount = employees.filter(emp => emp.isPreCreated).length;

        return {
            title: 'Relatório de Colaboradores',
            summary: {
                total: employees.length,
                active: activeCount,
                inactive: inactiveCount,
                incomplete: incompleteCount
            },
            data: employees.map(emp => ({
                ID: emp.id,
                Nome: emp.name,
                Cargo: emp.position,
                Email: emp.email,
                Telefone: emp.phone,
                Status: emp.status === 'active' ? 'Ativo' : 'Inativo',
                Equipamentos: emp.equipment?.length || 0,
                'Criado em': Utils.formatDate(emp.createdAt),
                'Incompleto': emp.isPreCreated ? 'Sim' : 'Não'
            }))
        };
    }

    static generateEquipmentReport() {
        const equipment = EquipmentManager.findAll();
        const inUseCount = equipment.filter(eq => eq.status === 'in-use').length;
        const stockCount = equipment.filter(eq => eq.status === 'stock').length;
        const maintenanceCount = equipment.filter(eq => eq.status === 'maintenance').length;
        const totalValue = EquipmentManager.getTotalValue();

        return {
            title: 'Relatório de Equipamentos',
            summary: {
                total: equipment.length,
                inUse: inUseCount,
                stock: stockCount,
                maintenance: maintenanceCount,
                totalValue: Utils.formatCurrency(totalValue)
            },
            data: equipment.map(eq => ({
                ID: eq.id,
                Marca: eq.brand,
                Modelo: eq.model,
                Tipo: eq.type,
                'Número de Série': eq.series,
                Patrimônio: eq.patrimony,
                Valor: Utils.formatCurrency(eq.value),
                Status: this.getEquipmentStatusText(eq.status),
                'Atribuído a': eq.assignedTo ? EmployeeManager.find(eq.assignedTo)?.name || 'N/A' : 'Não atribuído',
                'Criado em': Utils.formatDate(eq.createdAt),
                Observação: eq.observation
            }))
        };
    }

    static generateTicketReport() {
        const tickets = TicketManager.findAll();
        const stats = TicketManager.getStats();

        return {
            title: 'Relatório de Chamados',
            summary: {
                total: stats.total,
                open: stats.open,
                resolved: stats.resolved,
                closed: stats.closed,
                internal: stats.internal,
                glpi: stats.glpi
            },
            data: tickets.map(ticket => ({
                'ID Interno': ticket.id,
                'ID GLPI': ticket.glpiId || 'N/A',
                Tipo: this.getTicketTypeText(ticket.ticketType),
                'Criado Por': ticket.requestor,
                'Para Usuário': ticket.requestedForUser,
                'Equipamento/Serviço': ticket.equipmentType,
                'Tipo de Serviço': ticket.serviceType,
                Local: ticket.location,
                Status: this.getTicketStatusText(ticket.status),
                Prioridade: this.getPriorityText(ticket.priority),
                'Criado em': ticket.createdAt,
                'É Interno': ticket.isInternal ? 'Sim' : 'Não',
                Justificativa: ticket.justification,
                Observação: ticket.observation || 'N/A'
            }))
        };
    }

    static generateHistoryReport() {
        const history = storageManager.getHistory(500);

        return {
            title: 'Relatório de Histórico de Ações',
            summary: {
                total: history.length,
                creates: history.filter(h => h.action === 'CREATE').length,
                updates: history.filter(h => h.action === 'UPDATE').length,
                deletes: history.filter(h => h.action === 'DELETE').length
            },
            data: history.map(entry => ({
                ID: entry.id,
                Ação: entry.action,
                Tipo: entry.type,
                'ID do Item': entry.itemId || 'N/A',
                Descrição: entry.description,
                Usuário: entry.user,
                'Data/Hora': Utils.formatDate(entry.timestamp)
            }))
        };
    }

    static exportToCSV(reportData) {
        try {
            const headers = Object.keys(reportData.data[0] || {});
            const csvContent = [
                `# ${reportData.title}`,
                `# Gerado em: ${new Date().toLocaleString('pt-BR')}`,
                `# Total de registros: ${reportData.data.length}`,
                '',
                headers.join(','),
                ...reportData.data.map(row => 
                    headers.map(header => {
                        const value = row[header] || '';
                        // Escapar aspas e quebras de linha
                        return `"${String(value).replace(/"/g, '""')}"`;
                    }).join(',')
                )
            ].join('\n');

            this.downloadFile(csvContent, `${reportData.title.toLowerCase().replace(/\s+/g, '-')}.csv`, 'text/csv');
            ToastManager.success('Relatório CSV exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            ToastManager.error('Erro ao exportar relatório CSV');
        }
    }

    static exportToJSON(reportData) {
        try {
            const jsonContent = JSON.stringify({
                ...reportData,
                generatedAt: new Date().toISOString(),
                generatedBy: CURRENT_USER.name
            }, null, 2);

            this.downloadFile(jsonContent, `${reportData.title.toLowerCase().replace(/\s+/g, '-')}.json`, 'application/json');
            ToastManager.success('Relatório JSON exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar JSON:', error);
            ToastManager.error('Erro ao exportar relatório JSON');
        }
    }

    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    static showReportModal() {
        const modalHTML = `
            <div class="modal active" id="reportModal">
                <div class="modal-content modal-large max-w-2xl w-full mx-4">
                    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">📊 Relatórios do Sistema</h3>
                        <button onclick="closeReportModal()" class="text-gray-400 hover:text-gray-600">
                            <span class="text-2xl">&times;</span>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 class="font-medium text-blue-900 mb-2">👥 Colaboradores</h4>
                                <p class="text-sm text-blue-700 mb-3">Relatório completo de todos os colaboradores</p>
                                <div class="flex gap-2">
                                    <button class="btn btn-primary btn-sm" onclick="ReportManager.exportReport('employees', 'csv')">
                                        📄 CSV
                                    </button>
                                    <button class="btn btn-secondary btn-sm" onclick="ReportManager.exportReport('employees', 'json')">
                                        📋 JSON
                                    </button>
                                </div>
                            </div>
                            
                            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 class="font-medium text-green-900 mb-2">💻 Equipamentos</h4>
                                <p class="text-sm text-green-700 mb-3">Relatório de inventário de equipamentos</p>
                                <div class="flex gap-2">
                                    <button class="btn btn-primary btn-sm" onclick="ReportManager.exportReport('equipment', 'csv')">
                                        📄 CSV
                                    </button>
                                    <button class="btn btn-secondary btn-sm" onclick="ReportManager.exportReport('equipment', 'json')">
                                        📋 JSON
                                    </button>
                                </div>
                            </div>
                            
                            <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 class="font-medium text-purple-900 mb-2">🎫 Chamados</h4>
                                <p class="text-sm text-purple-700 mb-3">Relatório de todos os chamados</p>
                                <div class="flex gap-2">
                                    <button class="btn btn-primary btn-sm" onclick="ReportManager.exportReport('tickets', 'csv')">
                                        📄 CSV
                                    </button>
                                    <button class="btn btn-secondary btn-sm" onclick="ReportManager.exportReport('tickets', 'json')">
                                        📋 JSON
                                    </button>
                                </div>
                            </div>
                            
                            <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <h4 class="font-medium text-orange-900 mb-2">📈 Histórico</h4>
                                <p class="text-sm text-orange-700 mb-3">Log de todas as ações do sistema</p>
                                <div class="flex gap-2">
                                    <button class="btn btn-primary btn-sm" onclick="ReportManager.exportReport('history', 'csv')">
                                        📄 CSV
                                    </button>
                                    <button class="btn btn-secondary btn-sm" onclick="ReportManager.exportReport('history', 'json')">
                                        📋 JSON
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="border-t pt-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-medium text-gray-900 mb-2">📋 Relatório Completo</h4>
                                <p class="text-sm text-gray-600 mb-3">Exportar todos os dados do sistema em um único arquivo</p>
                                <button class="btn btn-warning" onclick="ReportManager.exportCompleteReport()">
                                    📦 Exportar Relatório Completo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    static exportReport(type, format) {
        let reportData;
        
        switch (type) {
            case 'employees':
                reportData = this.generateEmployeeReport();
                break;
            case 'equipment':
                reportData = this.generateEquipmentReport();
                break;
            case 'tickets':
                reportData = this.generateTicketReport();
                break;
            case 'history':
                reportData = this.generateHistoryReport();
                break;
            default:
                ToastManager.error('Tipo de relatório inválido');
                return;
        }

        if (format === 'csv') {
            this.exportToCSV(reportData);
        } else if (format === 'json') {
            this.exportToJSON(reportData);
        }
    }

    static exportCompleteReport() {
        try {
            const completeReport = {
                title: 'Relatório Completo do Sistema 4TIS',
                generatedAt: new Date().toISOString(),
                generatedBy: CURRENT_USER.name,
                version: CONFIG.VERSION,
                employees: this.generateEmployeeReport(),
                equipment: this.generateEquipmentReport(),
                tickets: this.generateTicketReport(),
                history: this.generateHistoryReport()
            };

            this.exportToJSON(completeReport);
        } catch (error) {
            console.error('Erro ao gerar relatório completo:', error);
            ToastManager.error('Erro ao gerar relatório completo');
        }
    }

    // Métodos auxiliares para formatação
    static getEquipmentStatusText(status) {
        const statusMap = {
            'stock': 'Em Estoque',
            'in-use': 'Em Uso',
            'maintenance': 'Manutenção'
        };
        return statusMap[status] || status;
    }

    static getTicketStatusText(status) {
        const statusMap = {
            'novo': 'Novo',
            'aguardando-validacao': 'Aguardando Validação',
            'aguardando-equipamento': 'Aguardando Equipamento',
            'atribuido-para-atendimento': 'Atribuído para Atendimento',
            'em-andamento': 'Em Andamento',
            'resolvido': 'Resolvido',
            'fechado': 'Fechado',
            'cancelado': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    static getTicketTypeText(type) {
        const typeMap = {
            'SOLICITACAO': 'Solicitação',
            'DEVOLUCAO': 'Devolução',
            'MANUTENCAO': 'Manutenção'
        };
        return typeMap[type] || type;
    }

    static getPriorityText(priority) {
        const priorityMap = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta',
            'critica': 'Crítica'
        };
        return priorityMap[priority] || priority;
    }
}

// Função global para fechar modal de relatórios
window.closeReportModal = function() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.remove();
    }
};