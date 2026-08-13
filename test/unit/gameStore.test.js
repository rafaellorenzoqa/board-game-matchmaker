const fs = require ('fs');
const path = require ('path');
const { addGame, resetGamesForTesting } = require('../../src/services/gameStore');
const { expect } = require('chai');
const initialGames = require('../fixtures/initialGames');

const TEST_FILE = path.join (__dirname, 'fixtures', 'games.json');

describe ('gameStore.addGame', () => {
    beforeEach(() => {
        resetGamesForTesting(initialGames, TEST_FILE);
    });

    it('New game ID must be based on the highest existing ID', () => {
        const newGame = addGame(
            {
                name: 'New Game',
                minPlayers: 1,
                maxPlayers: 4,
                playTime: 90,
                complexity: 3.1
            }, TEST_FILE
        )
        expect(newGame.id).to.eq(117);
    })
})

