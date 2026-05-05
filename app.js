/* ========================= config ========================= */
const CFG = {
  temp: 0.9,
  svg: { w: 1200, h: 560 },
  model: { angle: 0, stretch: 0 },
  resetPassword: 'Admin0000'
};

/* ========================= translations ========================= */
const T = {
  fr: {
    title: 'Vector Lab — Le jeu des modèles', subtitle: 'Tourne et module le modèle pour guider le mot prédit.',
    sentenceTitle: 'Phrase en cours', commit: 'Valider le mot #1 (Entrée)', knob: 'Rotation du modèle', slider: 'Étirement / modulation',
    instruction: 'Objectif: faire monter le bon mot au rang 1 puis valider.',
    lower: 'Score plus bas = meilleur', reset: 'Réinitialiser', finalTitle: 'Activité terminée !',
    finalBody: (m) => `Score final: ${m} erreurs. En IA, on juge souvent la qualité par la gravité des erreurs.` ,
    progress: (i,n,b) => `Phrase ${i+1}/${n} • Blanc ${b+1}/3`, mistakes: (m) => `Erreurs: ${m}`,
    langBtn: 'FR / GB', wrongHint: 'Pas encore — ajuste le modèle.', enterLabel: 'Valider'
  },
  en: {
    title: 'Vector Lab — The model game', subtitle: 'Turn and modulate the model to steer the predicted word.',
    sentenceTitle: 'Current sentence', commit: 'Commit word #1 (Enter)', knob: 'Model rotation', slider: 'Stretch / modulation',
    instruction: 'Goal: move the correct word to rank 1, then commit.',
    lower: 'Lower score = better', reset: 'Reset', finalTitle: 'Activity complete!',
    finalBody: (m) => `Final score: ${m} mistakes. In AI, systems are often judged by how bad their errors are.` ,
    progress: (i,n,b) => `Sentence ${i+1}/${n} • Blank ${b+1}/3`, mistakes: (m) => `Mistakes: ${m}`,
    langBtn: 'FR / GB', wrongHint: 'Not yet — tune the model.', enterLabel: 'Commit'
  }
};

/* ========================= content data ========================= */
const CONTENT = [
  mkSentence(
    ['When we heat ice, it slowly turns into ', ' and then into ', ', while energy keeps moving.'],
    ['water', 'steam', 'around']
  ),
  mkSentence(['A healthy lunch can include ', ', ', ', and clean water.'], ['vegetables', 'fruit', 'grains']),
  mkSentence(['At night, many animals use ', ' and ', ' to find food.'], ['hearing', 'smell', 'quiet']),
  mkSentence(['In coding class, we test, find ', ', then write a ', ' fix.'], ['bugs', 'small', 'clear']),
  mkSentence(['A language model guesses the next ', ' from context and learns from ', '.'], ['word', 'errors', 'feedback'])
];

function mkSentence(partsEn, correctEn) {
  const dict = {
    water:['eau'], steam:['vapeur'], around:['autour'], vegetables:['légumes'], fruit:['fruits'], grains:['céréales'], hearing:['ouïe'], smell:['odorat'], quiet:['silence'], bugs:['bugs'], small:['petite'], clear:['claire'], word:['mot'], errors:['erreurs'], feedback:['retour']
  };
  const partsFr = partsEn.map(p=>p
    .replace('When we heat ice, it slowly turns into ','Quand on chauffe la glace, elle devient lentement ')
    .replace(' and then into ',' puis ')
    .replace(', while energy keeps moving.',' tandis que l\'énergie circule.')
    .replace('A healthy lunch can include ','Un déjeuner sain peut inclure ')
    .replace(', and clean water.',' et de l\'eau propre.')
    .replace('At night, many animals use ','La nuit, de nombreux animaux utilisent ')
    .replace(' to find food.',' pour trouver de la nourriture.')
    .replace('In coding class, we test, find ','En cours de code, on teste, on trouve des ')
    .replace(', then write a ',' puis on écrit une correction ')
    .replace(' fix.','.')
    .replace('A language model guesses the next ','Un modèle de langage prédit le prochain ')
    .replace(' from context and learns from ',' selon le contexte et apprend grâce aux ')
    .replace('.','.')
  );
  const correctFr = correctEn.map(w => dict[w][0]);
  const makeCandidates = (right) => {
    const filler = ['banana','galaxy','pencil','pixel','robot','turtle','pizza','rainbow','marshmallow','volcano','school','science','music','book','cloud','biscuit','meteor','panda','comet'];
    const set = [right, ...filler.filter(x => x !== right)].slice(0,20);
    return set;
  };
  return {
    parts: { en: partsEn, fr: partsFr },
    blanks: correctEn.map((w, i) => ({
      correct: { en: w, fr: correctFr[i] },
      candidates: {
        en: makeCandidates(w),
        fr: makeCandidates(correctFr[i]).map(x=>x
          .replace('banana','banane').replace('galaxy','galaxie').replace('pencil','crayon').replace('pixel','pixel').replace('robot','robot')
          .replace('turtle','tortue').replace('pizza','pizza').replace('rainbow','arc-en-ciel').replace('marshmallow','guimauve').replace('volcano','volcan')
          .replace('school','école').replace('science','science').replace('music','musique').replace('book','livre').replace('cloud','nuage')
          .replace('biscuit','biscuit').replace('meteor','météore').replace('panda','panda').replace('comet','comète'))
      }
    }))
  };
}

/* ========================= state ========================= */
const state = { lang: 'fr', sIdx: 0, bIdx: 0, mistakes: 0, angle: 0, stretch: 0, complete: false };

/* ========================= math ========================= */
const v2 = (x,y)=>({x,y});
const mulMatVec=(m,v)=>v2(m.a*v.x+m.b*v.y,m.c*v.x+m.d*v.y);
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const softmax=(arr)=>{const mx=Math.max(...arr);const ex=arr.map(x=>Math.exp((x-mx)/CFG.temp));const s=ex.reduce((p,c)=>p+c,0);return ex.map(e=>e/s);} ;
function modelMatrix(angle, stretch){
  const c=Math.cos(angle), s=Math.sin(angle), k=Math.exp(stretch*0.8);
  const sx=1.25*k, sy=1.25/k;
  return {a:c*sx,b:-s*sy,c:s*sx,d:c*sy};
}

/* ========================= model ========================= */
function baseVector(sentenceIndex, blankIndex){
  return [v2(0.9,0.4),v2(0.3,1.0),v2(-0.8,0.6),v2(0.7,-0.9),v2(-0.5,-0.8)][(sentenceIndex*3+blankIndex)%5];
}
function wordVec(word){
  let h=0; for(const ch of word) h=(h*31+ch.charCodeAt(0))%9973;
  const a=(h%360)*Math.PI/180, r=0.6+((h%37)/37)*1.2;
  return v2(Math.cos(a)*r, Math.sin(a)*r);
}
function currentRanking(){
  const sent=CONTENT[state.sIdx], blank=sent.blanks[state.bIdx];
  const words=blank.candidates[state.lang];
  const base=baseVector(state.sIdx,state.bIdx), out=mulMatVec(modelMatrix(state.angle,state.stretch),base);
  const logits=words.map((w,i)=>dot(out,wordVec(w))+ (w===blank.correct[state.lang]?0.55:0) - i*0.01);
  const probs=softmax(logits);
  return words.map((w,i)=>({w,p:probs[i],l:logits[i]})).sort((a,b)=>b.p-a.p);
}

/* ========================= gradient hint logic ========================= */
function hintDirection(){
  const blank=CONTENT[state.sIdx].blanks[state.bIdx];
  const goal=blank.correct[state.lang];
  const cur=currentRanking();
  const curP=cur.find(x=>x.w===goal).p;
  const epsA=0.05, epsS=0.05;
  const oldA=state.angle, oldS=state.stretch;
  state.angle+=epsA; const pA=currentRanking().find(x=>x.w===goal).p; state.angle=oldA;
  state.stretch+=epsS; const pS=currentRanking().find(x=>x.w===goal).p; state.stretch=oldS;
  return { da: pA-curP, ds: pS-curP };
}

/* ========================= svg rendering ========================= */
const svg=document.getElementById('pipelineSvg');
function renderSvg(){
  const rank=currentRanking();
  const base=baseVector(state.sIdx,state.bIdx), M=modelMatrix(state.angle,state.stretch), out=mulMatVec(M,base), hint=hintDirection();
  const bar=rank.slice(0,20).map((r,i)=>`
    <g transform="translate(900,${80+i*22})">
      <rect width="230" height="18" rx="9" fill="#203656" />
      <rect width="${230*r.p*2.5}" height="18" rx="9" fill="${i===0?'#7ce3a9':'#59bbff'}" />
      <text x="8" y="13" font-size="12" fill="#fff">${i+1}. ${r.w}</text>
    </g>`).join('');
  const matrixText = `${M.a.toFixed(2)}  ${M.b.toFixed(2)}\n${M.c.toFixed(2)}  ${M.d.toFixed(2)}`;
  svg.innerHTML=`
  <defs><marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><polygon points="0,0 10,5 0,10" fill="#ffcc66"/></marker></defs>
  <rect x="24" y="70" width="240" height="100" rx="16" fill="#1d3658"/><text x="40" y="112" fill="#d8e6ff" font-size="18">Prefix</text>
  <text x="40" y="140" fill="#fff" font-size="14">${escapeHtml(getPrefix())}</text>
  <line x1="270" y1="120" x2="390" y2="120" stroke="#ffcc66" stroke-width="6" marker-end="url(#arr)"/>
  <rect x="400" y="40" width="220" height="180" rx="16" fill="#17304f"/>
  <text x="416" y="66" fill="#fff">Vector space (input)</text>
  ${vecPanel(430,130,base,'#66d6ff')}
  <line x1="624" y1="120" x2="760" y2="120" stroke="#ffcc66" stroke-width="6" marker-end="url(#arr)"/>
  <rect x="760" y="50" width="130" height="140" rx="16" fill="#253f66"/>
  <text x="776" y="74" fill="#fff">Model</text>
  <text x="780" y="102" fill="#c9dbff" font-size="14">2x2 matrix</text>
  <text x="778" y="130" fill="#fff" font-size="14" style="white-space:pre">${matrixText}</text>
  <line x1="894" y1="120" x2="1010" y2="120" stroke="#ffcc66" stroke-width="6" marker-end="url(#arr)"/>
  <rect x="640" y="240" width="260" height="180" rx="16" fill="#17304f"/>
  <text x="656" y="266" fill="#fff">Vector space (output)</text>
  ${vecPanel(770,330,out,'#7ce3a9')}
  <rect x="900" y="40" width="270" height="472" rx="16" fill="#152946"/>
  <text x="918" y="66" fill="#fff">Word probabilities (top → bottom)</text>
  ${bar}
  <path d="M720,490 q40,-40 80,0" stroke="#ff6f7e" stroke-width="4" fill="none" marker-end="url(#arr)"/>
  <text x="680" y="518" fill="#ff9eaa" font-size="13">Knob hint: ${hint.da>=0?'+':'-'} ${(Math.abs(hint.da)*100).toFixed(1)}</text>
  <path d="M900,520 q120,-20 200,0" stroke="#ff6f7e" stroke-width="4" fill="none" marker-end="url(#arr)"/>
  <text x="910" y="544" fill="#ff9eaa" font-size="13">Slider hint: ${hint.ds>=0?'+':'-'} ${(Math.abs(hint.ds)*100).toFixed(1)}</text>`;
}
function vecPanel(cx,cy,v,col){
  return `<line x1="${cx-70}" y1="${cy}" x2="${cx+70}" y2="${cy}" stroke="#375a83"/><line x1="${cx}" y1="${cy-70}" x2="${cx}" y2="${cy+70}" stroke="#375a83"/>
  <line x1="${cx}" y1="${cy}" x2="${cx+v.x*48}" y2="${cy-v.y*48}" stroke="${col}" stroke-width="7" marker-end="url(#arr)"/>`; }
function escapeHtml(s){return s.replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]));}

/* ========================= UI + scoring + language + reset ========================= */
const $=id=>document.getElementById(id);
function getPrefix(){const s=CONTENT[state.sIdx], p=s.parts[state.lang]; const completed=[]; for(let i=0;i<state.bIdx;i++) completed.push(s.blanks[i].correct[state.lang]); return p[0]+completed.map((w,i)=>w+p[i+1]).join('')+(state.bIdx===0?'':'')+`___`;}
function renderText(){ const t=T[state.lang], s=CONTENT[state.sIdx];
  $('title').textContent=t.title; $('subtitle').textContent=t.subtitle; $('sentenceTitle').textContent=t.sentenceTitle;
  $('instructionText').textContent=t.instruction; $('commitBtn').textContent=t.commit; $('knobLabel').textContent=t.knob; $('sliderLabel').textContent=t.slider;
  $('progressLabel').textContent=t.progress(state.sIdx,CONTENT.length,state.bIdx); $('mistakesLabel').textContent=t.mistakes(state.mistakes); $('lowerIsBetter').textContent=t.lower;
  $('langToggle').textContent=t.langBtn; $('resetBtn').textContent=t.reset; $('sentenceDisplay').textContent=getPrefix();
  $('knobValue').textContent=`${(state.angle*180/Math.PI).toFixed(1)}°`; $('sliderValue').textContent=state.stretch.toFixed(2);
  const top=currentRanking()[0]; $('commitBtn').setAttribute('title', `${t.enterLabel}: ${top.w}`);
}
function commitTop(){ if(state.complete) return; const top=currentRanking()[0].w, correct=CONTENT[state.sIdx].blanks[state.bIdx].correct[state.lang];
  if(top!==correct) state.mistakes++;
  if(top===correct){ state.bIdx++; if(state.bIdx>=3){ state.sIdx++; state.bIdx=0; state.angle=0; state.stretch=0; }
    if(state.sIdx>=CONTENT.length){ state.complete=true; const t=T[state.lang]; $('finalTitle').textContent=t.finalTitle; $('finalBody').textContent=t.finalBody(state.mistakes); $('finalOverlay').classList.remove('hidden'); }}
  update();
}
function resetAll(){ const pwd=prompt('Password?'); if(pwd!==CFG.resetPassword) return; Object.assign(state,{lang:state.lang,sIdx:0,bIdx:0,mistakes:0,angle:0,stretch:0,complete:false}); $('finalOverlay').classList.add('hidden'); update(); }
function update(){ renderText(); renderSvg(); }

/* ========================= controls ========================= */
const knobWrap=$('knobWrap'), knobNeedle=$('knobNeedle'), knobProgress=document.querySelector('.knob-progress');
let dragging=false;
knobWrap.addEventListener('pointerdown', e=>{dragging=true; knobWrap.setPointerCapture(e.pointerId);});
knobWrap.addEventListener('pointermove', e=>{ if(!dragging) return; const r=knobWrap.getBoundingClientRect(); const cx=r.left+r.width/2, cy=r.top+r.height/2; state.angle=Math.atan2(e.clientY-cy,e.clientX-cx)+Math.PI/2; syncKnob(); update();});
knobWrap.addEventListener('pointerup', ()=>dragging=false);
knobWrap.addEventListener('keydown', e=>{ if(e.key==='ArrowLeft') state.angle-=0.04; if(e.key==='ArrowRight') state.angle+=0.04; syncKnob(); update();});
function syncKnob(){ const deg=state.angle*180/Math.PI; knobNeedle.setAttribute('transform',`rotate(${deg} 80 80)`); const offset=195-(deg/360)*390; knobProgress.style.strokeDashoffset=String(offset); knobWrap.setAttribute('aria-valuenow',deg.toFixed(1)); }
$('stretchSlider').addEventListener('input',e=>{state.stretch=parseFloat(e.target.value); update();});
$('langToggle').addEventListener('click',()=>{state.lang=state.lang==='fr'?'en':'fr'; update();});
$('commitBtn').addEventListener('click',commitTop);
$('resetBtn').addEventListener('click',resetAll);
window.addEventListener('keydown',e=>{if(e.key==='Enter') commitTop();});

/* ========================= init ========================= */
syncKnob(); update();
