export const getIndex = (req, res) => {
    res.render('index');
};

export const getLogin = (req, res) => {
    res.render('login');
};

export const getSignup = (req, res) => {
    res.render('signup');
};

export const getMenu = (req, res) => {
    res.render('menu');
};

export const getProfile = (req, res) => {
    res.render('profile');
};

export const postLogin = (req, res) => {
    // Implement login logic
    res.redirect('/menu');
};

export const postSignup = (req, res) => {
    // Implement signup logic
    res.redirect('/login');
};
