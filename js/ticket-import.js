/**
 * 4TIS SaaS - Módulo de Importação de Chamados
 * Sistema para captura inteligente de dados de chamados
 */

class TicketImportManager {
    constructor() {
        this.patterns = {
            // Padrões comuns para extração de dados
            ticketNumber: [
                /(?:ticket|chamado|n[úu]mero|#)\s*:?\s*(\d+)/i,
                /(?:inc|req|sr)\s*(\d+)/i,
                /#(\d+)/,
                /(\d{6,})/
            ],
            userName: [
                /(?:usu[áa]rio|user|nome|solicitante|cliente)\s*:?\s*([^\n\r|;,]+)/i,
                /(?:de|from|para|to)\s*:?\s*([^\n\r|;,<>@]+)/i,
                /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
            ],
            userEmail: [
                /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
                /(?:email|e-mail)\s*:?\s*([^\s\n\r|;,]+@[^\s\n\r|;,]+)/i
            ],
            description: [
                /(?:descri[çc][ãa]o|problema|issue|assunto|subject)\s*:?\s*([^\n\r]+(?:\n[^\n\r]+)*)/i,
                /(?:detalhes|details)\s*:?\s*([^\n\r]+(?:\n[^\n\r]+)*)/i
            ],
            priority: [
                /(?:prioridade|priority)\s*:?\s*(alta|high|m[ée]dia|medium|baixa|low|cr[íi]tica|critical)/i
            ],
            category: [
                /(?:categoria|category|tipo|type)\s*:?\s*([^\n\r|;,]+)/i
            ]
        };
        
        this.setupEventListeners();
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Event listener para o formulário de importação
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeImportForm();
        });
    }

    /**
     * Inicializa o formulário de importação
     */
    initializeImportForm() {
        // Será chamado quando a aba de tickets for carregada
        if (document.getElementById('tickets-tab')) {
            this.addImportButton();
        }
    }

    /**
     * Adiciona botão de importação na interface de tickets
     */
    addImportButton() {
        const ticketsContent = document.getElementById('tickets-content');
        if (!ticketsContent) return;

        // Verifica se o botão já existe
        if (document.getElementById('import-ticket-btn')) return;

        // Cria o botão de importação
        const importButton = document.createElement('button');
        importButton.id = 'import-ticket-btn';
        importButton.className = 'btn btn-primary mb-4';
        importButton.innerHTML = `
            <span>📋</span>
            <span>Importar Chamado</span>
        `;
        importButton.onclick = () => this.showImportModal();

        // Adiciona o botão no início do conteúdo de tickets
        ticketsContent.insertBefore(importButton, ticketsContent.firstChild);
    }

    /**
     * Exibe modal de importação
     */
    showImportModal() {
        const modal = this.createImportModal();
        document.body.appendChild(modal);
        
        // Foca no textarea
        setTimeout(() => {
            const textarea = modal.querySelector('#import-text');
            if (textarea) textarea.focus();
        }, 100);
    }

    /**
     * Cria modal de importação
     */
    createImportModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Importar Chamado</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="import-text">Cole o conteúdo do chamado aqui:</label>
                        <textarea 
                            id="import-text" 
                            class="form-control" 
                            rows="10" 
                            placeholder="Cole aqui o texto completo do chamado da outra plataforma..."
                            style="font-family: monospace; font-size: 14px;"
                        ></textarea>
                    </div>
                    
                    <div class="mt-4">
                        <h4 class="text-lg font-semibold mb-2">Dados Extraídos:</h4>
                        <div id="extracted-data" class="bg-gray-50 p-4 rounded border">
                            <p class="text-gray-500">Cole o texto acima para ver os dados extraídos automaticamente</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="ticketImportManager.processImport()">
                        Processar e Criar Chamado
                    </button>
                </div>
            </div>
        `;

        // Event listener para extração em tempo real
        const textarea = modal.querySelector('#import-text');
        textarea.addEventListener('input', (e) => {
            this.extractDataPreview(e.target.value);
        });

        return modal;
    }

    /**
     * Extrai dados em tempo real para preview
     */
    extractDataPreview(text) {
        const extractedData = this.extractTicketData(text);
        const previewDiv = document.getElementById('extracted-data');
        
        if (!previewDiv) return;

        if (!text.trim()) {
            previewDiv.innerHTML = '<p class="text-gray-500">Cole o texto acima para ver os dados extraídos automaticamente</p>';
            return;
        }

        previewDiv.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <strong>Número do Chamado:</strong>
                    <span class="${extractedData.ticketNumber ? 'text-green-600' : 'text-red-500'}">
                        ${extractedData.ticketNumber || 'Não encontrado'}
                    </span>
                </div>
                <div>
                    <strong>Usuário:</strong>
                    <span class="${extractedData.userName ? 'text-green-600' : 'text-red-500'}">
                        ${extractedData.userName || 'Não encontrado'}
                    </span>
                </div>
                <div>
                    <strong>Email:</strong>
                    <span class="${extractedData.userEmail ? 'text-green-600' : 'text-gray-500'}">
                        ${extractedData.userEmail || 'Não encontrado'}
                    </span>
                </div>
                <div>
                    <strong>Prioridade:</strong>
                    <span class="${extractedData.priority ? 'text-green-600' : 'text-gray-500'}">
                        ${extractedData.priority || 'Média (padrão)'}
                    </span>
                </div>
                <div class="md:col-span-2">
                    <strong>Descrição:</strong>
                    <div class="${extractedData.description ? 'text-green-600' : 'text-red-500'} mt-1">
                        ${extractedData.description ? 
                            `<div class="bg-white p-2 rounded border text-sm">${extractedData.description}</div>` : 
                            'Não encontrada'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Extrai dados do texto do chamado
     */
    extractTicketData(text) {
        const data = {
            ticketNumber: null,
            userName: null,
            userEmail: null,
            description: null,
            priority: 'medium',
            category: null
        };

        // Extrai número do chamado
        for (const pattern of this.patterns.ticketNumber) {
            const match = text.match(pattern);
            if (match) {
                data.ticketNumber = match[1];
                break;
            }
        }

        // Extrai nome do usuário
        for (const pattern of this.patterns.userName) {
            const match = text.match(pattern);
            if (match) {
                const name = match[1].trim();
                // Valida se parece com um nome (não é email, não tem caracteres especiais demais)
                if (name.length > 2 && !name.includes('@') && /^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
                    data.userName = name;
                    break;
                }
            }
        }

        // Extrai email
        for (const pattern of this.patterns.userEmail) {
            const match = text.match(pattern);
            if (match) {
                data.userEmail = match[1];
                break;
            }
        }

        // Extrai descrição
        for (const pattern of this.patterns.description) {
            const match = text.match(pattern);
            if (match) {
                data.description = match[1].trim();
                break;
            }
        }

        // Se não encontrou descrição específica, usa o texto todo como descrição
        if (!data.description && text.trim()) {
            // Remove linhas que parecem ser cabeçalhos ou metadados
            const lines = text.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed.length > 10 && 
                       !trimmed.match(/^(de|from|para|to|assunto|subject):/i) &&
                       !trimmed.match(/^\d{2}\/\d{2}\/\d{4}/) &&
                       !trimmed.match(/^ticket|^chamado|^inc|^req/i);
            });
            
            if (lines.length > 0) {
                data.description = lines.join('\n').trim();
            }
        }

        // Extrai prioridade
        for (const pattern of this.patterns.priority) {
            const match = text.match(pattern);
            if (match) {
                const priority = match[1].toLowerCase();
                if (priority.includes('alta') || priority.includes('high') || priority.includes('crítica') || priority.includes('critical')) {
                    data.priority = 'high';
                } else if (priority.includes('baixa') || priority.includes('low')) {
                    data.priority = 'low';
                } else {
                    data.priority = 'medium';
                }
                break;
            }
        }

        // Extrai categoria
        for (const pattern of this.patterns.category) {
            const match = text.match(pattern);
            if (match) {
                data.category = match[1].trim();
                break;
            }
        }

        return data;
    }

    /**
     * Processa a importação do chamado
     */
    async processImport() {
        const textarea = document.getElementById('import-text');
        if (!textarea) return;

        const text = textarea.value.trim();
        if (!text) {
            ToastManager.error('Por favor, cole o conteúdo do chamado');
            return;
        }

        try {
            // Extrai dados
            const extractedData = this.extractTicketData(text);
            
            // Valida dados mínimos
            if (!extractedData.userName && !extractedData.userEmail) {
                ToastManager.error('Não foi possível identificar o usuário no texto. Verifique o formato.');
                return;
            }

            // Processa colaborador
            const employee = await this.processEmployee(extractedData);
            
            // Cria chamado
            const ticket = await this.createTicket(extractedData, employee);
            
            // Fecha modal
            document.querySelector('.modal-overlay').remove();
            
            // Atualiza interface
            if (window.switchTab) {
                window.switchTab('tickets');
            }
            
            // Notifica sucesso
            ToastManager.success(`Chamado ${ticket.id} criado com sucesso!`);
            
            // Mostra alerta se colaborador foi pré-cadastrado
            if (employee.wasPreCreated) {
                ToastManager.warning(`Colaborador "${employee.name}" foi pré-cadastrado. Complete o cadastro na aba Colaboradores.`);
                
                // Cria alerta no sistema
                if (window.alertsManager) {
                    await window.alertsManager.createPreRegisteredAlert(employee);
                }
            }

        } catch (error) {
            console.error('Erro ao processar importação:', error);
            ToastManager.error('Erro ao processar chamado: ' + error.message);
        }
    }

    /**
     * Processa colaborador (cria se não existir)
     */
    async processEmployee(data) {
        try {
            // Busca colaborador existente
            const response = await fetch('/api/employees');
            const employees = await response.json();
            
            let employee = null;
            
            // Busca por email primeiro
            if (data.userEmail) {
                employee = employees.find(emp => 
                    emp.email && emp.email.toLowerCase() === data.userEmail.toLowerCase()
                );
            }
            
            // Se não encontrou por email, busca por nome
            if (!employee && data.userName) {
                employee = employees.find(emp => 
                    emp.name && emp.name.toLowerCase().includes(data.userName.toLowerCase())
                );
            }
            
            // Se não encontrou, cria novo colaborador (pré-cadastro)
            if (!employee) {
                const newEmployee = {
                    name: data.userName || 'Usuário Importado',
                    email: data.userEmail || '',
                    department: 'A definir',
                    position: 'A definir',
                    status: 'pre-cadastro',
                    phone: '',
                    admission_date: new Date().toISOString().split('T')[0]
                };
                
                const createResponse = await fetch('/api/employees', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newEmployee)
                });
                
                if (!createResponse.ok) {
                    throw new Error('Erro ao criar colaborador');
                }
                
                employee = await createResponse.json();
                employee.wasPreCreated = true;
                
                console.log('Colaborador pré-cadastrado:', employee);
            }
            
            return employee;
            
        } catch (error) {
            console.error('Erro ao processar colaborador:', error);
            throw new Error('Erro ao processar colaborador: ' + error.message);
        }
    }

    /**
     * Cria chamado no sistema
     */
    async createTicket(data, employee) {
        try {
            const ticket = {
                title: data.description ? 
                    (data.description.length > 100 ? data.description.substring(0, 100) + '...' : data.description) :
                    'Chamado importado',
                description: data.description || 'Descrição não disponível',
                priority: data.priority || 'medium',
                status: 'open',
                created_by: employee.id,
                assigned_to: null,
                external_ticket_number: data.ticketNumber || null,
                category: data.category || 'Geral'
            };
            
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticket)
            });
            
            if (!response.ok) {
                throw new Error('Erro ao criar chamado');
            }
            
            const createdTicket = await response.json();
            console.log('Chamado criado:', createdTicket);
            
            return createdTicket;
            
        } catch (error) {
            console.error('Erro ao criar chamado:', error);
            throw new Error('Erro ao criar chamado: ' + error.message);
        }
    }
}

// Inicializa o gerenciador de importação
const ticketImportManager = new TicketImportManager();

// Exporta para uso global
window.ticketImportManager = ticketImportManager;

