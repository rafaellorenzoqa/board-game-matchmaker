# Deliberate edge cases seeded into games.json

Total games: 244

| Game | Edge case |
|---|---|
| 5-Minute Dungeon | weight = 1.0 (lightest boundary) |
| 7 Wonders | weight = 5.0 (heaviest boundary) |
| 7 Wonders: Duel | weight = 2.33 (non-round decimal) |
| A Guerra dos Tronos: Board Game | weight = 3.67 (non-round decimal) |
| Acquire | weight = null (missing data) |
| 1000? | avgPlayTime = 20 (fastest boundary) |
| 3 Capítulos | avgPlayTime = 360 (longest boundary) |
| Cartógrafos | naturally occurring: minPlayer=1, maxPlayer=100 (real data, not injected) |
