/* ============================================================
   EID MUBARAK — script.js
   Controls: stars, screen transitions, envelope, typing,
             photo mapping, confetti, and blessings.
   ============================================================ */

/* ============================================================
   0. UTILITY: Read ?name= from URL
   ============================================================ */
function getNameFromURL() {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get('name') || 'friend').trim();
  // Capitalise first letter for a polished look
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

const RECIPIENT = getNameFromURL();

/* ============================================================
   1. DATA — Personalised messages, photo mapping, blessings
   ============================================================ */

// Add more names here to personalise for each recipient.
// Keys must be lowercase (we lowercase the URL param before lookup).
const MESSAGES = {
  zaineb : "May this Eid bring you endless happiness, peace, and beautiful new beginnings.",
  ali   : "May your year be full of baraka, great achievements, and doors that open wide.",
  mom   : "Thank you for everything you do, every single day. This Eid, all the love comes back to you.",
  dad   : "Your strength inspires us more than words can say. Eid Mubarak, always.",
  ahmed : "Wishing you a blessed Eid surrounded by those who love you most.",
  layla : "May joy find you wherever you go this Eid and throughout the year.",
};

// Map lowercase names to relative image paths.
// Place your images in an /images/ folder next to index.html.
const PHOTOS = {
  zaineb : "images/zaineb.jpg",
  ali   : "images/ali.jpg",
  mom   : "images/mom.jpg",
  dad   : "images/dad.jpg",
  ahmed : "images/ahmed.jpg",
  layla : "images/layla.jpg",
};

// Pool of random blessings shown on button click.
const BLESSINGS = [
  "Your year will be filled with baraka and abundant blessings.",
  "Good news is already on its way to you.",
  "Success, health, and happiness await you this year.",
  "May every door you knock on open with ease.",
  "The best of what you hope for is closer than you think.",
  "May you be surrounded by love, laughter, and light all year long.",
  "Your duas will be answered — keep faith in your heart.",
];

// Default message if name not found in dictionary
const DEFAULT_MESSAGE =
  "May this blessed Eid bring you and your family joy, peace, and endless blessings. 🌙";

/* ============================================================
   2. STAR FIELD — drawn on <canvas id="starCanvas">
   ============================================================ */
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    generateStars();
  }

  function generateStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 4000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x     : Math.random() * canvas.width,
        y     : Math.random() * canvas.height,
        r     : Math.random() * 1.4 + 0.2,
        alpha : Math.random(),
        speed : Math.random() * 0.004 + 0.001,
        phase : Math.random() * Math.PI * 2,
      });
    }
  }

  function drawStars(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      // Gentle twinkle using sine wave
      const brightness = 0.35 + 0.65 * Math.abs(Math.sin(s.phase + timestamp * s.speed));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 248, 220, ${brightness})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(drawStars);
})();

/* ============================================================
   3. SCREEN TRANSITIONS — fade between the 3 screens
   ============================================================ */
function showScreen(nextId) {
  // Find the currently active screen and fade it out
  const current = document.querySelector('.screen.active');
  if (current) {
    current.classList.add('exit');
    current.classList.remove('active');
    // Remove exit class after transition so it doesn't interfere later
    setTimeout(() => current.classList.remove('exit'), 900);
  }

  // Fade the next screen in after a short delay
  setTimeout(() => {
    const next = document.getElementById(nextId);
    if (next) next.classList.add('active');
  }, 400);
}

/* ============================================================
   4. LANDING → ENVELOPE: "Open your Eid surprise" button
   ============================================================ */
document.getElementById('openSurpriseBtn').addEventListener('click', () => {
  showScreen('envelopeScreen');
});

/* ============================================================
   5. ENVELOPE ANIMATION → GREETING
   ============================================================ */
const envelope     = document.getElementById('envelope');
const openEnvBtn   = document.getElementById('openEnvelopeBtn');

function openEnvelope() {
  // 1. Play chime sound effect
  const chime = document.getElementById('chimeSound');
  if (chime) {
    chime.currentTime = 0;
    chime.volume = 0.7;
    chime.play().catch(() => {}); // Ignore if browser blocks autoplay
  }

  // 2. Play open animation
  envelope.classList.add('open');
  openEnvBtn.style.display = 'none';

  // 3. After the letter rises, transition to the greeting screen
  setTimeout(() => {
    showScreen('greetingScreen');
    // 4. Populate greeting once screen is visible
    setTimeout(populateGreeting, 600);
  }, 1400);
}

// Allow click on either the envelope or the button
envelope.addEventListener('click', openEnvelope);
openEnvBtn.addEventListener('click', openEnvelope);

/* ============================================================
   6. POPULATE GREETING — inject name, start typing, show photo
   ============================================================ */
function populateGreeting() {
  // 6a. Insert personalised name
  document.getElementById('recipientName').textContent = RECIPIENT;

  // 6b. Look up message (use lowercase for key lookup)
  const messageKey = RECIPIENT.toLowerCase();
  const message    = MESSAGES[messageKey] || DEFAULT_MESSAGE;

  // 6c. Start typing animation
  typeMessage(message, document.getElementById('typingMessage'), () => {
    // Callback: after typing finishes, show blessing button
    document.getElementById('cursor').style.animation = 'none';
    document.getElementById('cursor').style.opacity   = '0';
    const blessingBtn = document.getElementById('revealBlessingBtn');
    blessingBtn.style.display = 'inline-flex';
    blessingBtn.style.animation = 'fadeInUp 0.6s both';
  });

  // 6d. Show personalised photo if it exists in the map
  const photoSrc   = PHOTOS[messageKey];
  const photoFrame = document.getElementById('photoFrame');
  const photoEl    = document.getElementById('personalPhoto');

  if (photoSrc) {
    photoEl.onload = () => {
      photoFrame.style.display = 'block';
      photoFrame.style.animation = 'fadeInUp 0.8s 0.3s both';
    };
    photoEl.onerror = () => { photoFrame.style.display = 'none'; };
    photoEl.src = photoSrc;
  }

  // 6e. Try to show voice message player
  // The player appears only if audio/eid.mp3 exists and loads successfully
  initVoicePlayer();

  // 6f. Show guest book after a short delay (feels more natural)
  setTimeout(() => {
    const guestbook = document.getElementById('guestbook');
    guestbook.style.display = 'block';
    guestbook.style.animation = 'fadeInUp 0.8s both';
  }, 2000);
}

/* ============================================================
   7. TYPING ANIMATION — letter by letter
   ============================================================ */
function typeMessage(text, element, onComplete) {
  element.textContent = '';
  let index = 0;
  const speed = 38; // milliseconds per character

  function typeNext() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(typeNext, speed);
    } else if (typeof onComplete === 'function') {
      onComplete();
    }
  }

  // Small initial delay for a more theatrical feel
  setTimeout(typeNext, 300);
}

/* ============================================================
   8. REVEAL BLESSING + CONFETTI
   ============================================================ */
document.getElementById('revealBlessingBtn').addEventListener('click', () => {
  // Pick a random blessing
  const blessing = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];

  // Populate and show blessing box
  const blessingBox  = document.getElementById('blessingBox');
  const blessingText = document.getElementById('blessingText');
  blessingText.textContent = blessing;
  blessingBox.style.display = 'block';

  // Hide the button after first click (reveal is a one-time thing)
  document.getElementById('revealBlessingBtn').style.opacity = '0';
  document.getElementById('revealBlessingBtn').style.pointerEvents = 'none';

  // Fire confetti!
  launchConfetti();
});

/* ============================================================
   9. CONFETTI / FIREWORKS — drawn on <canvas id="confettiCanvas">
   ============================================================ */
(function setupConfetti() {
  const canvas  = document.getElementById('confettiCanvas');
  const ctx     = canvas.getContext('2d');
  let particles = [];
  let running   = false;
  let stopTimer = null;

  // Eid-inspired colour palette
  const COLORS = [
    '#c9a227', '#f5d78e', '#fffbe6',
    '#a8d8a8', '#ffd6a5', '#b5ead7',
    '#ff9f9f', '#9ec1cf', '#cce2cb',
  ];

  // Confetti particle shapes: rect, circle, crescent (arc)
  function createParticle(x, y) {
    return {
      x, y,
      vx      : (Math.random() - 0.5) * 8,
      vy      : -(Math.random() * 10 + 3),
      gravity : 0.25,
      alpha   : 1,
      color   : COLORS[Math.floor(Math.random() * COLORS.length)],
      size    : Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI * 2,
      spin    : (Math.random() - 0.5) * 0.2,
      shape   : ['rect', 'circle', 'star'][Math.floor(Math.random() * 3)],
    };
  }

  function drawStar(ctx, x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const xi = Math.cos(angle) * size;
      const yi = Math.sin(angle) * size;
      i === 0 ? ctx.moveTo(xi, yi) : ctx.lineTo(xi, yi);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    if (!running && particles.length === 0) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x        += p.vx;
      p.vy       += p.gravity;
      p.y        += p.vy;
      p.rotation += p.spin;
      p.alpha    -= 0.012;

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(ctx, p.x, p.y, p.size / 2, p.rotation);
      } else {
        // Rectangle (classic confetti)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
    });

    ctx.globalAlpha = 1;

    // Remove faded particles
    particles = particles.filter(p => p.alpha > 0);

    requestAnimationFrame(tick);
  }

  // Burst: fire multiple waves of particles from the center + edges
  function burst() {
    const cx = canvas.width  / 2;
    const cy = canvas.height / 3;

    // Central burst
    for (let i = 0; i < 80; i++) particles.push(createParticle(cx, cy));

    // Side bursts after short delay
    setTimeout(() => {
      for (let i = 0; i < 40; i++) particles.push(createParticle(cx * 0.3, cy));
      for (let i = 0; i < 40; i++) particles.push(createParticle(cx * 1.7, cy));
    }, 300);

    // Second wave
    setTimeout(() => {
      for (let i = 0; i < 60; i++) particles.push(createParticle(cx, cy * 0.8));
    }, 700);
  }

  // Public launch function called from blessing reveal
  window.launchConfetti = function () {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.classList.add('active');
    particles = [];
    running   = true;

    burst();

    // Stop spawning after 3s, but let existing particles fall
    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      running = false;
      canvas.classList.remove('active');
    }, 3200);

    requestAnimationFrame(tick);
  };
})();

/* ============================================================
   10. VOICE MESSAGE PLAYER
   Shows a custom audio player if audio/eid.mp3 is present.
   Gracefully hidden if the file is missing.
============================================================ */
function initVoicePlayer() {
  const audio     = document.getElementById('voiceMessage');
  const player    = document.getElementById('voicePlayer');
  const playBtn   = document.getElementById('voicePlayBtn');
  const playIcon  = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const fill      = document.getElementById('voiceProgressFill');
  const timeEl    = document.getElementById('voiceTime');
  const wave      = player.querySelector('.voice-wave');

  // Only show player if the audio file actually loads
  audio.addEventListener('canplaythrough', () => {
    player.style.display = 'block';
  }, { once: true });

  audio.addEventListener('error', () => {
    player.style.display = 'none'; // Silently hide if file missing
  });

  // Format seconds → m:ss
  function fmtTime(s) {
    const m   = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  // Play / pause toggle
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playIcon.style.display  = 'none';
      pauseIcon.style.display = 'block';
      wave.classList.remove('paused');
    } else {
      audio.pause();
      playIcon.style.display  = 'block';
      pauseIcon.style.display = 'none';
      wave.classList.add('paused');
    }
  });

  // Update progress bar and timestamp
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    fill.style.width   = pct + '%';
    timeEl.textContent = fmtTime(audio.currentTime);
  });

  // Reset when audio ends
  audio.addEventListener('ended', () => {
    playIcon.style.display  = 'block';
    pauseIcon.style.display = 'none';
    fill.style.width        = '0%';
    timeEl.textContent      = '0:00';
    wave.classList.add('paused');
  });
}

/* ============================================================
   11. GUEST BOOK — submit reply to Formspree
============================================================ */
const FORMSPREE_URL = 'https://formspree.io/f/myknnrpp';

document.getElementById('gbSubmitBtn').addEventListener('click', async () => {
  const nameVal    = document.getElementById('gbName').value.trim();
  const messageVal = document.getElementById('gbMessage').value.trim();

  // Simple shake feedback when fields are empty
  if (!nameVal || !messageVal) {
    const wrap = document.getElementById('guestbookFormWrap');
    wrap.style.animation = 'none';
    wrap.offsetHeight; // force reflow
    wrap.style.animation = 'shake 0.4s ease';
    return;
  }

  const btn = document.getElementById('gbSubmitBtn');
  btn.querySelector('.btn-text').textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch(FORMSPREE_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body   : JSON.stringify({
        name     : nameVal,
        message  : messageVal,
        recipient: RECIPIENT,          // who the greeting was sent to
        page     : window.location.href,
      }),
    });

    if (res.ok) {
      document.getElementById('guestbookFormWrap').style.display = 'none';
      document.getElementById('guestbookSuccess').style.display  = 'block';
    } else {
      throw new Error('Submit failed');
    }
  } catch {
    btn.querySelector('.btn-text').textContent = 'Send your wish 🌙';
    btn.disabled = false;
    alert('Something went wrong — please try again.');
  }
});

// Inject shake keyframe for empty-field validation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0);   }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px);  }
    60%     { transform: translateX(-5px); }
    80%     { transform: translateX(5px);  }
  }
`;
document.head.appendChild(shakeStyle);
