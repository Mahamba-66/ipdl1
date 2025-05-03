const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  auteur: {
    type: String,
    required: true
  },
  categorie: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true
  },
  anneePublication: {
    type: Number,
    required: true
  },
  editeur: {
    type: String,
    required: true
  },
  quantiteDisponible: {
    type: Number,
    default: 1
  },
  quantiteTotale: {
    type: Number,
    default: 1
  },
  empruntePar: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dateAjout: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    default: '/images/default-book.jpg'
  }
});

// Méthode pour vérifier la disponibilité
BookSchema.methods.estDisponible = function() {
  return this.quantiteDisponible > 0;
};

// Méthode pour emprunter un livre
BookSchema.methods.emprunter = async function(userId) {
  if (!this.estDisponible()) {
    throw new Error('Ce livre n\'est pas disponible');
  }
  
  this.quantiteDisponible -= 1;
  this.empruntePar.push(userId);
  await this.save();
  
  return true;
};

// Méthode pour retourner un livre
BookSchema.methods.retourner = async function(userId) {
  const index = this.empruntePar.indexOf(userId);
  
  if (index === -1) {
    throw new Error('Ce livre n\'a pas été emprunté par cet utilisateur');
  }
  
  this.quantiteDisponible += 1;
  this.empruntePar.splice(index, 1);
  await this.save();
  
  return true;
};

module.exports = mongoose.model('Book', BookSchema);