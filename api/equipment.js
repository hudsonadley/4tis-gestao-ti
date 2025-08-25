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

// POST /api/equipment/return-history - Salvar histórico de devolução
router.post('/return-history', async (req, res) => {
  try {
    const { equipment_id, employee_id, employee_name, return_date, return_notes, returned_by } = req.body;
    
    const result = await pool.query(
      'INSERT INTO equipment_return_history (equipment_id, employee_id, employee_name, return_date, return_notes, returned_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [equipment_id, employee_id, employee_name, return_date, return_notes, returned_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    res.status(500).json({ error: error.message });
  }
});

  return router;
};