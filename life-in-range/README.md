# Life in Range

A browser simulation of adult life with **type 1 diabetes**. You play a working professional
(21+) for a week: counting carbs, dosing insulin, reacting to CGM alarms, exercising, getting
blindsided by stress and pump failures, and being woken at 3 a.m. by a screaming sensor.
The goal is the one real people chase: a healthy estimated **HbA1c**.

**Play:** open `index.html` in any modern browser — phone or desktop. No build step, no install,
no backend. Progress saves locally at the start of each in-game day.

> Educational simulation with simplified physiology — **not medical advice.**

## Design language

Clinical and quiet. Near-black surfaces, hairline borders, Inter with tabular numerals.
Color is never decoration — it only encodes glucose state (low / in range / high), insulin
and carbohydrates, exactly like medical software. All iconography is a custom monochrome
SVG stroke set; scenes are atmospheric vector environments; the player character is a
proportioned figure illustration, not a cartoon.

## The three views

- **Day** — vector scenes (home, office, transit, restaurant, gym, night) with the character,
  symptom states as quiet chips and overlays, and an action bar (treat, correct, snack,
  pump site, water).
- **Body** — a real-time **3D scene (Three.js)**: a translucent circulation loop in space with
  glucose and insulin particles flowing through it. Particle density tracks actual blood
  glucose; organs sit along the loop (the stomach glows while digesting, the pancreas stays
  dark — beta cells offline, fat grows with over-dosing, the vessel itself reddens under
  hyperglycemic stress). Drag to orbit; labels are projected from 3D each frame.
- **Data** — a CGM-style dot trace over 24 h with target band, meal/bolus/exercise tick marks,
  time-in-range, live GMI (estimated HbA1c), IOB and COB.

## Gameplay

- **Character**: build your own adult professional (age 21–64, profession, look, pump vs. pens,
  mg/dL vs. mmol/L) or generate one of five presets.
- **Carb counting**: labeled foods are easy mode; restaurant meals make you estimate — the dose
  follows your guess, the body follows the truth, and the gap shows up on the graph.
- **Dosing**: suggested boluses with the live math (carb ratio, correction factor, IOB),
  pre-bolus timing, and split/extended boluses for high-fat "pizza effect" meals.
- **Events**: profession-flavored work stress (which genuinely raises glucose), office cake,
  silently kinked pump sites, forgotten basal, exercise lows, severe-low rescues, night alarms
  that cost next-day energy.
- **Ending**: estimated HbA1c against the <7% clinical target, time in range, lows, carb-count
  accuracy, fat stored from surplus insulin — and the point of it all: your week ends; day 8
  looks exactly the same for the character.

## Simulation model (`js/engine.js`)

Minute-level physiology, simplified but honest:

| Mechanism | Model |
|---|---|
| Carb absorption | Curves by glycemic profile (fast / medium / slow-fat with a 5-hour tail) |
| Insulin action | Rapid-acting: ~12 min onset, ~70 min peak, 4 h duration; IOB tracked |
| Basal | Cancels hepatic output — unless a site fails or a dose is missed |
| Dawn phenomenon | Hormonal push 4–8 a.m. |
| Exercise | Muscle uptake during + raised sensitivity for hours after |
| Stress | Cortisol/adrenaline drift, ~2.5 h decay |
| Hypo counter-regulation | Liver rescue + blunted insulin action when very low |
| CGM realism | ~10 min sensor lag, 5-minute cadence, reading noise |

Validated headlessly (Node) and end-to-end in a browser (Playwright): a well-dosed day lands
~85% time in range; skipping insulin climbs past 300 mg/dL; a dead pump site adds ~45 mg/dL/hour.

## Why no backend?

Everything — simulation, rendering, saves — runs client-side. No accounts, no shared state,
nothing to fetch: a static page is strictly better (free hosting, offline play, no privacy
surface). A backend can be added later if leaderboards or classroom sessions are wanted.

## Files

```
life-in-range/
├── index.html        app shell & screens
├── css/style.css     design system (mobile-first)
├── vendor/three.module.min.js
└── js/
    ├── engine.js     metabolic simulation (pure, node-testable)
    ├── data.js       foods, professions, insights, therapies
    ├── game.js       schedule, decisions, modals, alarms, saves
    ├── main.js       title / character / summaries / ending
    ├── body.js       3D body view (Three.js)
    ├── graph.js      CGM strip + trends renderers
    ├── icons.js      monochrome SVG icon set
    └── avatar.js     figure illustration + scene art
```
