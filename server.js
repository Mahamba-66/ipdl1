require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts'); // ✅ Ajouté

// Import des routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB avec retry logic
const connectWithRetry = () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bibliotheque';
  
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  })
  .then(() => console.log('Connexion à MongoDB établie avec succès'))
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    console.log('Nouvelle tentative de connexion dans 5 secondes...');
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Configuration des middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'un_secret_tres_securise',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 heure
}));

// Flash messages
app.use(flash());

// Middleware pour les variables globales
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Configuration du moteur de template EJS avec layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);                            // ✅ Active les layouts
app.set('layout', 'layouts/main');                  // ✅ Définit le layout par défaut

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/books', booksRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Erreur 404
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page non trouvée',
    message: 'La page que vous recherchez n\'existe pas.'
  });
});

// Erreur serveur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Erreur serveur',
    message: 'Une erreur est survenue sur le serveur.'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
