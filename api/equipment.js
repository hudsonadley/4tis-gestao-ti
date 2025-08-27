const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

// GET /api/equipment - Listar todos os equipamentos com valor dos periféricos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, 
             COALESCE(SUM(ep.value), 0) as peripherals_value
      FROM equipment e
      LEFT JOIN equipment_peripherals ep ON e.id = ep.equipment_id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/equipment/:id - Buscar equipamento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/equipment - Criar novo equipamento
router.post('/', async (req, res) => {
  try {
    const { id, brand, model, name, type, serial_number, patrimony, value, status = 'in_stock', assigned_to, observations } = req.body;
    
    const result = await pool.query(
      'INSERT INTO equipment (id, brand, model, name, type, serial_number, patrimony, value, status, assigned_to, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [id, brand, model, name, type, serial_number, patrimony, value, status, assigned_to, observations]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/equipment/:id - Atualizar equipamento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, name, type, serial_number, patrimony, value, status, assigned_to, observations } = req.body;
    
    const result = await pool.query(
      'UPDATE equipment SET brand = $1, model = $2, name = $3, type = $4, serial_number = $5, patrimony = $6, value = $7, status = $8, assigned_to = $9, observations = $10, updated_at = CURRENT_TIMESTAMP WHERE id = $11 RETURNING *',
      [brand, model, name, type, serial_number, patrimony, value, status, assigned_to, observations, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/equipment/:id - Deletar equipamento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }
    
    res.json({ message: 'Equipamento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/equipment/return - Devolver equipamento individual
router.post('/return', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { equipment_id, return_notes, returned_by } = req.body;
    
    if (!equipment_id || !return_notes) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'ID do equipamento e observações são obrigatórios' });
    }
    
    // Buscar equipamento
    const equipmentResult = await client.query(
      'SELECT * FROM equipment WHERE id = $1',
      [equipment_id]
    );
    
    if (equipmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }
    
    const equipment = equipmentResult.rows[0];
    
    if (!equipment.assigned_to) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Equipamento não está atribuído a nenhum colaborador' });
    }
    
    // Buscar dados do colaborador
    const employeeResult = await client.query(
      'SELECT * FROM employees WHERE id = $1',
      [equipment.assigned_to]
    );
    
    const employee = employeeResult.rows[0];
    
    // Calcular tempo de uso
    const assignedDate = equipment.assigned_at || equipment.created_at;
    const returnDate = new Date();
    const usageDays = Math.floor((returnDate - new Date(assignedDate)) / (1000 * 60 * 60 * 24));
    
    // Atualizar status do equipamento
    await client.query(
      'UPDATE equipment SET status = $1, assigned_to = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['available', equipment_id]
    );
    
    // Registrar no histórico
    await client.query(
      `INSERT INTO equipment_return_history 
       (equipment_id, employee_id, employee_name, return_date, return_notes, returned_by, usage_days) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        equipment_id,
        equipment.assigned_to,
        employee ? employee.name : 'Colaborador não encontrado',
        returnDate,
        return_notes,
        returned_by || 'Sistema',
        usageDays
      ]
    );
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Equipamento devolvido com sucesso',
      equipment: equipment,
      employee: employee,
      usage_days: usageDays
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao devolver equipamento:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// GET /api/equipment/:id/history - Buscar histórico de devolução
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM equipment_return_history WHERE equipment_id = $1 ORDER BY return_date DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: error.message });
  }
});

  return router;
};