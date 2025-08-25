const { Pool } = require('pg');
require('dotenv').config();

console.log('🔄 Iniciando migração do banco...');
console.log('DATABASE_URL configurada:', !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');

    // Criar tabela de colaboradores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de equipamentos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id VARCHAR(50) PRIMARY KEY,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        series VARCHAR(255),
        patrimony VARCHAR(255),
        value DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'available',
        assigned_to VARCHAR(50) REFERENCES employees(id),
        observation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de chamados
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(50) PRIMARY KEY,
        glpi_id VARCHAR(50),
        requestor VARCHAR(255) NOT NULL,
        equipment_type VARCHAR(255),
        service_type VARCHAR(255),
        requested_for_user VARCHAR(255),
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'novo',
        ticket_type VARCHAR(50),
        justification TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('📋 Tabelas criadas - banco limpo e pronto para uso!');

    console.log('✅ Migração concluída - banco limpo!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrate();