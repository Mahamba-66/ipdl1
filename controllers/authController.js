const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// Afficher la page d'inscription
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Inscription',
    errors: []
  });
};

// Traiter l'inscription
exports.postRegister = async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/register', {
      title: 'Inscription',
      errors: errors.array(),
      user: req.body
    });
  }

  try {
    const { nom, prenom, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error_msg', 'Cet email est déjà utilisé');
      return res.render('auth/register', {
        title: 'Inscription',
        errors: [],
        user: req.body
      });
    }
    
    // Créer un nouvel utilisateur
    const newUser = new User({
      nom,
      prenom,
      email,
      password,
      role: 'utilisateur'
    });
    
    await newUser.save();
    
    req.flash('success_msg', 'Vous êtes maintenant inscrit et pouvez vous connecter');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors de l\'inscription');
    res.redirect('/auth/register');
  }
};

// Afficher la page de connexion
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Connexion',
    errors: []
  });
};

// Traiter la connexion
exports.postLogin = async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/login', {
      title: 'Connexion',
      errors: errors.array(),
      user: req.body
    });
  }

  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Email ou mot de passe incorrect');
      return res.render('auth/login', {
        title: 'Connexion',
        errors: [],
        user: req.body
      });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Email ou mot de passe incorrect');
      return res.render('auth/login', {
        title: 'Connexion',
        errors: [],
        user: req.body
      });
    }
    
    // Créer la session utilisateur
    req.session.user = {
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role
    };
    
    // Rediriger selon le rôle
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/profile');
    }
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors de la connexion');
    res.redirect('/auth/login');
  }
};

// Déconnexion
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

// Générer un token API
exports.generateApiToken = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé');
      return res.redirect('/profile');
    }
    
    const token = await user.generateApiToken();
    
    req.flash('success_msg', 'Votre token API a été généré avec succès');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors de la génération du token');
    res.redirect('/profile');
  }
};

// Vérifier le token API
exports.verifyApiToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token non fourni' });
    }
    
    const user = await User.findOne({ apiToken: token });
    
    if (!user) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    // Vérifier si le token est expiré (30 jours)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - user.tokenCreatedAt > thirtyDaysInMs) {
      return res.status(401).json({ message: 'Token expiré' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification du token' });
  }
};