const { app, request, expect, getAuthToken, resetFixture } = require('./games.support');

describe('/games', () => {

    let token;

    before(async () => {
        token = await getAuthToken();
    })

    beforeEach(() => {
        resetFixture();
    })

    describe('POST /games', () => {

        it('Must return 201 on valid game creation', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Speakeasy',
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                });

            expect(response.status).to.eq(201);
            expect(response.body.name).to.eq('Speakeasy');
            expect(response.body.minPlayers).to.eq(1);
            expect(response.body.maxPlayers).to.eq(4);
            expect(response.body.playTime).to.eq(90);
            expect(response.body.complexity).to.eq(3.1);
            expect(response.body).to.have.property("id");
            expect(response.body.id).to.eq(117);

        })

        it('Must return 400 when "name" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 when "minPlayers" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan 2",
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 when "maxPlayers" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan 2",
                    minPlayers: 3,
                    playTime: 90,
                    complexity: 3.1
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 when "playTime" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan 2",
                    minPlayers: 3,
                    maxPlayers: 4,
                    complexity: 3.1
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 when "complexity" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan 2",
                    minPlayers: 3,
                    maxPlayers: 4,
                    playTime: 90,
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 on null parameter (complexity: null)', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Pest',
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 120,
                    complexity: null
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.contain('complexity');
        })

        it('Must return 401 if auth token is missing', async () => {
            const response = await request(app)
                .post('/games')
                .send({
                    name: 'Speakeasy',
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.contain('Authorization');
        })

        it('Must return 401 if auth token is invalid', async () => {
            const badToken = "abcd";
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${badToken}`)
                .send({
                    name: 'Speakeasy',
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.contain('Invalid');
        })

    })

})
