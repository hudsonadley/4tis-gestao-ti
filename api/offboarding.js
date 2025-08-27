const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // POST /api/offboarding/initiate - Iniciar processo de offboarding
  router.post('/initiate', async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { employee_id, equipment_returns, notes } = req.body;
      
      // Verificar se o colaborador existe
      const employeeResult = await client.query(
        'SELECT * FROM employees WHERE id = $1',
        [employee_id]
      );
      
      if (employeeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }
      
      const employee = employeeResult.rows[0];
      
      // Buscar equipamentos atribuídos ao colaborador
      const equipmentResult = await client.query(
        'SELECT * FROM equipment WHERE assigned_to = $1 AND status = $2',
        [employee_id, 'assigned']
      );
      
      const assignedEquipment = equipmentResult.rows;
      
      // Processar devoluções de equipamentos
      const returnedEquipment = [];
      const pendingEquipment = [];
      
      for (const equipment of assignedEquipment) {
        const returnInfo = equipment_returns.find(r => r.equipment_id === equipment.id);
        
        if (returnInfo && returnInfo.returned) {
          // Equipamento foi devolvido
          await client.query(
            'UPDATE equipment SET status = $1, assigned_to = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['available', equipment.id]
          );
          
          // Registrar no histórico
          await client.query(
            `INSERT INTO equipment_return_history 
             (equipment_id, employee_id, employee_name, return_date, return_notes, returned_by) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              equipment.id,
              employee_id,
              employee.name,
              new Date(),
              returnInfo.notes || 'Devolução durante offboarding',
              'Sistema'
            ]
          );
          
          returnedEquipment.push({
            ...equipment,
            return_notes: returnInfo.notes
          });
        } else {
          // Equipamento não foi devolvido - permanece vinculado
          pendingEquipment.push(equipment);
        }
      }
      
      // Inativar colaborador
      await client.query(
        'UPDATE employees SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['inactive', employee_id]
      );
      
      // Criar registro de offboarding
      const offboardingId = `OFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await client.query(
        `INSERT INTO offboarding_records 
         (id, employee_id, employee_name, offboarding_date, returned_equipment_count, 
          pending_equipment_count, notes, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          offboardingId,
          employee_id,
          employee.name,
          new Date(),
          returnedEquipment.length,
          pendingEquipment.length,
          notes || '',
          pendingEquipment.length > 0 ? 'pending_equipment' : 'completed'
        ]
      );
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        offboarding_id: offboardingId,
        employee: employee,
        returned_equipment: returnedEquipment,
        pending_equipment: pendingEquipment,
        status: pendingEquipment.length > 0 ? 'pending_equipment' : 'completed'
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro no offboarding:', error);
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  });

  // GET /api/offboarding/employee/:id/equipment - Buscar equipamentos do colaborador
  router.get('/employee/:id/equipment', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        `SELECT e.*, et.name as type_name, et.icon as type_icon
         FROM equipment e
         LEFT JOIN equipment_types et ON e.type = et.name
         WHERE e.assigned_to = $1 AND e.status = 'assigned'
         ORDER BY e.name`,
        [id]
      );
      
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/offboarding/resolve-pending - Resolver pendência de equipamento
  router.post('/resolve-pending', async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { employee_id, equipment_id, resolution_type, notes } = req.body;
      
      // Verificar se o equipamento existe e está pendente
      const equipmentResult = await client.query(
        'SELECT * FROM equipment WHERE id = $1 AND assigned_to = $2',
        [equipment_id, employee_id]
      );
      
      if (equipmentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Equipamento não encontrado ou não está pendente' });
      }
      
      const equipment = equipmentResult.rows[0];
      
      // Buscar dados do colaborador
      const employeeResult = await client.query(
        'SELECT * FROM employees WHERE id = $1',
        [employee_id]
      );
      
      const employee = employeeResult.rows[0];
      
      if (resolution_type === 'returned') {
        // Equipamento foi devolvido
        await client.query(
          'UPDATE equipment SET status = $1, assigned_to = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['available', equipment_id]
        );
        
        // Registrar no histórico
        await client.query(
          `INSERT INTO equipment_return_history 
           (equipment_id, employee_id, employee_name, return_date, return_notes, returned_by) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            equipment_id,
            employee_id,
            employee.name,
            new Date(),
            notes || 'Equipamento devolvido após resolução de pendência',
            'Sistema'
          ]
        );
        
      } else if (resolution_type === 'replaced') {
        // Equipamento foi reposto
        await client.query(
          'UPDATE equipment SET status = $1, assigned_to = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['available', equipment_id]
        );
        
        // Registrar no histórico
        await client.query(
          `INSERT INTO equipment_return_history 
           (equipment_id, employee_id, employee_name, return_date, return_notes, returned_by) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            equipment_id,
            employee_id,
            employee.name,
            new Date(),
            notes || 'Equipamento reposto pelo colaborador',
            'Sistema'
          ]
        );
      }
      
      // Registrar resolução de pendência
      await client.query(
        `INSERT INTO pending_resolutions 
         (employee_id, equipment_id, resolution_type, resolution_date, notes) 
         VALUES ($1, $2, $3, $4, $5)`,
        [employee_id, equipment_id, resolution_type, new Date(), notes]
      );
      
      // Verificar se ainda há equipamentos pendentes
      const remainingResult = await pool.query(
        'SELECT COUNT(*) as count FROM equipment WHERE assigned_to = $1',
        [employee_id]
      );
      
      const hasRemainingEquipment = parseInt(remainingResult.rows[0].count) > 0;
      
      // Atualizar status do colaborador se não há mais pendências
      if (!hasRemainingEquipment) {
        await client.query(
          'UPDATE employees SET status = $1 WHERE id = $2',
          ['inactive', employee_id]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        message: 'Pendência resolvida com sucesso',
        has_remaining_equipment: hasRemainingEquipment
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao resolver pendência:', error);
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  });

  // POST /api/offboarding/generate-hr-message - Gerar mensagem para RH
  router.post('/generate-hr-message', async (req, res) => {
    try {
      const { employee_id } = req.body;
      
      // Buscar dados do colaborador
      const employeeResult = await pool.query(
        'SELECT * FROM employees WHERE id = $1',
        [employee_id]
      );
      
      if (employeeResult.rows.length === 0) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }
      
      const employee = employeeResult.rows[0];
      
      // Buscar equipamentos pendentes
      const equipmentResult = await pool.query(
        `SELECT e.*, et.name as type_name 
         FROM equipment e
         LEFT JOIN equipment_types et ON e.type = et.name
         WHERE e.assigned_to = $1
         ORDER BY e.name`,
        [employee_id]
      );
      
      const pendingEquipment = equipmentResult.rows;
      
      if (pendingEquipment.length === 0) {
        return res.status(400).json({ error: 'Não há equipamentos pendentes para este colaborador' });
      }
      
      // Calcular valor total
      const totalValue = pendingEquipment.reduce((sum, eq) => sum + (parseFloat(eq.value) || 0), 0);
      
      // Gerar lista de equipamentos
      const equipmentList = pendingEquipment.map(eq => 
        `• ${eq.name} (${eq.type_name || eq.type}) - Série: ${eq.serial_number || 'N/A'} - Patrimônio: ${eq.patrimony || 'N/A'} - Valor: R$ ${(eq.value || 0).toFixed(2)}`
      ).join('\n');
      
      // Gerar mensagem
      const message = `Prezado(a) Departamento de Gestão e Gente,

Informamos que o colaborador ${employee.name}, do cargo ${employee.position || 'N/A'} do departamento ${employee.department || 'N/A'}, não devolveu os seguintes equipamentos durante o processo de desligamento:

${equipmentList}

Valor total dos equipamentos não devolvidos: R$ ${totalValue.toFixed(2)}
Quantidade de itens: ${pendingEquipment.length}

Solicitamos que seja providenciado o desconto em rescisão conforme política da empresa.

Atenciosamente,
Departamento de TI`;

      res.json({
        success: true,
        message: message,
        employee: employee,
        pending_equipment: pendingEquipment,
        total_value: totalValue,
        equipment_count: pendingEquipment.length
      });
      
    } catch (error) {
      console.error('Erro ao gerar mensagem para RH:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/offboarding/pending-employees - Listar colaboradores com pendências
  router.get('/pending-employees', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT DISTINCT e.*, COUNT(eq.id) as pending_equipment_count
         FROM employees e
         INNER JOIN equipment eq ON e.id = eq.assigned_to
         WHERE e.status = 'inactive' AND eq.status = 'assigned'
         GROUP BY e.id, e.name, e.email, e.position, e.department, e.status, e.created_at, e.updated_at
         ORDER BY e.name`
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar colaboradores com pendências:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};

