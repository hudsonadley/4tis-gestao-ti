// Serviço para operações com Supabase
class SupabaseService {
    constructor() {
        this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.isOnline = navigator.onLine;
        this.setupOfflineHandling();
    }

    // Configurar tratamento offline/online
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('Conexão restaurada - sincronizando dados...');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('Modo offline ativado');
        });
    }

    // Sincronizar dados offline quando voltar online
    async syncOfflineData() {
        // Implementar sincronização se necessário
        console.log('Sincronização de dados offline não implementada ainda');
    }

    // COLABORADORES
    async getCollaboradores() {
        try {
            if (!this.isOnline) {
                return this.getLocalData('colaboradores') || [];
            }

            const { data, error } = await this.supabase
                .from('colaboradores')
                .select('*')
                .order('nome');

            if (error) throw error;

            // Salvar no localStorage como backup
            this.saveLocalData('colaboradores', data);
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar colaboradores:', error);
            // Fallback para dados locais
            return this.getLocalData('colaboradores') || [];
        }
    }

    async createColaborador(colaborador) {
        try {
            const colaboradorData = {
                nome: colaborador.nome,
                cargo: colaborador.cargo,
                email: colaborador.email,
                telefone: colaborador.telefone || null,
                data_admissao: colaborador.dataAdmissao || null,
                status: colaborador.status || 'ativo'
            };

            if (!this.isOnline) {
                // Salvar offline com ID temporário
                colaboradorData.id = 'temp_' + Date.now();
                const localData = this.getLocalData('colaboradores') || [];
                localData.push(colaboradorData);
                this.saveLocalData('colaboradores', localData);
                return { data: colaboradorData, error: null };
            }

            const { data, error } = await this.supabase
                .from('colaboradores')
                .insert([colaboradorData])
                .select()
                .single();

            if (error) throw error;

            // Atualizar dados locais
            const localData = this.getLocalData('colaboradores') || [];
            localData.push(data);
            this.saveLocalData('colaboradores', localData);

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao criar colaborador:', error);
            return { data: null, error };
        }
    }

    async updateColaborador(id, colaborador) {
        try {
            const colaboradorData = {
                nome: colaborador.nome,
                cargo: colaborador.cargo,
                email: colaborador.email,
                telefone: colaborador.telefone || null,
                data_admissao: colaborador.dataAdmissao || null,
                status: colaborador.status
            };

            if (!this.isOnline) {
                // Atualizar dados locais
                const localData = this.getLocalData('colaboradores') || [];
                const index = localData.findIndex(c => c.id === id);
                if (index !== -1) {
                    localData[index] = { ...localData[index], ...colaboradorData };
                    this.saveLocalData('colaboradores', localData);
                }
                return { data: { id, ...colaboradorData }, error: null };
            }

            const { data, error } = await this.supabase
                .from('colaboradores')
                .update(colaboradorData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Atualizar dados locais
            const localData = this.getLocalData('colaboradores') || [];
            const index = localData.findIndex(c => c.id === id);
            if (index !== -1) {
                localData[index] = data;
                this.saveLocalData('colaboradores', localData);
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao atualizar colaborador:', error);
            return { data: null, error };
        }
    }

    async deleteColaborador(id) {
        try {
            if (!this.isOnline) {
                // Remover dos dados locais
                const localData = this.getLocalData('colaboradores') || [];
                const filteredData = localData.filter(c => c.id !== id);
                this.saveLocalData('colaboradores', filteredData);
                return { error: null };
            }

            const { error } = await this.supabase
                .from('colaboradores')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Remover dos dados locais
            const localData = this.getLocalData('colaboradores') || [];
            const filteredData = localData.filter(c => c.id !== id);
            this.saveLocalData('colaboradores', filteredData);

            return { error: null };
        } catch (error) {
            console.error('Erro ao excluir colaborador:', error);
            return { error };
        }
    }

    // EQUIPAMENTOS
    async getEquipamentos() {
        try {
            if (!this.isOnline) {
                return this.getLocalData('equipamentos') || [];
            }

            const { data, error } = await this.supabase
                .from('equipamentos')
                .select(`
                    *,
                    colaborador:vinculado_a(nome)
                `)
                .order('nome');

            if (error) throw error;

            // Processar dados para compatibilidade
            const processedData = data?.map(eq => ({
                ...eq,
                usoUnico: eq.uso_unico,
                vinculadoA: eq.vinculado_a,
                colaboradorNome: eq.colaborador?.nome || null
            })) || [];

            // Salvar no localStorage como backup
            this.saveLocalData('equipamentos', processedData);
            return processedData;
        } catch (error) {
            console.error('Erro ao buscar equipamentos:', error);
            // Fallback para dados locais
            return this.getLocalData('equipamentos') || [];
        }
    }

    async createEquipamento(equipamento) {
        try {
            const equipamentoData = {
                nome: equipamento.nome,
                marca: equipamento.marca,
                modelo: equipamento.modelo,
                uso_unico: equipamento.usoUnico || false,
                serial: equipamento.serial || null,
                patrimonio: equipamento.patrimonio || null,
                quantidade: equipamento.quantidade || 1,
                status: equipamento.status || 'estoque',
                vinculado_a: equipamento.vinculadoA || null
            };

            if (!this.isOnline) {
                // Salvar offline com ID temporário
                equipamentoData.id = 'temp_' + Date.now();
                equipamentoData.usoUnico = equipamentoData.uso_unico;
                equipamentoData.vinculadoA = equipamentoData.vinculado_a;
                const localData = this.getLocalData('equipamentos') || [];
                localData.push(equipamentoData);
                this.saveLocalData('equipamentos', localData);
                return { data: equipamentoData, error: null };
            }

            const { data, error } = await this.supabase
                .from('equipamentos')
                .insert([equipamentoData])
                .select()
                .single();

            if (error) throw error;

            // Processar dados para compatibilidade
            const processedData = {
                ...data,
                usoUnico: data.uso_unico,
                vinculadoA: data.vinculado_a
            };

            // Atualizar dados locais
            const localData = this.getLocalData('equipamentos') || [];
            localData.push(processedData);
            this.saveLocalData('equipamentos', localData);

            return { data: processedData, error: null };
        } catch (error) {
            console.error('Erro ao criar equipamento:', error);
            return { data: null, error };
        }
    }

    async updateEquipamento(id, equipamento) {
        try {
            const equipamentoData = {
                nome: equipamento.nome,
                marca: equipamento.marca,
                modelo: equipamento.modelo,
                uso_unico: equipamento.usoUnico || false,
                serial: equipamento.serial || null,
                patrimonio: equipamento.patrimonio || null,
                quantidade: equipamento.quantidade || 1,
                status: equipamento.status,
                vinculado_a: equipamento.vinculadoA || null
            };

            if (!this.isOnline) {
                // Atualizar dados locais
                const localData = this.getLocalData('equipamentos') || [];
                const index = localData.findIndex(e => e.id === id);
                if (index !== -1) {
                    localData[index] = { 
                        ...localData[index], 
                        ...equipamentoData,
                        usoUnico: equipamentoData.uso_unico,
                        vinculadoA: equipamentoData.vinculado_a
                    };
                    this.saveLocalData('equipamentos', localData);
                }
                return { data: { id, ...equipamentoData }, error: null };
            }

            const { data, error } = await this.supabase
                .from('equipamentos')
                .update(equipamentoData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Processar dados para compatibilidade
            const processedData = {
                ...data,
                usoUnico: data.uso_unico,
                vinculadoA: data.vinculado_a
            };

            // Atualizar dados locais
            const localData = this.getLocalData('equipamentos') || [];
            const index = localData.findIndex(e => e.id === id);
            if (index !== -1) {
                localData[index] = processedData;
                this.saveLocalData('equipamentos', localData);
            }

            return { data: processedData, error: null };
        } catch (error) {
            console.error('Erro ao atualizar equipamento:', error);
            return { data: null, error };
        }
    }

    async deleteEquipamento(id) {
        try {
            if (!this.isOnline) {
                // Remover dos dados locais
                const localData = this.getLocalData('equipamentos') || [];
                const filteredData = localData.filter(e => e.id !== id);
                this.saveLocalData('equipamentos', filteredData);
                return { error: null };
            }

            const { error } = await this.supabase
                .from('equipamentos')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Remover dos dados locais
            const localData = this.getLocalData('equipamentos') || [];
            const filteredData = localData.filter(e => e.id !== id);
            this.saveLocalData('equipamentos', filteredData);

            return { error: null };
        } catch (error) {
            console.error('Erro ao excluir equipamento:', error);
            return { error };
        }
    }

    // OPERAÇÕES DE VÍNCULO
    async vincularEquipamento(equipamentoId, colaboradorId) {
        try {
            return await this.updateEquipamento(equipamentoId, {
                status: 'vinculado',
                vinculadoA: colaboradorId
            });
        } catch (error) {
            console.error('Erro ao vincular equipamento:', error);
            return { data: null, error };
        }
    }

    async devolverEquipamento(equipamentoId) {
        try {
            return await this.updateEquipamento(equipamentoId, {
                status: 'estoque',
                vinculadoA: null
            });
        } catch (error) {
            console.error('Erro ao devolver equipamento:', error);
            return { data: null, error };
        }
    }

    // UTILITÁRIOS LOCALSTORAGE
    getLocalData(key) {
        try {
            const data = localStorage.getItem(`4tis_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Erro ao ler dados locais de ${key}:`, error);
            return null;
        }
    }

    saveLocalData(key, data) {
        try {
            localStorage.setItem(`4tis_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error(`Erro ao salvar dados locais de ${key}:`, error);
        }
    }

    clearLocalData() {
        try {
            localStorage.removeItem('4tis_colaboradores');
            localStorage.removeItem('4tis_equipamentos');
        } catch (error) {
            console.error('Erro ao limpar dados locais:', error);
        }
    }
}

// Instância global do serviço
const supabaseService = new SupabaseService();

