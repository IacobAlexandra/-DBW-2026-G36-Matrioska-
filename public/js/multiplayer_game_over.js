document.addEventListener("DOMContentLoaded", () => {
    const username = window.username;

    const roomState = JSON.parse(sessionStorage.getItem('finalRoomState') || "{}");
    const correctWords = sessionStorage.getItem('myCorrect') || 0;
    const wrongWords = sessionStorage.getItem('myWrong') || 0;

    const myScore = (roomState.scores && roomState.scores[username]) ? roomState.scores[username] : 0;

    document.getElementById('final-score').innerText = myScore;
    document.getElementById('correct-words').innerText = correctWords;
    document.getElementById('wrong-words').innerText = wrongWords;

    const scoreboardList = document.getElementById('final-scoreboard');
    scoreboardList.innerHTML = '';

    if (roomState.scores) {
        const players = Object.keys(roomState.scores).sort((a, b) => {
            if (roomState.scores[b] !== roomState.scores[a]) {
                return roomState.scores[b] - roomState.scores[a];
            }
            if (a === username) return -1;
            if (b === username) return 1;
            return 0;
        });

        players.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = 'go-sb-li';
            const score = roomState.scores[player];
            
            if (player === username) {
                li.innerHTML = `<div class="profile-icon go-avatar-md"></div> ${player} <span class="go-sb-sub">(you): ${score} pts</span>`;
            } 
            else {
                li.innerHTML = `<div class="profile-icon go-avatar-md"></div> ${player}: ${score} pts`;
            }
            scoreboardList.appendChild(li);
        });
    } else {
        scoreboardList.innerHTML = '<li class="go-sb-li">No data available</li>';
    }
    
    sessionStorage.removeItem('finalRoomState');
    sessionStorage.removeItem('myCorrect');
    sessionStorage.removeItem('myWrong');
});

const username = window.username;
const socket = io({ query: { username: username } }); 
const roomCode = sessionStorage.getItem('roomCode');


if (roomCode) {
    socket.emit('joinRoom', { roomCode, username: window.username });
}

const isHost = sessionStorage.getItem('isHost') === 'true';
const playAgainBtn = document.getElementById('play-again-btn');

if (isHost) {
    playAgainBtn.addEventListener('click', () => {
        socket.emit('playAgain', roomCode);
    });
} else {
    playAgainBtn.innerText = "Waiting for Host...";
    playAgainBtn.style.pointerEvents = "none";
    playAgainBtn.style.opacity = "0.7";
}

socket.on('goToLobby', () => {
    if (isHost) {
        window.location.href = '/game/multiplayer/create';
    } else {
        window.location.href = '/game/multiplayer/join';
    }
});

document.querySelector('a[href="/menu"]').addEventListener('click', () => {
    if (roomCode) socket.emit('leaveRoom', roomCode);
    sessionStorage.removeItem('roomCode');
    sessionStorage.removeItem('isHost');
});