const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { User, Book, Category } = require('../../src/models');

const adminId = new mongoose.Types.ObjectId();
const userId = new mongoose.Types.ObjectId();
const categoryId = new mongoose.Types.ObjectId();
const bookId = new mongoose.Types.ObjectId();

const admin = {
    _id: adminId,
    email: 'admin@test.com',
    password: 'Admin123!',
    nom: 'Admin',
    prenom: 'Test',
    role: 'admin'
};

const user = {
    _id: userId,
    email: 'user@test.com',
    password: 'User123!',
    nom: 'User',
    prenom: 'Test',
    role: 'membre'
};

const category = {
    _id: categoryId,
    nom: 'Romans',
    description: 'Tous types de romans'
};

const book = {
    _id: bookId,
    titre: 'Test Book',
    auteur: 'Test Author',
    isbn: '1234567890',
    categorie: categoryId,
    quantite_totale: 5,
    quantite_disponible: 5
};

const setupDatabase = async () => {
    await User.deleteMany();
    await Book.deleteMany();
    await Category.deleteMany();
    
    await new User(admin).save();
    await new User(user).save();
    await new Category(category).save();
    await new Book(book).save();
};

const getAuthToken = (id) => {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET);
};

module.exports = {
    adminId,
    userId,
    categoryId,
    bookId,
    admin,
    user,
    category,
    book,
    setupDatabase,
    getAuthToken
};
