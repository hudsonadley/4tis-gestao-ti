// Configuração do Supabase
const SUPABASE_URL = 'https://llnivylstqlkcjgiypzh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsbml2eWxzdHFsa2NqZ2l5cHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTQyMTUsImV4cCI6MjA2MzkzMDIxNX0.VRgALvxMbm_K0hbwi98aFNXncYdZneVNNrN7Xlz8-14';

// Inicializar cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para criar as tabelas necessárias
async function createTables() {
    try {
        console.log('Iniciando criação das tabelas...');
        
        // Criar tabela de colaboradores
        const { error: colaboradoresError } = await supabase.rpc('create_colaboradores_table');
        if (colaboradoresError && !colaboradoresError.message.includes('already exists')) {
            console.error('Erro ao criar tabela colaboradores:', colaboradoresError);
        } else {
            console.log('Tabela colaboradores criada/verificada com sucesso');
        }
        
        // Criar tabela de equipamentos
        const { error: equipamentosError } = await supabase.rpc('create_equipamentos_table');
        if (equipamentosError && !equipamentosError.message.includes('already exists')) {
            console.error('Erro ao criar tabela equipamentos:', equipamentosError);
        } else {
            console.log('Tabela equipamentos criada/verificada com sucesso');
        }
        
        console.log('Tabelas criadas com sucesso!');
    } catch (error) {
        console.error('Erro geral ao criar tabelas:', error);
    }
}

// SQL para criar as tabelas (será executado via SQL Editor do Supabase)
const SQL_CREATE_TABLES = `
-- Criar tabela de colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(50),
    data_admissao DATE,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    marca VARCHAR(255) NOT NULL,
    modelo VARCHAR(255) NOT NULL,
    uso_unico BOOLEAN DEFAULT false,
    serial VARCHAR(255),
    patrimonio VARCHAR(255),
    quantidade INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'estoque' CHECK (status IN ('estoque', 'vinculado', 'inativo')),
    vinculado_a UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON colaboradores(email);
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON colaboradores(status);
CREATE INDEX IF NOT EXISTS idx_equipamentos_status ON equipamentos(status);
CREATE INDEX IF NOT EXISTS idx_equipamentos_vinculado_a ON equipamentos(vinculado_a);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON colaboradores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipamentos_updated_at BEFORE UPDATE ON equipamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (permitir todas as operações para usuários autenticados)
CREATE POLICY "Allow all operations for authenticated users" ON colaboradores
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON equipamentos
    FOR ALL USING (true);

-- Para desenvolvimento, permitir acesso anônimo também
CREATE POLICY "Allow all operations for anonymous users" ON colaboradores
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for anonymous users" ON equipamentos
    FOR ALL USING (true);
`;

console.log('Configuração do Supabase carregada!');
console.log('Para criar as tabelas, execute o SQL abaixo no SQL Editor do Supabase:');
console.log(SQL_CREATE_TABLES);

