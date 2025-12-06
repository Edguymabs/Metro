# 🔧 Solution Transfert au VPS - Hostinger

## ❌ Problème Rencontré

```
scp: realpath apps/Metro: No such file or directory
```

Le répertoire n'existe pas encore sur le VPS.

---

## ✅ Solution : Utiliser le Terminal hPanel

**C'est la méthode la plus simple avec Hostinger !**

### Étape 1 : Créer le répertoire via hPanel

1. Allez sur **https://hpanel.hostinger.com**
2. Connectez-vous
3. Allez dans **VPS** → **Votre VPS** (srv1175369)
4. Cliquez sur **"Terminal"** ou **"SSH Access"**
5. Dans le terminal, exécutez :

```bash
mkdir -p ~/apps
cd ~/apps
```

### Étape 2 : Transférer les fichiers

**Option A : Via File Manager hPanel (Recommandé)**

1. Dans hPanel, allez dans **VPS** → **File Manager**
2. Naviguez vers `/root/apps/`
3. Créez un dossier `Metro`
4. **Uploader les fichiers** :
   - Soit via l'interface (drag & drop)
   - Soit créer une archive `.zip` sur votre machine et l'uploader, puis la décompresser

**Option B : Via Git (Si vous avez un repo)**

```bash
# Dans le terminal hPanel
cd ~/apps
git clone [VOTRE_REPO_GIT] Metro
cd Metro
```

**Option C : Créer une archive et l'uploader**

**Sur votre machine locale** :

```bash
cd /Users/mabs/Documents
tar -czf Metro.tar.gz Metro/
```

Puis :
1. Uploader `Metro.tar.gz` via File Manager hPanel
2. Dans le terminal hPanel :

```bash
cd ~/apps
tar -xzf ~/Metro.tar.gz
mv Metro Metro-temp
mv Metro-temp Metro
```

---

## 🚀 Une fois les fichiers transférés

Dans le terminal hPanel, exécutez :

```bash
cd ~/apps/Metro
chmod +x deploy-vps-hostinger.sh
./deploy-vps-hostinger.sh
```

Le script fera tout automatiquement !

---

## 🔑 Alternative : Configurer SSH avec mot de passe

Si vous préférez utiliser SSH depuis votre machine :

1. **Récupérer le mot de passe root** :
   - Email de création VPS Hostinger
   - OU dans hPanel → VPS → Reset Password

2. **Se connecter avec mot de passe** :
   ```bash
   ssh root@82.112.255.148
   # Entrer le mot de passe quand demandé
   ```

3. **Créer le répertoire** :
   ```bash
   mkdir -p ~/apps
   ```

4. **Depuis votre machine locale** :
   ```bash
   cd /Users/mabs/Documents/Metro
   scp -r . root@82.112.255.148:~/apps/Metro
   ```

---

## 📋 Méthode Recommandée (La Plus Simple)

**Utiliser le Terminal hPanel** :

1. ✅ Terminal hPanel → Créer `~/apps`
2. ✅ File Manager → Uploader les fichiers
3. ✅ Terminal hPanel → Exécuter `./deploy-vps-hostinger.sh`

**C'est tout !** Pas besoin de configurer SSH. 🎉

---

## 🆘 Besoin d'Aide ?

- **Guide complet** : [`INSTRUCTIONS_DEPLOIEMENT_AUTO.md`](INSTRUCTIONS_DEPLOIEMENT_AUTO.md)
- **Connexion VPS** : [`CONNEXION_VPS_HOSTINGER.md`](CONNEXION_VPS_HOSTINGER.md)

