#!/usr/bin/env node
/**
 * Script pour nettoyer et restaurer un backup SQL
 * Supprime les commandes \restrict et \unrestrict non-standard
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
    console.log('Usage: node fix-backup-restore.js <fichier.sql>');
    console.log('Exemple: node fix-backup-restore.js backup.sql');
    process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = inputFile.replace(/\.sql$/, '_cleaned.sql');

console.log('🧹 Nettoyage du backup SQL...');
console.log(`   Source: ${inputFile}`);
console.log(`   Destination: ${outputFile}`);

try {
    // Lire le fichier
    const content = fs.readFileSync(inputFile, 'utf8');
    
    // Supprimer les lignes \restrict et \unrestrict
    const lines = content.split('\n');
    const cleanedLines = lines.filter(line => {
        return !line.match(/^\\(un)?restrict\s/);
    });
    
    // Écrire le fichier nettoyé
    fs.writeFileSync(outputFile, cleanedLines.join('\n'), 'utf8');
    
    const removed = lines.length - cleanedLines.length;
    
    console.log('');
    console.log('✅ Nettoyage terminé');
    console.log(`   Lignes originales: ${lines.length}`);
    console.log(`   Lignes nettoyées: ${cleanedLines.length}`);
    console.log(`   Lignes supprimées: ${removed}`);
    console.log('');
    console.log(`📝 Fichier propre: ${outputFile}`);
    console.log('');
    console.log('Pour restaurer:');
    console.log(`docker exec -i metro-postgres psql -U metro -d metro_db < "${outputFile}"`);
    
} catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
}

