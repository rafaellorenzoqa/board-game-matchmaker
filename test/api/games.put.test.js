const { app, request, expect, getAuthToken, resetFixture } = require('./games.support');

describe('/games', () => {

    let token;

    before(async () => {
        token = await getAuthToken();
    })

    beforeEach(() => {
        resetFixture();
    })

    describe('PUT /games/{id}', () => {

        it('Must return 200 when a game is replaced', async () => {
            const response = await request(app)
                .put('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 2.5
                });

            const response2 = await request(app)
                .put('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 2.5
                });

            expect(response.status).to.eq(200);
            expect(response.body.name).to.eq("Catan: Navegantes");

            expect(response2.status).to.eq(200);
            expect(response.body).to.deep.equal(response2.body);

        })

        it('Must return 400 when the payload is incomplete (missing property)', async () => {
            const response = await request(app)
                .put('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 401 if auth token is missing', async () => {
            const response = await request(app)
                .put('/games/1')
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    maxPlayers: 6,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Authorization");
        })

        it('Must return 401 if auth token is invalid', async () => {
            const badToken = "abcd";
            const response = await request(app)
                .put('/games/1')
                .set('Authorization', `Bearer ${badToken}`)
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    maxPlayers: 6,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Invalid");
        })

        it('Must return 404 if the game ID is not found', async () => {
            const response = await request(app)
                .put('/games/666')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Robo Rescue",
                    minPlayers: 3,
                    maxPlayers: 6,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(404);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("not found");
        })
    })

})
