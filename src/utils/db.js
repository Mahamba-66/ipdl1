const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Déjà connecté à MongoDB');
        return;
    }

    try {
        // Connexion à la base de données locale
        await mongoose.connect('mongodb://localhost:27017/bibliotheque');
        isConnected = true;
        console.log('MongoDB connecté avec succès');
    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
