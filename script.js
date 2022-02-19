import targetWords from "./targetWords.js";
import dictionary from "./dictionary.js";

const WORLD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");
const targetWord = targetWords[Math.floor(Math.random() * targetWords.length)];
const info = document.querySelector(".info");
info.addEventListener("click", () => showInfo());
const exit = document.querySelector(".exit");
exit.addEventListener("click", () => hideInfo());

let darkMode = localStorage.getItem("darkMode");
const darkModeToggle = document.querySelector("#dark-mode-toggle");

const enableDarkMode = () => {
  document.body.classList.add("darkmode");
  localStorage.setItem("darkMode", "enabled");
};

const disbaleDarkMode = () => {
  document.body.classList.remove("darkmode");
  localStorage.setItem("darkMode", null);
};

if (darkMode === "enabled") {
  enableDarkMode();
}

darkModeToggle.addEventListener("click", () => {
  darkMode = localStorage.getItem("darkMode");
  if (darkMode !== "enabled") {
    enableDarkMode();
  } else {
    disbaleDarkMode();
  }
});

const startInteraction = () => {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
};

const stopInteraction = () => {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
};

const handleMouseClick = (e) => {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }
  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }
  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
};

const handleKeyPress = (e) => {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }
  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }
  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }
};

const pressKey = (key) => {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORLD_LENGTH) return;
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
};

const deleteKey = () => {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) {
    return;
  }
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
};

const getActiveTiles = () => {
  return guessGrid.querySelectorAll('[data-state="active"]');
};

const submitGuess = () => {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORLD_LENGTH) {
    showAlert("Not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");

  if (!dictionary.includes(guess)) {
    showAlert("Not in the word list");
    shakeTiles(activeTiles);
    return;
  }

  stopInteraction();

  activeTiles.forEach((...params) => {
    flipTiles(...params, guess);
  });
};

const flipTiles = (tile, index, array, guess) => {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);

  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.style.color = "white";

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip");
      if (targetWord[index] === letter) {
        tile.dataset.state = "correct";
        key.classList.add("correct");
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = "wrong-location";
        key.classList.add("wrong-location");
      } else {
        tile.dataset.state = "wrong";
        key.classList.add("wrong");
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          "transitionend",
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
};

const showEnd = () => {
  let btn = document.createElement("button");
  btn.innerHTML = "Again";
  setTimeout(() => {
    btn.addEventListener("click", function () {
      //TODO: need to rewrite this part
      location.reload();
      return;
    });
    alertContainer.prepend(btn);
  }, 1500);
};

const showAlert = (message, duration = 1000) => {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
};

const showInfo = () => {
  document.getElementById("myDIV").style.display = "block";
};

const hideInfo = () => {
  document.getElementById("myDIV").style.display = "none";
};

const shakeTiles = (tiles) => {
  tiles.forEach((tile) => {
    tile.classList.add("shake");
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake");
      },
      { once: true }
    );
  });
};

const checkWinLose = (guess, tiles) => {
  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");

  if (guess === targetWord) {
    if (remainingTiles.length === 25) {
      showAlert("Genius", 1000);
      showEnd();
    }
    if (remainingTiles.length === 20 || remainingTiles.length === 15) {
      showAlert("Great!", 1000);
      showEnd();
    }
    if (remainingTiles.length === 10 || remainingTiles.length === 5) {
      showAlert("Good job!", 1000);
      showEnd();
    }
    if (remainingTiles.length === 0) {
      showAlert("Phew!", 1000);
      showEnd();
    }
    danceTiles(tiles);
    stopInteraction();
    return;
  }

  if (remainingTiles.length === 0) {
    showAlert(targetWord.toUpperCase(), 1000);
    showEnd();
    stopInteraction();
  }
};

const danceTiles = (tiles) => {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance");
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
};

startInteraction();
