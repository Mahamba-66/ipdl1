# Système de Gestion de Bibliothèque - Version Node.js

Ce projet est une API RESTful pour un système de gestion de bibliothèque développé avec Node.js, Express et MongoDB.

## Fonctionnalités

- Gestion des utilisateurs (inscription, connexion, rôles)
- Gestion des livres (ajout, modification, suppression)
- Gestion des emprunts et retours
- Gestion des catégories
- Système de recherche avancé
- Tests automatisés

## Installation

1. Cloner le projet
2. Installer les dépendances : `npm install`
3. Configurer le fichier `.env`
4. Démarrer MongoDB
5. Lancer le serveur : `npm start`

## Tests

Pour exécuter les tests : `npm test`

## Structure du Projet

```
src/
  ├── models/         # Modèles Mongoose
  ├── routes/         # Routes Express
  ├── controllers/    # Logique métier
  ├── middleware/     # Middleware (auth, etc.)
  ├── utils/          # Utilitaires
  └── app.js         # Point d'entrée
```
