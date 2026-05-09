const initialTime = Number(window.timeLimit);
let timeLeft = initialTime;

let correctCount = 0;
let wrongCount = 0;

const timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('time-left').innerText = timeLeft;

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
    }
}, 1000);

document.getElementById('submit-btn').addEventListener('click', submitGuess);

document.getElementById('guess').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitGuess();
});

document.getElementById('exit-btn').addEventListener('click', () => {
    endGame(); 
});

function submitGuess() {
    const input = document.getElementById('guess');
    const feedback = document.getElementById('feedback-msg');

    const guess = input.value.trim().toUpperCase();
    if (!guess) return;

    fetch('/game/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: guess })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('score').innerText = data.totalScore;
        
        if (data.status === "valid") {
            correctCount++;
            document.getElementById('correct').innerText = correctCount;

            const li = document.createElement('li');
            li.innerText = data.word;
            document.getElementById('found-words-list').appendChild(li);

            feedback.innerText = "Correct!";
            feedback.style.color = "green";
        } 
        else if (data.status === "duplicate") {
            feedback.innerText = "Word already guessed!";
            feedback.style.color = "orange";
        } 
        else if (data.status === "invalid") {
            wrongCount++;
            document.getElementById('wrong').innerText = wrongCount;

            feedback.innerText = "Invalid!";
            feedback.style.color = "red";
        }

        input.value = "";
    })
    .catch(err => console.error(err));
}

function endGame() {
    const finalStats = {
        timePlayed: initialTime - timeLeft
    };

    fetch('/game/singleplayer/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalStats)
    })
    .then(() => {
        window.location.href = '/game/singleplayer/gameover';
    })
    .catch(err => console.error(err));
}