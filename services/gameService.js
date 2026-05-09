import WordModel from '../models/WordModel.js';
import { activeRooms } from '../state/gameState.js';
/*
* Fetch a random master word from the database.
* Returns a fallback word if the database is empty or fails.
*/
export const getRandomWord = async () => {
    try {
        const result = await WordModel.aggregate([
            { $sample: { size: 1 } }
        ]);

        if (result.length > 0) {
            return result[0];
        }

    } 
    catch (error) {
        console.log("Error fetching word:", error);
    }

    return {
        masterWord: "SOLIDARITY",
        validSubWords: ["SOLID", "SOL", "LID", "RAD", "TIDY"]
    };
}

function calculatePoints(word, status, combo) {
    if (status === "invalid") return -20;
    if (status === "duplicate") return -10;

    const base = word.length * 10;
    let bonus = 0;

    if (combo >= 7) bonus = 80;
    else if (combo >= 5) bonus = 50;
    else if (combo >= 3) bonus = 30;
    else if (combo >= 1) bonus = 10;

    let score = base + bonus;

    return score;
}

function getGameContext(req, roomCode) {
    // MULTIPLAYER
    if (roomCode && activeRooms[roomCode]) {
        return { 
            type: "multiplayer", 
            room: activeRooms[roomCode] 
        };
    }
    
    // SINGLEPLAYER
    if (req.session && req.session.gameData) {
        return { 
            type: "singleplayer", 
            state: req.session.gameData 
        };
    }
    
    return null;
}

function evaluateGuess(guess, game) {
    const found = game.type === "multiplayer" ? game.room.foundWords : game.state.foundWords;
    
    const validWords = game.type === "multiplayer" ? game.room.validSubWords : game.state.validSubWords;
    const upperValidWords = validWords.map(w => w.toUpperCase());

    if (found && found.includes(guess)) {
        return "duplicate";
    }
    if (validWords && validWords.includes(guess)) {
        return "valid";
    }
    
    return "invalid";
}

function updateGameState(game, username, guess, status, points) {
    //MULTIPLAYER
    if (game.type === "multiplayer") {
        const room = game.room;

        if (!room.scores) room.scores = {};
        if (!room.combos) room.combos = {};
        if (!room.wrongWords) room.wrongWords = {};

        if (!room.scores[username]) room.scores[username] = 0;
        if (!room.combos[username]) room.combos[username] = 0;
        if (!room.wrongWords[username]) room.wrongWords[username] = 0;

        room.scores[username] = Math.max(0, room.scores[username] + points);

        if (status === "valid") {
                room.combos[username] += 1;
                room.foundWords.push(guess);
            } 
            else {
                room.wrongWords[username] += 1;
                room.combos[username] = 0;
            }

            return;
        }
    //SINGLEPLAYER
    const state = game.state;

    state.score = Math.max(0, state.score + points);

    if (status === "valid") {
        state.combo += 1;
        state.foundWords.push(guess);
    } 
    else {
        state.wrongWords += 1;
        state.combo = 0;
    }
}

export async function handleGuess(req) {
    const { guess, roomCode } = req.body;
    const upperGuess = guess.toUpperCase();
    const username = req.user.username;
    
    console.log(`[2. SERVICE] Processing guess '${upperGuess}' for user '${username}' in room '${roomCode}'`);

    if (!guess || typeof guess !== "string") {
        return {
            status: "invalid",
            word: "",
            points: 0
        };
    }

    const game = getGameContext(req, roomCode);
     if (!game) {
        console.log(`[X. SERVICE ERROR] Game Context is NULL! Room doesn't exist.`);
        return { status: "error", message: "Game not found" };
    }

    const status = evaluateGuess(upperGuess, game);
     console.log(`[3. SERVICE] evaluateGuess returned status: '${status}'`);

    const currentCombo =
    game.type === "multiplayer"
        ? (game.room.combos?.[username] || 0)
        : (game.state.combo || 0);

    const points = calculatePoints(upperGuess, status, currentCombo);

    updateGameState(game, username, upperGuess, status, points);

    const newTotalScore = game.type === "multiplayer" 
        ? game.room.scores[username] 
        : game.state.score;

    const newCombo = game.type === "multiplayer" 
        ? game.room.combos[username] 
        : game.state.combo;

    return {
        isValid: status === "valid", 
        status: status, 
        word: upperGuess,
        points: points,
        totalScore: newTotalScore, 
        combo: newCombo
    };
}
