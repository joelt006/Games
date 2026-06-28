/* ===== Tab switching ===== */
const tabs = document.querySelectorAll(".tab");
const games = document.querySelectorAll(".game");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    games.forEach((g) => {
      const on = g.id === tab.dataset.target;
      g.classList.toggle("is-active", on);
      g.hidden = !on;
    });
  });
});

/* Small reusable timer */
function makeTimer(displayEl) {
  let start = null;
  let raf = null;
  function tick() {
    const s = Math.floor((Date.now() - start) / 1000);
    displayEl.textContent = s + "s";
    raf = requestAnimationFrame(tick);
  }
  return {
    start() {
      if (start) return;
      start = Date.now();
      tick();
    },
    stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      return start ? Math.floor((Date.now() - start) / 1000) : 0;
    },
    reset() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      start = null;
      displayEl.textContent = "0s";
    },
    elapsedMs() {
      return start ? Date.now() - start : 0;
    },
  };
}

/* ===================================================================
   MEMORY MATCH
=================================================================== */
(function memoryGame() {
  const board = document.getElementById("mem-board");
  const movesEl = document.getElementById("mem-moves");
  const matchedEl = document.getElementById("mem-matched");
  const winEl = document.getElementById("mem-win");
  const timer = makeTimer(document.getElementById("mem-time"));
  const EMOJIS = ["🍎", "🚀", "🎸", "🐱", "🌈", "⚡", "🍕", "🎲"];

  let first = null;
  let lock = false;
  let moves = 0;
  let matched = 0;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function init() {
    board.innerHTML = "";
    winEl.hidden = true;
    first = null;
    lock = false;
    moves = matched = 0;
    movesEl.textContent = "0";
    matchedEl.textContent = "0";
    timer.reset();

    const deck = shuffle([...EMOJIS, ...EMOJIS]);
    deck.forEach((emoji) => {
      const card = document.createElement("button");
      card.className = "mem-card";
      card.textContent = emoji;
      card.dataset.emoji = emoji;
      card.addEventListener("click", () => flip(card));
      board.appendChild(card);
    });
  }

  function flip(card) {
    if (lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
    timer.start();
    card.classList.add("flipped");

    if (!first) {
      first = card;
      return;
    }

    moves++;
    movesEl.textContent = moves;

    if (first.dataset.emoji === card.dataset.emoji) {
      first.classList.add("matched");
      card.classList.add("matched");
      first = null;
      matched++;
      matchedEl.textContent = matched;
      if (matched === EMOJIS.length) {
        timer.stop();
        winEl.hidden = false;
      }
    } else {
      lock = true;
      const a = first;
      first = null;
      setTimeout(() => {
        a.classList.remove("flipped");
        card.classList.remove("flipped");
        lock = false;
      }, 700);
    }
  }

  document.getElementById("mem-restart").addEventListener("click", init);
  init();
})();

/* ===================================================================
   TRIVIA QUIZ
=================================================================== */
(function quizGame() {
  // Full pool — each round picks ROUND_SIZE random questions from here.
  const POOL = [
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Mercury"], correct: 1 },
    { q: "What is the largest mammal on Earth?", a: ["Elephant", "Blue whale", "Giraffe", "Hippo"], correct: 1 },
    { q: "In which language is this site written?", a: ["Python", "Rust", "JavaScript", "Go"], correct: 2 },
    { q: "How many continents are there?", a: ["5", "6", "7", "8"], correct: 2 },
    { q: "What does CPU stand for?", a: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Core Power Unit"], correct: 1 },
    { q: "Which gas do plants absorb from the air?", a: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2 },
    { q: "What year did the first iPhone release?", a: ["2005", "2007", "2009", "2010"], correct: 1 },
    { q: "Which ocean is the largest?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
    { q: "What is the capital of Japan?", a: ["Seoul", "Beijing", "Tokyo", "Bangkok"], correct: 2 },
    { q: "How many sides does a hexagon have?", a: ["5", "6", "7", "8"], correct: 1 },
    { q: "Which element has the symbol 'O'?", a: ["Gold", "Oxygen", "Osmium", "Iron"], correct: 1 },
    { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], correct: 2 },
    { q: "What is the smallest prime number?", a: ["0", "1", "2", "3"], correct: 2 },
    { q: "Which country has the most population?", a: ["India", "USA", "China", "Indonesia"], correct: 0 },
    { q: "What does HTML stand for?", a: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks Text Mark Language"], correct: 0 },
    { q: "How many strings does a standard guitar have?", a: ["4", "5", "6", "7"], correct: 2 },
  ];

  const ROUND_SIZE = 8; // questions per playthrough

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Build a fresh randomized round: random questions, each with shuffled answers.
  function buildRound() {
    return shuffle(POOL)
      .slice(0, ROUND_SIZE)
      .map((item) => {
        const correctText = item.a[item.correct];
        const options = shuffle(item.a);
        return { q: item.q, options, correct: options.indexOf(correctText) };
      });
  }

  let questions = [];

  const numEl = document.getElementById("quiz-num");
  const totalEl = document.getElementById("quiz-total");
  const scoreEl = document.getElementById("quiz-score");
  const questionEl = document.getElementById("quiz-question");
  const answersEl = document.getElementById("quiz-answers");
  const nextBtn = document.getElementById("quiz-next");
  const resultEl = document.getElementById("quiz-result");
  const bodyEl = document.getElementById("quiz-body");

  totalEl.textContent = ROUND_SIZE;
  let idx = 0;
  let score = 0;
  let answered = false;

  function render() {
    answered = false;
    const item = questions[idx];
    numEl.textContent = idx + 1;
    questionEl.textContent = item.q;
    nextBtn.hidden = true;
    answersEl.innerHTML = "";
    item.options.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.addEventListener("click", () => choose(i, item.correct, btn));
      answersEl.appendChild(btn);
    });
  }

  function choose(picked, correct, btn) {
    if (answered) return;
    answered = true;
    const buttons = answersEl.querySelectorAll("button");
    buttons.forEach((b) => (b.disabled = true));
    buttons[correct].classList.add("correct");
    if (picked === correct) {
      score++;
      scoreEl.textContent = score;
    } else {
      btn.classList.add("wrong");
    }
    nextBtn.hidden = false;
  }

  nextBtn.addEventListener("click", () => {
    idx++;
    if (idx >= questions.length) finish();
    else render();
  });

  function finish() {
    bodyEl.hidden = true;
    resultEl.hidden = false;
    const pct = Math.round((score / questions.length) * 100);
    resultEl.textContent = `You scored ${score}/${questions.length} (${pct}%) 🎉`;
  }

  function restart() {
    questions = buildRound();
    idx = 0;
    score = 0;
    scoreEl.textContent = "0";
    bodyEl.hidden = false;
    resultEl.hidden = true;
    render();
  }

  document.getElementById("quiz-restart").addEventListener("click", restart);
  restart();
})();

/* ===================================================================
   TYPING TEST
=================================================================== */
(function typingGame() {
  const TEXTS = [
    "The quick brown fox jumps over the lazy dog while the sun sets behind the hills.",
    "Practice makes progress, not perfection, so keep your fingers moving and your eyes ahead.",
    "Coding is mostly thinking carefully and then typing the result without too many mistakes.",
    "A small daily habit beats a big rare effort when you want to get better at anything.",
  ];

  const displayEl = document.getElementById("typ-display");
  const inputEl = document.getElementById("typ-input");
  const wpmEl = document.getElementById("typ-wpm");
  const accEl = document.getElementById("typ-acc");
  const resultEl = document.getElementById("typ-result");
  const timer = makeTimer(document.getElementById("typ-time"));

  let target = "";
  let started = false;

  function pickText() {
    target = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    paint("");
  }

  function paint(typed) {
    let html = "";
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      let cls = "";
      if (i < typed.length) cls = typed[i] === ch ? "ok" : "err";
      else if (i === typed.length) cls = "cur";
      html += `<span class="${cls}">${ch === " " ? "&nbsp;" : ch}</span>`;
    }
    displayEl.innerHTML = html;
  }

  function update() {
    const typed = inputEl.value;
    if (!started && typed.length > 0) {
      started = true;
      timer.start();
    }
    paint(typed);

    let correct = 0;
    for (let i = 0; i < typed.length && i < target.length; i++) {
      if (typed[i] === target[i]) correct++;
    }
    const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    accEl.textContent = acc + "%";

    const minutes = timer.elapsedMs() / 60000;
    const wpm = minutes > 0 ? Math.round((typed.length / 5) / minutes) : 0;
    wpmEl.textContent = wpm;

    if (typed.length >= target.length) finish(wpm, acc);
  }

  function finish(wpm, acc) {
    timer.stop();
    inputEl.disabled = true;
    resultEl.hidden = false;
    resultEl.textContent = `Done! ${wpm} WPM at ${acc}% accuracy ⌨️`;
  }

  function restart() {
    started = false;
    inputEl.disabled = false;
    inputEl.value = "";
    resultEl.hidden = true;
    wpmEl.textContent = "0";
    accEl.textContent = "100%";
    timer.reset();
    pickText();
    inputEl.focus();
  }

  inputEl.addEventListener("input", update);
  document.getElementById("typ-restart").addEventListener("click", restart);
  pickText();
})();

/* ===================================================================
   SLIDING PUZZLE (15-puzzle)
=================================================================== */
(function puzzleGame() {
  const SIZE = 4;
  const board = document.getElementById("puz-board");
  const movesEl = document.getElementById("puz-moves");
  const winEl = document.getElementById("puz-win");
  const timer = makeTimer(document.getElementById("puz-time"));

  let tiles = [];
  let moves = 0;
  let started = false;

  const solved = () => tiles.every((v, i) => v === (i === tiles.length - 1 ? 0 : i + 1));

  function shuffle() {
    do {
      tiles = [...Array(SIZE * SIZE).keys()].map((n) => (n + 1) % (SIZE * SIZE));
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
    } while (!isSolvable() || solved());
    moves = 0;
    started = false;
    movesEl.textContent = "0";
    winEl.hidden = true;
    timer.reset();
    render();
  }

  function isSolvable() {
    const arr = tiles.filter((n) => n !== 0);
    let inv = 0;
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) inv++;
    const blankRow = Math.floor(tiles.indexOf(0) / SIZE);
    const blankFromBottom = SIZE - blankRow;
    // For a 4-wide board: solvable when blank-on-even-row-from-bottom XOR even inversions
    return blankFromBottom % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
  }

  function render() {
    board.innerHTML = "";
    tiles.forEach((val, i) => {
      const tile = document.createElement("button");
      tile.className = "puz-tile" + (val === 0 ? " blank" : "");
      tile.textContent = val === 0 ? "" : val;
      if (val !== 0) tile.addEventListener("click", () => move(i));
      board.appendChild(tile);
    });
  }

  function move(i) {
    const blank = tiles.indexOf(0);
    const r1 = Math.floor(i / SIZE), c1 = i % SIZE;
    const r2 = Math.floor(blank / SIZE), c2 = blank % SIZE;
    const adjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (!adjacent) return;

    if (!started) {
      started = true;
      timer.start();
    }
    [tiles[i], tiles[blank]] = [tiles[blank], tiles[i]];
    moves++;
    movesEl.textContent = moves;
    render();
    if (solved()) {
      timer.stop();
      winEl.hidden = false;
    }
  }

  document.getElementById("puz-shuffle").addEventListener("click", shuffle);
  shuffle();
})();
