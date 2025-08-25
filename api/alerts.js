const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET /api/alerts - Listar todos os alertas
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          a.*,
          e.name as employee_name,
          e.email as employee_email
        FROM alerts a
        LEFT JOIN employees e ON a.employee_id = e.id
        WHERE a.status = 'active'
        ORDER BY a.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/alerts/pre-registered-employees - Buscar colaboradores pré-cadastrados
  router.get('/pre-registered-employees', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM employees 
        WHERE status = 'pre-cadastro' 
        ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/alerts - Criar novo alerta
  router.post('/', async (req, res) => {
    try {
      const { 
        type, 
        title, 
        message, 
        employee_id, 
        priority = 'medium',
        status = 'active'
      } = req.body;
      
      const id = `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await pool.query(
        `INSERT INTO alerts (
          id, type, title, message, employee_id, priority, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [id, type, title, message, employee_id, priority, status]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/alerts/:id/dismiss - Marcar alerta como resolvido
  router.put('/:id/dismiss', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'UPDATE alerts SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['resolved', id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Alerta não encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/alerts/:id - Deletar alerta
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Alerta não encontrado' });
      }
      
      res.json({ message: 'Alerta deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};

