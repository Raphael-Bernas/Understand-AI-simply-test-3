'use strict';

/*
  File map:
  - CONFIG: visual constants and model ranges
  - CONTENT: five sentence challenges, each blank with exactly 20 candidates
  - I18N: interface translations
  - STATE: current language, controls, progress, score
  - LAYOUT: named SVG regions used by the renderer
  - MATH / PROBABILITY / HINTS: vector model
  - RENDERING / CONTROLS / SCORING / LANGUAGE / RESET / INIT
*/

const CONFIG = {
  svg: { width: 1200, height: 620 },
  softmaxTemperature: 0.2,
  candidateVectorRadius: 1,
  hintStep: { rotation: 4, stretch: 0.04 },
  password: 'Admin0000'
};

const I18N = {
  fr: {
    eyebrow: 'Jeu interactif IA',
    title: 'Transforme les idées en probabilités de mots',
    subtitle: 'Tourne et étire le modèle pour placer le bon mot en tête, puis appuie sur Entrée.',
    reset: 'Réessayer',
    diagramTitle: 'Pipeline visuel',
    diagramHelp: 'Un seul modèle transforme le vecteur de la phrase en scores de mots.',
    scoreLabel: 'Erreurs',
    modelControls: 'Contrôles du modèle',
    tuneTitle: 'Ajuste la transformation',
    rotation: 'Rotation',
    stretch: 'Étirement',
    howToPlayTitle: 'Mission',
    instructions: 'Change le modèle jusqu’à ce que le mot correct soit premier. Entrée choisit le mot du haut.',
    sentence: 'Phrase',
    inputVector: 'Vecteur phrase',
    model: 'Modèle',
    matrix: 'Matrice 2×2',
    outputVector: 'Vecteur transformé',
    probabilities: 'Probabilités des mots',
    topWord: 'Mot choisi',
    correct: 'Correct ! Le mot rejoint la phrase.',
    wrong: 'Pas encore : le premier mot est faux. Essaie de transformer autrement.',
    done: 'Bravo ! Score final : {score} erreur(s). Plus le score est bas, mieux le modèle a été réglé.',
    enter: 'Appuie sur Entrée pour choisir le mot le plus probable.',
    round: 'Trou {current}/{total}',
    rotateMoreCw: 'Indice : tourne un peu ↻ pour aider le bon mot.',
    rotateMoreCcw: 'Indice : tourne un peu ↺ pour aider le bon mot.',
    rotateGood: 'Rotation presque idéale ✓',
    stretchMore: 'Indice : étire davantage →',
    stretchLess: 'Indice : réduis l’étirement ←',
    stretchGood: 'Étirement presque idéal ✓',
    resetPrompt: 'Mot de passe pour réinitialiser :',
    resetDenied: 'Mot de passe incorrect.'
  },
  en: {
    eyebrow: 'Interactive AI game',
    title: 'Turn ideas into word probabilities',
    subtitle: 'Rotate and stretch the model to move the right word to the top, then press Enter.',
    reset: 'Retry',
    diagramTitle: 'Visual pipeline',
    diagramHelp: 'One model transforms the sentence vector into word scores.',
    scoreLabel: 'Mistakes',
    modelControls: 'Model controls',
    tuneTitle: 'Tune the transformation',
    rotation: 'Rotation',
    stretch: 'Stretch',
    howToPlayTitle: 'Mission',
    instructions: 'Change the model until the correct word is first. Enter chooses the top word.',
    sentence: 'Sentence',
    inputVector: 'Sentence vector',
    model: 'Model',
    matrix: '2×2 matrix',
    outputVector: 'Transformed vector',
    probabilities: 'Word probabilities',
    topWord: 'Chosen word',
    correct: 'Correct! The word joins the sentence.',
    wrong: 'Not yet: the top word is wrong. Try another transformation.',
    done: 'Great job! Final score: {score} mistake(s). Lower score means the model was tuned better.',
    enter: 'Press Enter to choose the most likely word.',
    round: 'Blank {current}/{total}',
    rotateMoreCw: 'Hint: rotate a little ↻ to help the right word.',
    rotateMoreCcw: 'Hint: rotate a little ↺ to help the right word.',
    rotateGood: 'Rotation is almost ideal ✓',
    stretchMore: 'Hint: stretch more →',
    stretchLess: 'Hint: shrink the stretch ←',
    stretchGood: 'Stretch is almost ideal ✓',
    resetPrompt: 'Reset password:',
    resetDenied: 'Incorrect password.'
  }
};

const CONTENT = [
  {
    blanks: [
      makeBlank('Le matin, le soleil se lève à l’', 'In the morning, the sun rises in the', 'est', 'east', ['ouest','nord','sud','ciel','jardin','soir','lac','nuage','train','livre','pain','vent','école','forêt','chat','robot','orange','neige','mer'], ['west','north','south','sky','garden','evening','lake','cloud','train','book','bread','wind','school','forest','cat','robot','orange','snow','sea'], 24, 1.35),
      makeBlank('Le matin, le soleil se lève à l’est et éclaire la ', 'In the morning, the sun rises in the east and lights the', 'maison', 'house', ['voiture','montagne','chaussette','planète','rue','table','lampe','grotte','rivière','fusée','porte','fenêtre','pelouse','cloche','île','pomme','tasse','chaise','horloge'], ['car','mountain','sock','planet','street','table','lamp','cave','river','rocket','door','window','lawn','bell','island','apple','cup','chair','clock'], -38, 0.82)
    ]
  },
  {
    blanks: [
      makeBlank('Pour faire du pain, le boulanger mélange de la ', 'To make bread, the baker mixes', 'farine', 'flour', ['peinture','pluie','musique','poussière','glace','laine','terre','lumière','colle','soupe','ficelle','craie','menthe','vapeur','métal','papier','herbe','mousse','étoile'], ['paint','rain','music','dust','ice','wool','soil','light','glue','soup','string','chalk','mint','steam','metal','paper','grass','foam','star'], 82, 1.76),
      makeBlank('Pour faire du pain, le boulanger mélange de la farine avec de l’', 'To make bread, the baker mixes flour with', 'eau', 'water', ['huile','sable','encre','coton','fromage','sel','vent','miel','lait','cire','jus','riz','feu','boue','air','thé','sirop','neige','poudre'], ['oil','sand','ink','cotton','cheese','salt','wind','honey','milk','wax','juice','rice','fire','mud','air','tea','syrup','snow','powder'], 135, 0.62)
    ]
  },
  {
    blanks: [
      makeBlank('Un poisson respire sous l’eau grâce à ses ', 'A fish breathes underwater with its', 'branchies', 'gills', ['ailes','pattes','lunettes','racines','roues','antennes','nageoires','plumes','clés','poches','cornes','feuilles','pinces','moteurs','dents','sabots','écailles','oreilles','cordes'], ['wings','legs','glasses','roots','wheels','antennae','fins','feathers','keys','pockets','horns','leaves','claws','engines','teeth','hooves','scales','ears','strings'], -112, 1.44),
      makeBlank('Un poisson respire sous l’eau grâce à ses branchies et nage avec ses ', 'A fish breathes underwater with its gills and swims with its', 'nageoires', 'fins', ['ailes','mains','roues','feuilles','bottes','pinces','antennes','écailles','sabots','doigts','plumes','voiles','rames','cornes','pattes','ressorts','griffes','oreilles','moteurs'], ['wings','hands','wheels','leaves','boots','claws','antennae','scales','hooves','fingers','feathers','sails','oars','horns','legs','springs','talons','ears','engines'], -64, 0.7)
    ]
  },
  {
    blanks: [
      makeBlank('Quand il fait froid, on met un ', 'When it is cold, we put on a', 'manteau', 'coat', ['maillot','chapeau','cartable','parapluie','short','gant','costume','tablier','pyjama','casque','foulard','pull','kimono','chausson','masque','sandale','robe','ceinture','uniforme'], ['swimsuit','hat','schoolbag','umbrella','shorts','glove','suit','apron','pajamas','helmet','scarf','sweater','kimono','slipper','mask','sandal','dress','belt','uniform'], 170, 1.22),
      makeBlank('Quand il fait froid, on met un manteau et des ', 'When it is cold, we put on a coat and', 'gants', 'gloves', ['chaussettes','lunettes','sandales','bottes','écharpes','casques','chemises','pantalons','bijoux','cravates','couronnes','palmes','mitaines','robes','capuches','sacs','ceintures','masques','chapeaux'], ['socks','glasses','sandals','boots','scarves','helmets','shirts','pants','jewels','ties','crowns','flippers','mittens','dresses','hoods','bags','belts','masks','hats'], 45, 0.52)
    ]
  },
  {
    blanks: [
      makeBlank('Pour résoudre un problème, une IA compare plusieurs ', 'To solve a problem, an AI compares several', 'options', 'options', ['couleurs','nuages','ballons','recettes','chaussures','histoires','routes','sons','formes','cartes','animaux','images','phrases','idées','nombres','signaux','objets','outils','indices'], ['colors','clouds','balloons','recipes','shoes','stories','roads','sounds','shapes','maps','animals','pictures','sentences','ideas','numbers','signals','objects','tools','clues'], -10, 1.92),
      makeBlank('Pour résoudre un problème, une IA compare plusieurs options puis choisit la plus ', 'To solve a problem, an AI compares several options and chooses the most', 'probable', 'probable', ['rapide','verte','bruyante','ronde','ancienne','sucrée','lourde','petite','fragile','calme','lumineuse','utile','logique','étrange','drôle','simple','haute','chaude','jolie'], ['fast','green','noisy','round','old','sweet','heavy','small','fragile','quiet','bright','useful','logical','strange','funny','simple','tall','warm','pretty'], 108, 1.08)
    ]
  }
];

function makeBlank(prefixFr, prefixEn, correctFr, correctEn, distractorsFr, distractorsEn, theta, stretch) {
  const fr = [correctFr, ...distractorsFr];
  const en = [correctEn, ...distractorsEn];
  if (fr.length !== 20 || en.length !== 20) throw new Error('Each blank must have exactly 20 candidates.');
  return { prefix: { fr: prefixFr, en: prefixEn }, candidates: { fr, en }, correctIndex: 0, target: { theta, stretch } };
}

const STATE = {
  lang: 'fr',
  sentenceIndex: 0,
  blankIndex: 0,
  mistakes: 0,
  rotation: 0,
  stretch: 1,
  feedback: '',
  finished: false
};

const LAYOUT = {
  sentence: { x: 42, y: 74, w: 270, h: 132 },
  input: { x: 376, y: 78, w: 126, h: 126, cx: 439, cy: 141, r: 46 },
  matrix: { x: 560, y: 62, w: 162, h: 172 },
  output: { x: 790, y: 78, w: 126, h: 126, cx: 853, cy: 141, r: 46 },
  probs: { x: 930, y: 36, w: 228, h: 520 },
  footer: { x: 44, y: 490, w: 830, h: 86 },
  arrows: [
    { from: [318, 140], to: [368, 140] },
    { from: [506, 140], to: [552, 140] },
    { from: [728, 140], to: [782, 140] },
    { from: [914, 140], to: [928, 140] }
  ]
};

const els = {};

function t(key, replacements = {}) {
  let text = I18N[STATE.lang][key] || key;
  Object.entries(replacements).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
  return text;
}

function currentBlank() {
  return CONTENT[STATE.sentenceIndex]?.blanks[STATE.blankIndex];
}

function totalBlanks() {
  return CONTENT.reduce((sum, sentence) => sum + sentence.blanks.length, 0);
}

function completedBlankCount() {
  return CONTENT.slice(0, STATE.sentenceIndex).reduce((sum, sentence) => sum + sentence.blanks.length, 0) + STATE.blankIndex + 1;
}

function sentenceVector(blank = currentBlank()) {
  const text = blank.prefix[STATE.lang];
  let a = 0;
  let b = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    a += Math.sin(code * 0.19 + i * 0.31);
    b += Math.cos(code * 0.13 - i * 0.17);
  }
  return normalize([a || 1, b || 1]);
}

function normalize(v) {
  const mag = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / mag, v[1] / mag];
}

function matrixFromControls(rotation = STATE.rotation, stretch = STATE.stretch) {
  const radians = rotation * Math.PI / 180;
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return [
    [c * stretch, -s / stretch],
    [s * stretch, c / stretch]
  ];
}

function transformVector(v, matrix = matrixFromControls()) {
  return [
    matrix[0][0] * v[0] + matrix[0][1] * v[1],
    matrix[1][0] * v[0] + matrix[1][1] * v[1]
  ];
}

function candidateVectors(blank = currentBlank()) {
  const base = transformVector(sentenceVector(blank), matrixFromControls(blank.target.theta, blank.target.stretch));
  const correct = normalize(base);
  return blank.candidates.en.map((_, index) => {
    if (index === blank.correctIndex) return correct;
    const angle = ((index * 137.5 + blank.target.theta * 1.7) % 360) * Math.PI / 180;
    const radial = 0.74 + (index % 5) * 0.09;
    return normalize([
      Math.cos(angle) * radial + correct[1] * 0.2,
      Math.sin(angle) * radial - correct[0] * 0.2
    ]);
  });
}

function probabilities(rotation = STATE.rotation, stretch = STATE.stretch) {
  const blank = currentBlank();
  const output = transformVector(sentenceVector(blank), matrixFromControls(rotation, stretch));
  const outputUnit = normalize(output);
  const vectors = candidateVectors(blank);
  const scores = vectors.map((v, index) => {
    const dot = outputUnit[0] * v[0] + outputUnit[1] * v[1];
    const penalty = index === blank.correctIndex ? 0.08 : 0;
    return (dot + penalty) / CONFIG.softmaxTemperature;
  });
  const max = Math.max(...scores);
  const exp = scores.map(score => Math.exp(score - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((value, index) => ({
    index,
    word: blank.candidates[STATE.lang][index],
    probability: value / sum,
    correct: index === blank.correctIndex
  })).sort((a, b) => b.probability - a.probability);
}

function correctnessMargin(rotation = STATE.rotation, stretch = STATE.stretch) {
  const ranked = probabilities(rotation, stretch);
  const correct = ranked.find(item => item.correct).probability;
  const bestWrong = ranked.find(item => !item.correct)?.probability || 0;
  return correct - bestWrong;
}

function gradientHints() {
  const now = correctnessMargin();
  const plusRot = correctnessMargin(STATE.rotation + CONFIG.hintStep.rotation, STATE.stretch);
  const minusRot = correctnessMargin(STATE.rotation - CONFIG.hintStep.rotation, STATE.stretch);
  const plusStretch = correctnessMargin(STATE.rotation, Math.min(2.25, STATE.stretch + CONFIG.hintStep.stretch));
  const minusStretch = correctnessMargin(STATE.rotation, Math.max(0.45, STATE.stretch - CONFIG.hintStep.stretch));
  return {
    rotation: Math.max(plusRot, minusRot) - now < 0.006 ? 'good' : plusRot > minusRot ? 'cw' : 'ccw',
    stretch: Math.max(plusStretch, minusStretch) - now < 0.006 ? 'good' : plusStretch > minusStretch ? 'more' : 'less'
  };
}

function svgEl(name, attrs = {}, text = '') {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
}

function drawWrappedText(group, text, x, y, width, className, lineHeight = 29) {
  const words = text.split(' ');
  const maxChars = Math.max(10, Math.floor(width / 13));
  const lines = [];
  let line = '';
  words.forEach(word => {
    const next = `${line} ${word}`.trim();
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, 4).forEach((part, i) => group.appendChild(svgEl('text', { x, y: y + i * lineHeight, class: className }, part)));
}

function render() {
  renderTranslations();
  renderControls();
  renderSvg();
  els.mistakeCount.textContent = STATE.mistakes;
}

function renderTranslations() {
  document.documentElement.lang = STATE.lang;
  document.querySelectorAll('[data-i18n]').forEach(node => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll('.lang-button').forEach(button => {
    const active = button.dataset.lang === STATE.lang;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderControls() {
  els.rotationRange.value = STATE.rotation;
  els.stretchRange.value = STATE.stretch;
  els.rotationValue.textContent = `${Math.round(STATE.rotation)}°`;
  els.stretchValue.textContent = `${STATE.stretch.toFixed(2)}×`;
  els.knobFace.style.transform = `rotate(${STATE.rotation}deg)`;
  const hints = gradientHints();
  els.rotationHint.textContent = hints.rotation === 'good' ? t('rotateGood') : hints.rotation === 'cw' ? t('rotateMoreCw') : t('rotateMoreCcw');
  els.stretchHint.textContent = hints.stretch === 'good' ? t('stretchGood') : hints.stretch === 'more' ? t('stretchMore') : t('stretchLess');
  els.instructionText.textContent = STATE.feedback || (STATE.finished ? t('done', { score: STATE.mistakes }) : t('instructions'));
}

function renderSvg() {
  const svg = els.pipelineSvg;
  svg.replaceChildren();
  const defs = svgEl('defs');
  defs.appendChild(svgEl('marker', { id: 'arrowHead', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '8', markerHeight: '8', orient: 'auto-start-reverse' }));
  defs.querySelector('marker').appendChild(svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#4059ff' }));
  svg.appendChild(defs);

  svg.appendChild(svgEl('rect', { x: 8, y: 8, width: 1184, height: 594, rx: 28, fill: '#fffdf2', opacity: '.72' }));
  LAYOUT.arrows.forEach(arrow => svg.appendChild(svgEl('line', { x1: arrow.from[0], y1: arrow.from[1], x2: arrow.to[0], y2: arrow.to[1], stroke: '#4059ff', 'stroke-width': 8, 'stroke-linecap': 'round', 'marker-end': 'url(#arrowHead)' })));
  drawSentence(svg);
  drawVector(svg, LAYOUT.input, t('inputVector'), sentenceVector(), '#34d7e8');
  drawMatrix(svg);
  drawVector(svg, LAYOUT.output, t('outputVector'), transformVector(sentenceVector()), '#ff5d8f');
  drawProbabilities(svg);
  drawFooter(svg);
}

function drawCard(svg, box, fill = '#ffffff') {
  svg.appendChild(svgEl('rect', { x: box.x, y: box.y, width: box.w, height: box.h, rx: 22, fill, stroke: '#17223d', 'stroke-width': 3, opacity: '.96' }));
}

function drawSentence(svg) {
  const box = LAYOUT.sentence;
  drawCard(svg, box, '#fff6cf');
  svg.appendChild(svgEl('text', { x: box.x + 22, y: box.y + 30, class: 'svg-label' }, `${t('sentence')} · ${t('round', { current: completedBlankCount(), total: totalBlanks() })}`));
  if (STATE.finished) {
    drawWrappedText(svg, t('done', { score: STATE.mistakes }), box.x + 22, box.y + 70, box.w - 42, 'svg-prefix', 26);
  } else {
    drawWrappedText(svg, `${currentBlank().prefix[STATE.lang]} ____`, box.x + 22, box.y + 70, box.w - 42, 'svg-prefix', 28);
  }
}

function drawVector(svg, box, title, vector, color) {
  drawCard(svg, box, '#ffffff');
  svg.appendChild(svgEl('text', { x: box.x + 8, y: box.y - 12, class: 'svg-label' }, title));
  svg.appendChild(svgEl('circle', { cx: box.cx, cy: box.cy, r: box.r, fill: '#eff7ff', stroke: '#17223d', 'stroke-width': 3 }));
  svg.appendChild(svgEl('line', { x1: box.cx - box.r, y1: box.cy, x2: box.cx + box.r, y2: box.cy, stroke: '#c4cade', 'stroke-width': 2 }));
  svg.appendChild(svgEl('line', { x1: box.cx, y1: box.cy + box.r, x2: box.cx, y2: box.cy - box.r, stroke: '#c4cade', 'stroke-width': 2 }));
  const scaled = normalize(vector);
  svg.appendChild(svgEl('line', { x1: box.cx, y1: box.cy, x2: box.cx + scaled[0] * 38, y2: box.cy - scaled[1] * 38, stroke: color, 'stroke-width': 8, 'stroke-linecap': 'round', 'marker-end': 'url(#arrowHead)' }));
  svg.appendChild(svgEl('text', { x: box.x + 22, y: box.y + box.h - 20, class: 'svg-number' }, `[${vector[0].toFixed(2)}, ${vector[1].toFixed(2)}]`));
}

function drawMatrix(svg) {
  const box = LAYOUT.matrix;
  const m = matrixFromControls();
  drawCard(svg, box, '#ffedb0');
  svg.appendChild(svgEl('text', { x: box.x + 36, y: box.y - 14, class: 'svg-label' }, t('model')));
  svg.appendChild(svgEl('text', { x: box.x + 36, y: box.y + 30, class: 'svg-small' }, t('matrix')));
  svg.appendChild(svgEl('path', { d: `M ${box.x + 28} ${box.y + 54} v 88 M ${box.x + box.w - 28} ${box.y + 54} v 88`, stroke: '#17223d', 'stroke-width': 5, 'stroke-linecap': 'round' }));
  const cells = [m[0][0], m[0][1], m[1][0], m[1][1]];
  const positions = [[box.x + 56, box.y + 84], [box.x + 108, box.y + 84], [box.x + 56, box.y + 124], [box.x + 108, box.y + 124]];
  cells.forEach((value, index) => svg.appendChild(svgEl('text', { x: positions[index][0], y: positions[index][1], class: 'svg-number', 'text-anchor': 'middle' }, value.toFixed(2))));
  svg.appendChild(svgEl('circle', { cx: box.x + box.w / 2, cy: box.y + box.h - 22, r: 11, fill: '#ff5d8f' }));
  svg.appendChild(svgEl('text', { x: box.x + box.w / 2 + 18, y: box.y + box.h - 16, class: 'svg-small' }, `${Math.round(STATE.rotation)}° · ${STATE.stretch.toFixed(2)}×`));
}

function drawProbabilities(svg) {
  const box = LAYOUT.probs;
  drawCard(svg, box, '#ffffff');
  svg.appendChild(svgEl('text', { x: box.x + 18, y: box.y + 34, class: 'svg-label' }, t('probabilities')));
  const ranked = STATE.finished ? [] : probabilities();
  ranked.slice(0, 10).forEach((item, row) => {
    const y = box.y + 62 + row * 42;
    const barW = Math.max(4, (box.w - 110) * item.probability * 2.6);
    svg.appendChild(svgEl('rect', { x: box.x + 16, y: y - 18, width: box.w - 32, height: 30, rx: 12, fill: row === 0 ? '#e9edff' : '#f3f1e8' }));
    svg.appendChild(svgEl('rect', { x: box.x + 20, y: y - 14, width: Math.min(box.w - 84, barW), height: 22, rx: 10, fill: item.correct ? '#45d483' : row === 0 ? '#ff9f1c' : '#34d7e8', opacity: row === 0 ? '1' : '.64' }));
    svg.appendChild(svgEl('text', { x: box.x + 28, y: y + 3, class: 'svg-word' }, `${row + 1}. ${item.word}`));
    svg.appendChild(svgEl('text', { x: box.x + box.w - 22, y: y + 3, class: 'svg-small', 'text-anchor': 'end' }, `${Math.round(item.probability * 100)}%`));
  });
}

function drawFooter(svg) {
  const box = LAYOUT.footer;
  const ranked = STATE.finished ? [] : probabilities();
  const top = ranked[0];
  svg.appendChild(svgEl('rect', { x: box.x, y: box.y, width: box.w, height: box.h, rx: 22, fill: '#17223d' }));
  svg.appendChild(svgEl('text', { x: box.x + 24, y: box.y + 34, class: 'svg-inverse' }, STATE.finished ? t('done', { score: STATE.mistakes }) : `${t('topWord')}: ${top.word}`));
  svg.appendChild(svgEl('text', { x: box.x + 24, y: box.y + 64, class: 'svg-inverse-small' }, STATE.feedback || t('enter')));
}

function chooseTopWord() {
  if (STATE.finished) return;
  const top = probabilities()[0];
  if (top.correct) {
    STATE.feedback = t('correct');
    advanceBlank();
  } else {
    STATE.mistakes += 1;
    STATE.feedback = t('wrong');
  }
  render();
}

function advanceBlank() {
  const sentence = CONTENT[STATE.sentenceIndex];
  if (STATE.blankIndex + 1 < sentence.blanks.length) {
    STATE.blankIndex += 1;
  } else if (STATE.sentenceIndex + 1 < CONTENT.length) {
    STATE.sentenceIndex += 1;
    STATE.blankIndex = 0;
  } else {
    STATE.finished = true;
    STATE.feedback = t('done', { score: STATE.mistakes });
  }
  if (!STATE.finished) {
    const target = currentBlank().target;
    STATE.rotation = clamp(target.theta - 62, -180, 180);
    STATE.stretch = clamp(target.stretch + (target.stretch > 1 ? -0.45 : 0.45), 0.45, 2.25);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetGame(requirePassword = true) {
  if (requirePassword) {
    const password = window.prompt(t('resetPrompt'));
    if (password !== CONFIG.password) {
      window.alert(t('resetDenied'));
      return;
    }
  }
  STATE.sentenceIndex = 0;
  STATE.blankIndex = 0;
  STATE.mistakes = 0;
  STATE.rotation = -42;
  STATE.stretch = 1.42;
  STATE.feedback = '';
  STATE.finished = false;
  render();
}

function wireControls() {
  els.rotationRange.addEventListener('input', event => {
    STATE.rotation = Number(event.target.value);
    STATE.feedback = '';
    render();
  });
  els.stretchRange.addEventListener('input', event => {
    STATE.stretch = Number(event.target.value);
    STATE.feedback = '';
    render();
  });
  document.querySelectorAll('.lang-button').forEach(button => {
    button.addEventListener('click', () => {
      STATE.lang = button.dataset.lang;
      STATE.feedback = '';
      render();
    });
  });
  els.resetButton.addEventListener('click', () => resetGame(true));
  window.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      chooseTopWord();
    }
  });
}

function init() {
  Object.assign(els, {
    pipelineSvg: document.getElementById('pipelineSvg'),
    mistakeCount: document.getElementById('mistakeCount'),
    rotationRange: document.getElementById('rotationRange'),
    stretchRange: document.getElementById('stretchRange'),
    rotationValue: document.getElementById('rotationValue'),
    stretchValue: document.getElementById('stretchValue'),
    knobFace: document.getElementById('knobFace'),
    rotationHint: document.getElementById('rotationHint'),
    stretchHint: document.getElementById('stretchHint'),
    instructionText: document.getElementById('instructionText'),
    resetButton: document.getElementById('resetButton')
  });
  wireControls();
  resetGame(false);
}

document.addEventListener('DOMContentLoaded', init);
