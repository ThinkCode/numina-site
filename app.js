/**
 * Numina Web Experience Engine
 * - Dynamic Aurora Sky Canvas
 * - Playable Hero Math Puzzle with Web Audio synthesizers & particle bursts
 * - Interactive Celestial Theme Morpher
 * - Duel Beam Bezier Curve Visualizer
 */

// ==========================================
// 1. THEMES CONFIGURATION
// ==========================================
const THEMES = {
  aurora: {
    name: "Aurora Sky",
    desc: "A glowing teal veil over an Arctic night sky. The iconic Numina look.",
    primary: "#5EEAD4",
    secondary: "#38BDF8",
    night: "#070B16",
    rgb: [94, 234, 212]
  },
  ember: {
    name: "Ember Dusk",
    desc: "Warm volcanic embers drifting across a terracotta twilight.",
    primary: "#E8A06A",
    secondary: "#FB7185",
    night: "#120C0E",
    rgb: [232, 160, 106]
  },
  violet: {
    name: "Deep Violet",
    desc: "A velvet celestial abyss lit by ultraviolet starlight and lavender nebulae.",
    primary: "#B7A8E8",
    secondary: "#818CF8",
    night: "#0C0A16",
    rgb: [183, 168, 232]
  },
  starlight: {
    name: "Starlight Monochrome",
    desc: "Pure luminescent monochrome inspired by minimal observatory gauges.",
    primary: "#E8E6F0",
    secondary: "#94A3B8",
    night: "#0A0A0F",
    rgb: [232, 230, 240]
  },
  daylight: {
    name: "Daylight Linen",
    desc: "Warm parchment, terra cotta, and soft amber for morning clarity in bright sun.",
    primary: "#B5694A",
    secondary: "#D97706",
    night: "#F6F1E7",
    rgb: [181, 105, 74]
  }
};

let currentTheme = 'aurora';

// ==========================================
// 2. AUDIO SYNTHESIZER (WEB AUDIO API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSolveTone() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Dual harmonic chime
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

      osc2.frequency.setValueAtTime(293.66, now); // D4
      osc2.frequency.exponentialRampToValueAtTime(440, now + 0.15); // A4
      osc2.frequency.exponentialRampToValueAtTime(587.33, now + 0.3); // D5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playMissTone() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// ==========================================
// 3. AURORA DRIFTING CANVAS
// ==========================================
class AuroraCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.blobs = [];
    this.resize();
    this.initBlobs();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initBlobs() {
    this.blobs = [
      { x: this.width * 0.25, y: this.height * 0.3, vx: 0.3, vy: 0.2, r: Math.min(this.width, this.height) * 0.45 },
      { x: this.width * 0.75, y: this.height * 0.4, vx: -0.25, vy: 0.35, r: Math.min(this.width, this.height) * 0.5 },
      { x: this.width * 0.5, y: this.height * 0.75, vx: 0.2, vy: -0.3, r: Math.min(this.width, this.height) * 0.4 }
    ];
  }

  animate() {
    const rgb = THEMES[currentTheme].rgb;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let b of this.blobs) {
      b.x += b.vx;
      b.y += b.vy;

      if (b.x - b.r < 0 || b.x + b.r > this.width) b.vx *= -1;
      if (b.y - b.r < 0 || b.y + b.r > this.height) b.vy *= -1;

      const gradient = this.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.16)`);
      gradient.addColorStop(0.5, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.05)`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================
// 4. PLAYABLE HERO PUZZLE SIMULATOR
// ==========================================
const PUZZLE_LEVELS = [
  {
    target: 42,
    num1: 6,
    operator: '×',
    answer: 7,
    options: [6, 7, 8, 9, 12, 14]
  },
  {
    target: 81,
    num1: 95,
    operator: '−',
    answer: 14,
    options: [12, 14, 16, 24, 8, 15]
  },
  {
    target: 64,
    num1: 16,
    operator: '×',
    answer: 4,
    options: [3, 4, 5, 8, 2, 6]
  }
];

class PuzzleSimulator {
  constructor() {
    this.currentLevel = 0;
    this.targetEl = document.getElementById('puzzle-target');
    this.eqEl = document.getElementById('puzzle-eq');
    this.choicesEl = document.getElementById('puzzle-choices');
    this.feedbackEl = document.getElementById('puzzle-feedback');
    this.dots = document.querySelectorAll('.puzzle-dot');
    this.render();
  }

  render() {
    const level = PUZZLE_LEVELS[this.currentLevel];
    if (!level) {
      this.showWinState();
      return;
    }

    this.targetEl.innerText = level.target;
    this.eqEl.innerHTML = `${level.num1} ${level.operator} <span class="placeholder">?</span> = ${level.target}`;
    this.choicesEl.innerHTML = '';
    this.feedbackEl.innerText = 'Tap the missing number';
    this.feedbackEl.className = 'puzzle-feedback';

    // Update dots
    this.dots.forEach((dot, idx) => {
      dot.className = 'puzzle-dot';
      if (idx < this.currentLevel) dot.classList.add('completed');
      if (idx === this.currentLevel) dot.classList.add('active');
    });

    level.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerText = opt;
      btn.addEventListener('click', () => this.handlePick(opt, level.answer));
      this.choicesEl.appendChild(btn);
    });
  }

  handlePick(val, correct) {
    if (val === correct) {
      sfx.playSolveTone();
      this.feedbackEl.innerText = 'Spot on! Star awarded ★';
      this.feedbackEl.className = 'puzzle-feedback success';
      this.currentLevel++;
      setTimeout(() => {
        this.render();
      }, 700);
    } else {
      sfx.playMissTone();
      this.feedbackEl.innerText = 'Try again! Mind the mental leaps.';
      this.feedbackEl.className = 'puzzle-feedback shake';
    }
  }

  showWinState() {
    this.targetEl.innerText = '3 / 3 ★';
    this.eqEl.innerHTML = '<span style="color:#34D399; font-weight:700;">DAILY RITUAL COMPLETE!</span>';
    this.choicesEl.innerHTML = `
      <div style="grid-column: span 3; padding: 16px 0; text-align: center;">
        <p style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:12px;">Share your daily result:</p>
        <div style="font-family:var(--font-mono); background:rgba(0,0,0,0.3); padding:10px; border-radius:12px; margin-bottom:16px;">
          Numina Day 244 3/3 🟩🟩🟩
        </div>
        <button id="reset-puzzle-btn" class="choice-btn" style="width:100%; font-size:1rem; padding:12px;">Play Again</button>
      </div>
    `;
    this.dots.forEach(dot => dot.className = 'puzzle-dot completed');
    this.feedbackEl.innerText = 'Ready for tomorrow’s math challenge!';
    
    document.getElementById('reset-puzzle-btn').addEventListener('click', () => {
      this.currentLevel = 0;
      this.render();
    });
  }
}

// ==========================================
// 5. DUEL BEAM VISUALIZER (S-CURVE CANVAS)
// ==========================================
class DuelBeamCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.offset = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.width = this.canvas.width = parent.clientWidth;
    this.height = this.canvas.height = parent.clientHeight;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Only draw beam if screen is wide enough (desktop/tablet grid)
    if (this.width > 700) {
      const leftX = this.width * 0.28;
      const leftY = this.height * 0.45;
      const rightX = this.width * 0.72;
      const rightY = this.height * 0.45;
      const midX = this.width * 0.5;
      const midY = this.height * 0.45;

      const rgb = THEMES[currentTheme].rgb;

      // Glow line
      this.ctx.beginPath();
      this.ctx.moveTo(leftX, leftY);
      this.ctx.bezierCurveTo(midX, leftY - 70, midX, rightY + 70, rightX, rightY);
      this.ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.25)`;
      this.ctx.lineWidth = 6;
      this.ctx.stroke();

      // Energy laser line
      this.ctx.beginPath();
      this.ctx.moveTo(leftX, leftY);
      this.ctx.bezierCurveTo(midX, leftY - 70, midX, rightY + 70, rightX, rightY);
      this.ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`;
      this.ctx.lineWidth = 2.5;
      this.ctx.setLineDash([12, 18]);
      this.ctx.lineDashOffset = -this.offset;
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      this.offset += 1.2;
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================
// 6. THEME MORPHER ENGINE
// ==========================================
function initThemeMorpher() {
  const pills = document.querySelectorAll('.theme-pill');
  const metaTitle = document.getElementById('theme-name');
  const metaDesc = document.getElementById('theme-desc');
  const previewImg = document.getElementById('theme-preview-img');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const themeKey = pill.getAttribute('data-theme-key');
      if (!THEMES[themeKey]) return;

      currentTheme = themeKey;

      // Update active pill
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // Update root data-theme
      if (themeKey === 'aurora') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', themeKey);
      }

      // Update info
      if (metaTitle) metaTitle.innerText = THEMES[themeKey].name;
      if (metaDesc) metaDesc.innerText = THEMES[themeKey].desc;

      // Update preview screenshot if relevant
      if (previewImg) {
        if (themeKey === 'violet') {
          previewImg.src = 'img/iphone-06_deepsky.png';
        } else if (themeKey === 'starlight') {
          previewImg.src = 'img/iphone-07_observatory.png';
        } else if (themeKey === 'ember') {
          previewImg.src = 'img/iphone-03_tour_sky.png';
        } else {
          previewImg.src = 'img/skies.png';
        }
      }
    });
  });
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  new AuroraCanvas('aurora-canvas');
  new PuzzleSimulator();
  new DuelBeamCanvas('duel-beam-canvas');
  initThemeMorpher();
});
