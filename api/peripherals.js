const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET /api/peripherals - Listar todos os periféricos
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM peripherals ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/peripherals - Criar periférico
  router.post('/', async (req, res) => {
    try {
      const { name, model, observations, quantity } = req.body;
      
      const result = await pool.query(`
        INSERT INTO peripherals (name, model, observations, quantity)
        VALUES ($1, $2, $3, $4) RETURNING *
      `, [name, model, observations, quantity || 1]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/peripherals/:id - Atualizar periférico
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, model, observations, quantity } = req.body;
      
      const result = await pool.query(`
        UPDATE peripherals 
        SET name = $1, model = $2, observations = $3, quantity = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 RETURNING *
      `, [name, model, observations, quantity || 1, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Periférico não encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/peripherals/:id - Deletar periférico
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM peripherals WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Periférico não encontrado' });
      }
      
      res.json({ message: 'Periférico deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/peripherals/equipment/:id - Periféricos do equipamento
  router.get('/equipment/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT ep.*, p.name, p.model, p.observations, p.quantity
        FROM equipment_peripherals ep
        JOIN peripherals p ON ep.peripheral_id = p.id
        WHERE ep.equipment_id = $1
      `, [id]);
      
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/peripherals/equipment/:id/link - Vincular periférico ao equipamento
  router.post('/equipment/:id/link', async (req, res) => {
    try {
      const { id } = req.params;
      const { peripheral_id, value } = req.body;
      
      const result = await pool.query(`
        INSERT INTO equipment_peripherals (equipment_id, peripheral_id, value)
        VALUES ($1, $2, $3) RETURNING *
      `, [id, peripheral_id, value || 0]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/peripherals/equipment/:equipmentId/unlink/:peripheralId - Desvincular
  router.delete('/equipment/:equipmentId/unlink/:peripheralId', async (req, res) => {
    try {
      const { equipmentId, peripheralId } = req.params;
      
      const result = await pool.query(`
        DELETE FROM equipment_peripherals 
        WHERE equipment_id = $1 AND peripheral_id = $2 
        RETURNING *
      `, [equipmentId, peripheralId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Vínculo não encontrado' });
      }
      
      res.json({ message: 'Periférico desvinculado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/peripherals/:id/unlink-all - Remover todos os vínculos do periférico
  router.delete('/:id/unlink-all', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(`
        DELETE FROM equipment_peripherals 
        WHERE peripheral_id = $1
      `, [id]);
      
      res.json({ message: `${result.rowCount} vínculos removidos` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};