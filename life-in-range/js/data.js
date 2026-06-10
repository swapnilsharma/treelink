// ============================================================
// Life in Range — static game data
// ============================================================

export const SKIN_TONES = ["#f0cfae", "#dfb086", "#c08453", "#8d5a3b", "#5d3a26"];
export const HAIR_COLORS = ["#23262e", "#473122", "#7d5326", "#a8a39b", "#5e2c42"];
export const HAIR_STYLES = ["Short", "Curly", "Long", "Bun", "Buzz"];

export const PROFESSIONS = [
  { id: "engineer", label: "Software engineer", workplace: "a busy tech office", desk: "standups and code reviews" },
  { id: "teacher",  label: "Teacher", workplace: "a noisy school", desk: "back-to-back classes" },
  { id: "nurse",    label: "Nurse", workplace: "a hospital ward", desk: "12-hour shifts on your feet" },
  { id: "chef",     label: "Chef", workplace: "a packed kitchen", desk: "the dinner rush" },
  { id: "architect",label: "Architect", workplace: "a design studio", desk: "client deadlines" },
];

export const THERAPIES = [
  {
    id: "pump",
    label: "Pump + CGM",
    note: "A pump drips rapid-acting insulin continuously (basal) and delivers meal doses at a button press. Sites are changed every ~3 days — and they can fail.",
  },
  {
    id: "pens",
    label: "Pens (MDI) + CGM",
    note: "One long-acting injection covers the background; a rapid-acting pen covers every meal and correction. Four to six needles a day.",
  },
];

export const DEFAULT_CHARACTERS = [
  { name: "Maya",   age: 34, profession: "engineer",  skin: 2, hairColor: 0, hairStyle: 2, therapy: "pump", diagnosedAge: 19 },
  { name: "Dev",    age: 41, profession: "architect", skin: 3, hairColor: 0, hairStyle: 0, therapy: "pens", diagnosedAge: 27 },
  { name: "Sofia",  age: 28, profession: "nurse",     skin: 1, hairColor: 2, hairStyle: 1, therapy: "pump", diagnosedAge: 9  },
  { name: "Marcus", age: 52, profession: "chef",      skin: 4, hairColor: 3, hairStyle: 4, therapy: "pens", diagnosedAge: 44 },
  { name: "Elena",  age: 23, profession: "teacher",   skin: 0, hairColor: 4, hairStyle: 3, therapy: "pump", diagnosedAge: 12 },
];

// ------------------------------------------------------------
// FOOD — carbs in grams. gi: fast | med | slow (slow = high fat,
// delayed absorption). labeled → carbs printed; otherwise the
// player estimates.
// ------------------------------------------------------------
export const FOODS = {
  breakfast: [
    { id: "oatmeal",  name: "Oatmeal with berries",      carbs: 42, gi: "med",  labeled: false, desc: "Steel-cut oats, blueberries, honey" },
    { id: "bagel",    name: "Bagel & cream cheese",      carbs: 62, gi: "fast", labeled: true,  desc: "From the bakery downstairs" },
    { id: "eggs",     name: "Eggs & avocado toast",      carbs: 26, gi: "med",  labeled: false, desc: "Two eggs, seeded toast" },
    { id: "yogurt",   name: "Greek yogurt & granola",    carbs: 34, gi: "med",  labeled: true,  desc: "Carbs on the label" },
    { id: "pancakes", name: "Pancakes & syrup",          carbs: 78, gi: "fast", labeled: false, desc: "Syrup is nearly pure sugar" },
    { id: "skipbf",   name: "Just black coffee",         carbs: 2,  gi: "fast", labeled: true,  desc: "Skipping breakfast" },
  ],
  lunch: [
    { id: "salad",    name: "Chicken salad",             carbs: 18, gi: "med",  labeled: false, desc: "Greens, chicken, croutons" },
    { id: "sandwich", name: "Turkey sandwich & apple",   carbs: 52, gi: "med",  labeled: false, desc: "Whole-grain, plus the apple" },
    { id: "burrito",  name: "Burrito bowl",              carbs: 68, gi: "med",  labeled: false, desc: "Rice adds up fast" },
    { id: "ramen",    name: "Ramen",                     carbs: 72, gi: "fast", labeled: false, desc: "Noodles from the place next door" },
    { id: "sushi",    name: "Sushi set",                 carbs: 64, gi: "med",  labeled: false, desc: "Sticky rice hides carbs" },
    { id: "soup",     name: "Lentil soup & roll",        carbs: 44, gi: "slow", labeled: false, desc: "Fiber slows the rise" },
  ],
  dinner: [
    { id: "pizza",    name: "Pizza, three slices",       carbs: 84, gi: "slow", labeled: false, desc: "Fat delays the spike for hours" },
    { id: "pasta",    name: "Pasta bolognese",           carbs: 76, gi: "med",  labeled: false, desc: "Generous bowl, garlic bread" },
    { id: "stirfry",  name: "Stir-fry & rice",           carbs: 58, gi: "med",  labeled: false, desc: "Lots of veg, a cup of rice" },
    { id: "salmon",   name: "Salmon & potatoes",         carbs: 38, gi: "med",  labeled: false, desc: "Balanced plate" },
    { id: "curry",    name: "Chickpea curry & naan",     carbs: 70, gi: "slow", labeled: false, desc: "Rich — slow, long absorption" },
    { id: "tacos",    name: "Three tacos",               carbs: 48, gi: "med",  labeled: false, desc: "Corn tortillas, beans" },
  ],
  snack: [
    { id: "apple",    name: "Apple",                     carbs: 22, gi: "med",  labeled: false, desc: "Fruit sugar with fiber" },
    { id: "bar",      name: "Protein bar",               carbs: 24, gi: "med",  labeled: true,  desc: "Label: 24 g" },
    { id: "chips",    name: "Bag of chips",              carbs: 30, gi: "med",  labeled: true,  desc: "Label: 30 g" },
    { id: "nuts",     name: "Handful of almonds",        carbs: 6,  gi: "slow", labeled: false, desc: "Barely moves glucose" },
    { id: "cookie",   name: "Office cookies, two",       carbs: 36, gi: "fast", labeled: false, desc: "They were just sitting there" },
    { id: "nosnack",  name: "Skip it",                   carbs: 0,  gi: "med",  labeled: true,  desc: "Not hungry" },
  ],
  treat: [
    { id: "juice",    name: "Juice box",                 carbs: 18, gi: "fast", labeled: true,  desc: "Classic low treatment" },
    { id: "tabs",     name: "Glucose tabs, four",        carbs: 16, gi: "fast", labeled: true,  desc: "Made for exactly this" },
    { id: "candy",    name: "Gummy candies",             carbs: 25, gi: "fast", labeled: true,  desc: "Easy to overdo while shaky" },
  ],
};

export const PORTIONS = [
  { id: "half",   label: "Half",    mult: 0.55 },
  { id: "normal", label: "Regular", mult: 1.0 },
  { id: "large",  label: "Large",   mult: 1.45 },
];

export const EXERCISES = [
  { id: "gym",  label: "Gym session · 45 min", desc: "Weights and cardio. Big glucose draw, hours of after-effect.", duration: 45, uptake: 1.3, sensHours: 6, sensMult: 1.5, adrenaline: 0.3, energy: 12 },
  { id: "run",  label: "Run · 30 min", desc: "Steady cardio drops glucose fast while you move.", duration: 30, uptake: 1.7, sensHours: 5, sensMult: 1.45, adrenaline: 0.1, energy: 10 },
  { id: "walk", label: "Walk home · 25 min", desc: "Gentle. A post-meal walk flattens spikes.", duration: 25, uptake: 0.8, sensHours: 2, sensMult: 1.15, adrenaline: 0, energy: 6 },
  { id: "rest", label: "Rest tonight", desc: "Sometimes you're just done.", duration: 0, uptake: 0, sensHours: 0, sensMult: 1, adrenaline: 0, energy: 3 },
];

// ------------------------------------------------------------
// Insights — shown on summary cards; occasionally as toasts
// ------------------------------------------------------------
export const FACTS = [
  "Type 1 diabetes is autoimmune: the body destroys its own insulin-producing beta cells. It isn't caused by diet or lifestyle, and it can begin at any age.",
  "A person with T1D makes an estimated 180+ extra decisions every day: carbs, doses, timing, exercise, stress, sleep.",
  "Insulin is not a cure — it's life support. Before 1921, a T1D diagnosis was fatal within months.",
  "HbA1c reflects average glucose over about three months. Most adults with T1D aim for under 7%.",
  "Time in Range — 70–180 mg/dL (3.9–10 mmol/L) — is the modern daily goal. 70% in range is considered strong control.",
  "A low can hit in minutes: shaking, sweating, confusion. The fix is fast sugar — then the hard part, waiting 15 minutes without overeating.",
  "The pizza effect: high-fat meals digest so slowly that glucose keeps rising hours after the insulin dose has faded.",
  "Pre-bolusing — insulin 15–20 minutes before eating — gives it a head start and flattens the spike.",
  "Exercise lowers glucose during activity and raises insulin sensitivity for up to 24 hours. Overnight lows after a gym day are common.",
  "Stress hormones raise blood glucose. A hard meeting can spike you as surely as a snack.",
  "The dawn phenomenon: early-morning hormones push glucose up before you even wake.",
  "A CGM reads the fluid under the skin, not blood — it runs 5–10 minutes behind, which matters when things move fast.",
  "Insulin beyond what food requires stores the surplus as fat. Chronic over-dosing builds weight.",
  "Chronically high glucose damages small vessels and nerves — that's the long-term threat to eyes, kidneys and feet.",
  "Untreated highs lead to DKA: starved of usable glucose, the body burns fat into acidic ketones. A medical emergency.",
  "People with T1D do everything everyone else does. It just runs on top of a constant background computation no one sees.",
  "One bad night of sleep measurably reduces insulin sensitivity the next day.",
  "Pump sites and sensors are worn 24/7 and rotated across the body — finding unbruised skin becomes a skill.",
  "Night-time lows are the fear that keeps partners of people with T1D awake. CGM alarms changed that.",
  "There is no mild type 1, and no day off. The reward for a perfect day is doing it again tomorrow.",
];

export const ABOUT_HTML = `
  <p><b>Type 1 diabetes (T1D)</b> is an autoimmune condition: the immune system destroys the
  <b>beta cells</b> of the pancreas — the only cells that make <b>insulin</b>. Without insulin,
  glucose can't enter cells; it piles up in the blood while the body starves. T1D is not caused
  by sugar or lifestyle, can't be prevented, and can't yet be cured.</p>

  <h3>Living with it</h3>
  <div class="mini-diagram">
    <div><b>Count carbs</b> in everything — labels, estimates, restaurant guesswork.</div>
    <div><b>Dose insulin</b> by pump or pens, matched to food, activity and stress.</div>
    <div><b>Watch the CGM</b> — arrows, trends and alarms, including at 3 a.m.</div>
  </div>

  <h3>The tightrope</h3>
  <p>Too little insulin and glucose climbs: thirst, fatigue, long-term organ damage, eventually DKA.
  Too much and it crashes: shaking, confusion, unconsciousness within minutes. Food pushes one way;
  insulin and movement push the other; stress, sleep and hormones shove from the sides.</p>

  <h3>This simulation</h3>
  <p>You'll live a week of those decisions and aim for the long-game prize — a healthy <b>HbA1c</b>.
  The physiology is simplified for play; the challenges are not.</p>
`;

export function symptomText(bg) {
  if (bg < 54)  return "Severe low — shaking, sweating, can't think";
  if (bg < 70)  return "Low — shaky, cold sweat, foggy";
  if (bg <= 180) return "";
  if (bg <= 250) return "High — thirsty, dull headache";
  return "Very high — parched, exhausted, blurry";
}
