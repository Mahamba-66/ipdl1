const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');
const { setupDatabase, user } = require('./fixtures/db');

beforeEach(setupDatabase);

describe('Auth Endpoints', () => {
    describe('POST /auth/register', () => {
        test('Should register a new user', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'newuser@test.com',
                    password: 'Test123!',
                    nom: 'New',
                    prenom: 'User'
                })
                .expect(201);

            // Vérifier que l'utilisateur est créé en base
            const newUser = await User.findById(response.body.user_id);
            expect(newUser).not.toBeNull();
            expect(newUser.email).toBe('newuser@test.com');
        });

        test('Should not register user with invalid data', async () => {
            await request(app)
                .post('/auth/register')
                .send({
                    email: 'invalid-email',
                    password: '123'
                })
                .expect(400);
        });
    });

    describe('POST /auth/login', () => {
        test('Should login existing user', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: user.email,
                    password: user.password
                })
                .expect(200);

            expect(response.body.token).not.toBeNull();
        });

        test('Should not login with wrong credentials', async () => {
            await request(app)
                .post('/auth/login')
                .send({
                    email: user.email,
                    password: 'wrongpassword'
                })
                .expect(401);
        });
    });
});
