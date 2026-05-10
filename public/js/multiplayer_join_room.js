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
    
    document.getElementById('lobby-section').style.display = 'block';
    
    sessionStorage.setItem('roomCode', roomCode); 
});

socket.on('gameStateUpdate', (roomState) => {
    if (roomState.scores) {
        const playerList = document.getElementById('player-list');
        playerList.innerHTML = '';
        Object.keys(roomState.scores).forEach(player => {
            const li = document.createElement('li');
            li.className = 'cr-li';
            li.id = player;
            if (player === username) {
                li.innerHTML = `<span class="profile-icon cr-avatar"></span> ${player} <span class="cr-sub">(you)</span>`;
            } else {
                li.innerHTML = `<span class="profile-icon cr-avatar"></span> ${player}`;
            }
            playerList.appendChild(li);
        });
    }
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