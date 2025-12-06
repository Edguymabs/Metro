# 🔄 Méthodes Alternatives de Transfert - VPS Hostinger

## 🎯 Méthode 1 : Via Git (Recommandé - Le Plus Simple)

Si vous avez un repository Git (GitHub, GitLab, etc.) :

### Sur votre machine locale

```bash
cd /Users/mabs/Documents/Metro

# Initialiser Git si pas déjà fait
git init
git add .
git commit -m "Initial commit"

# Créer un repo sur GitHub/GitLab et pousser
# (ou utiliser un repo existant)
```

### Sur le VPS (Terminal hPanel)

```bash
# Installer Git si nécessaire
sudo apt update
sudo apt install -y git

# Cloner le projet
mkdir -p ~/apps
cd ~/apps
git clone [VOTRE_URL_GIT] Metro
cd Metro

# Lancer le déploiement
chmod +x deploy-vps-hostinger.sh
./deploy-vps-hostinger.sh
```

**Avantages** : Simple, rapide, versionné

---

## 🎯 Méthode 2 : Archive + Upload via Terminal

### Étape 1 : Créer l'archive sur votre machine

```bash
cd /Users/mabs/Documents
tar -czf Metro.tar.gz Metro/
```

### Étape 2 : Uploader via un service temporaire

**Option A : Transfert.sh (gratuit, simple)**

```bash
# Sur votre machine locale
cd /Users/mabs/Documents
curl --upload-file Metro.tar.gz https://transfer.sh/Metro.tar.gz
```

Cela vous donnera un lien de téléchargement. Copiez-le.

**Option B : GitHub Release (si vous avez un repo)**

1. Créez un release sur GitHub
2. Uploader `Metro.tar.gz` comme asset
3. Récupérez le lien de téléchargement direct

### Étape 3 : Télécharger sur le VPS

Dans le terminal hPanel :

```bash
mkdir -p ~/apps
cd ~/apps

# Télécharger l'archive (remplacer URL par votre lien)
wget https://transfer.sh/[VOTRE_LIEN]/Metro.tar.gz

# OU depuis GitHub
# wget https://github.com/[USER]/[REPO]/releases/download/[TAG]/Metro.tar.gz

# Décompresser
tar -xzf Metro.tar.gz

# Lancer le déploiement
cd Metro
chmod +x deploy-vps-hostinger.sh
./deploy-vps-hostinger.sh
```

---

## 🎯 Méthode 3 : SCP avec mot de passe (si vous avez le mot de passe root)

### Étape 1 : Récupérer le mot de passe root

1. Allez sur https://hpanel.hostinger.com
2. VPS → Votre VPS
3. Cherchez "Reset Password" ou "SSH Password"
4. Réinitialisez le mot de passe root si nécessaire

### Étape 2 : Créer le répertoire sur le VPS

Dans le terminal hPanel :

```bash
mkdir -p ~/apps
```

### Étape 3 : Transférer depuis votre machine

```bash
cd /Users/mabs/Documents/Metro
scp -r . root@82.112.255.148:~/apps/Metro
# Entrer le mot de passe quand demandé
```

---

## 🎯 Méthode 4 : Créer les fichiers directement sur le VPS

Si les méthodes ci-dessus ne fonctionnent pas, on peut créer les fichiers essentiels directement :

### Dans le terminal hPanel

```bash
mkdir -p ~/apps/Metro
cd ~/apps/Metro

# Créer docker-compose.yml
nano docker-compose.yml
# Copier le contenu depuis votre machine locale

# Créer les autres fichiers essentiels
# ...
```

**Note** : Cette méthode est fastidieuse, préférez les méthodes 1 ou 2.

---

## 🎯 Méthode 5 : Utiliser rsync (si SSH fonctionne)

```bash
# Sur votre machine locale
cd /Users/mabs/Documents/Metro

# Installer rsync si nécessaire
# brew install rsync  # sur Mac

# Transférer
rsync -avz --progress . root@82.112.255.148:~/apps/Metro/
```

---

## ✅ Recommandation : Méthode 1 (Git)

**C'est la plus simple et la plus propre** :

1. Créer un repo Git (GitHub/GitLab) - 2 minutes
2. Pousser votre code - 1 minute
3. Cloner sur le VPS - 1 minute
4. Lancer le script - 15 minutes

**Total** : ~20 minutes

---

## 🚀 Script Rapide pour Méthode 1

Si vous choisissez Git, voici un script pour automatiser :

```bash
# Sur votre machine locale
cd /Users/mabs/Documents/Metro

# Créer repo Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit for beta test"

# Créer repo sur GitHub (via interface web)
# Puis :
git remote add origin https://github.com/[USER]/[REPO].git
git push -u origin main

# Sur le VPS (terminal hPanel) :
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/[USER]/[REPO].git Metro
cd Metro
chmod +x deploy-vps-hostinger.sh
./deploy-vps-hostinger.sh
```

---

## 📞 Quelle méthode choisir ?

| Méthode | Difficulté | Temps | Recommandé |
|---------|-----------|-------|------------|
| **Git** | ⭐ Facile | 5 min | ✅ OUI |
| **Archive + Transfer.sh** | ⭐⭐ Moyen | 10 min | ✅ OUI |
| **SCP** | ⭐⭐⭐ Difficile | 15 min | Si SSH configuré |
| **Fichiers manuels** | ⭐⭐⭐⭐ Très difficile | 1h+ | ❌ NON |

**Je recommande fortement la méthode Git** ! 🎯

