#!/bin/bash

# Instala pandoc e texlive se necessário
if ! command -v pandoc &> /dev/null; then
    echo "Instalando pandoc..."
    sudo apt-get update
    sudo apt-get install -y pandoc texlive-xetex
fi

# Define o diretório dos documentos
DOCS_DIR="/workspaces/4tis-gestao-ti/docs"

# Combina todos os arquivos markdown em um único
echo "Gerando documentação completa..."
cat "$DOCS_DIR/documentacao_tecnica.md" > "$DOCS_DIR/documentacao_completa.md"
echo -e "\n\n" >> "$DOCS_DIR/documentacao_completa.md"
echo "## Endpoints da API" >> "$DOCS_DIR/documentacao_completa.md"
cat "$DOCS_DIR/api_endpoints.md" >> "$DOCS_DIR/documentacao_completa.md"

# Converte para PDF
echo "Convertendo para PDF..."
pandoc "$DOCS_DIR/documentacao_completa.md" \
    -f markdown \
    -t pdf \
    --pdf-engine=xelatex \
    -V geometry:margin=1in \
    -V documentclass=report \
    -V fontsize=11pt \
    -o "$DOCS_DIR/4TIS_Documentacao_Tecnica_v1.0.18.pdf"

echo "✅ Documentação PDF gerada com sucesso!"
