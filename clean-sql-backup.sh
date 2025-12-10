#!/bin/bash
# Script pour nettoyer les backups SQL avec commandes \restrict/\unrestrict

if [ $# -eq 0 ]; then
    echo "Usage: $0 <fichier.sql>"
    echo "Exemple: $0 backup.sql"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="${INPUT_FILE%.sql}_cleaned.sql"

if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Fichier introuvable: $INPUT_FILE"
    exit 1
fi

echo "🧹 Nettoyage du fichier SQL..."
echo "   Source: $INPUT_FILE"
echo "   Destination: $OUTPUT_FILE"

# Supprimer les lignes \restrict et \unrestrict
grep -v '^\\\(un\)\?restrict' "$INPUT_FILE" > "$OUTPUT_FILE"

ORIGINAL_SIZE=$(wc -l < "$INPUT_FILE")
CLEANED_SIZE=$(wc -l < "$OUTPUT_FILE")
REMOVED=$((ORIGINAL_SIZE - CLEANED_SIZE))

echo ""
echo "✅ Nettoyage terminé"
echo "   Lignes originales: $ORIGINAL_SIZE"
echo "   Lignes nettoyées: $CLEANED_SIZE"
echo "   Lignes supprimées: $REMOVED"
echo ""
echo "📝 Fichier propre: $OUTPUT_FILE"
echo ""
echo "Pour restaurer:"
echo "docker exec -i metro-postgres psql -U metro -d metro_db < \"$OUTPUT_FILE\""

