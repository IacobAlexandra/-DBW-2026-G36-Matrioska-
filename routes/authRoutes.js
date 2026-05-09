import express from 'express';
import passport from 'passport';

import { getIndex, getLogin, getSignup, getMenu, getProfile, getLogout, postSignup, checkAuth } from '../controllers/authController.js';

const router = express.Router();

router.get('/', getIndex);

router.get('/login', getLogin);
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), 
    function (req, res) {
        res.redirect('/menu');
    }
);

router.get('/signup', getSignup);
router.post('/signup', postSignup);

router.get('/menu', checkAuth, getMenu);
router.get('/profile', checkAuth, getProfile);

router.get('/logout', getLogout);

export default router;
