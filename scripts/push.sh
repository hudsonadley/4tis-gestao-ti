#!/bin/bash

# Script de push automático com incremento de versão

# Diretório raiz do projeto
PROJECT_DIR="/workspaces/4tis-gestao-ti"

# Obtém a versão atual a partir do README.md (badge URL)
current_version=$(grep -oP '(?<=version-)[0-9]+\.[0-9]+\.[0-9]+' "$PROJECT_DIR/README.md")

# Se não encontrar, encerra
if [ -z "$current_version" ]; then
    echo "Versão atual não encontrada no README.md."
    exit 1
fi

IFS='.' read -r major minor patch <<< "$current_version"
patch=$((patch + 1))
new_version="${major}.${minor}.${patch}"

echo "Atualizando versão de $current_version para $new_version..."

# Atualiza o badge de versão e referências internas no README.md
sed -i "s/version-$current_version/version-$new_version/g" "$PROJECT_DIR/README.md"

# Atualiza a versão no changelog (em js/changelog.js)
sed -i "s/const CURRENT_VERSION = 'v$current_version'/const CURRENT_VERSION = 'v$new_version'/g" "$PROJECT_DIR/js/changelog.js"

# Atualiza a versão no complete_system.js, se presente (assumindo padrão: version: 'v...')
sed -i "s/version: 'v$current_version'/version: 'v$new_version'/g" "$PROJECT_DIR/complete_system.js"

# Atualiza a versão exibida na index.html, se presente (assumindo comentário no formato: <!-- Version: v... -->)
sed -i "s/<!-- Version: v$current_version -->/<!-- Version: v$new_version -->/g" "$PROJECT_DIR/index.html"

# Mensagem de commit
cd "$PROJECT_DIR"

git add .

commit_message="🚀 Version bump: v$new_version"

echo "Comitando com mensagem: $commit_message"

git commit -m "$commit_message"

# Push para o branch main
git push origin main

# Fim do script
