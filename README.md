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

**Styrning:** Pilar / A D = gå · Mellanslag / W / Pil upp = hoppa (håll in för högre hopp) · R = börja om · M = ljud av/på. På mobil finns knappar på skärmen (koden finns i `js/touch.js`).

## Så hänger koden ihop

| Fil | Vad den gör |
|-----|-------------|
| `index.html` | Sidan med spelets `<canvas>`. |
| `style.css` | Utseendet på sidan, även för mobil. |
| `js/level.js` | De 3 banorna (ritade med tecken), krockar mot block och ritning av banan. |
| `js/player.js` | Spelaren: rörelse, hopp, gravitation, stor och liten. |
| `js/enemy.js` | Fiender: går, hoppar, sköldpaddor och skal. |
| `js/items.js` | Svampen som gör dig stor. |
| `js/effects.js` | Effekter: partiklar, poäng som flyger upp, mynt som snurrar. |
| `js/sound.js` | Ljudeffekter och musik (egen 8-bitarslåt, gjord med Web Audio). |
| `js/game.js` | Spelloopen: block, mynt, fiender, liv, poäng, byte av bana. |
| `js/touch.js` | Knappar på skärmen för mobil (iOS och Android) och ljudknappen. |

Banorna ritas i `LEVELS` i `js/level.js`. Varje tecken är en ruta:

```
#  mark / sten         B  tegelblock (stor spelare kan krossa det)
?  frågeblock (mynt)   M  frågeblock med svamp (gör dig stor)
X  tomt block          ^  taggar (gör ont!)
o  mynt                P  spelarens start      F  målflagga
E  fiende som går      K  sköldpadda (hoppa på den -> skal, sparka skalet!)
J  fiende som hoppar   S  skal som redan åker fort
.  luft
```

## Det här finns redan

- 3 banor som blir svårare: snabbare fiender, skal, taggar och större hål.
- Frågeblock ger mynt. Vissa ger en svamp som gör dig stor.
- Stor spelare kan krossa tegelblock. Blir du träffad när du är stor blir du liten igen.
- 3 liv. 50 mynt ger ett extra liv.
- Effekter, ljud och musik.
- Fungerar på dator och mobil.

## Uppgifter

Gör uppgifterna i ordning. Committa ofta med tydliga meddelanden!

### Nivå 1 – Förstå koden
- [ ] Ändra `GRAVITY`, `JUMP_POWER` och `MAX_SPEED` i `player.js`. Vad händer?
- [ ] Ändra färgerna på spelaren och fienderna.
- [ ] Bygg om en bana i `LEVELS`. Lägg till fler mynt, hål och fiender.
- [ ] Gör en egen melodi i `SONG` i `sound.js`.

### Nivå 2 – Nya funktioner
- [ ] Lägg till en **timer** som räknar ner. Tar tiden slut förlorar man ett liv.
- [ ] Gör så att spelaren kan **springa** snabbare när man håller in Shift.
- [ ] Lägg till en **stjärna** som gör spelaren odödlig en stund.
- [ ] Lägg till en **fjärde bana**.

### Nivå 3 – Gör det till ditt spel
- [ ] Byt ut rektanglarna mot egna **bilder/sprites** (rita själv, t.ex. i Piskel).
- [ ] Lägg till en **eldblomma** så att spelaren kan skjuta eldbollar.
- [ ] Lägg till **plattformar som rör sig**.
- [ ] Lägg till en ny sorts fiende, eller en boss på sista banan.

### Extra
- [ ] Startmeny och highscore (spara med `localStorage`).
- [ ] Publicera spelet med **GitHub Pages** eller Netlify så att andra kan spela det.

## Regler

- Använd inte bilder, ljud eller musik från Nintendo. Gör egna, eller använd fria resurser (t.ex. från [OpenGameArt](https://opengameart.org) eller [Kenney](https://kenney.nl)) och skriv var de kommer ifrån.
- Skriv kommentarer i koden så att andra förstår den.
