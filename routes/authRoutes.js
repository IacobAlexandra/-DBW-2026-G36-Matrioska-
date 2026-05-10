import express from 'express';
import passport from 'passport';
import multer from 'multer';
import path from 'path';

import { getIndex, getLogin, getSignup, getMenu, getProfile, getLogout, postSignup, checkAuth, postProfilePic } from '../controllers/authController.js';

const router = express.Router();

// Setup Multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, req.user.username + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

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
router.post('/profile/upload', checkAuth, upload.single('avatar'), postProfilePic);

router.get('/logout', getLogout);

export default router;
