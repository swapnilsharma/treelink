// ============================================================
// Life in Range — clay-style 3D character system
//
// One base body, interchangeable parts. Soft rounded forms, no
// outlines, warm muted palette. Head ≈ 25% of height. All
// variants share the same group skeleton and animation set:
//   root → hips → torso → head ; arms ; legs
// Config: { skin, hairStyle, hairColor, body, top, topColor,
//           bottom, bottomColor, shoes, glasses, watch, cap,
//           bag, therapy }
// ============================================================
import * as THREE from "../vendor/three.module.min.js";
import { SKIN_TONES, HAIR_COLORS, TOP_COLORS, BOTTOM_COLORS } from "./data.js";

const clay = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0 });
const darken = (hex, f = 0.8) => "#" + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, "0")).join("");

function capsule(r, len, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), mat);
  m.position.set(x, y, z);
  return m;
}
function ball(r, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat);
  m.position.set(x, y, z);
  return m;
}
function box(w, h, d, mat, x = 0, y = 0, z = 0, r = 0.02) {
  // rounded-ish box: plain box reads fine at clay roughness
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d, 1, 1, 1), mat);
  m.position.set(x, y, z);
  return m;
}

// Body-type parameters: torso width/depth, limb thickness, belly
const BODY_PARAMS = [
  { w: 0.86, d: 0.78, limb: 0.85, belly: 0,    shoulder: 0.95 }, // lean
  { w: 1.0,  d: 0.88, limb: 1.0,  belly: 0,    shoulder: 1.0  }, // average
  { w: 1.1,  d: 0.92, limb: 1.1,  belly: 0,    shoulder: 1.18 }, // athletic
  { w: 1.28, d: 1.28, limb: 1.15, belly: 0,    shoulder: 1.02 }, // heavy — bulk carried in the torso itself
];

export function buildCharacter(cfg) {
  const skin = SKIN_TONES[cfg.skin ?? 1];
  const hairC = HAIR_COLORS[cfg.hairColor ?? 0];
  const topC = TOP_COLORS[cfg.topColor ?? 0];
  const botC = BOTTOM_COLORS[cfg.bottomColor ?? 0];
  const B = BODY_PARAMS[cfg.body ?? 1];
  const top = cfg.top ?? 0;       // 0 tshirt 1 shirt 2 sweater 3 hoodie 4 cardigan 5 jacket
  const bottom = cfg.bottom ?? 0; // 0 jeans 1 chinos 2 shorts 3 skirt
  const shoes = cfg.shoes ?? 0;   // 0 sneakers 1 casual 2 boots

  const skinM = clay(skin), topM = clay(topC), botM = clay(botC), hairM = clay(hairC);
  const root = new THREE.Group();
  const parts = { root };

  // ---------------- legs ----------------
  const legLen = 0.5, hipY = 0.74, hipX = 0.085 * B.w + (bottom === 3 ? 0.01 : 0);
  const legR = 0.062 * B.limb;
  const mkLeg = (side) => {
    const g = new THREE.Group();
    g.position.set(hipX * side, hipY, 0);
    const isShorts = bottom === 2, isSkirt = bottom === 3;
    // skin leg (visible for shorts/skirt below hem)
    g.add(capsule(legR * 0.88, legLen - 0.1, skinM, 0, -legLen / 2 - 0.04, 0));
    if (!isShorts && !isSkirt) {
      g.add(capsule(legR * 1.12, legLen - 0.06, botM, 0, -legLen / 2 - 0.02, 0));
    } else if (isShorts) {
      g.add(capsule(legR * 1.16, 0.14, botM, 0, -0.1, 0));
    }
    // shoe
    const shoeM = clay(shoes === 0 ? "#e8e4dc" : shoes === 1 ? "#7a5a40" : "#3a342e");
    const sh = ball(legR * 1.35, shoeM, 0, -legLen - 0.075, 0.035);
    sh.scale.set(1, shoes === 2 ? 0.95 : 0.7, 1.65);
    g.add(sh);
    if (shoes === 2) g.add(capsule(legR * 1.2, 0.07, shoeM, 0, -legLen - 0.02, 0)); // boot shaft
    return g;
  };
  parts.legL = mkLeg(-1); parts.legR = mkLeg(1);
  root.add(parts.legL, parts.legR);

  // ---------------- hips / pelvis ----------------
  const hips = ball(0.155 * B.w, bottom === 3 ? topM : botM, 0, hipY + 0.02, 0);
  hips.scale.set(1, 0.78, B.d * 0.82);
  root.add(hips);
  if (bottom === 3) { // skirt: soft cone hips→knee
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * B.w, 0.21 * B.w, 0.38, 18), botM);
    skirt.position.y = hipY - 0.13;
    root.add(skirt);
  }

  // ---------------- torso ----------------
  const torso = new THREE.Group();
  torso.position.y = hipY + 0.06;
  parts.torso = torso;
  root.add(torso);

  const torsoR = 0.155 * B.w, torsoLen = 0.34;
  const chest = capsule(torsoR, torsoLen, topM, 0, torsoLen / 2 + 0.07, 0);
  chest.scale.z = B.d * 0.82;
  torso.add(chest);
  if (B.belly > 0) {
    const belly = ball(torsoR * 1.06, topM, 0, 0.13, B.belly * 0.45);
    belly.scale.set(1.02, 1.05, 0.85);
    torso.add(belly);
  }
  const shoulderY = torsoLen + 0.1, shoulderX = (torsoR + 0.035) * B.shoulder;

  // ---- top-specific details ----
  const inner = clay("#ddd6c8");
  if (top === 1) { // shirt: collar + buttons
    const col = ball(0.075, clay(darken(topC, 0.82)), 0, shoulderY + 0.015, 0.02);
    col.scale.set(1.5, 0.5, 1.1);
    torso.add(col);
    for (let i = 0; i < 3; i++) torso.add(ball(0.012, inner, 0, shoulderY - 0.08 - i * 0.09, torsoR * B.d * 0.82 + 0.004));
  }
  if (top === 2) { // sweater: ribbed high collar
    const col = ball(0.085, clay(darken(topC, 0.85)), 0, shoulderY + 0.02, 0);
    col.scale.set(1.3, 0.55, 1.05);
    torso.add(col);
  }
  if (top === 3) { // hoodie: hood behind neck + kangaroo pocket + strings
    const hood = ball(0.13, clay(darken(topC, 0.85)), 0, shoulderY + 0.02, -0.1);
    hood.scale.set(1.15, 0.75, 0.7);
    torso.add(hood);
    torso.add(box(0.16, 0.09, 0.02, clay(darken(topC, 0.88)), 0, 0.1, torsoR * B.d * 0.82 + 0.005));
    for (const s of [-1, 1]) torso.add(capsule(0.008, 0.07, inner, 0.045 * s, shoulderY - 0.09, torsoR * B.d * 0.82 + 0.01));
  }
  if (top === 4 || top === 5) { // cardigan / jacket: open front, inner tee
    const innerM = top === 5 ? clay("#cfc6b4") : inner;
    const panel = box(0.085, torsoLen + 0.1, 0.03, innerM, 0, torsoLen / 2 + 0.06, torsoR * B.d * 0.82 - 0.012);
    torso.add(panel);
    for (const s of [-1, 1]) {
      const lapel = box(0.035, torsoLen + 0.06, 0.02, clay(darken(topC, 0.8)), 0.075 * s, torsoLen / 2 + 0.07, torsoR * B.d * 0.82 + 0.002);
      lapel.rotation.y = -0.18 * s;
      torso.add(lapel);
    }
  }

  // ---------------- arms ----------------
  const armLen = 0.34, armR = 0.05 * B.limb;
  const sleeveLen = top === 0 ? 0.13 : armLen; // t-shirt: short sleeves
  const mkArm = (side) => {
    const g = new THREE.Group();
    g.position.set(shoulderX * side, shoulderY - 0.02, 0);
    g.rotation.z = 0.1 * side;
    g.add(ball(armR * 1.5, topM, 0, 0.01, 0)); // shoulder cap
    g.add(capsule(armR * 0.92, armLen - 0.08, skinM, 0, -armLen / 2, 0));
    g.add(capsule(armR * 1.25, Math.max(0.04, sleeveLen - 0.08), topM, 0, -sleeveLen / 2 + 0.01, 0));
    g.add(ball(armR * 1.25, skinM, 0, -armLen - 0.035, 0)); // hand
    return g;
  };
  parts.armL = mkArm(-1); parts.armR = mkArm(1);
  torso.add(parts.armL, parts.armR);
  // both arm groups pivot at the shoulder → shared animation set

  // CGM sensor — back of the left upper arm, always worn
  const cgm = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.016, 14), clay("#e8e6e0"));
  cgm.rotation.z = Math.PI / 2;
  cgm.position.set(-armR * 1.15, -0.1, -0.01);
  parts.armL.add(cgm);

  // watch — right wrist
  if (cfg.watch) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(armR * 1.15, armR * 1.15, 0.025, 12), clay("#3a3a3c"));
    w.position.set(0, -armLen + 0.05, 0);
    parts.armR.add(w);
    parts.armR.add(box(0.026, 0.018, 0.012, clay("#56606a"), 0, -armLen + 0.05, armR * 1.2));
  }

  // insulin pump — right hip, with a short tube to the abdomen
  if (cfg.therapy === "pump") {
    const pump = box(0.05, 0.07, 0.028, clay("#46606e"), 0.13 * B.w, 0.06, B.d * 0.1);
    pump.rotation.y = -0.3;
    torso.add(pump);
    const tubePts = [new THREE.Vector3(0.13 * B.w, 0.1, B.d * 0.11), new THREE.Vector3(0.06, 0.16, torsoR * B.d * 0.82), new THREE.Vector3(0.0, 0.22, torsoR * B.d * 0.82 + 0.005)];
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tubePts), 12, 0.006, 6), clay("#cfd6da"));
    torso.add(tube);
  }

  // crossbody bag
  if (cfg.bag) {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(torsoR * 1.45, 0.014, 8, 24), clay("#6f5236"));
    strap.position.y = shoulderY - 0.12;
    strap.rotation.set(0.12, 0, 0.6);
    strap.scale.z = B.d * 0.85;
    torso.add(strap);
    const pouch = box(0.1, 0.085, 0.045, clay("#7a5a3c"), -(torsoR + 0.05) * 1.05, -0.02, 0.02);
    torso.add(pouch);
  }

  // ---------------- head ----------------
  const head = new THREE.Group();
  head.position.y = shoulderY + 0.05;
  parts.head = head;
  torso.add(head);

  head.add(capsule(0.05, 0.05, skinM, 0, 0.01, 0)); // neck
  const headR = 0.205;
  const skull = ball(headR, skinM, 0, 0.21, 0);
  skull.scale.set(1, 1.08, 0.96);
  head.add(skull);
  // ears
  for (const s of [-1, 1]) head.add(ball(0.035, skinM, headR * 0.95 * s, 0.2, 0));

  // face — front z+
  const faceZ = headR * 0.96 - 0.012;
  const eyeM = clay("#2b2521");
  parts.eyeL = ball(0.0235, eyeM, -0.072, 0.225, faceZ); parts.eyeL.scale.z = 0.55;
  parts.eyeR = ball(0.0235, eyeM, 0.072, 0.225, faceZ); parts.eyeR.scale.z = 0.55;
  head.add(parts.eyeL, parts.eyeR);
  const browM = clay(darken(hairC, 1.05));
  parts.browL = box(0.062, 0.014, 0.014, browM, -0.072, 0.288, faceZ);
  parts.browR = box(0.062, 0.014, 0.014, browM, 0.072, 0.288, faceZ);
  head.add(parts.browL, parts.browR);
  const nose = ball(0.02, clay(darken(skin, 0.93)), 0, 0.175, faceZ + 0.01);
  head.add(nose);
  parts.mouth = box(0.05, 0.011, 0.012, clay(darken(skin, 0.62)), 0, 0.115, faceZ);
  head.add(parts.mouth);
  // soft blush
  for (const s of [-1, 1]) {
    const bl = ball(0.026, clay(darken(skin, 0.88)), 0.105 * s, 0.16, faceZ - 0.018);
    bl.scale.z = 0.3;
    head.add(bl);
  }

  // ---------------- hair ----------------
  const hg = new THREE.Group(); // hair, in head-group space (skull center y 0.21)
  head.add(hg);
  const style = cfg.hairStyle ?? 0;
  // back shell: covers crown/back/sides but stops short of the face
  // plane, so eyes, brows and mouth always stay on open skin
  const shell = (rMul = 1.05, zScale = 0.78, yOff = 0) => {
    const c = ball(headR * rMul, hairM, 0, 0.215 + yOff, -0.05);
    c.scale.set(1.02, 1.04, zScale);
    return c;
  };
  // fringe: a flattened ball over the forehead, above the brows
  const fringe = (w = 1.35, yOff = 0) => {
    const f = ball(headR * 0.6, hairM, 0, 0.36 + yOff, 0.075);
    f.scale.set(w, 0.55, 0.95);
    return f;
  };
  switch (style) {
    case 0: // short
      hg.add(shell(1.03, 0.74), fringe(1.25));
      break;
    case 1: // medium — covers ears, jaw-length
      hg.add(shell(1.07, 0.82), fringe(1.4));
      for (const s of [-1, 1]) hg.add(capsule(0.05, 0.1, hairM, headR * 0.92 * s, 0.06, -0.04));
      break;
    case 2: { // long — falls past the shoulders
      hg.add(shell(1.07, 0.82), fringe(1.4));
      const back = capsule(0.11, 0.32, hairM, 0, -0.08, -headR * 0.7);
      back.scale.x = 1.5;
      hg.add(back);
      for (const s of [-1, 1]) hg.add(capsule(0.048, 0.26, hairM, headR * 0.94 * s, -0.02, -0.03));
      break;
    }
    case 3: { // curly — cluster of soft spheres around the crown
      const offs = [[0, 0.17, 0.02], [-0.11, 0.14, 0.05], [0.11, 0.14, 0.05], [-0.15, 0.1, -0.05], [0.15, 0.1, -0.05], [0, 0.13, -0.12], [-0.07, 0.18, -0.06], [0.07, 0.18, -0.06], [0, 0.2, -0.03]];
      for (const [x, y, z] of offs) hg.add(ball(0.082, hairM, x, y + 0.16, z));
      break;
    }
    case 4: // coily — full rounded crown
      hg.add(shell(1.16, 0.85, 0.05), fringe(1.5, 0.04));
      break;
    case 5: // bun
      hg.add(shell(1.04, 0.76), fringe(1.25));
      hg.add(ball(0.075, hairM, 0, 0.21 + headR * 0.95, -headR * 0.5));
      break;
    case 6: { // ponytail
      hg.add(shell(1.04, 0.76), fringe(1.25));
      const tail = capsule(0.05, 0.18, hairM, 0, 0.1, -headR * 1.05);
      tail.rotation.x = 0.4;
      hg.add(tail);
      hg.add(ball(0.055, hairM, 0, 0.27, -headR * 0.98));
      break;
    }
    default: break; // bald
  }

  // glasses
  if (cfg.glasses) {
    const gm = clay("#33302c");
    for (const s of [-1, 1]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.0075, 8, 20), gm);
      ring.position.set(0.072 * s, 0.225, faceZ + 0.012);
      head.add(ring);
    }
    head.add(box(0.05, 0.008, 0.008, gm, 0, 0.232, faceZ + 0.012));
    for (const s of [-1, 1]) head.add(box(0.008, 0.008, 0.14, gm, 0.118 * s, 0.235, faceZ - 0.06));
  }

  // cap (worn over hair)
  if (cfg.cap) {
    const capM = clay("#5c6b5a");
    const dome = ball(headR * 1.08, capM, 0, 0.27, -0.015);
    dome.scale.set(1, 0.62, 0.98);
    head.add(dome);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.115, 0.018, 16, 1, false, -Math.PI / 2, Math.PI), capM);
    brim.position.set(0, 0.27, headR * 0.7);
    head.add(brim);
  }

  // gentle forward-facing default
  root.rotation.y = 0;
  return { root, parts, cfg };
}

// ------------------------------------------------------------
// Shared animation set — same rig for every character.
// state: { walking, mood: "ok"|"low"|"high"|"happy" }
// ------------------------------------------------------------
export function animateCharacter(char, t, state = {}) {
  const p = char.parts;
  const mood = state.mood || "ok";
  const walking = !!state.walking;

  // breathing
  const breath = Math.sin(t * 1.7) * 0.012;
  p.torso.scale.y = 1 + breath;
  p.torso.position.y = 0.8 + breath * 0.18;

  // idle sway / walk cycle
  if (walking) {
    const w = Math.sin(t * 7);
    p.legL.rotation.x = w * 0.45;
    p.legR.rotation.x = -w * 0.45;
    p.armL.rotation.x = -w * 0.35;
    p.armR.rotation.x = w * 0.35;
    p.root.position.y = Math.abs(Math.cos(t * 7)) * 0.02;
  } else {
    p.legL.rotation.x = 0; p.legR.rotation.x = 0;
    p.armL.rotation.x = Math.sin(t * 1.7 + 1) * 0.03;
    p.armR.rotation.x = Math.sin(t * 1.7) * 0.03;
    p.root.position.y = 0;
  }

  // posture & brows carry the mood
  if (mood === "low") {
    p.torso.rotation.x = 0.12;                       // slump
    p.head.rotation.x = 0.14;
    p.browL.rotation.z = -0.35; p.browR.rotation.z = 0.35;  // worried
    p.browL.position.y = 0.295; p.browR.position.y = 0.295;
    p.mouth.scale.x = 0.6;
  } else if (mood === "high") {
    p.torso.rotation.x = 0.05;
    p.head.rotation.x = 0.06;
    p.head.rotation.z = Math.sin(t * 0.8) * 0.02;    // weary drift
    p.browL.rotation.z = 0; p.browR.rotation.z = 0;
    p.browL.position.y = 0.278; p.browR.position.y = 0.278; // heavy lids
    p.mouth.scale.x = 0.8;
  } else if (mood === "happy") {
    p.torso.rotation.x = -0.02;
    p.head.rotation.x = -0.03;
    p.browL.rotation.z = 0.1; p.browR.rotation.z = -0.1;
    p.browL.position.y = 0.295; p.browR.position.y = 0.295;
    p.mouth.scale.x = 1.25;
  } else {
    p.torso.rotation.x = 0;
    p.head.rotation.x = Math.sin(t * 0.6) * 0.02;
    p.head.rotation.z = Math.sin(t * 0.43) * 0.015;
    p.browL.rotation.z = 0; p.browR.rotation.z = 0;
    p.browL.position.y = 0.288; p.browR.position.y = 0.288;
    p.mouth.scale.x = 1;
  }

  // blink every ~3.4 s
  const blink = (t % 3.4) > 3.25 ? 0.12 : 1;
  p.eyeL.scale.y = blink; p.eyeR.scale.y = blink;
}

export function disposeCharacter(char) {
  char.root.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
}
