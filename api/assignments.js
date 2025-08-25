const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET /api/assignments/employee/:id - Equipamentos do colaborador
  router.get('/employee/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT ea.*, e.name, e.type, e.brand, e.model, e.serial_number, e.value
        FROM equipment_assignments ea
        JOIN equipment e ON ea.equipment_id = e.id
        WHERE ea.employee_id = $1
        ORDER BY ea.assigned_at DESC
      `, [id]);
      
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/assignments - Vincular equipamento
  router.post('/', async (req, res) => {
    try {
      const { employee_id, equipment_id, notes } = req.body;
      
      // Verifica se equipamento está disponível
      const equipCheck = await pool.query(
        'SELECT status FROM equipment WHERE id = $1', 
        [equipment_id]
      );
      
      if (equipCheck.rows[0]?.status !== 'available') {
        return res.status(400).json({ error: 'Equipamento não disponível' });
      }
      
      // Cria vínculo
      const result = await pool.query(`
        INSERT INTO equipment_assignments (employee_id, equipment_id, notes)
        VALUES ($1, $2, $3) RETURNING *
      `, [employee_id, equipment_id, notes]);
      
      // Atualiza status do equipamento
      await pool.query(
        'UPDATE equipment SET status = $1, assigned_to = $2 WHERE id = $3',
        ['in-use', employee_id, equipment_id]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/assignments/:id/return - Devolver equipamento
  router.put('/:id/return', async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      const result = await pool.query(`
        UPDATE equipment_assignments 
        SET status = 'returned', returned_at = CURRENT_TIMESTAMP, notes = $1
        WHERE id = $2 RETURNING *
      `, [notes, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Vínculo não encontrado' });
      }
      
      // Atualiza equipamento para disponível
      await pool.query(
        'UPDATE equipment SET status = $1, assigned_to = NULL WHERE id = $2',
        ['available', result.rows[0].equipment_id]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/assignments/employee/:id/pending - Marcar equipamentos como pendentes
  router.put('/employee/:id/pending', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(`
        UPDATE equipment_assignments 
        SET status = 'pending_return'
        WHERE employee_id = $1 AND status = 'active'
        RETURNING *
      `, [id]);
      
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};