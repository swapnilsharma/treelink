# GlucoQuest — Life with Type One

An interactive, visually rich browser game that teaches what daily life with **type 1 diabetes**
actually involves — by making you live it. You play a working adult (21+) with T1D for a week:
counting carbs, dosing insulin, reacting to CGM alarms, exercising, getting blindsided by stress
and pump failures, and being woken at 3 a.m. by a screaming sensor.

**Play it:** open `index.html` in any modern browser — phone or desktop. No build step, no
install, no backend. Progress saves locally (localStorage) at the start of each in-game day.

> ⚠ Educational game with simplified physiology — **not medical advice.**

---

## What the player experiences

- **Character creation** — build your own adult professional (name, age 21–64, profession, look,
  pump vs. pens, mg/dL vs. mmol/L) or roll one of five ready-made characters.
- **A living week** — 3, 5 or 7 simulated days on a real schedule: breakfast before work, commute,
  meetings, lunch out, afternoon slumps, evening exercise choices, dinner, the nightly bedtime check.
- **Carb counting as gameplay** — labeled foods are "easy mode"; restaurant meals make you
  *estimate* the carbs, your dose is computed from your guess, and your body responds to the truth.
- **Real dosing decisions** — suggested boluses with the actual math shown (carb ratio, correction
  factor, insulin-on-board), pre-bolus timing, and split/extended boluses for fatty "pizza effect" meals.
- **Three synchronized views**
  - 🏙 **World** — scenes, your avatar (who visibly sweats when low), symptom overlays, action bar.
  - 🫀 **Inside the body** — a live animated cross-section: glucose particles streaming from the
    stomach into the bloodstream, the grayed-out pancreas, insulin entering from the pump site,
    cells absorbing glucose, fat cells growing when insulin outpaces need, vessels glowing under
    hyperglycemic stress — with captions that explain what you're seeing, as it happens.
  - 📈 **Trends** — a full CGM graph with target band, meal/bolus/exercise markers, time-in-range,
    live GMI (estimated HbA1c), IOB and COB.
- **Events with teeth** — stress spikes from work (profession-flavored), office birthday cake,
  kinked pump sites that silently stop insulin, forgotten basal injections, exercise lows,
  severe-low rescues, night alarms that cost you energy the next day.
- **The goal** — finish the week with the best **estimated HbA1c** (GMI) and time-in-range you can.
  The ending reframes the score: your week ends; for real people with T1D, day 8 looks exactly the same.

## The simulation model (`js/engine.js`)

Minute-by-minute glucose physiology, simplified but honest:

| Mechanism | Model |
|---|---|
| Carb absorption | Triangular rate curves by glycemic profile (fast / medium / slow-fatty with a 5-hour tail) |
| Insulin action | Rapid-acting curve: ~12 min onset, ~70 min peak, 4 h duration; IOB tracked |
| Basal | Cancels hepatic glucose output — unless a site fails or a dose is missed |
| Dawn phenomenon | Hormonal push 4–8 a.m. |
| Exercise | Direct muscle uptake during + raised insulin sensitivity for hours after; adrenaline for intense work |
| Stress | Cortisol/adrenaline drift upward, decaying over ~2.5 h |
| Hypo counter-regulation | Liver rescue release + blunted insulin action when very low |
| CGM realism | Sensor lags blood by ~10 min, 5-minute cadence, reading noise |
| Fat storage | Insulin clearing glucose beyond need accumulates as a visible "extra fat" stat |

Validated headlessly (Node): a well-dosed day lands ~85% time-in-range; eating without insulin
climbs to 300+; double-dosing causes severe lows; a dead pump site adds ~45 mg/dL per hour.

## Why no backend?

Everything — simulation, rendering, saves — runs client-side. There are no accounts, no shared
state, and nothing to fetch, so a static page is strictly better: free hosting (GitHub Pages),
works offline, zero latency, no data privacy surface. If multiplayer leaderboards or shared
classroom sessions are ever wanted, a backend can be added then.

## Files

```
glucoquest/
├── index.html        app shell & screens
├── css/style.css     all styling (mobile-first, responsive)
└── js/
    ├── engine.js     metabolic simulation (pure, node-testable)
    ├── data.js       foods, professions, facts, scenes, therapies
    ├── game.js       day schedule, decisions, modals, alarms, scoring, saves
    ├── main.js       title / character creation / summaries / ending
    ├── body.js       "inside the body" particle visualization
    ├── graph.js      CGM strip + trends chart renderers
    └── avatar.js     SVG character + scene art
```
