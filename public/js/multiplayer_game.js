const username = window.username; 
const socket = io({ query: { username: username } }); 
const roomCode = sessionStorage.getItem('roomCode');

socket.on('joinError', (errorMessage) => {
    alert("SERVER REJECTED YOU: " + errorMessage + "\nRoom Code Tried: " + roomCode);
    window.location.href = '/game/multiplayer'; 
});

let correctCount = 0;
let wrongCount = 0;

socket.emit('joinRoom', { roomCode, username });

socket.on('gameStateUpdate', (roomState) => {
      // Save the freshest room data to memory
    sessionStorage.setItem('finalRoomState', JSON.stringify(roomState));

    document.getElementById('master-word').innerText = roomState.masterWord || "Waiting...";
    document.getElementById('time-left').innerText = roomState.timeLeft || 0;

    const scoreboardList = document.getElementById('scoreboard-list');
    scoreboardList.innerHTML = '';

    if (roomState.scores) {
        const players = Object.keys(roomState.scores).sort((a, b) => {
            if (roomState.scores[b] !== roomState.scores[a]) {
                return roomState.scores[b] - roomState.scores[a];
            }
        
            //Tie-breaker: If scores are tied, put the current the current user ("you") first
            if (a === username) return -1;
            if (b === username) return 1;
        
            return 0;
        });
        players.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = 'mp-sb-li';
            const score = roomState.scores[player];
            
            if (player === username) {
                li.innerHTML = `<div class="profile-icon mp-avatar-sm"></div> ${index + 1}. ${player} <span class="mp-sb-sub">(you): ${score} pts</span>`;
                document.getElementById('my-score').innerText = score;
            } 
            else {
                li.innerHTML = `<div class="profile-icon mp-avatar-sm"></div> ${index + 1}. ${player}: ${score} pts`;
            }
            scoreboardList.appendChild(li);
        });
    }

    const foundWordsList = document.getElementById('found-words-list');
    foundWordsList.innerHTML = '';
    
    if (roomState.foundWords) {
        roomState.foundWords.forEach(word => {
            const li = document.createElement('li');
            li.innerText = word;
            foundWordsList.appendChild(li);
        });
    }

    if (roomState.validSubWords && roomState.foundWords) {
        const undiscovered = roomState.validSubWords.length - roomState.foundWords.length;
        document.getElementById('undiscovered-count').innerText = undiscovered;
    }
});

socket.on('gameOver', () => {
    sessionStorage.setItem('myCorrect', correctCount);
    sessionStorage.setItem('myWrong', wrongCount);
    
    window.location.href = '/game/multiplayer/gameover';

});

document.getElementById('submit-btn').addEventListener('click', submitGuess);
document.getElementById('guess-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitGuess();
});

function submitGuess() {
    const input = document.getElementById('guess-input');
    const guess = input.value.trim().toUpperCase();
    if (!guess) return;

    console.log(`[FRONTEND] Sending guess: ${guess} to room: ${roomCode}`);

    fetch('/game/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: guess, roomCode: roomCode })
    })
    .then(async res => {
        const data = await res.json();
        console.log("[FRONTEND] Received data from server:", data);
        return data;
    })
    .then(data => {
        if (data.status === "valid") {
            correctCount++;
            document.getElementById('my-correct').innerText = correctCount;
            showToast("Correct! +" + data.points, "success");
        } 
        else if (data.status === "invalid") {
            wrongCount++;
            document.getElementById('my-wrong').innerText = wrongCount;
            showToast("Invalid word!", "error");
        }
        else if (data.status === "duplicate") {
            showToast("Already found!", "warning");
        }

        socket.emit('stateChanged', roomCode);
        input.value = "";
    })
    .catch(err => {
        console.error("[FRONTEND CRASH] The Fetch request failed:", err);
        showToast("Server error!", "error");
    })
}

function showToast(message, type) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

document.getElementById('exit-btn').addEventListener('click', () => {
    socket.emit('leaveRoom', roomCode);
    window.location.href = '/game/multiplayer'; 
});

socket.on('playerLeft', (leftUsername) => {
    const feedback = document.getElementById('feedback-msg');
    feedback.innerText = leftUsername + " fled the game!";
    feedback.style.color = "orange";
    
});