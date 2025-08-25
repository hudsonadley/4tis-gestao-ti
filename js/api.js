// API Client para comunicação com backend
class ApiClient {
    constructor() {
        this.baseURL = window.location.origin;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/api${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Employees API
    async getEmployees() {
        return this.request('/employees');
    }

    async getEmployee(id) {
        return this.request(`/employees/${id}`);
    }

    async createEmployee(employee) {
        return this.request('/employees', {
            method: 'POST',
            body: JSON.stringify(employee)
        });
    }

    async updateEmployee(id, employee) {
        return this.request(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(employee)
        });
    }

    async deleteEmployee(id) {
        return this.request(`/employees/${id}`, {
            method: 'DELETE'
        });
    }

    // Equipment API
    async getEquipment() {
        return this.request('/equipment');
    }

    async getEquipmentItem(id) {
        return this.request(`/equipment/${id}`);
    }

    async createEquipment(equipment) {
        return this.request('/equipment', {
            method: 'POST',
            body: JSON.stringify(equipment)
        });
    }

    async updateEquipment(id, equipment) {
        return this.request(`/equipment/${id}`, {
            method: 'PUT',
            body: JSON.stringify(equipment)
        });
    }

    async deleteEquipment(id) {
        return this.request(`/equipment/${id}`, {
            method: 'DELETE'
        });
    }

    // Tickets API
    async getTickets() {
        return this.request('/tickets');
    }

    async getTicket(id) {
        return this.request(`/tickets/${id}`);
    }

    async createTicket(ticket) {
        return this.request('/tickets', {
            method: 'POST',
            body: JSON.stringify(ticket)
        });
    }

    async updateTicket(id, ticket) {
        return this.request(`/tickets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(ticket)
        });
    }

    async deleteTicket(id) {
        return this.request(`/tickets/${id}`, {
            method: 'DELETE'
        });
    }

    async getTicketsByEmployee(employeeId) {
        return this.request(`/tickets?created_by=${employeeId}`);
    }

    // Assignments API
    async getEmployeeAssignments(employeeId) {
        return this.request(`/assignments/employee/${employeeId}`);
    }

    async assignEquipment(employeeId, equipmentId, notes = '') {
        return this.request('/assignments', {
            method: 'POST',
            body: JSON.stringify({ employee_id: employeeId, equipment_id: equipmentId, notes })
        });
    }

    async returnEquipment(assignmentId, notes = '') {
        return this.request(`/assignments/${assignmentId}/return`, {
            method: 'PUT',
            body: JSON.stringify({ notes })
        });
    }

    async markEquipmentsPending(employeeId) {
        return this.request(`/assignments/employee/${employeeId}/pending`, {
            method: 'PUT'
        });
    }

    // Peripherals API
    async getPeripherals() {
        return this.request('/peripherals');
    }

    async createPeripheral(peripheral) {
        return this.request('/peripherals', {
            method: 'POST',
            body: JSON.stringify(peripheral)
        });
    }

    async updatePeripheral(id, peripheral) {
        return this.request(`/peripherals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(peripheral)
        });
    }

    async deletePeripheral(id) {
        return this.request(`/peripherals/${id}`, {
            method: 'DELETE'
        });
    }

    async getEquipmentPeripherals(equipmentId) {
        return this.request(`/peripherals/equipment/${equipmentId}`);
    }

    async linkPeripheral(equipmentId, peripheralId, value = 0) {
        return this.request(`/peripherals/equipment/${equipmentId}/link`, {
            method: 'POST',
            body: JSON.stringify({ peripheral_id: peripheralId, value })
        });
    }

    async unlinkPeripheral(equipmentId, peripheralId) {
        return this.request(`/peripherals/equipment/${equipmentId}/unlink/${peripheralId}`, {
            method: 'DELETE'
        });
    }

    async unlinkAllPeripheralConnections(peripheralId) {
        return this.request(`/peripherals/${peripheralId}/unlink-all`, {
            method: 'DELETE'
        });
    }

    // Equipment Types API
    async getEquipmentTypes() {
        return this.request('/equipment-types');
    }

    async createEquipmentType(type) {
        return this.request('/equipment-types', {
            method: 'POST',
            body: JSON.stringify(type)
        });
    }

    async updateEquipmentType(id, type) {
        return this.request(`/equipment-types/${id}`, {
            method: 'PUT',
            body: JSON.stringify(type)
        });
    }

    async deleteEquipmentType(id) {
        return this.request(`/equipment-types/${id}`, {
            method: 'DELETE'
        });
    }

    // Equipment History API
    async getEquipmentHistory(equipmentId) {
        return this.request(`/equipment/${equipmentId}/history`);
    }

    async saveReturnHistory(returnData) {
        return this.request('/equipment/return-history', {
            method: 'POST',
            body: JSON.stringify(returnData)
        });
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Instância global da API
window.apiClient = new ApiClient();