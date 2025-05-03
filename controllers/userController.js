const User = require('../models/User');
const Book = require('../models/Book');
const { validationResult } = require('express-validator');

// Afficher le profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
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
      return res.redirect('/');
    }
    
    res.render('users/profile', {
      title: 'Mon profil',
      user,
      apiToken: user.apiToken
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement du profil');
    res.redirect('/');
  }
};

// Afficher la page API pour l'utilisateur
exports.getApiDocs = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé');
      return res.redirect('/');
    }
    
    res.render('users/api', {
      title: 'Documentation API',
      user,
      apiToken: user.apiToken
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page API');
    res.redirect('/profile');
  }
};

// Afficher le formulaire de modification du profil
exports.getEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé');
      return res.redirect('/');
    }
    
    res.render('users/edit', {
      title: 'Modifier mon profil',
      user,
      errors: []
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement du formulaire');
    res.redirect('/profile');
  }
};

// Mettre à jour le profil utilisateur
exports.putUpdateProfile = async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('users/edit', {
      title: 'Modifier mon profil',
      user: { ...req.body, _id: req.session.user.id },
      errors: errors.array()
    });
  }
  
  try {
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé');
      return res.redirect('/');
    }
    
    const { nom, prenom, email } = req.body;
    
    // Vérifier si l'email est déjà utilisé
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        req.flash('error_msg', 'Cet email est déjà utilisé');
        return res.render('users/edit', {
          title: 'Modifier mon profil',
          user: { ...req.body, _id: req.session.user.id },
          errors: []
        });
      }
    }
    
    // Mettre à jour les données
    user.nom = nom;
    user.prenom = prenom;
    user.email = email;
    
    await user.save();
    
    // Mettre à jour la session
    req.session.user.nom = nom;
    req.session.user.prenom = prenom;
    req.session.user.email = email;
    
    req.flash('success_msg', 'Profil mis à jour avec succès');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors de la mise à jour du profil');
    res.redirect('/profile/edit');
  }
};

// Afficher le formulaire de changement de mot de passe
exports.getChangePassword = (req, res) => {
  res.render('users/password', {
    title: 'Changer de mot de passe',
    errors: []
  });
};

// Mettre à jour le mot de passe
exports.putUpdatePassword = async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('users/password', {
      title: 'Changer de mot de passe',
      errors: errors.array()
    });
  }
  
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé');
      return res.redirect('/');
    }
    
    // Vérifier le mot de passe actuel
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      req.flash('error_msg', 'Mot de passe actuel incorrect');
      return res.render('users/password', {
        title: 'Changer de mot de passe',
        errors: []
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    req.flash('success_msg', 'Mot de passe mis à jour avec succès');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors de la mise à jour du mot de passe');
    res.redirect('/profile/password');
  }
};