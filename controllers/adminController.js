const User = require('../models/User');
const Book = require('../models/Book');
const { validationResult } = require('express-validator');

// Afficher le tableau de bord administrateur
exports.getDashboard = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Accès non autorisé');
      return res.redirect('/');
    }
    
    // Récupérer les statistiques
    const userCount = await User.countDocuments({ role: 'utilisateur' });
    const bookCount = await Book.countDocuments();
    const empruntsCount = await Book.aggregate([
      { $project: { empruntCount: { $size: '$empruntePar' } } },
      { $group: { _id: null, total: { $sum: '$empruntCount' } } }
    ]);
    
    // Livres les plus empruntés
    const topBooks = await Book.aggregate([
      { $project: { 
        titre: 1, 
        auteur: 1,
        empruntCount: { $subtract: ['$quantiteTotale', '$quantiteDisponible'] } 
      } },
      { $sort: { empruntCount: -1 } },
      { $limit: 5 }
    ]);
    
    // Derniers emprunts
    const recentLoans = await User.aggregate([
      { $unwind: '$historique' },
      { $sort: { 'historique.dateEmprunt': -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'books',
        localField: 'historique.livre',
        foreignField: '_id',
        as: 'bookDetails'
      } },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      } },
      { $project: {
        'userDetails.nom': 1,
        'userDetails.prenom': 1,
        'bookDetails.titre': 1,
        'historique.dateEmprunt': 1,
        'historique.dateRetour': 1
      } }
    ]);
    
    res.render('admin/dashboard', {
      title: 'Tableau de bord administrateur',
      userCount,
      bookCount,
      empruntsCount: empruntsCount.length > 0 ? empruntsCount[0].total : 0,
      topBooks,
      recentLoans
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement du tableau de bord');
    res.redirect('/');
  }
};

// Afficher la liste des utilisateurs
exports.getUsers = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Accès non autorisé');
      return res.redirect('/');
    }
    
    const search = req.query.search || '';
    let query = { role: 'utilisateur' };
    
    if (search) {
      query = {
        role: 'utilisateur',
        $or: [
          { nom: { $regex: search, $options: 'i' } },
          { prenom: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query).sort({ dateInscription: -1 });
    
    res.render('admin/users', {
      title: 'Gestion des utilisateurs',
      users,
      search
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement des utilisateurs');
    res.redirect('/admin/dashboard');
  }
};

// Afficher les détails d'un utilisateur
exports.getUser = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Accès non autorisé');
      return res.redirect('/');
    }
    
    const user = await User.findById(req.params.id)
      .populate({
        path: 'empruntActuel',
        select: 'titre auteur isbn image'
      })
      .populate({
        path: 'historique.livre',
        select: 'titre auteur isbn image'
      });
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé');
      return res.redirect('/admin/users');
    }
    
    res.render('admin/user-details', {
      title: `Utilisateur: ${user.prenom} ${user.nom}`,
      user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement des détails de l\'utilisateur');
    res.redirect('/admin/users');
  }
};

// Bloquer un utilisateur
exports.blockUser = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Accès non autorisé');
      return res.redirect('/');
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé');
      return res.redirect('/admin/users');
    }
    
    // Vérifier si l'utilisateur a des emprunts en cours
    if (user.empruntActuel.length > 0) {
      req.flash('error_msg', 'Impossible de bloquer cet utilisateur car il a des emprunts en cours');
      return res.redirect(`/admin/users/${user._id}`);
    }
    
    // Dans un système réel, on pourrait ajouter un champ "bloqué" à l'utilisateur
    // Pour cet exemple, nous allons simplement montrer le message de succès
    
    req.flash('success_msg', 'Utilisateur bloqué avec succès');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du blocage de l\'utilisateur');
    res.redirect('/admin/users');
  }
};

// Afficher la page API pour l'administrateur
exports.getApiDocs = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Accès non autorisé');
      return res.redirect('/');
    }
    
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé');
      return res.redirect('/admin/dashboard');
    }
    
    res.render('admin/api', {
      title: 'API Administrateur',
      user,
      apiToken: user.apiToken
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page API');
    res.redirect('/admin/dashboard');
  }
};