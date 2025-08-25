#!/bin/bash

# Obtém a versão atual do arquivo changelog.js
version=$(grep "CURRENT_VERSION = '" /workspaces/4tis-gestao-ti/js/changelog.js | cut -d"'" -f2)

# Verifica se há alterações para commit
git status --porcelain | grep -q "."
if [ $? -eq 0 ]; then
    echo "🔄 Preparando commit para versão $version..."
    
    # Adiciona todas as alterações
    git add .
    
    # Cria o commit com a mensagem padronizada
    git commit -m "🚀 Release $version" -m "Atualização automática do sistema"
    
    # Push para o repositório remoto
    git push origin main
    
    echo "✅ Commit e push realizados com sucesso!"
else
    echo "📝 Não há alterações para commit"
fi
