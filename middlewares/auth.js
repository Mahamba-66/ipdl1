// Middleware pour vérifier si l'utilisateur est connecté
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page');
  res.redirect('/auth/login');
};

// Middleware pour vérifier si l'utilisateur est un administrateur
exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Accès non autorisé');
  res.redirect('/');
};

// Middleware pour vérifier si l'utilisateur n'est pas connecté
exports.isNotAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  if (req.session.user.role === 'admin') {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/profile');
  }
};