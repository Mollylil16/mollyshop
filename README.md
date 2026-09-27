# 👞 mollyShop Abidjan — E-Commerce Souliers de Prestige & Sneakers

Plateforme e-commerce haut de gamme spécialisée dans la vente de souliers de cérémonie, derbies de luxe et sneakers certifiées pour Abidjan (Côte d'Ivoire).

Architecture complète : **Frontend moderne**, **Backend Node.js / Express**, et **Base de données MongoDB**.

---

## 🚀 Comment tester le projet ? (2 Méthodes)

### 📌 Méthode 1 : Tester en local sur un ordinateur (Pour un développeur ou évaluateur)

#### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [MongoDB](https://www.mongodb.com/try/download/community) installé en local (ou une URL MongoDB Atlas)

#### 2. Cloner le projet
```bash
git clone https://github.com/Mollylil16/mollyshop.git
cd mollyshop
```

#### 3. Installer les dépendances
```bash
npm install
```

#### 4. Lancer le serveur
```bash
npm start
```

> ⚡ **Auto-seed automatique :** Au tout premier lancement, si votre base de données MongoDB est vide, le serveur insère automatiquement l'ensemble des **21 modèles authentiques** avec leurs prix en FCFA, descriptions, pointures et images ! Vous n'avez rien d'autre à configurer.

#### 5. Ouvrir l'application
- **Boutique Client :** [http://localhost:3000](http://localhost:3000)
- **Tableau de Bord Administrateur MongoDB :** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

### 🌐 Méthode 2 : Le partager en ligne via un lien web (Le plus simple pour un client)

Pour que n'importe qui (client, ami, investisseur) puisse tester directement depuis son smartphone ou son navigateur sans rien installer :

#### 1. Créer une base MongoDB Atlas dans le Cloud (Gratuit à vie)
1. Rendez-vous sur [mongodb.com/atlas](https://www.mongodb.com/atlas) et créez un compte gratuit.
2. Créez un cluster gratuit (**M0 Free Sandbox**).
3. Dans **Database Access**, créez un utilisateur (ex: `mollyadmin` / mot de passe).
4. Dans **Network Access**, ajoutez l'adresse IP `0.0.0.0/0` (Autoriser l'accès de partout).
5. Cliquez sur **Connect** > **Drivers** > Copiez la chaîne de connexion (ex: `mongodb+srv://mollyadmin:motdepasse@cluster0.mongodb.net/mollyshop?retryWrites=true&w=majority`).

#### 2. Déployer sur Render / Railway / Vercel
1. Liez votre dépôt GitHub `https://github.com/Mollylil16/mollyshop.git`.
2. Ajoutez la variable d'environnement :
   - `MONGO_URI` = votre lien MongoDB Atlas copié à l'étape précédente.
3. Déployez ! Le serveur se lancera et remplira automatiquement la base MongoDB en ligne.
4. Partagez simplement l'URL générée (ex: `https://mollyshop.onrender.com`).

---

## 🛠️ Fonctionnalités incluses

- **Catalogue dynamique MongoDB :** 21 paires classées par univers (*Ville & Cérémonie*, *Luxe & Créateurs*, *Sneakers & Streetwear*, *Avant-Garde*, *Baskets & Sport*).
- **Tarification en FCFA :** Prix réels adaptés au marché ivoirien avec livraison offerte dès 250 000 FCFA.
- **Panier d'achat interactif :** Tiroir latéral (*Cart Drawer*), gestion des quantités, codes promos.
- **Paiements locaux :** Wave Mobile Money, Orange Money, Carte Visa et espèces à la livraison.
- **Intégration WhatsApp direct :** Bouton de commande pré-rempli vers le service client (**07 89 88 60 13**).
- **Dashboard Admin dédié :** Gestion en direct des commandes enregistrées dans MongoDB, ajout/modification de paires et statistiques de ventes.

---

## 📁 Structure du Projet

```
mollyshop/
├── img/                # Photos officielles des souliers et logos
├── models/             # Modèles Mongoose MongoDB (Product.js, Order.js)
├── public/             # Frontend client
│   ├── css/            # Feuille de style luxe sombre
│   ├── js/             # Logique frontend, filtres et interactions
│   ├── index.html      # Boutique client
│   └── admin.html      # Tableau de bord administrateur MongoDB
├── seeds/              # Données de départ des 21 paires
├── server.js           # API REST Express & connexion MongoDB
└── package.json        # Dépendances Node.js
```
