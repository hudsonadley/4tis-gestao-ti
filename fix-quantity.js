const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8@ep-rough-darkness-a5ixqhqz.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function fixQuantity() {
  try {
    console.log('🔄 Adicionando coluna quantity...');
    
    // Adicionar coluna quantity
    await pool.query('ALTER TABLE peripherals ADD COLUMN quantity INTEGER DEFAULT 1');
    console.log('✅ Coluna quantity adicionada');
    
    // Atualizar registros existentes
    await pool.query('UPDATE peripherals SET quantity = 1 WHERE quantity IS NULL');
    console.log('✅ Registros atualizados');
    
    // Remover colunas antigas
    try {
      await pool.query('ALTER TABLE peripherals DROP COLUMN is_chip');
      await pool.query('ALTER TABLE peripherals DROP COLUMN chip_number');
      console.log('✅ Colunas antigas removidas');
    } catch (e) {
      console.log('ℹ️ Colunas antigas já foram removidas');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

fixQuantity();