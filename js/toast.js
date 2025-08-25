/**
 * 4TIS SaaS - Sistema de Toast Notifications
 * Sistema robusto de notificações com segurança XSS
 */

class ToastManager {
    static toasts = new Map();
    static container = null;
    static maxToasts = 5;

    /**
     * Inicializa o sistema de toast
     */
    static init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'fixed top-5 right-5 z-50 space-y-3 pointer-events-none';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Mostra uma notificação toast
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo do toast (success, error, warning, info)
     * @param {number} duration - Duração em millisegundos
     * @param {Object} options - Opções adicionais
     * @returns {string} ID do toast criado
     */
    static show(message, type = 'info', duration = CONFIG.TOAST_DURATION, options = {}) {
        if (!this.container) this.init();

        // Sanitiza a mensagem para prevenir XSS
        const sanitizedMessage = Utils.escapeHtml(message);
        
        // Gera ID único para o toast
        const toastId = Utils.generateId('toast');
        
        // Remove toasts antigos se exceder o limite
        this.enforceMaxToasts();
        
        // Configurações do toast
        const config = {
            id: toastId,
            message: sanitizedMessage,
            type: type,
            duration: duration,
            persistent: options.persistent || false,
            actions: options.actions || [],
            icon: this.getIcon(type),
            className: this.getClassName(type),
            ...options
        };

        // Cria elemento do toast
        const toastElement = this.createToastElement(config);
        
        // Adiciona ao container
        this.container.appendChild(toastElement);
        
        // Armazena referência
        this.toasts.set(toastId, {
            element: toastElement,
            config: config,
            createdAt: Date.now()
        });

        // Configura auto-remoção se não for persistente
        if (!config.persistent && duration > 0) {
            setTimeout(() => {
                this.remove(toastId);
            }, duration);
        }

        // Log de desenvolvimento
        Utils.devLog(`Toast criado: ${type} - ${message}`, config);

        return toastId;
    }

    /**
     * Cria elemento HTML do toast
     * @param {Object} config - Configuração do toast
     * @returns {HTMLElement} Elemento do toast
     */
    static createToastElement(config) {
        const toast = document.createElement('div');
        toast.id = config.id;
        toast.className = `toast ${config.className} pointer-events-auto`;
        
        // Estrutura do toast
        const content = document.createElement('div');
        content.className = 'toast-content';
        
        // Ícone
        const icon = document.createElement('span');
        icon.className = 'toast-icon';
        icon.textContent = config.icon;
        
        // Mensagem
        const messageEl = document.createElement('span');
        messageEl.className = 'toast-message';
        messageEl.textContent = config.message; // Já sanitizada
        
        // Botão de fechar
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Fechar notificação');
        closeBtn.onclick = () => this.remove(config.id);
        
        // Monta estrutura
        content.appendChild(icon);
        content.appendChild(messageEl);
        
        // Adiciona ações customizadas se existirem
        if (config.actions && config.actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'toast-actions';
            
            config.actions.forEach(action => {
                const actionBtn = document.createElement('button');
                actionBtn.className = `btn btn-sm ${action.className || 'btn-secondary'}`;
                actionBtn.textContent = action.label;
                actionBtn.onclick = () => {
                    if (action.handler) action.handler();
                    if (action.closeOnClick !== false) this.remove(config.id);
                };
                actionsContainer.appendChild(actionBtn);
            });
            
            content.appendChild(actionsContainer);
        }
        
        content.appendChild(closeBtn);
        toast.appendChild(content);
        
        // Barra de progresso se não for persistente
        if (!config.persistent && config.duration > 0) {
            const progress = document.createElement('div');
            progress.className = 'toast-progress';
            progress.style.animationDuration = `${config.duration}ms`;
            toast.appendChild(progress);
        }
        
        // Adiciona eventos de acessibilidade
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', config.type === 'error' ? 'assertive' : 'polite');
        
        return toast;
    }

    /**
     * Remove um toast
     * @param {string} toastId - ID do toast a ser removido
     */
    static remove(toastId) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element } = toastData;
        
        // Adiciona classe de remoção para animação
        element.classList.add('removing');
        
        // Remove após animação
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(toastId);
        }, 300);

        Utils.devLog(`Toast removido: ${toastId}`);
    }

    /**
     * Remove todos os toasts
     */
    static clear() {
        this.toasts.forEach((_, toastId) => {
            this.remove(toastId);
        });
    }

    /**
     * Força limite máximo de toasts
     */
    static enforceMaxToasts() {
        if (this.toasts.size >= this.maxToasts) {
            // Remove o toast mais antigo
            const oldestToastId = Array.from(this.toasts.keys())[0];
            this.remove(oldestToastId);
        }
    }

    /**
     * Obtém ícone para o tipo de toast
     * @param {string} type - Tipo do toast
     * @returns {string} Ícone
     */
    static getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳'
        };
        return icons[type] || icons.info;
    }

    /**
     * Obtém classe CSS para o tipo de toast
     * @param {string} type - Tipo do toast
     * @returns {string} Classe CSS
     */
    static getClassName(type) {
        const classes = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info',
            loading: 'info'
        };
        return classes[type] || classes.info;
    }

    /**
     * Métodos de conveniência
     */
    static success(message, options = {}) {
        return this.show(message, 'success', CONFIG.TOAST_DURATION, options);
    }

    static error(message, options = {}) {
        return this.show(message, 'error', CONFIG.TOAST_DURATION * 1.5, options);
    }

    static warning(message, options = {}) {
        return this.show(message, 'warning', CONFIG.TOAST_DURATION, options);
    }

    static info(message, options = {}) {
        return this.show(message, 'info', CONFIG.TOAST_DURATION, options);
    }

    static loading(message, options = {}) {
        return this.show(message, 'loading', 0, { persistent: true, ...options });
    }

    /**
     * Toast de confirmação com ações
     * @param {string} message - Mensagem
     * @param {Function} onConfirm - Callback de confirmação
     * @param {Function} onCancel - Callback de cancelamento
     * @param {Object} options - Opções adicionais
     */
    static confirm(message, onConfirm, onCancel = null, options = {}) {
        const actions = [
            {
                label: 'Confirmar',
                className: 'btn-primary',
                handler: onConfirm
            },
            {
                label: 'Cancelar',
                className: 'btn-secondary',
                handler: onCancel
            }
        ];

        return this.show(message, 'warning', 0, {
            persistent: true,
            actions: actions,
            ...options
        });
    }

    /**
     * Toast de progresso
     * @param {string} message - Mensagem
     * @param {number} progress - Progresso (0-100)
     * @param {Object} options - Opções adicionais
     */
    static progress(message, progress = 0, options = {}) {
        const progressMessage = `${message} (${Math.round(progress)}%)`;
        
        return this.show(progressMessage, 'info', 0, {
            persistent: true,
            progress: progress,
            ...options
        });
    }

    /**
     * Atualiza toast existente
     * @param {string} toastId - ID do toast
     * @param {Object} updates - Atualizações
     */
    static update(toastId, updates) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element, config } = toastData;
        
        // Atualiza mensagem se fornecida
        if (updates.message) {
            const messageEl = element.querySelector('.toast-message');
            if (messageEl) {
                messageEl.textContent = Utils.escapeHtml(updates.message);
            }
        }

        // Atualiza tipo se fornecido
        if (updates.type && updates.type !== config.type) {
            element.className = element.className.replace(config.className, this.getClassName(updates.type));
            
            const iconEl = element.querySelector('.toast-icon');
            if (iconEl) {
                iconEl.textContent = this.getIcon(updates.type);
            }
        }

        // Atualiza configuração
        Object.assign(config, updates);
        this.toasts.set(toastId, { element, config, createdAt: toastData.createdAt });
    }

    /**
     * Obtém estatísticas dos toasts
     * @returns {Object} Estatísticas
     */
    static getStats() {
        const stats = {
            total: this.toasts.size,
            byType: {},
            oldest: null,
            newest: null
        };

        this.toasts.forEach((data, id) => {
            const type = data.config.type;
            stats.byType[type] = (stats.byType[type] || 0) + 1;
            
            if (!stats.oldest || data.createdAt < stats.oldest) {
                stats.oldest = data.createdAt;
            }
            
            if (!stats.newest || data.createdAt > stats.newest) {
                stats.newest = data.createdAt;
            }
        });

        return stats;
    }
}

// Inicializa automaticamente quando DOM estiver pronto
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ToastManager.init());
    } else {
        ToastManager.init();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ToastManager = ToastManager;
}

// Exportar para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastManager;
}