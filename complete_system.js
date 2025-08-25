/**
 * 4TIS - Sistema de Gestão de TI
 * Versão Monolítica v1.0.19
 * Data: 20/08/2025
 * 
 * Este arquivo contém todo o código do sistema em um único arquivo,
 * incluindo frontend, backend, API e scripts.
 */

// =============================================================================
// Configurações e Variáveis Globais
// =============================================================================

const CURRENT_VERSION = 'v1.0.19';
const API_BASE_URL = '/api/v1';

// =============================================================================
// Estilos CSS (styles.css)
// =============================================================================

const STYLES = `
/**
 * 4TIS SaaS - Estilos Principais
 * Sistema de Design Moderno e Responsivo
 */

/* Reset e Base */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    /* Cores Principais */
    --primary-color: #7c3aed;
    --primary-dark: #6d28d9;
    --primary-light: #a855f7;
    --secondary-color: #f1f5f9;
    
    /* Cores de Estado */
    --success-color: #10b981;
    --success-light: #dcfce7;
    --error-color: #ef4444;
    --error-light: #fef2f2;
    --warning-color: #f59e0b;
    --warning-light: #fef3c7;
    --warning-dark: #d97706;
    --info-color: #3b82f6;
    --info-light: #dbeafe;
    --info-dark: #2563eb;
    
    /* Cores Neutras */
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1e293b;
    --gray-900: #0f172a;
}

/* Componentes Base */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Button Variants */
.btn-primary {
    background: var(--primary-color);
    color: white;
    box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-dark);
    box-shadow: var(--shadow-md);
}

.btn-secondary {
    background: var(--gray-100);
    color: var(--gray-700);
    border: 1px solid var(--gray-300);
}

.btn-secondary:hover:not(:disabled) {
    background: var(--gray-200);
    border-color: var(--gray-400);
}

.btn-warning {
    background: var(--warning-color);
    color: white;
}

.btn-warning:hover:not(:disabled) {
    background: var(--warning-dark);
}

.btn-info {
    background: var(--info-color);
    color: white;
}

.btn-info:hover:not(:disabled) {
    background: var(--info-dark);
}

/* Forms */
.form-group {
    margin-bottom: 1rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--gray-700);
}

.form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--gray-300);
    border-radius: 0.375rem;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-light);
}

/* Table */
.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--gray-200);
}

.table th {
    background: var(--gray-50);
    font-weight: 600;
    text-align: left;
}

/* Modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
}

.modal-content {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-height: 90vh;
    overflow-y: auto;
}

/* Toast */
.toast {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    padding: 1rem;
    border-radius: 0.375rem;
    background: white;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.toast-success {
    background: var(--success-light);
    color: var(--success-color);
}

.toast-error {
    background: var(--error-light);
    color: var(--error-color);
}

.toast-warning {
    background: var(--warning-light);
    color: var(--warning-color);
}

.toast-info {
    background: var(--info-light);
    color: var(--info-color);
}
`;

// =============================================================================
// Backend: Configuração do Banco de Dados (config/database.js)
// =============================================================================

const DATABASE_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || '4tis',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// =============================================================================
// Backend: Endpoints da API
// =============================================================================

/**
 * API de Colaboradores
 */
class EmployeesAPI {
    static async getAll(req, res) {
        try {
            const { status, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            
            let query = 'SELECT * FROM employees';
            if (status) {
                query += ' WHERE status = $1';
            }
            query += ' ORDER BY name LIMIT $2 OFFSET $3';
            
            const result = await db.query(query, [status, limit, offset]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { name, position, email, phone } = req.body;
            const result = await db.query(
                'INSERT INTO employees (id, name, position, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [Utils.generateId('EMP'), name, position, email, phone]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, position, email, phone, status } = req.body;
            const result = await db.query(
                'UPDATE employees SET name=$1, position=$2, email=$3, phone=$4, status=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
                [name, position, email, phone, status, id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            await db.query('UPDATE employees SET status=$1 WHERE id=$2', ['inactive', id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

/**
 * API de Equipamentos
 */
class EquipmentAPI {
    static async getAll(req, res) {
        try {
            const { status, assigned_to, type } = req.query;
            let query = 'SELECT * FROM equipment WHERE 1=1';
            const params = [];
            
            if (status) {
                params.push(status);
                query += ` AND status = $${params.length}`;
            }
            if (assigned_to) {
                params.push(assigned_to);
                query += ` AND assigned_to = $${params.length}`;
            }
            if (type) {
                params.push(type);
                query += ` AND type = $${params.length}`;
            }
            
            const result = await db.query(query, params);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { name, type, brand, model, serial_number, value } = req.body;
            const result = await db.query(
                'INSERT INTO equipment (id, name, type, brand, model, serial_number, value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [Utils.generateId('EQP'), name, type, brand, model, serial_number, value]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, type, brand, model, serial_number, value, status, assigned_to } = req.body;
            const result = await db.query(
                'UPDATE equipment SET name=$1, type=$2, brand=$3, model=$4, serial_number=$5, value=$6, status=$7, assigned_to=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
                [name, type, brand, model, serial_number, value, status, assigned_to, id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async assign(req, res) {
        try {
            const { id } = req.params;
            const { employee_id, notes } = req.body;
            const result = await db.query(
                'UPDATE equipment SET assigned_to=$1, status=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
                [employee_id, 'in_use', id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

/**
 * API de Periféricos
 */
class PeripheralsAPI {
    static async getAll(req, res) {
        try {
            const { in_stock, equipment_id } = req.query;
            let query = 'SELECT * FROM peripherals WHERE 1=1';
            const params = [];
            
            if (in_stock === 'true') {
                query += ' AND quantity > quantity_in_use';
            }
            if (equipment_id) {
                params.push(equipment_id);
                query += ` AND id IN (SELECT peripheral_id FROM peripheral_assignments WHERE equipment_id = $${params.length})`;
            }
            
            const result = await db.query(query, params);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { name, model, quantity, notes } = req.body;
            const result = await db.query(
                'INSERT INTO peripherals (id, name, model, quantity, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [Utils.generateId('PER'), name, model, quantity, notes]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, model, quantity, notes } = req.body;
            const result = await db.query(
                'UPDATE peripherals SET name=$1, model=$2, quantity=$3, notes=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
                [name, model, quantity, notes, id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async assign(req, res) {
        try {
            const { id } = req.params;
            const { equipment_id, quantity } = req.body;
            
            // Verifica disponibilidade
            const peripheral = await db.query('SELECT * FROM peripherals WHERE id = $1', [id]);
            if (peripheral.rows[0].quantity_in_use + quantity > peripheral.rows[0].quantity) {
                return res.status(400).json({ error: 'Quantidade indisponível' });
            }
            
            // Cria vinculação
            await db.query(
                'INSERT INTO peripheral_assignments (peripheral_id, equipment_id, quantity) VALUES ($1, $2, $3)',
                [id, equipment_id, quantity]
            );
            
            // Atualiza quantidade em uso
            await db.query(
                'UPDATE peripherals SET quantity_in_use = quantity_in_use + $1 WHERE id = $2',
                [quantity, id]
            );
            
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

// =============================================================================
// Frontend: Interface de Usuário
// =============================================================================

/**
 * UI de Colaboradores
 */
class EmployeesUI {
    static currentPage = 1;
    static itemsPerPage = 10;
    static filters = { status: '' };

    static async init() {
        await this.loadEmployees();
        this.setupEventListeners();
    }

    static async loadEmployees() {
        try {
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                limit: this.itemsPerPage,
                ...this.filters
            });
            
            const response = await apiClient.get(`/employees?${queryParams}`);
            this.renderEmployees(response);
        } catch (error) {
            ToastManager.error('Erro ao carregar colaboradores');
        }
    }

    static renderEmployees(employees) {
        const container = document.getElementById('employeesList');
        container.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.name}</td>
                <td>${emp.position}</td>
                <td>${emp.email || '-'}</td>
                <td>
                    <span class="status-badge ${emp.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${emp.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary" onclick="EmployeesUI.viewEmployee('${emp.id}')">Ver</button>
                    <button class="btn btn-primary" onclick="EmployeesUI.editEmployee('${emp.id}')">Editar</button>
                </td>
            </tr>
        `).join('');
    }

    static async handleInactivation(employee, equipments) {
        if (!equipments || !Array.isArray(equipments)) return [];
        
        const returnDate = new Date().toISOString();
        const notReturnedEquipments = [];
        
        // Processar cada equipamento
        for (const eq of equipments) {
            const isReturned = document.getElementById(`eq_${eq.id}`).checked;
            const observation = document.getElementById(`obs_${eq.id}`)?.value;
            
            // Validar observação apenas para equipamentos que estão sendo devolvidos
            if (isReturned && (!observation || observation.trim() === '')) {
                ToastManager.error(`Por favor, preencha a observação sobre o estado do equipamento ${eq.name}`);
                return null;
            }
            
            // Atualizar histórico do equipamento
            if (!eq.returnHistory) eq.returnHistory = [];
            
            try {
                if (isReturned) {
                    // Atualizar equipamento devolvido
                    await ApiClient.put(`/equipment/${eq.id}`, {
                        status: 'stock',
                        assigned_to: null,
                        return_history: [...eq.returnHistory, {
                            date: returnDate,
                            type: 'devolvido',
                            employeeId: employee.id,
                            employeeName: employee.name,
                            reason: 'Devolução por inativação do colaborador',
                            observation: observation || ''
                        }]
                    });
                } else {
                    // Manter equipamento vinculado e registrar como não devolvido
                    eq.returnHistory.push({
                        date: returnDate,
                        type: 'não_devolvido',
                        employeeId: employee.id,
                        employeeName: employee.name,
                        reason: 'Equipamento não devolvido na inativação do colaborador'
                    });
                    notReturnedEquipments.push(eq);
                    
                    // Atualizar apenas o histórico sem mudar vínculo
                    await ApiClient.put(`/equipment/${eq.id}`, {
                        return_history: eq.returnHistory
                    });
                }
            } catch (error) {
                console.error('Erro ao processar equipamento:', error);
                ToastManager.error(`Erro ao processar equipamento ${eq.name}`);
                return null;
            }
        }

        // Mostra changelog
        ChangelogManager.show({
            version: "1.0.18",
            title: "Inativação de Colaborador",
            changes: [
                "Adicionado sistema de devolução de equipamentos",
                "Implementado histórico de devoluções",
                "Adicionado suporte a observações no estado dos equipamentos",
                "Novo sistema de notificação para RH",
                "Melhorias na gestão de pendências"
            ]
        });

        return notReturnedEquipments;
    }

    static async resolverPendencia(equipmentId) {
        try {
            const returnDate = new Date().toISOString();
            const observation = document.getElementById(`obs_${equipmentId}`)?.value;

            if (!observation || observation.trim() === '') {
                ToastManager.error('Por favor, preencha a observação sobre o estado do equipamento');
                return;
            }

            // Buscar dados do equipamento
            const equipment = await ApiClient.get(`/equipment/${equipmentId}`);
            
            // Atualizar o equipamento
            await ApiClient.put(`/equipment/${equipmentId}`, {
                status: 'stock',
                assigned_to: null,
                return_history: [...(equipment.return_history || []), {
                    date: returnDate,
                    type: 'devolvido',
                    reason: 'Devolução posterior à inativação do colaborador',
                    observation: observation
                }]
            });

            ToastManager.success('Pendência resolvida com sucesso!');
            this.closeModal('viewEmployeeModal');
            await this.loadEmployees();
            
            // Exibe o changelog após a atualização
            ChangelogManager.show({
                version: CURRENT_VERSION,
                date: '20/08/2025',
                title: "Atualização do Sistema",
                changes: [
                    "Corrigido método resolverPendencia para usar chamadas REST diretas",
                    "Melhorada a gestão de estado dos equipamentos",
                    "Adicionado suporte a observações detalhadas",
                    "Otimizado o processo de devolução de equipamentos",
                    "Implementada validação robusta de dados"
                ]
            });
        } catch (error) {
            console.error('Erro ao resolver pendência:', error);
            ToastManager.error('Erro ao resolver pendência. Tente novamente.');
        }
    }

    static generateRhMessage(employee, equipments) {
        const today = new Date().toLocaleDateString('pt-BR');
        let msg = `[${today}] Inativação do colaborador ${employee.name}\n\n`;
        
        const notReturnedEquipments = equipments.filter(eq => !eq.returned);
        
        if (notReturnedEquipments.length > 0) {
            msg += "Equipamentos não devolvidos:\n";
            notReturnedEquipments.forEach(eq => {
                msg += `- ${eq.name} (${eq.id})\n`;
            });
            msg += "\nPor favor, acompanhar a devolução destes equipamentos.";
        } else {
            msg += "Todos os equipamentos foram devidamente devolvidos.";
        }

        return msg;
    }

    static async copyRhMessage(employee) {
        try {
            const equipments = window.appState.equipment.filter(eq => eq.assignedTo === employee.id);
            const msg = this.generateRhMessage(employee, equipments);
            await navigator.clipboard.writeText(msg);
            ToastManager.success('Mensagem copiada para a área de transferência!');
        } catch (error) {
            console.error('Erro ao copiar mensagem:', error);
            ToastManager.error('Erro ao copiar mensagem para área de transferência');
        }
    }
}

/**
 * UI de Equipamentos
 */
class EquipmentUI {
    static async init() {
        await this.loadEquipment();
        this.setupEventListeners();
    }

    static async loadEquipment() {
        try {
            const response = await apiClient.get('/equipment');
            this.renderEquipment(response);
        } catch (error) {
            ToastManager.error('Erro ao carregar equipamentos');
        }
    }

    static renderEquipment(equipment) {
        const container = document.getElementById('equipmentList');
        container.innerHTML = equipment.map(eq => `
            <tr>
                <td>${eq.name}</td>
                <td>${eq.type}</td>
                <td>${eq.brand || '-'}</td>
                <td>R$ ${eq.value?.toFixed(2) || '0.00'}</td>
                <td>
                    <span class="status-badge status-${eq.status}">
                        ${this.getStatusLabel(eq.status)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary" onclick="EquipmentUI.viewEquipment('${eq.id}')">Ver</button>
                    <button class="btn btn-primary" onclick="EquipmentUI.editEquipment('${eq.id}')">Editar</button>
                </td>
            </tr>
        `).join('');
    }

    static getStatusLabel(status) {
        const labels = {
            'stock': 'Disponível',
            'in_use': 'Em Uso',
            'maintenance': 'Manutenção',
            'disposed': 'Descartado'
        };
        return labels[status] || status;
    }
}

/**
 * UI de Periféricos
 */
class PeripheralsUI {
    static async init() {
        await this.loadPeripherals();
        this.setupEventListeners();
    }

    static async loadPeripherals() {
        try {
            const response = await apiClient.get('/peripherals');
            this.renderPeripherals(response);
        } catch (error) {
            ToastManager.error('Erro ao carregar periféricos');
        }
    }

    static renderPeripherals(peripherals) {
        const container = document.getElementById('peripheralsList');
        container.innerHTML = peripherals.map(per => `
            <tr>
                <td>${per.name}</td>
                <td>${per.model || '-'}</td>
                <td>${per.quantity}</td>
                <td>${per.quantity_in_use}</td>
                <td>${per.quantity - per.quantity_in_use}</td>
                <td>
                    <button class="btn btn-secondary" onclick="PeripheralsUI.viewPeripheral('${per.id}')">Ver</button>
                    <button class="btn btn-primary" onclick="PeripheralsUI.editPeripheral('${per.id}')">Editar</button>
                </td>
            </tr>
        `).join('');
    }
}

// =============================================================================
// Utilitários e Gerenciadores
// =============================================================================

/**
 * Gerenciador de Estado
 */
class StorageManager {
    static KEY = '4tis_state';

    static save(state) {
        localStorage.setItem(this.KEY, JSON.stringify(state));
    }

    static load() {
        const data = localStorage.getItem(this.KEY);
        return data ? JSON.parse(data) : null;
    }

    static clear() {
        localStorage.removeItem(this.KEY);
    }
}

/**
 * Gerenciador de Toast
 */
class ToastManager {
    static show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }

    static info(message) {
        this.show(message, 'info');
    }
}

/**
 * Cliente API
 */
class ApiClient {
    static async request(method, endpoint, data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static get(endpoint) {
        return this.request('GET', endpoint);
    }

    static post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }

    static put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    }

    static delete(endpoint) {
        return this.request('DELETE', endpoint);
    }
}

/**
 * Utilitários
 */
class Utils {
    static generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    }

    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}

// =============================================================================
// Inicialização do Sistema
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Injeta estilos
    const styleSheet = document.createElement('style');
    styleSheet.textContent = STYLES;
    document.head.appendChild(styleSheet);

    // Inicializa módulos
    EmployeesUI.init();
    EquipmentUI.init();
    PeripheralsUI.init();

    // Verifica atualizações
    setTimeout(checkForUpdates, 2000);
});
