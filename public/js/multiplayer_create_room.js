const username = window.username; 
const socket = io({ query: { username: username } }); 
let currentRoom = "";

const savedRoom = sessionStorage.getItem('roomCode');

if (savedRoom) {
    currentRoom = savedRoom;
    document.getElementById('room-code').innerText = currentRoom;
    socket.emit('joinRoom', { roomCode: currentRoom, username: window.myUsername });

    const roomState = JSON.parse(sessionStorage.getItem('finalRoomState') || "{}");
    if (roomState.scores) {
        const playerList = document.getElementById('player-list');
        playerList.innerHTML = '';
        Object.keys(roomState.scores).forEach(player => {
            const li = document.createElement('li');
            li.className = 'cr-li';
            li.id = player;
            if (player === window.myUsername) {
                li.innerHTML = `<span class="profile-icon cr-avatar"></span> ${player} <span class="cr-sub">(you)</span>`;
            } else {
                li.innerHTML = `<span class="profile-icon cr-avatar"></span> ${player}`;
            }
            playerList.appendChild(li);
        });
    }
} 
else {
    socket.emit('createRoom', window.myUsername);
}

document.getElementById('player-list').innerHTML = `
    <li class="cr-li" id="${window.myUsername}">
        <span class="profile-icon cr-avatar"></span>
        ${window.myUsername} <span class="cr-sub">(you)</span>
    </li>
`;

socket.on('roomCreated', (data) => {
    currentRoom = data.roomCode;
    document.getElementById('room-code').innerText = currentRoom;
    sessionStorage.setItem('roomCode', currentRoom); 
    sessionStorage.setItem('isHost', 'true');
});

document.getElementById('leave-btn').addEventListener('click', () => {
    socket.emit('leaveRoom', currentRoom);

    sessionStorage.removeItem('roomCode');
    sessionStorage.removeItem('isHost');
    sessionStorage.removeItem('finalRoomState');
    
    window.location.href = '/game/multiplayer'; 
});

document.getElementById('start-btn').addEventListener('click', () => {
    
    const playerList = document.getElementById('player-list');
    const playerCount = playerList.getElementsByTagName('li').length;

    // Block the start if the host is alone
    if (playerCount < 2) {
        alert("You need at least 2 players to start a multiplayer game!");
        return; 
    }

    socket.emit('startGame', currentRoom);
});

socket.on('playerJoined', (newUsername) => {
    const playerList = document.getElementById('player-list');
    
    const newLi = document.createElement('li');
    newLi.className = 'cr-li';
    newLi.id = newUsername; 
    
    newLi.innerHTML = `<span class="profile-icon cr-avatar"></span> ${newUsername}`;
    
    playerList.appendChild(newLi);
});

socket.on('playerLeft', (usernameToRemove) => {
    const playerToRemove = document.getElementById(usernameToRemove);
    if (playerToRemove) {
        playerToRemove.remove();
    }
});

socket.on('gameStarted', () => {
    window.location.href = '/game/multiplayer/play';
});