# Comprendre l'IA — Jeu éducatif / Understand AI — Educational Game

An interactive educational game for middle-school students that helps them understand how an AI model transforms information and produces probabilities for possible next words.

---

## How to open locally

Simply open `index.html` in any modern web browser. No server, build tool, or installation is required.

```
open index.html
```

---

## How to deploy on GitHub Pages

1. Push the three files (`index.html`, `styles.css`, `app.js`) to a GitHub repository.
2. Go to **Settings → Pages**.
3. Set the source to the branch and folder containing these files (e.g. `main` / `root`).
4. GitHub Pages will publish the site at `https://<username>.github.io/<repo>/`.

---

## How the game works

The game presents **5 sentences**, each with **one missing word**. For each missing word:

1. You see the sentence with a blank (`___`).
2. A **2×2 matrix** (the "model") transforms an input vector.
3. A ranked list of **20 candidate words** is shown on the right.
4. You adjust the matrix using two controls:
   - **Rotation knob** — rotates the transformation.
   - **Stretch slider** — stretches the first axis.
5. As you move the controls, the matrix values update live, the transformed vector changes, and the word ranking changes continuously.
6. When the correct word reaches **rank 1**, press **Enter** to validate.
7. If you validate a wrong word, you score **one mistake**.
8. The game ends after all 5 steps. **Lower score is better** (0 = perfect).

---

## Layout structure

The interface uses a **3-column CSS Grid** layout:

| Column | Content |
|--------|---------|
| **Left** | Current sentence, progress dots, short instruction |
| **Center** | Model playground: controls, input space (SVG), matrix card, transformed space (SVG) |
| **Right** | Ranked list of 20 candidate words |

A **fixed top bar** shows the app title, progress, language toggle, score, and reset button.  
A **fixed bottom strip** shows short hints and the Enter instruction.

All panels use `box-sizing: border-box`, `min-width: 0`, and `overflow-wrap: break-word` to prevent text overflow and layout breakage.

---

## How the matrix/model works

The model is a **2×2 linear transformation matrix** built from two parameters:

```
M = R(θ) · S(s)
```

where:
- `R(θ)` is a 2D rotation matrix by angle θ (from the Rotation control).
- `S(s)` is a stretch matrix scaling the first axis by `s` (from the Stretch control).

This gives:
```
M = [[s·cos θ,  -sin θ],
     [s·sin θ,   cos θ]]
```

For each step:
1. A fixed **input vector** represents the current sentence context.
2. The student's matrix **M** transforms this vector: `t = M · v`.
3. Each of the 20 candidate words has a fixed **word vector** and **bias**.
4. **Logits** are computed as: `logit_i = dot(t, word_vec_i) + bias_i`.
5. **Softmax** converts logits to probabilities.
6. Words are ranked by probability (highest first).

The correct word's vector is aligned with a specific direction. The student must rotate and stretch the matrix until the transformed vector points in that direction, making the correct word's logit the highest.

---

## Scoring

- Each time you press Enter, the **top-ranked word** is selected.
- If it is the correct word → no penalty.
- If it is wrong → **+1 mistake**.
- Final score = total mistakes across all 5 steps.
- **Lower is better**. A perfect game scores 0.

---

## FR / EN language toggle

- Default language is **French (FR)**.
- Click the **🇬🇧 EN** button in the top bar to switch to English.
- Click **🇫🇷 FR** to switch back.
- The toggle translates all interface text, instructions, sentences, candidate words, and score messages.

---

## Reset password

The **↺ Reset** button asks for an administrator password before restarting the game.

**Password: `Admin0000`**

If the wrong password is entered, nothing happens and the game continues normally.
