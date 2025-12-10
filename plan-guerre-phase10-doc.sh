#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   PHASE 10 : DOCUMENTATION FINALE"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd ~/apps/Metro

REPORT_FILE="RAPPORT_TESTS_$(date +%Y%m%d).md"

echo "📝 Création du rapport de tests: $REPORT_FILE"
echo "────────────────────────────────────────────────────────────────"

cat > "$REPORT_FILE" << 'EOFTEMPLATE'
# Rapport Tests Plan Guerre Metro

**Date** : $(date '+%Y-%m-%d %H:%M:%S')

## Tests Effectués

### Phase 1-4: Infrastructure
- [ ] Diagnostic VPS → ✅/❌
- [ ] Mise à jour code (commit 63e9bd3) → ✅/❌
- [ ] Rebuild backend → ✅/❌
- [ ] Configuration post-démarrage → ✅/❌

### Phase 5: Tests Fonctionnels
- [ ] Test 1: API Health → ✅/❌
- [ ] Test 2: Validation Instruments (sans type/site) → ✅/❌
- [ ] Test 3: Backup SQL création → ✅/❌
- [ ] Test 4: Liste backups → ✅/❌
- [ ] Test 5: Téléchargement backup → ✅/❌
- [ ] Test 6: Export Excel → ✅/❌
- [ ] Test 7: Création instrument complet → ✅/❌

### Phase 6-7: Vérifications
- [ ] Logs sans erreurs critiques → ✅/❌
- [ ] Pas de console.log en production → ✅/❌
- [ ] Test 8: Persistence backups → ✅/❌

### Phase 8: Amélioration (Optionnel)
- [ ] Volume Docker pour backups → ✅/❌/⊗ (non fait)

### Phase 9: Tests Régression
- [ ] Login/Logout → ✅/❌
- [ ] Liste instruments → ✅/❌
- [ ] Modification instrument → ✅/❌
- [ ] Suppression instrument → ✅/❌
- [ ] Création intervention → ✅/❌
- [ ] Création site → ✅/❌
- [ ] Dashboard → ✅/❌

## État Final du Système

### Conteneurs Docker
EOFTEMPLATE

# Ajouter l'état actuel des conteneurs
echo '```' >> "$REPORT_FILE"
docker-compose ps >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo '' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOFTEMPLATE'
### Commit Git Actuel
EOFTEMPLATE

echo '```' >> "$REPORT_FILE"
git log -1 --oneline >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo '' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOFTEMPLATE'
### Test API Health
EOFTEMPLATE

echo '```json' >> "$REPORT_FILE"
curl -s http://localhost:5001/api/health | jq . >> "$REPORT_FILE" 2>&1 || curl -s http://localhost:5001/api/health >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo '' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOFTEMPLATE'
### Dossier Backups
EOFTEMPLATE

echo '```' >> "$REPORT_FILE"
docker-compose exec -T backend ls -lh /app/backups >> "$REPORT_FILE" 2>&1 || echo "Dossier backups non accessible" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo '' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOFTEMPLATE'
## Problèmes Rencontrés

(À compléter manuellement)

## Logs Importants

### Logs Backend (dernières 50 lignes)
```
EOFTEMPLATE

docker-compose logs backend --tail=50 >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOFTEMPLATE'
```

## Recommandations

(À compléter selon les résultats)

## Conclusion

Système opérationnel : ☐ OUI ☐ NON

**Points d'attention** :
- 
- 

**Prochaines étapes** :
- 
- 

---

*Rapport généré automatiquement par plan-guerre-phase10-doc.sh*
EOFTEMPLATE

echo "✅ Rapport créé: $REPORT_FILE"
echo ""
echo "📋 Contenu du rapport:"
echo "────────────────────────────────────────────────────────────────"
head -30 "$REPORT_FILE"
echo "..."
echo "(Voir $REPORT_FILE pour le rapport complet)"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ PHASE 10 TERMINÉE - Documentation créée"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🎉 PLAN DE GUERRE TERMINÉ"
echo ""
echo "Fichier rapport: $REPORT_FILE"
echo "Complétez les sections manuellement et partagez-le si besoin."
echo ""

