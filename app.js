// Where the download buttons go. When Numina is live, set appStore to its
// App Store URL: every button and the note under the last one update together.
const LINKS = {
  appStore: null,
  beta: "https://testflight.apple.com/join/gk9ESn7c",
};

function applyLinks() {
  const live = Boolean(LINKS.appStore);
  document.querySelectorAll("[data-get]").forEach((a) => {
    a.href = live ? LINKS.appStore : LINKS.beta;
  });
  const note = document.querySelector("[data-get-note]");
  if (live && note) note.textContent = "Free on the App Store. Needs iOS 18 or later.";
}

// The same day number the app uses: day 1 is 1 January 2026 in the player's
// own time zone, so a day here is the same day as in Numina.
function dayNumber(now = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - Date.UTC(2026, 0, 1)) / 86400000) + 1;
}

function untilMidnight(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const minutes = Math.max(1, Math.ceil((next - now) / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function startCountdown() {
  const el = document.getElementById("countdown");
  if (!el) return;
  const tick = () => { el.textContent = untilMidnight(); };
  tick();
  setInterval(tick, 30000);
}

function remember(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch { return null; }
  return null;
}

async function startPuzzle() {
  const form = document.getElementById("puzzle");
  if (!form) return;
  const meta = document.getElementById("puzzle-meta");
  const problem = document.getElementById("problem");
  const row = document.getElementById("answer-row");
  const input = document.getElementById("answer");
  const choices = document.getElementById("choices");
  const feedback = document.getElementById("feedback");
  const after = document.getElementById("after");
  const firstDot = document.querySelector("#dots i");

  let today;
  const day = dayNumber();
  try {
    const res = await fetch("/daily.json");
    const data = await res.json();
    today = data.days[day - data.firstDay];
  } catch { today = null; }

  if (!today) {
    // Past the exported days, or offline: a sample, labelled as one.
    meta.textContent = "A sample problem";
    document.querySelector(".hero h1").textContent = "Five problems a day. Everyone gets the same five.";
    today = ["5, 16, 12, 23, ?", "19", "Patterns"];
  } else {
    meta.textContent = `Day ${day} · ${today[2]} · Problem 1 of 5`;
  }

  const [prompt, answer, , options] = today;
  problem.textContent = prompt.replace(/\s+/g, " ");
  problem.classList.toggle("long", prompt.length > 14);

  let misses = 0;
  const solved = () => {
    firstDot.classList.add("lit");
    row.hidden = true;
    choices.hidden = true;
    feedback.textContent = "That's it. One star lit. The other four are in the app.";
    after.hidden = false;
    remember("numina.solved", String(day));
  };
  const check = (value) => {
    if (value.trim() === answer) { solved(); return; }
    misses += 1;
    feedback.textContent = misses < 3
      ? "Not that one. Try again."
      : "This one's a stretch. The app has a hint for it.";
    if (misses >= 3) after.hidden = false;
    form.classList.remove("miss");
    void form.offsetWidth;
    form.classList.add("miss");
  };

  if (options) {
    row.hidden = true;
    choices.hidden = false;
    options.forEach((text) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      b.addEventListener("click", () => check(text));
      choices.append(b);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim()) check(input.value);
    input.select();
  });

  if (remember("numina.solved") === String(day)) {
    solved();
    feedback.textContent = "You solved today's first. The other four are in the app.";
    // A sequence ends in "?", so show it finished. Other forms stay as asked.
    problem.textContent = problem.textContent.replace(/,\s*\?$/, `, ${answer}`);
  }
}

// Drawn once, not animated: a still sky costs nothing to keep on screen.
function drawStars() {
  const canvas = document.getElementById("stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const paint = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = Math.min(window.innerHeight * 1.1, 1000);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
    let seed = 309;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.fillStyle = ink;
    for (let i = 0; i < w / 7; i += 1) {
      ctx.globalAlpha = 0.12 + rand() * 0.5;
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 0.35 + rand() * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  paint();
  let wait;
  window.addEventListener("resize", () => { clearTimeout(wait); wait = setTimeout(paint, 200); });
  document.addEventListener("skychange", paint);
}

function startSkies() {
  const shot = document.getElementById("sky-shot");
  if (!shot) return;
  const buttons = document.querySelectorAll("[data-sky]");
  const names = { aurora: "Aurora", emberDusk: "Ember Dusk", deepViolet: "Deep Violet", starlightMono: "Starlight", daylight: "Daylight" };
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const sky = button.dataset.sky;
      document.documentElement.dataset.sky = sky;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      shot.src = sky === "aurora" ? "/img/app/home-played.webp" : `/img/app/sky-${sky}.webp`;
      shot.alt = `Numina's Home screen in the ${names[sky]} sky.`;
      document.dispatchEvent(new Event("skychange"));
    });
  });
}

applyLinks();
startCountdown();
startPuzzle();
drawStars();
startSkies();
