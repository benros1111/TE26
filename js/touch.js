// Pekskärmsknappar för mobil (iOS och Android).
// Varje knapp sätter samma "keys" som tangentbordet gör i game.js.
document.querySelectorAll("#touch-controls button").forEach(button => {
  const key = button.dataset.key;

  const press = e => {
    e.preventDefault();
    startAudio();
    keys[key] = true;
    button.classList.add("active");
    if (state === "gameover" || state === "won") newGame();
  };
  const release = e => {
    e.preventDefault();
    keys[key] = false;
    button.classList.remove("active");
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("contextmenu", e => e.preventDefault()); // ingen långtrycks-meny
});

// Tryck på spelet för att starta ljudet, eller börja om efter game over / vinst.
canvas.addEventListener("pointerdown", () => {
  startAudio();
  if (state === "gameover" || state === "won") newGame();
});

// Knapp för att stänga av och sätta på ljudet
const muteButton = document.getElementById("mute");
muteButton.textContent = muted ? "🔇" : "🔊";
muteButton.addEventListener("click", () => {
  startAudio();
  pressMute();
});
