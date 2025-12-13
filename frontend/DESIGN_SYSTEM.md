# Design System Metro - Guide Complet

## 📐 Vue d'Ensemble

Ce design system combine la charte graphique PEM (jaune/or #fecb00) avec une palette de gris ultra-riche (14 nuances) pour créer une interface moderne, professionnelle et hautement hiérarchisée.

---

## 🎨 Palette de Couleurs

### Couleur Principale
- **Primary**: `#fecb00` (Jaune/Or PEM)
- **Primary Dark**: `#d4a800`
- **Primary Light**: `#ffda3d`

### Palette de Gris (14 nuances)
```
50  → #fafafa  (Ultra léger)
100 → #f4f4f5  (Très léger)
150 → #ececed  (Custom - Backgrounds subtils)
200 → #e4e4e7  (Léger)
250 → #d9d9dc  (Custom - Séparateurs mid-tone)
300 → #d4d4d8  (Moyen-léger)
400 → #a1a1aa  (Moyen)
500 → #71717a  (Moyen-foncé)
600 → #52525b  (Foncé)
700 → #3f3f46  (Très foncé)
800 → #27272a  (Ultra foncé)
850 → #1f1f22  (Custom - Deep charcoal)
900 → #18181b  (Presque noir)
950 → #09090b  (Noir absolu)
```

### Hiérarchie de Texte (7 niveaux)
```
--color-text-emphasis    → Zinc 950 (Maximum emphasis)
--color-text-primary     → Zinc 800 (Titres principaux)
--color-text-secondary   → Zinc 600 (Corps de texte)
--color-text-tertiary    → Zinc 500 (Texte tertiaire)
--color-text-muted       → Zinc 400 (Texte atténué)
--color-text-subtle      → Zinc 300 (Texte subtil)
--color-text-disabled    → Zinc 200 (Texte désactivé)
```

### Backgrounds (Système de couches)
```
--color-bg-base          → Zinc 200 (Canvas de base)
--color-bg-main          → Zinc 100 (Fond principal)
--color-bg-surface       → White (Cards, panels)
--color-bg-surface-alt   → Zinc 50 (Surface alternative)
--color-bg-elevated      → White + shadow (Éléments élevés)
--color-bg-muted         → Zinc 100 (Sections atténuées)
--color-bg-subtle        → Zinc 50 (Sections subtiles)
```

### Borders (4 niveaux)
```
--color-border-strong    → Zinc 300 (Bordures fortes)
--color-border-default   → Zinc 200 (Bordures par défaut)
--color-border-light     → Zinc 100 (Bordures légères)
--color-border-subtle    → Zinc 50 (Dividers subtils)
```

---

## 📝 Typographie

### Polices
- **Primaire**: Oswald (Titres, navigation, boutons)
- **Secondaire**: Fira Sans (Corps de texte)

### Hiérarchie des Titres
```css
h1 → 40px/50px, weight: 400, uppercase
h2 → 24px/30px, weight: 300, uppercase
h3 → 20px/24px, weight: 300, uppercase
h4 → 18px/22px, weight: 700, uppercase
h5 → 14px/16px, weight: 700, uppercase, color: primary
h6 → 12px, weight: 700, uppercase, color: tertiary
```

---

## 🧩 Composants

### 1. SECTIONS & LAYOUTS

```html
<!-- Section avec fond base -->
<section class="section-base">...</section>

<!-- Section avec fond principal -->
<section class="section-main">...</section>

<!-- Section élevée avec ombre -->
<section class="section-elevated">...</section>

<!-- Section atténuée -->
<section class="section-muted">...</section>

<!-- Section sombre -->
<section class="section-dark">...</section>
```

### 2. DIVIDERS (Séparateurs)

```html
<!-- Divider standard -->
<div class="divider"></div>

<!-- Divider léger -->
<div class="divider-light"></div>

<!-- Divider fort -->
<div class="divider-strong"></div>

<!-- Divider avec gradient -->
<div class="divider-gradient"></div>
```

### 3. PANELS (Conteneurs)

```html
<!-- Panel standard -->
<div class="panel">Contenu</div>

<!-- Panel atténué -->
<div class="panel-muted">Contenu</div>

<!-- Panel avec emphasis -->
<div class="panel-emphasis">Contenu</div>
```

### 4. CARDS (12 variantes)

```html
<!-- Card standard avec hover -->
<div class="card">Contenu</div>

<!-- Card élevée (plus d'ombre) -->
<div class="card-elevated">Contenu</div>

<!-- Card plate (sans ombre) -->
<div class="card-flat">Contenu</div>

<!-- Card atténuée (fond gris) -->
<div class="card-muted">Contenu</div>

<!-- Card glass (glassmorphism) -->
<div class="card-glass">Contenu</div>

<!-- Card sombre -->
<div class="card-dark">Contenu</div>

<!-- Card avec accent top -->
<div class="card-accent-top">Contenu</div>

<!-- Card avec accent left -->
<div class="card-accent-left">Contenu</div>

<!-- Avec header et footer -->
<div class="card">
  <div class="card-header">
    <h3>Titre</h3>
  </div>
  <div>Contenu principal</div>
  <div class="card-footer">Actions</div>
</div>
```

### 5. BOUTONS (8 variantes + tailles)

```html
<!-- Bouton primaire (jaune/or) -->
<button class="btn-primary">Action Principale</button>

<!-- Bouton secondaire (outline) -->
<button class="btn-secondary">Action Secondaire</button>

<!-- Bouton danger -->
<button class="btn-danger">Supprimer</button>

<!-- Bouton gris -->
<button class="btn-gray">Annuler</button>

<!-- Bouton ghost (transparent) -->
<button class="btn-ghost">Subtil</button>

<!-- Tailles -->
<button class="btn-primary btn-sm">Petit</button>
<button class="btn-primary">Normal</button>
<button class="btn-primary btn-lg">Grand</button>

<!-- État disabled -->
<button class="btn-primary" disabled>Désactivé</button>
```

### 6. FORMULAIRES

```html
<!-- Input standard -->
<label class="label">Nom d'utilisateur</label>
<input type="text" class="input-field" placeholder="Entrez votre nom">

<!-- Label atténué -->
<label class="label-muted">Email (optionnel)</label>
<input type="email" class="input-field">

<!-- Input atténué -->
<input type="text" class="input-muted" placeholder="Recherche...">

<!-- Input avec emphasis -->
<input type="text" class="input-emphasis" placeholder="Important">

<!-- Select -->
<select class="input-field">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<!-- Textarea -->
<textarea class="input-field" placeholder="Votre message..."></textarea>

<!-- Checkbox -->
<input type="checkbox" class="checkbox">

<!-- Radio -->
<input type="radio" class="radio" name="choice">
```

### 7. TABLES (Sophistiquées)

```html
<!-- Table standard -->
<div class="table-container">
  <table class="table">
    <thead class="table-header">
      <tr>
        <th class="table-header-cell">Nom</th>
        <th class="table-header-cell">Email</th>
        <th class="table-header-cell">Actions</th>
      </tr>
    </thead>
    <tbody class="table-body">
      <tr class="table-row-hover">
        <td class="table-cell-emphasis">John Doe</td>
        <td class="table-cell">john@example.com</td>
        <td class="table-cell-muted">...</td>
      </tr>
      <!-- Row sélectionnée -->
      <tr class="table-row-selected">
        <td class="table-cell">Jane Smith</td>
        <td class="table-cell">jane@example.com</td>
        <td class="table-cell">...</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Table striped (lignes alternées) -->
<div class="table-container table-striped">
  <!-- contenu -->
</div>

<!-- Table bordered -->
<div class="table-container table-bordered">
  <!-- contenu -->
</div>

<!-- Table avec header sombre -->
<div class="table-container">
  <table class="table">
    <thead class="table-header-dark">
      <!-- contenu -->
    </thead>
  </table>
</div>
```

### 8. BADGES (15+ variantes)

```html
<!-- Badges colorés (light) -->
<span class="badge badge-success">Actif</span>
<span class="badge badge-warning">En attente</span>
<span class="badge badge-danger">Erreur</span>
<span class="badge badge-info">Information</span>
<span class="badge badge-gray">Neutre</span>

<!-- Badges solid -->
<span class="badge badge-success-solid">Succès</span>
<span class="badge badge-warning-solid">Attention</span>
<span class="badge badge-danger-solid">Critique</span>
<span class="badge badge-gray-solid">Inactif</span>

<!-- Badges avec dot indicator -->
<span class="badge badge-success badge-dot">En ligne</span>
<span class="badge badge-danger badge-dot">Hors ligne</span>

<!-- Badge dark -->
<span class="badge badge-dark">Premium</span>

<!-- Badge outline -->
<span class="badge badge-outline">Brouillon</span>

<!-- Tailles -->
<span class="badge badge-success badge-sm">Petit</span>
<span class="badge badge-success">Normal</span>
<span class="badge badge-success badge-lg">Grand</span>
```

### 9. ALERTS (Messages système)

```html
<div class="alert alert-success">Opération réussie !</div>
<div class="alert alert-warning">Attention : vérifiez vos données</div>
<div class="alert alert-danger">Erreur : impossible de sauvegarder</div>
<div class="alert alert-info">Information : nouvelle version disponible</div>
<div class="alert alert-gray">Note : fonctionnalité en beta</div>
```

### 10. GLASSMORPHISM

```html
<!-- Glass standard (clair) -->
<div class="glass p-6 rounded-pem">Contenu avec effet verre</div>

<!-- Glass dark (sombre) -->
<div class="glass-dark p-6 rounded-pem">Contenu sombre</div>

<!-- Glass heavy (plus opaque) -->
<div class="glass-heavy p-6 rounded-pem">Contenu verre épais</div>

<!-- Glass subtle (très léger) -->
<div class="glass-subtle p-6 rounded-pem">Contenu subtil</div>
```

### 11. NAVIGATION

```html
<!-- Nav item standard -->
<a href="#" class="nav-item">Dashboard</a>
<a href="#" class="nav-item-active">Instruments</a>

<!-- Navigation sombre -->
<nav class="nav-dark">
  <a href="#" class="nav-item">Dashboard</a>
  <a href="#" class="nav-item-active">Instruments</a>
</nav>

<!-- Dropdown -->
<div class="dropdown">
  <div class="dropdown-item">Option 1</div>
  <div class="dropdown-item">Option 2</div>
  <div class="dropdown-item">Option 3</div>
</div>
```

### 12. MODALS

```html
<!-- Overlay -->
<div class="modal-overlay"></div>

<!-- Modal -->
<div class="modal">
  <div class="modal-header">
    <h3>Titre du Modal</h3>
  </div>
  <div class="modal-body">
    Contenu principal du modal
  </div>
  <div class="modal-footer">
    <button class="btn-secondary">Annuler</button>
    <button class="btn-primary">Confirmer</button>
  </div>
</div>
```

### 13. SKELETON LOADERS

```html
<!-- Skeleton pour texte -->
<div class="skeleton-text"></div>

<!-- Skeleton pour titre -->
<div class="skeleton-title"></div>

<!-- Skeleton pour cercle (avatar) -->
<div class="skeleton-circle w-12 h-12"></div>

<!-- Skeleton personnalisé -->
<div class="skeleton h-40 w-full"></div>
```

### 14. PROGRESS BARS

```html
<!-- Progress bar standard -->
<div class="progress-bar">
  <div class="progress-bar-fill" style="width: 60%"></div>
</div>

<!-- Progress bar striped -->
<div class="progress-bar progress-bar-striped">
  <div class="progress-bar-fill" style="width: 75%"></div>
</div>
```

---

## ✨ Animations

### Classes d'animation
```html
<div class="animate-fade-in">Fade in</div>
<div class="animate-fade-in-up">Fade in up</div>
<div class="animate-fade-in-down">Fade in down</div>
<div class="animate-slide-in-right">Slide from right</div>
<div class="animate-slide-in-left">Slide from left</div>
<div class="animate-scale-in">Scale in</div>
<div class="animate-pulse">Pulse</div>
<div class="animate-spin">Spin (loader)</div>
```

### Delays
```html
<div class="animate-fade-in animate-delay-100">...</div>
<div class="animate-fade-in animate-delay-200">...</div>
<div class="animate-fade-in animate-delay-300">...</div>
<div class="animate-fade-in animate-delay-500">...</div>
```

---

## 🛠️ Utilitaires

### Classes de texte
```html
<p class="text-emphasis">Texte avec maximum emphasis</p>
<p class="text-primary">Texte primary</p>
<p class="text-secondary">Texte secondary</p>
<p class="text-tertiary">Texte tertiary</p>
<p class="text-muted">Texte atténué</p>
<p class="text-subtle">Texte subtil</p>
<p class="text-disabled">Texte désactivé</p>
```

### Classes de background
```html
<div class="bg-base">Fond base</div>
<div class="bg-main">Fond principal</div>
<div class="bg-surface">Fond surface</div>
<div class="bg-muted">Fond atténué</div>
<div class="bg-subtle">Fond subtil</div>
```

### Classes de bordure
```html
<div class="border border-default">Bordure par défaut</div>
<div class="border border-light">Bordure légère</div>
<div class="border border-strong">Bordure forte</div>
```

### Ombres
```html
<div class="shadow-xs">Ombre XS</div>
<div class="shadow-premium">Ombre medium</div>
<div class="shadow-premium-lg">Ombre large</div>
<div class="shadow-premium-xl">Ombre XL</div>
<div class="shadow-premium-2xl">Ombre 2XL</div>
<div class="shadow-inner">Ombre intérieure</div>
```

### Transitions
```html
<div class="transition-fast">Transition rapide (150ms)</div>
<div class="transition-base">Transition normale (200ms)</div>
<div class="transition-slow">Transition lente (300ms)</div>
<div class="transition-slower">Transition très lente (500ms)</div>
```

### Focus states
```html
<button class="focus-ring">Focus avec primary</button>
<button class="focus-ring-gray">Focus gris</button>
```

### Effets hover
```html
<div class="hover-lift">Lift au hover</div>
<div class="hover-glow">Glow au hover</div>
```

### Autres
```html
<!-- Désactivé -->
<div class="disabled">Contenu désactivé</div>

<!-- Truncate multi-lignes -->
<p class="truncate-2">Texte tronqué sur 2 lignes...</p>
<p class="truncate-3">Texte tronqué sur 3 lignes...</p>

<!-- Spacing premium -->
<div class="space-y-premium">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid pattern -->
<div class="grid-pattern h-64">Zone avec motif grille</div>
<div class="grid-pattern-dense h-64">Grille dense</div>
```

---

## 🎭 Patterns d'Usage

### Card avec Action
```html
<div class="card hover-lift">
  <div class="card-header">
    <h3>Titre de la Card</h3>
    <span class="badge badge-success">Actif</span>
  </div>
  
  <div class="space-y-premium">
    <p class="text-secondary">Description du contenu...</p>
    <div class="divider-light"></div>
    <p class="text-muted">Informations supplémentaires</p>
  </div>
  
  <div class="card-footer flex justify-end gap-3">
    <button class="btn-secondary btn-sm">Annuler</button>
    <button class="btn-primary btn-sm">Valider</button>
  </div>
</div>
```

### Formulaire Complet
```html
<div class="card">
  <form class="space-y-premium">
    <div>
      <label class="label">Nom complet</label>
      <input type="text" class="input-field" placeholder="John Doe">
    </div>
    
    <div>
      <label class="label-muted">Email (optionnel)</label>
      <input type="email" class="input-muted" placeholder="john@example.com">
    </div>
    
    <div>
      <label class="label">Rôle</label>
      <select class="input-field">
        <option>Administrateur</option>
        <option>Technicien</option>
        <option>Responsable</option>
      </select>
    </div>
    
    <div class="divider-gradient"></div>
    
    <div class="flex justify-end gap-3">
      <button type="button" class="btn-secondary">Annuler</button>
      <button type="submit" class="btn-primary">Enregistrer</button>
    </div>
  </form>
</div>
```

### Liste avec Badges et Actions
```html
<div class="card-flat">
  <div class="space-y-2">
    <div class="flex items-center justify-between p-4 hover:bg-gray-50 transition-base rounded-pem">
      <div class="flex items-center gap-4">
        <div class="skeleton-circle w-10 h-10"></div>
        <div>
          <h4 class="text-emphasis text-base">Instrument #001</h4>
          <p class="text-muted text-sm">pH-mètre Mettler Toledo</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="badge badge-success badge-dot">Actif</span>
        <button class="btn-ghost btn-sm">Voir</button>
      </div>
    </div>
    
    <div class="divider-light"></div>
    
    <div class="flex items-center justify-between p-4 hover:bg-gray-50 transition-base rounded-pem">
      <!-- Item 2 -->
    </div>
  </div>
</div>
```

---

## 🌓 Dark Mode (Optionnel)

Variables dark mode disponibles :
```css
--color-dark-base: #09090b      (Zinc 950)
--color-dark-surface: #18181b   (Zinc 900)
--color-dark-surface-alt: #27272a (Zinc 800)
--color-dark-elevated: #3f3f46   (Zinc 700)
```

---

## 📱 Responsive

Le système est entièrement responsive avec breakpoints :
- Mobile : < 480px
- Tablette : 768px
- Desktop : 1000px

---

## 🎯 Bonnes Pratiques

1. **Hiérarchie visuelle** : Utilisez les 7 niveaux de gris de texte pour créer de la profondeur
2. **Cohérence** : Restez dans le système (pas de couleurs custom)
3. **Accessibilité** : Tous les contrastes sont WCAG AA
4. **Performance** : Utilisez les classes CSS plutôt que du style inline
5. **Animations** : Utilisez avec parcimonie pour ne pas surcharger
6. **Ombres** : Respectez les 7 niveaux d'élévation
7. **Coins carrés** : Gardez `rounded-pem` (0px) pour rester fidèle à PEM

---

**Version** : 2.0  
**Date** : 13 décembre 2025  
**Maintenu par** : Équipe Metro
