// =========================
// config
// =========================
const CONFIG = {
  sliderRange: 1,
  knobMin: -Math.PI,
  knobMax: Math.PI,
  secondMatrix: [
    [1.1, -0.35],
    [0.28, 0.95],
  ],
  temperature: 1.05,
};

// =========================
// data (sentences, candidate words, translations)
// =========================
const SENTENCES = [
  {
    frPrefix: "Ce matin, la classe de sciences a construit un",
    enPrefix: "This morning, the science class built a",
    blanks: [
      { fr: "volcan", en: "volcano", anchor: [1.2, 0.4] },
      { fr: "avec", en: "with", anchor: [0.2, 1.1] },
      { fr: "bicarbonate", en: "baking soda", anchor: [-0.8, 1.3] },
    ],
  },
  {
    frPrefix: "Pour le match, Mila a passé le",
    enPrefix: "For the match, Mila passed the",
    blanks: [
      { fr: "ballon", en: "ball", anchor: [1.25, -0.2] },
      { fr: "à", en: "to", anchor: [0.25, 1.0] },
      { fr: "Noah", en: "Noah", anchor: [-0.9, 0.9] },
    ],
  },
  {
    frPrefix: "Au musée, nous avons vu un robot qui",
    enPrefix: "At the museum, we saw a robot that",
    blanks: [
      { fr: "dessine", en: "draws", anchor: [1.15, 0.6] },
      { fr: "des", en: "some", anchor: [0.3, 1.15] },
      { fr: "étoiles", en: "stars", anchor: [-1.0, 1.2] },
    ],
  },
  {
    frPrefix: "Le soir, le chat de Lina aime",
    enPrefix: "In the evening, Lina's cat likes to",
    blanks: [
      { fr: "dormir", en: "sleep", anchor: [1.0, 0.2] },
      { fr: "sur", en: "on", anchor: [0.25, 1.0] },
      { fr: "le canapé", en: "the sofa", anchor: [-1.1, 1.0] },
    ],
  },
  {
    frPrefix: "Pour la fête, on a préparé un",
    enPrefix: "For the party, we prepared a",
    blanks: [
      { fr: "gâteau", en: "cake", anchor: [1.3, 0.25] },
      { fr: "au", en: "with", anchor: [0.35, 1.05] },
      { fr: "chocolat", en: "chocolate", anchor: [-1.0, 1.05] },
    ],
  },
];

const CANDIDATES = [
  { fr: "volcan", en: "volcano" }, { fr: "ballon", en: "ball" }, { fr: "dessine", en: "draws" },
  { fr: "dormir", en: "sleep" }, { fr: "gâteau", en: "cake" }, { fr: "avec", en: "with" },
  { fr: "à", en: "to" }, { fr: "des", en: "some" }, { fr: "sur", en: "on" },
  { fr: "au", en: "with" }, { fr: "bicarbonate", en: "baking soda" }, { fr: "Noah", en: "Noah" },
  { fr: "étoiles", en: "stars" }, { fr: "le canapé", en: "the sofa" }, { fr: "chocolat", en: "chocolate" },
  { fr: "banane", en: "banana" }, { fr: "pixel", en: "pixel" }, { fr: "chaton", en: "kitty" },
  { fr: "mème", en: "meme" }, { fr: "brocoli", en: "broccoli" },
];

const UI = {
  fr: {
    title: "Comprendre l'IA avec des vecteurs",
    subtitle: "Jeu interactif: tourne et étire la matrice pour trouver le mot suivant.",
    goal: "Objectif: l'IA est jugée aussi par ses erreurs. Trouve le bon mot avec le moins d'erreurs.",
    score: "Erreurs:", lower: "(Score plus bas = meilleur)",
    stitle: "Phrase à compléter", knob: "Rotation", slider: "Modulation verticale",
    enter: "Valider (Entrée)", reset: "Réinitialiser", instr: "Appuie sur Entrée pour choisir le mot le plus probable.",
    footer: "Astuce: les flèches rouges donnent une direction utile (gradient approximatif).",
    done: "Bravo ! Activité terminée.",
  },
  en: {
    title: "Understanding AI with vectors",
    subtitle: "Interactive game: rotate and stretch the matrix to find the next word.",
    goal: "Goal: AI is judged by errors too. Find the right word with as few mistakes as possible.",
    score: "Mistakes:", lower: "(Lower score = better)",
    stitle: "Sentence to complete", knob: "Rotation", slider: "Vertical modulation",
    enter: "Select (Enter)", reset: "Reset", instr: "Press Enter to pick the highest-probability word.",
    footer: "Hint: red arrows suggest a useful direction (approximate gradient).",
    done: "Great job! Activity finished.",
  },
};

// ========================= state
const state = { lang: "fr", sentenceIndex: 0, blankIndex: 0, mistakes: 0, theta: 0.2, stretch: 0.15, history: [] };

// ========================= vector and matrix math
const mulMatVec = (m, v) => [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
const matMul = (a, b) => [
  [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
  [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
];
const softmax = arr => {
  const m = Math.max(...arr); const ex = arr.map(x => Math.exp((x - m) / CONFIG.temperature));
  const s = ex.reduce((a, b) => a + b, 0); return ex.map(v => v / s);
};

function matrixFromControls(theta, stretch) {
  const c = Math.cos(theta), s = Math.sin(theta);
  const R = [[c, -s], [s, c]];
  const S = [[1 + stretch, 0], [0, 1 - stretch]];
  return matMul(R, S);
}

// ========================= probability model
function getContext() {
  return SENTENCES[state.sentenceIndex].blanks[state.blankIndex];
}
function getBaseVector() {
  return getContext().anchor;
}
function candidateVector(i) {
  const a = (i / CANDIDATES.length) * Math.PI * 2;
  return [Math.cos(a) * 1.2, Math.sin(a) * 1.2];
}
function getRanked() {
  const base = getBaseVector();
  const m1 = matrixFromControls(state.theta, state.stretch);
  const v1 = mulMatVec(m1, base);
  const v2 = mulMatVec(CONFIG.secondMatrix, v1);

  const correct = getContext();
  const logits = CANDIDATES.map((w, i) => {
    const cv = candidateVector(i);
    let logit = v2[0] * cv[0] + v2[1] * cv[1];
    if (w.fr === correct.fr) logit += 0.9;
    return logit;
  });
  const probs = softmax(logits);
  return CANDIDATES.map((w, i) => ({ ...w, p: probs[i], i })).sort((a, b) => b.p - a.p);
}

// ========================= gradient hint logic
function estimateGradient() {
  const eps = 0.05;
  const quality = () => getRanked().find(x => x.fr === getContext().fr).p;
  const q0 = quality();
  state.theta += eps; const qt = quality(); state.theta -= eps;
  state.stretch += eps; const qs = quality(); state.stretch -= eps;
  return { gTheta: (qt - q0) / eps, gStretch: (qs - q0) / eps };
}

// ========================= SVG rendering
const svg = document.getElementById("viz");
function line(x1, y1, x2, y2, color = "#95a5a6", w = 1, marker = "") {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "line");
  el.setAttribute("x1", x1); el.setAttribute("y1", y1); el.setAttribute("x2", x2); el.setAttribute("y2", y2);
  el.setAttribute("stroke", color); el.setAttribute("stroke-width", w);
  if (marker) el.setAttribute("marker-end", marker);
  svg.appendChild(el);
}
function text(x, y, t, size = 14, color = "#2c3e50", weight = "400") {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
  el.setAttribute("x", x); el.setAttribute("y", y); el.setAttribute("fill", color); el.setAttribute("font-size", size); el.setAttribute("font-weight", weight);
  el.textContent = t; svg.appendChild(el);
}
function draw() {
  svg.innerHTML = svg.innerHTML.split("</defs>")[0] + "</defs>";
  const base = getBaseVector(); const m1 = matrixFromControls(state.theta, state.stretch);
  const v1 = mulMatVec(m1, base); const v2 = mulMatVec(CONFIG.secondMatrix, v1); const ranked = getRanked();

  // vector plane
  const ox = 170, oy = 260, scale = 70;
  for (let i = -2; i <= 2; i++) { line(ox - 140, oy + i * scale, ox + 140, oy + i * scale, "#ecf0f1"); line(ox + i * scale, oy - 140, ox + i * scale, oy + 140, "#ecf0f1"); }
  line(ox - 140, oy, ox + 140, oy, "#bdc3c7", 1.5); line(ox, oy - 140, ox, oy + 140, "#bdc3c7", 1.5);
  const p0 = [ox, oy], p1 = [ox + base[0] * scale, oy - base[1] * scale], p2 = [ox + v1[0] * scale, oy - v1[1] * scale], p3 = [ox + v2[0] * scale, oy - v2[1] * scale];
  line(...p0, ...p1, "#54a0ff", 4, "url(#arrowBlue)"); text(p1[0] + 5, p1[1], "base");
  line(...p0, ...p2, "#1dd1a1", 4, "url(#arrowBlue)"); text(p2[0] + 5, p2[1], "M1(base)");
  line(...p0, ...p3, "#ff9f43", 4, "url(#arrowBlue)"); text(p3[0] + 5, p3[1], "M2(M1(base))");

  text(310, 80, "M1", 16, "#34495e", "700");
  text(310, 105, `[${m1[0][0].toFixed(2)}  ${m1[0][1].toFixed(2)}]`);
  text(310, 128, `[${m1[1][0].toFixed(2)}  ${m1[1][1].toFixed(2)}]`);
  text(430, 80, "M2", 16, "#34495e", "700");
  text(430, 105, `[${CONFIG.secondMatrix[0][0].toFixed(2)}  ${CONFIG.secondMatrix[0][1].toFixed(2)}]`);
  text(430, 128, `[${CONFIG.secondMatrix[1][0].toFixed(2)}  ${CONFIG.secondMatrix[1][1].toFixed(2)}]`);

  text(560, 70, "Top probabilités / probabilities", 16, "#2d3436", "700");
  ranked.slice(0, 12).forEach((r, idx) => {
    const y = 100 + idx * 30;
    const label = state.lang === "fr" ? r.fr : r.en;
    const isTop = idx === 0;
    text(560, y, `${idx + 1}. ${label}`, 13, isTop ? "#d35400" : "#2d3436", isTop ? "700" : "400");
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", 740); bar.setAttribute("y", y - 12); bar.setAttribute("width", 220 * r.p); bar.setAttribute("height", 12);
    bar.setAttribute("fill", isTop ? "#ff9f43" : "#74b9ff"); svg.appendChild(bar);
  });
}

// ========================= controls
const knob = document.getElementById("knob");
const sliderTrack = document.getElementById("slider-track");
const sliderThumb = document.getElementById("slider-thumb");
let dragKnob = false, dragSlider = false;

knob.addEventListener("pointerdown", () => (dragKnob = true));
sliderThumb.addEventListener("pointerdown", () => (dragSlider = true));
window.addEventListener("pointerup", () => { dragKnob = false; dragSlider = false; });
window.addEventListener("pointermove", e => {
  if (dragKnob) {
    const r = knob.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    state.theta = Math.atan2(e.clientY - cy, e.clientX - cx);
  }
  if (dragSlider) {
    const r = sliderTrack.getBoundingClientRect();
    let y = Math.max(0, Math.min(r.height, e.clientY - r.top));
    state.stretch = 1 - (y / r.height) * 2;
    state.stretch *= 0.8;
  }
  renderAll();
});

function syncControls() {
  knob.style.transform = `rotate(${state.theta}rad)`;
  const y = ((1 - state.stretch / 0.8) / 2) * 220 - 13;
  sliderThumb.style.top = `${Math.max(0, Math.min(194, y))}px`;
}

// ========================= scoring
function submitTopWord() {
  if (state.sentenceIndex >= SENTENCES.length) return;
  const top = getRanked()[0];
  const target = getContext();
  const topWord = state.lang === "fr" ? top.fr : top.en;
  state.history.push(topWord);
  if (top.fr !== target.fr) state.mistakes += 1;
  else {
    state.blankIndex += 1;
    if (state.blankIndex >= SENTENCES[state.sentenceIndex].blanks.length) {
      state.sentenceIndex += 1; state.blankIndex = 0; state.history = [];
    }
  }
  renderAll();
}

// ========================= language switching
function applyLanguage() {
  const t = UI[state.lang];
  document.documentElement.lang = state.lang === "fr" ? "fr" : "en";
  ["title", "subtitle", "goal", "sentence-title", "knob-title", "slider-title", "enter-btn", "reset-btn", "instruction", "footer-note"].forEach(id => {
    const map = { title: t.title, subtitle: t.subtitle, goal: t.goal, "sentence-title": t.stitle, "knob-title": t.knob, "slider-title": t.slider, "enter-btn": t.enter, "reset-btn": t.reset, instruction: t.instr, "footer-note": t.footer };
    document.getElementById(id).textContent = map[id];
  });
  document.getElementById("score-label").textContent = t.score;
  document.getElementById("lower-better").textContent = t.lower;
  document.getElementById("lang-fr").classList.toggle("active", state.lang === "fr");
  document.getElementById("lang-en").classList.toggle("active", state.lang === "en");
}

// ========================= reset
function resetGame() {
  const p = prompt("Password:");
  if (p !== "Admin0000") return;
  Object.assign(state, { sentenceIndex: 0, blankIndex: 0, mistakes: 0, theta: 0.2, stretch: 0.15, history: [] });
  renderAll();
}

// ========================= initialization
function renderAll() {
  applyLanguage();
  document.getElementById("score-value").textContent = state.mistakes;

  if (state.sentenceIndex >= SENTENCES.length) {
    document.getElementById("sentence-prefix").textContent = UI[state.lang].done;
    document.getElementById("sentence-progress").textContent = "";
  } else {
    const s = SENTENCES[state.sentenceIndex];
    document.getElementById("sentence-prefix").textContent = state.lang === "fr" ? s.frPrefix : s.enPrefix;
    document.getElementById("sentence-progress").textContent = state.history.join(" ");
  }

  const g = estimateGradient();
  const dirK = g.gTheta >= 0 ? "+" : "-";
  const dirS = g.gStretch >= 0 ? "↑" : "↓";
  document.getElementById("knob-value").textContent = `${(state.theta * 180 / Math.PI).toFixed(0)}°`;
  document.getElementById("slider-value").textContent = `${state.stretch.toFixed(2)}`;
  document.getElementById("knob-hint").textContent = `↻ ${dirK} grad≈${g.gTheta.toFixed(2)}`;
  document.getElementById("slider-hint").textContent = `${dirS} grad≈${g.gStretch.toFixed(2)}`;

  syncControls();
  draw();
}

document.getElementById("enter-btn").addEventListener("click", submitTopWord);
document.addEventListener("keydown", e => { if (e.key === "Enter") submitTopWord(); });
document.getElementById("reset-btn").addEventListener("click", resetGame);
document.getElementById("lang-fr").addEventListener("click", () => { state.lang = "fr"; renderAll(); });
document.getElementById("lang-en").addEventListener("click", () => { state.lang = "en"; renderAll(); });

renderAll();
