const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting 4TIS Server...');
console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database connection
const pool = require('./config/database');

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// API Routes
const employeesRouter = require('./api/employees')(pool);
const equipmentRouter = require('./api/equipment')(pool);
const ticketsRouter = require('./api/tickets')(pool);
const assignmentsRouter = require('./api/assignments')(pool);
const peripheralsRouter = require('./api/peripherals')(pool);
const equipmentTypesRouter = require('./api/equipment-types')(pool);
const alertsRouter = require('./api/alerts')(pool);

// Rotas da API
app.use('/api/employees', employeesRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/peripherals', peripheralsRouter);
app.use('/api/equipment-types', equipmentTypesRouter);
app.use('/api/alerts', alertsRouter);

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Clear database endpoint
app.post('/clear-database', async (req, res) => {
  try {
    await pool.query('DELETE FROM tickets');
    await pool.query('DELETE FROM equipment');
    await pool.query('DELETE FROM employees');
    res.json({ status: 'success', message: 'Database cleared' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create tables endpoint
app.post('/api/create-tables', async (req, res) => {
  try {
    // Criar tabela equipment_types
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(10),
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela equipment_return_history
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment_return_history (
        id SERIAL PRIMARY KEY,
        equipment_id VARCHAR(50) NOT NULL,
        employee_id VARCHAR(50) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        return_date TIMESTAMP NOT NULL,
        return_notes TEXT NOT NULL,
        returned_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir tipos padrão
    const defaultTypes = [
      { name: 'notebook', icon: '💻', description: 'Computadores portáteis' },
      { name: 'desktop', icon: '🖥️', description: 'Computadores de mesa' },
      { name: 'monitor', icon: '🖥️', description: 'Monitores e telas' },
      { name: 'mouse', icon: '🖱️', description: 'Dispositivos de entrada' },
      { name: 'teclado', icon: '⌨️', description: 'Teclados' },
      { name: 'celular', icon: '📱', description: 'Telefones celulares' },
      { name: 'tablet', icon: '📱', description: 'Tablets' },
      { name: 'impressora', icon: '🖨️', description: 'Impressoras' },
      { name: 'chip', icon: '📶', description: 'Chips de celular' },
      { name: 'outros', icon: '📦', description: 'Outros equipamentos' }
    ];

    for (const type of defaultTypes) {
      await pool.query(
        'INSERT INTO equipment_types (name, icon, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [type.name, type.icon, type.description]
      );
    }

    res.json({ status: 'success', message: 'Tabelas criadas com sucesso' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Migration endpoint
app.post('/migrate', async (req, res) => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        brand VARCHAR(100),
        model VARCHAR(100),
        serial_number VARCHAR(100),
        patrimony VARCHAR(100) NOT NULL UNIQUE,
        status VARCHAR(20) DEFAULT 'in_stock',
        assigned_to VARCHAR(50),
        value DECIMAL(10,2),
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES employees(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS peripherals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        model VARCHAR(255),
        observations TEXT,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Forçar migração de periféricos
    try {
      // Verificar se coluna existe
      const checkColumn = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'peripherals' AND column_name = 'quantity'
      `);
      
      if (checkColumn.rows.length === 0) {
        await pool.query('ALTER TABLE peripherals ADD COLUMN quantity INTEGER DEFAULT 1');
        console.log('✅ Coluna quantity adicionada');
      }
      
      await pool.query('UPDATE peripherals SET quantity = 1 WHERE quantity IS NULL');
      
      // Remover colunas antigas se existirem
      const checkOldColumns = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'peripherals' AND column_name IN ('is_chip', 'chip_number')
      `);
      
      for (const col of checkOldColumns.rows) {
        await pool.query(`ALTER TABLE peripherals DROP COLUMN ${col.column_name}`);
        console.log(`✅ Coluna ${col.column_name} removida`);
      }
      
    } catch (err) {
      console.log('Migração de periféricos:', err.message);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment_peripherals (
        id SERIAL PRIMARY KEY,
        equipment_id VARCHAR(50) NOT NULL,
        peripheral_id INTEGER NOT NULL,
        value DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        FOREIGN KEY (peripheral_id) REFERENCES peripherals(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment_assignments (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) NOT NULL,
        equipment_id VARCHAR(50) NOT NULL,
        status VARCHAR(30) DEFAULT 'active',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        returned_at TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (equipment_id) REFERENCES equipment(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'open',
        assigned_to VARCHAR(50),
        created_by VARCHAR(50),
        external_ticket_number VARCHAR(100),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES employees(id),
        FOREIGN KEY (created_by) REFERENCES employees(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(10),
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment_return_history (
        id SERIAL PRIMARY KEY,
        equipment_id VARCHAR(50) NOT NULL,
        employee_id VARCHAR(50) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        return_date TIMESTAMP NOT NULL,
        return_notes TEXT NOT NULL,
        returned_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        employee_id VARCHAR(50),
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    // Adicionar colunas que podem estar faltando
    try {
      await pool.query('ALTER TABLE equipment ADD COLUMN IF NOT EXISTS patrimony VARCHAR(100)');
      await pool.query('ALTER TABLE equipment ADD COLUMN IF NOT EXISTS observations TEXT');
      await pool.query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS department VARCHAR(100)');
      await pool.query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS admission_date DATE');
      await pool.query('ALTER TABLE tickets ADD COLUMN IF NOT EXISTS external_ticket_number VARCHAR(100)');
      await pool.query('ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category VARCHAR(100)');
    } catch (err) {
      console.log('Colunas já existem ou erro:', err.message);
    }

    // Inserir tipos padrão se não existirem
    const defaultTypes = [
      { name: 'notebook', icon: '💻', description: 'Computadores portáteis' },
      { name: 'desktop', icon: '🖥️', description: 'Computadores de mesa' },
      { name: 'monitor', icon: '🖥️', description: 'Monitores e telas' },
      { name: 'mouse', icon: '🖱️', description: 'Dispositivos de entrada' },
      { name: 'teclado', icon: '⌨️', description: 'Teclados' },
      { name: 'celular', icon: '📱', description: 'Telefones celulares' },
      { name: 'tablet', icon: '📱', description: 'Tablets' },
      { name: 'impressora', icon: '🖨️', description: 'Impressoras' },
      { name: 'chip', icon: '📶', description: 'Chips de celular' },
      { name: 'outros', icon: '📦', description: 'Outros equipamentos' }
    ];

    for (const type of defaultTypes) {
      try {
        await pool.query(
          'INSERT INTO equipment_types (name, icon, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
          [type.name, type.icon, type.description]
        );
      } catch (err) {
        console.log(`Tipo ${type.name} já existe ou erro:`, err.message);
      }
    }

    res.json({ status: 'success', message: 'Migration completed' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 4TIS Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
});