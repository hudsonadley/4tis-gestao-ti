/**
 * 4TIS SaaS - Utilitários
 * Funções auxiliares e helpers para o sistema
 */

class Utils {
    /**
     * Sanitiza HTML para prevenir XSS
     * @param {string} str - String a ser sanitizada
     * @returns {string} String sanitizada
     */
    static escapeHtml(str) {
        if (typeof str !== 'string') return str;
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Debounce para otimizar performance em inputs
     * @param {Function} func - Função a ser executada
     * @param {number} delay - Delay em millisegundos
     * @returns {Function} Função com debounce aplicado
     */
    static debounce(func, delay = CONFIG.DEBOUNCE_DELAY) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle para limitar execução de funções
     * @param {Function} func - Função a ser executada
     * @param {number} limit - Limite em millisegundos
     * @returns {Function} Função com throttle aplicado
     */
    static throttle(func, limit = 100) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Formata valor monetário
     * @param {number} value - Valor a ser formatado
     * @param {string} currency - Moeda (padrão: BRL)
     * @returns {string} Valor formatado
     */
    static formatCurrency(value, currency = 'BRL') {
        if (typeof value !== 'number') return 'R$ 0,00';
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        }).format(value);
    }

    /**
     * Formata data para exibição
     * @param {string|Date} date - Data a ser formatada
     * @param {string} format - Formato desejado
     * @returns {string} Data formatada
     */
    static formatDate(date, format = 'dd/MM/yyyy') {
        if (!date) return '-';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) return '-';
        
        const options = {
            'dd/MM/yyyy': { day: '2-digit', month: '2-digit', year: 'numeric' },
            'dd/MM/yyyy HH:mm': { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            'relative': undefined // Será tratado separadamente
        };
        
        if (format === 'relative') {
            return this.getRelativeTime(dateObj);
        }
        
        return dateObj.toLocaleDateString('pt-BR', options[format] || options['dd/MM/yyyy']);
    }

    /**
     * Retorna tempo relativo (ex: "há 2 horas")
     * @param {Date} date - Data de referência
     * @returns {string} Tempo relativo
     */
    static getRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        const intervals = [
            { label: 'ano', seconds: 31536000 },
            { label: 'mês', seconds: 2592000 },
            { label: 'dia', seconds: 86400 },
            { label: 'hora', seconds: 3600 },
            { label: 'minuto', seconds: 60 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count > 0) {
                return `há ${count} ${interval.label}${count > 1 ? 's' : ''}`;
            }
        }
        
        return 'agora';
    }

    /**
     * Valida email
     * @param {string} email - Email a ser validado
     * @returns {boolean} True se válido
     */
    static isValidEmail(email) {
        return VALIDATION.EMAIL_REGEX.test(email);
    }

    /**
     * Valida telefone brasileiro
     * @param {string} phone - Telefone a ser validado
     * @returns {boolean} True se válido
     */
    static isValidPhone(phone) {
        return VALIDATION.PHONE_REGEX.test(phone);
    }

    /**
     * Valida CPF
     * @param {string} cpf - CPF a ser validado
     * @returns {boolean} True se válido
     */
    static isValidCPF(cpf) {
        if (!VALIDATION.CPF_REGEX.test(cpf)) return false;
        
        const numbers = cpf.replace(/\D/g, '');
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(numbers)) return false;
        
        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(numbers[i]) * (10 - i);
        }
        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;
        
        if (parseInt(numbers[9]) !== digit1) return false;
        
        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(numbers[i]) * (11 - i);
        }
        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;
        
        return parseInt(numbers[10]) === digit2;
    }

    /**
     * Gera ID único
     * @param {string} prefix - Prefixo do ID
     * @returns {string} ID único
     */
    static generateId(prefix = 'ID') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}${timestamp}${random}`.toUpperCase();
    }

    /**
     * Clona objeto profundamente
     * @param {any} obj - Objeto a ser clonado
     * @returns {any} Objeto clonado
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * Filtra array por termo de busca
     * @param {Array} array - Array a ser filtrado
     * @param {string} searchTerm - Termo de busca
     * @param {Array} fields - Campos a serem pesquisados
     * @returns {Array} Array filtrado
     */
    static filterBySearch(array, searchTerm, fields = []) {
        if (!searchTerm || !Array.isArray(array)) return array;
        
        const term = searchTerm.toLowerCase().trim();
        
        return array.filter(item => {
            if (fields.length === 0) {
                // Busca em todos os campos string do objeto
                return Object.values(item).some(value => 
                    typeof value === 'string' && 
                    value.toLowerCase().includes(term)
                );
            }
            
            // Busca apenas nos campos especificados
            return fields.some(field => {
                const value = this.getNestedProperty(item, field);
                return typeof value === 'string' && 
                       value.toLowerCase().includes(term);
            });
        });
    }

    /**
     * Obtém propriedade aninhada de um objeto
     * @param {Object} obj - Objeto
     * @param {string} path - Caminho da propriedade (ex: 'user.profile.name')
     * @returns {any} Valor da propriedade
     */
    static getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : undefined, obj
        );
    }

    /**
     * Ordena array por campo
     * @param {Array} array - Array a ser ordenado
     * @param {string} field - Campo para ordenação
     * @param {string} direction - Direção (asc/desc)
     * @returns {Array} Array ordenado
     */
    static sortBy(array, field, direction = 'asc') {
        if (!Array.isArray(array)) return array;
        
        return [...array].sort((a, b) => {
            const valueA = this.getNestedProperty(a, field);
            const valueB = this.getNestedProperty(b, field);
            
            // Tratamento para diferentes tipos
            let comparison = 0;
            
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                comparison = valueA.localeCompare(valueB, 'pt-BR');
            } else if (typeof valueA === 'number' && typeof valueB === 'number') {
                comparison = valueA - valueB;
            } else if (valueA instanceof Date && valueB instanceof Date) {
                comparison = valueA.getTime() - valueB.getTime();
            } else {
                comparison = String(valueA).localeCompare(String(valueB), 'pt-BR');
            }
            
            return direction === 'desc' ? -comparison : comparison;
        });
    }

    /**
     * Pagina array
     * @param {Array} array - Array a ser paginado
     * @param {number} page - Página atual (1-based)
     * @param {number} itemsPerPage - Itens por página
     * @returns {Object} Objeto com dados paginados
     */
    static paginate(array, page = 1, itemsPerPage = CONFIG.ITEMS_PER_PAGE) {
        if (!Array.isArray(array)) return { data: [], totalPages: 0, totalItems: 0 };
        
        const totalItems = array.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const data = array.slice(startIndex, endIndex);
        
        return {
            data,
            totalPages,
            totalItems,
            currentPage: page,
            itemsPerPage,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }

    /**
     * Formata bytes para tamanho legível
     * @param {number} bytes - Bytes
     * @param {number} decimals - Casas decimais
     * @returns {string} Tamanho formatado
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Capitaliza primeira letra
     * @param {string} str - String a ser capitalizada
     * @returns {string} String capitalizada
     */
    static capitalize(str) {
        if (typeof str !== 'string') return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Converte string para slug
     * @param {string} str - String a ser convertida
     * @returns {string} Slug
     */
    static slugify(str) {
        if (typeof str !== 'string') return '';
        
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-') // Remove hífens duplicados
            .trim('-'); // Remove hífens das extremidades
    }

    /**
     * Trunca texto
     * @param {string} text - Texto a ser truncado
     * @param {number} length - Comprimento máximo
     * @param {string} suffix - Sufixo (padrão: '...')
     * @returns {string} Texto truncado
     */
    static truncate(text, length = 100, suffix = '...') {
        if (typeof text !== 'string') return text;
        if (text.length <= length) return text;
        
        return text.substring(0, length - suffix.length) + suffix;
    }

    /**
     * Verifica se usuário tem permissão
     * @param {string} permission - Permissão a ser verificada
     * @param {Object} user - Usuário (padrão: CURRENT_USER)
     * @returns {boolean} True se tem permissão
     */
    static hasPermission(permission, user = CURRENT_USER) {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission) || user.role === CONFIG.USER_ROLES.ADMIN;
    }

    /**
     * Log de desenvolvimento
     * @param {string} message - Mensagem
     * @param {any} data - Dados adicionais
     * @param {string} level - Nível do log
     */
    static devLog(message, data = null, level = 'info') {
        if (!DEV_CONFIG.ENABLE_CONSOLE_LOGS) return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[4TIS-${level.toUpperCase()}] ${timestamp}:`;
        
        switch (level) {
            case 'error':
                console.error(prefix, message, data);
                break;
            case 'warn':
                console.warn(prefix, message, data);
                break;
            case 'info':
            default:
                console.log(prefix, message, data);
                break;
        }
    }

    /**
     * Mede performance de função
     * @param {Function} func - Função a ser medida
     * @param {string} label - Label para identificação
     * @returns {any} Resultado da função
     */
    static measurePerformance(func, label = 'Function') {
        if (!DEV_CONFIG.SHOW_PERFORMANCE_METRICS) {
            return func();
        }
        
        const startTime = performance.now();
        const result = func();
        const endTime = performance.now();
        
        this.devLog(`${label} executada em ${(endTime - startTime).toFixed(2)}ms`);
        
        return result;
    }

    /**
     * Exporta dados como arquivo
     * @param {any} data - Dados a serem exportados
     * @param {string} filename - Nome do arquivo
     * @param {string} type - Tipo do arquivo (json, csv)
     */
    static exportFile(data, filename, type = 'json') {
        let content, mimeType;
        
        switch (type) {
            case 'json':
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                break;
            case 'csv':
                content = this.convertToCSV(data);
                mimeType = 'text/csv';
                break;
            default:
                throw new Error(`Tipo de arquivo não suportado: ${type}`);
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Converte array de objetos para CSV
     * @param {Array} data - Dados a serem convertidos
     * @returns {string} String CSV
     */
    static convertToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escapa aspas duplas e envolve em aspas se necessário
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

// Exportar para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}