# Modèle de mots — jeu vectoriel

A static educational browser game for middle-school students. It shows a simple language-model pipeline:

**sentence prefix → vector representation → one visible 2×2 matrix → transformed vector → ranked word probabilities**

The default language is French, with a GB English toggle.

## Open locally

No build step is required.

1. Download or clone the repository.
2. Open `index.html` directly in a modern browser.

If you prefer a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy on GitHub Pages

This app is plain HTML/CSS/JavaScript, so GitHub Pages can serve it directly.

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Choose the branch to deploy, usually `main`.
4. Choose the repository root as the source folder.
5. Save and open the Pages URL when GitHub finishes publishing.

## How the game works

- There are 5 fixed sentence challenges.
- Each sentence has missing words.
- Each blank has exactly 20 candidate words.
- Exactly one candidate is correct.
- The student changes the model with two continuous controls:
  - a rotation knob;
  - a stretch/modulation slider.
- As the controls move, the matrix values, transformed vector, and word probabilities update continuously.
- Pressing **Enter** selects the highest-probability word.
- If the top word is correct, the game advances to the next blank.
- If the top word is wrong, one mistake is counted and the student keeps tuning the same blank.

## Layout system

The page uses two coordinated layout layers:

1. **CSS Grid/Flex layout** for the application shell:
   - header;
   - language and reset controls;
   - main visual stage;
   - side control panel;
   - responsive stacking on smaller screens.

2. **Named SVG layout regions** for the educational diagram:
   - sentence box;
   - input vector space;
   - matrix block;
   - transformed vector space;
   - probability list;
   - footer feedback band;
   - arrows between stages.

The SVG uses a stable `viewBox` of `0 0 1200 620`. All visual objects are placed from a single `LAYOUT` object in `app.js`, so positions are relative to named regions instead of being scattered throughout the code. This keeps the pipeline aligned, scalable, and visually balanced when the SVG is resized by the browser.

## Matrix transformation

The visible model is one 2×2 matrix. It is rebuilt continuously from the controls:

```text
M = R(theta) · diag(stretch, 1 / stretch)
```

Where:

- `theta` comes from the rotation knob;
- `stretch` comes from the slider;
- the sentence prefix is converted to a normalized 2D vector;
- the matrix transforms that vector;
- candidate words receive scores based on how closely their target vectors align with the transformed vector;
- scores are converted into probabilities with softmax.

The hints sample nearby rotation and stretch values to estimate which direction improves the correct word's probability margin.

## Scoring

The score is the total number of wrong attempts. Lower is better. This supports the core lesson: AI systems are often judged not only by whether they can produce an answer, but by how costly or bad their errors are.

## FR / GB language support

The language buttons switch between:

- French interface text, instructions, sentence prefixes, and candidate words;
- English interface text, instructions, sentence prefixes, and candidate words.

The default language is French.

## Reset password

The reset/retry button asks for a password.

```text
Admin0000
```
