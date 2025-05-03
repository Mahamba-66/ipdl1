const request = require('supertest');
const app = require('../src/app');
const { Loan, Book } = require('../src/models');
const {
    setupDatabase,
    user,
    book,
    getAuthToken
} = require('./fixtures/db');

beforeEach(setupDatabase);

describe('Loan Endpoints', () => {
    describe('POST /loans/borrow', () => {
        test('Should borrow a book', async () => {
            const response = await request(app)
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${getAuthToken(user._id)}`)
                .send({
                    book_id: book._id
                })
                .expect(201);

            // Vérifier que l'emprunt est créé
            const loan = await Loan.findById(response.body.loan_id);
            expect(loan).not.toBeNull();
            expect(loan.utilisateur.toString()).toBe(user._id.toString());
            expect(loan.livre.toString()).toBe(book._id.toString());

            // Vérifier que la quantité disponible est mise à jour
            const updatedBook = await Book.findById(book._id);
            expect(updatedBook.quantite_disponible).toBe(book.quantite_disponible - 1);
        });

        test('Should not borrow unavailable book', async () => {
            // D'abord, mettre la quantité disponible à 0
            await Book.findByIdAndUpdate(book._id, { quantite_disponible: 0 });

            await request(app)
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${getAuthToken(user._id)}`)
                .send({
                    book_id: book._id
                })
                .expect(400);
        });
    });

    describe('POST /loans/:id/return', () => {
        test('Should return a borrowed book', async () => {
            // D'abord, emprunter un livre
            const borrowResponse = await request(app)
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${getAuthToken(user._id)}`)
                .send({
                    book_id: book._id
                });

            // Retourner le livre
            await request(app)
                .post(`/loans/${borrowResponse.body.loan_id}/return`)
                .set('Authorization', `Bearer ${getAuthToken(user._id)}`)
                .expect(200);

            // Vérifier que le statut de l'emprunt est mis à jour
            const loan = await Loan.findById(borrowResponse.body.loan_id);
            expect(loan.status).toBe('retourne');

            // Vérifier que la quantité disponible est mise à jour
            const updatedBook = await Book.findById(book._id);
            expect(updatedBook.quantite_disponible).toBe(book.quantite_disponible);
        });
    });

    describe('GET /loans/user', () => {
        test('Should get user loans', async () => {
            // D'abord, créer un emprunt
            await request(app)
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${getAuthToken(user._id)}`)
                .send({
                    book_id: book._id
                });

            // Récupérer les emprunts
            const response = await request(app)
                .get('/loans/user')
                .set('Authorization', `Bearer ${getAuthToken(user._id)}`)
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].utilisateur).toBe(user._id.toString());
        });
    });
});
