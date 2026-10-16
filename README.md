# TE26 – Bygg ett Super Mario-liknande plattformsspel

Välkommen till TE26! I det här projektet bygger ni ett eget plattformsspel i stil med Super Mario.
Spelet är skrivet i vanlig **HTML, CSS och JavaScript** med `<canvas>`. Inga ramverk behövs.

Det finns redan ett litet spel som fungerar. Er uppgift är att bygga vidare på det.

🎮 **Spela startversionen:** <https://te26.netlify.app>

## Kom igång

1. Klicka på **Fork** uppe till höger (eller klona repot).
2. Öppna mappen i VS Code.
3. Starta en lokal server, till exempel med tillägget **Live Server**, eller i terminalen:

   ```bash
   python3 -m http.server 8000
   ```

4. Öppna <http://localhost:8000> i webbläsaren.

**Styrning:** Pilar / A D = gå · Mellanslag / W / Pil upp = hoppa · R = börja om

## Så hänger koden ihop

| Fil | Vad den gör |
|-----|-------------|
| `index.html` | Sidan med spelets `<canvas>`. |
| `style.css` | Utseendet på sidan. |
| `js/level.js` | Banan (ritad med tecken), krockar mot block och ritning av banan. |
| `js/player.js` | Spelaren: rörelse, hopp och gravitation. |
| `js/enemy.js` | Fienden som går fram och tillbaka. |
| `js/game.js` | Spelloopen: tangenter, mynt, fiender, poäng, vinst och game over. |

Banan ritas i `LEVEL_MAP` i `js/level.js`. Varje tecken är en ruta:

```
#  mark          B  tegelblock     ?  frågeblock
o  mynt          E  fiende         P  spelarens start
F  målflagga     .  luft
```

## Uppgifter

Gör uppgifterna i ordning. Committa ofta med tydliga meddelanden!

### Nivå 1 – Förstå koden
- [ ] Ändra `GRAVITY`, `JUMP_POWER` och `MAX_SPEED` i `player.js`. Vad händer?
- [ ] Ändra färgerna på spelaren.
- [ ] Bygg om banan i `LEVEL_MAP`. Lägg till fler mynt, hål och fiender.

### Nivå 2 – Nya funktioner
- [ ] Visa antal **liv** (t.ex. 3). Starta om från början när liven är slut.
- [ ] Lägg till en **timer** som räknar ner.
- [ ] När spelaren slår huvudet i ett `?`-block ska det ge ett mynt och bli ett tomt block.
- [ ] Gör så att spelaren kan **springa** snabbare när man håller in Shift.

### Nivå 3 – Gör det till ditt spel
- [ ] Byt ut rektanglarna mot egna **bilder/sprites** (rita själv, t.ex. i Piskel).
- [ ] Lägg till **ljud** när man hoppar, tar mynt och dör.
- [ ] Lägg till en **power-up** (svamp) som gör spelaren större.
- [ ] Gör **flera banor**. När man når flaggan går man till nästa bana.
- [ ] Lägg till en ny sorts fiende.

### Extra
- [ ] Startmeny och highscore (spara med `localStorage`).
- [ ] Bakgrund med moln och kullar som rör sig långsammare än banan (parallax).
- [ ] Publicera spelet med **GitHub Pages** så att andra kan spela det.

## Regler

- Använd inte bilder eller ljud från Nintendo. Gör egna, eller använd fria resurser (t.ex. från [OpenGameArt](https://opengameart.org) eller [Kenney](https://kenney.nl)) och skriv var de kommer ifrån.
- Skriv kommentarer i koden så att andra förstår den.
