import UserModel from '../models/UserModel.js';

export const getIndex = (req, res) => {
    res.render('index');
};

export const getLogin = (req, res) => {
    res.render('login');
};

export const getSignup = (req, res) => {
    res.render('signup');
};

export const getLogout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            // Safety net in case the session fails to destroy properly
            return next(err);
        }
        res.redirect("/"); 
    });
};

export const postSignup = async (req, res) => { 
    try { 
        const { username, password } = req.body; 
        
        if (!username || !password) {
            console.log("Signup validation failed: missing username or password");
            return res.redirect('/signup');
        }

        const user = new UserModel({username}); 
        
        await UserModel.register(user, password); 
        
        res.redirect('/login'); 
    } 
    catch (error) {
        console.log("Error registering user:", error);
        res.redirect('/signup');
    }
};

export const getMenu = (req, res) => {
    res.render('menu');
};

export const getProfile = (req, res) => {
    res.render('profile', { user: req.user });
};

// Middleware to protect routes from unlogged people
export const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log("Access forbidden.");
    res.redirect('/login');
};