const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
    // Créer une instance MongoDB en mémoire pour les tests
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.disconnect(); // Déconnecter d'abord
    await mongoose.connect(mongoUri);
});

afterEach(async () => {
    // Nettoyer la base de données après chaque test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    // Fermer la connexion après tous les tests
    await mongoose.disconnect();
    await mongoServer.stop();
});
