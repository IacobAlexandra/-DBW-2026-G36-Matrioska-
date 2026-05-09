import { activeRooms } from '../state/gameState.js';
import { getRandomWord } from '../services/gameService.js';

export const setupSockets = (io) => {
    io.on('connection', (socket) => {

        const username = socket.handshake.query.username || "UnknownUser";
        socket.username = username;
        console.log('User connected:', socket.username);
        
        socket.on('createRoom', async () => {
            // Generate random 4-digit room code 
            const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
            const wordData = await getRandomWord()

            activeRooms[roomCode] = {
                masterWord: wordData.masterWord,
                validSubWords: wordData.validSubWords, 
                players: [socket.username],
                foundWords: [],
                scores: {},
                combos: {}, 
                wrongWords: {}, 
                correctCounts: {} 
            };

            socket.join(roomCode); 
            socket.roomCode = roomCode; 
            
            console.log(`Room created: ${roomCode} by host ${socket.username}`);

            socket.emit('roomCreated', { roomCode, masterWord:  wordData });
            });

        
            socket.on('joinRoom',  ({ roomCode, username })  => {

                if (activeRooms[roomCode]) {
                    const room = activeRooms[roomCode];
                    const socketRoom = io.sockets.adapter.rooms.get(roomCode);

                // Check if room is already full (max. 5 players)
                if (socketRoom && socketRoom.size >= 5 && !room.players.includes(username)) {
                    socket.emit('joinError', "Room already full!");
                    return; 
                }

                socket.join(roomCode);
                socket.roomCode = roomCode;
                
                if (!room.players.includes(username)) {
                    room.players.push(username);
                }

                if (!room.scores) room.scores = {};
                if (!room.scores[username]) room.scores[username] = 0;

                console.log(`User ${username} joined room ${roomCode}`);
                
                socket.emit('roomJoined', roomCode);
                io.to(roomCode).emit('playerJoined', username);
                
                io.to(roomCode).emit('gameStateUpdate', room);
                } 
                else {
                    socket.emit('joinError', "Room does not exist!");
                }
            });

            socket.on('startGame', (roomCode) => {
                io.to(roomCode).emit('gameStarted');

                const room = activeRooms[roomCode];

                if (room) {
                    room.timeLeft = 15; 

                    const timerInterval = setInterval(() => {
                        if (!room) {
                            clearInterval(timerInterval);
                            return;
                        }

                        room.timeLeft--;
                        
                        io.to(roomCode).emit('gameStateUpdate', room);

                        if (room.timeLeft <= 0) {
                            clearInterval(timerInterval);
                            io.to(roomCode).emit('gameOver');
                        }
                    }, 1000);
                }
            });

            socket.on('stateChanged', (roomCode) => {
                if (activeRooms[roomCode]) {
                    // Blast the freshly calculated scores from the backend to everyone's screen
                    io.to(roomCode).emit('gameStateUpdate', activeRooms[roomCode]);
                }
            });

            socket.on('endMultiplayerMatch', (roomCode) => {
                console.log(`Timer ended in room: ${roomCode}`);
                 io.to(roomCode).emit('gameOver'); 
            });

            socket.on("leaveRoom", (roomCode) => {
                socket.leave(roomCode);
                socket.roomCode = null;

                console.log(`User ${socket.username} left room ${roomCode}`);
                io.to(roomCode).emit('playerLeft', socket.username);

                 if (activeRooms[roomCode] && activeRooms[roomCode].players) {
                activeRooms[roomCode].players = activeRooms[roomCode].players.filter(player => player !== socket.username);
            }

                const room = io.sockets.adapter.rooms.get(roomCode);
                //Memory leak prevention
                if (!room || room.size === 0) {
                    delete activeRooms[roomCode];
                    console.log(`Room ${roomCode} is empty and was deleted from memory (via leaveRoom).`);
                }
            
        });

        socket.on('playAgain', (roomCode) => {
            const room = activeRooms[roomCode];
            if (room) {
                // Reset all scores back to 0
                for (let player in room.scores) {
                    room.scores[player] = 0;
                }
                // Tell everyone in the room to transition to the lobby!
                io.to(roomCode).emit('goToLobby');
            }
        });
        
        socket.on('disconnect', () => {
             if (socket.username && socket.roomCode) {
                console.log(`User ${socket.username} disconnected from room ${socket.roomCode}`);
            } 
            else {
                console.log(`A user disconnected`);
            }
        });

    });
};