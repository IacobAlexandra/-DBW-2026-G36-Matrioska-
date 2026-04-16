import express from 'express';
import { 
    getSingleplayer, 
    getRules, 
    getSingleplayerGameOver, 
    getMultiplayerMenu, 
    getMultiplayerCreateRoom,
    getMultiplayerJoinRoom,
    getMultiplayerGame,
    getMultiplayerGameOver
} from '../controllers/gameController.js';

const router = express.Router();

router.get('/singleplayer', getSingleplayer);
router.get('/singleplayer/gameover', getSingleplayerGameOver);

router.get('/rules', getRules);

router.get('/multiplayer', getMultiplayerMenu);
router.get('/multiplayer/create', getMultiplayerCreateRoom);
router.get('/multiplayer/join', getMultiplayerJoinRoom);
router.get('/multiplayer/play', getMultiplayerGame);
router.get('/multiplayer/gameover', getMultiplayerGameOver);

export default router;
