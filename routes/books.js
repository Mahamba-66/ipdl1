const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const bookController = require('../controllers/bookController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Liste des livres
router.get('/', bookController.getAllBooks);

// Ajouter un livre (admin)
router.get('/add', isAdmin, bookController.getAddBook);
router.post('/add', isAdmin, [
  check('titre', 'Le titre est obligatoire').notEmpty(),
  check('auteur', 'L\'auteur est obligatoire').notEmpty(),
  check('categorie', 'La catégorie est obligatoire').notEmpty(),
  check('description', 'La description est obligatoire').notEmpty(),
  check('isbn', 'L\'ISBN est obligatoire').notEmpty(),
  check('anneePublication', 'L\'année de publication est obligatoire').notEmpty().isNumeric(),
  check('editeur', 'L\'éditeur est obligatoire').notEmpty(),
  check('quantiteTotale', 'La quantité est obligatoire').notEmpty().isNumeric()
], bookController.postAddBook);

// Modifier un livre (admin)
router.get('/edit/:id', isAdmin, bookController.getEditBook);
router.put('/edit/:id', isAdmin, [
  check('titre', 'Le titre est obligatoire').notEmpty(),
  check('auteur', 'L\'auteur est obligatoire').notEmpty(),
  check('categorie', 'La catégorie est obligatoire').notEmpty(),
  check('description', 'La description est obligatoire').notEmpty(),
  check('isbn', 'L\'ISBN est obligatoire').notEmpty(),
  check('anneePublication', 'L\'année de publication est obligatoire').notEmpty().isNumeric(),
  check('editeur', 'L\'éditeur est obligatoire').notEmpty(),
  check('quantiteTotale', 'La quantité est obligatoire').notEmpty().isNumeric()
], bookController.putUpdateBook);

// Emprunter un livre
router.post('/:id/emprunter', isAuthenticated, bookController.empruntLivre);

// Retourner un livre
router.post('/:id/retourner', isAuthenticated, bookController.retourLivre);

// Supprimer un livre (admin)
router.delete('/:id', isAdmin, bookController.deleteBook);

// Détails d'un livre (cette route dynamique DOIT venir à la fin)
router.get('/:id', bookController.getBook);

module.exports = router;
