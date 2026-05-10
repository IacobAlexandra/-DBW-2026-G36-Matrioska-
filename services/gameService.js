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

function getGameState(game, username) {
    if (game.type === "multiplayer") {
        const room = game.room;
        if (!room.scores) room.scores = {};
        if (!room.combos) room.combos = {};
        if (!room.wrongWords) room.wrongWords = {};

        if (!room.scores[username]) room.scores[username] = 0;
        if (!room.combos[username]) room.combos[username] = 0;
        if (!room.wrongWords[username]) room.wrongWords[username] = 0;

        return {
            foundWords: room.foundWords,
            validSubWords: room.validSubWords,
            get score() { return room.scores[username]; },
            set score(v) { room.scores[username] = v; },
            get combo() { return room.combos[username]; },
            set combo(v) { room.combos[username] = v; },
            get wrongWords() { return room.wrongWords[username]; },
            set wrongWords(v) { room.wrongWords[username] = v; }
        };
    } else {
        const state = game.state;
        return {
            foundWords: state.foundWords,
            validSubWords: state.validSubWords,
            get score() { return state.score; },
            set score(v) { state.score = v; },
            get combo() { return state.combo; },
            set combo(v) { state.combo = v; },
            get wrongWords() { return state.wrongWords; },
            set wrongWords(v) { state.wrongWords = v; }
        };
    }
}

function getGameContext(req, roomCode) {
    if (roomCode && activeRooms[roomCode]) {
        return { type: "multiplayer", room: activeRooms[roomCode] };
    }
    if (req.session && req.session.gameData) {
        return { type: "singleplayer", state: req.session.gameData };
    }
    return null;
}

function evaluateGuess(guess, stateObj) {
    const found = stateObj.foundWords;
    const validWords = stateObj.validSubWords;
    
    if (found && found.includes(guess)) return "duplicate";
    if (validWords && validWords.includes(guess)) return "valid";
    
    return "invalid";
}

function updateGameState(stateObj, guess, status, points) {
    stateObj.score = Math.max(0, stateObj.score + points);

    if (status === "valid") {
        stateObj.combo += 1;
        stateObj.foundWords.push(guess);
    } else {
        stateObj.wrongWords += 1;
        stateObj.combo = 0;
    }
}

export async function handleGuess(req) {
    const { guess, roomCode } = req.body;
    const upperGuess = guess.toUpperCase();
    const username = req.user.username;
    
    console.log(`[2. SERVICE] Processing guess '${upperGuess}' for user '${username}' in room '${roomCode}'`);

    if (!guess || typeof guess !== "string") {
        return { status: "invalid", word: "", points: 0 };
    }

    const game = getGameContext(req, roomCode);
    if (!game) {
        console.log(`[X. SERVICE ERROR] Game Context is NULL! Room doesn't exist.`);
        return { status: "error", message: "Game not found" };
    }

    const stateObj = getGameState(game, username);
    const status = evaluateGuess(upperGuess, stateObj);
    console.log(`[3. SERVICE] evaluateGuess returned status: '${status}'`);

    const points = calculatePoints(upperGuess, status, stateObj.combo);

    updateGameState(stateObj, upperGuess, status, points);

    return {
        isValid: status === "valid", 
        status: status, 
        word: upperGuess,
        points: points,
        totalScore: stateObj.score, 
        combo: stateObj.combo
    };
}
