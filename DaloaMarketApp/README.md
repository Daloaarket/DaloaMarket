# DaloaMarket - React Native App

Application mobile React Native pour DaloaMarket, la première marketplace P2P de Daloa.

## 🚀 Fonctionnalités

- **Authentification** : Inscription, connexion avec Supabase
- **Annonces** : Création, recherche, filtrage d'annonces
- **Messagerie** : Chat en temps réel entre utilisateurs
- **Profil** : Gestion du profil utilisateur
- **Paiements** : Intégration PayDunya pour les frais de publication
- **Photos** : Upload d'images via caméra ou galerie

## 📱 Technologies

- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **Supabase** pour la base de données et l'authentification
- **NativeWind** pour le styling (Tailwind CSS)
- **Expo Router** pour la navigation
- **React Hook Form** pour les formulaires

## 🛠 Installation

1. **Cloner le projet**
```bash
cd DaloaMarketApp
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Expo**
```bash
npx expo install
```

4. **Lancer l'application**
```bash
npm start
```

## 📦 Build APK

### Avec EAS Build (Recommandé)

1. **Installer EAS CLI**
```bash
npm install -g @expo/eas-cli
```

2. **Se connecter à Expo**
```bash
eas login
```

3. **Configurer le projet**
```bash
eas build:configure
```

4. **Build APK**
```bash
eas build --platform android --profile preview
```

### Build local (Alternative)

```bash
npx expo run:android
```

## 🔧 Configuration

### Variables d'environnement

Les credentials Supabase sont déjà configurés dans `lib/supabase.ts` :

- **SUPABASE_URL** : `https://exnxmwkrgyidlauqmtuh.supabase.co`
- **SUPABASE_ANON_KEY** : Clé d'accès configurée

### Permissions Android

L'app demande les permissions suivantes :
- **CAMERA** : Pour prendre des photos
- **READ_EXTERNAL_STORAGE** : Pour accéder à la galerie
- **ACCESS_FINE_LOCATION** : Pour la géolocalisation (futur)

## 📁 Structure du projet

```
DaloaMarketApp/
├── app/                    # Pages avec Expo Router
│   ├── (tabs)/            # Navigation par onglets
│   ├── auth/              # Pages d'authentification
│   └── _layout.tsx        # Layout principal
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI de base
│   └── listings/         # Composants spécifiques aux annonces
├── contexts/             # Contextes React (Auth)
├── lib/                  # Utilitaires et configuration
│   ├── supabase.ts       # Configuration Supabase
│   ├── database.types.ts # Types TypeScript
│   └── utils.ts          # Fonctions utilitaires
└── assets/               # Images et ressources
```

## 🎨 Design System

L'app utilise **NativeWind** (Tailwind CSS pour React Native) avec :

- **Couleurs principales** : Orange (#FF7F00) et Bleu (#0066CC)
- **Typographie** : SF Pro Display / Roboto
- **Composants** : Boutons, inputs, cards avec design cohérent
- **Responsive** : Adaptation automatique aux différentes tailles d'écran

## 🔐 Authentification

- **Inscription/Connexion** avec email/mot de passe
- **Gestion de session** automatique avec Supabase
- **Profil utilisateur** obligatoire pour publier des annonces
- **Sécurité** : RLS (Row Level Security) activé sur toutes les tables

## 💳 Paiements

- **PayDunya** pour les frais de publication (200 FCFA)
- **WebView** pour le processus de paiement
- **Callback** automatique pour valider les transactions

## 📱 Navigation

- **5 onglets principaux** :
  - Accueil : Dernières annonces et catégories
  - Recherche : Filtres avancés et résultats
  - Vendre : Création d'annonces
  - Messages : Conversations en temps réel
  - Profil : Gestion du compte utilisateur

## 🚀 Déploiement

### Google Play Store

1. **Build de production**
```bash
eas build --platform android --profile production
```

2. **Télécharger l'APK/AAB**
3. **Upload sur Google Play Console**

### Distribution directe

1. **Build APK**
```bash
eas build --platform android --profile preview
```

2. **Partager le lien de téléchargement**

## 🐛 Debug

- **Expo DevTools** : `npm start` puis scanner le QR code
- **React Native Debugger** pour le debugging avancé
- **Flipper** pour l'inspection réseau et base de données

## 📞 Support

Pour toute question ou problème :
- **Email** : contact@daloamarket.com
- **Téléphone** : +225 07 88 00 08 31

---

**DaloaMarket** - Achetez et vendez à Daloa 🛍️