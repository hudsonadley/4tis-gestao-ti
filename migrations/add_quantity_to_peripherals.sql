-- Adicionar coluna quantity à tabela peripherals
ALTER TABLE peripherals ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Atualizar registros existentes para ter quantidade 1
UPDATE peripherals SET quantity = 1 WHERE quantity IS NULL;

-- Remover colunas antigas que não são mais usadas
ALTER TABLE peripherals DROP COLUMN IF EXISTS is_chip;
ALTER TABLE peripherals DROP COLUMN IF EXISTS chip_number;