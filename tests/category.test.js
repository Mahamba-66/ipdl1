const request = require('supertest');
const app = require('../src/app');
const { Category } = require('../src/models');
const {
    setupDatabase,
    admin,
    user,
    category,
    getAuthToken
} = require('./fixtures/db');

beforeEach(setupDatabase);

describe('Category Endpoints', () => {
    describe('GET /categories/tree', () => {
        test('Should get category tree', async () => {
            const response = await request(app)
                .get('/categories/tree')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].nom).toBe(category.nom);
        });
    });

    describe('POST /categories', () => {
        test('Should create new category as admin', async () => {
            const response = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${getAuthToken(admin._id)}`)
                .send({
                    nom: 'Science Fiction',
                    description: 'Livres de SF'
                })
                .expect(201);

            const newCategory = await Category.findById(response.body.category_id);
            expect(newCategory).not.toBeNull();
            expect(newCategory.nom).toBe('Science Fiction');
        });

        test('Should create subcategory', async () => {
            const response = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${getAuthToken(admin._id)}`)
                .send({
                    nom: 'Romans Policiers',
                    description: 'Sous-catégorie de Romans',
                    parent: category._id
                })
                .expect(201);

            const subCategory = await Category.findById(response.body.category_id);
            expect(subCategory.parent.toString()).toBe(category._id.toString());
        });

        test('Should not create category as regular user', async () => {
            await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${getAuthToken(user._id)}`)
                .send({
                    nom: 'Science Fiction',
                    description: 'Livres de SF'
                })
                .expect(403);
        });
    });

    describe('PUT /categories/:id', () => {
        test('Should update category as admin', async () => {
            await request(app)
                .put(`/categories/${category._id}`)
                .set('Authorization', `Bearer ${getAuthToken(admin._id)}`)
                .send({
                    description: 'Nouvelle description'
                })
                .expect(200);

            const updatedCategory = await Category.findById(category._id);
            expect(updatedCategory.description).toBe('Nouvelle description');
        });
    });

    describe('DELETE /categories/:id', () => {
        test('Should not delete category with books', async () => {
            await request(app)
                .delete(`/categories/${category._id}`)
                .set('Authorization', `Bearer ${getAuthToken(admin._id)}`)
                .expect(400);
        });
    });

    describe('GET /categories/:id/stats', () => {
        test('Should get category statistics', async () => {
            const response = await request(app)
                .get(`/categories/${category._id}/stats`)
                .set('Authorization', `Bearer ${getAuthToken(user._id)}`)
                .expect(200);

            expect(response.body).toHaveProperty('total_books');
            expect(response.body).toHaveProperty('active_loans');
        });
    });
});
