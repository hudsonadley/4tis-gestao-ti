#!/bin/bash

# Script para atualizar a versão em todos os arquivos relevantes
NEW_VERSION="v1.0.19"
DATE=$(date +%d/%m/%Y)

# Atualiza complete_system.js
sed -i "s/Versão Monolítica v[0-9]\+\.[0-9]\+\.[0-9]\+/Versão Monolítica ${NEW_VERSION}/g" complete_system.js
sed -i "s/CURRENT_VERSION = 'v[0-9]\+\.[0-9]\+\.[0-9]\+'/CURRENT_VERSION = '${NEW_VERSION}'/g" complete_system.js

# Atualiza index.html
sed -i "s/v[0-9]\+\.[0-9]\+\.[0-9]\+/${NEW_VERSION}/g" index.html

# Atualiza README.md
sed -i "s/version-[0-9]\+\.[0-9]\+\.[0-9]\+/version-${NEW_VERSION#v}/g" README.md
sed -i "s/Últimas Atualizações (v[0-9]\+\.[0-9]\+\.[0-9]\+)/Últimas Atualizações (${NEW_VERSION})/g" README.md

# Atualiza js/changelog.js
sed -i "s/CURRENT_VERSION = 'v[0-9]\+\.[0-9]\+\.[0-9]\+'/CURRENT_VERSION = '${NEW_VERSION}'/g" js/changelog.js

echo "Versão atualizada para ${NEW_VERSION} em todos os arquivos!"
