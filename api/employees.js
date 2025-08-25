const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

// GET /api/employees - Listar todos os colaboradores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/employees/:id - Buscar colaborador por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/employees - Criar novo colaborador
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      position, 
      email, 
      phone, 
      department, 
      admission_date, 
      status = 'active' 
    } = req.body;
    
    // Gerar ID único se não fornecido
    const id = req.body.id || `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(
      `INSERT INTO employees (
        id, name, position, email, phone, department, admission_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, name, position, email, phone, department, admission_date, status]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employees/:id - Atualizar colaborador
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, email, phone, status } = req.body;
    
    const result = await pool.query(
      'UPDATE employees SET name = $1, position = $2, email = $3, phone = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, position, email, phone, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/employees/:id - Deletar colaborador
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    
    res.json({ message: 'Colaborador deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  return router;
};