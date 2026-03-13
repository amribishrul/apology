document.addEventListener("DOMContentLoaded", () => {
  initBackgroundHearts();
});

// Navigation & State
const sections = {
  landing: document.getElementById('landing-section'),
  game: document.getElementById('game-section'),
  letters: document.getElementById('letters-section'),
  final: document.getElementById('final-section')
};

// Audio Controls
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
let isMusicPlaying = false;

// Start Button smooth transition
document.getElementById('start-btn').addEventListener('click', () => {
  switchSection(sections.landing, sections.game);
  startGame();

  // Try to start the music on button click
  bgMusic.volume = 0.3; // Soft volume
  bgMusic.play().then(() => {
    isMusicPlaying = true;
    musicToggle.classList.remove('muted');
  }).catch((e) => {
    console.log("Audio autoplay blocked by browser. User must click toggle.", e);
  });
});

// Manual Music Toggle
musicToggle.addEventListener('click', () => {
  if (isMusicPlaying) {
    bgMusic.pause();
    musicToggle.classList.add('muted');
  } else {
    bgMusic.play();
    musicToggle.classList.remove('muted');
  }
  isMusicPlaying = !isMusicPlaying;
});

// Unlock Letters Button transition
document.getElementById('unlock-btn').addEventListener('click', () => {
  switchSection(sections.game, sections.letters);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function switchSection(hideSec, showSec) {
  hideSec.style.opacity = '0';
  setTimeout(() => {
    hideSec.classList.add('hidden');
    hideSec.classList.remove('active');

    showSec.classList.remove('hidden');
    // Small delay to allow display block to apply before fading in
    setTimeout(() => {
      showSec.classList.add('active');
      showSec.style.opacity = '1';
    }, 50);
  }, 800);
}

// ==========================================
// BACKGROUND HEARTS ANIMATION
// ==========================================
function initBackgroundHearts() {
  const container = document.getElementById('bg-hearts');
  setInterval(() => {
    const heart = document.createElement('div');
    heart.classList.add('float-heart');
    heart.innerText = ['🤍', '🌸', '✨', '❤️', '💌'][Math.floor(Math.random() * 5)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 5) + 's'; // 5s - 8s
    heart.style.fontSize = (Math.random() * 10 + 15) + 'px';
    container.appendChild(heart);

    // Remove heart after animation
    setTimeout(() => {
      heart.remove();
    }, 8000);
  }, 400);
}

// ==========================================
// MINI GAME LOGIC
// ==========================================
let score = 0;
const maxScore = 10; // Updated to 10
let gameInterval;
let gameActive = false;

// 10 Unique messages for the side stack
const messages = [
  "You mean the world to me ❤️",
  "I never meant to hurt you",
  "I'm really sorry",
  "You matter to me",
  "I should have thought before joking",
  "My days are brighter with you",
  "I hate seeing you upset",
  "You are my everything",
  "I promise to do better",
  "Please forgive me? 🥺"
];

const container = document.getElementById('game-container');
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score-display');
const messageStack = document.getElementById('message-stack');
const gameCompleteUI = document.getElementById('game-complete');

// Basket Movement (Desktop Mouse)
container.addEventListener('mousemove', (e) => {
  if (!gameActive) return;
  const rect = container.getBoundingClientRect();
  let x = e.clientX - rect.left;
  moveBasket(x, rect.width);
});

// Basket Movement (Mobile Touch)
container.addEventListener('touchmove', (e) => {
  if (!gameActive) return;
  e.preventDefault(); // Stop screen scrolling
  const rect = container.getBoundingClientRect();
  let x = e.touches[0].clientX - rect.left;
  moveBasket(x, rect.width);
}, { passive: false });

function moveBasket(x, containerWidth) {
  const basketWidth = basket.offsetWidth;
  // Keep basket in bounds
  if (x < basketWidth / 2) x = basketWidth / 2;
  if (x > containerWidth - basketWidth / 2) x = containerWidth - basketWidth / 2;
  basket.style.left = x + 'px';
}

function startGame() {
  gameActive = true;
  score = 0;
  updateScore();

  gameInterval = setInterval(() => {
    if (!gameActive) return;
    spawnHeart();
  }, 1200); // New heart every 1.2s
}

function spawnHeart() {
  const heart = document.createElement('div');
  heart.classList.add('game-heart');
  heart.innerText = '❤️';
  // Avoid placing on extreme right where messages appear
  heart.style.left = Math.random() * 60 + 10 + '%';
  heart.style.top = '-30px';
  container.appendChild(heart);

  let pos = -30;
  // Speed drastically reduced
  const speed = 1.0 + Math.random() * 1.5;

  function fall() {
    if (!gameActive) {
      heart.remove();
      return;
    }

    pos += speed;
    heart.style.top = pos + 'px';

    // Collision Check
    const heartRect = heart.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    if (
      heartRect.bottom >= basketRect.top &&
      heartRect.top <= basketRect.bottom &&
      heartRect.right >= basketRect.left &&
      heartRect.left <= basketRect.right
    ) {
      catchHeart(heart);
    } else if (pos > container.offsetHeight) {
      heart.remove(); // Missed
    } else {
      requestAnimationFrame(fall);
    }
  }
  requestAnimationFrame(fall);
}

function catchHeart(heart) {
  heart.remove();
  if (score < maxScore) {
    showPopupMessage(messages[score]);
    score++;
    updateScore();
    if (score >= maxScore) {
      endGame();
    }
  }
}

function updateScore() {
  scoreDisplay.innerText = `Hearts Collected: ${score} / ${maxScore}`;
}

// Updated stacking side message system
function showPopupMessage(msg) {
  const msgEl = document.createElement('div');
  msgEl.classList.add('stack-msg');
  msgEl.innerText = msg;

  // Prepend makes the newest message appear at the top of the stack
  messageStack.prepend(msgEl);

  setTimeout(() => {
    msgEl.remove();
  }, 3000); // Matches the CSS animation timing
}

function endGame() {
  gameActive = false;
  clearInterval(gameInterval);
  setTimeout(() => {
    gameCompleteUI.classList.remove('hidden');
    gameCompleteUI.style.opacity = 0;
    let fadeEffect = setInterval(function () {
      if (gameCompleteUI.style.opacity < 1) {
        gameCompleteUI.style.opacity = parseFloat(gameCompleteUI.style.opacity) + 0.1;
      } else {
        clearInterval(fadeEffect);
      }
    }, 50);
  }, 1000);
}

// ==========================================
// LETTERS INTERACTION
// ==========================================
function openEnvelope(element) {
  element.classList.toggle('open');

  // Hide the label when opened
  const label = element.querySelector('.env-label');
  if (element.classList.contains('open')) {
    label.style.opacity = '0';
  } else {
    label.style.opacity = '1';
  }
}

// ==========================================
// FINAL RESPONSE & FORMSPREE SUBMISSION
// ==========================================
function submitAnswer(event, answer) {
  event.stopPropagation(); // Prevents the envelope click event from triggering

  // Switch to Final Section visually immediately for smooth UX
  const finalContainer = document.getElementById('final-message-container');
  const finalTitle = document.getElementById('final-title');
  const finalText = document.getElementById('final-text');

  if (answer === 'Yes ❤️') {
    finalTitle.innerText = "Thank you ❤️";
    finalText.innerText = "Thank you for giving me another chance. I promise I'll do better.";
    finalContainer.style.boxShadow = "0 0 30px rgba(233, 30, 99, 0.6)";
    triggerConfetti();
  } else {
    finalTitle.innerText = "Take your time 🤍";
    finalText.innerText = "That’s okay… I’ll keep trying to make it up to you. I hope you give me another chance. I promise I'll do better ❤️";
  }

  switchSection(sections.letters, sections.final);

  // Send answer to Formspree silently in the background
  fetch('https://formspree.io/f/mpwbovab', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      message: "Apology Response",
      answer: answer
    })
  }).catch(error => console.log('Formspree Error:', error));
}

function triggerConfetti() {
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = -10 + 'vh';
    confetti.style.backgroundColor = ['#f48fb1', '#f06292', '#e91e63', '#ffb6c1', '#ffffff'][Math.floor(Math.random() * 5)];
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    confetti.style.animationDelay = (Math.random() * 2) + 's';
    document.body.appendChild(confetti);

    // Clean up
    setTimeout(() => {
      confetti.remove();
    }, 6000);
  }
}
