const Book = require('../models/Book');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Afficher tous les livres
exports.getAllBooks = async (req, res) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';
    
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { titre: { $regex: search, $options: 'i' } },
          { auteur: { $regex: search, $options: 'i' } },
          { isbn: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    if (category && category !== 'Toutes') {
      query.categorie = category;
    }
    
    const books = await Book.find(query).sort({ dateAjout: -1 });
    const categories = await Book.distinct('categorie');
    
    res.render('books/index', {
      title: 'Catalogue de livres',
      books,
      categories,
      search,
      category
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement des livres');
    res.redirect('/');
  }
};

// Afficher un livre spécifique
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('empruntePar', 'nom prenom');
    
    if (!book) {
      req.flash('error_msg', 'Livre non trouvé');
      return res.redirect('/books');
    }

    // Vous devez ajouter currentUser ici
    const currentUser = req.session.user; // Si vous utilisez la session pour l'utilisateur connecté
    
    res.render('books/show', {
      title: book.titre,
      book,
      currentUser  // Passez currentUser à la vue
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement du livre');
    res.redirect('/books');
  }
};


// Afficher le formulaire d'ajout de livre (admin seulement)
exports.getAddBook = (req, res) => {
  if (req.session.user.role !== 'admin') {
    req.flash('error_msg', 'Accès non autorisé');
    return res.redirect('/books');
  }
  
  res.render('books/add', {
    title: 'Ajouter un livre',
    book: {},
    errors: []
  });
};

// Ajouter un nouveau livre (admin seulement)
exports.postAddBook = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    req.flash('error_msg', 'Accès non autorisé');
    return res.redirect('/books');
  }
  
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('books/add', {
      title: 'Ajouter un livre',
      book: req.body,
      errors: errors.array()
    });
  }
  
  try {
    const { titre, auteur, categorie, description, isbn, anneePublication, editeur, quantiteTotale } = req.body;
    
    // Vérifier si le livre existe déjà (ISBN)
    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      req.flash('error_msg', 'Un livre avec cet ISBN existe déjà');
      return res.render('books/add', {
        title: 'Ajouter un livre',
        book: req.body,
        errors: []
      });
    }
    
    // Créer un nouveau livre
    const newBook = new Book({
      titre,
      auteur,
      categorie,
      description,
      isbn,
      anneePublication,
      editeur,
      quantiteTotale,
      quantiteDisponible: quantiteTotale
    });
    
    await newBook.save();
    
    req.flash('success_msg', 'Livre ajouté avec succès');
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors de l\'ajout du livre');
    res.redirect('/books/add');
  }
};

// Afficher le formulaire de modification d'un livre (admin seulement)
exports.getEditBook = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    req.flash('error_msg', 'Accès non autorisé');
    return res.redirect('/books');
  }
  
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      req.flash('error_msg', 'Livre non trouvé');
      return res.redirect('/books');
    }
    
    res.render('books/edit', {
      title: `Modifier ${book.titre}`,
      book,
      errors: []
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du chargement du livre');
    res.redirect('/books');
  }
};

// Mettre à jour un livre (admin seulement)
exports.putUpdateBook = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    req.flash('error_msg', 'Accès non autorisé');
    return res.redirect('/books');
  }
  
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('books/edit', {
      title: `Modifier ${req.body.titre}`,
      book: { ...req.body, _id: req.params.id },
      errors: errors.array()
    });
  }
  
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      req.flash('error_msg', 'Livre non trouvé');
      return res.redirect('/books');
    }
    
    const { titre, auteur, categorie, description, isbn, anneePublication, editeur, quantiteTotale } = req.body;
    
    // Vérifier si l'ISBN existe déjà mais pas pour ce livre
    if (isbn !== book.isbn) {
      const isbnExists = await Book.findOne({ isbn });
      if (isbnExists) {
        req.flash('error_msg', 'Un autre livre avec cet ISBN existe déjà');
        return res.render('books/edit', {
          title: `Modifier ${titre}`,
          book: { ...req.body, _id: req.params.id },
          errors: []
        });
      }
    }
    
    // Mettre à jour les données
    book.titre = titre;
    book.auteur = auteur;
    book.categorie = categorie;
    book.description = description;
    book.isbn = isbn;
    book.anneePublication = anneePublication;
    book.editeur = editeur;
    
    // Gérer les quantités
    const diff = quantiteTotale - book.quantiteTotale;
    book.quantiteTotale = quantiteTotale;
    book.quantiteDisponible += diff;
    
    await book.save();
    
    req.flash('success_msg', 'Livre mis à jour avec succès');
    res.redirect(`/books/${book._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors de la mise à jour du livre');
    res.redirect(`/books/edit/${req.params.id}`);
  }
};

// Supprimer un livre (admin seulement)
exports.deleteBook = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    req.flash('error_msg', 'Accès non autorisé');
    return res.redirect('/books');
  }
  
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      req.flash('error_msg', 'Livre non trouvé');
      return res.redirect('/books');
    }
    
    // Vérifier si le livre est emprunté
    if (book.empruntePar.length > 0) {
      req.flash('error_msg', 'Impossible de supprimer ce livre car il est actuellement emprunté');
      return res.redirect(`/books/${book._id}`);
    }
    
    await book.deleteOne();
    
    req.flash('success_msg', 'Livre supprimé avec succès');
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors de la suppression du livre');
    res.redirect(`/books/${req.params.id}`);
  }
};

// Emprunter un livre
exports.empruntLivre = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const user = await User.findById(req.session.user.id);
    
    if (!book || !user) {
      req.flash('error_msg', 'Livre ou utilisateur non trouvé');
      return res.redirect('/books');
    }
    
    // Vérifier si l'utilisateur a déjà emprunté ce livre
    if (user.empruntActuel.includes(book._id)) {
      req.flash('error_msg', 'Vous avez déjà emprunté ce livre');
      return res.redirect(`/books/${book._id}`);
    }
    
    // Vérifier la disponibilité
    if (!book.estDisponible()) {
      req.flash('error_msg', 'Ce livre n\'est pas disponible pour le moment');
      return res.redirect(`/books/${book._id}`);
    }
    
    // Emprunter le livre
    await book.emprunter(user._id);
    
    // Mettre à jour l'utilisateur
    user.empruntActuel.push(book._id);
    user.historique.push({
      livre: book._id,
      dateEmprunt: Date.now(),
      dateRetour: null
    });
    await user.save();
    
    req.flash('success_msg', 'Livre emprunté avec succès');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors de l\'emprunt du livre');
    res.redirect(`/books/${req.params.id}`);
  }
};

// Retourner un livre
exports.retourLivre = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const user = await User.findById(req.session.user.id);
    
    if (!book || !user) {
      req.flash('error_msg', 'Livre ou utilisateur non trouvé');
      return res.redirect('/profile');
    }
    
    // Vérifier si l'utilisateur a emprunté ce livre
    const empruntIndex = user.empruntActuel.indexOf(book._id);
    if (empruntIndex === -1) {
      req.flash('error_msg', 'Vous n\'avez pas emprunté ce livre');
      return res.redirect('/profile');
    }
    
    // Retourner le livre
    await book.retourner(user._id);
    
    // Mettre à jour l'utilisateur
    user.empruntActuel.splice(empruntIndex, 1);
    
    // Mettre à jour l'historique
    for (let i = 0; i < user.historique.length; i++) {
      if (user.historique[i].livre.toString() === book._id.toString() && !user.historique[i].dateRetour) {
        user.historique[i].dateRetour = Date.now();
        break;
      }
    }
    
    await user.save();
    
    req.flash('success_msg', 'Livre retourné avec succès');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Une erreur est survenue lors du retour du livre');
    res.redirect('/profile');
  }
};