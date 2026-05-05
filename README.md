# Understand AI Simply — Matrix Model Game

A static browser activity for middle-school students that shows how a language model can transform information, produce word probabilities, and be evaluated by its errors.

## Open locally

No install step is needed. Open `index.html` directly in a browser, or run a tiny local server from the project folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy on GitHub Pages

1. Commit `index.html`, `styles.css`, `app.js`, and `README.md` to your repository.
2. In GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Select the branch and root folder.
5. Save. GitHub Pages will serve the static app without any build tools.

## How the game works

The activity contains five fixed sentences. Each sentence has two missing words, and each missing word is one prediction step. The student adjusts a model until the correct word becomes the highest-probability candidate, then presses **Enter** to append that word to the sentence.

The visual story is shown left-to-right:

```text
sentence prefix → vector representation → visible 2x2 matrix → transformed vector → ranked word probabilities
```

## Fixed 20-word candidate sets

Every prediction step has exactly 20 visible candidate words. Only one is correct. Those 20 words remain fixed while the student is solving that step: moving the knob or slider changes the probabilities and ranking, but it does not replace the candidate words. A new fixed set appears only when the game advances to the next missing word.

## Matrix transformation

The student controls one visible 2x2 matrix with two continuous controls:

- a rotation knob
- a stretch / modulation slider

The displayed matrix coefficients are the real coefficients used by the app. The current sentence prefix has a fixed hidden vector for the active step. The app multiplies that vector by the student-controlled matrix, producing the transformed vector shown in the next panel.

## Probability model

For each prediction step, the app uses:

- one fixed sentence vector
- one student-controlled matrix
- one transformed vector
- 20 fixed candidate word vectors and biases
- logits computed from the transformed vector and candidate vectors
- a softmax over the 20 logits

Because the controls are continuous, the matrix values, transformed vector, and word probabilities all change continuously.

## Gradient hints

The app defines a hidden loss: the negative log probability of the correct word. It estimates approximate numerical partial derivatives with respect to rotation and stretch. These derivatives are used only for rough hints:

- a small direction cue around the knob
- a small direction cue beside the slider
- a broad strength label

The hints are intentionally forgiving and approximate. They suggest a useful direction without revealing an exact solution.

## Scoring

If the student presses **Enter** while the top-ranked word is wrong, the mistake count increases by one. The student stays on the same prediction step and can keep adjusting the model until the correct word is top-ranked. After all five sentences are completed, the app shows the total number of mistakes.

Lower score is better.

## FR / GB language toggle

The default language is French. The **FR / GB** toggle translates the interface, instructions, sentences, candidate words, score labels, and completion explanation. Switching language does not reset progress.

## Reset password

The reset / retry button asks for a password. The activity restarts only if the password is:

```text
Admin0000
```
