const request = require('supertest');
const app = require('../src/app');
const { Book } = require('../src/models');
const {
    setupDatabase,
    admin,
    user,
    book,
    categoryId,
    getAuthToken
} = require('./fixtures/db');

beforeEach(setupDatabase);

describe('Book Endpoints', () => {
    describe('GET /books/search', () => {
        test('Should search books', async () => {
            const response = await request(app)
                .get('/books/search')
                .query({ search: 'Test' })
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].titre).toBe(book.titre);
        });

        test('Should filter by category', async () => {
            const response = await request(app)
                .get('/books/search')
                .query({ categorie: categoryId.toString() })
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].titre).toBe(book.titre);
        });
    });

    describe('POST /books', () => {
        test('Should add new book as admin', async () => {
            const response = await request(app)
                .post('/books')
                .set('Authorization', `Bearer ${getAuthToken(admin._id)}`)
                .send({
                    titre: 'New Book',
                    auteur: 'New Author',
                    isbn: '0987654321',
                    categorie: categoryId,
                    quantite_totale: 3
                })
                .expect(201);

            const newBook = await Book.findById(response.body._id);
            expect(newBook).not.toBeNull();
            expect(newBook.titre).toBe('New Book');
            expect(newBook.quantite_disponible).toBe(3);
        });

        test('Should not add book as regular user', async () => {
            await request(app)
                .post('/books')
                .set('Authorization', `Bearer ${getAuthToken(user._id)}`)
                .send({
                    titre: 'New Book',
                    auteur: 'New Author',
                    isbn: '0987654321',
                    categorie: categoryId,
                    quantite_totale: 3
                })
                .expect(403);
        });
    });

    describe('PUT /books/:id', () => {
        test('Should update book as admin', async () => {
            await request(app)
                .put(`/books/${book._id}`)
                .set('Authorization', `Bearer ${getAuthToken(admin._id)}`)
                .send({
                    titre: 'Updated Title'
                })
                .expect(200);

            const updatedBook = await Book.findById(book._id);
            expect(updatedBook.titre).toBe('Updated Title');
        });
    });

    describe('DELETE /books/:id', () => {
        test('Should delete book as admin', async () => {
            await request(app)
                .delete(`/books/${book._id}`)
                .set('Authorization', `Bearer ${getAuthToken(admin._id)}`)
                .expect(200);

            const deletedBook = await Book.findById(book._id);
            expect(deletedBook).toBeNull();
        });
    });
});
