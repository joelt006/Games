# 🎮 Mini Arcade

Four browser mini-games on a single page — no build step, no dependencies, all
plain HTML/CSS/JS. Hosted free on GitHub Pages.

- 🧠 **Memory Match** — flip cards to find all 8 pairs (moves + timer)
- ❓ **Trivia Quiz** — multiple-choice questions with scoring
- ⌨️ **Typing Test** — live WPM and accuracy
- 🧩 **Sliding Puzzle** — classic 15-puzzle (always generated solvable)

## Run locally

Just open `index.html` in a browser. Or serve it:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy free on GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` — the included workflow ([.github/workflows/pages.yml](.github/workflows/pages.yml))
   builds and publishes automatically.

Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

> Prefer no workflow? Settings → Pages → Source → **Deploy from a branch** →
> `main` / `root` also works, since this is a static site.

## Add your own game

Each game is a self-contained IIFE in [games.js](games.js). To add one:

1. Add a `<button class="tab" data-target="mygame">` to the nav in `index.html`.
2. Add a matching `<section id="mygame" class="game" hidden>` block.
3. Add an IIFE in `games.js`. Tab switching is handled automatically.

## License

See [LICENSE](LICENSE).
