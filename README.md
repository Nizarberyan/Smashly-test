# Smashly AI — Reproduction React Native de l'Écran d'Accueil

Ce projet est la reproduction fidèle et interactive en **React Native / Expo** de l'écran d'accueil mobile de **Smashly AI**, conçue à partir du kit de test, des spécifications de [`COULEURS.md`](./COULEURS.md) et des captures de référence dans [`captures/`](./captures/).

---

## 📱 Fonctionnalités Implémentées

### 1. Écran d'accueil principal ([`src/components/WelcomeScreen.tsx`](./src/components/WelcomeScreen.tsx))
- **Fond & Voile sombre** : Image `hero-welcome-test.jpg` avec dégradé vertical exact : `rgba(2,6,23,0.35)` en haut, `0.25` au milieu, `0.45` en bas (`expo-linear-gradient`).
- **Header supérieur** : Logo Smashly officiel (`pwa-icon-192.png`) à gauche et cloche de notification (`Bell` de Lucide) à droite.
- **Titre d'accroche** : *"Un coach, un partenaire ou un club ?"* avec ombre portée fidèle (`textShadow`).
- **Zone d'input chat / recherche** :
  - Fond `#0f1a30`, bordure `#2a3b5c`, arrondi 16 px avec ombre portée.
  - Placeholder dynamique qui s'adapte au mode actif (Communauté vs Assistant).
  - Icônes d'actions : Ampoule (`Lightbulb`), Partage avec toast *"✓ Lien copié"* (`Share2`), Micro (`Mic`), et bouton d'envoi bleu avec flèche (`ArrowUp`).
  - Badge toggle réseau (icône maillons) positionné sous l'input en mode Communauté.
- **Paquet de cartes 3D interactif (Deck) avec animation physique de distribution** :
  - **Animation de bascule (Card Dealing & Shuffle)** : Lorsqu'on appuie sur une carte, la carte du premier plan glisse latéralement vers la gauche avec une inclinaison réaliste (-9°), passe en arrière-plan, tandis que la carte du dessous s'avance, redresse son angle (de 6° à 0°) et grandit à l'échelle 100% au premier plan.
  - **Carte active (au premier plan)** :
    - Mode Communauté : fond `#162a4d`, bordure bleue `#3b82f6`, badge "✓ Actif" bleu, mascotte communauté.
    - Mode Assistant : fond `#3d341c`, bordure jaune `#facc15`, badge "✓ Actif" jaune, mascotte assistant.
  - **Carte de derrière** : fond `#0e1729`, bordure `#22314f`, décalée de 12 px, inclinée de 6°, échelle 95 %, avec bouton circulaire de switch (`RefreshCw`).
- **Carré des raccourcis** :
  - Fond `#0e1729`, bordure `#22314f`, arrondi 16 px, trait de séparation slate-600 à 70 %.
  - Carrés bleus 32 × 32 px `#2563eb` avec arrondi 8 px et icônes blanches 20 px (`CalendarDays` pour *"Rejoins une partie"*, `GraduationCap` pour *"Réserve ton coach"*).
- **Barre de navigation inférieure flottante** :
  - Capsule fond sombre `rgba(30, 41, 59, 0.95)`, bordure `rgba(100, 116, 139, 0.5)`.
  - Boutons : Communauté (`Users2`), Carte (`Map`), Bouton central `+` avec dégradé vertical `#3b82f6` (15 %) → `#facc15` (85 %), Icône terrain padel SVG dédiée ([`PadelCourtIcon.tsx`](./src/components/PadelCourtIcon.tsx)), et Avatar utilisateur ([`PadelBallLogo.tsx`](./src/components/PadelBallLogo.tsx)).

### 2. Écrans interactifs additionnels
- **Parties ouvertes ([`src/components/OpenMatchesModal.tsx`](./src/components/OpenMatchesModal.tsx))** : Accessible en cliquant sur *"Rejoins une partie"*, reprenant la capture `openmatcheslist.jpeg` avec les filtres en pilules, la carte de match complète (César, Léo, Julien, place libre), pronostics et actions.
- **Fiche détaillée du match ([`src/components/MatchDetailModal.tsx`](./src/components/MatchDetailModal.tsx))** : Accessible en cliquant sur un match, reprenant `openmatchcard.jpeg` (hero image, itinéraire, joueurs, avertissement niveau).
- **Modal de filtres ([`src/components/FiltersModal.tsx`](./src/components/FiltersModal.tsx))** : Accessible via le bouton *"Filtres"* de la liste des parties, reprenant `filtersmatches.jpeg` (rayon de recherche, niveau Smashly, toggle mon niveau, boutons format).

---

## 🚀 Lancement du Projet

Le projet utilise **Expo SDK 52+** et **React Native**.


### 1. Démarrer avec Expo CLI (iOS / Android / Web)
```bash
npx expo start
```
- Scannez le QR Code avec l'application **Expo Go** sur votre téléphone iOS ou Android.
- Appuyez sur **`a`** pour lancer sur un émulateur Android ou **`i`** pour simulateur iOS.

### 2. Vérification des types
```bash
npx tsc --noEmit
```

---

## 📂 Architecture des Fichiers

```
smashly_kit_test/
├── App.tsx                     # Point d'entrée principal avec gestion des modals
├── app.json                    # Configuration Expo
├── package.json                # Dépendances (expo, react-native, lucide-react-native, svg)
├── tsconfig.json               # Configuration TypeScript
├── COULEURS.md                 # Spécifications de design fournies
├── LISEZ-MOI.md                # Description initiale du kit
├── src/
│   ├── components/
│   │   ├── WelcomeScreen.tsx   # Écran d'accueil principal Smashly
│   │   ├── OpenMatchesModal.tsx# Liste des parties ouvertes
│   │   ├── MatchDetailModal.tsx# Détail d'une partie
│   │   ├── FiltersModal.tsx    # Filtres de recherche
│   │   ├── PadelCourtIcon.tsx  # Icône terrain de padel SVG React Native
│   │   └── PadelBallLogo.tsx   # Balle de padel personnalisée SVG React Native
│   ├── theme/
│   │   └── colors.ts           # Palette de couleurs extraite de COULEURS.md
│   └── i18n/
│       └── index.ts            # Helper de traduction branché sur textes/
├── captures/                   # Captures d'écran de référence
├── images/                     # Assets (fond de court, mascottes, icônes)
├── code/                       # Code source web d'origine
└── textes/                     # Fichiers de localisation fr/en
```
