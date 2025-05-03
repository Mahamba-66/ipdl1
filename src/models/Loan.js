const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    livre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    date_emprunt: {
        type: Date,
        default: Date.now
    },
    date_retour_prevue: {
        type: Date,
        required: true
    },
    date_retour_effective: {
        type: Date
    },
    status: {
        type: String,
        enum: ['en_cours', 'retourne', 'en_retard'],
        default: 'en_cours'
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des recherches
loanSchema.index({ utilisateur: 1, livre: 1, status: 1 });

// Middleware pour mettre à jour la quantité disponible du livre
loanSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Book = mongoose.model('Book');
        await Book.findByIdAndUpdate(this.livre, {
            $inc: { quantite_disponible: -1 }
        });
    }
    next();
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
