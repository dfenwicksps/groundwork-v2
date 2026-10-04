"use client";

import type { ReactNode } from "react";
import FilmPlayer, { type FilmScene } from "./FilmPlayer";
import { Figure, RIG_CSS, type Look } from "./rig";

/**
 * "Different Enough", told as an animated film instead of prose.
 *
 * Mum is lists, labels and a clock that says six-thirty; Sofia is scribbles.
 * The film opens on their two worlds split down the middle, keeps them in
 * separate rooms, then puts them on one bench in the dark. What they turn out
 * to share is drawing: a teenage Mum fills a sketchbook in the memory bubble
 * and boxes it up unseen. The ending is in Mum's own language, a sticky note,
 * stuck on a drawing of that night.
 */

/* ---------------------------------------------------------------- cast -- */

const HAIR = { hair: "#3B2416", hairShade: "#5A3A26" };

const SOFIA: Look = {
  skin: "#D4A276", skinShade: "#B8865C", ...HAIR, hairStyle: "long",
  top: "#C026D3", topShade: "#9D1BAE", topStyle: "hoodie",
  bottom: "#334155", bottomStyle: "pants", shoes: "#F4F1EA",
};
const MUM: Look = {
  skin: "#C9936A", skinShade: "#AD7A54", ...HAIR, hairStyle: "bob",
  top: "#64748B", topShade: "#4B5563", topStyle: "cardigan",
  bottom: "#1F2937", bottomStyle: "pants", shoes: "#3B2F28",
};
// Mum at sixteen: same face, Sofia's energy.
const TEEN_MUM: Look = {
  skin: "#C9936A", skinShade: "#AD7A54", ...HAIR, hairStyle: "ponytail",
  top: "#CA8A04", topShade: "#A16207", topStyle: "tee",
  bottom: "#334155", bottomStyle: "pants", shoes: "#F4F1EA",
};

/* ------------------------------------------------------------ helpers -- */

function Vignette({ id, strength = 0.22 }: { id: string; strength?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx="50%" cy="45%" r="75%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity={strength} />
        </radialGradient>
      </defs>
      <rect width="480" height="300" fill={`url(#${id})`} pointerEvents="none" />
    </>
  );
}

function Bubble({
  x, y, w, text, tail = "left", italic,
}: {
  x: number; y: number; w: number; text: string; tail?: "left" | "right"; italic?: boolean;
}) {
  const tx = tail === "left" ? x + 22 : x + w - 22;
  return (
    <g>
      <rect x={x} y={y} width={w} height="34" rx="17" fill="#FFFFFF" stroke="#E2DDD5" />
      <path
        d={tail === "left" ? `M${tx - 6} ${y + 32} L${tx - 12} ${y + 46} L${tx + 6} ${y + 32} Z` : `M${tx - 6} ${y + 32} L${tx + 12} ${y + 46} L${tx + 6} ${y + 32} Z`}
        fill="#FFFFFF"
      />
      <text
        x={x + w / 2} y={y + 22} fontSize="15" fontWeight={italic ? 400 : 600}
        fontStyle={italic ? "italic" : undefined} fill="#1E1A24" textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );
}

/** Shows its children from `at` to `until` seconds (the scene's own clock). */
function Beat({ at, until, children }: { at: number; until?: number; children: ReactNode }) {
  return (
    <g
      className={until ? "de-beat" : "de-pop"}
      style={until ? { animation: `de-beat-${Math.round(at * 10)}-${Math.round(until * 10)} 10s linear both` } : { animationDelay: `${at}s` }}
    >
      {children}
    </g>
  );
}

function Candle({ x, y, flameCls = "de-flicker" }: { x: number; y: number; flameCls?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-5" y="-22" width="10" height="22" rx="2" fill="#F5EBD6" />
      <ellipse cx="0" cy="-22" rx="5" ry="1.6" fill="#E8DCC2" />
      <path d="M0 -22 V-25.5" stroke="#3A2E24" strokeWidth="1" />
      <g className={flameCls}>
        <path d="M0 -40 C4.5 -33 4.5 -28 0 -25.5 C-4.5 -28 -4.5 -33 0 -40 Z" fill="#FDBA4A" />
        <path d="M0 -34.5 C2 -31.5 2 -29 0 -27.5 C-2 -29 -2 -31.5 0 -34.5 Z" fill="#FFF3C4" />
      </g>
    </g>
  );
}

function Crate({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-20" y="0" width="40" height="45" rx="2" fill="#8A6A4C" />
      <path d="M-20 15 H20 M-20 30 H20" stroke="#6F5239" strokeWidth="2" />
    </g>
  );
}

function Rain({ cls = "de-rain" }: { cls?: string }) {
  const drops = Array.from({ length: 42 }, (_, i) => ({
    x: (i * 53) % 500 - 10,
    y: (i * 37) % 300,
  }));
  return (
    <g className={cls} stroke="#9FB3D9" strokeWidth="1.4" strokeLinecap="round" opacity="0.55">
      {drops.map((d, i) => (
        <g key={i}>
          <path d={`M${d.x} ${d.y - 300} l-4 14`} />
          <path d={`M${d.x} ${d.y} l-4 14`} />
        </g>
      ))}
    </g>
  );
}

/** The back veranda at night: house wall, a window, the bench, the boards. */
function Veranda({ windowCls }: { windowCls?: string }) {
  return (
    <g>
      <rect width="480" height="300" fill="#1B2236" />
      <rect y="30" width="480" height="206" fill="#2B3350" />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M0 ${44 + i * 14} H480`} stroke="#252C47" strokeWidth="1.4" />
      ))}
      {/* the window: lit until the power goes */}
      <rect x="56" y="66" width="88" height="70" fill="#20263D" stroke="#3A4366" strokeWidth="4" />
      <rect x="58" y="68" width="84" height="66" fill="#F6C977" className={windowCls} />
      <path d="M100 66 V136 M56 101 H144" stroke="#3A4366" strokeWidth="3" />
      {/* back door */}
      <rect x="350" y="80" width="62" height="156" fill="#232A44" stroke="#3A4366" strokeWidth="3" />
      {/* roof edge and posts */}
      <rect width="480" height="32" fill="#151A2B" />
      <rect y="28" width="480" height="6" fill="#0F1322" />
      <rect x="18" y="32" width="12" height="206" fill="#4A3F36" />
      <rect x="450" y="32" width="12" height="206" fill="#4A3F36" />
      {/* boards, then the yard */}
      <rect y="236" width="480" height="30" fill="#5E4C3D" />
      <path d="M0 246 H480 M0 256 H480" stroke="#4E3E31" strokeWidth="1.2" />
      <rect y="266" width="480" height="34" fill="#131827" />
      {/* the bench */}
      <rect x="112" y="168" width="256" height="10" rx="3" fill="#7A5E45" />
      <rect x="112" y="210" width="256" height="9" rx="3" fill="#8A6A4C" />
      <rect x="122" y="219" width="7" height="40" fill="#6F5239" />
      <rect x="351" y="219" width="7" height="40" fill="#6F5239" />
    </g>
  );
}

/** A teenager's sketch: two people on a bench, a candle between them. */
function VerandaSketch() {
  return (
    <g stroke="#3A3A44" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 46 H62" />
      <circle cx="20" cy="26" r="5" />
      <path d="M14 46 C14 36 26 36 26 46" />
      <circle cx="50" cy="26" r="5" />
      <path d="M44 46 C44 36 56 36 56 46" />
      <path d="M33 46 V38 M31 38 H35" />
      <path d="M33 36 C35 33 35 31 33 29 C31 31 31 33 33 36" fill="#F4C26B" stroke="#C98B2E" />
      <path d="M6 12 l3 6 M14 8 l3 6 M58 10 l3 6" stroke="#9AA6C4" />
    </g>
  );
}

/* -------------------------------------------------------------- scenes -- */

function SceneSettings() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <g className="de-cam">
        {/* Mum's half: the kitchen, everything labelled */}
        <rect width="240" height="300" fill="#E9EEF2" />
        <rect y="236" width="240" height="64" fill="#CBD3DB" />
        <path d="M0 236 H240 M40 236 V300 M80 236 V300 M120 236 V300 M160 236 V300 M200 236 V300 M0 268 H240" stroke="#B8C2CC" strokeWidth="1" />
        <rect x="16" y="70" width="64" height="166" rx="4" fill="#F8FAFC" stroke="#CBD5E1" />
        <rect x="70" y="120" width="4" height="30" rx="2" fill="#CBD5E1" />
        <rect x="26" y="90" width="38" height="54" fill="#FFFFFF" stroke="#D5DCE4" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M38 ${100 + i * 11} H58`} stroke="#94A3B8" strokeWidth="1.6" />
            <path className="de-tick" style={{ animationDelay: `${0.8 + i * 1.3}s` }} d={`M29 ${100 + i * 11} l2.5 2.5 l4 -5`} stroke="#16A34A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
        ))}
        <rect x="100" y="84" width="128" height="6" rx="2" fill="#94A3B8" />
        {["SOUP", "RICE", "MON", "TUE"].map((l, i) => (
          <g key={l} transform={`translate(${104 + i * 31} 58)`}>
            <rect width="26" height="26" rx="3" fill="#DCE7EF" stroke="#B4C3D0" />
            <rect x="3" y="9" width="20" height="8" fill="#FFFFFF" />
            <text x="13" y="15.5" fontSize="6" fontWeight="700" fill="#475569" textAnchor="middle">{l}</text>
          </g>
        ))}
        <g transform="translate(196 126)">
          <circle r="18" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
          <path d="M0 0 V13 M0 0 L3.5 8" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <path d="M0 -15 V-13 M15 0 H13 M0 15 V13 M-15 0 H-13" stroke="#94A3B8" strokeWidth="1.4" />
        </g>
        <g transform="translate(140 262) scale(0.98)">
          <Figure
            look={MUM}
            expression="flat"
            leftArm={{ a: 14, b: -100, clsLower: "de-pen" }}
            rightArm={{ a: 20, b: -85 }}
          />
          <rect x="-12" y="-104" width="24" height="30" rx="2" fill="#B08D62" />
          <rect x="-10" y="-100" width="20" height="25" fill="#FFFFFF" />
          <path d="M-7 -95 H7 M-7 -90 H7 M-7 -85 H5 M-7 -80 H6" stroke="#94A3B8" strokeWidth="1" />
        </g>

        {/* Sofia's half: her room, everything scribbled */}
        <rect x="240" width="240" height="300" fill="#EAD7EE" />
        <rect x="240" y="236" width="240" height="64" fill="#B892BF" />
        <path d="M250 30 Q300 44 350 30 T470 32" stroke="#8B6A92" strokeWidth="1" fill="none" />
        {[262, 290, 318, 346, 374, 402, 430, 458].map((x, i) => (
          <circle key={x} cx={x} cy={33 + (i % 2) * 6} r="3" fill={["#FDE68A", "#F9A8D4", "#A5F3FC"][i % 3]} />
        ))}
        <g transform="translate(262 66) rotate(-6)">
          <rect width="46" height="56" fill="#FFFFFF" />
          <path d="M8 40 C14 10 30 50 38 16" stroke="#A21CAF" strokeWidth="2" fill="none" />
        </g>
        <g transform="translate(424 60) rotate(8)">
          <rect width="40" height="48" fill="#FFFBEB" />
          <circle cx="20" cy="22" r="10" stroke="#0E7490" strokeWidth="2" fill="none" />
        </g>
        {/* the bed */}
        <rect x="300" y="200" width="170" height="44" rx="6" fill="#7C3AED" />
        <rect x="300" y="196" width="170" height="14" rx="6" fill="#A78BFA" />
        <rect x="440" y="150" width="30" height="50" rx="6" fill="#F5F3FF" />
        <g transform="translate(372 278)">
          <Figure
            look={SOFIA}
            expression="smile"
            seated
            leftArm={{ a: 10, b: -50 }}
            rightArm={{ a: 14, b: -62, clsLower: "de-draw" }}
          />
          <g transform="translate(0 -70)">
            <path d="M-22 -2 L0 4 L22 -2 L22 8 L0 14 L-22 8 Z" fill="#FFFFFF" stroke="#D4D4D8" />
            <path d="M0 4 V14" stroke="#D4D4D8" />
          </g>
        </g>
        {/* doodles, appearing as she draws */}
        <g fill="none" strokeLinecap="round" strokeWidth="2.4">
          <path className="de-doodle" style={{ animationDelay: "0.6s" }} d="M300 150 c10 -20 24 -20 20 -4 s-16 14 -4 20" stroke="#C026D3" />
          <path className="de-doodle" style={{ animationDelay: "2.2s" }} d="M418 140 l6 -14 l6 14 l-14 -8 h16 z" stroke="#0E7490" />
          <path className="de-doodle" style={{ animationDelay: "3.8s" }} d="M350 108 c-12 0 -12 -16 0 -16 c14 0 14 22 -2 22 c-18 0 -18 -28 2 -28" stroke="#EA580C" />
          <path className="de-doodle" style={{ animationDelay: "5.4s" }} d="M440 196 q8 -16 16 0 q8 16 16 0" stroke="#A21CAF" />
        </g>
        {/* the line down the middle */}
        <path d="M240 0 V300" stroke="#1E1A24" strokeWidth="2" strokeDasharray="6 6" opacity="0.35" />
      </g>
      <Vignette id="de1-vig" />
    </svg>
  );
}

function SceneDinner() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <g className="de-cam">
        <rect width="480" height="300" fill="#F3E8DA" />
        <rect x="190" y="44" width="100" height="78" rx="3" fill="#FBF6EE" />
        <rect x="196" y="50" width="88" height="66" fill="#6E79A8" />
        <circle cx="262" cy="70" r="8" fill="#F5E6B8" />
        <path d="M240 50 V116 M196 83 H284" stroke="#FBF6EE" strokeWidth="3" />
        <g transform="translate(64 64)">
          <circle r="16" fill="#FFFFFF" stroke="#B9A894" strokeWidth="2" />
          <path d="M0 0 V11 M0 0 L3 7" stroke="#3B2F28" strokeWidth="2" strokeLinecap="round" />
        </g>
        <rect y="236" width="480" height="64" fill="#C9B79F" />
        <g transform="translate(150 262)">
          <Figure look={MUM} expression="flat" upper leftArm={{ a: 14, b: -84 }} rightArm={{ a: 14, b: -84 }} />
        </g>
        <g className="de-leave">
          <g transform="translate(330 262)">
            <g className="de-face-out">
              <Figure look={SOFIA} expression="flat" upper leftArm={{ a: 14, b: -84 }} rightArm={{ a: 14, b: -84 }} />
            </g>
            <g className="de-face-in">
              <Figure look={SOFIA} expression="worried" upper leftArm={{ a: 14, b: -84 }} rightArm={{ a: 14, b: -84 }} />
            </g>
          </g>
        </g>
        {/* the table */}
        <rect x="40" y="192" width="400" height="10" rx="3" fill="#FFFFFF" />
        <path d="M40 202 H440 L452 260 H28 Z" fill="#E8DFF2" />
        <path d="M60 202 L54 260 M120 202 L116 260 M180 202 L178 260 M240 202 V260 M300 202 L302 260 M360 202 L364 260 M420 202 L426 260" stroke="#D6CBE6" strokeWidth="1.5" />
        <ellipse cx="150" cy="194" rx="30" ry="6" fill="#FFFFFF" stroke="#D9D2C7" />
        <ellipse cx="150" cy="192" rx="14" ry="3" fill="#E9A25B" />
        <g className="de-leave">
          <ellipse cx="330" cy="194" rx="30" ry="6" fill="#FFFFFF" stroke="#D9D2C7" />
          <ellipse cx="330" cy="192" rx="14" ry="3" fill="#E9A25B" />
        </g>
        <rect x="236" y="176" width="10" height="18" rx="2" fill="#E0F2FE" stroke="#BAD7EA" />

        <Beat at={0.6} until={2.6}>
          <Bubble x={130} y={40} w={250} text="Is your homework actually done?" tail="left" />
        </Beat>
        <Beat at={2.8} until={4.4}>
          <Bubble x={300} y={52} w={84} text="*sigh*" tail="left" italic />
        </Beat>
        <Beat at={4.6} until={6.8}>
          <Bubble x={130} y={40} w={196} text="I'm just being honest." tail="left" />
        </Beat>
      </g>
      <Vignette id="de2-vig" />
    </svg>
  );
}

function SceneRooms() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <g className="de-cam">
        <rect width="480" height="300" fill="#151A2B" />
        {/* Mum's room */}
        <rect x="16" y="40" width="216" height="200" fill="#DCE3EA" />
        <circle cx="70" cy="120" r="70" fill="#FFF3D1" opacity="0.5" />
        <rect x="60" y="92" width="4" height="78" fill="#64748B" />
        <path d="M48 92 L76 92 L70 76 L54 76 Z" fill="#F8E7B0" />
        <g transform="translate(130 262)">
          <Figure look={MUM} expression="neutral" upper leftArm={{ a: 14, b: -84, clsLower: "de-type" }} rightArm={{ a: 14, b: -84, clsLower: "de-type-late" }} />
        </g>
        <rect x="70" y="192" width="150" height="9" rx="2" fill="#94A3B8" />
        <path d="M108 192 L112 168 L150 168 L154 192 Z" fill="#475569" />
        <circle cx="131" cy="179" r="2" fill="#CBD5E1" />
        {/* the wall between */}
        <rect x="232" y="40" width="16" height="200" fill="#3A4160" />
        {/* Sofia's room */}
        <rect x="248" y="40" width="216" height="200" fill="#E7D3EC" />
        <rect x="290" y="204" width="160" height="36" rx="6" fill="#7C3AED" />
        <rect x="290" y="198" width="160" height="12" rx="6" fill="#A78BFA" />
        <g transform="translate(362 280)">
          <Figure look={SOFIA} expression="neutral" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 14, b: -62, clsLower: "de-draw" }} />
          <g transform="translate(0 -70)">
            <path d="M-22 -2 L0 4 L22 -2 L22 8 L0 14 L-22 8 Z" fill="#FFFFFF" stroke="#D4D4D8" />
          </g>
        </g>
        {/* floor of the house */}
        <rect x="16" y="240" width="448" height="8" fill="#3A4160" />
        {/* ten metres */}
        <g className="de-measure">
          <path d="M130 272 H362" stroke="#CBD5E1" strokeWidth="1.6" strokeDasharray="4 4" />
          <path d="M130 264 V280 M362 264 V280" stroke="#CBD5E1" strokeWidth="1.6" />
        </g>
        <Beat at={3}>
          <rect x="204" y="262" width="84" height="20" rx="10" fill="#151A2B" />
          <text x="246" y="276" fontSize="12" fontWeight="600" fill="#E2E8F0" textAnchor="middle">10 metres</text>
        </Beat>
      </g>
      <Vignette id="de3-vig" strength={0.3} />
    </svg>
  );
}

function SceneStorm() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <radialGradient id="de4-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FCD34D" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FCD34D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="de-cam">
        <Veranda windowCls="de-power-out" />
        <circle cx="240" cy="190" r="120" fill="url(#de4-glow)" className="de-glow-in" />
        <g transform="translate(170 286)">
          <Figure look={MUM} expression="neutral" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
        </g>
        <g transform="translate(310 286)">
          <Figure look={SOFIA} expression="flat" seated leftArm={{ a: 20, b: -85 }} rightArm={{ a: 20, b: -85 }} />
          <rect x="-6" y="-92" width="12" height="18" rx="2.4" fill="#1F2430" />
        </g>
        <Crate x={240} y={214} />
        <g className="de-candle-in">
          <Candle x={240} y={214} />
        </g>
        <Beat at={3.4}>
          <g transform="translate(328 96)">
            <rect width="62" height="30" rx="15" fill="#FFFFFF" />
            <rect x="10" y="10" width="22" height="11" rx="2" fill="none" stroke="#1E1A24" strokeWidth="1.5" />
            <rect x="32" y="13" width="2.5" height="5" fill="#1E1A24" />
            <rect x="12" y="12" width="2" height="7" fill="#DC2626" />
            <text x="40" y="20" fontSize="10" fontWeight="700" fill="#DC2626">4%</text>
          </g>
        </Beat>
        <Rain />
        <rect width="480" height="300" fill="#E0E7FF" className="de-lightning" />
      </g>
      <Vignette id="de4-vig" strength={0.35} />
    </svg>
  );
}

function SceneStory() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <radialGradient id="de5-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FCD34D" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FCD34D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="de-cam">
        <Veranda windowCls="de-dark" />
        <circle cx="240" cy="190" r="110" fill="url(#de5-glow)" />
        <g transform="translate(170 286)">
          <Figure look={MUM} expression="speak" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 22, b: -70 }} />
        </g>
        <g transform="translate(310 286)">
          <g className="de-soften-out">
            <Figure look={SOFIA} expression="worried" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
          </g>
          <g className="de-soften-in">
            <Figure look={SOFIA} expression="soft" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
          </g>
        </g>
        <Crate x={240} y={214} />
        <Candle x={240} y={214} />
        <Rain />
        {/* the memory: Mum at sixteen, drawing, then boxing it up */}
        <g className="de-memory">
          <circle cx="188" cy="118" r="5" fill="#F6EAD2" stroke="#D8B98A" strokeDasharray="3 3" />
          <circle cx="198" cy="106" r="7" fill="#F6EAD2" stroke="#D8B98A" strokeDasharray="3 3" />
          <rect x="196" y="8" width="274" height="104" rx="22" fill="#F6EAD2" stroke="#D8B98A" strokeWidth="2" strokeDasharray="6 5" />
          <text x="212" y="102" fontSize="10" fontWeight="700" letterSpacing="1" fill="#A0805A">AT SIXTEEN</text>
          <g transform="translate(262 112) scale(0.62)">
            <Figure look={TEEN_MUM} expression="soft" upper leftArm={{ a: 14, b: -84 }} rightArm={{ a: 14, b: -84, clsLower: "de-draw-small" }} />
          </g>
          <rect x="206" y="74" width="120" height="8" rx="2" fill="#B98F5E" />
          <g className="de-book-away">
            <g transform="translate(240 60)">
              <path d="M0 2 L22 7 L44 2 L44 16 L22 21 L0 16 Z" fill="#FFFFFF" stroke="#C9B48F" />
              <path className="de-sketch" d="M5 12 c4 -7 9 5 14 -2 M25 14 c4 -6 9 -6 14 0" stroke="#5A4A3A" strokeWidth="1.2" fill="none" />
            </g>
          </g>
          <rect x="384" y="62" width="66" height="10" fill="#B9925F" />
          <rect x="386" y="70" width="62" height="32" fill="#C9A26B" />
          <path d="M386 82 H448" stroke="#B08A55" />
          <Beat at={4.2}>
            <g transform="translate(330 20)">
              <rect width="126" height="24" rx="12" fill="#FFFFFF" stroke="#D8B98A" />
              <text x="63" y="16" fontSize="11.5" fontStyle="italic" fill="#1E1A24" textAnchor="middle">You&apos;re good at this.</text>
            </g>
          </Beat>
        </g>
      </g>
      <Vignette id="de5-vig" strength={0.35} />
    </svg>
  );
}

function SceneSeen() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <radialGradient id="de6-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FCD34D" stopOpacity="0.65" />
          <stop offset="1" stopColor="#FCD34D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="de-cam">
        <g transform="translate(230 205) scale(1.5) translate(-205 -205)">
          <Veranda windowCls="de-dark" />
          <circle cx="215" cy="190" r="100" fill="url(#de6-glow)" />
          <g transform="translate(170 286)">
            <Figure look={MUM} expression="soft" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
            {/* the girl she was, flickering into the same place */}
            <g className="de-ghost">
              <Figure look={TEEN_MUM} expression="soft" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
            </g>
          </g>
          <g transform="translate(310 286)">
            <Figure look={SOFIA} expression="soft" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
          </g>
          <Crate x={240} y={214} />
          <Candle x={240} y={214} />
        </g>
      </g>
      <Vignette id="de6-vig" strength={0.4} />
    </svg>
  );
}

function SceneLights() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <radialGradient id="de7-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FCD34D" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FCD34D" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="de7-cold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E0F2FE" stopOpacity="0.9" />
          <stop offset="1" stopColor="#E0F2FE" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="de-cam">
        {/* the veranda: power back, candle out */}
        <g className="de-cut-out">
          <Veranda windowCls="de-power-on" />
          <circle cx="240" cy="190" r="110" fill="url(#de7-glow)" className="de-glow-out" />
          <g transform="translate(170 286)">
            <Figure look={MUM} expression="neutral" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
          </g>
          <g transform="translate(310 286)">
            <Figure look={SOFIA} expression="neutral" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
          </g>
          <Crate x={240} y={214} />
          <Candle x={240} y={214} flameCls="de-blow-out" />
          <path className="de-smoke" d="M240 186 c-6 -8 6 -14 0 -22 c-6 -8 6 -14 0 -22" stroke="#CBD5E1" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
        {/* the kitchen: Mum checks the freezer */}
        <g className="de-cut-in">
          <rect width="480" height="300" fill="#EEF2F5" />
          <rect y="236" width="480" height="64" fill="#CBD3DB" />
          <rect x="60" y="56" width="120" height="180" rx="4" fill="#F8FAFC" stroke="#CBD5E1" />
          <rect x="66" y="62" width="108" height="168" fill="#DDEFFB" />
          <rect x="66" y="62" width="108" height="168" fill="url(#de7-cold)" />
          {[0, 1, 2].map((r) =>
            ["SOUP", "RICE", "MON"].map((l, c) => (
              <g key={`${r}${c}`} transform={`translate(${74 + c * 34} ${76 + r * 50})`}>
                <rect width="26" height="22" rx="3" fill="#FFFFFF" stroke="#B4C3D0" />
                <text x="13" y="14" fontSize="6" fontWeight="700" fill="#475569" textAnchor="middle">{l}</text>
              </g>
            ))
          )}
          <path d="M182 56 L230 70 L230 236 L182 236 Z" fill="#E2E8F0" stroke="#CBD5E1" />
          <g transform="translate(232 262)">
            <Figure look={MUM} expression="flat" leftArm={{ a: 34, b: -60 }} />
          </g>
          {/* Sofia in the doorway */}
          <rect x="350" y="70" width="90" height="166" fill="#C9B7D1" />
          <g transform="translate(395 262) scale(0.98)">
            <Figure look={SOFIA} expression="flat" leftArm={{ a: 6, b: 4 }} rightArm={{ a: 6, b: 4 }} />
          </g>
          <Beat at={5}>
            <Bubble x={200} y={36} w={210} text="Who left the milk out?" tail="left" />
          </Beat>
          <Beat at={6.6}>
            <Bubble x={300} y={76} w={124} text="Wasn't me." tail="right" />
          </Beat>
        </g>
      </g>
      <Vignette id="de7-vig" />
    </svg>
  );
}

function SceneNote() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <g className="de-cam">
        <rect width="480" height="300" fill="#F3E8DA" />
        <rect x="20" y="40" width="440" height="6" rx="2" fill="#E2D3BE" />
        <rect y="150" width="480" height="42" fill="#EBDDC9" />
        {/* Mum, coming to look, then going */}
        <g className="de-mum-visit">
          <g transform="translate(0 262)">
            <Figure look={MUM} expression="soft" upper leftArm={{ a: 8, b: 6 }} rightArm={{ a: 8, b: 6, cls: "de-reach", clsLower: "de-reach-lower" }} />
          </g>
        </g>
        {/* Sofia, later */}
        <g className="de-sofia-visit">
          <g transform="translate(0 262)">
            <g className="de-note-face-out">
              <Figure look={SOFIA} expression="neutral" upper />
            </g>
            <g className="de-note-face-in">
              <Figure look={SOFIA} expression="smile" upper />
            </g>
          </g>
        </g>
        {/* the bench, and her sketchbook propped open on it */}
        <rect y="192" width="480" height="12" fill="#B9A894" />
        <rect y="204" width="480" height="96" fill="#D9C7AE" />
        <path d="M120 204 V300 M240 204 V300 M360 204 V300" stroke="#C7B398" strokeWidth="2" />
        <g transform="translate(153 84) scale(1.4)">
          <path d="M0 4 L62 0 L62 78 L0 80 Z" fill="#FFFFFF" stroke="#D4D4D8" />
          <path d="M62 0 L124 4 L124 80 L62 78 Z" fill="#FBFBF8" stroke="#D4D4D8" />
          <path d="M62 0 V78" stroke="#C4C4CC" />
          <g transform="translate(66 2)">
            <VerandaSketch />
          </g>
          <path d="M8 22 c10 -8 20 8 30 0 M10 44 c8 6 18 -6 28 2" stroke="#A1A1AA" strokeWidth="1.2" fill="none" />
          <g className="de-sticky">
            <g transform="translate(86 57) rotate(-5)">
              <rect width="36" height="22" fill="#FDE047" />
              <rect width="36" height="4" fill="#FACC15" />
              <text x="18" y="16" fontSize="8.5" fontStyle="italic" fontWeight="600" fill="#1E1A24" textAnchor="middle">This one.</text>
            </g>
          </g>
        </g>
      </g>
      <Vignette id="de8-vig" />
    </svg>
  );
}

function Poster() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <radialGradient id="de0-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FCD34D" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FCD34D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Veranda windowCls="de-dark" />
      <circle cx="240" cy="190" r="120" fill="url(#de0-glow)" />
      <g transform="translate(170 286)">
        <Figure look={MUM} expression="speak" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 22, b: -70 }} />
      </g>
      <g transform="translate(310 286)">
        <Figure look={SOFIA} expression="soft" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
      </g>
      <Crate x={240} y={214} />
      <Candle x={240} y={214} flameCls="" />
      <Vignette id="de0-vig" strength={0.35} />
    </svg>
  );
}

/* -------------------------------------------------------------- script -- */

const SCENES: FilmScene[] = [
  {
    id: "settings",
    art: <SceneSettings />,
    duration: 8500,
    caption:
      "Sofia and her mum ran on different settings. Mum had lists, labelled freezer containers and dinner at six-thirty sharp. Sofia had big feelings, no plan, and a sketchbook she drew in instead of doing homework.",
  },
  {
    id: "dinner",
    art: <SceneDinner />,
    duration: 9000,
    caption:
      "Most dinners went the same way: a comment, a sigh, someone saying “I'm just being honest” — and one of them taking their plate to another room.",
  },
  {
    id: "rooms",
    art: <SceneRooms />,
    duration: 8000,
    caption:
      "They lived ten metres apart and hardly knew each other. Sofia figured that was just how it was going to be.",
  },
  {
    id: "storm",
    art: <SceneStorm />,
    duration: 9000,
    caption:
      "The summer Sofia was fifteen, a storm took the power out. No wifi. No TV. Phone on four per cent. Just a candle, and the two of them on the back veranda, waiting.",
  },
  {
    id: "story",
    art: <SceneStory />,
    duration: 9500,
    caption:
      "Then, out of nowhere, Mum started talking. About being sixteen and not knowing what she wanted. About an art teacher who told her she was good. About a sketchbook she filled that year and never showed anyone.",
  },
  {
    id: "seen",
    art: <SceneSeen />,
    duration: 9000,
    caption:
      "Sofia had never once pictured her mum at her age — unsure, searching, drawing in the margins. She sat in the candlelight trying to fit the two people together.",
  },
  {
    id: "lights",
    art: <SceneLights />,
    duration: 8500,
    caption:
      "When the power came back, Mum blew out the candle and went to check the freezer. They weren't suddenly best friends. The arguments didn't stop.",
  },
  {
    id: "note",
    art: <SceneNote />,
    duration: 10000,
    caption:
      "But something had opened — a small gap where something more honest could get through. A few weeks later, Sofia left her sketchbook open on the kitchen bench. Mum didn't say anything. She just stuck a note on one page: “This one.”",
  },
];

export default function DifferentEnoughFilm({ storyId }: { storyId: string }) {
  return <FilmPlayer storyId={storyId} scenes={SCENES} poster={<Poster />} css={RIG_CSS + FILM_CSS + BEAT_CSS} />;
}

/* --------------------------------------------------------------- style -- */

// Each Beat with an end time needs its own keyframes (10s clock, so a
// percentage is tenths of a second times ten). Generated from the beats used
// above, so adding one is a single <Beat> rather than a hand-written rule.
const BEATS: [number, number][] = [
  [0.6, 2.6],
  [2.8, 4.4],
  [4.6, 6.8],
];
const BEAT_CSS = BEATS.map(([a, b]) => {
  const p = (s: number) => `${(s * 10).toFixed(1)}%`;
  return `@keyframes de-beat-${Math.round(a * 10)}-${Math.round(b * 10)} {
  0%, ${p(a)} { opacity: 0; transform: translateY(6px); }
  ${p(a + 0.4)}, ${p(b)} { opacity: 1; transform: none; }
  ${p(b + 0.4)}, 100% { opacity: 0; transform: none; }
}`;
}).join("\n");

const FILM_CSS = `
.de-cam { transform-origin: 240px 150px; animation: de-cam 9s ease-out both; }
@keyframes de-cam { from { transform: scale(1); } to { transform: scale(1.06); } }

.de-pop { transform-box: fill-box; transform-origin: center; animation: de-pop 0.5s cubic-bezier(.2,.9,.3,1.3) both; }
@keyframes de-pop { from { opacity: 0; transform: scale(0.85) translateY(6px); } to { opacity: 1; transform: none; } }
.de-beat { transform-box: fill-box; transform-origin: center; }

/* two worlds */
.de-tick { stroke-dasharray: 12; stroke-dashoffset: 12; animation: de-draw-line 0.4s ease-out both; }
@keyframes de-draw-line { to { stroke-dashoffset: 0; } }
.de-pen { animation: de-pen 0.5s ease-in-out infinite; }
@keyframes de-pen { 0%, 100% { transform: rotate(-100deg); } 50% { transform: rotate(-92deg); } }
.de-draw { animation: de-draw 0.6s ease-in-out infinite; }
@keyframes de-draw { 0%, 100% { transform: rotate(-62deg); } 50% { transform: rotate(-48deg); } }
.de-draw-small { animation: de-draw-small 0.5s ease-in-out infinite; }
@keyframes de-draw-small { 0%, 100% { transform: rotate(-84deg); } 50% { transform: rotate(-74deg); } }
.de-doodle { stroke-dasharray: 160; stroke-dashoffset: 160; animation: de-doodle 1.4s ease-out both; }
@keyframes de-doodle { to { stroke-dashoffset: 0; } }

/* dinner */
.de-leave { animation: de-leave 9s ease-in both; }
@keyframes de-leave { 0%, 72% { transform: translateX(0); opacity: 1; } 92%, 100% { transform: translateX(160px); opacity: 0; } }
.de-face-out { animation: de-face-out 9s linear both; }
.de-face-in { animation: de-face-in 9s linear both; }
@keyframes de-face-out { 0%, 30% { opacity: 1; } 34%, 100% { opacity: 0; } }
@keyframes de-face-in { 0%, 30% { opacity: 0; } 34%, 100% { opacity: 1; } }

/* rooms */
.de-type { animation: de-type 0.3s linear infinite; }
.de-type-late { animation: de-type 0.3s linear 0.15s infinite; }
@keyframes de-type { 0%, 100% { transform: rotate(-84deg); } 50% { transform: rotate(-80deg); } }
.de-measure { animation: de-measure 1.4s ease-out 1.4s both; }
@keyframes de-measure { from { opacity: 0; } to { opacity: 1; } }

/* storm */
.de-rain { animation: de-rain 0.5s linear infinite; }
@keyframes de-rain { from { transform: translate(0, 0); } to { transform: translate(-20px, 300px); } }
.de-lightning { opacity: 0; animation: de-lightning 9s linear both; }
@keyframes de-lightning { 0%, 14% { opacity: 0; } 15% { opacity: 0.85; } 16.5% { opacity: 0; } 18% { opacity: 0.6; } 20%, 100% { opacity: 0; } }
.de-power-out { animation: de-power-out 9s linear both; }
@keyframes de-power-out { 0%, 16% { opacity: 1; } 17%, 100% { opacity: 0; } }
.de-dark { opacity: 0; }
.de-glow-in { animation: de-glow-in 9s ease-out both; }
@keyframes de-glow-in { 0%, 22% { opacity: 0; } 40%, 100% { opacity: 1; } }
.de-candle-in { animation: de-candle-in 9s ease-out both; }
@keyframes de-candle-in { 0%, 20% { opacity: 0; } 26%, 100% { opacity: 1; } }
.de-flicker { transform-box: fill-box; transform-origin: center bottom; animation: de-flicker 0.9s ease-in-out infinite; }
@keyframes de-flicker { 0%, 100% { transform: scaleY(1) rotate(0deg); } 30% { transform: scaleY(1.1) rotate(-3deg); } 60% { transform: scaleY(0.92) rotate(2deg); } }

/* the story */
.de-memory { transform-box: fill-box; transform-origin: 0% 100%; animation: de-memory 0.8s cubic-bezier(.2,.9,.3,1.2) 0.9s both; }
@keyframes de-memory { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: none; } }
.de-sketch { stroke-dasharray: 40; stroke-dashoffset: 40; animation: de-draw-line 2.4s linear 1.8s both; }
.de-book-away { animation: de-book-away 9.5s ease-in-out both; }
@keyframes de-book-away { 0%, 68% { transform: translate(0, 0); } 80%, 100% { transform: translate(155px, 22px); } }
.de-soften-out { animation: de-soften-out 9.5s linear both; }
.de-soften-in { animation: de-soften-in 9.5s linear both; }
@keyframes de-soften-out { 0%, 62% { opacity: 1; } 68%, 100% { opacity: 0; } }
@keyframes de-soften-in { 0%, 62% { opacity: 0; } 68%, 100% { opacity: 1; } }

/* seeing her */
.de-ghost { animation: de-ghost 9s ease-in-out both; }
@keyframes de-ghost { 0%, 12% { opacity: 0; } 28%, 40% { opacity: 0.7; } 54% { opacity: 0; } 70%, 84% { opacity: 0.7; } 100% { opacity: 0.35; } }

/* lights back */
.de-power-on { animation: de-power-on 8.5s linear both; }
@keyframes de-power-on { 0%, 10% { opacity: 0; } 12%, 100% { opacity: 1; } }
.de-glow-out { animation: de-glow-out 8.5s linear both; }
@keyframes de-glow-out { 0%, 20% { opacity: 1; } 26%, 100% { opacity: 0; } }
.de-blow-out { transform-box: fill-box; transform-origin: center bottom; animation: de-blow-out 8.5s ease-in both; }
@keyframes de-blow-out { 0%, 18% { transform: scale(1) rotate(0deg); opacity: 1; } 22% { transform: scale(0.8, 0.5) rotate(25deg); opacity: 0.8; } 25%, 100% { transform: scale(0); opacity: 0; } }
.de-smoke { stroke-dasharray: 60; stroke-dashoffset: 60; animation: de-smoke 8.5s ease-out both; }
@keyframes de-smoke { 0%, 24% { stroke-dashoffset: 60; opacity: 0; } 30% { opacity: 0.9; } 40%, 100% { stroke-dashoffset: 0; opacity: 0; } }
.de-cut-out { animation: de-cut-out 8.5s linear both; }
.de-cut-in { animation: de-cut-in 8.5s linear both; }
@keyframes de-cut-out { 0%, 38% { opacity: 1; } 44%, 100% { opacity: 0; } }
@keyframes de-cut-in { 0%, 38% { opacity: 0; } 44%, 100% { opacity: 1; } }

/* the note */
.de-mum-visit { animation: de-mum-visit 10s ease-in-out both; }
@keyframes de-mum-visit {
  0%, 6% { transform: translateX(-80px); }
  20%, 46% { transform: translateX(112px); }
  58%, 100% { transform: translateX(-80px); }
}
.de-reach { animation: de-reach 10s ease-in-out both; }
@keyframes de-reach { 0%, 26% { transform: rotate(8deg); } 32%, 38% { transform: rotate(62deg); } 44%, 100% { transform: rotate(8deg); } }
.de-reach-lower { animation: de-reach-lower 10s ease-in-out both; }
@keyframes de-reach-lower { 0%, 26% { transform: rotate(6deg); } 32%, 38% { transform: rotate(-30deg); } 44%, 100% { transform: rotate(6deg); } }
.de-sticky { transform-box: fill-box; transform-origin: center; animation: de-sticky 10s cubic-bezier(.2,.9,.3,1.3) both; }
@keyframes de-sticky { 0%, 34% { opacity: 0; transform: scale(0.6); } 38%, 100% { opacity: 1; transform: none; } }
.de-sofia-visit { animation: de-sofia-visit 10s ease-out both; }
@keyframes de-sofia-visit { 0%, 58% { transform: translateX(560px); } 72%, 100% { transform: translateX(372px); } }
.de-note-face-out { animation: de-note-face-out 10s linear both; }
.de-note-face-in { animation: de-note-face-in 10s linear both; }
@keyframes de-note-face-out { 0%, 78% { opacity: 1; } 82%, 100% { opacity: 0; } }
@keyframes de-note-face-in { 0%, 78% { opacity: 0; } 82%, 100% { opacity: 1; } }
`;
