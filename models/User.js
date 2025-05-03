const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'utilisateur'],
    default: 'utilisateur'
  },
  apiToken: {
    type: String,
    default: null
  },
  tokenCreatedAt: {
    type: Date,
    default: null
  },
  dateInscription: {
    type: Date,
    default: Date.now
  },
  empruntActuel: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  historique: [{
    livre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    dateEmprunt: Date,
    dateRetour: Date
  }]
});

// Méthode pour vérifier le mot de passe
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware pour hasher le mot de passe avant l'enregistrement
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour générer un nouveau token API
UserSchema.methods.generateApiToken = async function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.apiToken = token;
  this.tokenCreatedAt = Date.now();
  await this.save();
  
  return token;
};

module.exports = mongoose.model('User', UserSchema);