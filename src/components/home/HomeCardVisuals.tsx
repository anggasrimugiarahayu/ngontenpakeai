"use client";

import React, { useEffect, useId, useRef } from "react";

type PillarKey = "belajar" | "ngonten" | "automation" | "riset";

// ============================================================================
// 1. MATH, EASING & DETERMINISTIC BOILING-LINE HELPERS
// ============================================================================
const SCENE_LEN = 3.8; // 3.8s per scene -> relaxed, natural storytelling pace

const PAL = {
  ink: "#2B2233",
  clay: "#D97757",
  clayDk: "#A84D33",
  clayLt: "#F2A283",
  rose: "#E27A92",
  ochre: "#E8AA38",
  sap: "#6E9F58",
  teal: "#3A9C98",
  violet: "#7B5CA8",
  cream: "#FFF5E2",
  sky: "#8EC3E6",
  red: "#E2476E",
  wood: "#9C6B43",
  woodDk: "#734B2B",
};

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const lerpArr = (a: number[], b: number[], k: number) =>
  a.map((v, i) => lerp(v, b[i], k));
const ease = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
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
  _seed = h >>> 0 || 1;
}
const rnd = () =>
  ((_seed = (_seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const jit = (a: number) => (rnd() * 2 - 1) * a;

// ============================================================================
// 2. REUSABLE CHARACTER (CLAWD), SWIVEL CHAIR, DESK, LAPTOP UI & CURSOR RIGS
// ============================================================================

interface ClawdPose {
  id?: string;
  view?: "front" | "q" | "back";
  sq?: number;
  dy?: number;
  lean?: number;
  recline?: number;
  rot?: number;
  scale?: number;
  lookX?: number;
  lookY?: number;
  eyes?: "normal" | "happy" | "closed" | "spark" | "wide" | "tired";
  brows?: "worried" | "confident" | "focus" | "question" | null;
  mouth?: "flat" | "smile" | "grin" | "wobble" | "sigh" | "o";
  blush?: number;
  seed?: number;
  noLegs?: boolean;
  legSwing?: boolean;
  armLBack?: boolean;
  armRBack?: boolean;
  handL?: number[];
  handR?: number[];
  propL?: string;
  propR?: string;
}

// Ergonomic Swivel Chair behind Clawd (supports `recline` when leaning back)
function drawChair(cx: number, floorY: number, recline = 0, isDark = false) {
  const tilt = recline * 14;
  const stemCol = isDark ? "#64748B" : "#475569";
  return (
    `<g transform="translate(${f1(cx)}, ${f1(floorY)})">` +
    `<line x1="-26" y1="-4" x2="26" y2="-4" stroke="${stemCol}" stroke-width="4" stroke-linecap="round"/>` +
    `<line x1="0" y1="-4" x2="0" y2="-32" stroke="${stemCol}" stroke-width="5"/>` +
    `<circle cx="-24" cy="-2" r="3" fill="${PAL.ink}"/><circle cx="24" cy="-2" r="3" fill="${PAL.ink}"/>` +
    `<g transform="translate(0, -32) rotate(${f1(-tilt)})">` +
    `<rect x="-46" y="-68" width="92" height="58" rx="14" fill="#3B4259" stroke="${PAL.ink}" stroke-width="2"/>` +
    `<rect x="-38" y="-60" width="76" height="42" rx="10" fill="#4B5574"/>` +
    `</g>` +
    `<rect x="-44" y="-36" width="88" height="10" rx="5" fill="#3B4259" stroke="${PAL.ink}" stroke-width="1.8"/>` +
    `</g>`
  );
}

// Organic Fluid Clawd Rig (Rubber-hose arms, soft clay body lean/shear, expressive face)
function drawClawd(x: number, y: number, u: number, o: ClawdPose = {}, t = 0) {
  boilSeed(o.id || "clawd");
  const view = o.view || "front";
  const breath = Math.sin(t * 3.1) * 0.022;
  const sq = (o.sq || 0) + breath;
  const dy = (o.dy || 0) * u;
  const lean = (o.lean || 0) * u;
  const recline = o.recline || 0;
  const rot = (o.rot || 0) - recline * 10;
  const sc = o.scale ?? 1;
  const sw = clamp(u * 0.21, 1.4, 2.3);
  const J = u * 0.03;

  const rubberArm = (
    sx0: number,
    sy0: number,
    hx: number,
    hy: number,
    bend = -1,
    propSvg = ""
  ) => {
    const mx = (sx0 + hx) / 2 + bend * u * 0.85;
    const my = (sy0 + hy) / 2 + Math.abs(bend) * u * 0.4;
    const d = `M ${f1(sx0)} ${f1(sy0)} Q ${f1(mx)} ${f1(my)} ${f1(hx)} ${f1(hy)}`;
    return (
      `<g>` +
      `<path d="${d}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(u * 1.12 + sw * 1.6)}" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="${PAL.clay}" stroke-width="${f1(u * 1.12)}" stroke-linecap="round"/>` +
      (propSvg
        ? `<g transform="translate(${f1(hx)}, ${f1(hy)})">${propSvg}</g>`
        : "") +
      `</g>`
    );
  };

  const hL = o.handL || [-5.8 * u, -2.5 * u, -0.5];
  const hR = o.handR || [5.8 * u, -2.5 * u, 0.5];
  let inner = "";

  // Stubby legs under desk
  if (!o.noLegs) {
    [-3.1, -1.1, 1.1, 3.1].forEach((lx, i) => {
      const swing = o.legSwing ? Math.sin(t * 4 + i * 1.4) * 0.25 * u : 0;
      inner += `<rect x="${f1(lx * u - 0.5 * u)}" y="${f1(-2.0 * u + swing)}" width="${f1(1.05 * u)}" height="${f1(1.9 * u)}" rx="${f1(0.35 * u)}" fill="${i % 2 ? PAL.clayDk : PAL.clay}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.8)}"/>`;
    });
  }

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

  // Deformable Clay Body
  const bw = 5.0 * u * (1 + sq * 0.42);
  const bhTop = -8.0 * u * (1 - sq * 0.52);
  const bhBot = -2.0 * u;
  const tl = [-bw + lean + jit(J), bhTop + jit(J)];
  const tr = [bw + lean + jit(J), bhTop + jit(J)];
  const br = [bw * 0.98 + jit(J), bhBot + jit(J)];
  const bl = [-bw * 0.98 + jit(J), bhBot + jit(J)];
  const bodyD = `M ${f1(tl[0])} ${f1(tl[1])} Q ${f1(lean)} ${f1(bhTop - 0.22 * u)} ${f1(tr[0])} ${f1(tr[1])} L ${f1(br[0])} ${f1(br[1])} Q 0 ${f1(bhBot + 0.14 * u)} ${f1(bl[0])} ${f1(bl[1])} Z`;

  inner += `<path d="${bodyD}" fill="${PAL.clay}"/>`;
  inner += `<ellipse cx="${f1(-1.4 * u + lean * 0.7)}" cy="${f1(bhTop + 1.5 * u)}" rx="${f1(3.0 * u)}" ry="${f1(1.1 * u)}" fill="${PAL.clayLt}" fill-opacity="0.4"/>`;
  inner += `<path d="M ${f1(bl[0] + 0.3 * u)} ${f1(bhBot - 1.2 * u)} L ${f1(br[0] - 0.3 * u)} ${f1(bhBot - 1.2 * u)} L ${f1(br[0] - 0.2 * u)} ${f1(bhBot - 0.15 * u)} L ${f1(bl[0] + 0.2 * u)} ${f1(bhBot - 0.15 * u)} Z" fill="${PAL.clayDk}" fill-opacity="0.28"/>`;
  if (view === "back") {
    inner += `<path d="${bodyD}" fill="${PAL.clayDk}" fill-opacity="0.16"/>`;
  }
  inner += `<path d="${bodyD}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw)}" stroke-linejoin="round"/>`;

  // Face
  if (view !== "back") {
    const fcx = (view === "q" ? 1.2 * u : 0) + lean * 0.72;
    const fy = (bhTop + bhBot) / 2 - 0.95 * u;
    const lx = (o.lookX || 0) * 0.65 * u;
    const ly = (o.lookY || 0) * 0.5 * u;
    const blink =
      !["happy", "closed", "spark"].includes(o.eyes || "") &&
      ((t * 0.8 + (o.seed || 0.3)) % 3.4) < 0.12;

    inner += `<g transform="translate(${f1(fcx)}, ${f1(fy)})">`;
    if (o.blush) {
      for (const s of [-1, 1]) {
        inner += `<ellipse cx="${f1(s * 3.5 * u)}" cy="${f1(1.3 * u)}" rx="${f1(0.85 * u)}" ry="${f1(0.4 * u)}" fill="${PAL.rose}" fill-opacity="${f1(0.65 * o.blush)}"/>`;
      }
    }
    for (const s of [-1, 1]) {
      const ex = s * 2.4 * u;
      if (blink || o.eyes === "closed") {
        inner += `<path d="M ${f1(ex - 0.8 * u)} ${f1(0.2 * u)} Q ${f1(ex)} ${f1(0.55 * u)} ${f1(ex + 0.8 * u)} ${f1(0.2 * u)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw * 1.15)}" stroke-linecap="round"/>`;
      } else if (o.eyes === "happy") {
        inner += `<path d="M ${f1(ex - 0.9 * u)} ${f1(0.5 * u)} Q ${f1(ex)} ${f1(-0.75 * u)} ${f1(ex + 0.9 * u)} ${f1(0.5 * u)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw * 1.25)}" stroke-linecap="round"/>`;
      } else if (o.eyes === "spark") {
        const tw = (1 + 0.12 * Math.sin(t * 11)) * 1.2 * u;
        inner += `<path d="M ${f1(ex)} ${f1(-tw)} L ${f1(ex + tw * 0.35)} ${f1(-tw * 0.35)} L ${f1(ex + tw)} 0 L ${f1(ex + tw * 0.35)} ${f1(tw * 0.35)} L ${f1(ex)} ${f1(tw)} L ${f1(ex - tw * 0.35)} ${f1(tw * 0.35)} L ${f1(ex - tw)} 0 L ${f1(ex - tw * 0.35)} ${f1(-tw * 0.35)} Z" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.65)}"/>`;
      } else {
        const ew = o.eyes === "wide" ? 1.25 * u : 1.05 * u;
        const eh =
          o.eyes === "tired" ? 1.25 * u : o.eyes === "wide" ? 2.4 * u : 2.0 * u;
        inner += `<rect x="${f1(ex - ew / 2 + lx)}" y="${f1(-eh / 2 + ly)}" width="${f1(ew)}" height="${f1(eh)}" rx="${f1(ew * 0.42)}" fill="${PAL.ink}"/>`;
        inner += `<circle cx="${f1(ex - ew * 0.16 + lx)}" cy="${f1(-eh * 0.24 + ly)}" r="${f1(ew * 0.22)}" fill="${PAL.cream}"/>`;
        if (o.brows === "worried") {
          inner += `<line x1="${f1(ex - 0.85 * u)}" y1="${f1(-1.45 * u - s * 0.28 * u)}" x2="${f1(ex + 0.85 * u)}" y2="${f1(-1.45 * u + s * 0.28 * u)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.85)}" stroke-linecap="round"/>`;
        } else if (o.brows === "confident" || o.brows === "focus") {
          const sl = o.brows === "focus" ? 0.26 : 0.12;
          inner += `<line x1="${f1(ex - 0.85 * u)}" y1="${f1(-1.55 * u + s * sl * u)}" x2="${f1(ex + 0.85 * u)}" y2="${f1(-1.55 * u - s * sl * u)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.88)}" stroke-linecap="round"/>`;
        } else if (o.brows === "question") {
          const by = s < 0 ? -1.25 * u : -1.75 * u;
          inner += `<line x1="${f1(ex - 0.8 * u)}" y1="${f1(by)}" x2="${f1(ex + 0.8 * u)}" y2="${f1(by - s * 0.2 * u)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.85)}" stroke-linecap="round"/>`;
        }
      }
    }

    // Mouth
    const my = 1.65 * u;
    if (o.mouth === "smile") {
      inner += `<path d="M ${f1(-0.95 * u)} ${f1(my - 0.2 * u)} Q 0 ${f1(my + 0.65 * u)} ${f1(0.95 * u)} ${f1(my - 0.2 * u)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw)}" stroke-linecap="round"/>`;
    } else if (o.mouth === "grin") {
      inner += `<path d="M ${f1(-1.3 * u)} ${f1(my - 0.28 * u)} L ${f1(1.3 * u)} ${f1(my - 0.28 * u)} Q 0 ${f1(my + 1.2 * u)} ${f1(-1.3 * u)} ${f1(my - 0.28 * u)} Z" fill="#4A1F2A" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.75)}"/>`;
      inner += `<ellipse cx="0" cy="${f1(my + 0.26 * u)}" rx="${f1(0.6 * u)}" ry="${f1(0.22 * u)}" fill="${PAL.rose}"/>`;
    } else if (o.mouth === "wobble") {
      inner += `<path d="M ${f1(-1.05 * u)} ${f1(my + 0.1 * u)} Q ${f1(-0.5 * u)} ${f1(my - 0.35 * u)} 0 ${f1(my + 0.1 * u)} Q ${f1(0.5 * u)} ${f1(my + 0.45 * u)} ${f1(1.05 * u)} ${f1(my)}" fill="none" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.88)}" stroke-linecap="round"/>`;
    } else if (o.mouth === "sigh" || o.mouth === "o") {
      inner += `<ellipse cx="0" cy="${f1(my + 0.1 * u)}" rx="${f1(0.48 * u)}" ry="${f1(0.58 * u)}" fill="#4A1F2A"/>`;
    } else {
      inner += `<line x1="${f1(-0.68 * u)}" y1="${f1(my)}" x2="${f1(0.68 * u)}" y2="${f1(my)}" stroke="${PAL.ink}" stroke-width="${f1(sw * 0.88)}" stroke-linecap="round"/>`;
    }
    inner += `</g>`;
  }

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

// Thumbs-Up Prop
function thumbsUpProp(popK = 1) {
  const s = backOut(clamp(popK));
  return (
    `<g transform="scale(${f1(s)})">` +
    `<rect x="-7" y="-6" width="14" height="13" rx="4.5" fill="${PAL.clay}" stroke="${PAL.ink}" stroke-width="2"/>` +
    `<rect x="-3" y="-17" width="7.5" height="13" rx="3.7" fill="${PAL.clayLt}" stroke="${PAL.ink}" stroke-width="2"/>` +
    `<line x1="6" y1="-2" x2="2" y2="-2" stroke="${PAL.ink}" stroke-width="1.5" stroke-linecap="round"/>` +
    `<line x1="6" y1="2" x2="2" y2="2" stroke="${PAL.ink}" stroke-width="1.5" stroke-linecap="round"/>` +
    `<path d="M 11 -16 L 17 -21 M 14 -9 L 21 -10 M 4 -22 L 6 -28" stroke="${PAL.ochre}" stroke-width="2.2" stroke-linecap="round"/>` +
    `</g>`
  );
}

// Clean Grounded Desk Base (legs align cleanly with swivel chair floor at y = 256)
function drawDeskBase(deskY = 198, isDark = false) {
  const floorCol = isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.12)";
  return (
    `<line x1="26" y1="${deskY + 59}" x2="454" y2="${deskY + 59}" stroke="${floorCol}" stroke-width="2" stroke-linecap="round"/>` +
    `<rect x="54" y="${deskY + 11}" width="12" height="47" rx="2.5" fill="${PAL.woodDk}" stroke="${PAL.ink}" stroke-width="1.8"/>` +
    `<rect x="414" y="${deskY + 11}" width="12" height="47" rx="2.5" fill="${PAL.woodDk}" stroke="${PAL.ink}" stroke-width="1.8"/>` +
    `<rect x="34" y="${deskY}" width="412" height="12" rx="5" fill="${PAL.wood}" stroke="${PAL.ink}" stroke-width="2"/>`
  );
}

function drawDeskLaptop(
  cx: number,
  deskY = 198,
  glowCol = PAL.sky,
  lidOpen = 1
) {
  const lo = clamp(lidOpen);
  const h = -4 - 34 * lo;
  return (
    `<g transform="translate(${f1(cx)}, ${deskY})">` +
    (lo > 0.35
      ? `<polygon points="-32,${f1(h)} 32,${f1(h)} 52,-72 -52,-72" fill="${glowCol}" fill-opacity="${f1(0.11 * lo)}"/>`
      : "") +
    `<polygon points="-34,${f1(h)} 34,${f1(h)} 38,-4 -38,-4" fill="#334155" stroke="${PAL.ink}" stroke-width="2" stroke-linejoin="round"/>` +
    `<rect x="-42" y="-5" width="84" height="5" rx="2.5" fill="#94A3B8" stroke="${PAL.ink}" stroke-width="1.7"/>` +
    (lo > 0.45
      ? `<circle cx="0" cy="${f1(h * 0.55)}" r="4.2" fill="${PAL.cream}" fill-opacity="0.8"/>`
      : "") +
    `</g>`
  );
}

// Over-the-Shoulder Close-Up Laptop Screen Frame + Clawd Back Silhouette in Foreground
function drawLaptopScreenStage(
  activeMenu: string,
  innerScreenSvg: string,
  t: number,
  isDark: boolean,
  uid: string,
  clawdAct: { lean?: number; dy?: number; handR?: number[]; propR?: string } = {}
) {
  const screenBg = isDark ? "#0F172A" : "#FFFFFF";
  const sideBg = isDark ? "#1E293B" : "#F1F5F9";
  const txtMuted = isDark ? "#94A3B8" : "#64748B";
  const menus = [
    { id: "belajar", label: "Ruang Belajar", col: PAL.ochre },
    { id: "ngonten", label: "Ruang Ngonten", col: PAL.violet },
    { id: "automation", label: "Ruang Automation", col: PAL.teal },
    { id: "riset", label: "Ruang Riset", col: PAL.sky },
  ];

  let out = "";
  // Monitor Bezel
  out += `<rect x="64" y="16" width="376" height="218" rx="14" fill="#1E2436" stroke="${PAL.ink}" stroke-width="2.5"/>`;
  out += `<rect x="72" y="24" width="360" height="202" rx="8" fill="${screenBg}"/>`;
  // Top Window Bar
  out += `<rect x="72" y="24" width="360" height="18" rx="6" fill="${sideBg}"/>`;
  out += `<circle cx="84" cy="33" r="3" fill="${PAL.red}"/><circle cx="94" cy="33" r="3" fill="${PAL.ochre}"/><circle cx="104" cy="33" r="3" fill="${PAL.sap}"/>`;

  // Left App Sidebar
  out += `<rect x="72" y="42" width="96" height="184" fill="${sideBg}"/>`;
  out += `<line x1="168" y1="42" x2="168" y2="226" stroke="${isDark ? "#334155" : "#E2E8F0"}" stroke-width="1.5"/>`;
  menus.forEach((m, i) => {
    const my = 53 + i * 28;
    const isAct = m.id === activeMenu;
    out += `<rect x="78" y="${my}" width="84" height="22" rx="6" fill="${isAct ? m.col : "transparent"}" fill-opacity="${isAct ? 0.22 : 0}" stroke="${isAct ? m.col : "none"}" stroke-width="1.5"/>`;
    out += `<circle cx="87" cy="${my + 11}" r="3.5" fill="${isAct ? m.col : txtMuted}"/>`;
    out += `<text x="95" y="${my + 12}" dominant-baseline="central" font-size="8.2" font-weight="${isAct ? "800" : "600"}" fill="${isAct ? (isDark ? "#FFF" : "#0F172A") : txtMuted}">${m.label}</text>`;
  });

  // Clipped Main Screen Content Area
  const clipId = `${uid}-scr`;
  out += `<clipPath id="${clipId}"><rect x="169" y="43" width="262" height="182" rx="4"/></clipPath>`;
  out += `<g clip-path="url(#${clipId})">${innerScreenSvg}</g>`;

  // Laptop Base Lip & Desk Edge Strip
  out += `<rect x="44" y="234" width="416" height="9" rx="4" fill="#64748B" stroke="${PAL.ink}" stroke-width="2"/>`;
  out += `<rect x="30" y="243" width="438" height="10" rx="4" fill="${PAL.wood}" stroke="${PAL.ink}" stroke-width="1.8"/>`;

  // Foreground Over-the-Shoulder Clawd (closed bottom sits cleanly at y ~ 256)
  const u = 6.4;
  const nod = Math.sin(t * 3.8) * 0.16 + (clawdAct.lean || 0);
  out += drawClawd(
    70,
    268,
    u,
    {
      id: `${uid}-ots`,
      view: "back",
      noLegs: true,
      lean: nod,
      dy: clawdAct.dy || Math.sin(t * 3.8) * 0.14,
      handL: [-4.2 * u, -4.4 * u, -0.4],
      handR:
        clawdAct.handR || [
          6.2 * u,
          (-5.2 + Math.sin(t * 6) * 0.25) * u,
          0.5,
        ],
      propR: clawdAct.propR || "",
    },
    t
  );

  return out;
}

// Animated Vector Pointer Cursor + Click Ripple
function drawCursor(x: number, y: number, clickK = 0) {
  let r = "";
  if (clickK > 0.02 && clickK < 0.98) {
    r += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(4 + clickK * 18)}" fill="none" stroke="${PAL.ochre}" stroke-width="${f1(2.8 * (1 - clickK))}"/>`;
  }
  const sc = clickK > 0.05 && clickK < 0.45 ? 0.82 : 1;
  return (
    r +
    `<g transform="translate(${f1(x)}, ${f1(y)}) scale(${sc})">` +
    `<polygon points="0,0 0,17 4.8,13.2 8.2,20 11.2,18.5 7.6,11.8 13,11.8" fill="#FFFFFF" stroke="${PAL.ink}" stroke-width="1.8" stroke-linejoin="round"/>` +
    `</g>`
  );
}

// Messy Open Book vs Neat Stacked Books
function drawBookStack(x: number, y: number, neat = false) {
  if (neat) {
    return (
      `<g transform="translate(${x}, ${y})">` +
      `<rect x="-26" y="-8" width="52" height="8" rx="2" fill="${PAL.teal}" stroke="${PAL.ink}" stroke-width="1.6"/>` +
      `<rect x="-24" y="-16" width="48" height="8" rx="2" fill="${PAL.ochre}" stroke="${PAL.ink}" stroke-width="1.6"/>` +
      `<rect x="-22" y="-24" width="44" height="8" rx="2" fill="${PAL.clay}" stroke="${PAL.ink}" stroke-width="1.6"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x}, ${y})">` +
    `<polygon points="-32,0 0,3 32,0 26,-9 0,-5 -26,-9" fill="${PAL.ochre}" stroke="${PAL.ink}" stroke-width="1.6"/>` +
    `<polygon points="-28,-8 0,-4 28,-8 22,-15 0,-10 -22,-15" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1.5"/>` +
    `</g>`
  );
}

// ============================================================================
// 3. FOUR COMPLETE STORYBOARDS (RUANG BELAJAR, NGONTEN, AUTOMATION, RISET)
// ============================================================================
const SCENE_COUNTS: Record<PillarKey, number> = {
  belajar: 5,
  ngonten: 6,
  automation: 6,
  riset: 6,
};

function renderPillarScene(
  pillar: PillarKey,
  scIdx: number,
  lt: number,
  t: number,
  isDark: boolean,
  uid: string
): string {
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const txtMain = isDark ? "#F8FAFC" : "#0F172A";

  // --------------------------------------------------------------------------
  // 1. RUANG BELAJAR (5 SCENES)
  // --------------------------------------------------------------------------
  if (pillar === "belajar") {
    // SCENE 1: Opens laptop surrounded by messy books/notes/papers -> reads left book -> switches to right book -> confused
    if (scIdx === 0) {
      const lidK = easeOut(seg(lt, 0.05, 0.55));
      const switchBook = kf(lt, [
        [0, 0],
        [0.55, 0],
        [0.85, -1],
        [1.65, -1],
        [2.05, 1],
        [2.8, 1],
        [3.15, 0],
      ]);
      let s = drawChair(240, 256, 0, isDark);

      const confusedEnd = lt > 2.85;
      const openingLaptop = lt < 0.55;
      const hL = openingLaptop
        ? [-2.8 * 8.2, (-1.8 - lidK * 1.4) * 8.2, -0.4]
        : switchBook < -0.2
          ? [-9.5 * 8.2, -1.6 * 8.2, -0.5]
          : [-4.8 * 8.2, -2.0 * 8.2, -0.4];
      const hR = openingLaptop
        ? [2.8 * 8.2, (-1.8 - lidK * 1.4) * 8.2, 0.4]
        : switchBook > 0.2
          ? [9.5 * 8.2, -1.6 * 8.2, 0.5]
          : confusedEnd
            ? [2.8 * 8.2, -8.0 * 8.2, 1.1]
            : [4.8 * 8.2, -2.0 * 8.2, 0.4];

      s += drawClawd(
        240,
        206,
        8.2,
        {
          id: uid,
          lean: switchBook * 0.65,
          lookX: confusedEnd ? Math.sin(t * 8) * 0.5 : switchBook * 0.85,
          lookY: 0.45,
          eyes: "normal",
          brows: confusedEnd ? "question" : lt > 0.6 ? "worried" : null,
          mouth: confusedEnd ? "wobble" : lt > 0.6 ? "sigh" : "flat",
          handL: hL,
          handR: hR,
        },
        t
      );

      s += drawDeskBase(198, isDark);
      s += `<polygon points="52,198 86,193 92,202 58,206" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1.4"/>`;
      s += `<polygon points="384,196 424,201 416,208 378,203" fill="#FEF08A" stroke="${PAL.ink}" stroke-width="1.4"/>`;
      s += drawBookStack(126, 198, false);
      s += drawBookStack(356, 198, false);
      s += drawDeskLaptop(240, 198, PAL.ochre, lidK);
      if (confusedEnd) {
        const p = backOut(seg(lt, 2.85, 3.25));
        s += `<g transform="translate(284, 106) scale(${f1(p)})"><circle cx="0" cy="0" r="14" fill="${cardBg}" stroke="${PAL.ink}" stroke-width="1.8"/><text x="0" y="1" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="900" fill="${PAL.ochre}">?</text></g>`;
      }
      return s;
    }

    // SCENE 2: Closes book, leans back into chair, looks at laptop & clicks Ruang Belajar
    if (scIdx === 1) {
      if (lt < 2.15) {
        const closeK = ease(seg(lt, 0.15, 0.65));
        const rec = kf(lt, [
          [0, 0],
          [0.7, 0],
          [1.25, 0.85],
          [1.75, 0.85],
          [2.1, 0.15],
        ]);
        let s = drawChair(240, 256, rec, isDark);
        s += drawClawd(
          240,
          206,
          8.2,
          {
            id: uid,
            recline: rec,
            lean: lerp(-0.4, 0, closeK),
            lookX: lerp(-0.5, 0, closeK),
            lookY: rec > 0.4 ? 0.1 : 0.35,
            eyes: rec > 0.5 ? "closed" : "normal",
            mouth: rec > 0.4 ? "sigh" : "flat",
            handL: lerpArr(
              [-8.8 * 8.2, -1.6 * 8.2, -0.5],
              [-4.8 * 8.2, -2.2 * 8.2, -0.4],
              closeK
            ),
            handR: [4.8 * 8.2, -2.2 * 8.2, 0.4],
          },
          t
        );
        s += drawDeskBase(198, isDark);
        s +=
          closeK < 0.5
            ? drawBookStack(126, 198, false)
            : `<rect x="102" y="190" width="48" height="8" rx="2" fill="${PAL.ochre}" stroke="${PAL.ink}" stroke-width="1.6"/>`;
        s += drawBookStack(356, 198, false);
        s += drawDeskLaptop(240, 198, PAL.ochre, 1);
        return s;
      }

      const sub = lt - 2.15;
      const mv = ease(seg(sub, 0.1, 0.95));
      const cx = lerp(285, 118, mv);
      const cy = lerp(155, 64, mv);
      const clk = seg(sub, 0.98, 1.45);
      const opened = sub > 1.08;
      let scr = `<text x="184" y="64" font-size="11" font-weight="800" fill="${txtMain}">${opened ? "Selamat Datang di Ruang Belajar!" : "Pilih Menu Pembelajaran"}</text>`;
      if (opened) {
        const p = backOut(seg(sub, 1.08, 1.5));
        scr += `<g transform="translate(300, 136) scale(${f1(p)})"><rect x="-112" y="-50" width="224" height="100" rx="10" fill="${PAL.ochre}" fill-opacity="0.16" stroke="${PAL.ochre}" stroke-width="1.8"/><text x="0" y="-11" text-anchor="middle" font-size="12" font-weight="800" fill="${PAL.ochre}">RUANG BELAJAR TERBUKA</text><text x="0" y="13" text-anchor="middle" font-size="9.5" font-weight="600" fill="${txtMain}">Kelas · E-Book · Kurikulum</text></g>`;
      }
      return (
        drawLaptopScreenStage(opened ? "belajar" : "", scr, t, isDark, uid) +
        drawCursor(cx, cy, clk)
      );
    }

    // SCENE 3: Laptop displays Kelas, Ebook, Materi -> Scrolls -> Opens one class -> Reads material
    if (scIdx === 2) {
      const scrollY = kf(lt, [
        [0, 0],
        [0.4, 0],
        [1.3, -34],
        [3.8, -34],
      ]);
      const openCls = lt > 2.05;
      let scr = "";
      if (!openCls) {
        scr += `<g transform="translate(0, ${f1(scrollY)})">`;
        scr += `<text x="182" y="60" font-size="10.5" font-weight="800" fill="${PAL.ochre}">KATALOG KELAS, E-BOOK &amp; MATERI</text>`;
        const cards = [
          { x: 182, y: 72, tag: "KELAS VIDEO", title: "Fundamental Kreator", c: PAL.clay },
          { x: 304, y: 72, tag: "E-BOOK", title: "Panduan Faceless", c: PAL.teal },
          { x: 182, y: 142, tag: "MATERI INTI", title: "Strategi Konten #1", c: PAL.sap },
          { x: 304, y: 142, tag: "MODUL PRAKTIK", title: "Riset &amp; Eksekusi", c: PAL.violet },
        ];
        cards.forEach((c, idx) => {
          const hi = idx === 2 && lt > 1.55;
          scr +=
            `<rect x="${c.x}" y="${c.y}" width="112" height="58" rx="8" fill="${cardBg}" stroke="${hi ? PAL.ochre : "#94A3B8"}" stroke-width="${hi ? 2.4 : 1.4}"/>` +
            `<rect x="${c.x + 8}" y="${c.y + 8}" width="58" height="13" rx="4" fill="${c.c}" fill-opacity="0.22"/>` +
            `<text x="${c.x + 12}" y="${c.y + 15}" dominant-baseline="central" font-size="7.5" font-weight="800" fill="${c.c}">${c.tag}</text>` +
            `<text x="${c.x + 8}" y="${c.y + 38}" font-size="9" font-weight="700" fill="${txtMain}">${c.title}</text>`;
        });
        scr += `</g>`;
      } else {
        const p = backOut(seg(lt, 2.05, 2.45));
        const readLine = Math.min(3, Math.floor((lt - 2.2) * 2.2));
        scr +=
          `<g transform="translate(300, 134) scale(${f1(p)})">` +
          `<rect x="-118" y="-80" width="236" height="160" rx="9" fill="${cardBg}" stroke="${PAL.sap}" stroke-width="2"/>` +
          `<rect x="-106" y="-68" width="90" height="16" rx="4" fill="${PAL.sap}" fill-opacity="0.2"/><text x="-61" y="-59" text-anchor="middle" dominant-baseline="central" font-size="8.5" font-weight="800" fill="${PAL.sap}">MODUL 1 AKTIF</text>`;
        for (let i = 0; i < 4; i++) {
          const ly = -34 + i * 24;
          const activeL = i === readLine;
          if (activeL) {
            scr += `<rect x="-108" y="${ly - 7}" width="216" height="16" rx="4" fill="${PAL.ochre}" fill-opacity="0.22"/>`;
          }
          scr += `<line x1="-102" y1="${ly}" x2="${88 - (i % 2) * 28}" y2="${ly}" stroke="${activeL ? PAL.ochre : "#94A3B8"}" stroke-width="5" stroke-linecap="round"/>`;
        }
        scr += `</g>`;
      }
      const curX = kf(lt, [
        [0, 320],
        [1.2, 320],
        [1.75, 236],
        [2.4, 380],
      ]);
      const curY = kf(lt, [
        [0, 110],
        [1.2, 135],
        [1.75, 138],
        [2.4, 185],
      ]);
      return (
        drawLaptopScreenStage("belajar", scr, t, isDark, uid, {
          lean: openCls ? Math.sin(t * 5) * 0.25 : 0,
        }) + drawCursor(curX, curY, seg(lt, 1.78, 2.15))
      );
    }

    // SCENE 4: Structured learning — Read material -> Write notes -> Practice on laptop
    if (scIdx === 3) {
      const phase = lt < 1.3 ? 0 : lt < 2.6 ? 1 : 2;
      const kWrite =
        ease(seg(lt, 1.15, 1.45)) * (1 - ease(seg(lt, 2.45, 2.75)));
      const kType = ease(seg(lt, 2.5, 2.85));
      let s = drawChair(210, 256, 0, isDark);

      const writeWig = Math.sin(t * 18) * 4;
      const typeWig = Math.sin(t * 22) * 3.5;
      const hR =
        phase === 1
          ? [7.8 * 8.2 + writeWig, -1.5 * 8.2, 0.5]
          : [3.2 * 8.2, -1.6 * 8.2 + (phase === 2 ? typeWig : 0), 0.4];
      const hL =
        phase === 2
          ? [-3.2 * 8.2, -1.6 * 8.2 - typeWig, -0.4]
          : [-4.5 * 8.2, -2.0 * 8.2, -0.4];
      const pen =
        phase === 1
          ? `<line x1="-2" y1="2" x2="9" y2="-11" stroke="${PAL.ochre}" stroke-width="3" stroke-linecap="round"/>`
          : "";

      s += drawClawd(
        210,
        206,
        8.2,
        {
          id: uid,
          lean: kWrite * 0.55 - kType * 0.1,
          lookX: kWrite * 0.75,
          lookY: 0.35,
          eyes: "normal",
          brows: "focus",
          mouth: "smile",
          handL: hL,
          handR: hR,
          propR: pen,
        },
        t
      );

      const badges = ["1. Baca Materi", "2. Catat Poin", "3. Praktik"];
      badges.forEach((b, idx) => {
        const done = phase >= idx;
        s +=
          `<g transform="translate(${88 + idx * 116}, 46)">` +
          `<rect x="-52" y="-13" width="104" height="26" rx="8" fill="${done ? PAL.sap : cardBg}" fill-opacity="${done ? 0.2 : 0.9}" stroke="${done ? PAL.sap : "#94A3B8"}" stroke-width="1.8"/>` +
          `<text x="0" y="1" text-anchor="middle" dominant-baseline="central" font-size="9.5" font-weight="800" fill="${done ? PAL.sap : txtMain}">${b}</text>` +
          `</g>`;
      });

      s += drawDeskBase(198, isDark);
      s += drawBookStack(94, 198, true);
      s += drawDeskLaptop(210, 198, PAL.sap, 1);
      s += `<polygon points="274,198 336,198 328,186 282,186" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1.7"/>`;
      return s;
    }

    // SCENE 5: Closes notebook satisfied, desk neat, excited for next lesson
    const closeNb = ease(seg(lt, 0.2, 0.75));
    const excited = lt > 0.95;
    const bounce = excited ? Math.abs(Math.sin((lt - 0.95) * 5.2)) : 0;
    let s = drawChair(240, 256, 0, isDark);

    s += drawClawd(
      240,
      206,
      8.4,
      {
        id: uid,
        dy: -bounce * 1.15,
        sq: excited ? lerp(0.07, -0.06, bounce) : 0,
        lean: excited ? Math.sin(t * 5.2) * 0.22 : (1 - closeNb) * 0.45,
        eyes: excited ? "happy" : "normal",
        mouth: excited ? "grin" : "smile",
        blush: excited ? 0.7 : 0.2,
        handL: [-4.2 * 8.4, (-2.2 - bounce * 2.2) * 8.4, -0.5],
        handR: excited
          ? [4.2 * 8.4, (-2.2 - bounce * 2.2) * 8.4, 0.5]
          : lerpArr(
              [7.5 * 8.4, -1.6 * 8.4, 0.5],
              [4.2 * 8.4, -2.0 * 8.4, 0.4],
              closeNb
            ),
      },
      t
    );

    s += drawDeskBase(198, isDark);
    s += drawBookStack(96, 198, true);
    s +=
      closeNb < 0.5
        ? `<polygon points="310,198 368,198 360,186 318,186" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1.7"/>`
        : `<rect x="316" y="190" width="48" height="8" rx="2.5" fill="${PAL.sap}" stroke="${PAL.ink}" stroke-width="1.7"/>`;
    s += drawDeskLaptop(240, 198, PAL.ochre, 1);

    if (excited) {
      const sp = backOut(seg(lt, 1.0, 1.45));
      s +=
        `<g transform="translate(240, 62) scale(${f1(sp)})">` +
        `<rect x="-82" y="-15" width="164" height="30" rx="15" fill="${cardBg}" stroke="${PAL.sap}" stroke-width="2"/>` +
        `<text x="0" y="1" text-anchor="middle" dominant-baseline="central" font-size="10.5" font-weight="800" fill="${PAL.sap}">Siap Materi Berikutnya!</text>` +
        `</g>`;
    }
    return s;
  }

  // --------------------------------------------------------------------------
  // 2. RUANG NGONTEN (6 SCENES)
  // --------------------------------------------------------------------------
  if (pillar === "ngonten") {
    // SCENE 1: Holds smartphone browsing social posts -> returns to blank page on laptop
    if (scIdx === 0) {
      const toLaptop = ease(seg(lt, 1.85, 2.35));
      let s = drawChair(220, 256, 0, isDark);

      const phoneProp =
        `<g>` +
        `<rect x="-9" y="-22" width="18" height="30" rx="4" fill="#1E293B" stroke="${PAL.ink}" stroke-width="1.7"/>` +
        `<rect x="-6" y="-17" width="12" height="20" rx="2" fill="${PAL.sky}" fill-opacity="0.85"/>` +
        `<rect x="-4" y="${f1(-14 + ((t * 14) % 12))}" width="8" height="5" rx="1" fill="${PAL.rose}"/>` +
        `</g>`;

      s += drawClawd(
        220,
        206,
        8.2,
        {
          id: uid,
          lean: lerp(-0.45, 0.25, toLaptop),
          lookX: lerp(-0.65, 0.35, toLaptop),
          lookY: lerp(-0.1, 0.25, toLaptop),
          eyes: "normal",
          brows: toLaptop > 0.6 ? "worried" : null,
          mouth: toLaptop > 0.6 ? "sigh" : "flat",
          handL: lerpArr(
            [-6.2 * 8.2, -5.2 * 8.2, -0.5],
            [-5.2 * 8.2, -2.0 * 8.2, -0.4],
            toLaptop
          ),
          propL: phoneProp,
          handR: [3.8 * 8.2, -2.0 * 8.2, 0.4],
        },
        t
      );

      s +=
        `<g transform="translate(366, 98)">` +
        `<rect x="-72" y="-52" width="144" height="104" rx="10" fill="${cardBg}" stroke="${PAL.ink}" stroke-width="2"/>`;
      if (toLaptop < 0.5) {
        const sy = (t * 28) % 36;
        s +=
          `<text x="0" y="-34" text-anchor="middle" font-size="9" font-weight="800" fill="${PAL.violet}">FEED MEDSOS</text>` +
          `<rect x="-50" y="${f1(-18 - sy * 0.3)}" width="100" height="24" rx="5" fill="${PAL.rose}" fill-opacity="0.25"/>` +
          `<rect x="-50" y="${f1(12 - sy * 0.3)}" width="100" height="24" rx="5" fill="${PAL.teal}" fill-opacity="0.25"/>`;
      } else {
        s +=
          `<text x="0" y="-32" text-anchor="middle" font-size="9" font-weight="800" fill="#94A3B8">DOKUMEN BARU</text>` +
          `<rect x="-52" y="-16" width="104" height="52" rx="6" fill="none" stroke="#94A3B8" stroke-width="1.4" stroke-dasharray="4 4"/>` +
          `<text x="0" y="12" text-anchor="middle" font-size="10" font-weight="700" fill="#94A3B8">(Halaman Kosong)</text>`;
      }
      s += `</g>`;

      s += drawDeskBase(198, isDark);
      s += drawDeskLaptop(220, 198, PAL.violet, 1);
      return s;
    }

    // SCENE 2: Taps desk thinking, empty calendar, types an idea -> deletes it -> types again -> still confused
    if (scIdx === 1) {
      const tapMode = lt < 1.25 || lt > 3.1;
      const tapLift = tapMode ? Math.abs(Math.sin(t * 10)) * 5 : 0;
      const barW = kf(lt, [
        [0, 0],
        [1.25, 0],
        [2.0, 88],
        [2.5, 0],
        [3.0, 38],
        [3.4, 18],
      ]);
      let s = drawChair(182, 256, 0, isDark);

      s += drawClawd(
        182,
        206,
        8.2,
        {
          id: uid,
          lean: tapMode ? -0.25 : 0.25,
          lookX: 0.45,
          lookY: -0.1,
          eyes: "normal",
          brows: lt > 2.9 ? "question" : "worried",
          mouth: lt > 2.9 ? "wobble" : "flat",
          handL: [-4.2 * 8.2, -1.8 * 8.2, -0.4],
          handR: tapMode
            ? [6.4 * 8.2, -1.2 * 8.2 - tapLift, 0.5]
            : [3.6 * 8.2, -1.8 * 8.2 + Math.sin(t * 24) * 3, 0.4],
        },
        t
      );

      s +=
        `<g transform="translate(348, 102)">` +
        `<rect x="-92" y="-66" width="184" height="132" rx="10" fill="${cardBg}" stroke="${PAL.ink}" stroke-width="2"/>` +
        `<text x="-76" y="-44" font-size="9.5" font-weight="800" fill="${PAL.red}">KALENDER KONTEN (KOSONG)</text>`;
      for (let c = 0; c < 4; c++) {
        s += `<rect x="${-76 + c * 39}" y="-32" width="32" height="28" rx="4" fill="none" stroke="#94A3B8" stroke-width="1.4" stroke-dasharray="3 3"/>`;
      }
      s += `<rect x="-76" y="10" width="152" height="40" rx="6" fill="${isDark ? "#0F172A" : "#F8FAFC"}" stroke="#94A3B8" stroke-width="1.4"/>`;
      if (barW > 2) {
        s += `<rect x="-66" y="25" width="${f1(barW)}" height="8" rx="4" fill="${PAL.violet}"/>`;
      }
      if (Math.floor(t * 4) % 2 === 0) {
        s += `<line x1="${f1(-64 + barW)}" y1="21" x2="${f1(-64 + barW)}" y2="37" stroke="${txtMain}" stroke-width="2"/>`;
      }
      s += `</g>`;

      s += drawDeskBase(198, isDark);
      if (tapMode && tapLift < 1.5) {
        s += `<path d="M 228 194 Q 235 188 242 194" fill="none" stroke="${PAL.ochre}" stroke-width="1.8" stroke-linecap="round"/>`;
      }
      s += drawDeskLaptop(182, 198, PAL.violet, 1);
      return s;
    }

    // SCENE 3: Opens Ruang Ngonten menu -> 6 AI Tools appear
    if (scIdx === 2) {
      const mv = ease(seg(lt, 0.05, 0.75));
      const opened = lt > 0.85;
      let scr = `<text x="182" y="59" font-size="10.5" font-weight="800" fill="${PAL.violet}">TOOLS AI RUANG NGONTEN</text>`;
      if (opened) {
        const tools: [string, string][] = [
          ["Bio Generator", PAL.teal],
          ["Idea Room", PAL.ochre],
          ["Script Builder", PAL.clay],
          ["ATM Content", PAL.rose],
          ["Carousel Builder", PAL.violet],
          ["Calendar Scheduler", PAL.sap],
        ];
        tools.forEach(([name, col], idx) => {
          const p = backOut(seg(lt, 0.88 + idx * 0.16, 1.25 + idx * 0.16));
          const gx = 182 + (idx % 2) * 120;
          const gy = 70 + Math.floor(idx / 2) * 48;
          scr +=
            `<g transform="translate(${gx + 54}, ${gy + 19}) scale(${f1(p)})">` +
            `<rect x="-54" y="-19" width="108" height="38" rx="8" fill="${cardBg}" stroke="${col}" stroke-width="1.8"/>` +
            `<circle cx="-39" cy="0" r="6" fill="${col}"/>` +
            `<text x="-27" y="1" dominant-baseline="central" font-size="8.5" font-weight="800" fill="${txtMain}">${name}</text>` +
            `</g>`;
        });
      }
      const cx =
        lt < 1.3
          ? lerp(290, 118, mv)
          : lerp(118, 355, ease(seg(lt, 1.5, 2.6)));
      const cy =
        lt < 1.3
          ? lerp(160, 92, mv)
          : lerp(92, 90, ease(seg(lt, 1.5, 2.6)));
      return (
        drawLaptopScreenStage("ngonten", scr, t, isDark, uid) +
        drawCursor(cx, cy, seg(lt, 0.75, 1.15))
      );
    }

    // SCENE 4: Idea Room -> Selects an idea -> Assembles script in Script Builder
    if (scIdx === 3) {
      const picked = lt > 1.35;
      let scr = "";
      scr += `<rect x="178" y="48" width="114" height="168" rx="8" fill="${cardBg}" stroke="${PAL.ochre}" stroke-width="1.8"/>`;
      scr += `<text x="235" y="64" text-anchor="middle" font-size="9" font-weight="800" fill="${PAL.ochre}">IDEA ROOM</text>`;
      ["Ide Konten #1", "Ide Viral #2", "Ide Edukasi #3"].forEach(
        (idTxt, i) => {
          const iy = 76 + i * 40;
          const sel = i === 1 && picked;
          scr += `<rect x="186" y="${iy}" width="98" height="30" rx="6" fill="${sel ? PAL.ochre : "transparent"}" fill-opacity="${sel ? 0.25 : 0}" stroke="${sel ? PAL.ochre : "#94A3B8"}" stroke-width="${sel ? 2 : 1.2}"/>`;
          scr += `<text x="235" y="${iy + 16}" text-anchor="middle" dominant-baseline="central" font-size="8.5" font-weight="700" fill="${txtMain}">${idTxt}</text>`;
        }
      );

      scr += `<rect x="304" y="48" width="118" height="168" rx="8" fill="${cardBg}" stroke="${PAL.clay}" stroke-width="1.8"/>`;
      scr += `<text x="363" y="64" text-anchor="middle" font-size="9" font-weight="800" fill="${PAL.clay}">SCRIPT BUILDER</text>`;
      if (picked) {
        const sections: [string, string, number][] = [
          ["HOOK", PAL.red, 1.5],
          ["ISI POIN", PAL.teal, 1.95],
          ["CTA AKHIR", PAL.sap, 2.4],
        ];
        sections.forEach(([lbl, col, t0], idx) => {
          const k = easeOut(seg(lt, t0, t0 + 0.5));
          if (k > 0.02) {
            const sy = 80 + idx * 42;
            scr += `<text x="314" y="${sy}" font-size="7.5" font-weight="800" fill="${col}">${lbl}</text>`;
            scr += `<rect x="314" y="${sy + 5}" width="${f1(96 * k)}" height="7" rx="3.5" fill="${col}" fill-opacity="0.75"/>`;
            scr += `<rect x="314" y="${sy + 16}" width="${f1(74 * k)}" height="6" rx="3" fill="#94A3B8" fill-opacity="0.55"/>`;
          }
        });
      }
      const curX = kf(lt, [
        [0, 235],
        [1.2, 235],
        [2.1, 360],
      ]);
      const curY = kf(lt, [
        [0, 155],
        [1.2, 130],
        [2.1, 135],
      ]);
      return (
        drawLaptopScreenStage("ngonten", scr, t, isDark, uid) +
        drawCursor(curX, curY, seg(lt, 1.25, 1.65))
      );
    }

    // SCENE 5: Script enters Carousel Builder (slides build) -> Calendar Scheduler fills schedule
    if (scIdx === 4) {
      const inSched = lt > 2.05;
      let scr = "";
      if (!inSched) {
        scr += `<text x="182" y="60" font-size="10" font-weight="800" fill="${PAL.violet}">CAROUSEL BUILDER — MENYUSUN SLIDE</text>`;
        for (let i = 0; i < 4; i++) {
          const p = backOut(seg(lt, 0.15 + i * 0.32, 0.55 + i * 0.32));
          const sx = 182 + i * 60;
          scr +=
            `<g transform="translate(${sx + 26}, 136) scale(${f1(p)})">` +
            `<rect x="-26" y="-52" width="52" height="92" rx="7" fill="${cardBg}" stroke="${PAL.violet}" stroke-width="1.9"/>` +
            `<rect x="-20" y="-44" width="40" height="36" rx="4" fill="${PAL.violet}" fill-opacity="0.22"/>` +
            `<text x="0" y="-24" text-anchor="middle" font-size="8.5" font-weight="800" fill="${PAL.violet}">Slide ${i + 1}</text>` +
            `<line x1="-18" y1="6" x2="18" y2="6" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>` +
            `<line x1="-18" y1="18" x2="10" y2="18" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>` +
            `</g>`;
        }
      } else {
        scr += `<text x="182" y="60" font-size="10" font-weight="800" fill="${PAL.sap}">CALENDAR SCHEDULER — JADWAL TERISI</text>`;
        const cols = [
          PAL.clay,
          PAL.teal,
          PAL.violet,
          PAL.ochre,
          PAL.sap,
          PAL.rose,
          PAL.teal,
          PAL.sap,
        ];
        for (let i = 0; i < 8; i++) {
          const gx = 184 + (i % 4) * 60;
          const gy = 74 + Math.floor(i / 4) * 64;
          const fillK = backOut(seg(lt, 2.15 + i * 0.14, 2.48 + i * 0.14));
          scr += `<rect x="${gx}" y="${gy}" width="50" height="52" rx="7" fill="${cardBg}" stroke="#94A3B8" stroke-width="1.4"/>`;
          if (fillK > 0.05) {
            scr +=
              `<g transform="translate(${gx + 25}, ${gy + 26}) scale(${f1(fillK)})">` +
              `<rect x="-20" y="-20" width="40" height="40" rx="5" fill="${cols[i]}" fill-opacity="0.24" stroke="${cols[i]}" stroke-width="1.7"/>` +
              `<path d="M -6 1 L -1 6 L 8 -5" fill="none" stroke="${cols[i]}" stroke-width="2.4" stroke-linecap="round"/>` +
              `</g>`;
          }
        }
      }
      const curX = kf(lt, [
        [0, 240],
        [1.8, 390],
        [2.4, 270],
        [3.5, 368],
      ]);
      const curY = kf(lt, [
        [0, 140],
        [1.8, 140],
        [2.4, 105],
        [3.5, 168],
      ]);
      return (
        drawLaptopScreenStage("ngonten", scr, t, isDark, uid) +
        drawCursor(curX, curY, seg(lt, 1.85, 2.2))
      );
    }

    // SCENE 6: Reclines relaxed viewing filled calendar, smiles & raises thumbs-up
    const rec = ease(seg(lt, 0.15, 0.85)) * 0.85;
    const thumbK = seg(lt, 0.9, 1.45);
    let s = drawChair(176, 256, rec, isDark);

    s += drawClawd(
      176,
      206,
      8.4,
      {
        id: uid,
        recline: rec,
        lean: -0.15 + Math.sin(t * 2.6) * 0.1,
        lookX: 0.35,
        eyes: "happy",
        mouth: "grin",
        blush: 0.7,
        handL: [-5.2 * 8.4, -2.2 * 8.4, -0.5],
        handR: lerpArr(
          [4.8 * 8.4, -2.0 * 8.4, 0.5],
          [7.2 * 8.4, -5.8 * 8.4, 0.7],
          ease(thumbK)
        ),
        propR: thumbK > 0.05 ? thumbsUpProp(thumbK) : "",
      },
      t
    );

    s +=
      `<g transform="translate(352, 100)">` +
      `<rect x="-90" y="-64" width="180" height="128" rx="10" fill="${cardBg}" stroke="${PAL.sap}" stroke-width="2.1"/>` +
      `<rect x="-90" y="-64" width="180" height="24" rx="10" fill="${PAL.sap}"/>` +
      `<text x="0" y="-51" text-anchor="middle" dominant-baseline="central" font-size="9.5" font-weight="800" fill="#FFF">KALENDER PENUH TERJADWAL</text>`;
    const cPal = [
      PAL.clay,
      PAL.teal,
      PAL.violet,
      PAL.ochre,
      PAL.sap,
      PAL.rose,
      PAL.teal,
      PAL.ochre,
    ];
    for (let i = 0; i < 8; i++) {
      const gx = -74 + (i % 4) * 38;
      const gy = -28 + Math.floor(i / 4) * 40;
      s +=
        `<rect x="${gx}" y="${gy}" width="31" height="31" rx="5" fill="${cPal[i]}" fill-opacity="0.28" stroke="${cPal[i]}" stroke-width="1.6"/>` +
        `<path d="M ${gx + 9} ${gy + 16} L ${gx + 14} ${gy + 21} L ${gx + 23} ${gy + 10}" fill="none" stroke="${cPal[i]}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    s += `</g>`;

    s += drawDeskBase(198, isDark);
    s += drawDeskLaptop(176, 198, PAL.sap, 1);
    return s;
  }

  // --------------------------------------------------------------------------
  // 3. RUANG AUTOMATION (6 SCENES)
  // --------------------------------------------------------------------------
  if (pillar === "automation") {
    const drawClock = (cx: number, cy: number, speed = 1) => {
      const angM = lt * speed * 4.5;
      const angH = lt * speed * 0.6 - 1.2;
      return (
        `<g transform="translate(${cx}, ${cy})">` +
        `<circle cx="0" cy="0" r="21" fill="${cardBg}" stroke="${PAL.ink}" stroke-width="2"/>` +
        `<line x1="0" y1="0" x2="${f1(Math.cos(angM) * 14)}" y2="${f1(Math.sin(angM) * 14)}" stroke="${PAL.red}" stroke-width="2" stroke-linecap="round"/>` +
        `<line x1="0" y1="0" x2="${f1(Math.cos(angH) * 9.5)}" y2="${f1(Math.sin(angH) * 9.5)}" stroke="${PAL.ink}" stroke-width="2.4" stroke-linecap="round"/>` +
        `<circle cx="0" cy="0" r="2.4" fill="${PAL.ink}"/>` +
        `</g>`
      );
    };

    // SCENE 1: Frantically switching between phone, laptop, and order pad faster & faster
    if (scIdx === 0) {
      const freq = 3.2 + lt * 2.2;
      const sw = Math.sin(lt * freq);
      let s = drawClock(406, 62, 1.5);
      s += drawChair(240, 256, 0, isDark);

      s += drawClawd(
        240,
        206,
        8.2,
        {
          id: uid,
          lean: sw * 0.85,
          dy: -Math.abs(sw) * 0.35,
          lookX: sw * 0.9,
          lookY: 0.35,
          eyes: "wide",
          brows: "worried",
          mouth: "wobble",
          handL: [
            (-5.5 + sw * 2.8) * 8.2,
            (-1.8 - Math.abs(Math.cos(lt * freq * 2))) * 8.2,
            -0.5,
          ],
          handR: [
            (5.5 + sw * 2.8) * 8.2,
            (-1.8 - Math.abs(Math.sin(lt * freq * 2))) * 8.2,
            0.5,
          ],
        },
        t
      );

      const tasks = [
        { x: 108, y: 98, txt: "Balas Pesan!", c: PAL.red },
        { x: 240, y: 54, txt: "Update Data!", c: PAL.teal },
        { x: 354, y: 114, txt: "Catat Order!", c: PAL.ochre },
      ];
      tasks.forEach((tk, i) => {
        const sc = 0.92 + Math.abs(Math.sin(lt * freq + i)) * 0.14;
        s +=
          `<g transform="translate(${tk.x}, ${tk.y}) scale(${f1(sc)})">` +
          `<rect x="-42" y="-13" width="84" height="26" rx="8" fill="${cardBg}" stroke="${tk.c}" stroke-width="1.9"/>` +
          `<text x="0" y="1" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="800" fill="${tk.c}">${tk.txt}</text>` +
          `</g>`;
      });

      s += drawDeskBase(198, isDark);
      s += `<rect x="116" y="188" width="22" height="10" rx="3" fill="#1E293B" stroke="${PAL.ink}" stroke-width="1.6"/>`;
      s += drawDeskLaptop(240, 198, PAL.teal, 1);
      s += `<polygon points="328,198 378,198 372,186 334,186" fill="#FEF08A" stroke="${PAL.ink}" stroke-width="1.6"/>`;
      return s;
    }

    // SCENE 2: Looks at work pile -> Sighs -> Looks at wall clock -> Resumes repetitive work
    if (scIdx === 1) {
      const sighSq = kf(lt, [
        [0, 0],
        [0.9, -0.1],
        [1.55, 0.14],
        [2.3, 0.08],
        [3.0, 0.04],
      ]);
      const lookX = kf(lt, [
        [0, -0.8],
        [0.9, -0.8],
        [1.4, 0],
        [2.1, 0.85],
        [2.75, 0.85],
        [3.1, 0],
      ]);
      const lookY = kf(lt, [
        [0, 0.3],
        [1.4, 0.2],
        [2.1, -0.75],
        [2.75, -0.75],
        [3.1, 0.35],
      ]);
      const resumeType = lt > 2.95;
      let s = drawClock(396, 62, 3.2);
      s += drawChair(240, 256, 0, isDark);

      s += drawClawd(
        240,
        206,
        8.2,
        {
          id: uid,
          sq: sighSq,
          lean: lookX * 0.45,
          lookX,
          lookY,
          eyes: lt > 1.2 && lt < 1.9 ? "closed" : "tired",
          brows: "worried",
          mouth: "sigh",
          handL: [
            -3.8 * 8.2,
            (-1.8 + (resumeType ? Math.sin(t * 16) * 0.25 : 0)) * 8.2,
            -0.4,
          ],
          handR: [
            3.8 * 8.2,
            (-1.8 - (resumeType ? Math.sin(t * 16) * 0.25 : 0)) * 8.2,
            0.4,
          ],
        },
        t
      );

      if (lt > 1.35 && lt < 2.05) {
        const pk = seg(lt, 1.35, 2.05);
        s += `<ellipse cx="${f1(240 + pk * 22)}" cy="${f1(158 + pk * 8)}" rx="${f1(8 + pk * 6)}" ry="4" fill="#CBD5E1" opacity="${f1(1 - pk)}"/>`;
      }

      s += drawDeskBase(198, isDark);
      for (let i = 0; i < 6; i++) {
        s += `<rect x="${84 + (i % 2) * 4}" y="${190 - i * 8}" width="54" height="8" rx="2" fill="${i % 2 ? PAL.cream : "#E2E8F0"}" stroke="${PAL.ink}" stroke-width="1.5"/>`;
      }
      s += drawDeskLaptop(240, 198, PAL.teal, 1);
      return s;
    }

    // SCENE 3: Clicks Ruang Automation menu -> Automation systems & tools appear
    if (scIdx === 2) {
      const mv = ease(seg(lt, 0.1, 0.85));
      const opened = lt > 0.95;
      let scr = `<text x="182" y="59" font-size="10.2" font-weight="800" fill="${PAL.teal}">SISTEM &amp; TOOLS RUANG AUTOMATION</text>`;
      if (opened) {
        const mods: [string, string][] = [
          ["Auto-Reply Pesan", PAL.teal],
          ["Pencatat Order", PAL.ochre],
          ["Sinkronisasi Data", PAL.sap],
          ["Workflow 24/7", PAL.violet],
        ];
        mods.forEach(([lbl, col], idx) => {
          const p = backOut(seg(lt, 1.0 + idx * 0.2, 1.4 + idx * 0.2));
          const gx = 184 + (idx % 2) * 118;
          const gy = 76 + Math.floor(idx / 2) * 62;
          scr +=
            `<g transform="translate(${gx + 52}, ${gy + 24}) scale(${f1(p)})">` +
            `<rect x="-52" y="-24" width="104" height="48" rx="8" fill="${cardBg}" stroke="${col}" stroke-width="1.9"/>` +
            `<circle cx="-36" cy="0" r="7" fill="${col}" fill-opacity="0.25"/><circle cx="-36" cy="0" r="3.5" fill="${col}"/>` +
            `<text x="-22" y="1" dominant-baseline="central" font-size="8.5" font-weight="800" fill="${txtMain}">${lbl}</text>` +
            `</g>`;
        });
      }
      return (
        drawLaptopScreenStage("automation", scr, t, isDark, uid) +
        drawCursor(lerp(295, 118, mv), lerp(165, 120, mv), seg(lt, 0.85, 1.25))
      );
    }

    // SCENE 4: Connects workflow process boxes with lines & arrows, then clicks AKTIFKAN
    if (scIdx === 3) {
      const line1 = ease(seg(lt, 0.35, 1.05));
      const line2 = ease(seg(lt, 1.25, 1.95));
      const activeOn = lt > 2.65;
      let scr = `<text x="182" y="59" font-size="10" font-weight="800" fill="${PAL.teal}">SUSUN ALUR OTOMATISASI</text>`;

      if (line1 > 0.02) {
        const x2 = lerp(240, 272, line1);
        scr += `<line x1="240" y1="114" x2="${f1(x2)}" y2="114" stroke="${PAL.teal}" stroke-width="3" stroke-linecap="round"/>`;
        if (line1 > 0.9) {
          scr += `<polygon points="274,114 267,109 267,119" fill="${PAL.teal}"/>`;
        }
      }
      if (line2 > 0.02) {
        const x2 = lerp(336, 366, line2);
        scr += `<line x1="336" y1="114" x2="${f1(x2)}" y2="114" stroke="${PAL.teal}" stroke-width="3" stroke-linecap="round"/>`;
        if (line2 > 0.9) {
          scr += `<polygon points="368,114 361,109 361,119" fill="${PAL.teal}"/>`;
        }
      }

      const nodes = [
        { x: 180, lbl: "Pesan", c: PAL.ochre },
        { x: 274, lbl: "Proses", c: PAL.teal },
        { x: 368, lbl: "Update", c: PAL.sap },
      ];
      nodes.forEach((n) => {
        scr +=
          `<rect x="${n.x}" y="92" width="58" height="44" rx="8" fill="${cardBg}" stroke="${activeOn ? PAL.sap : n.c}" stroke-width="2"/>` +
          `<text x="${n.x + 29}" y="115" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="800" fill="${txtMain}">${n.lbl}</text>`;
      });

      scr += `<rect x="252" y="168" width="104" height="32" rx="16" fill="${activeOn ? PAL.sap : PAL.teal}" stroke="${PAL.ink}" stroke-width="1.8"/>`;
      scr += `<text x="304" y="185" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="800" fill="#FFF">${activeOn ? "AKTIF ✓" : "AKTIFKAN"}</text>`;

      const curX = kf(lt, [
        [0, 238],
        [1.05, 274],
        [1.95, 368],
        [2.55, 304],
        [3.8, 304],
      ]);
      const curY = kf(lt, [
        [0, 114],
        [1.95, 114],
        [2.55, 184],
        [3.8, 184],
      ]);
      return (
        drawLaptopScreenStage("automation", scr, t, isDark, uid) +
        drawCursor(curX, curY, seg(lt, 2.58, 2.98))
      );
    }

    // SCENE 5: Automated processing running hands-free
    if (scIdx === 4) {
      let scr = `<text x="182" y="59" font-size="10" font-weight="800" fill="${PAL.sap}">SISTEM BERJALAN OTOMATIS</text>`;
      const streams = [
        { y: 80, inLbl: "Notifikasi Pesan", outLbl: "Terbalas Otomatis ✓", c: PAL.teal },
        { y: 126, inLbl: "Pesanan Baru", outLbl: "Data Diperbarui ✓", c: PAL.ochre },
        { y: 172, inLbl: "Tugas Harian", outLbl: "Selesai Diproses ✓", c: PAL.sap },
      ];
      streams.forEach((st, i) => {
        const ph = (lt * 0.72 + i * 0.33) % 1;
        scr += `<rect x="180" y="${st.y}" width="242" height="34" rx="8" fill="${cardBg}" stroke="${st.c}" stroke-width="1.6"/>`;
        scr += `<text x="192" y="${st.y + 18}" dominant-baseline="central" font-size="8.5" font-weight="700" fill="${txtMain}">${ph < 0.45 ? st.inLbl : st.outLbl}</text>`;
        const px = lerp(335, 404, ph);
        scr += `<circle cx="${f1(px)}" cy="${st.y + 17}" r="7" fill="${ph > 0.45 ? PAL.sap : st.c}"/>`;
        if (ph > 0.45) {
          scr += `<path d="M ${f1(px - 3)} ${st.y + 17} L ${f1(px)} ${st.y + 20} L ${f1(px + 4)} ${st.y + 14}" fill="none" stroke="#FFF" stroke-width="1.8"/>`;
        }
      });
      return drawLaptopScreenStage("automation", scr, t, isDark, uid, {
        handR: [4.2 * 6.4, -3.5 * 6.4, 0.4],
      });
    }

    // SCENE 6: Reclines sipping steaming coffee, then focuses calmly on more important work
    const focusPhase = ease(seg(lt, 2.15, 2.7));
    const rec = (1 - focusPhase) * 0.78;
    const sipK = (1 - focusPhase) * ease((Math.sin(lt * 3.2 - 0.5) + 1) / 2);
    let s = drawClock(402, 62, 0.5);
    s += drawChair(232, 256, rec, isDark);

    const mugSvg =
      `<g>` +
      `<rect x="-8" y="-12" width="16" height="18" rx="3.5" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1.7"/>` +
      `<path d="M 8 -8 Q 13 -8 13 -3 Q 13 2 8 2" fill="none" stroke="${PAL.ink}" stroke-width="1.6"/>` +
      `<path d="M 0 -15 Q ${f1(3 + Math.sin(t * 5) * 2)} -22 0 -27" fill="none" stroke="${PAL.ochre}" stroke-width="1.6" stroke-linecap="round"/>` +
      `</g>`;

    const handCup = lerpArr(
      lerpArr(
        [5.8 * 8.3, -2.2 * 8.3, 0.5],
        [1.8 * 8.3, -4.1 * 8.3, 0.9],
        sipK
      ),
      [3.6 * 8.3, -1.8 * 8.3, 0.4],
      focusPhase
    );

    s += drawClawd(
      232,
      206,
      8.3,
      {
        id: uid,
        recline: rec,
        lean: focusPhase * 0.2,
        lookY: focusPhase * 0.25,
        eyes: focusPhase > 0.5 ? "normal" : "happy",
        brows: focusPhase > 0.5 ? "confident" : null,
        mouth: "smile",
        blush: 0.45,
        handL: [-3.8 * 8.3, -1.9 * 8.3, -0.4],
        handR: handCup,
        propR: focusPhase < 0.7 ? mugSvg : "",
      },
      t
    );

    s += drawDeskBase(198, isDark);
    if (focusPhase >= 0.7) {
      s += `<g transform="translate(342, 192)">${mugSvg}</g>`;
    }
    s += drawDeskLaptop(232, 198, PAL.sap, 1);
    return s;
  }

  // --------------------------------------------------------------------------
  // 4. RUANG RISET (6 SCENES)
  // --------------------------------------------------------------------------
  // SCENE 1: Opens social media on laptop, trending viral posts cycle smoothly
  if (scIdx === 0) {
    const vCols = [PAL.red, PAL.ochre, PAL.violet];
    const vTitles = [
      "Konten Viral #1 (2.4M)",
      "Topik Ramai #2 (980K)",
      "Challenge Tren #3 (1.5M)",
    ];
    const feedOffset = kf(lt, [
      [0, 0],
      [0.85, 0],
      [1.25, -138],
      [2.15, -138],
      [2.55, -276],
      [3.8, -276],
    ]);
    const feedClip = `${uid}-viral`;
    let scr = `<text x="182" y="59" font-size="10" font-weight="800" fill="${PAL.red}">BERANDA TREN MEDIA SOSIAL</text>`;
    scr += `<clipPath id="${feedClip}"><rect x="182" y="66" width="236" height="148" rx="8"/></clipPath>`;
    scr += `<g clip-path="url(#${feedClip})"><g transform="translate(0, ${f1(feedOffset)})">`;
    for (let i = 0; i < 3; i++) {
      const cy = 72 + i * 138;
      scr +=
        `<rect x="186" y="${cy}" width="228" height="126" rx="10" fill="${cardBg}" stroke="${vCols[i]}" stroke-width="2.2"/>` +
        `<rect x="198" y="${cy + 12}" width="204" height="62" rx="6" fill="${vCols[i]}" fill-opacity="0.22"/>` +
        `<text x="300" y="${cy + 47}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${vCols[i]}">${vTitles[i]}</text>` +
        `<line x1="198" y1="${cy + 90}" x2="350" y2="${cy + 90}" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>` +
        `<line x1="198" y1="${cy + 106}" x2="290" y2="${cy + 106}" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>`;
    }
    scr += `</g></g>`;
    return drawLaptopScreenStage("", scr, t, isDark, uid, {
      lean: Math.sin(lt * 5) * 0.25,
    });
  }

  // SCENE 2: Tries copying a trend -> Stops -> Questions whether it truly fits audience
  if (scIdx === 1) {
    const stopK = ease(seg(lt, 1.15, 1.65));
    const typeOsc = lt < 1.15 ? Math.sin(t * 22) * 3.5 : 0;
    let s = drawChair(182, 256, 0, isDark);

    s += drawClawd(
      182,
      206,
      8.2,
      {
        id: uid,
        lean: lerp(0.25, -0.25, stopK),
        lookX: 0.45,
        lookY: lerp(0.2, -0.25, stopK),
        eyes: "normal",
        brows: stopK > 0.5 ? "question" : "focus",
        mouth: stopK > 0.5 ? "wobble" : "flat",
        handL: [-3.8 * 8.2, -1.8 * 8.2 - typeOsc, -0.4],
        handR: lerpArr(
          [3.8 * 8.2, -1.8 * 8.2 + typeOsc, 0.4],
          [1.8 * 8.2, -3.8 * 8.2, 0.9],
          stopK
        ),
      },
      t
    );

    s +=
      `<g transform="translate(348, 102)">` +
      `<rect x="-92" y="-64" width="184" height="128" rx="10" fill="${cardBg}" stroke="${PAL.ink}" stroke-width="2"/>` +
      `<text x="-76" y="-42" font-size="9.5" font-weight="800" fill="${txtMain}">PILIHAN IDE TREN:</text>` +
      `<rect x="-76" y="-28" width="152" height="24" rx="5" fill="${PAL.red}" fill-opacity="0.14" stroke="${PAL.red}" stroke-width="1.3"/><text x="-66" y="-15" dominant-baseline="central" font-size="8.5" font-weight="700" fill="${txtMain}">Tiru Tren A? (Belum tentu)</text>` +
      `<rect x="-76" y="4" width="152" height="24" rx="5" fill="${PAL.ochre}" fill-opacity="0.14" stroke="${PAL.ochre}" stroke-width="1.3"/><text x="-66" y="17" dominant-baseline="central" font-size="8.5" font-weight="700" fill="${txtMain}">Ikut Tren B? (Relevan?)</text>`;
    if (stopK > 0.4) {
      s += `<text x="0" y="47" text-anchor="middle" font-size="9.5" font-weight="800" fill="${PAL.ochre}">Cocok untuk audiensku?</text>`;
    }
    s += `</g>`;

    s += drawDeskBase(198, isDark);
    s += drawDeskLaptop(182, 198, PAL.sky, 1);
    return s;
  }

  // SCENE 3: Opens Ruang Riset menu -> References, performance data, relevant trends & audience insights
  if (scIdx === 2) {
    const mv = ease(seg(lt, 0.1, 0.85));
    const opened = lt > 0.95;
    let scr = `<text x="182" y="59" font-size="10.5" font-weight="800" fill="${PAL.sky}">DASHBOARD RUANG RISET</text>`;
    if (opened) {
      const panels: [string, string][] = [
        ["Referensi Konten", PAL.sky],
        ["Data Performa", PAL.teal],
        ["Tren Relevan", PAL.ochre],
        ["Insight Audiens", PAL.sap],
      ];
      panels.forEach(([lbl, col], idx) => {
        const p = backOut(seg(lt, 1.0 + idx * 0.18, 1.4 + idx * 0.18));
        const gx = 184 + (idx % 2) * 118;
        const gy = 74 + Math.floor(idx / 2) * 64;
        scr +=
          `<g transform="translate(${gx + 52}, ${gy + 25}) scale(${f1(p)})">` +
          `<rect x="-52" y="-25" width="104" height="50" rx="8" fill="${cardBg}" stroke="${col}" stroke-width="1.9"/>` +
          `<rect x="-42" y="-14" width="26" height="10" rx="3" fill="${col}" fill-opacity="0.3"/>` +
          `<text x="-42" y="9" font-size="8.5" font-weight="800" fill="${txtMain}">${lbl}</text>` +
          `</g>`;
      });
    }
    return (
      drawLaptopScreenStage("riset", scr, t, isDark, uid) +
      drawCursor(lerp(295, 118, mv), lerp(165, 148, mv), seg(lt, 0.85, 1.25))
    );
  }

  // SCENE 4: Explores references, compares data, jots interesting notes & connects information
  if (scIdx === 3) {
    const conn1 = ease(seg(lt, 1.1, 1.9));
    const conn2 = ease(seg(lt, 1.9, 2.7));
    const jotting = lt > 1.35 && lt < 2.85;
    const jotWig = jotting ? Math.sin(t * 18) * 0.35 : 0;
    let scr = `<text x="182" y="59" font-size="10" font-weight="800" fill="${PAL.sky}">BANDINGKAN DATA, CATAT &amp; HUBUNGKAN</text>`;

    scr += `<rect x="180" y="70" width="112" height="72" rx="8" fill="${cardBg}" stroke="${PAL.teal}" stroke-width="1.8"/>`;
    scr += `<rect x="196" y="112" width="16" height="20" rx="3" fill="#94A3B8"/><rect x="222" y="98" width="16" height="34" rx="3" fill="${PAL.teal}"/><rect x="248" y="82" width="18" height="50" rx="3" fill="${PAL.ochre}"/>`;

    scr += `<rect x="308" y="70" width="112" height="72" rx="8" fill="${cardBg}" stroke="${PAL.sky}" stroke-width="1.8"/>`;
    scr += `<text x="364" y="94" text-anchor="middle" font-size="8.5" font-weight="800" fill="${PAL.sky}">REFERENSI &amp; POLA</text>`;
    scr += `<line x1="322" y1="112" x2="404" y2="112" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/><line x1="322" y1="124" x2="382" y2="124" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>`;

    scr += `<rect x="236" y="164" width="128" height="44" rx="8" fill="${cardBg}" stroke="${PAL.ochre}" stroke-width="2"/>`;
    scr += `<text x="300" y="187" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="800" fill="${PAL.ochre}">Catatan Insight Utama</text>`;

    if (conn1 > 0.02) {
      scr += `<line x1="256" y1="142" x2="${f1(lerp(256, 286, conn1))}" y2="${f1(lerp(142, 164, conn1))}" stroke="${PAL.ochre}" stroke-width="2.8" stroke-dasharray="4 3"/>`;
    }
    if (conn2 > 0.02) {
      scr += `<line x1="348" y1="142" x2="${f1(lerp(348, 314, conn2))}" y2="${f1(lerp(142, 164, conn2))}" stroke="${PAL.ochre}" stroke-width="2.8" stroke-dasharray="4 3"/>`;
    }

    const curX = kf(lt, [
      [0, 248],
      [1.0, 256],
      [1.9, 348],
      [2.8, 300],
    ]);
    const curY = kf(lt, [
      [0, 102],
      [1.0, 142],
      [1.9, 142],
      [2.8, 186],
    ]);
    const notePad =
      `<polygon points="112,251 156,251 150,235 118,235" fill="#FEF08A" stroke="${PAL.ink}" stroke-width="1.6"/>` +
      `<line x1="122" y1="241" x2="144" y2="241" stroke="${PAL.ink}" stroke-width="1.4" stroke-linecap="round"/>` +
      (lt > 1.7
        ? `<line x1="120" y1="246" x2="140" y2="246" stroke="${PAL.clay}" stroke-width="1.4" stroke-linecap="round"/>`
        : "");
    const penProp = `<line x1="-2" y1="2" x2="8" y2="-10" stroke="${PAL.ochre}" stroke-width="2.8" stroke-linecap="round"/>`;
    return (
      drawLaptopScreenStage("riset", scr, t, isDark, uid, {
        lean: jotting ? 0.35 : 0.1,
        handR: [(8.6 + jotWig) * 6.4, -3.9 * 6.4, 0.5],
        propR: penProp,
      }) +
      notePad +
      drawCursor(curX, curY, seg(lt, 2.75, 3.15))
    );
  }

  // SCENE 5: Discovers compelling idea, writes it in notebook & outlines content strategy
  if (scIdx === 4) {
    const toPlan = ease(seg(lt, 1.85, 2.35));
    const writeWig = lt < 1.9 ? Math.sin(t * 18) * 4.5 : 0;
    let s = drawChair(186, 256, 0, isDark);

    const pen =
      lt < 2.1
        ? `<line x1="-2" y1="2" x2="9" y2="-11" stroke="${PAL.ochre}" stroke-width="3" stroke-linecap="round"/>`
        : "";
    s += drawClawd(
      186,
      206,
      8.2,
      {
        id: uid,
        lean: lerp(0.55, 0.2, toPlan),
        lookX: lerp(0.75, 0.35, toPlan),
        lookY: 0.3,
        eyes: "normal",
        brows: "confident",
        mouth: "grin",
        handL: [-4.0 * 8.2, -1.9 * 8.2, -0.4],
        handR: lerpArr(
          [7.6 * 8.2 + writeWig, -1.5 * 8.2, 0.5],
          [3.6 * 8.2, -1.8 * 8.2, 0.4],
          toPlan
        ),
        propR: pen,
      },
      t
    );

    const bulbP = backOut(seg(lt, 0.1, 0.55));
    s +=
      `<g transform="translate(186, 88) scale(${f1(bulbP)})">` +
      `<circle cx="0" cy="0" r="16" fill="#FFE68A" fill-opacity="0.4"/>` +
      `<circle cx="0" cy="0" r="9.5" fill="#FFE68A" stroke="${PAL.ink}" stroke-width="1.8"/>` +
      `<rect x="-4" y="9" width="8" height="5" rx="1.5" fill="#94A3B8" stroke="${PAL.ink}" stroke-width="1.4"/>` +
      `</g>`;

    s +=
      `<g transform="translate(358, 102)">` +
      `<rect x="-82" y="-58" width="164" height="116" rx="10" fill="${cardBg}" stroke="${PAL.ochre}" stroke-width="2"/>` +
      `<text x="-66" y="-36" font-size="9" font-weight="800" fill="${PAL.ochre}">RENCANA STRATEGI</text>`;
    ["1. Topik Relevan", "2. Sudut Pandang Unik", "3. Solusi Audiens"].forEach(
      (st, idx) => {
        const show = easeOut(seg(lt, 1.3 + idx * 0.45, 1.75 + idx * 0.45));
        if (show > 0.03) {
          s += `<g opacity="${f1(show)}"><circle cx="-58" cy="${-12 + idx * 26}" r="4.5" fill="${PAL.sap}"/><text x="-46" y="${-11 + idx * 26}" dominant-baseline="central" font-size="8.8" font-weight="700" fill="${txtMain}">${st}</text></g>`;
        }
      }
    );
    s += `</g>`;

    s += drawDeskBase(198, isDark);
    s += drawDeskLaptop(186, 198, PAL.ochre, 1);
    s += `<polygon points="244,198 302,198 294,186 252,186" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="1.7"/>`;
    return s;
  }

  // SCENE 6: Looks back at laptop with confidence & clear strategic direction
  let s = drawChair(182, 256, 0.12, isDark);
  s += drawClawd(
    182,
    206,
    8.5,
    {
      id: uid,
      sq: -0.05,
      lean: 0.12 + Math.sin(t * 2.5) * 0.08,
      lookX: 0.35,
      eyes: lt > 1.4 ? "happy" : "normal",
      brows: "confident",
      mouth: "grin",
      blush: 0.55,
      handL: [-4.2 * 8.5, -2.0 * 8.5, -0.4],
      handR: [4.2 * 8.5, -2.0 * 8.5, 0.4],
    },
    t
  );

  s +=
    `<g transform="translate(348, 100)">` +
    `<rect x="-92" y="-62" width="184" height="124" rx="10" fill="${cardBg}" stroke="${PAL.sap}" stroke-width="2.2"/>` +
    `<text x="-76" y="-40" font-size="9.5" font-weight="800" fill="${PAL.sap}">ARAH KONTEN TERVALIDASI</text>` +
    `<path d="M -72 32 L -28 12 L 16 -12 L 62 -24" fill="none" stroke="${PAL.sap}" stroke-width="3.4" stroke-linecap="round"/>` +
    `<circle cx="62" cy="-24" r="6" fill="${PAL.ochre}" stroke="${PAL.ink}" stroke-width="1.6"/>` +
    `<rect x="-74" y="38" width="148" height="16" rx="5" fill="${PAL.sap}" fill-opacity="0.18"/>` +
    `<text x="0" y="46" text-anchor="middle" dominant-baseline="central" font-size="8.5" font-weight="800" fill="${PAL.sap}">Tepat Sasaran &amp; Relevan ✓</text>` +
    `</g>`;

  s += drawDeskBase(198, isDark);
  s += `<rect x="248" y="190" width="48" height="8" rx="2.5" fill="${PAL.ochre}" stroke="${PAL.ink}" stroke-width="1.6"/>`;
  s += drawDeskLaptop(182, 198, PAL.sap, 1);
  return s;
}

// ============================================================================
// 4. SHARED SINGLE-RAF TICKER FOR ALL 4 CARDS (ZERO REACT RE-RENDERS PER FRAME)
// ============================================================================
type Subscriber = (dt: number, reducedMotion: boolean) => void;

const subscribers = new Set<Subscriber>();
let rafId: number | null = null;
let lastFrameTs = 0;

function tickAll(now: number) {
  if (subscribers.size === 0) {
    rafId = null;
    return;
  }
  const rawDt = lastFrameTs ? (now - lastFrameTs) / 1000 : 0;
  lastFrameTs = now;
  const dt = document.hidden ? 0 : Math.min(0.05, Math.max(0, rawDt));
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  subscribers.forEach((fn) => fn(dt, reduced));
  rafId = window.requestAnimationFrame(tickAll);
}

function subscribeTicker(fn: Subscriber) {
  subscribers.add(fn);
  if (rafId === null && typeof window !== "undefined") {
    lastFrameTs = performance.now();
    rafId = window.requestAnimationFrame(tickAll);
  }
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && rafId !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

// ============================================================================
// 5. CARD STAGE COMPONENT (EXACT CONTAINER DIMENSIONS & DOTTED GRID)
// ============================================================================
function ClawdStoryVisual({ pillar }: { pillar: PillarKey }) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const stageGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const stageGroup = stageGroupRef.current;
    if (!container || !stageGroup) return;

    let isVisible = true;
    let playTime = 0;
    const totalScenes = SCENE_COUNTS[pillar];
    const totalDur = totalScenes * SCENE_LEN;

    const drawFrame = (timeSec: number) => {
      if (!stageGroupRef.current) return;
      const isDark = document.documentElement.classList.contains("dark");
      const scIdx = Math.min(
        totalScenes - 1,
        Math.floor(timeSec / SCENE_LEN)
      );
      const lt = timeSec - scIdx * SCENE_LEN;
      _boilFrame = Math.floor(timeSec * 12);

      // Smooth opacity dip across scene cuts without opaque background box flash
      const edgeFade = Math.min(lt / 0.14, (SCENE_LEN - lt) / 0.14, 1);
      const alpha = lerp(0.38, 1, ease(edgeFade));

      const inner = renderPillarScene(pillar, scIdx, lt, timeSec, isDark, uid);
      stageGroupRef.current.setAttribute("opacity", f1(alpha));
      stageGroupRef.current.innerHTML = inner;
    };

    // Immediate initial paint on mount (no blank frame)
    drawFrame(0);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]) {
            isVisible = entries[0].isIntersecting;
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(container);
    }

    // Re-render immediately if theme class toggles while paused/off-tick
    let mutObs: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined") {
      mutObs = new MutationObserver(() => drawFrame(playTime));
      mutObs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    const unsubscribe = subscribeTicker((dt, reducedMotion) => {
      if (!isVisible) return;
      if (reducedMotion) {
        // Static hero pose at Scene 1 midpoint when reduced motion is requested
        drawFrame(1.4);
        return;
      }
      if (dt > 0) {
        playTime = (playTime + dt) % totalDur;
        drawFrame(playTime);
      }
    });

    return () => {
      unsubscribe();
      observer?.disconnect();
      mutObs?.disconnect();
    };
  }, [pillar, uid]);

  const gridId = `clawd-grid-${uid}`;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden aspect-[16/9] lg:aspect-[4/3] rounded-lg"
    >
      {/* Background Dotted Grid matching exact card aesthetic */}
      <svg
        className="pointer-events-none absolute inset-0 size-full text-gray-900 dark:text-white"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={gridId}
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="14"
              y1="0"
              x2="14"
              y2="28"
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="1.15"
              strokeDasharray="1.5 5.5"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="14"
              x2="28"
              y2="14"
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="1.15"
              strokeDasharray="1.5 5.5"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />
      </svg>

      {/* Proportional 4:3 / 16:9 Stage with Top Badge Clearance & Subtle Hover Scale */}
      <svg
        viewBox="0 -22 480 316"
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none relative size-full transition-transform duration-700 ease-out group-hover:scale-[1.05] select-none"
        aria-hidden="true"
      >
        <g ref={stageGroupRef} />
      </svg>
    </div>
  );
}

export function RuangBelajarVisual() {
  return <ClawdStoryVisual pillar="belajar" />;
}

export function RuangNgontenVisual() {
  return <ClawdStoryVisual pillar="ngonten" />;
}

export function RuangAutomationVisual() {
  return <ClawdStoryVisual pillar="automation" />;
}

export function RuangRisetVisual() {
  return <ClawdStoryVisual pillar="riset" />;
}

export function HomeCardVisual({ id }: { id: string }) {
  switch (id) {
    case "ruang-belajar":
      return <RuangBelajarVisual />;
    case "ruang-ngonten":
      return <RuangNgontenVisual />;
    case "ruang-automation":
      return <RuangAutomationVisual />;
    case "ruang-riset":
      return <RuangRisetVisual />;
    default:
      return <RuangBelajarVisual />;
  }
}
