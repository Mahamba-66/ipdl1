const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const userController = require('../controllers/userController');

// Page d'accueil
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Accueil',
    isHomePage: true
  });
});

// Profil utilisateur
router.get('/profile', isAuthenticated, userController.getProfile);

// Modification du profil
router.get('/profile/edit', isAuthenticated, userController.getEditProfile);
router.put('/profile/edit', isAuthenticated, userController.putUpdateProfile);

// Changement de mot de passe
router.get('/profile/password', isAuthenticated, userController.getChangePassword);
router.put('/profile/password', isAuthenticated, userController.putUpdatePassword);

// Documentation API utilisateur
router.get('/profile/api', isAuthenticated, userController.getApiDocs);

module.exports = router;