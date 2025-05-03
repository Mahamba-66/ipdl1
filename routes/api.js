const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const authController = require('../controllers/authController');

// Middleware pour vérifier le token API
router.use(authController.verifyApiToken);

// Endpoints livres
router.get('/books', apiController.getBooks);
router.post('/books', apiController.addBook);
router.post('/books/:id/emprunter', apiController.empruntLivre);
router.post('/books/:id/retourner', apiController.retourLivre);
router.put('/books/:id', apiController.updateBook);
router.delete('/books/:id', apiController.deleteBook);
router.get('/books/:id', apiController.getBook); 

// Endpoints utilisateur
router.get('/profile', apiController.getProfile);
router.get('/users', apiController.getUsers);

module.exports = router;
