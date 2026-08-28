const { app, request, expect, getAuthToken, resetFixture } = require('./games.support');

describe('/games', () => {

    let token;

    before(async () => {
        token = await getAuthToken();
    })

    beforeEach(() => {
        resetFixture();
    })

    describe('DELETE /games/{id}', () => {
        it('Must return 204 when deleting a game', async () => {
            const response = await request(app)
                .delete('/games/13')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).to.eq(204);

            const response2 = await request(app)
                .delete('/games/13')
                .set('Authorization', `Bearer ${token}`);
            expect(response2.status).to.eq(404);
        })

        it('Must return 401 when Bearer token is missing', async () => {
            const response = await request(app)
                .delete('/games/13');
            expect(response.status).to.eq(401);
            expect(response.body.error).to.contain('Authorization');
        })

        it('Must return 401 when Bearer token is malformed', async () => {
            const badToken = '123abc';
            const response = await request(app)
                .delete('/games/13')
                .set('Authorization', `${badToken}`);
            expect(response.status).to.eq(401);
            expect(response.body.error).to.contain('Authorization');
        })

        it('Must return 401 when Bearer token is invalid ', async () => {
            const badToken = '123abc';
            const response = await request(app)
                .delete('/games/1')
                .set('Authorization', `Bearer ${badToken}`);
            expect(response.status).to.eq(401);
            expect(response.body.error).to.contain('token');

        })

        it('Must return 404 with an invalid game id', async () => {
            const response = await request(app)
                .delete('/games/1000')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).to.eq(404);
            expect(response.body.error).to.contain('not found');
        })

        it('A deleted game ID must not be reused', async () => {
            await request(app)
                .delete('/games/116')
                .set('Authorization', `Bearer ${token}`);

            const response = await request(app)
                .post('/games/')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "name": "New Game",
                    "minPlayers": 1,
                    "maxPlayers": 3,
                    "playTime": 350,
                    "complexity": 2.46
                })
            expect(response.status).to.eq(201);
            expect(response.body.id).to.not.eq(116);
            expect(response.body.id).to.eq(117);
        })
    })

})
