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
  RESET_PASSWORD: "Admin0000",
  SOFTMAX_TEMP:      1.0,
  SVG_SCALE:         80,
  GRID_STEPS:        5,
  TEST_SENTENCES:    2,       // sentences in training phase (not scored)
  SCORED_SENTENCES:  8,       // sentences in scored phase
  SHRINK_FACTOR:     0.72,    // stronger range multiplier for clearer precision progression
  INITIAL_ROT_RANGE: 180,     // initial ± rotation range in degrees
  INITIAL_STR_RANGE: 1.8,     // initial ± stretch delta from 1.0
  MAX_ZOOM_GAIN:     2.2,     // visual zoom gain in transformed space at max precision
  NUM_WORDS:         20,
  BLANK_COLORS:      ["#0071e3", "#5856d6"],
};

/* =====================================================================
   TRANSLATIONS
   ===================================================================== */
const T = {
  fr: {
    appTitle:           "Comprendre l'IA",
    panelSentence:      "Phrase en cours",
    panelModel:         "Le modèle",
    panelCandidates:    "Mots candidats",
    ctrlRotation:       "Rotation",
    ctrlStretch:        "Étirement",
    labelOriginal:      "Espace d'entrée",
    labelMatrix:        "Matrice M",
    labelTransformed:   "Espace transformé",
    progressLabel:      (s, n) => `Phrase ${s}/${n}`,
    stepLabel:          (s, n) => `Phrase ${s} sur ${n}`,
    instruction:        "Ajuste la matrice pour que le modèle prédise tous les mots manquants, puis appuie sur Entrée.",
    enterHint:          "↵ Entrée pour lancer la prédiction",
    enterContinue:      "↵ Entrée pour passer à la phrase suivante",
    bottomHint:         "Rotation et étirement · ↵ Entrée pour prédire tous les mots manquants en même temps",
    bottomHintContinue: "↵ Entrée pour passer à la phrase suivante",
    hintRotate:         (v) => `Rotation : ${v}`,
    hintStretch:        (v) => `Étirement : ${v}`,
    scoreLabel:         "Erreurs",
    resetBtn:           "↺ Recommencer",
    langBtn:            "🇬🇧 EN",
    phaseBadgeTest:     "ENTRAÎNEMENT",
    phaseBadgeScored:   "NOTÉE",
    blankTab:           (n) => `Blanc ${n}`,
    rotRange:           (v) => `±${v}°`,
    strRange:           (v) => `±${v}`,
    precisionTitle:     "Précision",
    precisionWindow:    "Fenêtre d'ajustement",
    precisionGain:      "Gain de précision",
    precisionLevel:     (n) => `Niveau ${n}`,
    resultCorrect:      (k, n) => k === n ? `Parfait ! ${k}/${n} ✓` : `${k}/${n} correct${k > 1 ? "s" : ""}`,
    modalResetTitle:    "Réinitialiser",
    modalResetBody:     "Entrez le mot de passe administrateur :",
    modalCancel:        "Annuler",
    modalConfirm:       "Confirmer",
    transitionTitle:    "Entraînement terminé !",
    transitionBody:     "Les paramètres sont réinitialisés. La partie notée commence maintenant. Ajuste bien les paramètres — la marge de manœuvre diminue à chaque phrase !",
    transitionContinue: "Commencer →",
    endTitle:           "Partie terminée !",
    endBody:            (e, t) => e === 0
      ? `Bravo ! Score parfait : 0 erreur sur ${t} blancs 🎉`
      : `Terminé avec ${e} erreur${e > 1 ? "s" : ""} sur ${t} blancs. Moins tu as d'erreurs, mieux c'est !`,
    endClose:           "Fermer",
  },
  en: {
    appTitle:           "Understand AI",
    panelSentence:      "Current Sentence",
    panelModel:         "The Model",
    panelCandidates:    "Candidate Words",
    ctrlRotation:       "Rotation",
    ctrlStretch:        "Stretch",
    labelOriginal:      "Input Space",
    labelMatrix:        "Matrix M",
    labelTransformed:   "Transformed Space",
    progressLabel:      (s, n) => `Sentence ${s}/${n}`,
    stepLabel:          (s, n) => `Sentence ${s} of ${n}`,
    instruction:        "Adjust the matrix so the model correctly predicts all missing words, then press Enter.",
    enterHint:          "↵ Enter to run the prediction",
    enterContinue:      "↵ Enter to move to the next sentence",
    bottomHint:         "Rotation and stretch · ↵ Enter to predict all missing words at once",
    bottomHintContinue: "↵ Enter to move to the next sentence",
    hintRotate:         (v) => `Rotate: ${v}`,
    hintStretch:        (v) => `Stretch: ${v}`,
    scoreLabel:         "Mistakes",
    resetBtn:           "↺ Reset",
    langBtn:            "🇫🇷 FR",
    phaseBadgeTest:     "TRAINING",
    phaseBadgeScored:   "SCORED",
    blankTab:           (n) => `Blank ${n}`,
    rotRange:           (v) => `±${v}°`,
    strRange:           (v) => `±${v}`,
    precisionTitle:     "Precision",
    precisionWindow:    "Adjustment window",
    precisionGain:      "Precision gain",
    precisionLevel:     (n) => `Level ${n}`,
    resultCorrect:      (k, n) => k === n ? `Perfect! ${k}/${n} ✓` : `${k}/${n} correct`,
    modalResetTitle:    "Reset Game",
    modalResetBody:     "Enter the administrator password:",
    modalCancel:        "Cancel",
    modalConfirm:       "Confirm",
    transitionTitle:    "Training complete!",
    transitionBody:     "Parameters have been reset. The scored phase begins now. Calibrate carefully — the allowed range shrinks with each sentence!",
    transitionContinue: "Start →",
    endTitle:           "Game Over!",
    endBody:            (e, t) => e === 0
      ? `Perfect score: 0 mistakes out of ${t} blanks 🎉`
      : `Finished with ${e} mistake${e > 1 ? "s" : ""} out of ${t} blanks. Lower score is better!`,
    endClose:           "Close",
  },
};

/* =====================================================================
   WORD POOLS  (6 categories × 20 words, FR + EN aligned)
   ===================================================================== */
const POOLS = {
  A: { // Animals
    fr: ["chien","chat","lapin","oiseau","poisson","cheval","cochon","vache",
         "mouton","canard","grenouille","serpent","lion","tigre","ours",
         "singe","éléphant","renard","loup","aigle"],
    en: ["dog","cat","rabbit","bird","fish","horse","pig","cow",
         "sheep","duck","frog","snake","lion","tiger","bear",
         "monkey","elephant","fox","wolf","eagle"],
  },
  P: { // People / roles
    fr: ["enfant","garçon","fille","homme","femme","médecin","chef","artiste",
         "musicien","sportif","pêcheur","jardinier","berger","boulanger","pilote",
         "facteur","pompier","infirmier","soldat","astronaute"],
    en: ["child","boy","girl","man","woman","doctor","chef","artist",
         "musician","athlete","fisherman","gardener","shepherd","baker","pilot",
         "postman","firefighter","nurse","soldier","astronaut"],
  },
  L: { // pLaces
    fr: ["jardin","forêt","mer","lac","montagne","plage","ville","école",
         "maison","rue","parc","champ","rivière","grotte","île",
         "prairie","stade","bibliothèque","musée","cinéma"],
    en: ["garden","forest","sea","lake","mountain","beach","city","school",
         "house","street","park","field","river","cave","island",
         "meadow","stadium","library","museum","cinema"],
  },
  O: { // Objects
    fr: ["livre","table","chaise","verre","lampe","porte","clé","sac",
         "boîte","tiroir","tapis","rideau","miroir","coussin","panier",
         "bouteille","crayon","cahier","stylo","règle"],
    en: ["book","table","chair","glass","lamp","door","key","bag",
         "box","drawer","carpet","curtain","mirror","cushion","basket",
         "bottle","pencil","notebook","pen","ruler"],
  },
  F: { // Food
    fr: ["gâteau","soupe","pain","fromage","pomme","carotte","poulet","riz",
         "salade","tarte","confiture","chocolat","glace","crêpe","biscuit",
         "fraise","orange","lait","œuf","miel"],
    en: ["cake","soup","bread","cheese","apple","carrot","chicken","rice",
         "salad","pie","jam","chocolate","ice cream","pancake","biscuit",
         "strawberry","orange","milk","egg","honey"],
  },
  N: { // Nature / weather
    fr: ["soleil","lune","étoile","nuage","pluie","neige","vent","éclair",
         "arc-en-ciel","brouillard","grêle","rosée","gel","verglas","orage",
         "tempête","tornade","cyclone","brume","aurore"],
    en: ["sun","moon","star","cloud","rain","snow","wind","lightning",
         "rainbow","fog","hail","dew","frost","ice","storm",
         "tempest","tornado","cyclone","mist","aurora"],
  },
};

/* =====================================================================
   SENTENCE POOL — 30 sentences (indices 0–29)

   Target rotation: -90 + idx × (180/29)  degrees  (−90° to +90°)
   Each sentence: 2 blanks
   Each blank: { pool: "A"/"P"/"L"/"O"/"F"/"N", ci: correctIndexInPool }
   Candidate list = pool rotated so pool[ci] comes first (correct = index 0).
   ===================================================================== */
const SENTENCE_POOL = [
  // 0 — target ≈ −90°
  { fr:["Le","___","court","dans","le","___","."],
    en:["The","___","runs","in","the","___","."],
    blanks:[{pool:"A",ci:0},{pool:"L",ci:0}] },        // chien/dog · jardin/garden

  // 1 — target ≈ −83.8°
  { fr:["Un","___","vole","vers","la","___","."],
    en:["A","___","flies","toward","the","___","."],
    blanks:[{pool:"A",ci:19},{pool:"L",ci:4}] },        // aigle/eagle · montagne/mountain

  // 2 — target ≈ −77.6°
  { fr:["Le","___","nage","dans","la","___","."],
    en:["The","___","swims","in","the","___","."],
    blanks:[{pool:"A",ci:4},{pool:"L",ci:2}] },         // poisson/fish · mer/sea

  // 3 — target ≈ −71.4°
  { fr:["Le","___","boit","dans","la","___","."],
    en:["The","___","drinks","from","the","___","."],
    blanks:[{pool:"A",ci:5},{pool:"L",ci:3}] },         // cheval/horse · lac/lake

  // 4 — target ≈ −65.2°
  { fr:["Un","___","mange","une","___","."],
    en:["A","___","eats","an","___","."],
    blanks:[{pool:"A",ci:14},{pool:"F",ci:4}] },        // ours/bear · pomme/apple

  // 5 — target ≈ −59.0°
  { fr:["Le","___","prépare","un","___","."],
    en:["The","___","prepares","a","___","."],
    blanks:[{pool:"P",ci:6},{pool:"F",ci:0}] },         // chef/chef · gâteau/cake

  // 6 — target ≈ −52.8°
  { fr:["Un","___","lit","un","___","passionnant","."],
    en:["A","___","reads","an","exciting","___","."],
    blanks:[{pool:"P",ci:0},{pool:"O",ci:0}] },         // enfant/child · livre/book

  // 7 — target ≈ −46.6°
  { fr:["Le","___","éclaire","la","___","."],
    en:["The","___","lights","up","the","___","."],
    blanks:[{pool:"N",ci:0},{pool:"L",ci:1}] },         // soleil/sun · forêt/forest

  // 8 — target ≈ −40.3°
  { fr:["La","___","tombe","du","___","."],
    en:["The","___","falls","from","the","___","."],
    blanks:[{pool:"N",ci:4},{pool:"N",ci:3}] },         // pluie/rain · nuage/cloud

  // 9 — target ≈ −34.1°
  { fr:["Le","___","souffle","sur","la","___","."],
    en:["The","___","blows","across","the","___","."],
    blanks:[{pool:"N",ci:6},{pool:"L",ci:5}] },         // vent/wind · plage/beach

  // 10 — target ≈ −27.9°
  { fr:["Un","___","explore","la","___","."],
    en:["A","___","explores","the","___","."],
    blanks:[{pool:"P",ci:3},{pool:"L",ci:13}] },        // homme/man · grotte/cave

  // 11 — target ≈ −21.7°
  { fr:["Une","___","construit","une","___","."],
    en:["A","___","builds","a","___","."],
    blanks:[{pool:"P",ci:4},{pool:"L",ci:8}] },         // femme/woman · maison/house

  // 12 — target ≈ −15.5°
  { fr:["Un","___","chante","dans","le","___","."],
    en:["A","___","sings","in","the","___","."],
    blanks:[{pool:"A",ci:3},{pool:"L",ci:10}] },        // oiseau/bird · parc/park

  // 13 — target ≈ −9.3°
  { fr:["La","___","couvre","la","___","."],
    en:["The","___","covers","the","___","."],
    blanks:[{pool:"N",ci:5},{pool:"L",ci:4}] },         // neige/snow · montagne/mountain

  // 14 — target ≈ −3.1°
  { fr:["Le","___","soigne","le","___","."],
    en:["The","___","treats","the","___","."],
    blanks:[{pool:"P",ci:5},{pool:"A",ci:1}] },         // médecin/doctor · chat/cat

  // 15 — target ≈ +3.1°
  { fr:["La","___","joue","dans","la","___","."],
    en:["The","___","plays","in","the","___","."],
    blanks:[{pool:"P",ci:2},{pool:"L",ci:15}] },        // fille/girl · prairie/meadow

  // 16 — target ≈ +9.3°
  { fr:["Un","___","frappe","le","___","."],
    en:["A","___","strikes","the","___","."],
    blanks:[{pool:"N",ci:7},{pool:"L",ci:11}] },        // éclair/lightning · champ/field

  // 17 — target ≈ +15.5°
  { fr:["Le","___","arrose","le","___","."],
    en:["The","___","waters","the","___","."],
    blanks:[{pool:"P",ci:11},{pool:"L",ci:0}] },        // jardinier/gardener · jardin/garden

  // 18 — target ≈ +21.7°
  { fr:["Le","___","traverse","la","___","."],
    en:["The","___","crosses","the","___","."],
    blanks:[{pool:"P",ci:1},{pool:"L",ci:12}] },        // garçon/boy · rivière/river

  // 19 — target ≈ +27.9°
  { fr:["Un","___","grimpe","dans","la","___","."],
    en:["A","___","climbs","into","the","___","."],
    blanks:[{pool:"A",ci:15},{pool:"L",ci:1}] },        // singe/monkey · forêt/forest

  // 20 — target ≈ +34.1°
  { fr:["Le","___","court","après","le","___","."],
    en:["The","___","chases","the","___","."],
    blanks:[{pool:"A",ci:18},{pool:"A",ci:2}] },        // loup/wolf · lapin/rabbit

  // 21 — target ≈ +40.3°
  { fr:["Le","___","réchauffe","la","___","."],
    en:["The","___","warms","the","___","."],
    blanks:[{pool:"N",ci:0},{pool:"L",ci:5}] },         // soleil/sun · plage/beach

  // 22 — target ≈ +46.5°
  { fr:["La","___","remplit","le","___","."],
    en:["The","___","fills","the","___","."],
    blanks:[{pool:"N",ci:4},{pool:"L",ci:3}] },         // pluie/rain · lac/lake

  // 23 — target ≈ +52.8°
  { fr:["Le","___","répare","la","___","."],
    en:["The","___","repairs","the","___","."],
    blanks:[{pool:"P",ci:16},{pool:"O",ci:5}] },        // pompier/firefighter · porte/door

  // 24 — target ≈ +59.0°
  { fr:["Le","___","vend","du","___","."],
    en:["The","___","sells","some","___","."],
    blanks:[{pool:"P",ci:13},{pool:"F",ci:2}] },        // boulanger/baker · pain/bread

  // 25 — target ≈ +65.2°
  { fr:["Le","___","attrape","un","___","."],
    en:["The","___","catches","a","___","."],
    blanks:[{pool:"P",ci:10},{pool:"A",ci:4}] },        // pêcheur/fisherman · poisson/fish

  // 26 — target ≈ +71.4°
  { fr:["Un","___","admire","le","___","."],
    en:["An","___","admires","the","___","."],
    blanks:[{pool:"P",ci:7},{pool:"N",ci:0}] },         // artiste/artist · soleil/sun

  // 27 — target ≈ +77.6°
  { fr:["Le","___","déguste","un","___","."],
    en:["The","___","tastes","a","___","."],
    blanks:[{pool:"P",ci:1},{pool:"F",ci:11}] },        // garçon/boy · chocolat/chocolate

  // 28 — target ≈ +83.8°
  { fr:["Un","___","tombe","sur","la","___","."],
    en:["A","___","falls","on","the","___","."],
    blanks:[{pool:"N",ci:7},{pool:"L",ci:4}] },         // éclair/lightning · montagne/mountain

  // 29 — target ≈ +90°
  { fr:["Le","___","visite","la","___","."],
    en:["The","___","visits","the","___","."],
    blanks:[{pool:"P",ci:1},{pool:"L",ci:17}] },        // garçon/boy · bibliothèque/library
];

/* =====================================================================
   STATE
   ===================================================================== */
const STATE = {
  lang:               "fr",
  phase:              "test",   // "test" | "scored"
  phaseStep:          0,        // sentence index within current phase
  selectedSentences:  [],       // 10 pool indices: [2 test …  8 scored sorted by angle]
  mistakes:           0,        // only incremented in scored phase
  totalBlanks:        0,        // total blanks in scored phase (for end modal)
  sentenceHistory:    [],       // [{poolIdx, blankResults:[{word,isCorrect}]}]
  sentenceResult:     null,     // null while playing; [{word,isCorrect}] after Enter
  rotation:           0,        // degrees
  stretch:            1.0,
  rotRange:           CFG.INITIAL_ROT_RANGE,
  stretchRange:       CFG.INITIAL_STR_RANGE,
  focusedBlank:       0,        // which blank's ranking is shown
  currentRankings:    [],       // [{ranked, inputVec, transformed}] per blank
  currentBlankParams: [],       // [{vecs, biases}] per blank; built when sentence loads
  gameOver:           false,
};

/* =====================================================================
   MATH UTILITIES
   ===================================================================== */
function degToRad(d) { return d * Math.PI / 180; }

// Build 2×2 transform M = R(θ) · S(s)
function buildMatrix(rotDeg, stretch) {
  const r   = degToRad(rotDeg);
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return [
    [stretch * cos, -sin],
    [stretch * sin,  cos],
  ];
}

function matVec(M, v) {
  return [
    M[0][0] * v[0] + M[0][1] * v[1],
    M[1][0] * v[0] + M[1][1] * v[1],
  ];
}

function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

function softmax(logits) {
  const max  = Math.max(...logits);
  const exps = logits.map(x => Math.exp((x - max) / CFG.SOFTMAX_TEMP));
  const sum  = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function currentGlobalStep() {
  return STATE.phase === "test"
    ? STATE.phaseStep
    : CFG.TEST_SENTENCES + STATE.phaseStep;
}

function precisionProgress() {
  const rotP = 1 - (STATE.rotRange / CFG.INITIAL_ROT_RANGE);
  const strP = 1 - (STATE.stretchRange / CFG.INITIAL_STR_RANGE);
  return clamp((rotP + strP) * 0.5, 0, 1);
}

/* =====================================================================
   SEEDED PSEUDO-RANDOM (deterministic word vectors)
   ===================================================================== */
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return (x - Math.floor(x)) * 2 - 1; // in [-1, 1]
}

/* =====================================================================
   DATA ACCESS HELPERS
   ===================================================================== */

// Target rotation for sentence at pool index s: uniformly spans -90° to +90°
function sentTargetDeg(poolIdx) {
  return -90 + poolIdx * (180 / 29);
}

// Input vector angle for blank b  (0°, 60°, 120° …)
function blankInputAngle(blankIdx) {
  return blankIdx * Math.PI / 3;
}

// Current sentence definition
function currentSentDef() {
  return SENTENCE_POOL[currentPoolIdx()];
}

// Pool index for the current game sentence
function currentPoolIdx() {
  const i = STATE.phase === "test" ? STATE.phaseStep : CFG.TEST_SENTENCES + STATE.phaseStep;
  return STATE.selectedSentences[i];
}

// Build a 20-word candidate list with the correct word rotated to index 0
function makeBlankCandidates(poolCode, lang, ci) {
  const arr = POOLS[poolCode][lang];
  const n   = arr.length; // always 20
  return Array.from({ length: n }, (_, i) => arr[(ci + i) % n]);
}

/* =====================================================================
   WORD VECTOR PARAMETERS
   Model: correct word vector is placed at angle (α_b + θ_target),
   ensuring that applying rotation θ_target maps the input vector for
   blank b exactly onto the correct word's vector for EVERY blank b.
   ===================================================================== */
function buildBlankWordVecs(poolIdx, blankIdx) {
  const targetRad     = degToRad(sentTargetDeg(poolIdx));
  const alpha         = blankInputAngle(blankIdx);
  const totalSteps    = CFG.TEST_SENTENCES + CFG.SCORED_SENTENCES;
  const stepProgress  = clamp(currentGlobalStep() / (totalSteps - 1), 0, 1);

  // 12° → 2° offset across the 10 played sentences:
  // early rounds intentionally misalign blank #2 (likely wrong),
  // then the offset decays so improved precision can recover accuracy.
  const blankOffsetDeg = blankIdx === 1 ? (12 - 10 * stepProgress) : 0;
  const correctAngle   = alpha + targetRad + degToRad(blankOffsetDeg);

  // Correct-word advantage and distractor pressure both relax over time:
  // biasPenalty: 0.30 → 0.06, distractorBoost: 0.20 → 0.04.
  // This creates a "hard early, fair later" curve without making late rounds trivial.
  const biasPenalty = blankIdx === 1 ? (0.30 - 0.24 * stepProgress) : 0;
  const distractorBoost = blankIdx === 1 ? (0.20 - 0.16 * stepProgress) : 0;

  const vecs   = [[Math.cos(correctAngle), Math.sin(correctAngle)]];
  const biases = [0.5 - biasPenalty];

  for (let i = 1; i < CFG.NUM_WORDS; i++) {
    const angle = (i / CFG.NUM_WORDS) * 2 * Math.PI
                + seededRand(poolIdx * 10000 + blankIdx * 1000 + i) * 0.55;
    const r     = 0.62 + seededRand(poolIdx * 20000 + blankIdx * 2000 + i) * 0.28;
    vecs.push([r * Math.cos(angle), r * Math.sin(angle)]);
    const baseBias = seededRand(poolIdx * 30000 + blankIdx * 3000 + i) * 0.15;
    biases.push(i === 1 ? baseBias + distractorBoost : baseBias);
  }

  return { vecs, biases };
}

/* =====================================================================
   SENTENCE SELECTION
   Shuffle pool [0..29], take first 2 as test sentences (random order),
   take next 8 as scored sentences and sort them by target angle so that
   consecutive sentences need only small parameter adjustments.
   ===================================================================== */
function selectSentences() {
  const all = Array.from({ length: 30 }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const test   = all.slice(0, CFG.TEST_SENTENCES);
  const scored = all.slice(CFG.TEST_SENTENCES, CFG.TEST_SENTENCES + CFG.SCORED_SENTENCES)
                    .sort((a, b) => a - b); // sort ascending = monotone target angles
  STATE.selectedSentences = [...test, ...scored];
}

/* =====================================================================
   PROBABILITY MODEL
   ===================================================================== */
function buildRankings(rotDeg, stretch) {
  const poolIdx = currentPoolIdx();
  const sentDef = currentSentDef();
  const M       = buildMatrix(rotDeg, stretch);

  return sentDef.blanks.map((blankDef, b) => {
    const alpha      = blankInputAngle(b);
    const inputVec   = [Math.cos(alpha), Math.sin(alpha)];
    const transformed = matVec(M, inputVec);

    const { vecs, biases } = STATE.currentBlankParams[b];
    const words  = makeBlankCandidates(blankDef.pool, STATE.lang, blankDef.ci);
    const logits = vecs.map((wv, i) => dot(transformed, wv) + biases[i]);
    const probs  = softmax(logits);

    const ranked = words.map((w, i) => ({ word: w, prob: probs[i], origIdx: i }));
    ranked.sort((a, b) => b.prob - a.prob);

    return { ranked, inputVec, transformed };
  });
}

/* =====================================================================
   HINT LOGIC
   ===================================================================== */
function computeHints(rotDeg, stretch) {
  const poolIdx   = currentPoolIdx();
  const targetDeg = sentTargetDeg(poolIdx);
  const lang      = STATE.lang;

  // Rotation delta normalized to [-180, 180]
  let dRot = targetDeg - rotDeg;
  while (dRot >  180) dRot -= 360;
  while (dRot < -180) dRot += 360;

  let rotHint;
  if (Math.abs(dRot) < 8) {
    rotHint = lang === "fr" ? "✓ bien aligné" : "✓ well aligned";
  } else {
    const dir = dRot > 0
      ? (lang === "fr" ? "↺ gauche" : "↺ left")
      : (lang === "fr" ? "↻ droite" : "↻ right");
    const mag = Math.abs(dRot);
    const str = mag > 60 ? (lang === "fr" ? "beaucoup"  : "a lot")
              : mag > 20 ? (lang === "fr" ? "un peu"    : "a bit")
              :             (lang === "fr" ? "légèrement": "slightly");
    rotHint = `${dir} ${str}`;
  }

  // Stretch hint (optimal ≈ 1.0)
  const dStr = 1.0 - stretch;
  let strHint;
  if (Math.abs(dStr) < 0.12) {
    strHint = lang === "fr" ? "✓ bon" : "✓ good";
  } else {
    const dir = dStr > 0
      ? (lang === "fr" ? "↑ plus"  : "↑ more")
      : (lang === "fr" ? "↓ moins" : "↓ less");
    const mag = Math.abs(dStr);
    const str = mag > 0.5 ? (lang === "fr" ? "beaucoup"  : "a lot")
              : mag > 0.2 ? (lang === "fr" ? "un peu"    : "a bit")
              :              (lang === "fr" ? "légèrement": "slightly");
    strHint = `${dir} ${str}`;
  }

  return { rotHint, strHint };
}

/* =====================================================================
   SVG RENDERING  (supports multiple vectors per space)
   ===================================================================== */
const SC          = CFG.SVG_SCALE;
const ARROW_SIZE  = 5;

function wx(x) { return  x * SC; }
function wy(y) { return -y * SC; }

function svgNS(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function makeArrowMarker(id, color) {
  const m = svgNS("marker", {
    id, markerWidth: "8", markerHeight: "6",
    refX: "6", refY: "3", orient: "auto",
  });
  m.appendChild(svgNS("path", { d: "M0,0 L0,6 L8,3 z", fill: color }));
  return m;
}

function drawVectorOnSVG(svgEl, v, color, markerId) {
  const [vx, vy] = v;
  const len = Math.hypot(vx, vy);
  if (len < 0.01) return;
  const scale = Math.max(0, len - ARROW_SIZE / SC) / len;
  svgEl.appendChild(svgNS("line", {
    x1: wx(0), y1: wy(0),
    x2: wx(vx * scale), y2: wy(vy * scale),
    stroke: color,
    "stroke-width": "2",
    "marker-end": `url(#${markerId})`,
  }));
}

function renderSpace(svgEl, vectors, colors, basisVecs) {
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  const defs = svgNS("defs", {});
  colors.forEach((c, i) => defs.appendChild(makeArrowMarker(`arv${i}-${svgEl.id}`, c)));
  defs.appendChild(makeArrowMarker(`arb1-${svgEl.id}`, "#34c759"));
  defs.appendChild(makeArrowMarker(`arb2-${svgEl.id}`, "#ff9f0a"));
  svgEl.appendChild(defs);

  const N = CFG.GRID_STEPS;
  for (let i = -N; i <= N; i++) {
    svgEl.appendChild(svgNS("line", { x1:wx(-N),y1:wy(i),x2:wx(N),y2:wy(i), class:"grid-line" }));
    svgEl.appendChild(svgNS("line", { x1:wx(i),y1:wy(-N),x2:wx(i),y2:wy(N), class:"grid-line" }));
  }
  svgEl.appendChild(svgNS("line", { x1:wx(-N),y1:wy(0),x2:wx(N),y2:wy(0), class:"axis-line" }));
  svgEl.appendChild(svgNS("line", { x1:wx(0),y1:wy(-N),x2:wx(0),y2:wy(N), class:"axis-line" }));

  if (basisVecs) {
    drawVectorOnSVG(svgEl, basisVecs[0], "#34c759", `arb1-${svgEl.id}`);
    drawVectorOnSVG(svgEl, basisVecs[1], "#ff9f0a", `arb2-${svgEl.id}`);
  }

  vectors.forEach((v, i) => {
    if (v) drawVectorOnSVG(svgEl, v, colors[i], `arv${i}-${svgEl.id}`);
  });
}

function renderSpaces() {
  if (STATE.gameOver) return;
  const M       = buildMatrix(STATE.rotation, STATE.stretch);
  const sentDef = currentSentDef();
  const colors  = CFG.BLANK_COLORS.slice(0, sentDef.blanks.length);

  const inputVecs      = sentDef.blanks.map((_, b) => {
    const a = blankInputAngle(b);
    return [Math.cos(a), Math.sin(a)];
  });
  const transformedVecs = inputVecs.map(v => matVec(M, v));
  const b1 = matVec(M, [1, 0]);
  const b2 = matVec(M, [0, 1]);

  const p = precisionProgress();
  const zoom = 1 + p * CFG.MAX_ZOOM_GAIN;
  const half = 110 / zoom;
  document.getElementById("svg-original")
    .setAttribute("viewBox", "-110 -110 220 220");
  document.getElementById("svg-transformed")
    .setAttribute("viewBox", `${-half.toFixed(2)} ${-half.toFixed(2)} ${(half * 2).toFixed(2)} ${(half * 2).toFixed(2)}`);

  renderSpace(document.getElementById("svg-original"), inputVecs, colors, null);
  renderSpace(document.getElementById("svg-transformed"), transformedVecs, colors, [b1, b2]);
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
   SENTENCE DISPLAY
   ===================================================================== */
function renderSentence() {
  const poolIdx  = currentPoolIdx();
  const sentDef  = SENTENCE_POOL[poolIdx];
  const lang     = STATE.lang;
  const template = sentDef[lang];
  const results  = STATE.sentenceResult;
  const container = document.getElementById("sentence-display");
  container.innerHTML = "";

  let blankCount = 0;
  template.forEach((token, ti) => {
    if (ti > 0) container.appendChild(document.createTextNode(" "));

    if (token === "___") {
      const b    = blankCount++;
      const span = document.createElement("span");

      if (results) {
        // Show filled result
        const res = results[b];
        span.className = "word-filled" + (res.isCorrect ? "" : " wrong");
        span.textContent = res.word;
      } else {
        // Show coloured blank (colour matches blank tab)
        span.className = "word-blank";
        const color = CFG.BLANK_COLORS[b] || CFG.BLANK_COLORS[0];
        span.style.borderBottomColor = color;
        span.style.color             = color;
        span.textContent = "___";
      }
      container.appendChild(span);
    } else {
      container.appendChild(document.createTextNode(token));
    }
  });
}

/* =====================================================================
   BLANK TABS
   ===================================================================== */
function renderBlankTabs() {
  const container = document.getElementById("blank-tabs");
  container.innerHTML = "";
  const sentDef = currentSentDef();
  const lang    = STATE.lang;

  sentDef.blanks.forEach((_, b) => {
    const btn = document.createElement("button");
    btn.className = "blank-tab"
      + (b === STATE.focusedBlank ? ` active-blank-${b}` : "");
    btn.textContent = T[lang].blankTab(b + 1);
    btn.addEventListener("click", () => {
      STATE.focusedBlank = b;
      renderBlankTabs();
      renderWordList();
    });
    container.appendChild(btn);
  });
}

/* =====================================================================
   WORD LIST  (shows focused blank's ranking)
   ===================================================================== */
function renderWordList() {
  const list = document.getElementById("word-list");

  const prevTop     = list.querySelector("li.rank-top");
  const prevTopWord = prevTop ? prevTop.querySelector(".rank-word").textContent : null;

  list.innerHTML = "";
  const rankings = STATE.currentRankings;
  if (!rankings || rankings.length === 0) return;

  const b      = clamp(STATE.focusedBlank, 0, rankings.length - 1);
  const ranked = rankings[b].ranked;

  ranked.forEach((item, rank) => {
    const li = document.createElement("li");
    if (rank === 0) li.classList.add("rank-top");

    const numEl  = document.createElement("span");
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

  // Flash animation if top word changed
  if (!STATE.sentenceResult && prevTopWord !== null) {
    const newTop     = list.querySelector("li.rank-top");
    const newTopWord = newTop ? newTop.querySelector(".rank-word").textContent : null;
    if (newTopWord && newTopWord !== prevTopWord) {
      newTop.classList.add("flash");
      newTop.addEventListener("animationend", () => newTop.classList.remove("flash"), { once: true });
    }
  }
}

/* =====================================================================
   PROGRESS DOTS
   ===================================================================== */
function renderDots() {
  const el      = document.getElementById("step-dots");
  el.innerHTML  = "";
  const histLen = STATE.sentenceHistory.length;

  // Test dots
  for (let i = 0; i < CFG.TEST_SENTENCES; i++) {
    const dot = document.createElement("span");
    dot.className = "dot dot-test";
    if (i < histLen) {
      const allOk = STATE.sentenceHistory[i].blankResults.every(r => r.isCorrect);
      dot.classList.add(allOk ? "done-correct" : "done-wrong");
    } else if (STATE.phase === "test" && i === STATE.phaseStep) {
      dot.classList.add("active");
    }
    el.appendChild(dot);
  }

  // Separator
  const sep = document.createElement("span");
  sep.className = "dot-sep";
  sep.textContent = "·";
  el.appendChild(sep);

  // Scored dots
  for (let i = 0; i < CFG.SCORED_SENTENCES; i++) {
    const dot     = document.createElement("span");
    dot.className = "dot";
    const histIdx = CFG.TEST_SENTENCES + i;
    if (histIdx < histLen) {
      const allOk = STATE.sentenceHistory[histIdx].blankResults.every(r => r.isCorrect);
      dot.classList.add(allOk ? "done-correct" : "done-wrong");
    } else if (STATE.phase === "scored" && i === STATE.phaseStep) {
      dot.classList.add("active");
    }
    el.appendChild(dot);
  }
}

/* =====================================================================
   PHASE BADGE
   ===================================================================== */
function renderPhase() {
  const badge = document.getElementById("phase-badge");
  const lang  = STATE.lang;
  if (STATE.phase === "test") {
    badge.textContent = T[lang].phaseBadgeTest;
    badge.className   = "phase-badge phase-test";
  } else {
    badge.textContent = T[lang].phaseBadgeScored;
    badge.className   = "phase-badge phase-scored";
  }
}

/* =====================================================================
   FULL RENDER CYCLE
   ===================================================================== */
function render() {
  const { rotation, stretch } = STATE;
  const lang      = STATE.lang;
  const t         = T[lang];
  const isResult  = !!STATE.sentenceResult;
  const M         = buildMatrix(rotation, stretch);

  // result-mode class on main-grid (disables sliders visually)
  document.getElementById("main-grid").classList.toggle("result-mode", isResult);

  if (!STATE.gameOver) {
    // SVGs + matrix
    renderSpaces();
    renderMatrix(M);

    // Rankings only update during play (not after Enter, so word list is frozen)
    if (!isResult) {
      STATE.currentRankings = buildRankings(rotation, stretch);
    }

    // Hints (play mode only)
    if (!isResult) {
      const { rotHint, strHint } = computeHints(rotation, stretch);
      document.getElementById("hint-rotation").textContent = t.hintRotate(rotHint);
      document.getElementById("hint-stretch").textContent  = t.hintStretch(strHint);
    }
  }

  // Sentence (always)
  renderSentence();

  // Blank tabs + word list
  renderBlankTabs();
  renderWordList();

  // Dots
  renderDots();

  // Phase badge
  renderPhase();

  // Result banner
  const banner = document.getElementById("result-banner");
  const rText  = document.getElementById("result-text");
  if (isResult) {
    const correct = STATE.sentenceResult.filter(r => r.isCorrect).length;
    const total   = STATE.sentenceResult.length;
    rText.textContent = t.resultCorrect(correct, total);
    banner.className  = "result-banner " + (correct === total ? "all-correct" : "some-wrong");
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }

  // Progress label
  const total     = CFG.TEST_SENTENCES + CFG.SCORED_SENTENCES;
  const current   = STATE.sentenceHistory.length + 1;
  const displayed = Math.min(current, total);
  document.getElementById("progress-label").textContent = t.progressLabel(displayed, total);
  document.getElementById("step-label").textContent     = t.stepLabel(displayed, total);

  // Slider values + range indicators
  document.getElementById("rotation-value").textContent = rotation.toFixed(1) + "°";
  document.getElementById("stretch-value").textContent  = stretch.toFixed(2);
  document.getElementById("rotation-range").textContent = t.rotRange(Math.round(STATE.rotRange));
  document.getElementById("stretch-range").textContent  = t.strRange(STATE.stretchRange.toFixed(2));

  // Precision HUD (window shrinks, precision grows)
  const p = precisionProgress();
  // Keep a visible minimum fill so bars remain legible even near extremes.
  const windowPct = Math.max(8, (1 - p) * 100);
  const gainPct   = Math.max(4, p * 100);
  const level     = Math.min(9, Math.floor(p * 8) + 1);
  document.getElementById("precision-level").textContent = t.precisionLevel(level);
  document.getElementById("precision-window-fill").style.width = `${windowPct.toFixed(1)}%`;
  document.getElementById("precision-gain-fill").style.width   = `${gainPct.toFixed(1)}%`;

  // Score
  document.getElementById("score-value").textContent = STATE.mistakes;

  // Instructions / hints
  if (isResult) {
    document.getElementById("instruction-text").textContent = t.enterContinue;
    document.getElementById("enter-hint").textContent       = t.enterContinue;
    document.getElementById("bottom-hint").textContent      = t.bottomHintContinue;
  } else {
    document.getElementById("instruction-text").textContent = t.instruction;
    document.getElementById("enter-hint").textContent       = t.enterHint;
    document.getElementById("bottom-hint").textContent      = t.bottomHint;
  }
}

/* =====================================================================
   LANGUAGE SWITCHING
   ===================================================================== */
function applyTranslations() {
  const lang = STATE.lang;
  const t    = T[lang];

  document.documentElement.lang = lang;
  document.getElementById("app-title").textContent           = t.appTitle;
  document.getElementById("lp-title").textContent            = t.panelSentence;
  document.getElementById("cp-title").textContent            = t.panelModel;
  document.getElementById("rp-title").textContent            = t.panelCandidates;
  document.getElementById("ctrl-rotation-label").textContent = t.ctrlRotation;
  document.getElementById("ctrl-stretch-label").textContent  = t.ctrlStretch;
  document.getElementById("label-original").textContent      = t.labelOriginal;
  document.getElementById("label-matrix").textContent        = t.labelMatrix;
  document.getElementById("label-transformed").textContent   = t.labelTransformed;
  document.getElementById("precision-title").textContent     = t.precisionTitle;
  document.getElementById("precision-window-label").textContent = t.precisionWindow;
  document.getElementById("precision-gain-label").textContent   = t.precisionGain;
  document.getElementById("score-label-text").textContent    = t.scoreLabel;
  document.getElementById("reset-btn").textContent           = t.resetBtn;
  document.getElementById("lang-btn").textContent            = t.langBtn;
  document.getElementById("modal-title").textContent         = t.modalResetTitle;
  document.getElementById("modal-body").textContent          = t.modalResetBody;
  document.getElementById("modal-cancel").textContent        = t.modalCancel;
  document.getElementById("modal-confirm").textContent       = t.modalConfirm;
  document.getElementById("transition-title").textContent    = t.transitionTitle;
  document.getElementById("transition-body").textContent     = t.transitionBody;
  document.getElementById("transition-continue").textContent = t.transitionContinue;
  document.getElementById("end-title").textContent           = t.endTitle;
  document.getElementById("end-close").textContent           = t.endClose;
}

/* =====================================================================
   SLIDER RANGE MANAGEMENT
   The allowed range is centred on the current value.
   After each Enter press the range multiplies by SHRINK_FACTOR.
   ===================================================================== */
function updateSliderRanges() {
  const rotSlider = document.getElementById("rotation-slider");
  const strSlider = document.getElementById("stretch-slider");

  // Rotation slider — centred on current rotation
  const rotMin = STATE.rotation - STATE.rotRange;
  const rotMax = STATE.rotation + STATE.rotRange;
  rotSlider.min   = rotMin.toFixed(1);
  rotSlider.max   = rotMax.toFixed(1);
  rotSlider.value = STATE.rotation.toFixed(1);
  // Adaptive step: finer control as range shrinks
  rotSlider.step  = Math.max(0.5, STATE.rotRange / 120).toFixed(1);

  // Stretch slider — centred on current stretch, clamped to [0.1, 5.0]
  const strMin = Math.max(0.1, STATE.stretch - STATE.stretchRange);
  const strMax = Math.min(5.0, STATE.stretch + STATE.stretchRange);
  strSlider.min   = strMin.toFixed(2);
  strSlider.max   = strMax.toFixed(2);
  strSlider.value = STATE.stretch.toFixed(2);
  strSlider.step  = Math.max(0.01, STATE.stretchRange / 90).toFixed(2);
}

/* =====================================================================
   CONTROLS (sliders)
   ===================================================================== */
function initControls() {
  const rotSlider = document.getElementById("rotation-slider");
  const strSlider = document.getElementById("stretch-slider");

  rotSlider.addEventListener("input", () => {
    if (STATE.sentenceResult) return; // frozen during result display
    STATE.rotation = parseFloat(rotSlider.value);
    render();
  });

  strSlider.addEventListener("input", () => {
    if (STATE.sentenceResult) return;
    STATE.stretch = parseFloat(strSlider.value);
    render();
  });
}

/* =====================================================================
   GAME FLOW
   ===================================================================== */

// Load the current sentence: build word vectors, reset focused blank
function loadSentence() {
  const poolIdx = currentPoolIdx();
  const sentDef = SENTENCE_POOL[poolIdx];

  STATE.currentBlankParams = sentDef.blanks.map((_, b) => buildBlankWordVecs(poolIdx, b));
  STATE.focusedBlank        = 0;
  STATE.sentenceResult      = null;
  STATE.currentRankings     = buildRankings(STATE.rotation, STATE.stretch);
}

// Called on first Enter press — predict all blanks at once and show result
function validateCurrentSentence() {
  if (STATE.gameOver || STATE.sentenceResult) return;

  // Snapshot rankings so word list stays frozen while result is shown
  const results = STATE.currentRankings.map(({ ranked }) => ({
    word:      ranked[0].word,
    isCorrect: ranked[0].origIdx === 0,  // correct word is always at origIdx 0
  }));

  // Count mistakes only in scored phase
  if (STATE.phase === "scored") {
    const wrong = results.filter(r => !r.isCorrect).length;
    STATE.mistakes   += wrong;
    STATE.totalBlanks += results.length;
  }

  // Shrink parameter ranges (applies to BOTH phases — models decreasing LR)
  STATE.rotRange    *= CFG.SHRINK_FACTOR;
  STATE.stretchRange *= CFG.SHRINK_FACTOR;
  updateSliderRanges();

  STATE.sentenceResult = results;
  render();
}

// Called on second Enter press (or after result) — advance to next sentence
function advanceToNext() {
  if (!STATE.sentenceResult) return;

  // Save to history
  STATE.sentenceHistory.push({
    poolIdx:      currentPoolIdx(),
    blankResults: STATE.sentenceResult,
  });

  STATE.phaseStep++;

  // Check phase boundary
  if (STATE.phase === "test" && STATE.phaseStep >= CFG.TEST_SENTENCES) {
    showTransitionModal();
    return;
  }

  if (STATE.phase === "scored" && STATE.phaseStep >= CFG.SCORED_SENTENCES) {
    STATE.gameOver = true;
    render();
    showEndModal();
    return;
  }

  // Load next sentence (parameters carry over — student fine-tunes)
  loadSentence();
  render();
}

// Transition from test → scored phase
function beginScoredPhase() {
  document.getElementById("modal-transition-overlay").classList.add("hidden");

  STATE.phase    = "scored";
  STATE.phaseStep = 0;

  // Reset parameter ranges to maximum
  STATE.rotRange    = CFG.INITIAL_ROT_RANGE;
  STATE.stretchRange = CFG.INITIAL_STR_RANGE;

  // Random init for first scored sentence
  STATE.rotation = (Math.random() * 2 - 1) * 80;          // ±80°
  STATE.stretch  = 0.65 + Math.random() * 0.70;           // 0.65–1.35

  updateSliderRanges();
  loadSentence();
  render();
}

/* =====================================================================
   KEYBOARD
   ===================================================================== */
function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const overlay    = document.getElementById("modal-overlay");
    const endOverlay = document.getElementById("modal-end-overlay");
    const transOver  = document.getElementById("modal-transition-overlay");
    if (!overlay.classList.contains("hidden"))    return;
    if (!endOverlay.classList.contains("hidden")) return;
    if (!transOver.classList.contains("hidden"))  return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (STATE.gameOver) return;

    if (STATE.sentenceResult) {
      advanceToNext();
    } else {
      validateCurrentSentence();
    }
  });
}

/* =====================================================================
   MODALS
   ===================================================================== */
function showTransitionModal() {
  applyTranslations(); // re-sync modal text
  document.getElementById("modal-transition-overlay").classList.remove("hidden");
}

function showEndModal() {
  const lang = STATE.lang;
  const t    = T[lang];
  document.getElementById("end-title").textContent = t.endTitle;
  document.getElementById("end-body").textContent  = t.endBody(STATE.mistakes, STATE.totalBlanks);
  document.getElementById("modal-end-overlay").classList.remove("hidden");
}

function showResetModal() {
  document.getElementById("modal-password").value = "";
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("modal-password").focus();
}

function hideResetModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

/* =====================================================================
   RESET
   ===================================================================== */
function resetGame() {
  STATE.phase             = "test";
  STATE.phaseStep         = 0;
  STATE.mistakes          = 0;
  STATE.totalBlanks       = 0;
  STATE.sentenceHistory   = [];
  STATE.sentenceResult    = null;
  STATE.rotRange          = CFG.INITIAL_ROT_RANGE;
  STATE.stretchRange      = CFG.INITIAL_STR_RANGE;
  STATE.gameOver          = false;

  // Re-select and re-shuffle sentences
  selectSentences();

  // Random init for first test sentence
  STATE.rotation = (Math.random() * 2 - 1) * 80;
  STATE.stretch  = 0.65 + Math.random() * 0.70;

  updateSliderRanges();
  loadSentence();
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
      const inp = document.getElementById("modal-password");
      inp.style.borderColor = "#d32f2f";
      inp.value = "";
      setTimeout(() => { inp.style.borderColor = ""; }, 1200);
    }
  });

  document.getElementById("modal-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter")  document.getElementById("modal-confirm").click();
    if (e.key === "Escape") hideResetModal();
  });

  // Transition modal
  document.getElementById("transition-continue").addEventListener("click", beginScoredPhase);

  // End modal
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
  selectSentences();

  // Random init for first test sentence
  STATE.rotation = (Math.random() * 2 - 1) * 80;   // ±80°
  STATE.stretch  = 0.65 + Math.random() * 0.70;    // 0.65–1.35

  updateSliderRanges();
  loadSentence();

  initControls();
  initKeyboard();
  initReset();
  initLangToggle();
  applyTranslations();
  render();
}

document.addEventListener("DOMContentLoaded", init);
