# API Endpoints

## Colaboradores

### GET /api/v1/employees
Lista todos os colaboradores ativos
- Query params:
  - status: (active|inactive)
  - page: número da página
  - limit: itens por página

### POST /api/v1/employees
Cria novo colaborador
- Body:
  ```json
  {
    "name": "string",
    "position": "string",
    "email": "string",
    "phone": "string"
  }
  ```

### PUT /api/v1/employees/:id
Atualiza colaborador existente
- Body: igual ao POST

### DELETE /api/v1/employees/:id
Inativa colaborador (soft delete)

## Equipamentos

### GET /api/v1/equipment
Lista todos os equipamentos
- Query params:
  - status: (stock|in_use|maintenance)
  - assigned_to: ID do colaborador
  - type: tipo do equipamento

### POST /api/v1/equipment
Cadastra novo equipamento
- Body:
  ```json
  {
    "name": "string",
    "type": "string",
    "brand": "string",
    "model": "string",
    "serial_number": "string",
    "value": "number"
  }
  ```

### PUT /api/v1/equipment/:id
Atualiza equipamento
- Body: igual ao POST

### POST /api/v1/equipment/:id/assign
Vincula equipamento a colaborador
- Body:
  ```json
  {
    "employee_id": "string",
    "notes": "string"
  }
  ```

## Periféricos

### GET /api/v1/peripherals
Lista todos os periféricos
- Query params:
  - in_stock: boolean
  - equipment_id: ID do equipamento

### POST /api/v1/peripherals
Cadastra novo periférico
- Body:
  ```json
  {
    "name": "string",
    "model": "string",
    "quantity": "number",
    "notes": "string"
  }
  ```

### PUT /api/v1/peripherals/:id
Atualiza periférico
- Body: igual ao POST

### POST /api/v1/peripherals/:id/assign
Vincula periférico a equipamento
- Body:
  ```json
  {
    "equipment_id": "string",
    "quantity": "number"
  }
  ```
