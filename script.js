const itemsArea = document.getElementById('items-area');
const claw = document.getElementById('claw-body');
const targetText = document.getElementById('target-answer');
const scoreText = document.getElementById('score');
const timerText = document.getElementById('timer');
const gameOverOverlay = document.getElementById('game-over-overlay');
const winOverlay = document.getElementById('win-overlay');
const finalScoreText = document.getElementById('final-score');

let playerName = "現場民眾";
let clawX = 225;
let score = 0;
let timeLeft = 600; // 修正為600秒 
let isDropping = false;
let isGameOver = false;
let gameTimer = null;
let currentCorrectAnswer = "";
let availableQuestions = [];

const antiFraudPool = [
    { q: "消費者服務專線的電話是？", options: ["📞 1950", "📞 110", "📞 119", "📞 123"], a: "📞 1950" },
    { q: "以下哪些是常見的詐騙手法？", options: ["💌 網路交友", "📈 假投資", "✅ 以上皆是", "🎁 領點數"], a: "✅ 以上皆是" },
    { q: "收到自稱檢察官電話說要監管帳戶？", options: ["☎️ 撥打 165", "💰 匯款給他", "🏦 操作 ATM"], a: "☎️ 撥打 165" },
    { q: "賄選檢舉專線為", options: ["📞 0800-024-099#4", "📞 113", "📞 2882-5252", "📞 119"], a: "📞 0800-024-099#4" },
    { q: "公務員赴大陸，事後返臺上班多久內應填寫「返臺通報表」？", options: ["一星期內", "不用填(ﾟ∀。)", "一年後", "一年內"], a: "一星期內" },
    { q: "透明晶質獎是哪個機關辦理的？", options: ["法務部廉政署", "數發部", "文山區公所", "體育部"], a: "法務部廉政署" },
    { q: "透明晶質獎舉辦目的是？", options: ["推動廉能治理", "激勵行政團隊", "樹立標竿學習", "以上皆是"], a: "以上皆是" },
    { q: "公務員收受與職務利害關係者之餽贈，例外市價應在多少以下？", options: ["新臺幣200元", "新臺幣1000元", "新臺幣500元", "新臺幣2000元"], a: "新臺幣200元" },
    { q: "電腦開機密碼建議應如何處理？", options: ["定期更換，確保機密", "不用換比較好", "看心情更換"], a: "定期更換，確保機密" },
    { q: "公益揭弊者保護法中的「揭弊者」包括？", options: ["政府機關之人", "國營事業之人", "受政府控制團體之人", "以上皆是"], a: "以上皆是" }
];

/* --- 控制功能 --- */
function moveLeft() {
    if (!isDropping && !isGameOver) {
        if (clawX > 30) { clawX -= 30; claw.style.left = clawX + 'px'; }
    }
}

function moveRight() {
    if (!isDropping && !isGameOver) {
        const maxRight = itemsArea.clientWidth - 60;
        if (clawX < maxRight) { clawX += 30; claw.style.left = clawX + 'px'; }
    }
}

function dropClaw() {
    if (isDropping || isGameOver) return;
    isDropping = true;
    const items = document.querySelectorAll('.item');
    const maxDropDepth = 280; 
    let caughtItem = null;
    let highestY = 999;

    items.forEach(item => {
        const itemCenterX = item.offsetLeft + (item.offsetWidth / 2);
        if (Math.abs(clawX + 25 - itemCenterX) < 45) {
            if (item.offsetTop < highestY) { highestY = item.offsetTop; caughtItem = item; }
        }
    });

    const stopDepth = caughtItem ? (highestY - 5) : maxDropDepth;
    claw.style.top = stopDepth + "px";

    setTimeout(() => {
        if (caughtItem) {
            caughtItem.style.transition = "top 0.7s";
            caughtItem.style.top = "-150px";
            if (caughtItem.innerText === currentCorrectAnswer) {
                score += 10;
                scoreText.innerText = score;
                if (score >= 100) winGame();
                else { timeLeft += 5; timerText.innerText = timeLeft; setTimeout(initGame, 500); }
            } else {
                alert("❌ 答錯了！");
                caughtItem.remove();
            }
        }
        claw.style.top = "0px";
        setTimeout(() => isDropping = false, 700);
    }, 750);
}

function shufflePositions() {
    if (isDropping || isGameOver) return;
    initGame();
}

window.onload = function() {
    document.getElementById('start-btn').onclick = startGameWithLogin;
    document.getElementById('btn-left').onclick = moveLeft;
    document.getElementById('btn-right').onclick = moveRight;
    document.getElementById('btn-drop').onclick = dropClaw;

    document.addEventListener('keydown', function(e) {
        if (isGameOver) return;
        if (e.code === 'ArrowLeft') moveLeft();
        if (e.code === 'ArrowRight') moveRight();
        if (e.code === 'Space') { e.preventDefault(); dropClaw(); }
    });
};

function startGameWithLogin() {
    document.getElementById('login-overlay').style.display = 'none';
    restartGame();
}

function restartGame() {
    score = 0;
    timeLeft = 600; // 重置為600秒 [cite: 31]
    isGameOver = false;
    isDropping = false;
    availableQuestions = [...antiFraudPool];
    scoreText.innerText = "0";
    timerText.innerText = "600"; [cite: 32]
    claw.style.left = "225px"; claw.style.top = "0px";
    gameOverOverlay.style.display = 'none';
    winOverlay.style.display = 'none';
    initGame();
    startTimer();
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

function initGame() {
    itemsArea.innerHTML = '';
    if (availableQuestions.length === 0) availableQuestions = [...antiFraudPool];
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const currentLevel = availableQuestions[randomIndex];
    availableQuestions.splice(randomIndex, 1); 
    targetText.innerText = currentLevel.q;
    currentCorrectAnswer = currentLevel.a;

    currentLevel.options.forEach((text) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = text;
        itemsArea.appendChild(item);
        item.style.left = Math.random() * (itemsArea.clientWidth - 100) + 'px';
        item.style.bottom = Math.random() * 150 + 'px';
    });
}

function endGame() { 
    isGameOver = true; 
    clearInterval(gameTimer); 
    finalScoreText.innerText = score;
    gameOverOverlay.style.display = 'flex'; 
}

function winGame() { 
    isGameOver = true;
    clearInterval(gameTimer); 
    winOverlay.style.display = 'flex'; 
}

function confirmReset() { if (confirm("確定重新開始？")) restartGame(); }
