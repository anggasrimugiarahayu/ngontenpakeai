"use client";

import React, { useEffect, useRef } from "react";

// ============================================================================
// 1. SHARED PALETTE, EASING & TICKER ENGINE (Zero CPU when off-screen)
// ============================================================================
const PAL = {
  ink: "#2B2233",
  clay: "#D97757",
  clayDk: "#A84D33",
  clayLt: "#F2A283",
  orange: "#F97316",
  rose: "#E27A92",
  ochre: "#E8AA38",
  sap: "#6E9F58",
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
const ease = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
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

let _seed = 1;
let _boilFrame = 0;
function boilSeed(key: string) {
  let h = 2166136261;
  const s = `${key}|${_boilFrame}`;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  _seed = (h >>> 0) || 1;
}
const rnd = () =>
  ((_seed = (_seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const jit = (a: number) => (rnd() * 2 - 1) * a;

// Centralized rAF ticker across all active loaders
type TickerCb = (now: number, dt: number) => void;
const subscribers = new Set<TickerCb>();
let globalRafId: number | null = null;
let lastGlobalTs = 0;

function tickGlobal(now: number) {
  const dt = Math.min(0.05, (now - lastGlobalTs) / 1000);
  lastGlobalTs = now;
  _boilFrame = Math.floor(now / 100);
  subscribers.forEach((cb) => cb(now, dt));
  if (subscribers.size > 0) {
    globalRafId = requestAnimationFrame(tickGlobal);
  } else {
    globalRafId = null;
  }
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

// ============================================================================
// 2. ORGANIC CLAWD RIG & SPARKLE GENERATOR (100% Transparent SVG)
// ============================================================================
interface ClawdPose {
  id?: string;
  view?: "front" | "q";
  sq?: number;
  dy?: number;
  lean?: number;
  rot?: number;
  scale?: number;
  lookX?: number;
  lookY?: number;
  eyes?: "normal" | "happy" | "closed" | "spark" | "wide";
  brows?: "confident" | "focus" | "worried" | null;
  mouth?: "smile" | "grin" | "o" | "flat";
  blush?: number;
  walk?: boolean;
  walkSpeed?: number;
  legSwing?: boolean;
  armLBack?: boolean;
  armRBack?: boolean;
  handL?: number[];
  handR?: number[];
  propL?: string;
  propR?: string;
  seed?: number;
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
  const J = u * 0.028;

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
      (propSvg
        ? `<g transform="translate(${f1(hx)}, ${f1(hy)})">${propSvg}</g>`
        : "") +
      `</g>`
    );
  };

  const hL = o.handL || [-5.8 * u, -2.6 * u, -0.5];
  const hR = o.handR || [5.8 * u, -2.6 * u, 0.5];
  let inner = "";

  // Ground soft shadow
  const shScale = clamp(1 - (-dy / (u * 8)) * 0.25, 0.65, 1.15);
  inner += `<ellipse cx="0" cy="${f1(-dy + 0.2 * u)}" rx="${f1(4.8 * u * shScale)}" ry="${f1(0.85 * u * shScale)}" fill="${isDark ? "rgba(0,0,0,0.32)" : "rgba(15,23,42,0.12)"}"/>`;

  // 4 Stubby legs
  [-3.1, -1.1, 1.1, 3.1].forEach((lx, i) => {
    let legY = -2.0 * u;
    let legRot = 0;
    if (o.walk) {
      const ph = t * (o.walkSpeed || 8.5) + (i % 2 === 0 ? 0 : Math.PI);
      legY += Math.min(0, Math.sin(ph)) * 0.72 * u;
      legRot = Math.cos(ph) * 9.5;
    } else if (o.legSwing) {
      legY += Math.sin(t * 4.2 + i * 1.3) * 0.24 * u;
    }
    inner +=
      `<g transform="translate(${f1(lx * u)}, ${f1(legY)}) rotate(${f1(legRot)})">` +
      `<rect x="${f1(-0.52 * u)}" y="0" width="${f1(1.04 * u)}" height="${f1(1.95 * u)}" rx="${f1(0.36 * u)}" fill="${i % 2 ? PAL.clayDk : PAL.clay}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.8)}"/>` +
      `</g>`;
  });

  if (o.armLBack) {
    inner += rubberArm(
      -4.5 * u + lean * 0.4,
      -4.5 * u,
      hL[0],
      hL[1],
      hL[2] ?? -0.6,
      o.propL || ""
    );
  }
  if (o.armRBack) {
    inner += rubberArm(
      4.5 * u + lean * 0.4,
      -4.5 * u,
      hR[0],
      hR[1],
      hR[2] ?? 0.6,
      o.propR || ""
    );
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
  const lx = (o.lookX || 0) * 0.65 * u;
  const ly = (o.lookY || 0) * 0.5 * u;
  const blink =
    !["happy", "closed", "spark"].includes(o.eyes || "") &&
    ((t * 0.85 + (o.seed || 0.3)) % 3.2) < 0.12;

  inner += `<g transform="translate(${f1(fcx)}, ${f1(fy)})">`;
  if (o.blush) {
    for (const s of [-1, 1]) {
      inner += `<ellipse cx="${f1(s * 3.5 * u)}" cy="${f1(1.3 * u)}" rx="${f1(0.85 * u)}" ry="${f1(0.42 * u)}" fill="${PAL.rose}" fill-opacity="${f1(0.65 * o.blush)}"/>`;
    }
  }
  for (const s of [-1, 1]) {
    const ex = s * 2.4 * u;
    if (blink || o.eyes === "closed") {
      inner += `<path d="M ${f1(ex - 0.8 * u)} ${f1(0.2 * u)} Q ${f1(ex)} ${f1(0.55 * u)} ${f1(ex + 0.8 * u)} ${f1(0.2 * u)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw * 1.15)}" stroke-linecap="round"/>`;
    } else if (o.eyes === "happy") {
      inner += `<path d="M ${f1(ex - 0.9 * u)} ${f1(0.5 * u)} Q ${f1(ex)} ${f1(-0.8 * u)} ${f1(ex + 0.9 * u)} ${f1(0.5 * u)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw * 1.25)}" stroke-linecap="round"/>`;
    } else if (o.eyes === "spark") {
      const tw = (1 + 0.14 * Math.sin(t * 11)) * 1.22 * u;
      inner += `<path d="M ${f1(ex)} ${f1(-tw)} L ${f1(ex + tw * 0.35)} ${f1(-tw * 0.35)} L ${f1(ex + tw)} 0 L ${f1(ex + tw * 0.35)} ${f1(tw * 0.35)} L ${f1(ex)} ${f1(tw)} L ${f1(ex - tw * 0.35)} ${f1(tw * 0.35)} L ${f1(ex - tw)} 0 L ${f1(ex - tw * 0.35)} ${f1(-tw * 0.35)} Z" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.65)}"/>`;
    } else {
      const ew = o.eyes === "wide" ? 1.25 * u : 1.05 * u;
      const eh = o.eyes === "wide" ? 2.35 * u : 2.0 * u;
      inner += `<rect x="${f1(ex - ew / 2 + lx)}" y="${f1(-eh / 2 + ly)}" width="${f1(ew)}" height="${f1(eh)}" rx="${f1(ew * 0.42)}" fill="${PAL.ink}"/>`;
      inner += `<circle cx="${f1(ex - ew * 0.16 + lx)}" cy="${f1(-eh * 0.24 + ly)}" r="${f1(ew * 0.23)}" fill="${PAL.cream}"/>`;
      if (o.brows === "worried") {
        inner += `<line x1="${f1(ex - 0.85 * u)}" y1="${f1(-1.45 * u - s * 0.28 * u)}" x2="${f1(ex + 0.85 * u)}" y2="${f1(-1.45 * u + s * 0.28 * u)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.85)}" stroke-linecap="round"/>`;
      } else if (o.brows === "confident" || o.brows === "focus") {
        const sl = o.brows === "focus" ? 0.25 : 0.12;
        inner += `<line x1="${f1(ex - 0.85 * u)}" y1="${f1(-1.55 * u + s * sl * u)}" x2="${f1(ex + 0.85 * u)}" y2="${f1(-1.55 * u - s * sl * u)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.88)}" stroke-linecap="round"/>`;
      }
    }
  }

  const my = 1.65 * u;
  if (o.mouth === "smile") {
    inner += `<path d="M ${f1(-0.95 * u)} ${f1(my - 0.2 * u)} Q 0 ${f1(my + 0.68 * u)} ${f1(0.95 * u)} ${f1(my - 0.2 * u)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw)}" stroke-linecap="round"/>`;
  } else if (o.mouth === "grin") {
    inner += `<path d="M ${f1(-1.3 * u)} ${f1(my - 0.28 * u)} L ${f1(1.3 * u)} ${f1(my - 0.28 * u)} Q 0 ${f1(my + 1.2 * u)} ${f1(-1.3 * u)} ${f1(my - 0.28 * u)} Z" fill="#4A1F2A" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.75)}"/>`;
    inner += `<ellipse cx="0" cy="${f1(my + 0.26 * u)}" rx="${f1(0.6 * u)}" ry="${f1(0.22 * u)}" fill="${PAL.rose}"/>`;
  } else if (o.mouth === "o") {
    inner += `<ellipse cx="0" cy="${f1(my + 0.08 * u)}" rx="${f1(0.5 * u)}" ry="${f1(0.58 * u)}" fill="#4A1F2A"/>`;
  } else {
    inner += `<line x1="${f1(-0.68 * u)}" y1="${f1(my)}" x2="${f1(0.68 * u)}" y2="${f1(my)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.88)}" stroke-linecap="round"/>`;
  }
  inner += `</g>`;

  if (!o.armLBack) {
    inner += rubberArm(
      -4.5 * u + lean * 0.4,
      -4.5 * u,
      hL[0],
      hL[1],
      hL[2] ?? -0.6,
      o.propL || ""
    );
  }
  if (!o.armRBack) {
    inner += rubberArm(
      4.5 * u + lean * 0.4,
      -4.5 * u,
      hR[0],
      hR[1],
      hR[2] ?? 0.6,
      o.propR || ""
    );
  }

  return `<g transform="translate(${f1(x)}, ${f1(y + dy)}) scale(${f1(sc)}) rotate(${f1(rot)})">${inner}</g>`;
}

function drawSparkle(x: number, y: number, r: number, col = PAL.ochre, op = 1) {
  if (op <= 0.02) return "";
  return `<path d="M ${f1(x)} ${f1(y - r)} L ${f1(x + r * 0.32)} ${f1(y - r * 0.32)} L ${f1(x + r)} ${f1(y)} L ${f1(x + r * 0.32)} ${f1(y + r * 0.32)} L ${f1(x)} ${f1(y + r)} L ${f1(x - r * 0.32)} ${f1(y + r * 0.32)} L ${f1(x - r)} ${f1(y)} L ${f1(x - r * 0.32)} ${f1(y - r * 0.32)} Z" fill="${col}" opacity="${f1(op)}"/>`;
}

function thumbsUpProp(popK = 1) {
  const s = backOut(clamp(popK));
  return (
    `<g transform="scale(${f1(s)})">` +
    `<rect x="-6.5" y="-6" width="13" height="12" rx="4" fill="${PAL.clay}" stroke="${PAL.ink}" stroke-width="1.9"/>` +
    `<rect x="-2.5" y="-16" width="7" height="12" rx="3.5" fill="${PAL.clayLt}" stroke="${PAL.ink}" stroke-width="1.9"/>` +
    `<path d="M 10 -14 L 15 -19 M 12 -8 L 18 -9 M 3 -20 L 5 -25" stroke="${PAL.ochre}" stroke-width="2" stroke-linecap="round"/>` +
    `</g>`
  );
}

// Helper to check dark mode
function checkIsDark() {
  if (typeof document === "undefined") return true;
  return (
    document.documentElement.classList.contains("dark") ||
    (!document.documentElement.classList.contains("light") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

// ============================================================================
// 3. COMPONENT 1: ClawdPageVisual (Page & Tool Workspace Loader)
// ============================================================================
export function ClawdPageVisual({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let animTime = 0;
    const isDark = checkIsDark();

    const unsub = subscribeTicker((_, dt) => {
      animTime += dt;
      const t = animTime;
      const walkBob = Math.abs(Math.sin(t * 8.5));
      const sq = -walkBob * 0.08 + (1 - walkBob) * 0.05;

      const stackBob = Math.sin(t * 8.5 - 0.5) * 1.8;
      const stackProp =
        `<g transform="translate(11, ${f1(-5 + stackBob)})">` +
        `<rect x="-14" y="-3" width="28" height="7.5" rx="2.5" fill="${PAL.teal}" stroke="${PAL.ink}" stroke-width="1.5"/>` +
        `<rect x="-12" y="-10" width="26" height="7.5" rx="2.5" fill="${PAL.ochre}" stroke="${PAL.ink}" stroke-width="1.5"/>` +
        `<rect x="-10" y="-17" width="22" height="7.5" rx="2.5" fill="${PAL.orange}" stroke="${PAL.ink}" stroke-width="1.5"/>` +
        `</g>`;

      let svg = "";

      // Ambient floating workspace particles
      for (let i = 0; i < 3; i++) {
        const ph = (t * 0.7 + i * 0.33) % 1;
        const px = lerp(24, 76, ease(ph));
        const py = 42 + Math.sin(t * 4 + i * 2) * 6 - i * 8;
        const op = Math.sin(ph * Math.PI) * 0.85;
        const cols = [PAL.ochre, PAL.teal, PAL.orange];
        svg += `<circle cx="${f1(px)}" cy="${f1(py)}" r="2.8" fill="${cols[i]}" opacity="${f1(op)}"/>`;
      }

      // Compact Glowing Laptop Portal on the right
      svg +=
        `<g transform="translate(132, 54)">` +
        `<ellipse cx="0" cy="18" rx="26" ry="4" fill="${isDark ? "rgba(0,0,0,0.3)" : "rgba(15,23,42,0.08)"}"/>` +
        `<rect x="-22" y="-24" width="44" height="30" rx="4.5" fill="#1E293B" stroke="${PAL.ink}" stroke-width="1.6"/>` +
        `<rect x="-19" y="-21" width="38" height="23" rx="3" fill="${isDark ? "#0F172A" : "#FFF7ED"}"/>` +
        `<rect x="-15" y="-17" width="16" height="4" rx="1.8" fill="${PAL.orange}" opacity="0.9"/>` +
        `<rect x="-15" y="-10" width="18" height="10" rx="2" fill="${PAL.teal}" opacity="0.8"/>` +
        `<rect x="6" y="-10" width="10" height="4.5" rx="1.8" fill="${PAL.ochre}" opacity="0.8"/>` +
        `<rect x="-26" y="6" width="52" height="4.5" rx="2.2" fill="#CBD5E1" stroke="${PAL.ink}" stroke-width="1.5"/>` +
        `</g>`;

      // Clawd trotting carrying module books
      svg += drawClawd(
        78,
        69,
        4.3,
        {
          id: "page-loader-clawd",
          view: "q",
          walk: true,
          walkSpeed: 8.5,
          dy: -walkBob * 0.45,
          sq,
          lean: 0.22,
          lookX: 0.9,
          lookY: -0.15,
          eyes: "happy",
          mouth: "grin",
          blush: 0.7,
          armLBack: true,
          handL: [14, -18, 0.3],
          handR: [18, -15, 0.45],
          propR: stackProp,
        },
        t,
        isDark
      );

      svg += drawSparkle(148, 26, 4.5, PAL.ochre, 0.85);

      if (svgRef.current) svgRef.current.innerHTML = svg;
    });

    return unsub;
  }, []);

  return (
    <div
      className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 170 76"
        className="w-32 h-14 sm:w-36 sm:h-16 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      />
    </div>
  );
}

// ============================================================================
// 4. COMPONENT 2: ClawdAiThinkingVisual (Chat Bubble AI Loader)
// ============================================================================
export function ClawdAiThinkingVisual({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let animTime = 0;
    const isDark = checkIsDark();

    const unsub = subscribeTicker((_, dt) => {
      animTime += dt;
      const t = animTime;
      const cyc = t % 3.6;
      const bulbK = kf(cyc, [[0, 0], [1.1, 0], [1.5, 1], [2.8, 1], [3.3, 0]], backOut);
      const writeFast = cyc >= 1.5 && cyc <= 3.1;
      const penWave = Math.sin(t * (writeFast ? 15 : 8)) * (writeFast ? 6 : 3);

      let svg = "";

      // Mini draft card on the right
      svg +=
        `<g transform="translate(68, 25)">` +
        `<rect x="-16" y="-12" width="32" height="24" rx="4" fill="${isDark ? "#1E293B" : "#FFFFFF"}" stroke="${PAL.ink}" stroke-width="1.3"/>` +
        `<rect x="-12" y="-8" width="14" height="2.5" rx="1.2" fill="${PAL.orange}"/>` +
        `<rect x="-12" y="-3" width="22" height="2" rx="1" fill="${PAL.teal}"/>` +
        `<rect x="-12" y="2" width="18" height="2" rx="1" fill="${isDark ? "#64748B" : "#CBD5E1"}"/>` +
        `</g>`;

      // Pencil prop
      const pencilProp =
        `<g transform="rotate(${f1(-28 + penWave * 1.5)})">` +
        `<rect x="-1.8" y="-11" width="3.6" height="12" rx="1.2" fill="${PAL.ochre}" stroke="${PAL.ink}" stroke-width="1.2"/>` +
        `<polygon points="-1.8,1 1.8,1 0,5" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1"/>` +
        `</g>`;

      // Glowing lightbulb
      if (bulbK > 0.05) {
        svg +=
          `<g transform="translate(32, 10) scale(${f1(clamp(bulbK, 0, 1.15))})">` +
          `<circle cx="0" cy="0" r="7.5" fill="${PAL.ochre}" opacity="0.25"/>` +
          `<path d="M -4 1 C -5 -3 -3 -7 0 -7 C 3 -7 5 -3 4 1 L -4 1 Z" fill="#FDE047" stroke="${PAL.ink}" stroke-width="1.2"/>` +
          `<rect x="-2" y="1" width="4" height="2.5" rx="1" fill="#94A3B8" stroke="${PAL.ink}" stroke-width="1"/>` +
          `</g>`;
      }

      svg += drawClawd(
        32,
        38,
        3.1,
        {
          id: "ai-thinking-clawd",
          view: "q",
          sq: writeFast ? 0.04 * Math.sin(t * 10) : 0,
          lean: 0.22,
          lookX: 1.0,
          lookY: bulbK > 0.5 ? -0.7 : 0.1,
          eyes: writeFast ? "happy" : "normal",
          brows: "focus",
          mouth: writeFast ? "grin" : "smile",
          blush: 0.7,
          handL: [-14, -14, -0.5],
          handR: [22 + penWave, -12, 0.35],
          propR: pencilProp,
        },
        t,
        isDark
      );

      svg += drawSparkle(88, 16, 4 * bulbK, PAL.ochre, bulbK);

      if (svgRef.current) svgRef.current.innerHTML = svg;
    });

    return unsub;
  }, []);

  return (
    <div
      className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 96 44"
        className="w-16 h-8 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      />
    </div>
  );
}

// ============================================================================
// 5. COMPONENT 3: ClawdRisetVisual (Ruang Riset Progress Loader)
// ============================================================================
export function ClawdRisetVisual({
  isDone = false,
  className = "",
}: {
  isDone?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let animTime = 0;
    const isDark = checkIsDark();

    const unsub = subscribeTicker((_, dt) => {
      animTime += dt;
      const t = animTime;
      const bob = Math.sin(t * 6.5) * 1.5;

      let svg = "";

      // Mini magnifying glass prop
      const magProp =
        `<g transform="rotate(-15)">` +
        `<line x1="0" y1="0" x2="6" y2="-8" stroke="${PAL.woodDk}" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="14" cy="-17" r="11" fill="rgba(142,195,230,0.32)" stroke="${PAL.ink}" stroke-width="2"/>` +
        `<path d="M 9 -22 A 6 6 0 0 1 17 -23" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>` +
        `</g>`;

      // Content card on the right being scanned
      svg +=
        `<g transform="translate(86, 32)">` +
        `<rect x="-18" y="-20" width="36" height="40" rx="5" fill="${isDark ? "#1E293B" : "#FFFFFF"}" stroke="${isDone ? PAL.emerald : PAL.ink}" stroke-width="1.6"/>` +
        `<rect x="-14" y="-16" width="28" height="15" rx="3" fill="${isDone ? "rgba(16,185,129,0.18)" : isDark ? "#0F172A" : "#F1F5F9"}"/>` +
        `<rect x="-10" y="-3" width="4" height="8" rx="1.2" fill="${PAL.sky}"/>` +
        `<rect x="-3" y="-7" width="4" height="12" rx="1.2" fill="${PAL.ochre}"/>` +
        `<rect x="4" y="${isDone ? -12 : -5}" width="4" height="${isDone ? 17 : 10}" rx="1.2" fill="${isDone ? PAL.emerald : PAL.orange}"/>` +
        `<rect x="-14" y="5" width="22" height="3" rx="1.5" fill="${isDark ? "#475569" : "#CBD5E1"}"/>` +
        `<rect x="-14" y="11" width="14" height="3" rx="1.5" fill="${isDark ? "#334155" : "#E2E8F0"}"/>` +
        `</g>`;

      // Clawd looking through glass or giving thumbs-up
      svg += drawClawd(
        38,
        48,
        3.8,
        {
          id: "riset-loader-clawd",
          view: "q",
          walk: !isDone,
          walkSpeed: 7,
          dy: isDone ? -2 : bob * 0.35,
          lean: isDone ? -0.1 : 0.25,
          lookX: 1.0,
          lookY: -0.2,
          eyes: isDone ? "happy" : "spark",
          mouth: isDone ? "grin" : "o",
          blush: 0.8,
          handL: [-16, -16, -0.5],
          handR: isDone ? [22, -26, 0.4] : [24, -18, 0.3],
          propR: isDone ? thumbsUpProp(1) : magProp,
        },
        t,
        isDark
      );

      if (isDone) {
        svg += drawSparkle(92, 12, 5, PAL.emerald, 0.95);
      }

      if (svgRef.current) svgRef.current.innerHTML = svg;
    });

    return unsub;
  }, [isDone]);

  return (
    <div
      className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 116 56"
        className="w-24 h-12 sm:w-28 sm:h-14 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      />
    </div>
  );
}

// ============================================================================
// 6. COMPONENT 4: ClawdVerifyVisual (Checkout Verification & Blueprint Loader)
// ============================================================================
export function ClawdVerifyVisual({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let animTime = 0;
    const isDark = checkIsDark();

    const unsub = subscribeTicker((_, dt) => {
      animTime += dt;
      const t = animTime;
      const cyc = t % 3.2;
      const verified = cyc > 2.2;

      let svg = "";

      // Gateway / Shield Node on right
      const nodeCol = verified ? PAL.emerald : PAL.orange;
      svg +=
        `<g transform="translate(86, 30)">` +
        `<circle cx="0" cy="0" r="18" fill="${nodeCol}" opacity="0.14"/>` +
        `<rect x="-14" y="-15" width="28" height="30" rx="6" fill="${isDark ? "#1E293B" : "#FFFFFF"}" stroke="${nodeCol}" stroke-width="1.6"/>` +
        `<path d="M 0 -8 L 8 -5 L 8 1 C 8 7 4 10 0 12 C -4 10 -8 7 -8 1 L -8 -5 Z" fill="${nodeCol}" opacity="0.22" stroke="${nodeCol}" stroke-width="1.3"/>` +
        (verified
          ? `<path d="M -3 1 L -1 3 L 4 -2" fill="none" stroke="${PAL.emerald}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
          : `<circle cx="0" cy="1" r="2" fill="${PAL.orange}"/>`) +
        `</g>`;

      // Document in Clawd's hand
      const docProp =
        `<g transform="rotate(-8)">` +
        `<rect x="-9" y="-12" width="18" height="15" rx="2.5" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1.3"/>` +
        `<rect x="-6" y="-8" width="12" height="2.5" rx="1.2" fill="${verified ? PAL.emerald : PAL.ochre}"/>` +
        `</g>`;

      svg += drawClawd(
        34,
        48,
        3.8,
        {
          id: "verify-loader-clawd",
          view: "q",
          legSwing: true,
          lean: 0.16,
          lookX: 0.95,
          eyes: verified ? "happy" : "normal",
          brows: "focus",
          mouth: verified ? "grin" : "smile",
          blush: 0.7,
          handL: [-16, -16, -0.5],
          handR: [22, -18, 0.35],
          propR: docProp,
        },
        t,
        isDark
      );

      if (svgRef.current) svgRef.current.innerHTML = svg;
    });

    return unsub;
  }, []);

  return (
    <div
      className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 114 54"
        className="w-28 h-13 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      />
    </div>
  );
}

// ============================================================================
// 7. COMPONENT 5: ClawdOnboardingVisual (First-Login Onboarding Stepper)
// ============================================================================
export function ClawdOnboardingVisual({
  step = 1,
  className = "",
}: {
  step: number;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let animTime = 0;
    const isDark = checkIsDark();

    const unsub = subscribeTicker((_, dt) => {
      animTime += dt;
      const t = animTime;
      let svg = "";

      if (step === 1) {
        // Welcoming wave with niche chips
        const wave = Math.sin(t * 7.2) * 8;
        const badges = [
          { x: 38, y: 32, col: PAL.teal, label: "Dakwah" },
          { x: 172, y: 32, col: PAL.orange, label: "Bisnis" },
        ];
        badges.forEach((b) => {
          svg +=
            `<g transform="translate(${b.x}, ${b.y})">` +
            `<rect x="-24" y="-9" width="48" height="18" rx="9" fill="${isDark ? "#1E293B" : "#FFFFFF"}" stroke="${PAL.ink}" stroke-width="1.3"/>` +
            `<circle cx="-14" cy="0" r="3.5" fill="${b.col}"/>` +
            `<text x="4" y="2.8" text-anchor="middle" font-size="7.5" font-weight="700" fill="${isDark ? "#F1F5F9" : "#1E293B"}">${b.label}</text>` +
            `</g>`;
        });

        svg += drawClawd(
          105,
          62,
          4.3,
          {
            id: "onb-s1",
            view: "front",
            lookX: Math.sin(t * 1.6) * 0.6,
            eyes: "happy",
            mouth: "grin",
            blush: 0.8,
            handL: [-22, -18, -0.5],
            handR: [24 + wave * 0.6, -30 + Math.abs(wave) * 0.2, 0.5],
          },
          t,
          isDark
        );
        svg += drawSparkle(136, 22, 5, PAL.ochre, 0.85);
      } else if (step === 2) {
        // Clearing stuck ideas into clear solutions
        const cyc = t % 4.2;
        const solveK = kf(cyc, [[0, 0], [1.5, 0], [2.2, 1], [3.8, 1], [4.2, 0]]);
        svg +=
          `<g transform="translate(45, 34)" opacity="${f1(1 - solveK * 0.7)}">` +
          `<rect x="-22" y="-12" width="44" height="24" rx="6" fill="${isDark ? "#1E293B" : "#FFFFFF"}" stroke="${PAL.ink}" stroke-width="1.3"/>` +
          `<path d="M -10 -2 C -8 -8 2 -7 -2 0 C -6 6 8 7 9 -1" fill="none" stroke="${PAL.rose}" stroke-width="1.8" stroke-linecap="round"/>` +
          `</g>`;

        svg +=
          `<g transform="translate(165, 34)" opacity="${f1(0.3 + solveK * 0.7)}">` +
          `<rect x="-24" y="-13" width="48" height="26" rx="6" fill="${isDark ? "#1E293B" : "#FFFFFF"}" stroke="${solveK > 0.5 ? PAL.emerald : PAL.ink}" stroke-width="1.5"/>` +
          `<path d="M -8 0 L -4 4 L 6 -5" fill="none" stroke="${PAL.emerald}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
          `</g>`;

        svg += drawClawd(
          105,
          62,
          4.3,
          {
            id: "onb-s2",
            view: "front",
            lean: lerp(-0.15, 0.2, solveK),
            lookX: lerp(-0.8, 0.85, solveK),
            eyes: solveK > 0.5 ? "happy" : "normal",
            brows: solveK > 0.5 ? "confident" : "worried",
            mouth: solveK > 0.5 ? "grin" : "o",
            blush: 0.75,
            handL: [-22, -18, -0.5],
            handR: [24, lerp(-16, -28, solveK), 0.4],
          },
          t,
          isDark
        );
      } else if (step === 3) {
        // Platform targeting
        const plats = [
          { x: 38, y: 32, label: "TikTok", col: "#0EA5E9" },
          { x: 172, y: 32, label: "Reels", col: "#EC4899" },
        ];
        plats.forEach((p) => {
          svg +=
            `<g transform="translate(${p.x}, ${p.y})">` +
            `<rect x="-24" y="-9" width="48" height="18" rx="6" fill="${isDark ? "#1E293B" : "#FFFFFF"}" stroke="${PAL.orange}" stroke-width="1.4"/>` +
            `<circle cx="-14" cy="0" r="3.5" fill="${p.col}"/>` +
            `<text x="4" y="2.8" text-anchor="middle" font-size="7.5" font-weight="700" fill="${isDark ? "#F1F5F9" : "#1E293B"}">${p.label}</text>` +
            `</g>`;
        });

        svg += drawClawd(
          105,
          62,
          4.3,
          {
            id: "onb-s3",
            view: "front",
            lookX: 0.8,
            lookY: -0.4,
            eyes: "normal",
            brows: "focus",
            mouth: "smile",
            blush: 0.5,
            handL: [-22, -18, -0.5],
            handR: [24, -28, 0.4],
          },
          t,
          isDark
        );
      } else if (step === 4) {
        // Growth chart & stars
        const rise = 0.8 + 0.2 * Math.sin(t * 3.5);
        svg +=
          `<g transform="translate(162, 58)">` +
          `<rect x="-16" y="-10" width="7" height="10" rx="1.5" fill="${PAL.sky}"/>` +
          `<rect x="-7" y="-18" width="7" height="18" rx="1.5" fill="${PAL.teal}"/>` +
          `<rect x="2" y="${f1(-28 * rise)}" width="7" height="${f1(28 * rise)}" rx="1.5" fill="${PAL.orange}"/>` +
          `</g>`;

        svg += drawClawd(
          96,
          62,
          4.3,
          {
            id: "onb-s4",
            view: "front",
            walk: true,
            walkSpeed: 6,
            sq: 0.05,
            eyes: "spark",
            mouth: "grin",
            blush: 0.85,
            handL: [-24, -28, -0.5],
            handR: [24, -30, 0.5],
          },
          t,
          isDark
        );
        svg += drawSparkle(165, 20, 5, PAL.ochre, 0.95);
      } else {
        // Step 5: Final ready workspace + thumbs-up
        svg +=
          `<g transform="translate(154, 38)">` +
          `<rect x="-24" y="-16" width="48" height="32" rx="5" fill="#1E293B" stroke="${PAL.emerald}" stroke-width="1.8"/>` +
          `<rect x="-21" y="-13" width="42" height="26" rx="3.5" fill="${isDark ? "#0F172A" : "#FFF7ED"}"/>` +
          `<path d="M -4 -1 L -1 2 L 5 -4" fill="none" stroke="${PAL.emerald}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
          `</g>`;

        svg += drawClawd(
          78,
          62,
          4.3,
          {
            id: "onb-s5",
            view: "q",
            eyes: "happy",
            mouth: "grin",
            blush: 0.85,
            handL: [-18, -16, -0.5],
            handR: [24, -26, 0.4],
            propR: thumbsUpProp(1),
          },
          t,
          isDark
        );
        svg += drawSparkle(165, 14, 5.5, PAL.emerald, 0.95);
      }

      if (svgRef.current) svgRef.current.innerHTML = svg;
    });

    return unsub;
  }, [step]);

  return (
    <div
      className={`flex items-center justify-center pointer-events-none select-none ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 210 70"
        className="w-48 h-16 sm:w-56 sm:h-20 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      />
    </div>
  );
}
