const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET /api/equipment-types - Listar todos os tipos
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM equipment_types ORDER BY name ASC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar tipos:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/equipment-types/:id - Buscar tipo específico
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT * FROM equipment_types WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tipo não encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar tipo:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/equipment-types - Criar novo tipo
  router.post('/', async (req, res) => {
    try {
      const { name, icon, description, status = 'active' } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const result = await pool.query(
        'INSERT INTO equipment_types (name, icon, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, icon, description, status]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar tipo:', error);
      if (error.code === '23505') { // Unique violation
        res.status(400).json({ error: 'Tipo já existe' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // PUT /api/equipment-types/:id - Atualizar tipo
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, icon, description, status } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const result = await pool.query(
        'UPDATE equipment_types SET name = $1, icon = $2, description = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
        [name, icon, description, status, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tipo não encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar tipo:', error);
      if (error.code === '23505') { // Unique violation
        res.status(400).json({ error: 'Nome já existe' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // DELETE /api/equipment-types/:id - Excluir tipo
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se há equipamentos usando este tipo
      const equipmentCheck = await pool.query(
        'SELECT COUNT(*) FROM equipment WHERE type = (SELECT name FROM equipment_types WHERE id = $1)',
        [id]
      );
      
      if (parseInt(equipmentCheck.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Não é possível excluir tipo que está sendo usado por equipamentos' 
        });
      }
      
      const result = await pool.query(
        'DELETE FROM equipment_types WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tipo não encontrado' });
      }
      
      res.json({ message: 'Tipo excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir tipo:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};