import express from 'express';
import { checkAuth } from '../controllers/authController.js';
import { getSingleplayerGame, getRules, getSingleplayerGameOver, getMultiplayerMenu, getMultiplayerCreateRoom,
    getMultiplayerJoinRoom, getMultiplayerGame, getMultiplayerGameOver, postGuess, postStats
} from '../controllers/gameController.js';

const router = express.Router();

router.get('/rules', checkAuth, getRules);

router.post('/guess', checkAuth, postGuess);

router.get('/singleplayer', checkAuth, getSingleplayerGame);
router.post('/singleplayer/stats', checkAuth, postStats);
router.get('/singleplayer/gameover', checkAuth, getSingleplayerGameOver);

router.get('/multiplayer', checkAuth, getMultiplayerMenu);
router.get('/multiplayer/create', checkAuth, getMultiplayerCreateRoom);
router.get('/multiplayer/join', checkAuth, getMultiplayerJoinRoom);
router.get('/multiplayer/play', checkAuth, getMultiplayerGame);
router.get('/multiplayer/gameover', checkAuth, getMultiplayerGameOver);

export default router;
