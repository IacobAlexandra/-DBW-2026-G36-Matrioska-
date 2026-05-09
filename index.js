import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import UserModel from './models/UserModel.js';

import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';

import { Server } from 'socket.io';
import { setupSockets } from './sockets/gameSocket.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);
setupSockets(io);

// Setup view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express-Session middleware
app.use(session({
    secret: "matrioska-secret-key", // Used to encrypt session data
    resave: false,
    saveUninitialized: false,
}));

// Passport Config
app.use(passport.initialize());
app.use(passport.session()); 

// Authenticate, Serialize, and Deserialize 
passport.use(new LocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

// Routes
app.use('/', authRoutes);
app.use('/game', gameRoutes);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});

// MongoDB Connection
const MONGO_URI = "mongodb://127.0.0.1:27017/matrioska";

mongoose.connect(MONGO_URI)
  .then(() => { 
      console.log("Connected to MongoDB successfully!"); 
  })
  .catch((err) => {
      console.log("Error connecting to MongoDB:", err);
  });