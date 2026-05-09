# Comprendre l'IA — Jeu éducatif / Understand AI — Educational Game

Interactive browser game to teach how prediction becomes harder as model constraints tighten during training.

---

## Open locally

No build or install needed:

```bash
open index.html
```

---

## Current gameplay (implemented)

- **10 played sentences total**
  - **2 training sentences** (not counted in final score)
  - **8 scored sentences** (counted)
- Sentences are drawn from a **pool of 30 sentences**.
- Each sentence contains **multiple blanks** (currently 2).
- Pressing **Enter** runs prediction for **all blanks at once**.
- If alignment is slightly wrong, predicted words can be wrong/strange, showing prediction difficulty.
- Controls:
  - **Rotation**
  - **Stretch**
- After each prediction, the allowed slider ranges **shrink** to mimic reduced parameter flexibility during training.
- After the 2 training sentences, the app switches to scored mode and **resets parameter ranges** before the 8 scored sentences.

---

## Scoring

- Only the **8 scored sentences** affect score.
- For each scored prediction, each wrong blank increments mistakes by 1.
- Lower is better; 0 is perfect.

---

## Interface notes

- Left panel: current sentence, per-sentence result, progress.
- Center panel: matrix controls + vector visualizations.
- Right panel: ranked candidate list for the selected blank tab.
- Top bar: phase badge (training/scored), progress, score, language toggle, reset.
- Enter is two-step per sentence:
  1. Show prediction result
  2. Advance to next sentence

---

## FR / EN support

The language toggle translates UI labels, instructions, modal text, and sentence/word content.

---

## Reset

Reset requires admin password:

`Admin0000`
