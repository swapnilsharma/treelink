// ============================================================
// GlucoQuest — static game data
// ============================================================

export const SKIN_TONES = ["#f5d0b0", "#e3b487", "#c68955", "#8d5a3b", "#5d3a26"];
export const HAIR_COLORS = ["#1f2430", "#4a3220", "#8a5a2b", "#b8b4ae", "#7c2d4f"];
export const HAIR_STYLES = ["Short", "Curly", "Long", "Bun", "Buzz"];

export const PROFESSIONS = [
  { id: "engineer", label: "💻 Software engineer", workplace: "a busy tech office", desk: "standup meetings and code reviews" },
  { id: "teacher",  label: "📚 High-school teacher", workplace: "a noisy school", desk: "back-to-back classes" },
  { id: "nurse",    label: "🩺 Nurse", workplace: "a hospital ward", desk: "12-hour shifts on your feet" },
  { id: "chef",     label: "🍳 Chef", workplace: "a packed restaurant kitchen", desk: "the dinner rush" },
  { id: "architect",label: "📐 Architect", workplace: "a design studio", desk: "client deadlines" },
];

export const THERAPIES = [
  {
    id: "pump",
    label: "💠 Insulin pump + CGM",
    note: "A pump drips rapid-acting insulin all day (basal) and gives meal doses (bolus) at a button press. Sites must be changed every ~3 days — and they can fail.",
  },
  {
    id: "pens",
    label: "🖊 Insulin pens (MDI) + CGM",
    note: "One injection of long-acting insulin covers the background (basal); a rapid-acting pen covers every meal and correction. That's 4–6 needles a day.",
  },
];

// Default ready-made characters (all adults, working professionals)
export const DEFAULT_CHARACTERS = [
  { name: "Maya",   age: 34, profession: "engineer",  skin: 2, hairColor: 0, hairStyle: 2, therapy: "pump", diagnosedAge: 19 },
  { name: "Dev",    age: 41, profession: "architect", skin: 3, hairColor: 0, hairStyle: 0, therapy: "pens", diagnosedAge: 27 },
  { name: "Sofia",  age: 28, profession: "nurse",     skin: 1, hairColor: 2, hairStyle: 1, therapy: "pump", diagnosedAge: 9  },
  { name: "Marcus", age: 52, profession: "chef",      skin: 4, hairColor: 3, hairStyle: 4, therapy: "pens", diagnosedAge: 44 },
  { name: "Elena",  age: 23, profession: "teacher",   skin: 0, hairColor: 4, hairStyle: 3, therapy: "pump", diagnosedAge: 12 },
];

// ------------------------------------------------------------
// FOOD — carbs in grams. gi: "fast" | "med" | "slow" (slow = high fat/protein,
// delayed absorption). labeled: true → carbs printed on package; false →
// the player must estimate (carb counting!).
// ------------------------------------------------------------
export const FOODS = {
  breakfast: [
    { id: "oatmeal",  emoji: "🥣", name: "Oatmeal with berries",      carbs: 42, gi: "med",  labeled: false, desc: "Steel-cut oats, blueberries, a little honey" },
    { id: "bagel",    emoji: "🥯", name: "Bagel & cream cheese",      carbs: 62, gi: "fast", labeled: true,  desc: "From the bakery downstairs. Dense!" },
    { id: "eggs",     emoji: "🍳", name: "Eggs & avocado toast",      carbs: 26, gi: "med",  labeled: false, desc: "Two eggs, half an avocado, seeded toast" },
    { id: "yogurt",   emoji: "🥛", name: "Greek yogurt & granola",    carbs: 34, gi: "med",  labeled: true,  desc: "Label says 34 g per serving" },
    { id: "pancakes", emoji: "🥞", name: "Pancakes & maple syrup",    carbs: 78, gi: "fast", labeled: false, desc: "Weekend treat. Syrup is nearly pure sugar." },
    { id: "skipbf",   emoji: "☕", name: "Just black coffee",         carbs: 2,  gi: "fast", labeled: true,  desc: "Skipping breakfast. Coffee can still nudge BG up." },
  ],
  lunch: [
    { id: "salad",    emoji: "🥗", name: "Chicken salad",             carbs: 18, gi: "med",  labeled: false, desc: "Greens, grilled chicken, vinaigrette, croutons" },
    { id: "sandwich", emoji: "🥪", name: "Turkey sandwich & apple",   carbs: 52, gi: "med",  labeled: false, desc: "Whole-grain bread plus the apple" },
    { id: "burrito",  emoji: "🌯", name: "Burrito bowl",              carbs: 68, gi: "med",  labeled: false, desc: "Rice, beans, chicken, salsa. Rice adds up fast." },
    { id: "ramen",    emoji: "🍜", name: "Ramen",                     carbs: 72, gi: "fast", labeled: false, desc: "Noodles in broth from the place next door" },
    { id: "sushi",    emoji: "🍣", name: "Sushi set",                 carbs: 64, gi: "med",  labeled: false, desc: "Sticky rice hides more carbs than it looks" },
    { id: "soup",     emoji: "🍲", name: "Lentil soup & roll",        carbs: 44, gi: "slow", labeled: false, desc: "Fiber slows the rise" },
  ],
  dinner: [
    { id: "pizza",    emoji: "🍕", name: "Pizza (3 slices)",          carbs: 84, gi: "slow", labeled: false, desc: "The infamous one: fat delays the spike for hours" },
    { id: "pasta",    emoji: "🍝", name: "Pasta bolognese",           carbs: 76, gi: "med",  labeled: false, desc: "A generous bowl with garlic bread" },
    { id: "stirfry",  emoji: "🥦", name: "Veggie stir-fry & rice",    carbs: 58, gi: "med",  labeled: false, desc: "Lots of veg, a cup of jasmine rice" },
    { id: "salmon",   emoji: "🐟", name: "Salmon, potatoes & greens", carbs: 38, gi: "med",  labeled: false, desc: "Balanced plate, moderate carbs" },
    { id: "curry",    emoji: "🍛", name: "Chickpea curry & naan",     carbs: 70, gi: "slow", labeled: false, desc: "Rich and fatty — slow, long absorption" },
    { id: "tacos",    emoji: "🌮", name: "Three tacos",               carbs: 48, gi: "med",  labeled: false, desc: "Corn tortillas, beans, the works" },
  ],
  snack: [
    { id: "apple",    emoji: "🍎", name: "Apple",                     carbs: 22, gi: "med",  labeled: false, desc: "Fruit sugar with fiber" },
    { id: "bar",      emoji: "🍫", name: "Protein bar",               carbs: 24, gi: "med",  labeled: true,  desc: "Label: 24 g carbs" },
    { id: "chips",    emoji: "🍟", name: "Bag of chips",              carbs: 30, gi: "med",  labeled: true,  desc: "Label: 30 g carbs" },
    { id: "nuts",     emoji: "🥜", name: "Handful of almonds",        carbs: 6,  gi: "slow", labeled: false, desc: "Barely moves BG" },
    { id: "cookie",   emoji: "🍪", name: "Office cookies (2)",        carbs: 36, gi: "fast", labeled: false, desc: "They were just sitting there…" },
    { id: "nosnack",  emoji: "🚫", name: "Skip the snack",            carbs: 0,  gi: "med",  labeled: true,  desc: "Not hungry" },
  ],
  treat: [
    { id: "juice",    emoji: "🧃", name: "Juice box",                 carbs: 18, gi: "fast", labeled: true,  desc: "Classic low treatment — fast sugar" },
    { id: "tabs",     emoji: "💊", name: "Glucose tabs (4)",          carbs: 16, gi: "fast", labeled: true,  desc: "4 g each, made for exactly this" },
    { id: "candy",    emoji: "🍬", name: "Gummy candies",             carbs: 25, gi: "fast", labeled: true,  desc: "Works, but easy to overdo while shaky" },
  ],
};

export const PORTIONS = [
  { id: "half",   label: "Half",   mult: 0.55 },
  { id: "normal", label: "Regular", mult: 1.0 },
  { id: "large",  label: "Large",  mult: 1.45 },
];

// ------------------------------------------------------------
// EXERCISE options (evening slot)
// ------------------------------------------------------------
export const EXERCISES = [
  { id: "gym",  label: "🏋️ Gym session (45 min)", desc: "Weights + cardio. Big glucose draw — watch for lows during and hours after.", duration: 45, uptake: 1.3, sensHours: 6, sensMult: 1.5, adrenaline: 0.3, energy: +12 },
  { id: "run",  label: "🏃 Evening run (30 min)", desc: "Steady cardio drops BG fast while you move.", duration: 30, uptake: 1.7, sensHours: 5, sensMult: 1.45, adrenaline: 0.1, energy: +10 },
  { id: "walk", label: "🚶 Walk home (25 min)", desc: "Gentle. A walk after meals flattens spikes beautifully.", duration: 25, uptake: 0.8, sensHours: 2, sensMult: 1.15, adrenaline: 0, energy: +6 },
  { id: "rest", label: "🛋 Skip it, rest tonight", desc: "Sometimes you're just done. No effect on BG.", duration: 0, uptake: 0, sensHours: 0, sensMult: 1, adrenaline: 0, energy: +3 },
];

// ------------------------------------------------------------
// Educational facts — shown as cards between days and as toasts
// ------------------------------------------------------------
export const FACTS = [
  "Type 1 diabetes is an autoimmune condition: the immune system destroys the pancreas's insulin-producing beta cells. It is not caused by diet, sugar, or lifestyle — and it can appear at any age.",
  "A person with T1D makes an estimated 180+ extra health decisions every single day: carbs, doses, timing, exercise, stress, sleep.",
  "Insulin is not a cure — it's life support. Before its discovery in 1921, a T1D diagnosis was fatal within months.",
  "HbA1c reflects your average glucose over ~3 months. Most adults with T1D aim for under 7%, but any improvement counts.",
  "Time in Range (70–180 mg/dL / 3.9–10 mmol/L) is the modern day-to-day goal: 70%+ in range is considered great control.",
  "Hypoglycemia (a 'low') can hit in minutes: shaking, sweating, confusion. The fix is fast sugar — and then the hard part: waiting 15 minutes without eating everything in the kitchen.",
  "The 'pizza effect': high-fat meals slow digestion so much that glucose can keep rising 4–6 hours after eating, long after the insulin dose has faded.",
  "Pre-bolusing — taking insulin 15–20 minutes before eating — gives insulin a head start and dramatically flattens post-meal spikes.",
  "Exercise can drop glucose during the activity and keep insulin sensitivity raised for up to 24 hours — overnight lows after a gym day are common.",
  "Stress hormones (adrenaline, cortisol) raise blood glucose. A hard meeting can spike you as surely as a snack can.",
  "The dawn phenomenon: hormones released in the early morning push glucose up before you even wake.",
  "A CGM reads glucose in the fluid under the skin — it runs ~5–10 minutes behind your blood, which matters when things change fast.",
  "Insulin lets glucose into cells for energy. Take more insulin than the food needs, and the surplus glucose is stored as fat — chronic over-insulinization can cause weight gain.",
  "Chronically high glucose damages small blood vessels and nerves — that's why long-term highs threaten eyes, kidneys, and feet.",
  "Untreated highs lead to DKA (diabetic ketoacidosis): the body, starved of usable glucose, burns fat into acidic ketones. It's a medical emergency.",
  "People with T1D do everything everyone else does — work, sports, parenting, travel. It just takes a constant background computation no one else sees.",
  "Sleep matters: a single bad night reduces insulin sensitivity the next day.",
  "Pump sites and CGM sensors are worn 24/7, changed every 3–10 days — finding unbruised real estate on your body becomes a skill.",
  "Severe lows at night are the fear that keeps parents and partners of people with T1D awake. CGM alarms have been life-changing.",
  "There is no 'mild' type 1 diabetes, and no day off. The reward for a perfectly managed day is getting to do it all again tomorrow.",
];

// ------------------------------------------------------------
// Scenes — CSS art definitions per location
// ------------------------------------------------------------
export const SCENES = {
  bedroom:    { label: "Home — bedroom",  sky: "linear-gradient(180deg,#0e1430 0%,#1c2350 60%,#2a2c5e 100%)", ground: "#171a38", props: "bedroom" },
  kitchen:    { label: "Home — kitchen",  sky: "linear-gradient(180deg,#15203f 0%,#27355f 70%,#37406b 100%)", ground: "#202745", props: "kitchen" },
  commute:    { label: "On the move",     sky: "linear-gradient(180deg,#1b2a52 0%,#3a4a80 60%,#67598a 100%)", ground: "#23284a", props: "city" },
  office:     { label: "Work",            sky: "linear-gradient(180deg,#101a36 0%,#1f2c55 65%,#2b3a66 100%)", ground: "#1a2240", props: "office" },
  restaurant: { label: "Restaurant",      sky: "linear-gradient(180deg,#241634 0%,#3a2150 65%,#52305e 100%)", ground: "#241a36", props: "restaurant" },
  gym:        { label: "Gym",             sky: "linear-gradient(180deg,#101f2e 0%,#1b3146 65%,#234058 100%)", ground: "#152433", props: "gym" },
  night:      { label: "Asleep",          sky: "linear-gradient(180deg,#05070f 0%,#0b1020 70%,#11162b 100%)", ground: "#070a14", props: "night" },
};

// ------------------------------------------------------------
// About screen content
// ------------------------------------------------------------
export const ABOUT_HTML = `
  <p><b>Type 1 diabetes (T1D)</b> is an autoimmune condition in which the immune system destroys the
  <b>beta cells</b> of the pancreas — the only cells in the body that make <b>insulin</b>.
  Without insulin, glucose from food can't get into cells, so it piles up in the blood while the
  body starves. T1D is not caused by sugar or lifestyle, can't be prevented, and (so far) can't be cured.</p>

  <h3>So how do people live with it?</h3>
  <p>By doing the pancreas's job manually, every hour of every day:</p>
  <div class="mini-diagram">
    <div>🔢 <b>Count carbs</b> in everything they eat — labels, estimates, restaurant guesswork.</div>
    <div>💉 <b>Dose insulin</b> by pump or injections, matching food, activity and stress.</div>
    <div>📈 <b>Watch glucose</b> on a CGM, reacting to arrows, alarms and trends — including at 3 a.m.</div>
  </div>

  <h3>The tightrope</h3>
  <p>Too little insulin → glucose climbs (<b>hyperglycemia</b>): thirst, fatigue, and long-term organ
  damage; untreated it leads to life-threatening DKA. Too much insulin → glucose crashes
  (<b>hypoglycemia</b>): shaking, confusion, and in severe cases unconsciousness within minutes.
  Food pushes one way, insulin and exercise the other, while stress, sleep and hormones shove from the sides.</p>

  <h3>What this game tries to show</h3>
  <p>You'll live a week in the shoes of a working adult with T1D: counting carbs, choosing doses,
  feeling the lag, getting woken by alarms — and aiming for the long-game prize, a healthy
  <b>HbA1c</b>. The physiology is simplified for play, but every challenge in here is one that
  millions of real people navigate daily.</p>
`;

// ------------------------------------------------------------
// Symptom descriptions by BG band
// ------------------------------------------------------------
export function symptomText(bg) {
  if (bg < 54)  return "Severe low. The world is narrowing — sweating, shaking hard, thoughts won't line up. You need sugar NOW.";
  if (bg < 70)  return "You feel low: shaky hands, cold sweat, sudden hunger, hard to concentrate.";
  if (bg <= 180) return "";
  if (bg <= 250) return "Running high: thirsty, a bit foggy, low-grade headache. Energy is draining.";
  return "Very high: parched mouth, heavy fatigue, blurry vision, repeated bathroom trips. If this holds, ketones become a risk.";
}
