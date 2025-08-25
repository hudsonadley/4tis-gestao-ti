const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
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

    console.log('✅ Tabelas criadas com sucesso');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

createTables();