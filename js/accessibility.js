// Melhorias de acessibilidade
class AccessibilityManager {
    static init() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
    }

    // Navegação por teclado
    static setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC para fechar modais
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    const modalId = activeModal.id;
                    if (window.closeModal) {
                        window.closeModal(modalId);
                    }
                }
            }

            // Enter para ativar botões focados
            if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
                e.target.click();
            }

            // Tab navigation melhorada
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });

        // Navegação por setas nas tabelas
        this.setupTableNavigation();
    }

    static setupTableNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('table')) {
                const table = e.target.closest('table');
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                const currentRow = e.target.closest('tr');
                const currentIndex = rows.indexOf(currentRow);

                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        if (currentIndex < rows.length - 1) {
                            rows[currentIndex + 1].focus();
                        }
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        if (currentIndex > 0) {
                            rows[currentIndex - 1].focus();
                        }
                        break;
                }
            }
        });
    }

    static handleTabNavigation(e) {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const focusableElements = activeModal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }

    // Configurar labels ARIA
    static setupAriaLabels() {
        // Botões sem texto visível
        document.querySelectorAll('button[onclick*="edit"]').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', 'Editar item');
            }
        });

        document.querySelectorAll('button[onclick*="delete"]').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', 'Excluir item');
            }
        });

        document.querySelectorAll('button[onclick*="view"]').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', 'Visualizar detalhes');
            }
        });

        // Campos de busca
        document.querySelectorAll('input[placeholder*="Buscar"]').forEach(input => {
            if (!input.getAttribute('aria-label')) {
                input.setAttribute('aria-label', input.placeholder);
            }
        });

        // Status badges
        document.querySelectorAll('.status-badge').forEach(badge => {
            badge.setAttribute('role', 'status');
            badge.setAttribute('aria-label', `Status: ${badge.textContent}`);
        });
    }

    // Gerenciamento de foco
    static setupFocusManagement() {
        // Focar primeiro elemento ao abrir modal
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('modal')) {
                        setTimeout(() => {
                            const firstInput = node.querySelector('input, select, textarea, button');
                            if (firstInput) {
                                firstInput.focus();
                            }
                        }, 100);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Restaurar foco ao fechar modal
        this.setupFocusRestore();
    }

    static setupFocusRestore() {
        let lastFocusedElement = null;

        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="openModal"]')) {
                lastFocusedElement = e.target;
            }
        });

        // Interceptar fechamento de modais
        const originalCloseModal = window.closeModal;
        if (originalCloseModal) {
            window.closeModal = function(modalId) {
                originalCloseModal(modalId);
                if (lastFocusedElement) {
                    setTimeout(() => {
                        lastFocusedElement.focus();
                        lastFocusedElement = null;
                    }, 100);
                }
            };
        }
    }

    // Suporte a leitores de tela
    static setupScreenReaderSupport() {
        // Anunciar mudanças de página
        const originalSwitchTab = window.switchTab;
        if (originalSwitchTab) {
            window.switchTab = function(tabName) {
                originalSwitchTab(tabName);
                
                // Anunciar mudança de aba
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'polite');
                announcement.setAttribute('aria-atomic', 'true');
                announcement.className = 'sr-only';
                announcement.textContent = `Navegou para a aba ${tabName}`;
                
                document.body.appendChild(announcement);
                setTimeout(() => {
                    document.body.removeChild(announcement);
                }, 1000);
            };
        }

        // Anunciar ações de CRUD
        this.setupCRUDAnnouncements();
    }

    static setupCRUDAnnouncements() {
        // Interceptar ToastManager para anúncios
        const originalShow = ToastManager.show;
        ToastManager.show = function(message, type, duration, options) {
            const toast = originalShow.call(this, message, type, duration, options);
            
            // Criar anúncio para leitores de tela
            if (type === 'success' || type === 'error') {
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
                announcement.setAttribute('aria-atomic', 'true');
                announcement.className = 'sr-only';
                announcement.textContent = message;
                
                document.body.appendChild(announcement);
                setTimeout(() => {
                    if (document.body.contains(announcement)) {
                        document.body.removeChild(announcement);
                    }
                }, 2000);
            }
            
            return toast;
        };
    }

    // Adicionar estilos para elementos apenas para leitores de tela
    static addScreenReaderStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            
            .focus-visible {
                outline: 2px solid #7c3aed;
                outline-offset: 2px;
            }
            
            button:focus-visible,
            input:focus-visible,
            select:focus-visible,
            textarea:focus-visible {
                outline: 2px solid #7c3aed;
                outline-offset: 2px;
            }
            
            .modal.active {
                outline: none;
            }
            
            tr[tabindex]:focus {
                background-color: #f3f4f6;
                outline: 2px solid #7c3aed;
                outline-offset: -2px;
            }
        `;
        document.head.appendChild(style);
    }

    // Configurar indicadores de carregamento acessíveis
    static setupLoadingIndicators() {
        // Criar indicador de carregamento global
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.setAttribute('aria-live', 'polite');
        loadingIndicator.setAttribute('aria-atomic', 'true');
        loadingIndicator.className = 'sr-only';
        document.body.appendChild(loadingIndicator);
    }

    // Anunciar carregamento
    static announceLoading(message = 'Carregando...') {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.textContent = message;
        }
    }

    // Anunciar conclusão
    static announceComplete(message = 'Carregamento concluído') {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.textContent = message;
            setTimeout(() => {
                indicator.textContent = '';
            }, 1000);
        }
    }

    // Melhorar contraste de cores
    static setupHighContrast() {
        // Detectar preferência de alto contraste
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Adicionar estilos de alto contraste
        const style = document.createElement('style');
        style.textContent = `
            .high-contrast {
                --primary-color: #000000;
                --secondary-color: #ffffff;
                --border-color: #000000;
                --text-color: #000000;
                --bg-color: #ffffff;
            }
            
            .high-contrast .btn-primary {
                background-color: #000000 !important;
                color: #ffffff !important;
                border: 2px solid #000000 !important;
            }
            
            .high-contrast .btn-secondary {
                background-color: #ffffff !important;
                color: #000000 !important;
                border: 2px solid #000000 !important;
            }
            
            .high-contrast .card {
                border: 2px solid #000000 !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar acessibilidade quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    AccessibilityManager.init();
    AccessibilityManager.addScreenReaderStyles();
    AccessibilityManager.setupLoadingIndicators();
    AccessibilityManager.setupHighContrast();
});