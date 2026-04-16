export const getSingleplayer = (req, res) => {
    res.render('game');
};

export const getRules = (req, res) => {
    res.render('game_rules');
};

export const getSingleplayerGameOver = (req, res) => {
    res.render('game_over_singleplayer');
};

export const getMultiplayerMenu = (req, res) => {
    res.render('multiplayer_menu');
};

export const getMultiplayerCreateRoom = (req, res) => {
    res.render('multiplayer_create_room');
};

export const getMultiplayerJoinRoom = (req, res) => {
    res.render('multiplayer_join_room');
};

export const getMultiplayerGame = (req, res) => {
    res.render('game_multiplayer');
};

export const getMultiplayerGameOver = (req, res) => {
    res.render('game_over_multiplayer');
};
