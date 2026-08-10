const fs = require ('fs');
const path = require ('path');
const { addGame } = require('../src/services/gameStore');
const { writeJsonFile } = require('../src/utils/jsonFile');
const { expect } = require('chai');

const TEST_FILE = path.join (__dirname, 'fixtures', 'games.json');

const initialGames = [
        {
        "id": 1,
        "name": "Catan",
        "minPlayers": 3,
        "maxPlayers": 4,
        "playTime": 90,
        "complexity": 2.5
    },
    {
        "id": 2,
        "name": "Acquire",
        "minPlayers": 2,
        "maxPlayers": 6,
        "playTime": 85,
        "complexity": null
    },
    {
        "id": 13,
        "name": "Ark Nova",
        "minPlayers": 1,
        "maxPlayers": 4,
        "playTime": 155,
        "complexity": 3.28
    },
    {
        "id": 116,
        "name": "Keep the Heroes Out",
        "minPlayers": 1,
        "maxPlayers": 6,
        "playTime": 205,
        "complexity": 4.28
    }
];

describe ('gameStore.addGame', () => {
    beforeEach(() => {
        writeJsonFile(TEST_FILE, initialGames);
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

