const username = window.username; 
const socket = io({ query: { username: username } }); 
let currentRoom = "";

document.addEventListener("DOMContentLoaded", () => {
    const savedRoom = sessionStorage.getItem('roomCode');
    if (savedRoom) {
        document.getElementById('room-code-input').value = savedRoom;
        document.getElementById('join-btn').click(); 
    }
});

document.getElementById('join-btn').addEventListener('click', () => {
    const roomCode = document.getElementById('room-code-input').value.trim();
    
    if (!roomCode) return; 

    sessionStorage.setItem('roomCode', roomCode);
    sessionStorage.setItem('isHost', 'false');

    socket.emit('joinRoom', { roomCode: roomCode, username: username });
});

socket.on('roomJoined', (roomCode) => {
    currentRoom = roomCode;
    
    // Hide the input box and join button
    document.getElementById('input-section').style.display = 'none';
    document.getElementById('join-btn').style.display = 'none';
    
    document.getElementById('status-message').style.display = 'block';
    
    sessionStorage.setItem('roomCode', roomCode); 
});

socket.on('roomError', (errorMessage) => {
    alert(errorMessage);
    sessionStorage.removeItem('roomCode')
});

document.getElementById('back-btn').addEventListener('click', () => {
    if (currentRoom) {
        socket.emit('leaveRoom', currentRoom);
    }
    sessionStorage.removeItem('roomCode');
    window.location.href = '/game/multiplayer';
});

socket.on('gameStarted', () => {
    window.location.href = '/game/multiplayer/play';
});