import express from 'express';
import { getIndex, getLogin, getSignup, getMenu, getProfile, postLogin, postSignup } from '../controllers/authController.js';

const router = express.Router();

router.get('/', getIndex);
router.get('/login', getLogin);
router.post('/login', postLogin);

router.get('/signup', getSignup);
router.post('/signup', postSignup);

router.get('/menu', getMenu);
router.get('/profile', getProfile);

export default router;
