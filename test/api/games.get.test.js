const { app, request, expect, getAuthToken, resetFixture } = require('./games.support');

describe('/games', () => {

    let token;

    before(async () => {
        token = await getAuthToken();
    })

    beforeEach(() => {
        resetFixture();
    })

    describe('GET /games', () => {

        it('Must return a list of games', async () => {
            const response = await request(app)
                .get('/games');

            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(4);
        })
    })

})
