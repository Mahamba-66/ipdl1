const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { isNotAuthenticated, isAuthenticated } = require('../middlewares/auth');

// Inscription
router.get('/register', isNotAuthenticated, authController.getRegister);
router.post('/register', isNotAuthenticated, [
  check('nom', 'Le nom est obligatoire').notEmpty(),
  check('prenom', 'Le prénom est obligatoire').notEmpty(),
  check('email', 'Veuillez fournir un email valide').isEmail(),
  check('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 }),
  check('password2').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    return true;
  })
], authController.postRegister);

// Connexion
router.get('/login', isNotAuthenticated, authController.getLogin);
router.post('/login', isNotAuthenticated, [
  check('email', 'Veuillez fournir un email valide').isEmail(),
  check('password', 'Le mot de passe est obligatoire').notEmpty()
], authController.postLogin);

// Déconnexion
router.get('/logout', isAuthenticated, authController.logout);

// Génération de token API
router.post('/generate-token', isAuthenticated, authController.generateApiToken);

module.exports = router;