"use client";

import React, { useEffect, useRef, useState } from "react";

// ============================================================================
// CLAWD LOADING VISUALS
// ----------------------------------------------------------------------------
// Animasi karakter Clawd (pure SVG, transparan) untuk semua state loading.
// Prinsip animasi yang dipakai supaya tidak kaku:
//   - Anticipation  : ancang-ancang sebelum lompat / lempar
//   - Squash/stretch: badan memanjang saat lompat & mengempis saat mendarat
//   - Follow-through: props & tangan ikut lewat spring (pegas teredam)
//   - Pose blending : perpindahan pose lewat keyframe ber-easing / spring
//   - Blink masking : kedip otomatis saat ekspresi berganti
//   - Timing variety: tiap beat punya durasi berbeda + micro-action acak
// Semua loader berbagi satu requestAnimationFrame global (hemat CPU),
// waktu animasi tidak reset saat props berubah, ikut tema Terang/Gelap,
// dan menghormati setting "prefers-reduced-motion".
// ============================================================================

// ============================================================================
// 1. PALETTE & MATH HELPERS
// ============================================================================
const PAL = {
  ink: "#2B2233",
  clay: "#D97757",
  clayDk: "#A84D33",
  clayLt: "#F2A283",
  orange: "#F97316",
  rose: "#E27A92",
  ochre: "#E8AA38",
  emerald: "#10B981",
  teal: "#3A9C98",
  violet: "#7B5CA8",
  cream: "#FFF5E2",
  sky: "#8EC3E6",
  wood: "#9C6B43",
  woodDk: "#734B2B",
};

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const lerpArr = (a: number[], b: number[], k: number) =>
  a.map((v, i) => lerp(v, b[i] ?? v, k));
const ease = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = (x: number) => Math.pow(clamp(x), 3);
const backOut = (x: number) => {
  const c = clamp(x);
  const s = 1.75;
  return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2);
};
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const f1 = (n: number) => Number(n).toFixed(1);

function kf(t: number, keys: [number, number][], fn = ease): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1];
      const [b, vb] = keys[i];
      return lerp(va, vb, fn((t - a) / (b - a)));
    }
  }
  return keys[keys.length - 1][1];
}

function kf3(t: number, keys: [number, number[]][], fn = ease): number[] {
  if (t <= keys[0][0]) return keys[0][1].slice();
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1];
      const [b, vb] = keys[i];
      return lerpArr(va, vb, fn((t - a) / (b - a)));
    }
  }
  return keys[keys.length - 1][1].slice();
}

// Damped spring (semi-implicit Euler) for follow-through & smooth pose moves
class Spring {
  x: number;
  v = 0;
  constructor(x0 = 0) {
    this.x = x0;
  }
  step(target: number, dt: number, k = 170, c = 18) {
    const a = k * (target - this.x) - c * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
    return this.x;
  }
}

type SceneState = Record<string, any>;

function spr(st: SceneState, key: string, init: number): Spring {
  if (!st[key]) st[key] = new Spring(init);
  return st[key] as Spring;
}

// Close eyes briefly whenever the expression changes -> masks the pose "pop"
function faceBlink(st: SceneState, id: string, key: string, t: number) {
  const k = `__face_${id}`;
  if (!st[k]) st[k] = { key, at: -1 };
  const s = st[k];
  if (s.key !== key) {
    s.key = key;
    s.at = t;
  }
  return s.at >= 0 && t - s.at < 0.075;
}

// Hop with anticipation squat, stretch in the air, and damped landing squash.
// dy is in "u" units (drawClawd multiplies by u).
function hopCurve(c: number, takeoff: number, air: number, height: number) {
  let dy = 0;
  let sq = 0;
  const pre = 0.13;
  if (c >= takeoff - pre && c < takeoff) {
    sq = 0.13 * ease((c - (takeoff - pre)) / pre);
  } else if (c >= takeoff && c < takeoff + air) {
    const p = (c - takeoff) / air;
    dy = -height * 4 * p * (1 - p);
    sq = p < 0.15 ? lerp(0.13, -0.11, p / 0.15) : lerp(-0.11, 0, (p - 0.15) / 0.85);
  } else if (c >= takeoff + air && c < takeoff + air + 0.5) {
    const q = c - takeoff - air;
    sq = 0.16 * Math.exp(-q * 8) * Math.cos(q * 19);
  }
  return { dy, sq };
}

// ============================================================================
// 2. SHARED rAF TICKER (one loop for every visible loader)
// ============================================================================
let _seed = 1;
let _boilFrame = 0;
let _boilAmp = 1;

type TickerCb = (now: number, dt: number) => void;
const subscribers = new Set<TickerCb>();
let globalRafId: number | null = null;
let lastGlobalTs = 0;

function tickGlobal(now: number) {
  const dt = Math.min(0.05, Math.max(0, (now - lastGlobalTs) / 1000));
  lastGlobalTs = now;
  _boilFrame = Math.floor(now / 110);
  subscribers.forEach((cb) => cb(now, dt));
  globalRafId = subscribers.size > 0 ? requestAnimationFrame(tickGlobal) : null;
}

function subscribeTicker(cb: TickerCb) {
  subscribers.add(cb);
  if (globalRafId === null) {
    lastGlobalTs = performance.now();
    globalRafId = requestAnimationFrame(tickGlobal);
  }
  return () => {
    subscribers.delete(cb);
    if (subscribers.size === 0 && globalRafId !== null) {
      cancelAnimationFrame(globalRafId);
      globalRafId = null;
    }
  };
}

function boilSeed(key: string) {
  let h = 2166136261;
  const s = `${key}|${_boilFrame}`;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  _seed = h >>> 0 || 1;
}
const rnd = () => (_seed = (_seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const jit = (a: number) => (rnd() * 2 - 1) * a * _boilAmp;

function checkIsDark() {
  if (typeof document === "undefined") return true;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

interface SceneCtx {
  t: number;
  dt: number;
  isDark: boolean;
  st: SceneState;
}

// Hook: persistent clock (never resets on prop change), theme-reactive,
// reduced-motion aware, with a soft pop-in intro on first appearance.
function useClawdScene(render: (ctx: SceneCtx) => string, cx: number, cy: number) {
  const svgRef = useRef<SVGSVGElement>(null);
  const renderRef = useRef(render);

  useEffect(() => {
    renderRef.current = render;
  });

  useEffect(() => {
    const st: SceneState = {};
    let time = 0;
    let isDark = checkIsDark();

    const onThemeChange = () => {
      isDark = checkIsDark();
    };
    const mo = new MutationObserver(onThemeChange);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const mqDark = window.matchMedia("(prefers-color-scheme: dark)");
    mqDark.addEventListener("change", onThemeChange);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const unsub = subscribeTicker((_, dt) => {
      const sdt = reduced ? dt * 0.35 : dt;
      time += sdt;
      _boilAmp = reduced ? 0 : 1;
      const body = renderRef.current({ t: time, dt: sdt, isDark, st });
      const s = 0.8 + 0.2 * backOut(seg(time, 0, 0.45));
      const op = seg(time, 0, 0.22);
      if (svgRef.current) {
        svgRef.current.innerHTML = `<g opacity="${op.toFixed(2)}" transform="translate(${cx} ${cy}) scale(${s.toFixed(3)}) translate(${-cx} ${-cy})">${body}</g>`;
      }
    });

    return () => {
      unsub();
      mo.disconnect();
      mqDark.removeEventListener("change", onThemeChange);
    };
  }, [cx, cy]);

  return svgRef;
}

// ============================================================================
// 3. CLAWD CHARACTER RIG
// ============================================================================
interface ClawdPose {
  id?: string;
  view?: "front" | "q";
  flip?: boolean;
  sq?: number; // + squash (wide/short), - stretch (tall/thin)
  dy?: number; // vertical offset in u units (negative = up)
  lean?: number;
  rot?: number;
  scale?: number;
  lookX?: number;
  lookY?: number;
  eyes?: "normal" | "happy" | "closed" | "spark" | "wide";
  brows?: "confident" | "focus" | "worried" | null;
  mouth?: "smile" | "grin" | "o" | "flat" | "wobble";
  blush?: number;
  walkPhase?: number; // radians, derived from distance travelled (no foot sliding)
  walkAmp?: number; // 0..1 leg lift amount
  legSwing?: boolean;
  legLift?: number[]; // per-leg extra lift in u units
  armLBack?: boolean;
  armRBack?: boolean;
  handL?: number[];
  handR?: number[];
  propL?: string;
  propR?: string;
  seed?: number;
  forceBlink?: boolean;
}

function drawClawd(
  x: number,
  y: number,
  u: number,
  o: ClawdPose = {},
  t = 0,
  isDark = false
) {
  boilSeed(o.id || "clawd-loader");
  const view = o.view || "front";
  const breath = Math.sin(t * 3.2) * 0.024;
  const sq = (o.sq || 0) + breath;
  const dy = (o.dy || 0) * u;
  const lean = (o.lean || 0) * u;
  const rot = o.rot || 0;
  const sc = o.scale ?? 1;
  const sw = clamp(u * 0.21, 1.3, 2.1);
  const J = u * 0.024;

  const rubberArm = (
    sx0: number,
    sy0: number,
    hx: number,
    hy: number,
    bend = -1,
    propSvg = ""
  ) => {
    const mx = (sx0 + hx) / 2 + bend * u * 0.85;
    const my = (sy0 + hy) / 2 + Math.abs(bend) * u * 0.38;
    const d = `M ${f1(sx0)} ${f1(sy0)} Q ${f1(mx)} ${f1(my)} ${f1(hx)} ${f1(hy)}`;
    return (
      `<g>` +
      `<path d="${d}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(u * 1.1 + sw * 1.5)}" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="${PAL.clay}" stroke-width="${f1(u * 1.1)}" stroke-linecap="round"/>` +
      (propSvg ? `<g transform="translate(${f1(hx)}, ${f1(hy)})">${propSvg}</g>` : "") +
      `</g>`
    );
  };

  const hL = o.handL || [-5.8 * u, -2.6 * u, -0.5];
  const hR = o.handR || [5.8 * u, -2.6 * u, 0.5];
  let inner = "";

  // Ground shadow (stays on the floor, shrinks while airborne)
  const shScale = clamp(1 - (-dy / (u * 8)) * 0.35, 0.55, 1.15);
  inner += `<ellipse cx="0" cy="${f1(-dy + 0.2 * u)}" rx="${f1(4.8 * u * shScale)}" ry="${f1(0.85 * u * shScale)}" fill="${isDark ? "rgba(0,0,0,0.32)" : "rgba(15,23,42,0.12)"}"/>`;

  // Legs
  const amp = o.walkAmp ?? 1;
  [-3.1, -1.1, 1.1, 3.1].forEach((lx, i) => {
    let legY = -2.0 * u;
    let legRot = 0;
    if (o.walkPhase !== undefined) {
      const ph = o.walkPhase + (i % 2 === 0 ? 0 : Math.PI);
      legY += Math.min(0, Math.sin(ph)) * 0.7 * u * amp;
      legRot = Math.cos(ph) * 9 * amp;
    } else if (o.legSwing) {
      legY += Math.sin(t * 4.2 + i * 1.3) * 0.22 * u;
    }
    if (o.legLift && o.legLift[i]) legY -= o.legLift[i] * u;
    inner +=
      `<g transform="translate(${f1(lx * u)}, ${f1(legY)}) rotate(${f1(legRot)})">` +
      `<rect x="${f1(-0.52 * u)}" y="0" width="${f1(1.04 * u)}" height="${f1(1.95 * u)}" rx="${f1(0.36 * u)}" fill="${i % 2 ? PAL.clayDk : PAL.clay}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.8)}"/>` +
      `</g>`;
  });

  if (o.armLBack) {
    inner += rubberArm(-4.5 * u + lean * 0.4, -4.5 * u, hL[0], hL[1], hL[2] ?? -0.6, o.propL || "");
  }
  if (o.armRBack) {
    inner += rubberArm(4.5 * u + lean * 0.4, -4.5 * u, hR[0], hR[1], hR[2] ?? 0.6, o.propR || "");
  }

  // Deformable clay body
  const bw = 5.0 * u * (1 + sq * 0.42);
  const bhTop = -8.0 * u * (1 - sq * 0.52);
  const bhBot = -2.0 * u;
  const tl = [-bw + lean + jit(J), bhTop + jit(J)];
  const tr = [bw + lean + jit(J), bhTop + jit(J)];
  const br = [bw * 0.98 + jit(J), bhBot + jit(J)];
  const bl = [-bw * 0.98 + jit(J), bhBot + jit(J)];
  const bodyD = `M ${f1(tl[0])} ${f1(tl[1])} Q ${f1(lean)} ${f1(bhTop - 0.22 * u)} ${f1(tr[0])} ${f1(tr[1])} L ${f1(br[0])} ${f1(br[1])} Q 0 ${f1(bhBot + 0.14 * u)} ${f1(bl[0])} ${f1(bl[1])} Z`;

  inner += `<path d="${bodyD}" fill="${PAL.clay}"/>`;
  inner += `<ellipse cx="${f1(-1.4 * u + lean * 0.7)}" cy="${f1(bhTop + 1.5 * u)}" rx="${f1(3.0 * u)}" ry="${f1(1.1 * u)}" fill="${PAL.clayLt}" fill-opacity="0.42"/>`;
  inner += `<path d="M ${f1(bl[0] + 0.3 * u)} ${f1(bhBot - 1.2 * u)} L ${f1(br[0] - 0.3 * u)} ${f1(bhBot - 1.2 * u)} L ${f1(br[0] - 0.2 * u)} ${f1(bhBot - 0.15 * u)} L ${f1(bl[0] + 0.2 * u)} ${f1(bhBot - 0.15 * u)} Z" fill="${PAL.clayDk}" fill-opacity="0.28"/>`;
  inner += `<path d="${bodyD}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw)}" stroke-linejoin="round"/>`;

  // Face
  const fcx = (view === "q" ? 1.15 * u : 0) + lean * 0.72;
  const fy = (bhTop + bhBot) / 2 - 0.95 * u;
  const lx = clamp(o.lookX || 0, -1.2, 1.2) * 0.65 * u;
  const ly = clamp(o.lookY || 0, -1.2, 1.2) * 0.5 * u;

  // Natural, slightly irregular blinking (occasional double-blink)
  const bt = t + (o.seed ?? 0.3) * 3;
  const bn = Math.floor(bt / 3.3);
  const bLocal = bt - bn * 3.3;
  const dbl = (Math.imul(bn + 7, 2654435761) >>> 0) % 3 === 0;
  const natural = bLocal < 0.1 || (dbl && bLocal > 0.2 && bLocal < 0.29);
  const eyes = o.eyes || "normal";
  const blink = !!o.forceBlink || (!["happy", "closed", "spark"].includes(eyes) && natural);

  inner += `<g transform="translate(${f1(fcx)}, ${f1(fy)})">`;
  if (o.blush) {
    for (const s of [-1, 1]) {
      inner += `<ellipse cx="${f1(s * 3.5 * u)}" cy="${f1(1.3 * u)}" rx="${f1(0.85 * u)}" ry="${f1(0.42 * u)}" fill="${PAL.rose}" fill-opacity="${f1(0.65 * o.blush)}"/>`;
    }
  }
  for (const s of [-1, 1]) {
    const ex = s * 2.4 * u;
    if (blink || eyes === "closed") {
      inner += `<path d="M ${f1(ex - 0.8 * u)} ${f1(0.2 * u)} Q ${f1(ex)} ${f1(0.55 * u)} ${f1(ex + 0.8 * u)} ${f1(0.2 * u)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw * 1.15)}" stroke-linecap="round"/>`;
    } else if (eyes === "happy") {
      inner += `<path d="M ${f1(ex - 0.9 * u)} ${f1(0.5 * u)} Q ${f1(ex)} ${f1(-0.8 * u)} ${f1(ex + 0.9 * u)} ${f1(0.5 * u)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw * 1.25)}" stroke-linecap="round"/>`;
    } else if (eyes === "spark") {
      const tw = (1 + 0.14 * Math.sin(t * 11)) * 1.22 * u;
      inner += `<path d="M ${f1(ex)} ${f1(-tw)} L ${f1(ex + tw * 0.35)} ${f1(-tw * 0.35)} L ${f1(ex + tw)} 0 L ${f1(ex + tw * 0.35)} ${f1(tw * 0.35)} L ${f1(ex)} ${f1(tw)} L ${f1(ex - tw * 0.35)} ${f1(tw * 0.35)} L ${f1(ex - tw)} 0 L ${f1(ex - tw * 0.35)} ${f1(-tw * 0.35)} Z" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.65)}"/>`;
    } else {
      const ew = eyes === "wide" ? 1.25 * u : 1.05 * u;
      const eh = eyes === "wide" ? 2.35 * u : 2.0 * u;
      inner += `<rect x="${f1(ex - ew / 2 + lx)}" y="${f1(-eh / 2 + ly)}" width="${f1(ew)}" height="${f1(eh)}" rx="${f1(ew * 0.42)}" fill="${PAL.ink}"/>`;
      inner += `<circle cx="${f1(ex - ew * 0.16 + lx)}" cy="${f1(-eh * 0.24 + ly)}" r="${f1(ew * 0.23)}" fill="${PAL.cream}"/>`;
    }
    if (!blink && eyes !== "closed") {
      if (o.brows === "worried") {
        inner += `<line x1="${f1(ex - 0.85 * u)}" y1="${f1(-1.45 * u - s * 0.28 * u)}" x2="${f1(ex + 0.85 * u)}" y2="${f1(-1.45 * u + s * 0.28 * u)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.85)}" stroke-linecap="round"/>`;
      } else if (o.brows === "confident" || o.brows === "focus") {
        const sl = o.brows === "focus" ? 0.25 : 0.12;
        inner += `<line x1="${f1(ex - 0.85 * u)}" y1="${f1(-1.55 * u + s * sl * u)}" x2="${f1(ex + 0.85 * u)}" y2="${f1(-1.55 * u - s * sl * u)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.88)}" stroke-linecap="round"/>`;
      }
    }
  }

  const my = 1.65 * u;
  const mouth = o.mouth || "flat";
  if (mouth === "smile") {
    inner += `<path d="M ${f1(-0.95 * u)} ${f1(my - 0.2 * u)} Q 0 ${f1(my + 0.68 * u)} ${f1(0.95 * u)} ${f1(my - 0.2 * u)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw)}" stroke-linecap="round"/>`;
  } else if (mouth === "grin") {
    inner += `<path d="M ${f1(-1.3 * u)} ${f1(my - 0.28 * u)} L ${f1(1.3 * u)} ${f1(my - 0.28 * u)} Q 0 ${f1(my + 1.2 * u)} ${f1(-1.3 * u)} ${f1(my - 0.28 * u)} Z" fill="#4A1F2A" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.75)}"/>`;
    inner += `<ellipse cx="0" cy="${f1(my + 0.26 * u)}" rx="${f1(0.6 * u)}" ry="${f1(0.22 * u)}" fill="${PAL.rose}"/>`;
  } else if (mouth === "o") {
    inner += `<ellipse cx="0" cy="${f1(my + 0.08 * u)}" rx="${f1(0.5 * u)}" ry="${f1(0.58 * u)}" fill="#4A1F2A"/>`;
  } else if (mouth === "wobble") {
    inner += `<path d="M ${f1(-1.05 * u)} ${f1(my + 0.1 * u)} Q ${f1(-0.5 * u)} ${f1(my - 0.35 * u)} 0 ${f1(my + 0.1 * u)} Q ${f1(0.5 * u)} ${f1(my + 0.45 * u)} ${f1(1.05 * u)} ${f1(my)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.88)}" stroke-linecap="round"/>`;
  } else {
    inner += `<line x1="${f1(-0.68 * u)}" y1="${f1(my)}" x2="${f1(0.68 * u)}" y2="${f1(my)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.88)}" stroke-linecap="round"/>`;
  }
  inner += `</g>`;

  if (!o.armLBack) {
    inner += rubberArm(-4.5 * u + lean * 0.4, -4.5 * u, hL[0], hL[1], hL[2] ?? -0.6, o.propL || "");
  }
  if (!o.armRBack) {
    inner += rubberArm(4.5 * u + lean * 0.4, -4.5 * u, hR[0], hR[1], hR[2] ?? 0.6, o.propR || "");
  }

  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f1(x)}, ${f1(y + dy)}) scale(${f1(sx)}, ${f1(sc)}) rotate(${f1(rot)})">${inner}</g>`;
}

// ============================================================================
// 4. SMALL FX & PROPS
// ============================================================================
function drawSparkle(x: number, y: number, r: number, col = PAL.ochre, op = 1) {
  if (op <= 0.02 || r <= 0.05) return "";
  return `<path d="M ${f1(x)} ${f1(y - r)} L ${f1(x + r * 0.32)} ${f1(y - r * 0.32)} L ${f1(x + r)} ${f1(y)} L ${f1(x + r * 0.32)} ${f1(y + r * 0.32)} L ${f1(x)} ${f1(y + r)} L ${f1(x - r * 0.32)} ${f1(y + r * 0.32)} L ${f1(x - r)} ${f1(y)} L ${f1(x - r * 0.32)} ${f1(y - r * 0.32)} Z" fill="${col}" opacity="${op.toFixed(2)}"/>`;
}

function sparkleBurst(q: number, cx: number, cy: number, n = 6, dist = 18) {
  if (q < 0 || q > 0.7) return "";
  const k = q / 0.7;
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const d = 3 + easeOut(k) * dist;
    s += drawSparkle(
      cx + Math.cos(a) * d,
      cy + Math.sin(a) * d,
      3 * (1 - k * 0.6),
      i % 2 ? PAL.orange : PAL.ochre,
      1 - k
    );
  }
  return s;
}

function dustPuff(q: number, x: number, y: number, isDark: boolean) {
  if (q < 0 || q > 0.4) return "";
  const k = q / 0.4;
  const col = isDark ? "rgba(203,213,225,0.55)" : "rgba(100,116,139,0.4)";
  let s = "";
  for (const side of [-1, 1]) {
    s += `<circle cx="${f1(x + side * (11 + k * 7))}" cy="${f1(y - 1 - k * 2)}" r="${f1(1.1 + k * 2.4)}" fill="${col}" opacity="${(1 - k).toFixed(2)}"/>`;
  }
  return s;
}

function thumbsUpProp(popK = 1) {
  const s = backOut(clamp(popK));
  if (s <= 0.01) return "";
  return (
    `<g transform="scale(${s.toFixed(2)})">` +
    `<rect x="-6.5" y="-6" width="13" height="12" rx="4" fill="${PAL.clay}" stroke="${PAL.ink}" stroke-width="1.9"/>` +
    `<rect x="-2.5" y="-16" width="7" height="12" rx="3.5" fill="${PAL.clayLt}" stroke="${PAL.ink}" stroke-width="1.9"/>` +
    `<path d="M 10 -14 L 15 -19 M 12 -8 L 18 -9 M 3 -20 L 5 -25" stroke="${PAL.ochre}" stroke-width="2" stroke-linecap="round"/>` +
    `</g>`
  );
}

function surface(isDark: boolean) {
  return isDark ? "#1E293B" : "#FFFFFF";
}

// ============================================================================
// 5. SCENE: PAGE & TOOL WORKSPACE LOADER
// ----------------------------------------------------------------------------
// Clawd berjalan membawa tumpukan modul -> ancang-ancang -> melempar modul ke
// layar laptop (kotak menyala) -> lompat senang sambil berbalik di udara ->
// jalan kembali -> modul baru jatuh ke tumpukan -> lompat berbalik -> ulang.
// ============================================================================
function renderPageScene({ t, dt, isDark, st }: SceneCtx) {
  const L = 4.8;
  const U = 4.3;
  const G = 69;
  const X0 = 30;
  const X1 = 74;
  const stride = (X1 - X0) / 7; // integer steps -> feet land exactly at stops

  const n = Math.floor(t / L);
  const c = t - n * L;
  const walkMix = (p: number) => lerp(clamp(p), ease(p), 0.55);

  let x = X0;
  let dist = 0;
  let moving = false;
  if (c < 1.4) {
    x = lerp(X0, X1, walkMix(c / 1.4));
    dist = x - X0;
    moving = true;
  } else if (c < 2.95) {
    x = X1;
  } else if (c < 4.3) {
    x = lerp(X1, X0, walkMix((c - 2.95) / 1.35));
    dist = X1 - x;
    moving = true;
  }
  const walkPhase = moving ? (dist / stride) * Math.PI : undefined;
  const flip = c >= 2.66 && c < 4.64; // turns around at the apex of each hop

  // Hops (celebration + refill) incl. landing tail wrapping into next loop
  const hA = hopCurve(c, 2.5, 0.32, 2.2);
  const hB = hopCurve(c, 4.5, 0.28, 1.6);
  const hB2 = hopCurve(c + L, 4.5, 0.28, 1.6);
  const bob = walkPhase !== undefined ? -Math.abs(Math.sin(walkPhase)) * 0.32 : 0;
  const dy = hA.dy + hB.dy + hB2.dy + bob;
  const sq = hA.sq + hB.sq + hB2.sq;

  // Stack follow-through: leans back while walking, overshoots on stops
  const prevX = st.px ?? x;
  const vx = dt > 0 ? (x - prevX) / dt : 0;
  st.px = x;
  const tilt = spr(st, "tilt", 0).step(-Math.min(16, Math.abs(vx) * 0.42), dt, 140, 11);

  const handR = kf3(c, [
    [0, [17, -14, 0.45]],
    [1.4, [17, -14, 0.45]],
    [1.72, [5, -31, 0.8]],
    [1.9, [27, -31, 0.2]],
    [2.35, [17, -14, 0.45]],
    [4.8, [17, -14, 0.45]],
  ]);
  const lean = kf(c, [
    [0, 0.18],
    [1.3, 0.18],
    [1.45, 0.05],
    [1.72, -0.32],
    [1.9, 0.38],
    [2.3, 0.08],
    [2.95, 0.08],
    [3.1, 0.2],
    [4.2, 0.2],
    [4.4, 0],
    [4.8, 0.18],
  ]);

  // Tumpukan modul (3 -> 2 setelah dilempar -> 3 lagi saat diisi ulang)
  const thrown = c >= 1.86 && c < 4.42;
  const dropK = easeIn(seg(c, 4.3, 4.42));
  const landSquash = c >= 4.42 && c < 4.7 ? Math.exp(-(c - 4.42) * 12) * 0.25 : 0;
  const boxes = [
    { y: -3, col: PAL.teal, w: 28 },
    { y: -10, col: PAL.ochre, w: 26 },
    { y: -17, col: PAL.orange, w: 22 },
  ];
  let stack = `<g transform="translate(11, -2) rotate(${f1(tilt)})">`;
  boxes.forEach((b, i) => {
    if (i === 2 && thrown) return;
    let yOff = 0;
    let op = 1;
    if (i === 2 && c >= 4.3 && c < 4.42) {
      yOff = -22 * (1 - dropK);
      op = dropK;
    }
    const sy = i === 2 ? 1 - landSquash : 1;
    stack += `<g transform="translate(0 ${f1(b.y + yOff)}) scale(1 ${sy.toFixed(2)})" opacity="${op.toFixed(2)}"><rect x="${-b.w / 2}" y="-3.75" width="${b.w}" height="7.5" rx="2.5" fill="${b.col}" stroke="${PAL.ink}" stroke-width="1.5"/></g>`;
  });
  stack += `</g>`;

  // Laptop + screen tiles lighting up one by one
  const tiles = [
    { x: -15, y: -17, w: 16, h: 4, col: PAL.orange },
    { x: -15, y: -10, w: 18, h: 10, col: PAL.teal },
    { x: 6, y: -10, w: 10, h: 4.5, col: PAL.ochre },
  ];
  const ci = ((n % 3) + 3) % 3;
  const fadeAll = ci === 2 ? 1 - seg(c, 4.3, 4.75) : 1;
  let svg =
    `<g transform="translate(132, 54)">` +
    `<ellipse cx="0" cy="18" rx="26" ry="4" fill="${isDark ? "rgba(0,0,0,0.3)" : "rgba(15,23,42,0.08)"}"/>` +
    `<rect x="-22" y="-24" width="44" height="30" rx="4.5" fill="#1E293B" stroke="${PAL.ink}" stroke-width="1.6"/>` +
    `<rect x="-19" y="-21" width="38" height="23" rx="3" fill="${isDark ? "#0F172A" : "#FFF7ED"}"/>`;
  tiles.forEach((tl, k) => {
    svg += `<rect x="${tl.x}" y="${tl.y}" width="${tl.w}" height="${tl.h}" rx="1.8" fill="${tl.col}" opacity="0.18"/>`;
    const lit = k < ci || (k === ci && c >= 2.3);
    if (lit) {
      const pop = k === ci ? backOut(seg(c, 2.3, 2.6)) : 1;
      const cxT = tl.x + tl.w / 2;
      const cyT = tl.y + tl.h / 2;
      svg += `<g transform="translate(${cxT} ${cyT}) scale(${pop.toFixed(2)}) translate(${-cxT} ${-cyT})" opacity="${(0.92 * fadeAll).toFixed(2)}"><rect x="${tl.x}" y="${tl.y}" width="${tl.w}" height="${tl.h}" rx="1.8" fill="${tl.col}"/></g>`;
    }
  });
  if (c >= 2.3 && c < 2.6) {
    svg += `<rect x="-19" y="-21" width="38" height="23" rx="3" fill="#FFFFFF" opacity="${(0.35 * (1 - seg(c, 2.3, 2.6))).toFixed(2)}"/>`;
  }
  svg += `<rect x="-26" y="6" width="52" height="4.5" rx="2.2" fill="#CBD5E1" stroke="${PAL.ink}" stroke-width="1.5"/></g>`;

  // Dust when landing
  svg += dustPuff(c - 2.82, x, G, isDark);
  svg += dustPuff(c - 4.78, x, G, isDark);
  svg += dustPuff(c + L - 4.78, x, G, isDark);

  // Expression timeline
  let eyes: ClawdPose["eyes"] = "normal";
  let mouth: ClawdPose["mouth"] = "smile";
  let brows: ClawdPose["brows"] = null;
  let lookX = 0.8;
  let lookY = 0;
  let blush = 0.45;
  if (c >= 1.4 && c < 1.86) {
    brows = "focus";
    mouth = "flat";
  } else if (c >= 1.86 && c < 2.4) {
    eyes = "wide";
    mouth = "o";
    lookX = 1;
    lookY = -0.4;
  } else if (c >= 2.4 && c < 2.95) {
    eyes = "happy";
    mouth = "grin";
    blush = 0.8;
  } else if (c >= 2.95 && c < 4.3) {
    if (n % 2 === 1 && c >= 3.4 && c < 3.9) {
      lookX = -0.3; // glance back at the viewer on alternate loops
      eyes = "happy";
    }
  } else if (c >= 4.3) {
    eyes = "spark";
    mouth = "grin";
    blush = 0.8;
  }

  svg += drawClawd(
    x,
    G,
    U,
    {
      id: "page-loader-clawd",
      view: "q",
      flip,
      walkPhase,
      dy,
      sq,
      lean,
      lookX,
      lookY,
      eyes,
      brows,
      mouth,
      blush,
      armLBack: true,
      handL: [12, -17, 0.3],
      handR,
      propR: stack,
      forceBlink: faceBlink(st, "page", `${eyes}|${mouth}`, t),
    },
    t,
    isDark
  );

  // Flying module arcing into the laptop screen
  const fp = seg(c, 1.86, 2.3);
  if (fp > 0 && fp < 1) {
    const target = tiles[ci];
    const tx = 132 + target.x + target.w / 2;
    const ty = 54 + target.y + target.h / 2;
    const sx = X1 + 27 + 11;
    const sy = G - 31 - 2 - 17;
    const fx = lerp(sx, tx, fp);
    const fy = lerp(sy, ty, ease(fp)) - 14 * Math.sin(Math.PI * fp);
    const s = lerp(1, 0.5, fp);
    svg += `<g transform="translate(${f1(fx)} ${f1(fy)}) rotate(${f1(fp * 220)}) scale(${s.toFixed(2)})"><rect x="-11" y="-3.75" width="22" height="7.5" rx="2.5" fill="${PAL.orange}" stroke="${PAL.ink}" stroke-width="1.5"/></g>`;
  }

  svg += drawSparkle(149, 25, 5 * backOut(seg(c, 2.3, 2.55)) * (1 - seg(c, 2.75, 3.0)), PAL.ochre, 0.95);
  svg += drawSparkle(116, 22, 2.4, PAL.orange, 0.35 + 0.35 * Math.sin(t * 3.1));
  return svg;
}

// ============================================================================
// 6. SCENE: AI CHAT THINKING
// ----------------------------------------------------------------------------
// Berpikir (tangan di dagu, titik-titik pikiran) -> lampu ide berkedip lalu
// menyala (Clawd kaget kecil) -> menulis cepat, baris teks muncul satu per
// satu -> mengangguk puas -> draf dirapikan -> kembali berpikir.
// ============================================================================
function renderAiScene({ t, dt, isDark, st }: SceneCtx) {
  const L = 4.4;
  const U = 3.1;
  const X = 32;
  const G = 38;
  const c = t % L;
  const cardX = 68;
  const cardY = 25;
  const muted = isDark ? "#64748B" : "#CBD5E1";

  const lines = [
    { y: -8, w: 14, h: 2.5, col: PAL.orange },
    { y: -3, w: 22, h: 2, col: PAL.teal },
    { y: 2, w: 18, h: 2, col: muted },
    { y: 7, w: 20, h: 2, col: muted },
  ];
  const W0 = 1.65;
  const SL = 0.45;
  const DL = 0.4;
  const resetK = seg(c, 3.85, 4.25);
  const prog = lines.map((_, i) => ease(seg(c, W0 + i * SL, W0 + i * SL + DL)));
  const writing = c >= W0 && c < W0 + 3 * SL + DL;
  const active = clamp(Math.floor((c - W0) / SL), 0, 3);

  // Pencil tip follows the "streaming" line; hand reaches it through springs
  let tgt = [12, -6];
  if (writing) {
    const ln = lines[active];
    const tipX = cardX - 12 + ln.w * prog[active] + Math.sin(c * 19) * 0.3;
    const tipY = cardY + ln.y + 1 + Math.sin(c * 38) * 0.5;
    tgt = [tipX - 2.4 - X, tipY - 4.4 - G];
  } else if (c >= 1.4 && c < 3.85) {
    tgt = [16, -13];
  }
  const hx = spr(st, "hx", 12).step(tgt[0], dt, 240, 22);
  const hy = spr(st, "hy", -6).step(tgt[1], dt, 240, 22);

  const handL = kf3(c, [
    [0, [-1, -10, -0.9]],
    [1.35, [-1, -10, -0.9]],
    [1.6, [-13, -7, -0.5]],
    [3.85, [-13, -7, -0.5]],
    [4.15, [-1, -10, -0.9]],
    [4.4, [-1, -10, -0.9]],
  ]);

  let svg = "";

  // Draft card with streaming lines + done pop
  const pop = 1 + 0.07 * Math.sin(Math.PI * seg(c, 3.45, 3.75));
  svg +=
    `<g transform="translate(${cardX}, ${cardY}) scale(${pop.toFixed(3)})">` +
    `<rect x="-16" y="-12" width="32" height="24" rx="4" fill="${surface(isDark)}" stroke="${PAL.ink}" stroke-width="1.3"/>`;
  lines.forEach((ln, i) => {
    const w = ln.w * prog[i];
    if (w > 0.3) {
      svg += `<rect x="-12" y="${ln.y}" width="${f1(w)}" height="${ln.h}" rx="1" fill="${ln.col}" opacity="${(1 - resetK).toFixed(2)}"/>`;
    }
  });
  const chk = backOut(seg(c, 3.5, 3.75)) * (1 - resetK);
  if (chk > 0.02) {
    svg += `<g transform="translate(14 -10) scale(${chk.toFixed(2)})"><circle r="4" fill="${PAL.emerald}"/><path d="M -1.8 0 L -0.5 1.3 L 1.9 -1.2" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  svg += `</g>`;

  // Thought dots while thinking
  for (let i = 0; i < 3; i++) {
    const a = backOut(seg(c, 0.25 + i * 0.25, 0.45 + i * 0.25)) * (1 - seg(c, 1.05, 1.3));
    if (a > 0.02) {
      svg += `<circle cx="${f1(44 + i * 4.5)}" cy="${f1(13 - i * 3.5 + Math.sin(c * 3 + i) * 0.6)}" r="${f1((1.1 + i * 0.35) * a)}" fill="${isDark ? "#94A3B8" : "#94A3B8"}" opacity="0.85"/>`;
    }
  }

  // Lightbulb: flicker -> pop on -> shrink away
  if (c >= 1.1 && c < 3.85) {
    const fi = Math.floor((c - 1.1) / 0.06);
    const flick = c < 1.4 ? [0.35, 0.05, 0.7, 0.15, 0.9][fi] ?? 1 : 1;
    const sc = (c < 1.4 ? 0.85 : backOut(seg(c, 1.4, 1.65))) * (1 - ease(seg(c, 3.6, 3.85)));
    if (sc > 0.02) {
      const glow = 0.22 + 0.08 * Math.sin(c * 9);
      svg +=
        `<g transform="translate(30, 6) scale(${sc.toFixed(2)})" opacity="${flick.toFixed(2)}">` +
        `<circle r="8" fill="${PAL.ochre}" opacity="${glow.toFixed(2)}"/>` +
        `<path d="M -4 1 C -5 -3 -3 -7 0 -7 C 3 -7 5 -3 4 1 L -4 1 Z" fill="#FDE047" stroke="${PAL.ink}" stroke-width="1.2"/>` +
        `<rect x="-2" y="1" width="4" height="2.5" rx="1" fill="#94A3B8" stroke="${PAL.ink}" stroke-width="1"/>` +
        (c >= 1.4 ? `<path d="M 0 -10 L 0 -12.5 M 7 -6 L 9 -7.5 M -7 -6 L -9 -7.5" stroke="${PAL.ochre}" stroke-width="1.2" stroke-linecap="round"/>` : "") +
        `</g>`;
    }
  }

  // Pose
  const thinkW = clamp(1 - seg(c, 1.3, 1.45) + seg(c, 3.95, 4.2));
  const startle = hopCurve(c, 1.45, 0.2, 0.9);
  const rot =
    kf(c, [
      [0, 0],
      [3.45, 0],
      [3.58, 7],
      [3.72, -2],
      [3.85, 0],
      [4.4, 0],
    ]) +
    Math.sin(c * 1.6) * 3 * thinkW;
  const lean = kf(c, [
    [0, -0.05],
    [1.4, -0.05],
    [1.7, 0.24],
    [3.45, 0.24],
    [3.85, 0.1],
    [4.3, -0.05],
    [4.4, -0.05],
  ]) + (writing ? Math.sin(c * 8) * 0.03 : 0);

  let eyes: ClawdPose["eyes"] = "normal";
  let mouth: ClawdPose["mouth"] = "flat";
  let brows: ClawdPose["brows"] = "focus";
  let lookX = 0.35;
  let lookY = -0.85;
  let blush = 0.4;
  if (c >= 1.4 && c < 1.75) {
    eyes = "spark";
    mouth = "o";
    brows = null;
    lookY = -0.6;
  } else if (writing) {
    mouth = "smile";
    lookX = 1;
    lookY = 0.35;
  } else if (c >= 3.45 && c < 4.0) {
    eyes = "happy";
    mouth = "grin";
    brows = null;
    blush = 0.85;
  }

  const pencil =
    `<g transform="rotate(${f1(-28 + (writing ? Math.sin(c * 30) * 4 : 0))})">` +
    `<rect x="-1.8" y="-11" width="3.6" height="12" rx="1.2" fill="${PAL.ochre}" stroke="${PAL.ink}" stroke-width="1.2"/>` +
    `<polygon points="-1.8,1 1.8,1 0,5" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1"/>` +
    `</g>`;

  svg += drawClawd(
    X,
    G,
    U,
    {
      id: "ai-thinking-clawd",
      view: "q",
      dy: startle.dy,
      sq: startle.sq,
      rot,
      lean,
      lookX,
      lookY,
      eyes,
      brows,
      mouth,
      blush,
      handL,
      handR: [hx, hy, 0.35],
      propR: pencil,
      forceBlink: faceBlink(st, "ai", `${eyes}|${mouth}`, t),
    },
    t,
    isDark
  );

  return svg;
}

// ============================================================================
// 7. SCENE: RUANG RISET PROGRESS
// ----------------------------------------------------------------------------
// Kaca pembesar menyapu kartu konten, grafik tumbuh mengikuti persen asli,
// sesekali "aha!" saat menemukan outlier. Di 100%: perayaan sekali
// (jongkok -> lompat -> mendarat -> jempol muncul -> kilau), lalu tenang.
// ============================================================================
function renderRisetScene({ t, dt, isDark, st }: SceneCtx, percent: number) {
  const U = 3.8;
  const G = 48;
  const cardX = 84;
  const cardY = 30;

  const target = clamp(percent / 100);
  st.p = st.p === undefined ? target : st.p + (target - st.p) * (1 - Math.exp(-dt * 5));
  const p: number = st.p;
  const done = target >= 0.999;
  if (done && st.doneAt === undefined) st.doneAt = t;
  if (!done) st.doneAt = undefined;
  const td: number = st.doneAt !== undefined ? t - st.doneAt : -1;

  // Lens scanning path (smooth lissajous over the card)
  const lensX = cardX + 7 * Math.sin(t * 1.45);
  const lensY = cardY - 3 + 5 * Math.sin(t * 2.5 + 0.8);

  // Clawd shuffles sideways following the lens
  const xs = spr(st, "cx", 36);
  const x = xs.step(done ? 36 : 35 + (lensX - cardX) * 0.35, dt, 60, 12);
  const walkAmp = clamp(Math.abs(xs.v) / 5);

  const handTarget = done ? [20, -27] : [lensX - 14 - x, lensY + 6 - G];
  const hx = spr(st, "hx", handTarget[0]).step(handTarget[0], dt, 200, 20);
  const hy = spr(st, "hy", handTarget[1]).step(handTarget[1], dt, 200, 20);

  // "Aha!" micro-moments while scanning
  const a = t % 2.8;
  const aha = !done && a < 0.5;
  const ahaK = aha ? Math.sin((Math.PI * a) / 0.5) : 0;
  const hopAha = !done ? hopCurve(a, 0.12, 0.22, 0.8) : { dy: 0, sq: 0 };
  const hopDone = td >= 0 ? hopCurve(td, 0.15, 0.36, 2.0) : { dy: 0, sq: 0 };

  let svg = "";

  // Content card being analysed
  const doneBorder = td >= 0 ? seg(td, 0.3, 0.6) : 0;
  const bars = [
    { x: -10, h: 8 * (0.4 + 0.6 * p), col: PAL.sky },
    { x: -3, h: 12 * (0.4 + 0.6 * p), col: PAL.ochre },
    { x: 4, h: lerp(8, 18, p), col: done ? PAL.emerald : PAL.orange },
  ];
  svg +=
    `<g transform="translate(${cardX}, ${cardY})">` +
    `<rect x="-18" y="-18" width="36" height="36" rx="5" fill="${surface(isDark)}" stroke="${PAL.ink}" stroke-width="1.5"/>` +
    `<rect x="-14" y="-14" width="28" height="18" rx="3" fill="${isDark ? "#0F172A" : "#F1F5F9"}"/>`;
  bars.forEach((b) => {
    svg += `<rect x="${b.x}" y="${f1(2 - b.h)}" width="5" height="${f1(b.h)}" rx="1.2" fill="${b.col}"/>`;
  });
  svg +=
    `<rect x="-14" y="8" width="22" height="3" rx="1.5" fill="${isDark ? "#475569" : "#CBD5E1"}"/>` +
    `<rect x="-14" y="13" width="14" height="2.5" rx="1.25" fill="${isDark ? "#334155" : "#E2E8F0"}"/>`;
  if (doneBorder > 0) {
    svg += `<rect x="-18" y="-18" width="36" height="36" rx="5" fill="none" stroke="${PAL.emerald}" stroke-width="2" opacity="${doneBorder.toFixed(2)}"/>`;
  }
  svg += `</g>`;

  // Magnifier (hidden once celebration swaps it for a thumbs-up)
  const showLens = !done || td < 0.4;
  const lensProp = showLens
    ? `<line x1="0" y1="0" x2="7" y2="-3" stroke="${PAL.woodDk}" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="14" cy="-6" r="8" fill="rgba(142,195,230,0.3)" stroke="${PAL.ink}" stroke-width="1.8"/>` +
      `<path d="M 9.5 -10 A 5 5 0 0 1 15 -12" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round"/>`
    : "";
  const propR = done && td >= 0.4 ? thumbsUpProp(seg(td, 0.42, 0.75)) : lensProp;

  // Expression
  let eyes: ClawdPose["eyes"] = "normal";
  let mouth: ClawdPose["mouth"] = Math.floor(t / 1.7) % 2 ? "o" : "smile";
  let brows: ClawdPose["brows"] = "focus";
  let blush = 0.45;
  if (done) {
    eyes = "happy";
    mouth = "grin";
    brows = null;
    blush = 0.85;
  } else if (a > 0.05 && a < 0.45) {
    eyes = "spark";
    mouth = "o";
    brows = null;
  }
  const lookX = clamp((lensX - x) / 40, 0.3, 1);
  const lookY = clamp((lensY - (G - 20)) / 18, -1, 1);
  const rot = done ? Math.sin(t * 2.2) * 2 * seg(td, 1.0, 1.4) : 0;

  svg += drawClawd(
    x,
    G,
    U,
    {
      id: "riset-loader-clawd",
      view: "q",
      walkPhase: x / 2.4,
      walkAmp,
      dy: hopAha.dy + hopDone.dy,
      sq: hopAha.sq + hopDone.sq,
      lean: done ? -0.05 : 0.25,
      rot,
      lookX: done ? 0.6 : lookX,
      lookY: done ? -0.2 : lookY,
      eyes,
      brows,
      mouth,
      blush,
      handL: [-16, -16, -0.5],
      handR: [hx, hy, 0.3],
      propR,
      forceBlink: faceBlink(st, "riset", `${eyes}|${mouth}`, t),
    },
    t,
    isDark
  );

  if (ahaK > 0.05) svg += drawSparkle(lensX + 6, lensY - 8, 4 * ahaK, PAL.ochre, ahaK);
  if (td >= 0) {
    svg += dustPuff(td - 0.51, x, G, isDark);
    svg += sparkleBurst(td - 0.5, cardX, cardY - 20, 6, 14);
    svg += drawSparkle(cardX + 16, cardY - 20, 3.5 * seg(td, 1.0, 1.3), PAL.emerald, 0.5 + 0.4 * Math.sin(t * 4));
  }
  return svg;
}

// ============================================================================
// 8. SCENE: VERIFIKASI PEMBAYARAN (jujur: tidak pernah pura-pura "berhasil")
// ----------------------------------------------------------------------------
// Ancang-ancang lalu menyodorkan dokumen -> sinyal dikirim ke perisai ->
// balasan "masih diproses" kembali -> menunggu sabar (ketuk kaki, lihat jam,
// melirik sekitar) -> siap kirim ulang.
// ============================================================================
function renderVerifyScene({ t, dt, isDark, st }: SceneCtx) {
  const L = 5.2;
  const U = 3.8;
  const X = 30;
  const G = 48;
  const SX = 88;
  const SY = 28;
  const c = t % L;

  const handTgt = kf3(c, [
    [0, [18, -16]],
    [0.25, [13, -15]],
    [0.6, [24, -20]],
    [1.85, [24, -20]],
    [2.1, [16, -14]],
    [4.5, [16, -14]],
    [5.0, [18, -16]],
    [5.2, [18, -16]],
  ]);
  const hx = spr(st, "hx", 18).step(handTgt[0], dt, 210, 16);
  const hy = spr(st, "hy", -16).step(handTgt[1], dt, 210, 16);

  const handL = kf3(c, [
    [0, [-15, -15, -0.5]],
    [2.25, [-15, -15, -0.5]],
    [2.5, [-3, -21, -0.9]],
    [3.05, [-3, -21, -0.9]],
    [3.3, [-15, -15, -0.5]],
    [5.2, [-15, -15, -0.5]],
  ]);
  const lean = kf(c, [
    [0, 0.12],
    [0.25, -0.1],
    [0.6, 0.3],
    [1.9, 0.3],
    [2.2, 0.1],
    [5.2, 0.12],
  ]);
  const rot = kf(c, [
    [0, 0],
    [1.85, 0],
    [1.95, 5],
    [2.1, 0],
    [5.2, 0],
  ]);
  const lookX = kf(c, [
    [0, 1],
    [2.3, 1],
    [2.5, -0.2],
    [3.05, -0.2],
    [3.3, 1],
    [3.6, 1],
    [3.9, -0.7],
    [4.2, -0.7],
    [4.45, 0.9],
    [5.2, 1],
  ]);
  const lookY = kf(c, [
    [0, 0],
    [2.3, 0],
    [2.5, 0.6],
    [3.05, 0.6],
    [3.3, 0],
    [5.2, 0],
  ]);
  const tap = c >= 1.95 && c < 3.4 ? Math.max(0, Math.sin((c - 1.95) * 13)) * 0.5 : 0;

  let svg = "";

  // Animated handshake line
  svg += `<line x1="60" y1="27" x2="${SX - 20}" y2="${SY}" stroke="${isDark ? "#475569" : "#CBD5E1"}" stroke-width="1.6" stroke-dasharray="2.5 3" stroke-dashoffset="${f1(-t * 14)}" stroke-linecap="round"/>`;

  // Shield node (always "processing" orange)
  const pulse = 1 + 0.05 * Math.sin(t * 4);
  const wave = seg(c, 1.2, 1.6);
  svg += `<g transform="translate(${SX}, ${SY})">`;
  if (wave > 0 && wave < 1) {
    svg += `<circle r="${f1(16 + wave * 10)}" fill="none" stroke="${PAL.orange}" stroke-width="1.4" opacity="${(0.5 * (1 - wave)).toFixed(2)}"/>`;
  }
  svg += `<circle r="${f1(18 * pulse)}" fill="${PAL.orange}" opacity="0.12"/>`;
  for (let k = 0; k < 3; k++) {
    const ang = t * 2.4 + (k * Math.PI * 2) / 3;
    svg += `<circle cx="${f1(Math.cos(ang) * 19)}" cy="${f1(Math.sin(ang) * 19)}" r="1.6" fill="${PAL.orange}" opacity="${(0.45 + 0.4 * ((k + 1) / 3)).toFixed(2)}"/>`;
  }
  const handAng = t * 3;
  svg +=
    `<rect x="-14" y="-15" width="28" height="30" rx="6" fill="${surface(isDark)}" stroke="${PAL.orange}" stroke-width="1.6"/>` +
    `<path d="M 0 -8 L 8 -5 L 8 1 C 8 7 4 10 0 12 C -4 10 -8 7 -8 1 L -8 -5 Z" fill="${PAL.orange}" opacity="0.2" stroke="${PAL.orange}" stroke-width="1.3"/>` +
    `<line x1="0" y1="1" x2="${f1(Math.sin(handAng) * 4.5)}" y2="${f1(1 - Math.cos(handAng) * 4.5)}" stroke="${PAL.orange}" stroke-width="1.5" stroke-linecap="round"/>` +
    `<circle cx="0" cy="1" r="1.3" fill="${PAL.orange}"/>` +
    `</g>`;

  // Packets
  const po = seg(c, 0.6, 1.2);
  if (po > 0 && po < 1) {
    const px = lerp(58, SX - 6, ease(po));
    const py = lerp(26, SY, po) - 6 * Math.sin(Math.PI * po);
    svg += `<circle cx="${f1(px)}" cy="${f1(py)}" r="5" fill="${PAL.orange}" opacity="0.22"/><circle cx="${f1(px)}" cy="${f1(py)}" r="2.6" fill="${PAL.orange}"/>`;
  }
  const pb = seg(c, 1.25, 1.85);
  if (pb > 0 && pb < 1) {
    const px = lerp(SX - 6, 58, ease(pb));
    const py = lerp(SY, 26, pb) - 6 * Math.sin(Math.PI * pb);
    svg += `<circle cx="${f1(px)}" cy="${f1(py)}" r="5" fill="${PAL.ochre}" opacity="0.22"/><circle cx="${f1(px)}" cy="${f1(py)}" r="2.6" fill="${PAL.ochre}"/>`;
  }

  const doc =
    `<g transform="rotate(-8)">` +
    `<rect x="-9" y="-12" width="18" height="15" rx="2.5" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1.3"/>` +
    `<rect x="-6" y="-8" width="12" height="2.5" rx="1.2" fill="${PAL.ochre}"/>` +
    `<rect x="-6" y="-3.5" width="8" height="2" rx="1" fill="#94A3B8"/>` +
    `</g>`;
  const watch =
    c >= 2.3 && c < 3.2
      ? `<circle cx="0" cy="-1" r="3" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1"/><line x1="0" y1="-1" x2="${f1(Math.sin(t * 6) * 2)}" y2="${f1(-1 - Math.cos(t * 6) * 2)}" stroke="${PAL.ink}" stroke-width="0.8"/>`
      : "";

  const eyes: ClawdPose["eyes"] = "normal";
  const mouth: ClawdPose["mouth"] = c >= 3.6 && c < 4.4 ? "o" : c < 2.1 ? "smile" : "flat";

  svg += drawClawd(
    X,
    G,
    U,
    {
      id: "verify-loader-clawd",
      view: "q",
      lean,
      rot,
      lookX,
      lookY,
      eyes,
      brows: c >= 2.3 && c < 3.1 ? "focus" : null,
      mouth,
      blush: 0.55,
      legLift: [0, 0, 0, tap],
      handL,
      handR: [hx, hy, 0.35],
      propR: doc,
      propL: watch,
      forceBlink: faceBlink(st, "verify", `${eyes}|${mouth}`, t),
    },
    t,
    isDark
  );
  return svg;
}

// ============================================================================
// 8B. SCENE: PEMBAYARAN BERHASIL (Selebrasi Clawd: lompat gembira, perisai hijau emerald)
// ----------------------------------------------------------------------------
// Perisai berubah hijau emerald dengan centang (✓) bercahaya.
// Partikel sparkle/bintang bertebaran.
// Clawd melompat gembira dengan squash-and-stretch, jempol terangkat, mata berbinar.
// ============================================================================
function renderSuccessScene({ t, dt, isDark, st }: SceneCtx) {
  const L = 2.8;
  const U = 3.8;
  const X = 32;
  const G = 48;
  const SX = 88;
  const SY = 28;
  const c = t % L;

  let svg = "";

  // Jalur sinyal sukses (hijau emerald meluncur)
  svg += `<line x1="56" y1="28" x2="${SX - 18}" y2="${SY}" stroke="${PAL.emerald}" stroke-width="1.8" stroke-dasharray="3 3.5" stroke-dashoffset="${f1(-t * 14)}" stroke-linecap="round" opacity="0.8"/>`;

  // Perisai Hijau Emerald dengan Centang Sukses
  const pulse = 1 + 0.05 * Math.sin(t * 5);
  const ringWave = seg(c, 0.3, 1.1);

  svg += `<g transform="translate(${SX}, ${SY}) scale(${pulse.toFixed(3)})">`;
  if (ringWave > 0 && ringWave < 1) {
    svg += `<circle r="${f1(16 + ringWave * 12)}" fill="none" stroke="${PAL.emerald}" stroke-width="1.5" opacity="${(0.6 * (1 - ringWave)).toFixed(2)}"/>`;
  }
  svg += `<circle r="18" fill="${PAL.emerald}" opacity="0.18"/>`;
  svg +=
    `<rect x="-14" y="-15" width="28" height="30" rx="6" fill="${surface(isDark)}" stroke="${PAL.emerald}" stroke-width="1.8"/>` +
    `<path d="M 0 -8 L 8 -5 L 8 1 C 8 7 4 10 0 12 C -4 10 -8 7 -8 1 L -8 -5 Z" fill="${PAL.emerald}" opacity="0.25" stroke="${PAL.emerald}" stroke-width="1.3"/>` +
    `<path d="M -4.5 1 L -1.2 4.5 L 5 -2.5" fill="none" stroke="${PAL.emerald}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` +
    `</g>`;

  // Sparkles & Confetti di sekitar perisai
  svg += sparkleBurst((c * 1.2) % 1.2, SX, SY - 10, 6, 16);
  svg += drawSparkle(SX + 14, SY - 16, 4, PAL.emerald, 0.7 + 0.3 * Math.sin(t * 6));
  svg += drawSparkle(SX - 16, SY + 12, 3, PAL.ochre, 0.6 + 0.4 * Math.cos(t * 5));

  // Animasi lompatan gembira Clawd (hopCurve dengan squash & stretch)
  const hop = hopCurve(c, 0.35, 0.38, 1.8);
  const isJumping = c >= 0.35 && c < 0.73;

  // Tangan & Pose Clawd
  const thumbsProgress = seg(c, 0.4, 0.7) * (1 - seg(c, 2.4, 2.7));
  const handR = lerpArr([18, -16, 0.35], [23, -28, 0.4], thumbsProgress || 0.85);
  const handL = isJumping ? [-18, -28, -0.6] : [-16, -18, -0.4];

  // Efek debu / mendarat saat Clawd turun
  svg += dustPuff(c - 0.73, X, G, isDark);

  // Sparkle di atas kepala Clawd saat lompat
  if (isJumping) {
    svg += drawSparkle(X - 12, 12, 3.5, PAL.ochre, 0.9);
    svg += drawSparkle(X + 16, 10, 4, PAL.emerald, 0.9);
  }

  svg += drawClawd(
    X,
    G,
    U,
    {
      id: "success-loader-clawd",
      view: "q",
      dy: hop.dy,
      sq: hop.sq,
      lean: isJumping ? 0.08 : 0.15,
      rot: isJumping ? -3 : 0,
      lookX: 0.8,
      lookY: -0.2,
      eyes: "happy",
      brows: "confident",
      mouth: "grin",
      blush: 0.9,
      handL,
      handR,
      propR: thumbsUpProp(1),
      forceBlink: faceBlink(st, "success", "happy|grin", t),
    },
    t,
    isDark
  );
  return svg;
}

// ============================================================================
// 8C. SCENE: PEMBAYARAN GAGAL / WAKTU HABIS (Clawd ramah: bingung, perisai merah/oranye)
// ----------------------------------------------------------------------------
// Perisai merah/oranye bergetar lembut dengan tanda (!).
// Garis sinyal terputus-putus samar.
// Clawd menggaruk kepala ramah, alis khawatir lembut, mengajak coba bayar ulang.
// ============================================================================
function renderErrorScene({ t, dt, isDark, st }: SceneCtx) {
  const L = 3.4;
  const U = 3.8;
  const X = 32;
  const G = 48;
  const SX = 88;
  const SY = 28;
  const c = t % L;

  let svg = "";

  // Garis sinyal terputus / error
  svg += `<line x1="56" y1="28" x2="${SX - 18}" y2="${SY}" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="2.5 4" stroke-linecap="round" opacity="0.45"/>`;

  // Getar kecil perisai saat error
  const shake = Math.sin(t * 14) * 0.8 * (c < 1.2 ? 1 : 0.2);

  svg += `<g transform="translate(${SX + shake}, ${SY})">`;
  svg += `<circle r="18" fill="#EF4444" opacity="0.12"/>`;
  svg +=
    `<rect x="-14" y="-15" width="28" height="30" rx="6" fill="${surface(isDark)}" stroke="#EF4444" stroke-width="1.8"/>` +
    `<path d="M 0 -8 L 8 -5 L 8 1 C 8 7 4 10 0 12 C -4 10 -8 7 -8 1 L -8 -5 Z" fill="#EF4444" opacity="0.18" stroke="#EF4444" stroke-width="1.3"/>` +
    `<line x1="0" y1="-4" x2="0" y2="2" stroke="#EF4444" stroke-width="2.2" stroke-linecap="round"/>` +
    `<circle cx="0" cy="5.5" r="1.2" fill="#EF4444"/>` +
    `</g>`;

  // Keringat dingin kecil melayang di dekat pelipis Clawd
  const sweatOp = 0.5 + 0.4 * Math.sin(t * 4);
  svg += `<path d="M ${X + 13} 20 C ${X + 13} 17 ${X + 16} 15 ${X + 16} 15 C ${X + 16} 15 ${X + 19} 17 ${X + 19} 20 C ${X + 19} 22 ${X + 16} 23 ${X + 13} 20 Z" fill="${PAL.sky}" opacity="${sweatOp.toFixed(2)}"/>`;

  // Tangan garuk kepala / bingung
  const scratch = Math.sin(t * 6) * 1.5;
  const handL: number[] = [-4, -27 + scratch, -0.8];
  const handR: number[] = [18, -14, 0.35];

  const errDoc =
    `<g transform="rotate(10)">` +
    `<rect x="-8" y="-11" width="16" height="14" rx="2" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1.2"/>` +
    `<line x1="-5" y1="-6" x2="5" y2="-6" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round"/>` +
    `<line x1="-5" y1="-2" x2="3" y2="-2" stroke="#94A3B8" stroke-width="1.2" stroke-linecap="round"/>` +
    `</g>`;

  svg += drawClawd(
    X,
    G,
    U,
    {
      id: "error-loader-clawd",
      view: "q",
      lean: -0.05,
      rot: 0,
      lookX: 0.4,
      lookY: 0.2,
      eyes: "wide",
      brows: "worried",
      mouth: "wobble",
      blush: 0.35,
      handL,
      handR,
      propR: errDoc,
      forceBlink: faceBlink(st, "error", "wide|wobble", t),
    },
    t,
    isDark
  );
  return svg;
}

// ============================================================================
// 9. SCENE: ONBOARDING (Langkah 1-4 + transisi "ruang siap")
// ============================================================================
function chipSvg(label: string, col: string, isDark: boolean, focused = false, w = 50) {
  const half = w / 2;
  return (
    `<rect x="${-half}" y="-9" width="${w}" height="18" rx="9" fill="${surface(isDark)}" stroke="${focused ? PAL.orange : PAL.ink}" stroke-width="${focused ? 1.8 : 1.3}"/>` +
    `<circle cx="${-half + 10}" cy="0" r="3.5" fill="${col}"/>` +
    `<text x="4" y="2.8" text-anchor="middle" font-size="7.5" font-weight="700" fill="${isDark ? "#F1F5F9" : "#1E293B"}">${label}</text>`
  );
}

function item(x: number, y: number, a: number, alpha: number, inner: string, rot = 0) {
  const op = alpha * clamp(a);
  if (a <= 0.01 || op <= 0.01) return "";
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${a.toFixed(3)})" opacity="${op.toFixed(2)}">${inner}</g>`;
}

interface StepResult {
  props: string;
  pose: ClawdPose;
  x: number;
}

function onboardingStep(
  step: number,
  t: number,
  dt: number,
  isDark: boolean,
  st: SceneState,
  ap: (i: number) => number,
  alpha: number,
  live: boolean
): StepResult {
  let props = "";
  const pose: ClawdPose = { id: `onb-s${step}`, view: "front", blush: 0.6 };
  let x = 105;

  if (step === 1) {
    // Kenalan: badge niche melayang, Clawd melambai bergantian melirik
    const badges = [
      { x: 36, y: 20, col: PAL.teal, label: "Dakwah" },
      { x: 36, y: 46, col: PAL.violet, label: "Branding" },
      { x: 174, y: 20, col: PAL.orange, label: "Bisnis" },
      { x: 174, y: 46, col: PAL.ochre, label: "Affiliate" },
    ];
    badges.forEach((b, i) => {
      const fy = Math.sin(t * (1.4 + i * 0.23) + i * 1.3) * 2.5;
      const fr = Math.sin(t * (1.1 + i * 0.17) + i) * 2.5;
      props += item(b.x, b.y + fy, ap(i), alpha, chipSvg(b.label, b.col, isDark), fr);
    });
    if (live) {
      const c = t % 2.8;
      const wv = ease(seg(c, 0, 0.2)) * (1 - ease(seg(c, 1.4, 1.6)));
      const ang = Math.sin(t * 9) * 0.5 + 0.5;
      const waveHand = [19.4 + 16 * Math.sin(ang), -19.4 - 16 * Math.cos(ang) * 0.9, 0.5];
      pose.handR = lerpArr([22, -12, 0.5], waveHand, wv);
      pose.handL = [-22, -14, -0.5];
      pose.rot = Math.sin(t * 2.2) * 2;
      if (wv > 0.3) {
        pose.eyes = "happy";
        pose.mouth = "grin";
        pose.blush = 0.8;
        pose.lookX = 0;
      } else {
        pose.eyes = "normal";
        pose.mouth = "smile";
        pose.lookX = kf(c, [
          [1.6, 0],
          [1.8, -0.9],
          [2.2, -0.9],
          [2.4, 0.9],
          [2.8, 0.9],
        ]);
      }
    }
  } else if (step === 2) {
    // Hambatan: bingung & garuk kepala -> ide -> benang kusut terurai jadi solusi
    const L = 4.4;
    const c = t % L;
    const untangle = ease(seg(c, 1.7, 2.1));
    const tangleOut = ease(seg(c, 2.0, 2.4)) * (1 - ease(seg(c, 3.7, 4.2)));
    const solIn = backOut(seg(c, 2.1, 2.5)) * (1 - ease(seg(c, 3.6, 4.0)));
    const y1 = lerp(-8, 0, untangle);
    const y2 = lerp(12, 0, untangle);
    const scribble = `M -10 ${f1(lerp(-2, 0, untangle))} C -8 ${f1(y1)} 2 ${f1(lerp(-7, 0, untangle))} -2 0 C -6 ${f1(lerp(6, 0, untangle))} 8 ${f1(y2 * 0.6)} 10 0`;
    const tangle =
      `<rect x="-22" y="-12" width="44" height="24" rx="6" fill="${surface(isDark)}" stroke="${PAL.ink}" stroke-width="1.3"/>` +
      `<path d="${scribble}" fill="none" stroke="${untangle > 0.5 ? PAL.teal : PAL.rose}" stroke-width="1.8" stroke-linecap="round"/>`;
    props += item(40, 32 + Math.sin(t * 2) * 1.5, ap(0) * (1 - tangleOut * 0.6), alpha * (1 - tangleOut), tangle);
    const dash = 20 * (1 - ease(seg(c, 2.2, 2.6)));
    const sol =
      `<rect x="-24" y="-13" width="48" height="26" rx="6" fill="${surface(isDark)}" stroke="${PAL.emerald}" stroke-width="1.5"/>` +
      `<path d="M -8 0 L -4 4 L 6 -5" fill="none" stroke="${PAL.emerald}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" stroke-dashoffset="${f1(dash)}"/>`;
    props += item(170, 32, ap(1) * solIn, alpha, sol);
    if (live) {
      const scratching = c >= 0.6 && c < 1.4;
      pose.handL = kf3(c, [
        [0, [-22, -16, -0.5]],
        [0.6, [-9, -33, -0.9]],
        [1.4, [-9, -33, -0.9]],
        [1.6, [-24, -24, -0.6]],
        [1.9, [-28, -22, -0.6]],
        [2.3, [-22, -16, -0.5]],
        [4.4, [-22, -16, -0.5]],
      ]);
      if (scratching) pose.handL[0] += Math.sin(t * 26) * 1.3;
      const thumbsK = seg(c, 2.4, 2.7) * (1 - seg(c, 3.5, 3.7));
      pose.handR = kf3(c, [
        [0, [22, -14, 0.5]],
        [2.3, [22, -14, 0.5]],
        [2.5, [24, -28, 0.4]],
        [3.5, [24, -28, 0.4]],
        [3.8, [22, -14, 0.5]],
        [4.4, [22, -14, 0.5]],
      ]);
      pose.propR = thumbsK > 0.02 ? thumbsUpProp(thumbsK) : "";
      const idea = hopCurve(c, 1.48, 0.2, 0.8);
      pose.dy = idea.dy;
      pose.sq = idea.sq;
      pose.lean = kf(c, [
        [0, -0.15],
        [1.6, -0.15],
        [2.1, 0.2],
        [3.7, 0.2],
        [4.4, -0.15],
      ]);
      if (c < 1.4 || c >= 3.9) {
        pose.eyes = "normal";
        pose.brows = "worried";
        pose.mouth = "wobble";
        pose.lookX = -0.85;
        pose.lookY = scratching ? -0.4 : 0;
      } else if (c < 1.75) {
        pose.eyes = "spark";
        pose.mouth = "o";
        pose.lookX = 0;
      } else {
        pose.eyes = c > 2.2 ? "happy" : "normal";
        pose.brows = "confident";
        pose.mouth = "grin";
        pose.lookX = 0.85;
        pose.blush = 0.8;
      }
    }
  } else if (step === 3) {
    // Platform: chip difokuskan bergantian, Clawd menoleh & menunjuk
    const chips = [
      { x: 38, y: 20, col: "#0EA5E9", label: "TikTok" },
      { x: 38, y: 46, col: "#EC4899", label: "Reels" },
      { x: 172, y: 20, col: "#EF4444", label: "Shorts" },
      { x: 172, y: 46, col: "#8B5CF6", label: "Threads" },
    ];
    const order = [0, 2, 1, 3];
    const focus = order[Math.floor(t / 1.1) % 4];
    chips.forEach((ch, i) => {
      const fs = spr(st, `chip${i}`, 1);
      const s = live ? fs.step(i === focus ? 1.12 : 0.94, dt, 220, 14) : fs.x;
      const lift = (s - 1) * -18;
      props += item(ch.x, ch.y + lift, ap(i) * s, alpha * (i === focus ? 1 : 0.75), chipSvg(ch.label, ch.col, isDark, i === focus));
    });
    if (live) {
      const f = chips[focus];
      const lx = spr(st, "lookX", 0).step(clamp((f.x - 105) / 55, -1, 1), dt, 120, 14);
      const ly = spr(st, "lookY", 0).step(clamp((f.y - 36) / 22, -1, 1), dt, 120, 14);
      pose.lookX = lx;
      pose.lookY = ly;
      pose.lean = lx * 0.22;
      pose.rot = lx * 3;
      const right = f.x > 105;
      const tx = right ? 30 : -30;
      const ty = f.y < 30 ? -32 : -20;
      const phx = spr(st, "phx", 22).step(right ? tx : 22, dt, 160, 15);
      const phy = spr(st, "phy", -14).step(right ? ty : -14, dt, 160, 15);
      const plx = spr(st, "plx", -22).step(!right ? tx : -22, dt, 160, 15);
      const ply = spr(st, "ply", -14).step(!right ? ty : -14, dt, 160, 15);
      pose.handR = [phx, phy, 0.4];
      pose.handL = [plx, ply, -0.4];
      pose.eyes = "normal";
      pose.brows = "focus";
      pose.mouth = "smile";
    }
  } else if (step === 4) {
    // Target: grafik terus naik (bergulir), Clawd fist-pump & lompat semangat
    x = 100;
    const s = t * 0.7;
    const base = Math.floor(s);
    let chart = "";
    for (let k = base; k < base + 6; k++) {
      const pos = k - s;
      if (pos < -0.2 || pos > 5) continue;
      const fadeIn = clamp((5 - pos) / 0.6);
      const fadeOut = clamp((pos + 0.2) / 0.6);
      const h = 6 + pos * 5;
      const bx = pos * 9;
      const col = [PAL.sky, PAL.teal, PAL.ochre, PAL.orange][((k % 4) + 4) % 4];
      chart += `<rect x="${f1(bx)}" y="${f1(-h)}" width="6" height="${f1(h)}" rx="1.5" fill="${col}" stroke="${PAL.ink}" stroke-width="1" opacity="${(fadeIn * fadeOut).toFixed(2)}"/>`;
    }
    chart += `<path d="M -2 -10 L 44 -34" fill="none" stroke="${PAL.emerald}" stroke-width="1.6" stroke-dasharray="3 3" stroke-dashoffset="${f1(-t * 10)}" stroke-linecap="round"/>`;
    chart += `<path d="M 44 -34 L 39 -34.5 M 44 -34 L 41.5 -29.8" stroke="${PAL.emerald}" stroke-width="1.6" stroke-linecap="round"/>`;
    chart += drawSparkle(46, -40, 4 + Math.sin(t * 5) * 0.8, PAL.ochre, 0.95);
    props += item(142, 62, ap(1), alpha, chart);
    const flag =
      `<rect x="-26" y="-13" width="52" height="26" rx="8" fill="${surface(isDark)}" stroke="${PAL.orange}" stroke-width="1.5"/>` +
      `<text x="0" y="-2" text-anchor="middle" font-size="6.5" font-weight="800" fill="${PAL.orange}">TARGET</text>` +
      `<text x="0" y="7" text-anchor="middle" font-size="7" font-weight="800" fill="${isDark ? "#F8FAFC" : "#0F172A"}">Naik Level!</text>`;
    props += item(38, 32 + Math.sin(t * 2.3) * 2, ap(0), alpha, flag, Math.sin(t * 1.7) * 2);
    if (live) {
      const c = t % 0.9;
      const h = hopCurve(c, 0.3, 0.3, 1.2);
      pose.dy = h.dy;
      pose.sq = h.sq;
      const beat = Math.floor(t / 0.9) % 2;
      const up = Math.sin(Math.PI * seg(c, 0.2, 0.75));
      pose.handL = lerpArr([-22, -16, -0.5], [-22, -38, -0.6], beat === 0 ? up : up * 0.35);
      pose.handR = lerpArr([22, -16, 0.5], [22, -38, 0.6], beat === 1 ? up : up * 0.35);
      pose.eyes = "spark";
      pose.mouth = "grin";
      pose.blush = 0.85;
      pose.lookX = 0.5;
      pose.lookY = -0.3;
    }
  } else {
    // Langkah 5: chip jawaban terbang & menyatu ke ruang kerja -> jempol
    x = 80;
    const L = 3.4;
    const c = t % L;
    const resetK = ease(seg(c, 2.85, 3.3));
    const chips = [
      { sx: 22, sy: 10, col: PAL.teal, label: "Niche" },
      { sx: 22, sy: 54, col: PAL.rose, label: "Solusi" },
      { sx: 196, sy: 10, col: PAL.violet, label: "Platform" },
      { sx: 196, sy: 54, col: PAL.ochre, label: "Target" },
    ];
    chips.forEach((ch, i) => {
      const k = ease(seg(c, 0.1 + i * 0.15, 0.8 + i * 0.15));
      if (k >= 0.999) return;
      const cx = lerp(ch.sx, 154, k);
      const cy = lerp(ch.sy, 38, k) - Math.sin(Math.PI * k) * 8;
      const inner =
        `<rect x="-22" y="-8" width="44" height="16" rx="8" fill="${ch.col}" stroke="${PAL.ink}" stroke-width="1.2"/>` +
        `<text x="0" y="2.6" text-anchor="middle" font-size="7" font-weight="800" fill="#FFFFFF">${ch.label}</text>`;
      props += item(cx, cy, ap(i) * lerp(1, 0.35, k) * (1 - resetK), alpha, inner, k * 12);
    });
    const fill = ease(seg(c, 0.5, 1.5));
    const ready = c >= 1.6 && c < 2.9;
    const okK = backOut(seg(c, 1.6, 1.9)) * (1 - resetK);
    let screen =
      `<rect x="-24" y="-16" width="48" height="32" rx="5" fill="#1E293B" stroke="${ready ? PAL.emerald : PAL.ink}" stroke-width="1.8"/>` +
      `<rect x="-21" y="-13" width="42" height="26" rx="3.5" fill="${isDark ? "#0F172A" : "#FFF7ED"}"/>`;
    if (okK > 0.02) {
      screen += `<g transform="scale(${okK.toFixed(2)})"><circle cx="0" cy="0" r="7" fill="${PAL.emerald}" opacity="0.2"/><path d="M -4 0 L -1 3 L 5 -3.5" fill="none" stroke="${PAL.emerald}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    } else {
      screen += `<rect x="-15" y="-2" width="30" height="4" rx="2" fill="${isDark ? "#334155" : "#E2E8F0"}"/><rect x="-15" y="-2" width="${f1(30 * fill * (1 - resetK))}" height="4" rx="2" fill="${PAL.orange}"/>`;
    }
    const sPop = 1 + 0.06 * Math.sin(Math.PI * seg(c, 1.6, 1.9));
    props += item(154, 38, ap(4) * sPop, alpha, screen);
    if (ready) props += sparkleBurst(c - 1.65, 154, 20, 6, 14);
    if (live) {
      const h = hopCurve(c, 1.62, 0.3, 1.4);
      pose.dy = h.dy;
      pose.sq = h.sq;
      pose.view = "q";
      pose.lookX = 1;
      const thumbs = seg(c, 1.75, 2.05) * (1 - seg(c, 2.85, 3.1));
      pose.handR = lerpArr([22, -14, 0.4], [24, -26, 0.4], thumbs);
      pose.propR = thumbs > 0.02 ? thumbsUpProp(thumbs) : "";
      pose.handL = [-18, -16, -0.5];
      pose.eyes = c >= 1.6 && c < 2.9 ? "happy" : "wide";
      pose.mouth = c >= 1.6 && c < 2.9 ? "grin" : "smile";
      pose.blush = 0.85;
    }
  }

  return { props, pose, x };
}

function renderOnboardingScene(ctx: SceneCtx, step: number, reactKey: number) {
  const { t, dt, isDark, st } = ctx;
  const U = 4.3;
  const G = 62;

  if (st.step === undefined) {
    st.step = step;
    st.prev = null;
    st.changeAt = -10;
    st.reactKey = reactKey;
    st.reactAt = -10;
  }
  if (step !== st.step) {
    st.prev = st.step;
    st.step = step;
    st.changeAt = t;
  }
  if (reactKey !== st.reactKey) {
    st.reactKey = reactKey;
    st.reactAt = t;
  }

  const tr = t - st.changeAt;
  let svg = "";

  // Old step props slide down & fade out
  if (st.prev !== null && tr < 0.3) {
    const out = 1 - ease(seg(tr, 0, 0.24));
    const prev = onboardingStep(st.prev, t, dt, isDark, st, () => 1, out, false);
    svg += `<g transform="translate(0 ${f1((1 - out) * 6)})">${prev.props}</g>`;
  }

  // New step props pop in one by one
  const ap = (i: number) => (tr > 2 ? 1 : backOut(seg(tr, 0.2 + i * 0.07, 0.55 + i * 0.07)));
  const cur = onboardingStep(step, t, dt, isDark, st, ap, 1, true);
  svg += cur.props;
  const pose = cur.pose;

  // Clawd walks smoothly to the new spot instead of teleporting
  const xs = spr(st, "ox", cur.x);
  const x = xs.step(cur.x, dt, 90, 15);
  if (Math.abs(xs.v) > 1) {
    pose.walkPhase = x / 3;
    pose.walkAmp = clamp(Math.abs(xs.v) / 25);
  }

  // Transition hop between steps
  if (tr >= 0 && tr < 1) {
    const h = hopCurve(tr, 0.13, 0.3, 1.5);
    pose.dy = (pose.dy || 0) + h.dy;
    pose.sq = (pose.sq || 0) + h.sq;
  }

  // Happy reaction when the user picks an answer
  const rt = t - st.reactAt;
  if (rt >= 0 && rt < 0.55) {
    const w = Math.sin((Math.PI * rt) / 0.55);
    pose.handL = lerpArr(pose.handL ?? [-25, -11, -0.5], [-20, -36, -0.6], w);
    pose.handR = lerpArr(pose.handR ?? [25, -11, 0.5], [20, -36, 0.6], w);
    pose.propR = w > 0.5 ? "" : pose.propR;
    pose.eyes = "spark";
    pose.mouth = "grin";
    pose.sq = (pose.sq || 0) - 0.1 * w;
    svg += sparkleBurst(rt, x, G - 40, 6, 16);
  }

  pose.forceBlink = faceBlink(st, "onb", `${pose.eyes}|${pose.mouth}`, t);
  svg += drawClawd(x, G, U, pose, t, isDark);
  return svg;
}

// ============================================================================
// 10. PUBLIC COMPONENTS
// ============================================================================
export function ClawdPageVisual({ className = "" }: { className?: string }) {
  const svgRef = useClawdScene(renderPageScene, 85, 50);
  return (
    <div className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 170 76" className="w-32 h-14 sm:w-36 sm:h-16 overflow-visible" xmlns="http://www.w3.org/2000/svg" />
    </div>
  );
}

export function ClawdAiThinkingVisual({ className = "" }: { className?: string }) {
  const svgRef = useClawdScene(renderAiScene, 48, 26);
  return (
    <div className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 96 44" className="w-16 h-8 overflow-visible" xmlns="http://www.w3.org/2000/svg" />
    </div>
  );
}

const DEFAULT_THINKING_PHRASES = [
  "Memahami permintaanmu...",
  "Mencari ide segar...",
  "Menyusun struktur...",
  "Merapikan hasil...",
];

export function ClawdThinkingLabel({
  phrases = DEFAULT_THINKING_PHRASES,
  intervalMs = 1900,
  className = "",
}: {
  phrases?: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const count = phrases.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs]);

  return (
    <span className={`inline-block min-w-[10.5rem] ${className}`} aria-live="polite">
      <span key={idx} className="inline-block animate-in fade-in slide-in-from-bottom-1 duration-300">
        {phrases[idx % Math.max(1, count)]}
      </span>
    </span>
  );
}

export function ClawdRisetVisual({
  percent,
  isDone = false,
  className = "",
}: {
  percent?: number;
  isDone?: boolean;
  className?: string;
}) {
  const value = typeof percent === "number" ? percent : isDone ? 100 : 45;
  const svgRef = useClawdScene((ctx) => renderRisetScene(ctx, value), 58, 30);
  return (
    <div className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 116 56" className="w-24 h-12 sm:w-28 sm:h-14 overflow-visible" xmlns="http://www.w3.org/2000/svg" />
    </div>
  );
}

export function ClawdVerifyVisual({ className = "" }: { className?: string }) {
  const svgRef = useClawdScene(renderVerifyScene, 57, 30);
  return (
    <div className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 114 54" className="w-28 h-14 overflow-visible" xmlns="http://www.w3.org/2000/svg" />
    </div>
  );
}

export function ClawdSuccessVisual({ className = "" }: { className?: string }) {
  const svgRef = useClawdScene(renderSuccessScene, 57, 30);
  return (
    <div className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 114 54" className="w-32 h-16 sm:w-36 sm:h-18 overflow-visible" xmlns="http://www.w3.org/2000/svg" />
    </div>
  );
}

export function ClawdErrorVisual({ className = "" }: { className?: string }) {
  const svgRef = useClawdScene(renderErrorScene, 57, 30);
  return (
    <div className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 114 54" className="w-32 h-16 sm:w-36 sm:h-18 overflow-visible" xmlns="http://www.w3.org/2000/svg" />
    </div>
  );
}

export function ClawdOnboardingVisual({
  step = 1,
  reactKey = 0,
  className = "",
}: {
  step: number;
  reactKey?: number;
  className?: string;
}) {
  const svgRef = useClawdScene((ctx) => renderOnboardingScene(ctx, step, reactKey), 105, 40);
  return (
    <div className={`flex items-center justify-center pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 210 70" className="w-48 h-16 sm:w-56 sm:h-20 overflow-visible" xmlns="http://www.w3.org/2000/svg" />
    </div>
  );
}
