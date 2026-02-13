const itemsArea = document.getElementById('items-area');
const claw = document.getElementById('claw-body');
const targetText = document.getElementById('target-answer');
const scoreText = document.getElementById('score');
const timerText = document.getElementById('timer');
const gameOverOverlay = document.getElementById('game-over-overlay');
const winOverlay = document.getElementById('win-overlay');
const finalScoreText = document.getElementById('final-score');

let playerName = "";
let clawX = 250;
let score = 0;
let timeLeft = 30; 
let isDropping = false;
let isGameOver = false;
let gameTimer = null;
let currentCorrectAnswer = "";

const antiFraudPool = [
    { q: "消費者服務專線的電話是？", options: ["📞 1950", "📞 110", "📞 119", "📞 123"], a: "📞 1950" },
    { q: "以下哪些是常見的詐騙手法？", options: ["💌 網路交友", "📈 假投資", "✅ 以上皆是", "🎁 領點數"], a: "✅ 以上皆是" },
    { q: "收到自稱檢察官電話說要監管帳戶？", options: ["☎️ 撥打 165", "💰 匯款給他", "🏦 操作 ATM", "📱 不予理會"], a: "☎️ 撥打 165" },
    { q: "網購接到電話，要求去 ATM 解除設定？", options: ["🙅 拒絕聽從", "🏦 前往 ATM", "🔢 提供個資", "💳 刷卡驗證"], a: "🙅 拒絕聽從" }
];

function startGameWithLogin() {
    const input = document.getElementById('player-name');
    if (input.value.trim() === "") {
        alert("請輸入挑戰者姓名！");
        return;
    }
    playerName = input.value;
    document.getElementById('user-display').innerText = "挑戰者：" + playerName;
    document.getElementById('winner-name-display').innerText = playerName;
    document.getElementById('login-overlay').style.display = 'none';
    restartGame();
}

function startTimer() {
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        if (!isGameOver) {
            timeLeft--;
            timerText.innerText = timeLeft;
            if (timeLeft <= 0) endGame();
        }
    }, 1000);
}

function endGame() {
    isGameOver = true;
    clearInterval(gameTimer);
    gameOverOverlay.style.display = 'flex';
    finalScoreText.innerText = score;
}

function winGame() {
    isGameOver = true;
    clearInterval(gameTimer);
    winOverlay.style.display = 'flex';
}

function confirmReset() {
    if (isGameOver || !playerName) return;
    if (confirm("確定要重頭開始遊戲嗎？")) {
        restartGame();
    }
}

function restartGame() {
    score = 0;
    timeLeft = 30;
    isGameOver = false;
    isDropping = false;
    clawX = 250;
    
    scoreText.innerText = "0";
    timerText.innerText = "30";
    claw.style.left = "250px";
    claw.style.top = "0px";
    gameOverOverlay.style.display = 'none';
    winOverlay.style.display = 'none';
    
    initGame();
    startTimer();
}

function initGame() {
    itemsArea.innerHTML = '';
    const currentLevel = antiFraudPool[Math.floor(Math.random() * antiFraudPool.length)];
    targetText.innerText = currentLevel.q;
    currentCorrectAnswer = currentLevel.a;
    
    const placedItems = [];
    currentLevel.options.forEach((text) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = text;
        itemsArea.appendChild(item);

        let randomLeft, randomBottom, attempts = 0;
        do {
            randomLeft = Math.floor(Math.random() * (itemsArea.offsetWidth - 100)) + 25;
            randomBottom = Math.floor(Math.random() * 260) + 40; 
            let isOverlapping = false;
            for (let other of placedItems) {
                if (Math.abs(randomLeft - other.left) < 100 && Math.abs(randomBottom - other.bottom) < 50) {
                    isOverlapping = true;
                    break;
                }
            }
            if (!isOverlapping || attempts > 50) break;
            attempts++;
        } while (true);

        placedItems.push({ left: randomLeft, bottom: randomBottom });
        item.style.left = randomLeft + 'px';
        item.style.bottom = randomBottom + 'px';
    });
}

window.addEventListener('keydown', (e) => {
    if (isDropping || isGameOver || !playerName) return;
    if (e.key === "ArrowLeft" && clawX > 40) clawX -= 25;
    if (e.key === "ArrowRight" && clawX < 480) clawX += 25;
    if (e.key === " " || e.code === "Space") {
        e.preventDefault(); 
        dropClaw(); 
    }
    claw.style.left = clawX + 'px';
});

function dropClaw() {
    if (isDropping || isGameOver) return;
    isDropping = true;
    const items = document.querySelectorAll('.item');
    const maxDropDepth = 430; 
    let caughtItem = null;
    let highestY = 999; 

    items.forEach(item => {
        const itemCenterX = item.offsetLeft + 40; 
        const distX = Math.abs(clawX - itemCenterX);
        if (distX < 45) { 
            if (item.offsetTop < highestY) {
                highestY = item.offsetTop;
                caughtItem = item;
            }
        }
    });

    const stopDepth = caughtItem ? (highestY - 5) : maxDropDepth;
    claw.style.top = stopDepth + "px";

    setTimeout(() => {
        if (caughtItem) {
            caughtItem.style.transition = "top 0.7s cubic-bezier(0.5, 0, 0.5, 1)";
            caughtItem.style.bottom = "auto";
            caughtItem.style.top = (stopDepth + 35) + "px";
            
            setTimeout(() => {
                caughtItem.style.top = "-100px"; 
                if (caughtItem.innerText === currentCorrectAnswer) {
                    score += 20;
                    scoreText.innerText = score;
                    if (score >= 200) {
                        winGame();
                    } else {
                        timeLeft += 5;
                        timerText.innerText = timeLeft;
                        // 換題延遲：等夾子升到一半再換題 (0.5秒)
                        setTimeout(() => {
                            initGame();
                        }, 500);
                    }
                } else {
                    alert("⚠️ 答錯！選項移除。"); 
                    caughtItem.remove(); 
                }
            }, 50);
        }
        claw.style.top = "0px";
        // 夾子回升完畢後解鎖
        setTimeout(() => { isDropping = false; }, 700);
    }, 750);
}
