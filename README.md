# Vector Lab — Educational LM Transformation Game

A static browser app (HTML/CSS/vanilla JS + SVG) for middle-school students.

## Open locally
- Download/clone the repo.
- Open `index.html` directly in a browser.

## Deploy on GitHub Pages
- Push this repository to GitHub.
- In **Settings → Pages**, choose **Deploy from a branch**.
- Select `main` (or your branch) and root `/`.
- Save; GitHub Pages serves the app as a static site.

## How the game works
- There are 5 fixed sentences.
- Each sentence has 3 blanks.
- For each blank, 20 candidate words are ranked by probability.
- Press **Enter** (or click the commit button) to append the top-ranked word.
- If it is correct, you move to the next blank.
- If not, it counts as a mistake and you keep tuning.

## Matrix/model transformation
Pipeline:
1. sentence prefix
2. 2D vector representation
3. one visible 2x2 model matrix
4. transformed 2D vector
5. probability ranking over 20 words

The matrix is the model: it rotates and anisotropically stretches the vector.
Those transformed coordinates drive logits, then softmax probabilities.

## Controls
- **Rotation knob**: continuously rotates the model matrix.
- **Stretch slider**: continuously modulates anisotropic stretch (one axis expands while the other contracts).
- Red hint arrows show coherent directional guidance for better ranking.

## Scoring
- Score = number of wrong attempts.
- **Lower score is better.**
- This highlights the idea that AI systems are often judged by how harmful/frequent their errors are.

## Language switching (FR / GB)
- Default is French.
- Toggle button switches between French and English.
- It translates UI, instructions, sentences, candidates, and score messaging.

## Reset
- Reset asks for a password.
- Password: `Admin0000`.
- Correct password restarts the activity from the beginning.
