const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true,
        trim: true
    },
    auteur: {
        type: String,
        required: true,
        trim: true
    },
    isbn: {
        type: String,
        required: true,
        trim: true
    },
    categorie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    quantite_totale: {
        type: Number,
        required: true,
        min: 0
    },
    quantite_disponible: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['disponible', 'indisponible'],
        default: 'disponible'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
bookSchema.virtual('emprunts', {
    ref: 'Loan',
    localField: '_id',
    foreignField: 'livre'
});

bookSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'livre'
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
