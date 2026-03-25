const itemsArea = document.getElementById('items-area');
const claw = document.getElementById('claw-body');
const targetText = document.getElementById('target-answer');
const scoreText = document.getElementById('score');
const timerText = document.getElementById('timer');
const gameOverOverlay = document.getElementById('game-over-overlay');
const winOverlay = document.getElementById('win-overlay');

let playerName = "現場民眾";
let clawX = 225;
let score = 0;
let timeLeft = 600; // 強制設定為 600 [cite: 3]
let isDropping = false;
let isGameOver = false;
let gameTimer = null;
let currentCorrectAnswer = "";
let availableQuestions = [];

const antiFraudPool = [
    { q: "消費者服務專線的電話是？", options: ["📞 1950", "📞 110", "📞 119", "📞 123"], a: "📞 1950" },
    { q: "以下哪些是常見的詐騙手法？", options: ["💌 網路交友", "📈 假投資", "✅ 以上皆是", "🎁 領點數"], a: "✅ 以上皆是" },
    { q: "賄選檢舉專線為？", options: ["📞 0800-024-099#4", "📞 113", "📞 110", "📞 119"], a: "📞 0800-024-099#4" },
    { q: "透明晶質獎是哪個機關辦理的？", options: ["法務部廉政署", "數發部", "文山區公所", "體育部"], a: "法務部廉政署" },
    { q: "公務員收受餽贈，例外市價應在多少以下？", options: ["新臺幣200元", "新臺幣1000元", "新臺幣500元"], a: "新臺幣200元" }
];

/* --- 核心修正：啟動與重置 --- */
function startGameWithLogin() {
    document.getElementById('login-overlay').style.display = 'none';
    restartGame();
}

function restartGame() {
    clearInterval(gameTimer); // 清除舊的計時器
    score = 0;
    timeLeft = 600; // 確保重置時回到 600 
    isGameOver = false;
    isDropping = false;
    availableQuestions = [...antiFraudPool];
    
    scoreText.innerText = "0";
    timerText.innerText = "600"; // 畫面顯示 600 
    
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
    }, 1000); // 每一秒扣一次 [cite: 33]
}

/* --- 抓取與重排邏輯 --- */
function dropClaw() {
    if (isDropping || isGameOver) return;
    isDropping = true;
    const items = document.querySelectorAll('.item');
    let caughtItem = null;

    // 簡單判定：爪子下方是否有物體
    items.forEach(item => {
        const itemCenterX = item.offsetLeft + (item.offsetWidth / 2);
        if (Math.abs(clawX + 25 - itemCenterX) < 45) { caughtItem = item; }
    });

    claw.style.top = caughtItem ? (caughtItem.offsetTop - 5) + "px" : "280px";

    setTimeout(() => {
        if (caughtItem) {
            caughtItem.style.transition = "top 0.7s";
            caughtItem.style.top = "-150px";
            if (caughtItem.innerText === currentCorrectAnswer) {
                score += 10;
                scoreText.innerText = score;
                if (score >= 100) winGame();
                else { setTimeout(initGame, 500); }
            } else {
                alert("❌ 答錯了！");
                caughtItem.remove();
            }
        }
        claw.style.top = "0px";
        setTimeout(() => isDropping = false, 700);
    }, 750);
}

function initGame() {
    itemsArea.innerHTML = '';
    if (availableQuestions.length === 0) availableQuestions = [...antiFraudPool];
    const level = availableQuestions.pop();
    targetText.innerText = level.q;
    currentCorrectAnswer = level.a;

    level.options.forEach(text => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = text;
        itemsArea.appendChild(item);
        item.style.left = Math.random() * (itemsArea.clientWidth - 100) + 'px';
        item.style.bottom = Math.random() * 150 + 'px';
    });
}

function shufflePositions() { initGame(); }
function endGame() { isGameOver = true; clearInterval(gameTimer); gameOverOverlay.style.display = 'flex'; }
function winGame() { isGameOver = true; clearInterval(gameTimer); winOverlay.style.display = 'flex'; }
function confirmReset() { if (confirm("確定重新開始？")) restartGame(); }

window.onload = function() {
    document.getElementById('start-btn').onclick = startGameWithLogin;
    document.getElementById('btn-left').onclick = () => { if(!isDropping) { clawX = Math.max(0, clawX-30); claw.style.left=clawX+'px'; }};
    document.getElementById('btn-right').onclick = () => { if(!isDropping) { clawX = Math.min(450, clawX+30); claw.style.left=clawX+'px'; }};
    document.getElementById('btn-drop').onclick = dropClaw;
};
