// Sistema de Changelog Automático
const CURRENT_VERSION = 'v1.0.19'; // Versão atual do sistema

// Inicializa o changelog automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda um pouco para garantir que todos os recursos foram carregados
    setTimeout(checkForUpdates, 1000);
});

const CHANGELOG_DATA = {
    'v1.0.18': {
        title: '🔄 Sistema de Inativação Aprimorado',
        date: '2025-08-18',
        type: 'improvement',
        changes: [
            {
                screen: '👥 Colaboradores',
                emoji: '📝',
                type: 'new',
                title: 'Observações Obrigatórias na Devolução',
                description: 'Campo de observações obrigatório ao devolver equipamentos durante inativação'
            },
            {
                screen: '👥 Colaboradores',
                emoji: '🔄',
                type: 'improvement',
                title: 'Processo de Devolução Melhorado',
                description: 'Interface intuitiva com campos de observação que aparecem apenas para itens marcados'
            },
            {
                screen: '📧 Notificações',
                emoji: '✉️',
                type: 'new',
                title: 'Notificação Automática para RH',
                description: 'Sistema gera mensagem automática com detalhes dos equipamentos não devolvidos'
            },
            {
                screen: '📋 Histórico',
                emoji: '📊',
                type: 'improvement',
                title: 'Histórico Detalhado',
                description: 'Registro completo com estado dos equipamentos e observações de devolução'
            }
        ]
    },
    'v1.0.17': {
        title: '📝 Sistema de Devolução Aprimorado',
        date: '2025-08-18',
        type: 'improvement',
        changes: [
            {
                screen: '👥 Colaboradores',
                emoji: '✍️',
                type: 'new',
                title: 'Observações Obrigatórias',
                description: 'Campo obrigatório para registrar estado do equipamento na devolução'
            },
            {
                screen: '👥 Colaboradores',
                emoji: '📋',
                type: 'improvement',
                title: 'Histórico Detalhado',
                description: 'Histórico agora inclui estado do equipamento e observações completas'
            },
            {
                screen: '👥 Colaboradores',
                emoji: '🎯',
                type: 'improvement',
                title: 'Interface Intuitiva',
                description: 'Campo de observações aparece apenas para equipamentos marcados'
            }
        ]
    },
    'v1.0.16': {
        title: '� Sistema de Inativação e Devolução Aprimorado',
        date: '2025-08-18',
        type: 'improvement',
        changes: [
            {
                screen: '👥 Colaboradores',
                emoji: '📝',
                type: 'new',
                title: 'Campo de Observações na Devolução',
                description: 'Adicionado campo para registrar estado do equipamento durante a devolução'
            },
            {
                screen: '👥 Colaboradores',
                emoji: '🔄',
                type: 'improvement',
                title: 'Histórico Mais Completo',
                description: 'Histórico de devolução agora inclui observações e validações melhoradas'
            },
            {
                screen: '👥 Colaboradores',
                emoji: '🛡️',
                type: 'improvement',
                title: 'Sistema Mais Seguro',
                description: 'Validações reforçadas para garantir integridade dos dados'
            }
        ]
    }
};

function showChangelogModal(version) {
    const changelogData = CHANGELOG_DATA[version];
    if (!changelogData) return;

    const changes = changelogData.changes.map(change => `
        <div class="changelog-item mb-4">
            <div class="font-bold">${change.emoji} ${change.title}</div>
            <div class="text-sm text-gray-600 ml-6">${change.description}</div>
        </div>
    `).join('');

    const modalHTML = `
        <div class="modal active" id="changelogModal">
            <div class="modal-content max-w-lg w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-50">
                    <h3 class="text-lg font-semibold text-blue-900">
                        ${changelogData.title}
                    </h3>
                    <button onclick="closeChangelogModal()" class="text-gray-400 hover:text-gray-600">
                        <span class="text-2xl">&times;</span>
                    </button>
                </div>
                <div class="p-6 space-y-4">
                    <div class="text-sm text-gray-500 mb-4">
                        ${version} • ${changelogData.date}
                    </div>
                    <div class="space-y-4">
                        ${changes}
                    </div>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button onclick="closeChangelogModal()" class="btn btn-primary w-full">
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeChangelogModal() {
    const modal = document.getElementById('changelogModal');
    if (modal) {
        modal.remove();
    }
}

function checkForUpdates() {
    // Atualiza a marca d'água se existir
    const versionElement = document.querySelector('.fixed.bottom-2.left-2');
    if (versionElement) {
         versionElement.textContent = CURRENT_VERSION;
    }
    
    // Verifica se é a primeira visita ou se a versão foi atualizada
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    
    if (!lastSeenVersion || lastSeenVersion !== CURRENT_VERSION) {
        // Exibe o changelog automaticamente
        setTimeout(() => {
            showChangelogModal(CURRENT_VERSION);
            localStorage.setItem('lastSeenVersion', CURRENT_VERSION);
        }, 1500);
    }
}

// Função para mostrar changelog da versão atual
function showCurrentChangelog() {
    const versionElement = document.querySelector('.fixed.bottom-2.left-2');
    if (versionElement) {
        const currentVersion = versionElement.textContent.trim();
        showChangelogModal(currentVersion);
    }
}

// Verificar atualizações quando a página carregar
window.checkForUpdates = checkForUpdates;
window.showChangelogModal = showChangelogModal;
window.showCurrentChangelog = showCurrentChangelog;

// Inicializar changelog quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(checkForUpdates, 2000);
});