/* ============================================================
   THE HUNT FOR MY HEART — script.js
   ============================================================
   EDIT THESE VALUES to personalize the experience:
   - PASSWORD           (Level 6 — her nickname)
   - VIDEO_ID           (Level 7 — YouTube video id for "our song")
   - LETTER_TEXT        (Level 8 — the secret letter)
   - BALLOON_MESSAGES   (Level 3 — compliments / memories in balloons)
   - PHOTO_CAPTIONS     (Level 5 — caption(s) under the polaroid)
   - FINAL_TEXT         (ending reveal, typed out before the title)
   ============================================================ */

const PASSWORD = "moti"; // <-- change to her nickname (not case sensitive)

const VIDEO_ID = "LUgpPmj6nR8"; // Khat — Navjot Ahuja (official audio)

const LETTER_TEXT = `If you're reading this, you made it further than I thought you would today.

I wrote this because some things are easier to say on paper than out loud.
You make ordinary days feel like they matter. That's rarer than it sounds.

Keep going — there's one more surprise waiting for you.`;

const BALLOON_MESSAGES = [
  "You have the best laugh in any room you're in.",
  "Remember that time we got completely lost and just... laughed?",
  "You're kinder than you think you are.",
  "I still think about the first thing you ever said to me.",
  "You make hard days feel survivable.",
  "Your taste in literally everything is better than mine.",
  "You notice things other people miss.",
  "I like the way you say my name.",
  "You're the most stubborn person I know, in the best way.",
  "Not a key. Try another balloon.",
];

const PHOTO_CAPTIONS = [
  "you, being effortlessly you",
];

const FINAL_TEXT = `Congratulations.
You found the treasure.

But here's the secret...
there was never any treasure inside this chest.

The treasure has always been the person reading this.`;

/* ============================================================
   STATE
   ============================================================ */
let soundEnabled = true;
let keysCollected = [];
const KEY_EMOJIS = ['🗝️','🧩','🎈','⭐','📷','🔐','🎵','✉️','🎡'];

/* ============================================================
   AUDIO — tiny synthesized blips, no external files needed
   ============================================================ */
let audioCtx = null;
function ensureAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}
function playBlip(freq = 440, dur = 0.09, type = 'sine'){
  if(!soundEnabled) return;
  try{
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  }catch(e){ /* audio not available, fail silently */ }
}

document.getElementById('soundToggle').addEventListener('click', (e) => {
  soundEnabled = !soundEnabled;
  e.target.textContent = soundEnabled ? '🔈' : '🔇';
});

/* ============================================================
   FIREFLIES (ambient, runs the whole time)
   ============================================================ */
function spawnFireflies(){
  const field = document.getElementById('fireflies');
  for(let i = 0; i < 16; i++){
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = `${Math.random()*100}%`;
    f.style.top = `${Math.random()*100}%`;
    f.style.setProperty('--dx', `${(Math.random()*80 - 40)}px`);
    f.style.setProperty('--dy', `${(Math.random()*-120 - 40)}px`);
    f.style.animationDuration = `${6 + Math.random()*6}s`;
    f.style.animationDelay = `${Math.random()*6}s`;
    field.appendChild(f);
  }
}
spawnFireflies();

/* ============================================================
   CANVAS PARTICLE SYSTEM — confetti / hearts / fireworks
   ============================================================ */
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let particles = [];
let ambientMode = null; // null | 'hearts' | 'fireworks'

function spawnBurst(x, y, count = 40){
  for(let i = 0; i < count; i++){
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 60 + Math.random()*30,
      age: 0,
      color: ['#f0b429','#ff6b9d','#a276ff','#fdf6e9','#6be0d6'][Math.floor(Math.random()*5)],
      size: 3 + Math.random()*3,
      kind: 'confetti',
    });
  }
}

function spawnFloatingHeart(){
  particles.push({
    x: Math.random()*canvas.width,
    y: canvas.height + 20,
    vx: (Math.random()-0.5)*0.6,
    vy: -(0.6 + Math.random()*1),
    life: 400, age: 0,
    size: 12 + Math.random()*14,
    kind: 'heart',
    opacity: 0.6 + Math.random()*0.4,
  });
}

function spawnFirework(){
  const x = Math.random()*canvas.width;
  const y = canvas.height*0.2 + Math.random()*canvas.height*0.3;
  spawnBurst(x, y, 50);
}

function tick(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(ambientMode === 'hearts' && Math.random() < 0.06) spawnFloatingHeart();
  if(ambientMode === 'fireworks' && Math.random() < 0.02) spawnFirework();

  particles.forEach(p => {
    p.age++;
    p.x += p.vx;
    p.y += p.vy;
    if(p.kind === 'confetti') p.vy += 0.05;

    ctx.globalAlpha = p.opacity !== undefined ? p.opacity * (1 - p.age/p.life) : Math.max(0, 1 - p.age/p.life);
    if(p.kind === 'confetti'){
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if(p.kind === 'heart'){
      ctx.font = `${p.size}px sans-serif`;
      ctx.fillText('❤', p.x, p.y);
    }
  });
  ctx.globalAlpha = 1;

  particles = particles.filter(p => p.age < p.life && p.y < canvas.height + 40);
  requestAnimationFrame(tick);
}
tick();

/* ============================================================
   SCREEN NAVIGATION
   ============================================================ */
function goToScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${id}`).classList.add('active');

  const progressWrap = document.getElementById('progressWrap');
  const num = parseInt(id, 10);
  if(!isNaN(num)){
    progressWrap.classList.remove('hidden');
    document.getElementById('progressFill').style.width = `${(num/10)*100}%`;
    document.getElementById('progressLabel').textContent = `Level ${num} / 10`;
  } else {
    progressWrap.classList.add('hidden');
  }

  if(id === 'final'){ startFinalSequence(); ambientMode = 'fireworks'; }
}

function completeLevelAndGo(levelNum, nextId){
  playBlip(660, 0.12);
  if(levelNum >= 1 && levelNum <= 9 && !keysCollected[levelNum-1]){
    keysCollected[levelNum-1] = KEY_EMOJIS[levelNum-1];
  }
  goToScreen(nextId);
}

document.getElementById('startBtn').addEventListener('click', () => {
  playBlip(520, 0.15);
  goToScreen('1');
});

document.querySelectorAll('.continue-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const current = btn.closest('.screen').dataset.screen;
    completeLevelAndGo(parseInt(current,10), btn.dataset.next);
  });
});

/* ============================================================
   LEVEL 2 — HEART PUZZLE (pointer-based drag, mouse + touch)
   ============================================================ */
(function setupPuzzle(){
  const pieces = document.querySelectorAll('#puzzlePieces .piece');
  const slots = document.querySelectorAll('#puzzleSlots .slot');
  let placedCount = 0;

  pieces.forEach(piece => {
    let dragging = false, offsetX = 0, offsetY = 0, startParent = piece.parentElement;

    piece.addEventListener('pointerdown', (e) => {
      if(piece.classList.contains('placed')) return;
      dragging = true;
      piece.classList.add('dragging');
      piece.setPointerCapture(e.pointerId);
      const rect = piece.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.body.appendChild(piece); // bring to top layer while dragging
      piece.style.position = 'fixed';
      piece.style.left = rect.left + 'px';
      piece.style.top = rect.top + 'px';
    });

    piece.addEventListener('pointermove', (e) => {
      if(!dragging) return;
      piece.style.left = (e.clientX - offsetX) + 'px';
      piece.style.top = (e.clientY - offsetY) + 'px';
    });

    piece.addEventListener('pointerup', (e) => {
      if(!dragging) return;
      dragging = false;
      piece.classList.remove('dragging');
      const pieceRect = piece.getBoundingClientRect();
      const pieceCenter = { x: pieceRect.left + pieceRect.width/2, y: pieceRect.top + pieceRect.height/2 };

      let placed = false;
      slots.forEach(slot => {
        if(slot.classList.contains('filled')) return;
        const slotRect = slot.getBoundingClientRect();
        if(pieceCenter.x > slotRect.left && pieceCenter.x < slotRect.right &&
           pieceCenter.y > slotRect.top && pieceCenter.y < slotRect.bottom){
          slot.classList.add('filled');
          slot.appendChild(piece);
          piece.style.position = 'static';
          piece.classList.add('placed');
          placed = true;
          placedCount++;
          playBlip(500 + placedCount*60, 0.1);
        }
      });

      if(!placed){
        // snap back
        piece.style.position = 'static';
        document.getElementById('puzzlePieces').appendChild(piece);
      }

      if(placedCount === 4){
        document.getElementById('puzzleArea').classList.add('heart-glow');
        document.getElementById('puzzleSuccess').style.display = 'block';
        document.getElementById('puzzleContinue').classList.remove('hidden');
        const rect = document.getElementById('puzzleArea').getBoundingClientRect();
        spawnBurst(rect.left + rect.width/2, rect.top + rect.height/2, 50);
        playBlip(880, 0.2);
      }
    });
  });
})();

/* ============================================================
   LEVEL 3 — BALLOONS
   ============================================================ */
(function setupBalloons(){
  const field = document.getElementById('balloonField');
  const msgEl = document.getElementById('balloonMsg');
  const continueBtn = document.getElementById('balloonContinue');
  const colors = ['#ff6b9d','#f0b429','#a276ff','#6be0d6','#ff8f65'];
  let keyFound = false;
  let hasActiveKey = false;
  let spawnTimer = null;

  function spawnBalloon(){
    if(keyFound) return;
    const b = document.createElement('div');
    b.className = 'balloon';
    // guarantee a key balloon is (almost) always somewhere on screen:
    // as soon as there isn't one active, the next balloon spawned becomes it
    const isKey = !hasActiveKey;
    if(isKey){
      hasActiveKey = true;
      b.dataset.key = 'true';
      b.classList.add('key-glimmer');
    }
    b.style.left = `${5 + Math.random()*85}%`;
    b.style.background = colors[Math.floor(Math.random()*colors.length)];
    b.style.setProperty('--drift', `${(Math.random()*60 - 30)}px`);
    b.style.animationDuration = `${7 + Math.random()*5}s`;

    b.addEventListener('animationend', () => {
      if(b.dataset.key) hasActiveKey = false;
      b.remove();
    });

    b.addEventListener('click', () => {
      if(b.classList.contains('popped')) return;
      b.classList.add('popped');
      playBlip(700, 0.08, 'triangle');
      if(b.dataset.key){
        keyFound = true;
        msgEl.textContent = "A golden key! 🔑";
        msgEl.classList.add('success-text');
        continueBtn.classList.remove('hidden');
        clearInterval(spawnTimer);
      } else {
        msgEl.textContent = BALLOON_MESSAGES[Math.floor(Math.random()*BALLOON_MESSAGES.length)];
      }
      setTimeout(() => b.remove(), 300);
    });

    field.appendChild(b);
  }

  for(let i=0;i<10;i++) setTimeout(spawnBalloon, i*300);
  spawnTimer = setInterval(() => {
    if(field.querySelectorAll('.balloon').length < 14) spawnBalloon();
  }, 650);
})();

/* ============================================================
   LEVEL 4 — FIND THE STAR
   ============================================================ */
(function setupSky(){
  const field = document.getElementById('skyField');
  const continueBtn = document.getElementById('starContinue');
  const successText = document.getElementById('starSuccess');

  for(let i = 0; i < 45; i++){
    const s = document.createElement('div');
    s.className = 'sky-star';
    s.style.left = `${Math.random()*97}%`;
    s.style.top = `${Math.random()*90}%`;
    s.style.animationDelay = `${Math.random()*2}s`;
    field.appendChild(s);
  }

  const special = document.createElement('div');
  special.className = 'sky-star special';
  special.style.left = `${10 + Math.random()*75}%`;
  special.style.top = `${10 + Math.random()*70}%`;
  special.addEventListener('click', () => {
    if(special.dataset.found) return;
    special.dataset.found = 'true';
    playBlip(880, 0.2);
    successText.style.display = 'block';
    continueBtn.classList.remove('hidden');
    const rect = special.getBoundingClientRect();
    spawnBurst(rect.left, rect.top, 30);
  });
  field.appendChild(special);
})();

/* ============================================================
   LEVEL 5 — CAMERA / POLAROID
   ============================================================ */
document.getElementById('takePhotoBtn').addEventListener('click', () => {
  const flash = document.createElement('div');
  flash.className = 'flash-overlay flashing';
  document.body.appendChild(flash);
  playBlip(300, 0.1);
  setTimeout(() => flash.remove(), 550);

  setTimeout(() => {
    document.getElementById('polaroid').classList.remove('hidden');
    document.getElementById('polaroidCaption').textContent =
      PHOTO_CAPTIONS[Math.floor(Math.random()*PHOTO_CAPTIONS.length)];
    document.getElementById('cameraBox').classList.add('hidden');
  }, 300);

  setTimeout(() => {
    document.getElementById('photoContinue').classList.remove('hidden');
  }, 2400);
});

/* ============================================================
   LEVEL 6 — PASSWORD LOCK
   ============================================================ */
document.getElementById('lockSubmit').addEventListener('click', () => {
  const val = document.getElementById('lockInput').value.trim().toLowerCase();
  const lockBox = document.getElementById('lockBox');
  if(val === PASSWORD.toLowerCase()){
    playBlip(880, 0.2);
    document.getElementById('lockError').classList.add('hidden');
    lockBox.classList.add('hidden');
    document.getElementById('lockHint').classList.add('hidden');
    document.getElementById('lockContinue').classList.remove('hidden');
  } else {
    playBlip(160, 0.15, 'sawtooth');
    lockBox.classList.remove('shake');
    void lockBox.offsetWidth; // restart animation
    lockBox.classList.add('shake');
    document.getElementById('lockError').classList.remove('hidden');
  }
});
document.getElementById('lockInput').addEventListener('keydown', (e) => {
  if(e.key === 'Enter') document.getElementById('lockSubmit').click();
});

/* ============================================================
   LEVEL 7 — MUSIC ROOM
   ============================================================ */
let musicLoaded = false;
function loadMusicRoom(){
  if(musicLoaded) return;
  musicLoaded = true;
  const player = document.getElementById('musicPlayer');
  player.innerHTML = `<iframe src="https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0" title="our song" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
}

/* ============================================================
   LEVEL 8 — SECRET LETTER (typewriter)
   ============================================================ */
let letterTyped = false;
function typeLetter(){
  if(letterTyped) return;
  letterTyped = true;
  const el = document.getElementById('letterText');
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += LETTER_TEXT[i];
    i++;
    if(i >= LETTER_TEXT.length){
      clearInterval(interval);
      document.getElementById('letterContinue').classList.remove('hidden');
    }
  }, 28);
}

/* ============================================================
   LEVEL 9 — WHEEL OF LOVE
   ============================================================ */
const WHEEL_SECTIONS = ["Smile","Eyes","Laugh","Kindness","Voice","Everything"];
let wheelBuilt = false;
let wheelRotation = 0;
function buildWheel(){
  if(wheelBuilt) return;
  wheelBuilt = true;
  const wheel = document.getElementById('wheel');
  const n = WHEEL_SECTIONS.length;
  const sliceDeg = 360 / n;
  const colors = ['#ff6b9d','#f0b429','#a276ff','#6be0d6','#ff8f65','#e8b23c'];
  let gradientParts = [];
  WHEEL_SECTIONS.forEach((label, i) => {
    const start = i * sliceDeg;
    const end = start + sliceDeg;
    gradientParts.push(`${colors[i % colors.length]} ${start}deg ${end}deg`);
    const span = document.createElement('span');
    span.textContent = label;
    const mid = start + sliceDeg/2;
    // labels on the bottom half of the wheel would otherwise render upside down —
    // flip them 180deg in place (around their own anchor point) so they stay readable
    const needsFlip = mid > 90 && mid < 270;
    span.style.transform = `rotate(${mid}deg) translate(60px, -6px)${needsFlip ? ' rotate(180deg)' : ''}`;
    wheel.appendChild(span);
  });
  wheel.style.background = `conic-gradient(${gradientParts.join(',')})`;
}

document.getElementById('spinBtn').addEventListener('click', (e) => {
  const wheel = document.getElementById('wheel');
  const n = WHEEL_SECTIONS.length;
  const sliceDeg = 360 / n;
  const everythingIndex = WHEEL_SECTIONS.indexOf("Everything");
  // land the pointer (top, 0deg) on the middle of the "Everything" slice
  const targetMid = everythingIndex * sliceDeg + sliceDeg/2;
  const extraSpins = 5 * 360;
  wheelRotation += extraSpins + (360 - targetMid) - (wheelRotation % 360);
  wheel.style.transform = `rotate(${wheelRotation}deg)`;
  playBlip(440, 0.3);
  e.target.disabled = true;

  setTimeout(() => {
    document.getElementById('wheelResult').textContent = "I win because I got you ❤️";
    document.getElementById('wheelResult').classList.remove('hidden');
    document.getElementById('wheelContinue').classList.remove('hidden');
    playBlip(880, 0.25);
  }, 3600);
});

/* ============================================================
   LEVEL 10 — TREASURE CHEST
   ============================================================ */
document.getElementById('openChestBtn').addEventListener('click', function(){
  this.disabled = true;
  const chest = document.getElementById('chest');
  const keyring = document.getElementById('keyring');

  // fly keys into the chest one by one
  const keyIcons = Array.from(keyring.children);
  keyIcons.forEach((icon, i) => {
    setTimeout(() => {
      icon.style.transition = 'all .5s ease';
      icon.style.transform = 'translateY(60px) scale(0.3)';
      icon.style.opacity = '0';
      playBlip(600 + i*30, 0.08);
    }, i * 150);
  });

  setTimeout(() => {
    chest.classList.add('shaking');
    playBlip(200, 0.3, 'sawtooth');
  }, keyIcons.length * 150 + 300);

  setTimeout(() => {
    chest.classList.remove('shaking');
    chest.classList.add('opening');
    const rect = chest.getBoundingClientRect();
    spawnBurst(rect.left + rect.width/2, rect.top, 80);
    playBlip(1046, 0.4);
  }, keyIcons.length * 150 + 900);

  setTimeout(() => {
    goToScreen('final');
  }, keyIcons.length * 150 + 2600);
});

/* ============================================================
   FINAL SEQUENCE
   ============================================================ */
let finalStarted = false;
function startFinalSequence(){
  if(finalStarted) return;
  finalStarted = true;
  const el = document.getElementById('finalReveal');
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += FINAL_TEXT[i];
    i++;
    if(i >= FINAL_TEXT.length){
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById('finalTitle').classList.remove('hidden');
        playBlip(988, 0.3);
      }, 500);
      setTimeout(() => {
        document.getElementById('restartBtn').classList.remove('hidden');
      }, 1400);
    }
  }, 35);
}

document.getElementById('restartBtn').addEventListener('click', () => {
  // reset all game state so the experience can be replayed
  keysCollected = [];
  ambientMode = null;
  particles = [];
  finalStarted = false;
  letterTyped = false;
  musicLoaded = false;
  wheelRotation = 0;

  document.getElementById('finalReveal').textContent = '';
  document.getElementById('finalTitle').classList.add('hidden');
  document.getElementById('restartBtn').classList.add('hidden');
  document.getElementById('letterText').textContent = '';
  document.getElementById('letterContinue').classList.add('hidden');
  document.getElementById('polaroid').classList.add('hidden');
  document.getElementById('cameraBox').classList.remove('hidden');
  document.getElementById('photoContinue').classList.add('hidden');
  document.getElementById('lockBox').classList.remove('hidden');
  document.getElementById('lockHint').classList.remove('hidden');
  document.getElementById('lockInput').value = '';
  document.getElementById('lockContinue').classList.add('hidden');
  document.getElementById('lockError').classList.add('hidden');
  document.getElementById('wheelResult').classList.add('hidden');
  document.getElementById('wheelContinue').classList.add('hidden');
  document.getElementById('wheel').style.transform = 'rotate(0deg)';
  document.getElementById('spinBtn').disabled = false;
  document.getElementById('puzzleSuccess').style.display = 'none';
  document.getElementById('puzzleContinue').classList.add('hidden');
  document.getElementById('puzzleArea').classList.remove('heart-glow');
  document.querySelectorAll('#puzzleSlots .slot').forEach(s => s.classList.remove('filled'));
  document.querySelectorAll('#puzzlePieces .piece, #puzzleSlots .piece').forEach(p => {
    p.classList.remove('placed');
    document.getElementById('puzzlePieces').appendChild(p);
  });
  document.getElementById('balloonField').innerHTML = '';
  document.getElementById('balloonMsg').textContent = '\u00A0';
  document.getElementById('balloonContinue').classList.add('hidden');
  document.getElementById('skyField').innerHTML = '';
  document.getElementById('starSuccess').style.display = 'none';
  document.getElementById('starContinue').classList.add('hidden');
  document.getElementById('keyring').innerHTML = '';
  document.getElementById('chest').classList.remove('opening');
  document.getElementById('openChestBtn').disabled = false;

  location.reload(); // simplest reliable full reset for a from-scratch replay
});

/* ============================================================
   Load level-specific content the first time each level is shown
   ============================================================ */
const observer = new MutationObserver(() => {
  if(document.getElementById('screen-7').classList.contains('active')) loadMusicRoom();
  if(document.getElementById('screen-8').classList.contains('active')) typeLetter();
  if(document.getElementById('screen-9').classList.contains('active')) buildWheel();
  if(document.getElementById('screen-10').classList.contains('active')){
    const keyring = document.getElementById('keyring');
    if(keyring.children.length === 0){
      keysCollected.filter(Boolean).forEach(emoji => {
        const span = document.createElement('span');
        span.className = 'key-icon';
        span.textContent = emoji;
        keyring.appendChild(span);
      });
    }
  }
});
document.querySelectorAll('.screen').forEach(s => observer.observe(s, { attributes:true, attributeFilter:['class'] }));
