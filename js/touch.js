// Pekskärmsknappar för mobil (iOS och Android).
// Varje knapp sätter samma "keys" som tangentbordet gör i game.js.
document.querySelectorAll("#touch-controls button").forEach(button => {
  const key = button.dataset.key;

  const press = e => {
    e.preventDefault();
    keys[key] = true;
    button.classList.add("active");
    if (state !== "playing") reset();
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
  button.addEventListener("contextmenu", e => e.preventDefault()); // inget långtrycks-meny
});

// Tryck på spelet för att börja om efter game over / vinst.
canvas.addEventListener("pointerdown", () => {
  if (state !== "playing") reset();
});
