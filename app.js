/* =====================================================================
   app.js — AI Educational Game
   Understand AI Simply
   ===================================================================== */

"use strict";

/* =====================================================================
   CONFIG
   ===================================================================== */
const CFG = {
  // NOTE: Password is intentionally stored client-side.
  // This app is a static GitHub Pages site with no server.
  // The reset feature is a lightweight teaching-aid lock, not a security boundary.
  RESET_PASSWORD: "Admin0000",
  SOFTMAX_TEMP: 1.0,   // temperature for softmax
  SVG_SCALE: 80,       // world-units to SVG px
  GRID_STEPS: 5,       // grid lines each side
  CORRECT_REGION: 0.9, // dot-product threshold where correct word dominates
};

/* =====================================================================
   TRANSLATIONS
   ===================================================================== */
const T = {
  fr: {
    appTitle:         "Comprendre l'IA",
    panelSentence:    "Phrase en cours",
    panelModel:       "Le modèle",
    panelCandidates:  "Mots candidats",
    ctrlRotation:     "Rotation",
    ctrlStretch:      "Étirement",
    labelOriginal:    "Espace d'entrée",
    labelMatrix:      "Matrice M",
    labelTransformed: "Espace transformé",
    progressLabel:    (s, sn, w, wn) => `Phrase ${s}/${sn} · Mot ${w}/${wn}`,
    stepLabel:        (w, wn) => `Étape ${w} sur ${wn}`,
    instruction:      "Ajuste la matrice pour classer le bon mot en premier, puis appuie sur Entrée.",
    enterHint:        "↵ Entrée pour valider le mot en tête",
    bottomHint:       "Tourne et étire la matrice pour changer les probabilités · Entrée pour valider",
    hintRotate:       (v) => `Rotation : ${v}`,
    hintStretch:      (v) => `Étirement : ${v}`,
    scoreLabel:       "Erreurs",
    resetBtn:         "↺ Recommencer",
    langBtn:          "🇬🇧 EN",
    modalResetTitle:  "Réinitialiser",
    modalResetBody:   "Entrez le mot de passe administrateur :",
    modalCancel:      "Annuler",
    modalConfirm:     "Confirmer",
    endTitle:         "Partie terminée !",
    endBody:          (e) => e === 0
      ? `Bravo ! Score parfait : 0 erreur 🎉`
      : `Terminé avec ${e} erreur${e > 1 ? "s" : ""}. Moins tu as d'erreurs, mieux c'est !`,
    endClose:         "Fermer",
  },
  en: {
    appTitle:         "Understand AI",
    panelSentence:    "Current Sentence",
    panelModel:       "The Model",
    panelCandidates:  "Candidate Words",
    ctrlRotation:     "Rotation",
    ctrlStretch:      "Stretch",
    labelOriginal:    "Input Space",
    labelMatrix:      "Matrix M",
    labelTransformed: "Transformed Space",
    progressLabel:    (s, sn, w, wn) => `Sentence ${s}/${sn} · Word ${w}/${wn}`,
    stepLabel:        (w, wn) => `Step ${w} of ${wn}`,
    instruction:      "Adjust the matrix to rank the correct word first, then press Enter.",
    enterHint:        "↵ Enter to confirm the top word",
    bottomHint:       "Rotate and stretch the matrix to change probabilities · Enter to confirm",
    hintRotate:       (v) => `Rotate: ${v}`,
    hintStretch:      (v) => `Stretch: ${v}`,
    scoreLabel:       "Mistakes",
    resetBtn:         "↺ Reset",
    langBtn:          "🇫🇷 FR",
    modalResetTitle:  "Reset Game",
    modalResetBody:   "Enter the administrator password:",
    modalCancel:      "Cancel",
    modalConfirm:     "Confirm",
    endTitle:         "Game Over!",
    endBody:          (e) => e === 0
      ? `Perfect score: 0 mistakes 🎉`
      : `Finished with ${e} mistake${e > 1 ? "s" : ""}. Lower score is better!`,
    endClose:         "Close",
  },
};

/* =====================================================================
   CONTENT DATA
   Five sentences, each with blanks.
   Each blank has exactly 20 candidate words; exactly one is correct.

   To keep the model coherent each candidate is assigned a 2D word-vector
   and bias in WORD_PARAMS. Input vectors for each step are in STEP_VECS.
   The "correct" word's vector is aligned with the region the student must
   find with rotation + stretch.
   ===================================================================== */

// Candidate pools: 20 words per step, one correct
// Format: [candidates_fr, candidates_en, correct_idx]
// We define 12 unique steps across 5 sentences.

const SENTENCES = {
  fr: [
    {
      template: ["Le", "chat", "mange", "___", "souris", "."],   // blank index 3 → word "une"
      blanks: [3],
    },
    {
      template: ["Le", "soleil", "brille", "dans", "le", "___", "."],  // blank index 5 → "ciel"
      blanks: [5],
    },
    {
      template: ["Elle", "lit", "un", "___", "intéressant", "."],  // blank index 3 → "livre"
      blanks: [3],
    },
    {
      template: ["Les", "enfants", "jouent", "dans", "le", "___", "."], // → "jardin"
      blanks: [5],
    },
    {
      template: ["Il", "fait", "très", "___", "aujourd'hui", "."],  // → "chaud"
      blanks: [3],
    },
  ],
  en: [
    {
      template: ["The", "cat", "eats", "___", "mouse", "."],
      blanks: [3],
    },
    {
      template: ["The", "sun", "shines", "in", "the", "___", "."],
      blanks: [5],
    },
    {
      template: ["She", "reads", "an", "___", "book", "."],
      blanks: [3],
    },
    {
      template: ["The", "children", "play", "in", "the", "___", "."],
      blanks: [5],
    },
    {
      template: ["It", "is", "very", "___", "today", "."],
      blanks: [3],
    },
  ],
};

// Candidate words for each step (5 steps, one per sentence)
// Each entry: { fr: [...20 words], en: [...20 words], correctIdx: number }
const STEPS = [
  // Step 0 — "une" / "a"
  {
    fr: ["une","deux","trois","cette","ma","sa","leur","notre","votre","chaque",
         "la","un","mon","ton","son","notre","vos","les","des","mes"],
    en: ["a","two","three","this","my","his","her","our","your","each",
         "the","an","my","your","its","our","your","the","some","those"],
    correctIdx: 0,
  },
  // Step 1 — "ciel" / "sky"
  {
    fr: ["ciel","mur","sol","toit","nuage","soleil","vent","pluie","brouillard","tonnerre",
         "mer","lac","fleuve","forêt","désert","champ","jardin","ville","rue","pays"],
    en: ["sky","wall","ground","roof","cloud","sun","wind","rain","fog","thunder",
         "sea","lake","river","forest","desert","field","garden","city","street","country"],
    correctIdx: 0,
  },
  // Step 2 — "livre" / "interesting"  (correct is "livre"/"interesting")
  {
    fr: ["livre","stylo","cahier","tableau","crayon","règle","gomme","sac","cartable","trousse",
         "dictionnaire","atlas","roman","poème","journal","magazine","bande","dessin","carte","lettre"],
    en: ["interesting","boring","long","short","great","funny","scary","sad","happy","strange",
         "wonderful","difficult","easy","thick","thin","colorful","ancient","modern","popular","rare"],
    correctIdx: 0,
  },
  // Step 3 — "jardin" / "garden"
  {
    fr: ["jardin","salon","grenier","garage","couloir","cuisine","chambre","salle","cave","terrasse",
         "balcon","cour","portail","allée","escalier","toit","mur","fenêtre","porte","plafond"],
    en: ["garden","living","attic","garage","hallway","kitchen","bedroom","bathroom","cellar","terrace",
         "balcony","yard","gate","path","stairs","roof","wall","window","door","ceiling"],
    correctIdx: 0,
  },
  // Step 4 — "chaud" / "hot"
  {
    fr: ["chaud","froid","humide","sec","venteux","nuageux","pluvieux","ensoleillé","orageux","brumeux",
         "doux","frais","lourd","léger","agréable","horrible","parfait","bizarre","tranquille","calme"],
    en: ["hot","cold","humid","dry","windy","cloudy","rainy","sunny","stormy","foggy",
         "mild","cool","heavy","light","pleasant","horrible","perfect","strange","quiet","calm"],
    correctIdx: 0,
  },
];

/* =====================================================================
   WORD PARAMETERS (2D vectors + biases for the probability model)
   We generate these deterministically so behaviour is consistent.
   The correct word for each step gets a special vector that is easy
   to find with the right rotation + stretch.
   ===================================================================== */

// Returns a seeded pseudo-random float in [-1,1]
// Uses the classic "sin hash" trick: the large constant 43758.5453123
// spreads the fractional parts of sin() into a uniform-ish distribution.
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return (x - Math.floor(x)) * 2 - 1;
}

// Build word vectors and biases for every step
// Correct word vector is set to a specific direction; others are spread around
function buildWordParams(stepIdx, correctIdx, numWords) {
  const vecs = [];
  const biases = [];

  // The "target" direction for correct word: angle based on step
  const targetAngle = (stepIdx * 1.1 + 0.5); // in radians, varies by step
  const correctVec = [Math.cos(targetAngle), Math.sin(targetAngle)];

  for (let i = 0; i < numWords; i++) {
    if (i === correctIdx) {
      vecs.push(correctVec.slice());
      biases.push(0.5); // slight positive bias for correct word
    } else {
      // Spread other words uniformly around the circle with small perturbation
      const angle = (i / (numWords - 1)) * 2 * Math.PI
                    + seededRand(stepIdx * 100 + i) * 0.4;
      const r = 0.6 + seededRand(stepIdx * 200 + i) * 0.2;
      vecs.push([r * Math.cos(angle), r * Math.sin(angle)]);
      biases.push(seededRand(stepIdx * 300 + i) * 0.2);
    }
  }
  return { vecs, biases };
}

// Pre-build for all steps
const WORD_PARAMS = STEPS.map((step, si) =>
  buildWordParams(si, step.correctIdx, 20)
);

// Input vector for each step (the "sentence context" vector)
// We choose a fixed vector per step, perpendicular-ish to the correct word
// direction so the student needs to rotate to align.
const STEP_INPUT_VECS = STEPS.map((_, si) => {
  const base = (si * 1.1 + 0.5); // same as target angle
  // Input vector is rotated 45-90 degrees away from target
  const inputAngle = base - Math.PI / 3;
  return [Math.cos(inputAngle), Math.sin(inputAngle)];
});

/* =====================================================================
   STATE
   ===================================================================== */
const STATE = {
  lang: "fr",
  sentenceIdx: 0,
  stepIdx: 0,          // global step index 0-4
  localStepIdx: 0,     // step within current sentence (always 0 here since 1 blank per sentence)
  mistakes: 0,
  filledWords: [],     // [{word, isCorrect}] per step done
  rotation: 0,         // degrees
  stretch: 1.0,
  currentRanking: [],  // [{word, prob, rank}] sorted by prob desc
  gameOver: false,
};

/* =====================================================================
   MATH UTILITIES
   ===================================================================== */

function degToRad(d) { return d * Math.PI / 180; }

// Build 2x2 transformation matrix from rotation (deg) and stretch (scalar)
// M = R(θ) · S(s)  where S stretches x-axis
function buildMatrix(rotDeg, stretch) {
  const r = degToRad(rotDeg);
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  // Rotation: [[cos,-sin],[sin,cos]]
  // Stretch on first axis: [[s,0],[0,1]]
  // Combined: R * S = [[s*cos, -sin],[s*sin, cos]]
  return [
    [stretch * cos, -sin],
    [stretch * sin,  cos],
  ];
}

// Multiply 2x2 matrix by 2D vector
function matVec(M, v) {
  return [
    M[0][0] * v[0] + M[0][1] * v[1],
    M[1][0] * v[0] + M[1][1] * v[1],
  ];
}

// Dot product of two 2D vectors
function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

// Softmax over array of logits
function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map(x => Math.exp((x - max) / CFG.SOFTMAX_TEMP));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
}

/* =====================================================================
   PROBABILITY MODEL
   ===================================================================== */

function computeRanking(rotDeg, stretch) {
  const si = STATE.stepIdx;
  const M = buildMatrix(rotDeg, stretch);
  const inputVec = STEP_INPUT_VECS[si];
  const transformed = matVec(M, inputVec);

  const { vecs, biases } = WORD_PARAMS[si];
  const step = STEPS[si];
  const words = step[STATE.lang];

  // logits = dot(transformed, word_vec) + bias
  const logits = vecs.map((wv, i) => dot(transformed, wv) + biases[i]);
  const probs = softmax(logits);

  // Build ranked list
  const ranked = words.map((w, i) => ({
    word: w,
    prob: probs[i],
    origIdx: i,
  }));
  ranked.sort((a, b) => b.prob - a.prob);

  return { ranked, transformed, inputVec, M };
}

/* =====================================================================
   HINT LOGIC
   ===================================================================== */

function computeHints(rotDeg, stretch) {
  const si = STATE.stepIdx;
  const targetAngle = si * 1.1 + 0.5; // radians (same as buildWordParams)
  const inputAngle  = targetAngle - Math.PI / 3;

  // After applying M = R(rotDeg) * S(stretch), transformed = M * input
  // We want transformed ∥ correctWordVec = [cos(targetAngle), sin(targetAngle)]
  // The current transformed angle:
  const M = buildMatrix(rotDeg, stretch);
  const iv = STEP_INPUT_VECS[si];
  const tv = matVec(M, iv);
  const currentAngle = Math.atan2(tv[1], tv[0]);
  const deltaRad = targetAngle - currentAngle;

  // Normalize delta to [-π, π]
  let delta = ((deltaRad + Math.PI) % (2 * Math.PI)) - Math.PI;
  const deltaDeg = delta * 180 / Math.PI;

  // Stretch hint: ideal stretch is 1 (the word vector has magnitude ~1)
  const mag = Math.hypot(tv[0], tv[1]);
  const stretchDelta = 1.0 - mag; // positive = need to stretch more, negative = less

  const lang = STATE.lang;
  const t = T[lang];

  // Rotation hint
  let rotHint;
  if (Math.abs(deltaDeg) < 8) {
    rotHint = lang === "fr" ? "✓ bien aligné" : "✓ well aligned";
  } else {
    const dir = deltaDeg > 0
      ? (lang === "fr" ? "↺ gauche" : "↺ left")
      : (lang === "fr" ? "↻ droite" : "↻ right");
    const mag2 = Math.abs(deltaDeg);
    const strength = mag2 > 60 ? (lang === "fr" ? "beaucoup" : "a lot")
                   : mag2 > 20 ? (lang === "fr" ? "un peu" : "a bit")
                   :             (lang === "fr" ? "très peu" : "slightly");
    rotHint = `${dir} ${strength}`;
  }

  // Stretch hint
  let strHint;
  if (Math.abs(stretchDelta) < 0.12) {
    strHint = lang === "fr" ? "✓ bon étirement" : "✓ good stretch";
  } else {
    const dir = stretchDelta > 0
      ? (lang === "fr" ? "↑ plus" : "↑ more")
      : (lang === "fr" ? "↓ moins" : "↓ less");
    const mag3 = Math.abs(stretchDelta);
    const strength = mag3 > 0.5 ? (lang === "fr" ? "beaucoup" : "a lot")
                   : mag3 > 0.2 ? (lang === "fr" ? "un peu" : "a bit")
                   :              (lang === "fr" ? "très peu" : "slightly");
    strHint = `${dir} ${strength}`;
  }

  return { rotHint, strHint };
}

/* =====================================================================
   SVG RENDERING
   ===================================================================== */

const SC = CFG.SVG_SCALE;
const ARROW_SIZE = 5;

// Convert world coordinates to SVG coordinates (SVG y-axis flipped)
function wx(x) { return x * SC; }
function wy(y) { return -y * SC; }

function svgNS(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function makeArrowMarker(id, color) {
  const marker = svgNS("marker", {
    id, markerWidth: "8", markerHeight: "8",
    refX: "6", refY: "3", orient: "auto",
  });
  const path = svgNS("path", {
    d: "M0,0 L0,6 L8,3 z",
    fill: color,
  });
  marker.appendChild(path);
  return marker;
}

function renderSpace(svgEl, vector, color, basisVecs) {
  // Clear
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  const defs = svgNS("defs", {});
  defs.appendChild(makeArrowMarker("arr-vec-" + svgEl.id, color));
  defs.appendChild(makeArrowMarker("arr-b1-" + svgEl.id, "#34c759"));
  defs.appendChild(makeArrowMarker("arr-b2-" + svgEl.id, "#ff9f0a"));
  svgEl.appendChild(defs);

  const N = CFG.GRID_STEPS;

  // Grid lines
  for (let i = -N; i <= N; i++) {
    const gv = svgNS("line", {
      x1: wx(-N), y1: wy(i),
      x2: wx(N),  y2: wy(i),
      class: "grid-line",
    });
    const gh = svgNS("line", {
      x1: wx(i), y1: wy(-N),
      x2: wx(i), y2: wy(N),
      class: "grid-line",
    });
    svgEl.appendChild(gv);
    svgEl.appendChild(gh);
  }

  // Axes
  svgEl.appendChild(svgNS("line", {
    x1: wx(-N), y1: wy(0), x2: wx(N), y2: wy(0), class: "axis-line",
  }));
  svgEl.appendChild(svgNS("line", {
    x1: wx(0), y1: wy(-N), x2: wx(0), y2: wy(N), class: "axis-line",
  }));

  // Basis vectors (optional)
  if (basisVecs) {
    const [b1, b2] = basisVecs;
    const drawBasis = (bv, markerId, cls) => {
      const len = Math.hypot(bv[0], bv[1]);
      if (len < 0.01) return;
      // Shorten slightly to show arrowhead
      const scale = Math.max(0, len - ARROW_SIZE / SC) / len;
      svgEl.appendChild(svgNS("line", {
        x1: wx(0), y1: wy(0),
        x2: wx(bv[0] * scale), y2: wy(bv[1] * scale),
        stroke: cls === "b1" ? "#34c759" : "#ff9f0a",
        "stroke-width": "1.5",
        "marker-end": `url(#${markerId})`,
      }));
    };
    drawBasis(b1, "arr-b1-" + svgEl.id, "b1");
    drawBasis(b2, "arr-b2-" + svgEl.id, "b2");
  }

  // Main vector
  if (vector) {
    const [vx, vy] = vector;
    const len = Math.hypot(vx, vy);
    if (len > 0.01) {
      const scale = Math.max(0, len - ARROW_SIZE / SC) / len;
      svgEl.appendChild(svgNS("line", {
        x1: wx(0), y1: wy(0),
        x2: wx(vx * scale), y2: wy(vy * scale),
        stroke: color,
        "stroke-width": "2",
        "marker-end": `url(#arr-vec-${svgEl.id})`,
      }));
    }
  }
}

function renderTransformedSpace(svgEl, M, inputVec) {
  const transformed = matVec(M, inputVec);
  // Basis vectors in transformed space: M*e1 and M*e2
  const b1 = matVec(M, [1, 0]);
  const b2 = matVec(M, [0, 1]);
  renderSpace(svgEl, transformed, "#5856d6", [b1, b2]);

  // Draw deformed grid lines (just the two transformed basis directions)
  // Already covered by basis vectors above
}

/* =====================================================================
   WORD LIST RENDERING
   ===================================================================== */

function renderWordList(ranked) {
  const list = document.getElementById("word-list");

  // Detect ranking changes for flash animation
  const prevTop = list.querySelector("li.rank-top");
  const prevTopWord = prevTop ? prevTop.querySelector(".rank-word").textContent : null;

  list.innerHTML = "";
  ranked.forEach((item, rank) => {
    const li = document.createElement("li");
    if (rank === 0) li.classList.add("rank-top");

    const numEl = document.createElement("span");
    numEl.className = "rank-num";
    numEl.textContent = rank + 1;

    const wordEl = document.createElement("span");
    wordEl.className = "rank-word";
    wordEl.textContent = item.word;

    const probEl = document.createElement("span");
    probEl.className = "rank-prob";
    probEl.textContent = (item.prob * 100).toFixed(1) + "%";

    li.appendChild(numEl);
    li.appendChild(wordEl);
    li.appendChild(probEl);
    list.appendChild(li);
  });

  // Flash if top word changed
  const newTop = list.querySelector("li.rank-top");
  if (newTop && prevTopWord !== null) {
    const newTopWord = newTop.querySelector(".rank-word").textContent;
    if (newTopWord !== prevTopWord) {
      newTop.classList.add("flash");
      newTop.addEventListener("animationend", () => newTop.classList.remove("flash"), { once: true });
    }
  }
}

/* =====================================================================
   SENTENCE RENDERING
   ===================================================================== */

function renderSentence() {
  const lang = STATE.lang;
  const si = STATE.sentenceIdx;
  const sentence = SENTENCES[lang][si];
  const container = document.getElementById("sentence-display");
  container.innerHTML = "";

  sentence.template.forEach((token, ti) => {
    if (token === "___") {
      // Each sentence has exactly one blank; its global step == sentenceIdx
      const globalStep = si;
      const filled = STATE.filledWords[globalStep]; // exists if this step is done

      const span = document.createElement("span");
      if (filled) {
        span.className = "word-filled" + (filled.isCorrect ? "" : " wrong");
        span.textContent = filled.word;
      } else {
        span.className = "word-blank";
        span.textContent = "___";
      }
      container.appendChild(span);
    } else {
      const span = document.createElement("span");
      span.className = "word-token";
      span.textContent = (ti > 0 ? " " : "") + token;
      container.appendChild(span);
    }
  });
}

/* =====================================================================
   PROGRESS DOTS
   ===================================================================== */

function renderDots() {
  const dotsEl = document.getElementById("step-dots");
  dotsEl.innerHTML = "";
  const total = STEPS.length;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    const filled = STATE.filledWords[i];
    if (filled) {
      dot.classList.add(filled.isCorrect ? "done-correct" : "done-wrong");
    } else if (i === STATE.stepIdx) {
      dot.classList.add("active");
    }
    dotsEl.appendChild(dot);
  }
}

/* =====================================================================
   MATRIX DISPLAY
   ===================================================================== */

function renderMatrix(M) {
  document.getElementById("m00").textContent = M[0][0].toFixed(2);
  document.getElementById("m01").textContent = M[0][1].toFixed(2);
  document.getElementById("m10").textContent = M[1][0].toFixed(2);
  document.getElementById("m11").textContent = M[1][1].toFixed(2);
}

/* =====================================================================
   FULL RENDER CYCLE
   ===================================================================== */

function render() {
  const { rotation, stretch } = STATE;
  const M = buildMatrix(rotation, stretch);

  // Guard: if game over, don't try to access out-of-bounds step data for model
  if (!STATE.gameOver) {
    const inputVec = STEP_INPUT_VECS[STATE.stepIdx];

    // SVGs
    const svgOrig = document.getElementById("svg-original");
    const svgTrans = document.getElementById("svg-transformed");
    renderSpace(svgOrig, inputVec, "#0071e3");
    renderTransformedSpace(svgTrans, M, inputVec);

    // Matrix
    renderMatrix(M);

    // Rankings
    const { ranked } = computeRanking(rotation, stretch);
    STATE.currentRanking = ranked;
    renderWordList(ranked);

    // Hints
    const { rotHint, strHint } = computeHints(rotation, stretch);
    const lang = STATE.lang;
    document.getElementById("hint-rotation").textContent =
      T[lang].hintRotate(rotHint);
    document.getElementById("hint-stretch").textContent =
      T[lang].hintStretch(strHint);
  }

  // Sentence (always render — uses sentenceIdx which stays valid)
  renderSentence();

  // Dots
  renderDots();

  const lang = STATE.lang;

  // Progress label
  const totalSteps = STEPS.length;
  const displayStep = Math.min(STATE.stepIdx + 1, totalSteps);
  document.getElementById("progress-label").textContent =
    T[lang].progressLabel(STATE.sentenceIdx + 1, SENTENCES[lang].length,
                           displayStep, totalSteps);
  document.getElementById("step-label").textContent =
    T[lang].stepLabel(displayStep, totalSteps);

  // Rotation / stretch values
  document.getElementById("rotation-value").textContent = rotation + "°";
  document.getElementById("stretch-value").textContent = stretch.toFixed(2);
}

/* =====================================================================
   LANGUAGE SWITCHING
   ===================================================================== */

function applyTranslations() {
  const lang = STATE.lang;
  const t = T[lang];

  document.documentElement.lang = lang;
  document.getElementById("app-title").textContent      = t.appTitle;
  document.getElementById("lp-title").textContent       = t.panelSentence;
  document.getElementById("cp-title").textContent       = t.panelModel;
  document.getElementById("rp-title").textContent       = t.panelCandidates;
  document.getElementById("ctrl-rotation-label").textContent = t.ctrlRotation;
  document.getElementById("ctrl-stretch-label").textContent  = t.ctrlStretch;
  document.getElementById("label-original").textContent    = t.labelOriginal;
  document.getElementById("label-matrix").textContent      = t.labelMatrix;
  document.getElementById("label-transformed").textContent = t.labelTransformed;
  document.getElementById("score-label-text").textContent  = t.scoreLabel;
  document.getElementById("reset-btn").textContent         = t.resetBtn;
  document.getElementById("lang-btn").textContent          = t.langBtn;
  document.getElementById("instruction-text").textContent  = t.instruction;
  document.getElementById("enter-hint").textContent        = t.enterHint;
  document.getElementById("bottom-hint").textContent       = t.bottomHint;
  document.getElementById("modal-title").textContent       = t.modalResetTitle;
  document.getElementById("modal-body").textContent        = t.modalResetBody;
  document.getElementById("modal-cancel").textContent      = t.modalCancel;
  document.getElementById("modal-confirm").textContent     = t.modalConfirm;
  document.getElementById("end-title").textContent         = t.endTitle;
  document.getElementById("end-close").textContent         = t.endClose;
}

/* =====================================================================
   CONTROLS (sliders)
   ===================================================================== */

function initControls() {
  const rotSlider = document.getElementById("rotation-slider");
  const strSlider = document.getElementById("stretch-slider");

  rotSlider.addEventListener("input", () => {
    STATE.rotation = parseFloat(rotSlider.value);
    render();
  });

  strSlider.addEventListener("input", () => {
    STATE.stretch = parseFloat(strSlider.value);
    render();
  });
}

/* =====================================================================
   SCORING & GAME FLOW
   ===================================================================== */

function validateCurrentWord() {
  if (STATE.gameOver) return;

  const ranked = STATE.currentRanking;
  if (!ranked || ranked.length === 0) return;

  const topWord = ranked[0].word;
  const step = STEPS[STATE.stepIdx];
  const correctWord = step[STATE.lang][step.correctIdx];
  const isCorrect = topWord === correctWord;

  if (!isCorrect) {
    STATE.mistakes++;
    document.getElementById("score-value").textContent = STATE.mistakes;
  }

  STATE.filledWords.push({ word: topWord, isCorrect });

  const isLastStep = STATE.stepIdx >= STEPS.length - 1;

  if (isLastStep) {
    // Game over: keep stepIdx pointing to the last sentence so render works
    STATE.gameOver = true;
    render();           // shows last sentence with the filled blank
    showEndModal();
    return;
  }

  // Advance to next step
  STATE.stepIdx++;
  STATE.sentenceIdx = STATE.stepIdx;

  // Reset controls for next step
  STATE.rotation = 0;
  STATE.stretch = 1.0;
  document.getElementById("rotation-slider").value = 0;
  document.getElementById("stretch-slider").value = 1.0;

  render();
}

/* =====================================================================
   KEYBOARD
   ===================================================================== */

function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      // Don't trigger if modal is open or if focus is on an input
      if (!document.getElementById("modal-overlay").classList.contains("hidden")) return;
      if (!document.getElementById("modal-end-overlay").classList.contains("hidden")) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      validateCurrentWord();
    }
  });
}

/* =====================================================================
   RESET
   ===================================================================== */

function showResetModal() {
  document.getElementById("modal-password").value = "";
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("modal-password").focus();
}

function hideResetModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

function showEndModal() {
  const lang = STATE.lang;
  document.getElementById("end-body").textContent = T[lang].endBody(STATE.mistakes);
  document.getElementById("end-title").textContent = T[lang].endTitle;
  document.getElementById("modal-end-overlay").classList.remove("hidden");
}

function resetGame() {
  STATE.sentenceIdx = 0;
  STATE.stepIdx = 0;
  STATE.localStepIdx = 0;
  STATE.mistakes = 0;
  STATE.filledWords = [];
  STATE.rotation = 0;
  STATE.stretch = 1.0;
  STATE.currentRanking = [];
  STATE.gameOver = false;

  document.getElementById("rotation-slider").value = 0;
  document.getElementById("stretch-slider").value = 1.0;
  document.getElementById("score-value").textContent = 0;

  hideResetModal();
  applyTranslations();
  render();
}

function initReset() {
  document.getElementById("reset-btn").addEventListener("click", showResetModal);

  document.getElementById("modal-cancel").addEventListener("click", hideResetModal);

  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-overlay")) hideResetModal();
  });

  document.getElementById("modal-confirm").addEventListener("click", () => {
    const pwd = document.getElementById("modal-password").value;
    if (pwd === CFG.RESET_PASSWORD) {
      resetGame();
    } else {
      // Wrong password — shake the input
      const inp = document.getElementById("modal-password");
      inp.style.borderColor = "#d32f2f";
      inp.value = "";
      setTimeout(() => { inp.style.borderColor = ""; }, 1200);
    }
  });

  document.getElementById("modal-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("modal-confirm").click();
    if (e.key === "Escape") hideResetModal();
  });

  document.getElementById("end-close").addEventListener("click", () => {
    document.getElementById("modal-end-overlay").classList.add("hidden");
  });
}

/* =====================================================================
   LANGUAGE TOGGLE
   ===================================================================== */

function initLangToggle() {
  document.getElementById("lang-btn").addEventListener("click", () => {
    STATE.lang = STATE.lang === "fr" ? "en" : "fr";
    applyTranslations();
    render();
  });
}

/* =====================================================================
   INITIALIZATION
   ===================================================================== */

function init() {
  initControls();
  initKeyboard();
  initReset();
  initLangToggle();
  applyTranslations();
  render();
}

document.addEventListener("DOMContentLoaded", init);
