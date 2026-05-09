import WordModel from '../models/WordModel.js';
import UserModel from '../models/UserModel.js';
import { activeRooms } from '../state/gameState.js';
import { handleGuess, getRandomWord} from '../services/gameService.js';

export const getRules = (req, res) => {
    res.render('game_rules');
};

export const getSingleplayerGame = async (req, res) => {
     const wordData = await getRandomWord();

     req.session.gameData = {
        mode: "singleplayer",
        masterWord: wordData.masterWord,
        validSubWords: wordData.validSubWords,
        foundWords: [],
        score: 0,
        wrongWords: 0,
        combo: 0
    };

    res.render('singleplayer_game', { word: wordData.masterWord, timeLimit: 60 });
};

export const getSingleplayerGameOver = (req, res) => {
    const state = req.session.gameData;

    res.render('singleplayer_game_over', {
        score: state?.score || 0,
        correctWords: state?.foundWords || [],
        wrongWords: state?.wrongWords || 0
    });
};

export const getMultiplayerMenu = (req, res) => {
    res.render('multiplayer_menu');
};

export const getMultiplayerCreateRoom = (req, res) => {
    res.render('multiplayer_create_room', { username: req.user.username });
};

export const getMultiplayerJoinRoom = (req, res) => {
    res.render('multiplayer_join_room',{ username: req.user.username });
};

export const getMultiplayerGame = async (req, res) => { 
    res.render('multiplayer_game', { username: req.user.username }); 
};

export const getMultiplayerGameOver = (req, res) => {
     res.render('multiplayer_game_over', { username: req.user.username }); 
};

export const postGuess = async (req, res) => {
    console.log(`\n--- [1. CONTROLLER] Request received! Body:`, req.body);
    
    try {
        const result = await handleGuess(req);
         console.log(`[4. CONTROLLER] handleGuess finished. Result:`, result);
        res.json(result);

    } 
    catch (error) {
        console.error(`[CONTROLLER CRASH]`, error);
        console.log("Error processing guess:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const postStats = async (req, res) => {
    try {
        const { timePlayed, roomCode } = req.body;

        const username = req.user.username;
        const user = await UserModel.findOne({ username });

        let finalScore = 0;
        let correctCount = 0;
        let wrongCount = 0;

        // MULTIPLAYER
        if (roomCode && activeRooms[roomCode]) {
            const room = activeRooms[roomCode];

            finalScore = room.scores?.[username] || 0;
            correctCount = room.correctCounts?.[username] || 0;
            wrongCount = room.wrongCounts?.[username] || 0;
        } 
        // SINGLEPLAYER
        else {
            const state = req.session.gameData;

            finalScore = state?.score || 0;
            correctCount = state?.foundWords?.length || 0;
            wrongCount = state?.wrongWords || 0;
        }

        if (!user) {
            return res.json({
                success: false,
                error: "User not found"
            });
        }

        user.score += finalScore;
        user.foundWords += correctCount;
        user.wrongWords += wrongCount;
        user.playTime += timePlayed || 0;

        await user.save();

        req.session.save(() => {
            return res.json({ success: true });
        });

    } 
    catch (error) {
        console.log("Error saving final stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
