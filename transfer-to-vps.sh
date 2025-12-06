#!/bin/bash
# Script pour transférer le projet Metro au VPS Hostinger

VPS_IP="82.112.255.148"
VPS_USER="root"
REMOTE_DIR="~/apps/Metro"

echo "🚀 Transfert du projet Metro au VPS"
echo "===================================="
echo ""
echo "📍 VPS: $VPS_USER@$VPS_IP"
echo "📍 Destination: $REMOTE_DIR"
echo ""

# Créer le répertoire distant d'abord
echo "📁 Création du répertoire distant..."
ssh $VPS_USER@$VPS_IP "mkdir -p ~/apps"

# Transférer le projet
echo "📦 Transfert des fichiers (cela peut prendre quelques minutes)..."
scp -r . $VPS_USER@$VPS_IP:~/apps/Metro

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Transfert réussi !"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Se connecter au VPS: ssh $VPS_USER@$VPS_IP"
    echo "   2. Aller dans le projet: cd ~/apps/Metro"
    echo "   3. Lancer le déploiement: ./deploy-vps-hostinger.sh"
else
    echo ""
    echo "❌ Erreur lors du transfert"
    exit 1
fi

