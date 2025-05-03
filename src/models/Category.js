const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual pour les sous-catégories
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Virtual pour les livres
categorySchema.virtual('livres', {
    ref: 'Book',
    localField: '_id',
    foreignField: 'categorie'
});

// Méthode pour obtenir l'arborescence complète
categorySchema.statics.getTree = async function() {
    const categories = await this.find({ parent: null })
        .populate({
            path: 'children',
            populate: { path: 'children' }
        });
    return categories;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
