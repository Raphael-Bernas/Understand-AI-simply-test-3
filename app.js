'use strict';

const CONFIG = {
  viewBox: { width: 1200, height: 620 },
  thetaMin: -Math.PI,
  thetaMax: Math.PI,
  stretchMin: 0.55,
  stretchMax: 1.85,
  initialTheta: -0.85,
  initialStretch: 1.0,
  softmaxTemperature: 1.35,
  correctBoost: 0.16,
  gradientStepTheta: 0.018,
  gradientStepStretch: 0.018,
  resetPassword: 'Admin0000'
};

const LAYOUT = {
  blocks: {
    sentence: { x: 38, y: 74, w: 190, h: 350 },
    vector: { x: 268, y: 74, w: 180, h: 350 },
    model: { x: 493, y: 74, w: 214, h: 350 },
    transformed: { x: 746, y: 74, w: 180, h: 350 },
    probabilities: { x: 966, y: 48, w: 196, h: 506 }
  },
  controls: {
    knob: { cx: 565, cy: 507, r: 46 },
    slider: { x: 664, y1: 552, y2: 462 }
  }
};

const TRANSLATIONS = {
  fr: {
    htmlLang: 'fr',
    eyebrow: 'Comprendre l’IA simplement',
    title: 'Le modèle transforme l’information',
    scoreLabel: 'Erreurs',
    progressLabel: 'Phrase',
    reset: 'Recommencer',
    instructionTitle: 'À vous de régler le modèle',
    instructionCopy: 'Tournez le bouton et ajustez l’étirement. Quand le mot correct est en haut, appuyez sur Entrée.',
    hintSummary: 'Les petites flèches donnent une direction approximative pour réduire l’erreur.',
    sentenceLabel: 'Préfixe de phrase',
    vectorLabel: 'Représentation vectorielle',
    modelLabel: 'Modèle visible',
    transformedLabel: 'Vecteur transformé',
    probabilityLabel: 'Probabilités classées',
    matrixTitle: 'Matrice 2×2',
    rotation: 'rotation',
    stretch: 'étirement',
    enterHint: 'Entrée choisit le mot en tête',
    missing: 'mot manquant',
    top: 'en tête',
    correct: 'correct',
    clockwise: 'tourner horaire',
    counterClockwise: 'tourner anti-horaire',
    lift: 'monter',
    lower: 'descendre',
    steady: 'presque bon',
    strengthSoft: 'léger',
    strengthMedium: 'net',
    strengthStrong: 'fort',
    doneTitle: 'Activité terminée',
    doneCopy: score => `${score} erreur${score > 1 ? 's' : ''}. Plus le score est bas, meilleur est le modèle.`,
    resetPrompt: 'Mot de passe pour recommencer :',
    wrong: 'Pas encore : continuez à régler le modèle.'
  },
  gb: {
    htmlLang: 'en',
    eyebrow: 'Understand AI simply',
    title: 'The model transforms information',
    scoreLabel: 'Mistakes',
    progressLabel: 'Sentence',
    reset: 'Retry',
    instructionTitle: 'Tune the model',
    instructionCopy: 'Turn the knob and adjust the stretch. When the correct word is on top, press Enter.',
    hintSummary: 'The small arrows give an approximate direction for lowering the error.',
    sentenceLabel: 'Sentence prefix',
    vectorLabel: 'Vector representation',
    modelLabel: 'Visible model',
    transformedLabel: 'Transformed vector',
    probabilityLabel: 'Ranked probabilities',
    matrixTitle: '2×2 matrix',
    rotation: 'rotation',
    stretch: 'stretch',
    enterHint: 'Enter selects the top word',
    missing: 'missing word',
    top: 'top',
    correct: 'correct',
    clockwise: 'turn clockwise',
    counterClockwise: 'turn counter-clockwise',
    lift: 'move up',
    lower: 'move down',
    steady: 'nearly there',
    strengthSoft: 'soft',
    strengthMedium: 'clear',
    strengthStrong: 'strong',
    doneTitle: 'Activity complete',
    doneCopy: score => `${score} mistake${score === 1 ? '' : 's'}. Lower score means a better model.`,
    resetPrompt: 'Password to retry:',
    wrong: 'Not yet: keep tuning the model.'
  }
};

const CONTENT = [
  {
    targets: [{ theta: -1.18, stretch: 1.34 }, { theta: 0.64, stretch: 0.82 }],
    fr: { start: 'Le chat dort sur le', endings: ['tapis', 'rouge'], candidates: [
      ['tapis', 'nuage', 'stylo', 'jardin', 'train', 'fromage', 'livre', 'soleil', 'vélo', 'piano', 'canapé', 'robot', 'rivière', 'chapeau', 'galette', 'bouteille', 'forêt', 'miroir', 'ballon', 'crayon'],
      ['rouge', 'rapide', 'bleu', 'calme', 'sucré', 'pointu', 'ancien', 'léger', 'bruyant', 'doré', 'minuscule', 'froid', 'joyeux', 'rond', 'sombre', 'vert', 'large', 'secret', 'propre', 'neuf']
    ] },
    gb: { start: 'The cat sleeps on the', endings: ['red', 'rug'], candidates: [
      ['red', 'fast', 'blue', 'calm', 'sweet', 'sharp', 'old', 'light', 'noisy', 'golden', 'tiny', 'cold', 'happy', 'round', 'dark', 'green', 'wide', 'secret', 'clean', 'new'],
      ['rug', 'cloud', 'pencil', 'garden', 'train', 'cheese', 'book', 'sun', 'bike', 'piano', 'sofa', 'robot', 'river', 'hat', 'cookie', 'bottle', 'forest', 'mirror', 'balloon', 'crayon']
    ] }
  },
  {
    targets: [{ theta: 0.96, stretch: 1.48 }, { theta: -0.42, stretch: 1.12 }],
    fr: { start: 'Pour grandir, la plante a besoin de', endings: ['lumière', 'eau'], candidates: [
      ['lumière', 'marteau', 'silence', 'téléphone', 'papier', 'musique', 'sable', 'montagne', 'chaussette', 'fusée', 'peinture', 'vitesse', 'coton', 'parfum', 'horloge', 'carte', 'neige', 'pomme', 'lampe', 'chaise'],
      ['eau', 'feu', 'sel', 'vent', 'verre', 'bois', 'riz', 'savon', 'plume', 'boue', 'miel', 'laine', 'craie', 'pierre', 'huile', 'lait', 'fer', 'thé', 'gomme', 'cuivre']
    ] },
    gb: { start: 'To grow, the plant needs', endings: ['light', 'water'], candidates: [
      ['light', 'hammer', 'silence', 'phone', 'paper', 'music', 'sand', 'mountain', 'sock', 'rocket', 'paint', 'speed', 'cotton', 'perfume', 'clock', 'map', 'snow', 'apple', 'lamp', 'chair'],
      ['water', 'fire', 'salt', 'wind', 'glass', 'wood', 'rice', 'soap', 'feather', 'mud', 'honey', 'wool', 'chalk', 'stone', 'oil', 'milk', 'iron', 'tea', 'eraser', 'copper']
    ] }
  },
  {
    targets: [{ theta: 1.72, stretch: 0.74 }, { theta: -2.02, stretch: 1.54 }],
    fr: { start: 'À midi, nous mangeons à la', endings: ['cantine', 'ensemble'], candidates: [
      ['cantine', 'bibliothèque', 'piscine', 'gare', 'pharmacie', 'plage', 'ferme', 'classe', 'forêt', 'banque', 'station', 'tour', 'cour', 'cuisine', 'usine', 'poste', 'mairie', 'grange', 'cabane', 'galerie'],
      ['ensemble', 'demain', 'lentement', 'dehors', 'rarement', 'hier', 'presque', 'vite', 'partout', 'jamais', 'souvent', 'ici', 'loin', 'encore', 'seuls', 'mieux', 'dessous', 'avant', 'haut', 'près']
    ] },
    gb: { start: 'At noon, we eat in the', endings: ['cafeteria', 'together'], candidates: [
      ['cafeteria', 'library', 'pool', 'station', 'pharmacy', 'beach', 'farm', 'classroom', 'forest', 'bank', 'stop', 'tower', 'yard', 'kitchen', 'factory', 'post', 'townhall', 'barn', 'cabin', 'gallery'],
      ['together', 'tomorrow', 'slowly', 'outside', 'rarely', 'yesterday', 'almost', 'quickly', 'everywhere', 'never', 'often', 'here', 'far', 'again', 'alone', 'better', 'below', 'before', 'high', 'near']
    ] }
  },
  {
    targets: [{ theta: -2.42, stretch: 0.92 }, { theta: 2.38, stretch: 1.66 }],
    fr: { start: 'Le matin, le soleil se lève à', endings: ['l’est', 'brillant'], candidates: [
      ['l’est', 'l’ouest', 'minuit', 'la cave', 'gauche', 'droite', 'l’école', 'mars', 'l’hiver', 'la mer', 'Paris', 'la lune', 'la table', 'midi', 'la forêt', 'la rue', 'l’avion', 'la porte', 'la neige', 'la colline'],
      ['brillant', 'carré', 'salé', 'cassé', 'timide', 'rapide', 'profond', 'violet', 'humide', 'muet', 'lourd', 'simple', 'malade', 'sec', 'fragile', 'opaque', 'neutre', 'vide', 'courbé', 'plat']
    ] },
    gb: { start: 'In the morning, the sun rises in the', endings: ['east', 'bright'], candidates: [
      ['east', 'west', 'midnight', 'basement', 'left', 'right', 'school', 'mars', 'winter', 'sea', 'Paris', 'moon', 'table', 'noon', 'forest', 'street', 'plane', 'door', 'snow', 'hill'],
      ['bright', 'square', 'salty', 'broken', 'shy', 'fast', 'deep', 'purple', 'wet', 'silent', 'heavy', 'simple', 'sick', 'dry', 'fragile', 'opaque', 'neutral', 'empty', 'curved', 'flat']
    ] }
  },
  {
    targets: [{ theta: 0.18, stretch: 1.72 }, { theta: -1.64, stretch: 0.66 }],
    fr: { start: 'Dans un modèle de langue, le meilleur mot reçoit une forte', endings: ['probabilité', 'calculée'], candidates: [
      ['probabilité', 'valise', 'banane', 'fenêtre', 'tempête', 'clé', 'voiture', 'ombre', 'brosse', 'étoile', 'route', 'chemise', 'cloche', 'animal', 'photo', 'danse', 'pont', 'voix', 'poche', 'graine'],
      ['calculée', 'rouillée', 'chantée', 'ouverte', 'perdue', 'pliée', 'lavée', 'cachée', 'gelée', 'peinte', 'cousue', 'lancée', 'copiée', 'fermée', 'posée', 'usée', 'notée', 'brisée', 'trouvée', 'rêvée']
    ] },
    gb: { start: 'In a language model, the best word receives a high', endings: ['probability', 'computed'], candidates: [
      ['probability', 'suitcase', 'banana', 'window', 'storm', 'key', 'car', 'shadow', 'brush', 'star', 'road', 'shirt', 'bell', 'animal', 'photo', 'dance', 'bridge', 'voice', 'pocket', 'seed'],
      ['computed', 'rusted', 'sung', 'open', 'lost', 'folded', 'washed', 'hidden', 'frozen', 'painted', 'sewn', 'launched', 'copied', 'closed', 'placed', 'worn', 'noted', 'broken', 'found', 'dreamed']
    ] }
  }
];

const state = {
  language: 'fr',
  sentenceIndex: 0,
  stepIndex: 0,
  mistakes: 0,
  theta: CONFIG.initialTheta,
  stretch: CONFIG.initialStretch,
  dragging: null,
  stepParams: null,
  probabilities: [],
  lastMessage: '',
  done: false
};

const svg = document.getElementById('pipeline-svg');
const scoreValue = document.getElementById('score-value');
const progressValue = document.getElementById('progress-value');

function t(key) { return TRANSLATIONS[state.language][key]; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function round(value) { return Number.parseFloat(value).toFixed(2); }
function vectorLength(v) { return Math.hypot(v.x, v.y); }
function normalize(v) { const len = vectorLength(v) || 1; return { x: v.x / len, y: v.y / len }; }
function dot(a, b) { return a.x * b.x + a.y * b.y; }
function lerp(a, b, x) { return a + (b - a) * x; }
function invLerp(a, b, x) { return (x - a) / (b - a); }
function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function matrixFromControls(theta = state.theta, stretch = state.stretch) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const sx = stretch;
  const sy = 1 / Math.sqrt(stretch);
  return { a: c * sx, b: -s * sy, c: s * sx, d: c * sy };
}

function applyMatrix(matrix, vector) {
  return { x: matrix.a * vector.x + matrix.b * vector.y, y: matrix.c * vector.x + matrix.d * vector.y };
}

function buildStepParams(sentenceIndex, stepIndex) {
  const content = CONTENT[sentenceIndex];
  const target = content.targets[stepIndex];
  const seedAngle = sentenceIndex * 0.93 + stepIndex * 1.61 + 0.42;
  const input = normalize({ x: Math.cos(seedAngle) * 0.94 + 0.22, y: Math.sin(seedAngle) * 0.86 - 0.08 });
  const idealTransformed = applyMatrix(matrixFromControls(target.theta, target.stretch), input);
  const idealDirection = normalize(idealTransformed);
  const correctVector = { x: idealDirection.x * 1.58, y: idealDirection.y * 1.58 };
  const candidateVectors = Array.from({ length: 20 }, (_, index) => {
    if (index === 0) return correctVector;
    const angle = seedAngle + 0.55 + index * 0.71 + (index % 3) * 0.13;
    const radius = 1.02 + (index % 5) * 0.045;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
  const biases = Array.from({ length: 20 }, (_, index) => index === 0 ? CONFIG.correctBoost : -0.09 - (index % 4) * 0.035);
  return { input, candidateVectors, biases, ideal: target };
}

function currentSentence() { return CONTENT[state.sentenceIndex]; }
function currentLanguageData() { return currentSentence()[state.language]; }
function currentCandidates() { return currentLanguageData().candidates[state.stepIndex]; }
function correctWord() { return currentLanguageData().endings[state.stepIndex]; }

function sentencePrefix() {
  const data = currentLanguageData();
  const accepted = data.endings.slice(0, state.stepIndex);
  return [data.start, ...accepted].join(' ');
}

function computeProbabilities(theta = state.theta, stretch = state.stretch) {
  const matrix = matrixFromControls(theta, stretch);
  const transformed = applyMatrix(matrix, state.stepParams.input);
  const logits = state.stepParams.candidateVectors.map((candidate, index) => (
    dot(transformed, candidate) / CONFIG.softmaxTemperature + state.stepParams.biases[index]
  ));
  const maxLogit = Math.max(...logits);
  const exps = logits.map(value => Math.exp(value - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((value, index) => ({
    index,
    word: currentCandidates()[index],
    probability: value / sum,
    correct: index === 0,
    logit: logits[index]
  })).sort((a, b) => b.probability - a.probability);
}

function loss(theta, stretch) {
  const probs = computeProbabilities(theta, stretch);
  const correct = probs.find(item => item.correct);
  return -Math.log(Math.max(correct.probability, 0.000001));
}

function gradientHints() {
  const baseTheta = state.theta;
  const baseStretch = state.stretch;
  const dTheta = CONFIG.gradientStepTheta;
  const dStretch = CONFIG.gradientStepStretch;
  const gradTheta = (loss(baseTheta + dTheta, baseStretch) - loss(baseTheta - dTheta, baseStretch)) / (2 * dTheta);
  const gradStretch = (loss(baseTheta, clamp(baseStretch + dStretch, CONFIG.stretchMin, CONFIG.stretchMax)) - loss(baseTheta, clamp(baseStretch - dStretch, CONFIG.stretchMin, CONFIG.stretchMax))) / (2 * dStretch);
  return { gradTheta, gradStretch };
}

function strengthLabel(value) {
  const magnitude = Math.abs(value);
  if (magnitude < 0.035) return t('steady');
  if (magnitude < 0.22) return t('strengthSoft');
  if (magnitude < 0.55) return t('strengthMedium');
  return t('strengthStrong');
}

function initializeStep(resetControls = true) {
  state.stepParams = buildStepParams(state.sentenceIndex, state.stepIndex);
  state.lastMessage = '';
  if (resetControls) {
    state.theta = CONFIG.initialTheta + state.sentenceIndex * 0.18 - state.stepIndex * 0.22;
    state.stretch = clamp(CONFIG.initialStretch + state.stepIndex * 0.08 - state.sentenceIndex * 0.03, CONFIG.stretchMin, CONFIG.stretchMax);
  }
  state.probabilities = computeProbabilities();
}

function defs() {
  return `
    <defs>
      <marker id="arrowhead" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#b8b8c0"></path>
      </marker>
      <marker id="vectorhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#0a84ff"></path>
      </marker>
      <marker id="greenhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#34c759"></path>
      </marker>
      <filter id="panelShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.07"/>
      </filter>
    </defs>`;
}

function panel(name, label, title) {
  const b = LAYOUT.blocks[name];
  const cls = name === 'model' ? 'svg-panel model' : 'svg-panel';
  return `<g>
    <rect class="${cls}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="28" filter="url(#panelShadow)"></rect>
    <text class="svg-label" x="${b.x + 22}" y="${b.y + 35}">${label}</text>
    <text class="svg-title" x="${b.x + 22}" y="${b.y + 62}">${title}</text>
  </g>`;
}

function arrow(fromName, toName) {
  const from = LAYOUT.blocks[fromName];
  const to = LAYOUT.blocks[toName];
  const y = from.y + from.h / 2;
  return `<path class="arrow-line" d="M ${from.x + from.w + 14} ${y} C ${from.x + from.w + 38} ${y}, ${to.x - 38} ${y}, ${to.x - 14} ${y}"></path>`;
}

function renderSentenceBlock() {
  const b = LAYOUT.blocks.sentence;
  const prefix = escapeHtml(sentencePrefix());
  const nextNumber = state.stepIndex + 1;
  return `<g>
    ${panel('sentence', t('sentenceLabel'), `#${state.sentenceIndex + 1}`)}
    <foreignObject x="${b.x + 22}" y="${b.y + 88}" width="${b.w - 44}" height="170">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font: 750 18px/1.38 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1d1d1f;letter-spacing:-0.02em;">
        ${prefix} <span style="display:inline-block;margin-top:8px;padding:4px 10px;border-radius:999px;background:#eef5ff;color:#0a84ff;font-size:14px;">${t('missing')} ${nextNumber}</span>
      </div>
    </foreignObject>
    <text class="svg-small" x="${b.x + 22}" y="${b.y + b.h - 54}">${t('enterHint')}</text>
    <text class="svg-small" x="${b.x + 22}" y="${b.y + b.h - 30}" fill="#ff3b30">${escapeHtml(state.lastMessage)}</text>
  </g>`;
}

function vectorGraphic(name, vector, cls) {
  const b = LAYOUT.blocks[name];
  const cx = b.x + b.w / 2;
  const cy = b.y + 205;
  const scale = 55;
  const endX = cx + vector.x * scale;
  const endY = cy - vector.y * scale;
  return `<g>
    <line class="vector-axis" x1="${cx - 62}" y1="${cy}" x2="${cx + 62}" y2="${cy}"></line>
    <line class="vector-axis" x1="${cx}" y1="${cy + 62}" x2="${cx}" y2="${cy - 62}"></line>
    <circle cx="${cx}" cy="${cy}" r="66" fill="none" stroke="#eeeeF3" stroke-width="1.2"></circle>
    <line class="${cls}" x1="${cx}" y1="${cy}" x2="${endX}" y2="${endY}"></line>
    <text class="svg-small" x="${b.x + 32}" y="${b.y + 304}">x ${round(vector.x)} · y ${round(vector.y)}</text>
  </g>`;
}

function renderVectorBlocks(matrix, transformed) {
  return `<g>
    ${panel('vector', t('vectorLabel'), 'v')}
    ${vectorGraphic('vector', state.stepParams.input, 'vector-line')}
    ${panel('transformed', t('transformedLabel'), 'M × v')}
    ${vectorGraphic('transformed', transformed, 'transformed-line')}
  </g>`;
}

function renderMatrix(matrix) {
  const b = LAYOUT.blocks.model;
  const k = LAYOUT.controls.knob;
  const s = LAYOUT.controls.slider;
  const knobX = k.cx + Math.cos(state.theta - Math.PI / 2) * 28;
  const knobY = k.cy + Math.sin(state.theta - Math.PI / 2) * 28;
  const sliderT = invLerp(CONFIG.stretchMin, CONFIG.stretchMax, state.stretch);
  const thumbY = lerp(s.y1, s.y2, sliderT);
  const hints = gradientHints();
  const thetaDirection = Math.abs(hints.gradTheta) < 0.035 ? 0 : -Math.sign(hints.gradTheta);
  const stretchDirection = Math.abs(hints.gradStretch) < 0.035 ? 0 : -Math.sign(hints.gradStretch);
  const thetaText = thetaDirection === 0 ? t('steady') : thetaDirection > 0 ? t('clockwise') : t('counterClockwise');
  const stretchText = stretchDirection === 0 ? t('steady') : stretchDirection > 0 ? t('lift') : t('lower');
  const arcEnd = thetaDirection >= 0 ? 606 : 524;
  const arcSweep = thetaDirection >= 0 ? 1 : 0;
  const sliderArrow = stretchDirection >= 0 ? 'M 706 515 L 706 476 M 696 486 L 706 476 L 716 486' : 'M 706 476 L 706 515 M 696 505 L 706 515 L 716 505';

  return `<g>
    ${panel('model', t('modelLabel'), t('matrixTitle'))}
    <g transform="translate(${b.x + 37}, ${b.y + 96})">
      ${[0,1,2,3].map(i => `<rect class="matrix-cell" x="${(i % 2) * 68}" y="${Math.floor(i / 2) * 46}" width="62" height="38" rx="10"></rect>`).join('')}
      <text class="matrix-value" x="31" y="25" text-anchor="middle">${round(matrix.a)}</text>
      <text class="matrix-value" x="99" y="25" text-anchor="middle">${round(matrix.b)}</text>
      <text class="matrix-value" x="31" y="71" text-anchor="middle">${round(matrix.c)}</text>
      <text class="matrix-value" x="99" y="71" text-anchor="middle">${round(matrix.d)}</text>
    </g>
    <text class="svg-small" x="${b.x + 30}" y="${b.y + 216}">${t('rotation')}: ${(state.theta * 180 / Math.PI).toFixed(0)}°</text>
    <text class="svg-small" x="${b.x + 30}" y="${b.y + 238}">${t('stretch')}: ${round(state.stretch)}</text>
    <circle class="knob-ring" data-control="knob" cx="${k.cx}" cy="${k.cy}" r="${k.r}"></circle>
    <line class="knob-indicator" x1="${k.cx}" y1="${k.cy}" x2="${knobX}" y2="${knobY}"></line>
    <circle cx="${k.cx}" cy="${k.cy}" r="5" fill="#a7a7af"></circle>
    <path d="M 524 488 A 52 52 0 0 ${arcSweep} ${arcEnd} 488" fill="none" stroke="#0a84ff" stroke-width="2.2" stroke-linecap="round" opacity="0.75"></path>
    <text class="svg-small" x="${k.cx}" y="${k.cy + 78}" text-anchor="middle">${thetaText} · ${strengthLabel(hints.gradTheta)}</text>
    <line class="slider-track" data-control="slider" x1="${s.x}" y1="${s.y1}" x2="${s.x}" y2="${s.y2}"></line>
    <line class="slider-fill" data-control="slider" x1="${s.x}" y1="${s.y1}" x2="${s.x}" y2="${thumbY}"></line>
    <circle class="slider-thumb" data-control="slider" cx="${s.x}" cy="${thumbY}" r="14"></circle>
    <path d="${sliderArrow}" fill="none" stroke="#0a84ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"></path>
    <text class="svg-small" x="${s.x}" y="${s.y1 + 34}" text-anchor="middle">${stretchText}</text>
  </g>`;
}

function renderProbabilities() {
  const b = LAYOUT.blocks.probabilities;
  const maxProbability = state.probabilities[0]?.probability || 1;
  const rows = state.probabilities.map((item, rank) => {
    const y = b.y + 84 + rank * 20.4;
    const width = 108 * (item.probability / maxProbability);
    const groupClass = `${rank === 0 ? 'top-word' : ''} ${rank === 0 && item.correct ? 'correct-top' : ''}`;
    return `<g class="${groupClass}" transform="translate(${b.x + 18}, ${y})">
      <rect class="prob-row-bg" x="0" y="0" width="160" height="16" rx="8"></rect>
      <rect class="prob-bar" x="0" y="0" width="${Math.max(3, width)}" height="16" rx="8"></rect>
      <text class="prob-word" x="8" y="12">${rank + 1}. ${escapeHtml(item.word)}</text>
      <text class="prob-value" x="154" y="12" text-anchor="end">${Math.round(item.probability * 100)}%</text>
    </g>`;
  }).join('');
  return `<g>
    ${panel('probabilities', t('probabilityLabel'), t('top'))}
    <text class="svg-small" x="${b.x + 22}" y="${b.y + 65}">20 ${state.language === 'fr' ? 'mots fixes pour cette étape' : 'fixed words for this step'}</text>
    ${rows}
  </g>`;
}

function renderCompletion() {
  svg.innerHTML = `${defs()}
    <rect x="175" y="96" width="850" height="390" rx="42" fill="rgba(255,255,255,0.94)" stroke="#e7e7ed" filter="url(#panelShadow)"></rect>
    <text class="completion-title" x="600" y="235" text-anchor="middle">${t('doneTitle')}</text>
    <text class="completion-copy" x="600" y="285" text-anchor="middle">${escapeHtml(t('doneCopy')(state.mistakes))}</text>
    <text class="completion-copy" x="600" y="330" text-anchor="middle">${state.language === 'fr' ? 'Un modèle est évalué par son erreur : plus elle est basse, mieux il fonctionne.' : 'A model is evaluated by its error: lower is better.'}</text>`;
}

function render() {
  updateChrome();
  if (state.done) {
    renderCompletion();
    return;
  }
  const matrix = matrixFromControls();
  const transformed = applyMatrix(matrix, state.stepParams.input);
  state.probabilities = computeProbabilities();
  svg.innerHTML = `${defs()}
    ${arrow('sentence', 'vector')}
    ${arrow('vector', 'model')}
    ${arrow('model', 'transformed')}
    ${arrow('transformed', 'probabilities')}
    ${renderSentenceBlock()}
    ${renderVectorBlocks(matrix, transformed)}
    ${renderMatrix(matrix)}
    ${renderProbabilities()}`;
}

function updateChrome() {
  const tr = TRANSLATIONS[state.language];
  document.documentElement.lang = tr.htmlLang;
  document.getElementById('eyebrow').textContent = tr.eyebrow;
  document.getElementById('app-title').textContent = tr.title;
  document.getElementById('score-label').textContent = tr.scoreLabel;
  document.getElementById('progress-label').textContent = tr.progressLabel;
  document.getElementById('reset-button').textContent = tr.reset;
  document.getElementById('instruction-title').textContent = tr.instructionTitle;
  document.getElementById('instruction-copy').textContent = state.done ? tr.doneCopy(state.mistakes) : tr.instructionCopy;
  document.getElementById('hint-summary').textContent = tr.hintSummary;
  scoreValue.textContent = String(state.mistakes);
  progressValue.textContent = `${Math.min(state.sentenceIndex + 1, CONTENT.length)} / ${CONTENT.length}`;
  document.getElementById('lang-fr').classList.toggle('active', state.language === 'fr');
  document.getElementById('lang-gb').classList.toggle('active', state.language === 'gb');
  document.getElementById('lang-fr').setAttribute('aria-pressed', String(state.language === 'fr'));
  document.getElementById('lang-gb').setAttribute('aria-pressed', String(state.language === 'gb'));
}

function svgPoint(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function updateControlFromPointer(event) {
  if (!state.dragging || state.done) return;
  const point = svgPoint(event);
  if (state.dragging === 'knob') {
    const { cx, cy } = LAYOUT.controls.knob;
    state.theta = clamp(Math.atan2(point.y - cy, point.x - cx) + Math.PI / 2, CONFIG.thetaMin, CONFIG.thetaMax);
  }
  if (state.dragging === 'slider') {
    const s = LAYOUT.controls.slider;
    const y = clamp(point.y, s.y2, s.y1);
    const amount = invLerp(s.y1, s.y2, y);
    state.stretch = lerp(CONFIG.stretchMin, CONFIG.stretchMax, amount);
  }
  state.lastMessage = '';
  render();
}

function handleEnter() {
  if (state.done) return;
  const top = computeProbabilities()[0];
  if (!top.correct) {
    state.mistakes += 1;
    state.lastMessage = t('wrong');
    svg.classList.remove('wrong-flash');
    void svg.offsetWidth;
    svg.classList.add('wrong-flash');
    render();
    return;
  }
  advanceStep();
}

function advanceStep() {
  const sentence = currentSentence();
  state.stepIndex += 1;
  if (state.stepIndex >= sentence.targets.length) {
    state.sentenceIndex += 1;
    state.stepIndex = 0;
  }
  if (state.sentenceIndex >= CONTENT.length) {
    state.done = true;
    render();
    return;
  }
  initializeStep(true);
  render();
}

function resetActivity() {
  state.sentenceIndex = 0;
  state.stepIndex = 0;
  state.mistakes = 0;
  state.done = false;
  initializeStep(true);
  render();
}

svg.addEventListener('pointerdown', event => {
  const control = event.target.dataset?.control;
  if (!control) return;
  state.dragging = control;
  svg.setPointerCapture(event.pointerId);
  updateControlFromPointer(event);
});

svg.addEventListener('pointermove', updateControlFromPointer);
svg.addEventListener('pointerup', event => {
  state.dragging = null;
  if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
});
svg.addEventListener('pointerleave', () => { state.dragging = null; });

document.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleEnter();
  }
});

document.getElementById('lang-fr').addEventListener('click', () => {
  state.language = 'fr';
  render();
});

document.getElementById('lang-gb').addEventListener('click', () => {
  state.language = 'gb';
  render();
});

document.getElementById('reset-button').addEventListener('click', () => {
  const answer = window.prompt(t('resetPrompt'));
  if (answer === CONFIG.resetPassword) resetActivity();
});

initializeStep(true);
render();
