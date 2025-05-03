require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bibliotheque', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB établie avec succès'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Fonction pour créer l'administrateur
const createAdmin = async () => {
  try {
    // Vérifier si l'admin existe déjà
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (adminExists) {
      console.log('L\'administrateur existe déjà');
      return;
    }
    
    // Créer un nouvel administrateur
    const admin = new User({
      nom: 'Admin',
      prenom: 'Système',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });
    
    await admin.save();
    console.log('Administrateur créé avec succès');
  } catch (err) {
    console.error('Erreur lors de la création de l\'administrateur:', err);
  }
};

// Fonction pour créer des livres de démonstration
const createBooks = async () => {
  try {
    // Vérifier si des livres existent déjà
    const booksCount = await Book.countDocuments();
    
    if (booksCount > 0) {
      console.log('Des livres existent déjà');
      return;
    }
    
    // Liste des livres à créer
    const books = [
      {
        titre: 'Le Petit Prince',
        auteur: 'Antoine de Saint-Exupéry',
        categorie: 'Roman',
        description: 'Un pilote d\'avion, contraint d\'atterrir dans le désert du Sahara, y rencontre un petit garçon venu d\'une autre planète. Ce petit prince lui raconte son histoire et lui fait découvrir une vision nouvelle de la vie.',
        isbn: '9782070612758',
        anneePublication: 1943,
        editeur: 'Gallimard',
        quantiteTotale: 5,
        quantiteDisponible: 5,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=387&ixlib=rb-4.0.3'
      },
      {
        titre: 'Les Misérables',
        auteur: 'Victor Hugo',
        categorie: 'Roman classique',
        description: 'L\'œuvre majeure de Victor Hugo qui raconte l\'histoire de Jean Valjean, un ancien forçat qui tente de se racheter, dans la France du XIXe siècle.',
        isbn: '9782070409228',
        anneePublication: 1862,
        editeur: 'Gallimard',
        quantiteTotale: 3,
        quantiteDisponible: 3,
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=512&ixlib=rb-4.0.3'
      },
      {
        titre: 'L\'Étranger',
        auteur: 'Albert Camus',
        categorie: 'Roman philosophique',
        description: 'Meursault assiste à l\'enterrement de sa mère sans manifester d\'affliction particulière. Il tue ensuite gratuitement un Arabe sur une plage. Condamné à mort, il attend son exécution, de façon imperturbable.',
        isbn: '9782070360024',
        anneePublication: 1942,
        editeur: 'Gallimard',
        quantiteTotale: 4,
        quantiteDisponible: 4,
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=870&ixlib=rb-4.0.3'
      },
      {
        titre: 'Germinal',
        auteur: 'Émile Zola',
        categorie: 'Roman',
        description: 'Étienne Lantier, un jeune chômeur, se fait embaucher aux mines de Montsou. Il découvre la misère des mineurs et devient le meneur d\'une grève qui s\'achèvera dans le sang.',
        isbn: '9782070409211',
        anneePublication: 1885,
        editeur: 'Gallimard',
        quantiteTotale: 2,
        quantiteDisponible: 2,
        image: 'https://images.unsplash.com/photo-1576872381149-7847515ce5d8?auto=format&fit=crop&q=80&w=580&ixlib=rb-4.0.3'
      },
      {
        titre: 'Madame Bovary',
        auteur: 'Gustave Flaubert',
        categorie: 'Roman classique',
        description: 'Emma Bovary, épouse d\'un officier de santé, s\'ennuie dans sa vie provinciale et cherche à s\'évader à travers des liaisons amoureuses et des dépenses inconsidérées.',
        isbn: '9782070413119',
        anneePublication: 1857,
        editeur: 'Gallimard',
        quantiteTotale: 3,
        quantiteDisponible: 3,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=387&ixlib=rb-4.0.3'
      },
      {
        titre: 'Les Fleurs du Mal',
        auteur: 'Charles Baudelaire',
        categorie: 'Poésie',
        description: 'Recueil de poèmes qui expriment tout à la fois le goût du macabre, la passion amoureuse, le spleen et l\'idéal.',
        isbn: '9782070412105',
        anneePublication: 1857,
        editeur: 'Gallimard',
        quantiteTotale: 2,
        quantiteDisponible: 2,
        image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=870&ixlib=rb-4.0.3'
      },
      {
        titre: 'Candide',
        auteur: 'Voltaire',
        categorie: 'Conte philosophique',
        description: 'Candide, jeune homme naïf élevé dans l\'optimisme leibnizien, est chassé du château de Thunder-ten-tronckh et part à l\'aventure dans un monde hostile.',
        isbn: '9782070393800',
        anneePublication: 1759,
        editeur: 'Gallimard',
        quantiteTotale: 4,
        quantiteDisponible: 4,
        image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=387&ixlib=rb-4.0.3'
      },
      {
        titre: 'Voyage au bout de la nuit',
        auteur: 'Louis-Ferdinand Céline',
        categorie: 'Roman',
        description: 'Ferdinand Bardamu raconte son expérience de la Première Guerre mondiale, son voyage en Afrique coloniale, son séjour aux États-Unis et sa vie de médecin dans la banlieue parisienne.',
        isbn: '9782070360284',
        anneePublication: 1932,
        editeur: 'Gallimard',
        quantiteTotale: 2,
        quantiteDisponible: 2,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=873&ixlib=rb-4.0.3'
      },
      {
        titre: 'Du côté de chez Swann',
        auteur: 'Marcel Proust',
        categorie: 'Roman',
        description: 'Premier tome de \"À la recherche du temps perdu\", le narrateur évoque ses souvenirs d\'enfance à Combray et raconte l\'histoire d\'amour de Swann et Odette.',
        isbn: '9782070381234',
        anneePublication: 1913,
        editeur: 'Gallimard',
        quantiteTotale: 3,
        quantiteDisponible: 3,
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=387&ixlib=rb-4.0.3'
      },
      {
        titre: 'Bel-Ami',
        auteur: 'Guy de Maupassant',
        categorie: 'Roman',
        description: 'Georges Duroy, jeune homme ambitieux et séduisant, utilise ses relations féminines pour gravir les échelons de la société parisienne.',
        isbn: '9782070412204',
        anneePublication: 1885,
        editeur: 'Gallimard',
        quantiteTotale: 3,
        quantiteDisponible: 3,
        image: 'https://images.unsplash.com/photo-1471970394675-613138e45da3?auto=format&fit=crop&q=80&w=580&ixlib=rb-4.0.3'
      }
    ];
    
    // Créer les livres
    await Book.insertMany(books);
    console.log(`${books.length} livres créés avec succès`);
  } catch (err) {
    console.error('Erreur lors de la création des livres:', err);
  }
};

// Fonction principale
const seed = async () => {
  try {
    // Créer l'administrateur et les livres
    await createAdmin();
    await createBooks();
    
    console.log('Seeding terminé avec succès');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors du seeding:', err);
    process.exit(1);
  }
};

// Exécuter le seeding
seed();