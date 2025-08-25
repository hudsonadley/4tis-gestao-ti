const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

// GET /api/tickets - Listar todos os chamados
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/:id - Buscar chamado por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets - Criar novo chamado
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority = 'medium', 
      status = 'open', 
      assigned_to, 
      created_by, 
      external_ticket_number, 
      category 
    } = req.body;
    
    // Gerar ID único se não fornecido
    const id = req.body.id || `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(
      `INSERT INTO tickets (
        id, title, description, priority, status, assigned_to, created_by, 
        external_ticket_number, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, title, description, priority, status, assigned_to, created_by, external_ticket_number, category]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tickets/:id - Atualizar chamado
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { glpi_id, requestor, equipment_type, service_type, requested_for_user, location, status, ticket_type, justification } = req.body;
    
    const result = await pool.query(
      'UPDATE tickets SET glpi_id = $1, requestor = $2, equipment_type = $3, service_type = $4, requested_for_user = $5, location = $6, status = $7, ticket_type = $8, justification = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 RETURNING *',
      [glpi_id, requestor, equipment_type, service_type, requested_for_user, location, status, ticket_type, justification, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tickets/:id - Deletar chamado
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    res.json({ message: 'Chamado deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  return router;
};