const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/auth');

// Tableau de bord administrateur
router.get('/dashboard', isAdmin, adminController.getDashboard);

// Gestion des utilisateurs
router.get('/users', isAdmin, adminController.getUsers);
router.get('/users/:id', isAdmin, adminController.getUser);
router.post('/users/:id/block', isAdmin, adminController.blockUser);

// Documentation API administrateur
router.get('/api', isAdmin, adminController.getApiDocs);

module.exports = router;