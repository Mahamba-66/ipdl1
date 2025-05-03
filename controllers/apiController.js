const Book = require('../models/Book');
const User = require('../models/User');

// Liste des livres (GET)
exports.getBooks = async (req, res) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    
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
    
    if (category) {
      query.categorie = category;
    }
    
    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);
    const skip = (page - 1) * limit;
    
    const books = await Book.find(query)
      .select('titre auteur categorie isbn quantiteDisponible quantiteTotale')
      .skip(skip)
      .limit(limit)
      .sort({ dateAjout: -1 });
    
    res.status(200).json({
      success: true,
      count: books.length,
      pagination: {
        totalBooks,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: books
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des livres'
    });
  }
};

// Détails d'un livre (GET)
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .select('-empruntePar');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du livre'
    });
  }
};

// Ajouter un livre (POST, admin seulement)
exports.addBook = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé, réservé aux administrateurs'
      });
    }
    
    const { titre, auteur, categorie, description, isbn, anneePublication, editeur, quantiteTotale } = req.body;
    
    // Vérifier si tous les champs nécessaires sont présents
    if (!titre || !auteur || !categorie || !description || !isbn || !anneePublication || !editeur || !quantiteTotale) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir tous les champs requis'
      });
    }
    
    // Vérifier si le livre existe déjà (ISBN)
    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      return res.status(400).json({
        success: false,
        message: 'Un livre avec cet ISBN existe déjà'
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
    
    res.status(201).json({
      success: true,
      data: newBook
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'ajout du livre'
    });
  }
};

// Mettre à jour un livre (PUT, admin seulement)
exports.updateBook = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé, réservé aux administrateurs'
      });
    }
    
    let book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }
    
    const { titre, auteur, categorie, description, isbn, anneePublication, editeur, quantiteTotale } = req.body;
    
    // Vérifier si l'ISBN existe déjà mais pas pour ce livre
    if (isbn && isbn !== book.isbn) {
      const isbnExists = await Book.findOne({ isbn });
      if (isbnExists) {
        return res.status(400).json({
          success: false,
          message: 'Un autre livre avec cet ISBN existe déjà'
        });
      }
    }
    
    // Préparer les données à mettre à jour
    const updateData = {};
    if (titre) updateData.titre = titre;
    if (auteur) updateData.auteur = auteur;
    if (categorie) updateData.categorie = categorie;
    if (description) updateData.description = description;
    if (isbn) updateData.isbn = isbn;
    if (anneePublication) updateData.anneePublication = anneePublication;
    if (editeur) updateData.editeur = editeur;
    
    // Gérer les quantités
    if (quantiteTotale) {
      const diff = quantiteTotale - book.quantiteTotale;
      updateData.quantiteTotale = quantiteTotale;
      updateData.quantiteDisponible = book.quantiteDisponible + diff;
    }
    
    book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du livre'
    });
  }
};

// Supprimer un livre (DELETE, admin seulement)
exports.deleteBook = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé, réservé aux administrateurs'
      });
    }
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }
    
    // Vérifier si le livre est emprunté
    if (book.empruntePar.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce livre car il est actuellement emprunté'
      });
    }
    
    await book.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Livre supprimé avec succès'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du livre'
    });
  }
};

// Emprunter un livre (POST)
exports.empruntLivre = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const user = req.user;
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur a déjà emprunté ce livre
    if (user.empruntActuel.includes(book._id)) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà emprunté ce livre'
      });
    }
    
    // Vérifier la disponibilité
    if (!book.estDisponible()) {
      return res.status(400).json({
        success: false,
        message: 'Ce livre n\'est pas disponible pour le moment'
      });
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
    
    res.status(200).json({
      success: true,
      message: 'Livre emprunté avec succès',
      data: book
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'emprunt du livre'
    });
  }
};

// Retourner un livre (POST)
exports.retourLivre = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const user = req.user;
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur a emprunté ce livre
    const empruntIndex = user.empruntActuel.indexOf(book._id);
    if (empruntIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Vous n\'avez pas emprunté ce livre'
      });
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
    
    res.status(200).json({
      success: true,
      message: 'Livre retourné avec succès',
      data: book
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du retour du livre'
    });
  }
};

// Obtenir le profil utilisateur (GET)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'empruntActuel',
        select: 'titre auteur isbn'
      })
      .populate({
        path: 'historique.livre',
        select: 'titre auteur isbn'
      });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil'
    });
  }
};

// Liste des utilisateurs (GET, admin seulement)
exports.getUsers = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé, réservé aux administrateurs'
      });
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
    
    const users = await User.find(query)
      .select('nom prenom email dateInscription empruntActuel')
      .sort({ dateInscription: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs'
    });
  }
};