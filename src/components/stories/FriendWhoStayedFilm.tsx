"use client";

import type { ReactNode } from "react";
import FilmPlayer, { type FilmScene } from "./FilmPlayer";
import { Figure, RIG_CSS, type Look } from "./rig";

/**
 * "The Friend Who Stayed", told as an animated film instead of prose.
 *
 * Colour carries the story. Jonah's drains out of him as he pulls away (scenes
 * 2–4): green hoodie to grey, maroon uniform to grey. It comes back a little at
 * a time while Leon sits with him on the back step (5–6), and it's all there
 * once Leon's arm goes round his shoulders (7). In the last scene Jonah is in
 * full colour, and he's the one sending the dog to Sam, who has gone grey.
 */

/* ---------------------------------------------------------------- cast -- */

const JONAH_SKIN = { skin: "#EDC3A0", skinShade: "#D3A27D" };
const JONAH_HAIR = { hair: "#6B4428", hairShade: "#8A5A36", hairStyle: "short" as const };

const JONAH: Look = {
  ...JONAH_SKIN, ...JONAH_HAIR,
  top: "#3F8A5F", topShade: "#2C6545", topStyle: "hoodie",
  bottom: "#3A4E6E", bottomStyle: "pants", shoes: "#ECE8E0",
};
// Jonah as he feels while he's pulling away: the same clothes, drained.
const JONAH_GREY: Look = { ...JONAH, top: "#9AA29E", topShade: "#7A827E", bottom: "#868C98", shoes: "#CFCFCF" };

const UNIFORM = {
  top: "#7A2E3A", topShade: "#5A1F2A", topStyle: "jumper" as const, collar: "#FFFFFF",
  bottom: "#4A4F5C", bottomStyle: "pants" as const, shoes: "#1F2228",
};
const UNIFORM_GREY = { ...UNIFORM, top: "#9C9294", topShade: "#7E7476", bottom: "#868A93", shoes: "#4A4D55" };

const JONAH_SCHOOL: Look = { ...JONAH_SKIN, ...JONAH_HAIR, ...UNIFORM };
const JONAH_SCHOOL_GREY: Look = { ...JONAH_SKIN, ...JONAH_HAIR, ...UNIFORM_GREY };

const LEON_BASE = { skin: "#6B4226", skinShade: "#53311A", hair: "#151110", hairShade: "#2E2420", hairStyle: "curly" as const };
const LEON: Look = {
  ...LEON_BASE,
  top: "#E8743B", topShade: "#C25A26", topStyle: "tee",
  bottom: "#2E3446", bottomStyle: "pants", shoes: "#F2F0EA",
};
const LEON_SCHOOL: Look = { ...LEON_BASE, ...UNIFORM };

const SAM_BASE = { skin: "#D9A77C", skinShade: "#BE8C62", hair: "#1A1614", hairShade: "#3A302A", hairStyle: "short" as const };
const SAM: Look = { ...SAM_BASE, ...UNIFORM };
const SAM_GREY: Look = { ...SAM_BASE, ...UNIFORM_GREY };

const DAD: Look = {
  skin: "#E6B48F", skinShade: "#CC9A74", hair: "#4A3526", hairShade: "#6B5040", hairStyle: "short",
  top: "#5B6B82", topShade: "#435167", topStyle: "jumper", collar: "#DDE3EA",
  bottom: "#3A3F4C", bottomStyle: "pants", shoes: "#3B2F28",
};
const MUM: Look = {
  skin: "#EDC3A0", skinShade: "#D3A27D", hair: "#7A5034", hairShade: "#9A6A48", hairStyle: "bob",
  top: "#B9786A", topShade: "#975A4E", topStyle: "cardigan",
  bottom: "#4A4050", bottomStyle: "pants", shoes: "#3B2F28",
};

/* ------------------------------------------------------------ helpers -- */

/** Fades its children in (or out) at a given second of the scene. */
function Fade({ at, dur = 0.6, out = false, children }: { at: number; dur?: number; out?: boolean; children: ReactNode }) {
  return (
    <g className={out ? "fws-out" : "fws-in"} style={{ animationDelay: `${at}s`, animationDuration: `${dur}s` }}>
      {children}
    </g>
  );
}

/** Pops a bubble or card in at a given second. */
function Pop({ at, children }: { at: number; children: ReactNode }) {
  return (
    <g className="fws-pop" style={{ animationDelay: `${at}s` }}>
      {children}
    </g>
  );
}

function Vignette({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx="50%" cy="45%" r="75%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
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

/** A chat message: grey coming in, teal going out. */
function Msg({ x, y, w, text, out = false }: { x: number; y: number; w: number; text: string; out?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="24" rx="12" fill={out ? "#2E8C7A" : "#E6E8EE"} />
      <text x={x + 11} y={y + 16} fontSize="12" fill={out ? "#FFFFFF" : "#1E1A24"}>
        {text}
      </text>
    </g>
  );
}

/** A lock-screen notification. */
function Notice({ x, y, w, from, text }: { x: number; y: number; w: number; from: string; text: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="38" rx="10" fill="#FFFFFF" stroke="#E2E4EA" />
      <rect x="8" y="8" width="22" height="22" rx="6" fill="#34C27A" />
      <path d="M13.5 14 h11 v7.5 h-6.5 l-3 3 v-3 h-1.5 z" fill="#FFFFFF" />
      <text x="38" y="17" fontSize="10" fontWeight="700" fill="#1E1A24">{from}</text>
      <text x="38" y="30" fontSize="11.5" fill="#3A3F4C">{text}</text>
    </g>
  );
}

/** The dog in the hoodie, as a photo in a chat. */
function DogPhoto({ w = 112, h = 64 }: { w?: number; h?: number }) {
  return (
    <g>
      <rect width={w} height={h} rx="12" fill="#BFE0EF" />
      <path d={`M0 ${h * 0.62} H${w} V${h - 12} Q${w} ${h} ${w - 12} ${h} H12 Q0 ${h} 0 ${h - 12} Z`} fill="#A9CF8A" />
      <g transform={`translate(${w / 2} ${h - 2})`}>
        <path d="M-22 0 C-22 -20 22 -20 22 0 Z" fill="#E8743B" />
        <path d="M-2.5 -14 L-3.5 -6 M2.5 -14 L3.5 -6" stroke="#FBE3D2" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="0" cy="-26" r="15" fill="#E8743B" />
        <ellipse cx="-10.5" cy="-23" rx="4" ry="8" fill="#8B5733" transform="rotate(14 -10.5 -23)" />
        <ellipse cx="10.5" cy="-23" rx="4" ry="8" fill="#8B5733" transform="rotate(-14 10.5 -23)" />
        <circle cx="0" cy="-26" r="10.5" fill="#C98A55" />
        <ellipse cx="0" cy="-21" rx="6" ry="4.5" fill="#EBC59A" />
        <ellipse cx="0" cy="-23" rx="2.4" ry="1.7" fill="#1E1512" />
        <circle cx="-4.4" cy="-29" r="1.5" fill="#1E1512" />
        <circle cx="4.4" cy="-29" r="1.5" fill="#1E1512" />
        <path d="M-1.6 -18.5 q1.6 4.2 3.2 0 z" fill="#E86A7A" />
      </g>
    </g>
  );
}

/** Over-ear headphones, drawn on the rig's head coordinates. */
function Headphones() {
  return (
    <g>
      <path d="M-13.5 -138 C-15 -164 15 -164 13.5 -138" stroke="#22252E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="-16.5" y="-143" width="6" height="12" rx="3" fill="#2E323D" />
      <rect x="10.5" y="-143" width="6" height="12" rx="3" fill="#2E323D" />
    </g>
  );
}

function Chips() {
  return (
    <g transform="translate(0 -9)">
      <path d="M-9 -12 L9 -12 L8 12 L-8 12 Z" fill="#F4C430" />
      <rect x="-9" y="-12" width="18" height="3.5" fill="#D9A520" />
      <rect x="-8.6" y="-3" width="17.2" height="8" fill="#D9423A" />
      <ellipse cx="0" cy="1" rx="4" ry="2.4" fill="#F7E27A" />
    </g>
  );
}

function Footy() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="10.5" ry="6.8" fill="#9A4A22" />
      <ellipse cx="-2" cy="-2.2" rx="5" ry="2" fill="#B8622F" opacity="0.7" />
      <path d="M-4.5 0 H4.5" stroke="#FFFFFF" strokeWidth="1.2" />
      <path d="M-2.5 -1.8 V1.8 M0 -1.8 V1.8 M2.5 -1.8 V1.8" stroke="#FFFFFF" strokeWidth="0.8" />
    </g>
  );
}

/** A phone seen from the back, as it sits in someone's hands. */
function PhoneBack({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-6" y="-9" width="12" height="18" rx="2.4" fill="#1F2430" />
      <circle cx="-2.6" cy="-5.6" r="1.3" fill="#3A4152" />
    </g>
  );
}

/* ----------------------------------------------------------- settings -- */

function SchoolYard({ skyId }: { skyId: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9D2F0" />
          <stop offset="1" stopColor="#E3F1FA" />
        </linearGradient>
      </defs>
      <rect width="480" height="300" fill={`url(#${skyId})`} />
      {/* the school */}
      <rect y="86" width="480" height="124" fill="#E6D3B3" />
      <rect y="76" width="480" height="12" fill="#9B4A3A" />
      {[0, 1].map((r) =>
        Array.from({ length: 9 }, (_, c) => (
          <rect key={`${r}${c}`} x={14 + c * 54} y={102 + r * 46} width="34" height="30" rx="2" fill="#CFE0EC" stroke="#C2AE8C" strokeWidth="2" />
        ))
      )}
      {/* the quad */}
      <rect y="206" width="480" height="94" fill="#CFCAC1" />
      <rect y="206" width="480" height="5" fill="#B9B3A8" />
      <path d="M-20 290 Q240 236 500 290" stroke="#F2EFE8" strokeWidth="3" fill="none" opacity="0.8" />
    </g>
  );
}

/** The back of Jonah's house: weatherboards, the back door, and the step. */
function BackOfHouse() {
  return (
    <g>
      <rect y="34" width="480" height="226" fill="#D5E0E6" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M0 ${48 + i * 14} H480`} stroke="#BFCDD5" strokeWidth="1.4" />
      ))}
      <rect y="28" width="480" height="8" fill="#8F9BA6" />
      {/* back door, screen door shut */}
      <rect x="194" y="66" width="92" height="142" fill="#EEF2F4" />
      <rect x="200" y="72" width="80" height="136" fill="#55656F" />
      <path d="M200 124 H280" stroke="#47555E" strokeWidth="2" />
      <path d="M210 82 L270 82 M210 134 L270 134" stroke="#6B7C86" strokeWidth="1" opacity="0.6" />
      <rect x="200" y="72" width="80" height="136" fill="none" stroke="#3F4B53" strokeWidth="3" />
      <circle cx="270" cy="146" r="2.5" fill="#C9D2D8" />
      {/* window */}
      <rect x="350" y="70" width="96" height="76" fill="#EEF2F4" />
      <rect x="356" y="76" width="84" height="64" fill="#A9C9DE" />
      <path d="M398 76 V140" stroke="#EEF2F4" strokeWidth="3" />
      <path d="M362 112 l26 -30 M372 138 l40 -46" stroke="#FFFFFF" strokeWidth="3" opacity="0.35" />
      {/* tap, and a pot plant */}
      <rect x="104" y="170" width="6" height="12" rx="1" fill="#9AA5AE" />
      <rect x="98" y="166" width="18" height="5" rx="2" fill="#B5BEC5" />
      <path d="M60 224 L96 224 L91 256 L65 256 Z" fill="#C2704A" />
      <rect x="57" y="220" width="42" height="7" rx="2" fill="#D7845C" />
      <g fill="#5E9E5A">
        <ellipse cx="70" cy="206" rx="7" ry="16" transform="rotate(-24 70 206)" />
        <ellipse cx="86" cy="204" rx="7" ry="17" transform="rotate(22 86 204)" />
        <ellipse cx="78" cy="198" rx="6" ry="19" />
      </g>
      {/* lawn */}
      <rect y="250" width="480" height="50" fill="#8DBA6A" />
      <path d="M0 268 H480 M0 286 H480" stroke="#7FAE5D" strokeWidth="2" opacity="0.6" />
      {/* the back step */}
      <rect x="124" y="232" width="232" height="24" rx="2" fill="#B9B2A6" />
      <rect x="124" y="232" width="232" height="5" fill="#CEC8BE" />
      <rect x="140" y="206" width="200" height="27" rx="2" fill="#C4BDB2" />
      <rect x="140" y="206" width="200" height="5" fill="#D8D2C9" />
      {/* thongs, kicked off */}
      <ellipse cx="322" cy="241" rx="5" ry="9" fill="#3E7CB1" transform="rotate(70 322 241)" />
      <ellipse cx="338" cy="243" rx="5" ry="9" fill="#3E7CB1" transform="rotate(84 338 243)" />
    </g>
  );
}

/* -------------------------------------------------------------- scenes -- */

function SceneSplit() {
  // Front-on stairs, each step a little narrower as it climbs.
  const steps = Array.from({ length: 8 }, (_, k) => ({ y: 217 - 19 * k, x0: 24 + 3 * k, x1: 152 - 3 * k }));
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="fws1-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E4DCEB" />
          <stop offset="1" stopColor="#CFC4DC" />
        </linearGradient>
        <linearGradient id="fws1-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4C4F86" />
          <stop offset="0.7" stopColor="#D98C79" />
          <stop offset="1" stopColor="#F2B88A" />
        </linearGradient>
        <radialGradient id="fws1-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE3A6" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FFE3A6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="fws-cam">
        <rect width="480" height="300" fill="url(#fws1-wall)" />
        {/* window at dusk */}
        <rect x="292" y="50" width="84" height="80" rx="3" fill="#F3EDF6" />
        <rect x="298" y="56" width="72" height="68" fill="url(#fws1-dusk)" />
        <path d="M334 56 V124 M298 90 H370" stroke="#F3EDF6" strokeWidth="3" />
        {/* floor */}
        <rect y="236" width="480" height="64" fill="#8E7562" />
        <path d="M0 254 H480 M0 274 H480 M0 292 H480" stroke="#7C6453" strokeWidth="1.2" />
        <rect y="232" width="480" height="6" fill="#B8A595" />
        {/* the stairs, and Jonah on them, listening */}
        <rect x="45" y="44" width="86" height="40" fill="#7E7290" />
        {steps.map(({ y, x0, x1 }) => (
          <g key={y}>
            <rect x={x0} y={y} width={x1 - x0} height="19" fill="#A58A76" />
            <rect x={x0 - 2} y={y} width={x1 - x0 + 4} height="4" fill="#C4AB97" />
          </g>
        ))}
        <g stroke="#6E5646" strokeLinecap="round">
          {steps.map(({ y, x1 }) => (
            <path key={y} d={`M${x1 + 3} ${y} V${y - 30}`} strokeWidth="2.4" />
          ))}
          <path d={`M155 187 L${152 - 21 + 3} 54`} strokeWidth="5" />
        </g>
        <rect x="150" y="180" width="10" height="56" rx="2" fill="#6E5646" />
        <rect x="147" y="174" width="16" height="8" rx="3" fill="#5C4738" />
        <g transform="translate(88 244) scale(0.9)">
          <Figure look={JONAH} expression="worried" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
        </g>
        {/* Mum at the table, under the lamp */}
        <circle cx="240" cy="100" r="96" fill="url(#fws1-lamp)" className="fws-lamp" />
        <g transform="translate(240 262) scale(0.9)">
          <Figure look={MUM} expression="worried" upper leftArm={{ a: 14, b: -84 }} rightArm={{ a: 14, b: -84 }} />
        </g>
        <rect x="172" y="194" width="136" height="9" rx="3" fill="#A9825E" />
        <rect x="182" y="203" width="7" height="46" fill="#8F6C4D" />
        <rect x="291" y="203" width="7" height="46" fill="#8F6C4D" />
        <g>
          <rect x="200" y="181" width="13" height="13" rx="2" fill="#F8FAFC" stroke="#94A3B8" />
          <path d="M213 184 q5 0 5 4 q0 3 -5 3" stroke="#94A3B8" fill="none" />
        </g>
        <g className="fws-mug-gone">
          <rect x="266" y="181" width="13" height="13" rx="2" fill="#F8FAFC" stroke="#94A3B8" />
          <path d="M279 184 q5 0 5 4 q0 3 -5 3" stroke="#94A3B8" fill="none" />
        </g>
        <path d="M240 0 V58" stroke="#5A4A5E" strokeWidth="2" />
        <path d="M222 74 L258 74 L250 58 L230 58 Z" fill="#E9C77A" />
        {/* the front door, open to the evening */}
        <rect x="394" y="82" width="68" height="154" fill="#EDE6EE" />
        <rect x="400" y="88" width="56" height="148" fill="#383C64" />
        <circle cx="440" cy="118" r="5" fill="#F7D9A0" opacity="0.85" />
        {/* Dad, with a box of his things, heading out */}
        <g transform="translate(0 256)">
          <g className="fws-dad">
            <g transform="scale(0.92)">
              <g className="fws-step">
                <Figure
                  look={DAD}
                  expression="flat"
                  leftArm={{ a: 16, b: -98 }}
                  rightArm={{ a: 16, b: -98 }}
                  leftLeg={{ a: 14, cls: "fws-leg-a" }}
                  rightLeg={{ a: -14, cls: "fws-leg-b" }}
                />
                <rect x="-6" y="-118" width="5" height="16" fill="#3E6FA8" />
                <rect x="0" y="-114" width="6" height="12" fill="#C2563A" />
                <rect x="-23" y="-104" width="46" height="31" rx="1.5" fill="#C79A5E" />
                <path d="M-23 -104 L-14 -110 L14 -110 L23 -104" fill="#B5884D" />
                <rect x="-23" y="-92" width="46" height="5" fill="#E6C88F" opacity="0.8" />
              </g>
            </g>
          </g>
        </g>
        <g className="fws-shut">
          <rect x="400" y="88" width="56" height="148" fill="#7B5D49" />
          <rect x="408" y="98" width="40" height="56" rx="2" fill="none" stroke="#694D3B" strokeWidth="2" />
          <rect x="408" y="166" width="40" height="58" rx="2" fill="none" stroke="#694D3B" strokeWidth="2" />
          <circle cx="408" cy="162" r="3" fill="#E7C98F" />
        </g>
        {/* and the house goes quiet in a new way */}
        <rect width="480" height="300" fill="#4F64A0" className="fws-cool" />
      </g>
      <Vignette id="fws1-vig" />
    </svg>
  );
}

function SceneDrift() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <g className="fws-cam">
        <SchoolYard skyId="fws2-sky" />
        {/* the tree his mates still sit under */}
        <rect x="62" y="110" width="16" height="110" fill="#7A5A3E" />
        <circle cx="70" cy="92" r="54" fill="#5E9E5A" />
        <circle cx="34" cy="110" r="32" fill="#6FAE66" />
        <circle cx="112" cy="104" r="34" fill="#4F8E4C" />
        <g transform="translate(66 262) scale(0.98)">
          <g className="fws-bob">
            <Figure look={SAM} expression="laugh" rightArm={{ a: 24, b: -60 }} />
          </g>
        </g>
        <g transform="translate(150 262) scale(0.98)">
          <g className="fws-bob-late">
            <Fade at={4.6} out>
              <Figure look={LEON_SCHOOL} expression="laugh" leftArm={{ a: 22, b: -50 }} />
            </Fade>
            <Fade at={4.6}>
              <Figure look={LEON_SCHOOL} expression="worried" leftArm={{ a: 22, b: -50 }} />
            </Fade>
          </g>
        </g>
        <text x="96" y="66" fontSize="17" fontWeight="800" fill="#FFFFFF" className="fws-haha">haha</text>
        {/* Jonah: "just tired", headphones on, and off he goes, fading */}
        <g transform="translate(0 262)">
          <g className="fws-drift">
            <g transform="scale(0.98)">
              <g className="fws-step-late">
                <Figure
                  look={JONAH_SCHOOL_GREY}
                  expression="flat"
                  leftLeg={{ a: 0, cls: "fws-leg-a-late" }}
                  rightLeg={{ a: 0, cls: "fws-leg-b-late" }}
                  leftArm={{ a: 6, b: 6, cls: "fws-arm-a-late" }}
                  rightArm={{ a: 6, b: 6, cls: "fws-arm-b-late" }}
                />
                <g className="fws-drain">
                  <Figure
                    look={JONAH_SCHOOL}
                    expression="flat"
                    leftLeg={{ a: 0, cls: "fws-leg-a-late" }}
                    rightLeg={{ a: 0, cls: "fws-leg-b-late" }}
                    leftArm={{ a: 6, b: 6, cls: "fws-arm-a-late" }}
                    rightArm={{ a: 6, b: 6, cls: "fws-arm-b-late" }}
                  />
                </g>
                <Fade at={2.2}>
                  <Headphones />
                </Fade>
              </g>
            </g>
          </g>
        </g>
        <Fade at={2.6} out>
          <Pop at={0.5}>
            <Bubble x={214} y={46} w={110} text="just tired." tail="left" italic />
          </Pop>
        </Fade>
        <Pop at={4.6}>
          <Notice x={270} y={12} w={196} from="Jonah" text="can't make sat, sorry" />
        </Pop>
        <Pop at={6.6}>
          <Notice x={270} y={56} w={196} from="Jonah" text="nah not this sat either" />
        </Pop>
      </g>
      <Vignette id="fws2-vig" />
    </svg>
  );
}

function SceneTexts() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <radialGradient id="fws3-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#A8CCFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#A8CCFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="fws-cam">
        {/* his room, late */}
        <rect width="480" height="300" fill="#262D48" />
        <rect x="26" y="30" width="80" height="80" rx="3" fill="#3A4366" />
        <rect x="31" y="35" width="70" height="70" fill="#1A2038" />
        <circle cx="78" cy="56" r="10" fill="#F2E6C2" />
        <circle cx="74" cy="53" r="9" fill="#1A2038" />
        <g fill="#F2E6C2">
          <circle cx="44" cy="48" r="1.2" />
          <circle cx="58" cy="78" r="1" />
          <circle cx="88" cy="90" r="1.2" />
        </g>
        <path d="M66 35 V105 M31 70 H101" stroke="#3A4366" strokeWidth="3" />
        <rect x="150" y="44" width="56" height="72" rx="2" fill="#3C3560" />
        <circle cx="178" cy="72" r="14" fill="#8C5A7A" opacity="0.6" />
        <path d="M158 104 H198" stroke="#8C5A7A" strokeWidth="3" opacity="0.6" />
        <rect x="36" y="150" width="200" height="70" rx="10" fill="#3A3354" />
        {/* Jonah on his bed, lit by the phone */}
        <g transform="translate(134 272) scale(1.12)">
          <Figure look={JONAH_GREY} expression="flat" upper leftArm={{ a: 20, b: -85 }} rightArm={{ a: 20, b: -85 }} />
          <PhoneBack x={0} y={-84} />
          <ellipse cx="0" cy="-128" rx="34" ry="38" fill="url(#fws3-glow)" className="fws-screen" />
        </g>
        <path d="M0 214 C60 204 160 206 252 212 L262 300 L0 300 Z" fill="#4A5B8C" />
        <path d="M30 236 C80 230 140 232 190 240 M60 264 C110 258 170 262 230 270" stroke="#3D4D7A" strokeWidth="3" fill="none" />
        {/* what's on it */}
        <rect x="258" y="10" width="206" height="284" rx="24" fill="#14171F" />
        <rect x="266" y="18" width="190" height="268" rx="18" fill="#F7F7FA" />
        <circle cx="292" cy="40" r="11" fill="#6B4226" />
        <g fill="#151110">
          <circle cx="285" cy="33" r="4.5" />
          <circle cx="292" cy="30" r="5" />
          <circle cx="299" cy="33" r="4.5" />
        </g>
        <text x="311" y="44" fontSize="13" fontWeight="700" fill="#1E1A24">Leon</text>
        <path d="M266 60 H456" stroke="#E2E4EA" />
        <Pop at={0.4}>
          <g transform="translate(276 68)">
            <DogPhoto w={112} h={64} />
          </g>
        </Pop>
        <Pop at={1.7}>
          <Msg x={276} y={140} w={108} text="bro. the hoodie" />
        </Pop>
        <Pop at={3.1}>
          <Msg x={276} y={170} w={98} text="u coming sat?" />
        </Pop>
        <Pop at={4.6}>
          <Msg x={276} y={200} w={112} text="ok next sat then" />
        </Pop>
        <Pop at={6}>
          <Msg x={276} y={230} w={132} text="anyway. another dog" />
        </Pop>
        {/* he starts a reply, and deletes it */}
        <rect x="274" y="260" width="174" height="20" rx="10" fill="#FFFFFF" stroke="#DADCE3" />
        <text x="285" y="274" fontSize="11" fill="#A0A4AE" className="fws-placeholder">Message</text>
        <text x="285" y="274" fontSize="11" fill="#1E1A24" className="fws-typed">sorry i</text>
      </g>
      <Vignette id="fws3-vig" />
    </svg>
  );
}

function SceneDoor() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <g className="fws-cam">
        <rect width="480" height="300" fill="#BFDDF2" />
        {/* the front of Jonah's house */}
        <rect y="30" width="480" height="240" fill="#EADBC4" />
        {Array.from({ length: 17 }, (_, i) => (
          <path key={i} d={`M0 ${44 + i * 14} H480`} stroke="#D9C7AC" strokeWidth="1.4" />
        ))}
        <rect y="22" width="480" height="10" fill="#7A6A5C" />
        <rect x="34" y="88" width="112" height="90" fill="#F6F0E6" />
        <rect x="40" y="94" width="100" height="78" fill="#9FC1D8" />
        <path d="M90 94 V172" stroke="#F6F0E6" strokeWidth="3" />
        <path d="M48 140 l28 -34 M98 166 l36 -44" stroke="#FFFFFF" strokeWidth="3" opacity="0.35" />
        {/* doorway: dim inside, Jonah there once it opens */}
        <rect x="186" y="88" width="108" height="160" fill="#F6F0E6" />
        <rect x="194" y="96" width="92" height="152" fill="#3F3B4C" />
        <rect x="226" y="110" width="28" height="44" fill="#57526A" />
        <g transform="translate(240 248) scale(0.86)">
          <Fade at={5.4} out>
            <Figure look={JONAH_GREY} expression="flat" />
          </Fade>
          <Fade at={5.4}>
            <Figure look={JONAH_GREY} expression="soft" />
          </Fade>
        </g>
        <g className="fws-door-open">
          <rect x="194" y="96" width="92" height="152" fill="#2F6F73" />
          <rect x="206" y="108" width="68" height="56" rx="2" fill="none" stroke="#24585C" strokeWidth="2.4" />
          <rect x="206" y="176" width="68" height="60" rx="2" fill="none" stroke="#24585C" strokeWidth="2.4" />
          <circle cx="274" cy="172" r="3.5" fill="#E7C98F" />
        </g>
        <rect x="302" y="164" width="8" height="12" rx="2" fill="#F6F0E6" stroke="#C9B89E" />
        <circle cx="306" cy="170" r="2" fill="#C9B89E" />
        <text x="314" y="150" fontSize="14" fontWeight="800" fill="#B45309" className="fws-ding">ding dong</text>
        {/* steps, pot plant, lawn */}
        <rect x="176" y="248" width="128" height="10" fill="#B9AFA3" />
        <rect x="166" y="258" width="148" height="12" fill="#A89E91" />
        <path d="M144 226 L170 226 L166 256 L148 256 Z" fill="#C2704A" />
        <g fill="#5E9E5A">
          <ellipse cx="150" cy="212" rx="6" ry="14" transform="rotate(-22 150 212)" />
          <ellipse cx="164" cy="210" rx="6" ry="15" transform="rotate(20 164 210)" />
          <ellipse cx="157" cy="204" rx="5" ry="16" />
        </g>
        <rect y="268" width="480" height="32" fill="#A9C38D" />
        <path d="M206 270 L274 270 L292 300 L188 300 Z" fill="#D8CFC2" />
        {/* the bike he rode over on — twenty minutes */}
        <g stroke="#2E3446" strokeWidth="3" fill="none">
          <circle cx="414" cy="270" r="19" />
          <circle cx="466" cy="270" r="19" />
        </g>
        <path d="M414 270 L436 238 L458 238 L466 270 M436 238 L446 270 L458 238 M432 230 H442 M456 238 L452 226 H462" stroke="#E8743B" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Leon on the path, chips and a footy */}
        <g transform="translate(354 290) scale(1.06)">
          <Figure
            look={LEON}
            expression="smile"
            leftArm={{ a: 24, b: -70 }}
            rightArm={{ a: 12, b: -40 }}
            leftHand={
              <g transform="rotate(46)">
                <Chips />
              </g>
            }
            rightHand={
              <g transform="translate(0 -2) rotate(28)">
                <Footy />
              </g>
            }
          />
        </g>
        <Pop at={4.4}>
          <Bubble x={300} y={58} w={150} text="I was in the area." tail="left" />
        </Pop>
      </g>
      <Vignette id="fws4-vig" />
    </svg>
  );
}

function SceneStep() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="fws5-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FCBEA" />
          <stop offset="1" stopColor="#DCEDF7" />
        </linearGradient>
      </defs>
      <g className="fws-cam">
        <rect width="480" height="300" fill="url(#fws5-sky)" />
        <BackOfHouse />
        {/* an hour goes by: the light slides across the wall */}
        <path d="M0 34 L70 34 L-20 250 L-90 250 Z" fill="#FFF6DA" opacity="0.28" className="fws-beam" />
        <g transform="translate(200 285) scale(1.1)">
          <Figure look={JONAH_GREY} expression="flat" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
          <g opacity="0.35">
            <Fade at={2} dur={7}>
              <Figure look={JONAH} expression="flat" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
            </Fade>
          </g>
        </g>
        <g transform="translate(280 285) scale(1.1)">
          <Figure
            look={LEON}
            expression="soft"
            seated
            leftArm={{ a: 10, b: -50 }}
            rightArm={{ a: 18, b: -60, clsLower: "fws-flick" }}
          />
        </g>
        <g transform="translate(287 204)">
          <g className="fws-toss">
            <Footy />
          </g>
        </g>
        <rect width="480" height="300" fill="#FFB25B" className="fws-warm" />
      </g>
      <Vignette id="fws5-vig" />
    </svg>
  );
}

function SceneSaid() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="fws6-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B27A" />
          <stop offset="1" stopColor="#FBE0B8" />
        </linearGradient>
      </defs>
      <g className="fws-cam">
        {/* closer now, late afternoon */}
        <g transform="translate(240 190) scale(1.3) translate(-240 -190)">
          <rect width="480" height="300" fill="url(#fws6-sky)" />
          <BackOfHouse />
          <g transform="translate(200 285) scale(1.1)">
            <Figure
              look={JONAH_GREY}
              expression="worried"
              seated
              leftArm={{ a: 10, b: -50 }}
              rightArm={{ a: 10, b: -50, cls: "fws-take", clsLower: "fws-take-lower" }}
            />
            <g opacity="0.75">
              <g className="fws-fill">
                <Figure
                  look={JONAH}
                  expression="worried"
                  seated
                  leftArm={{ a: 10, b: -50 }}
                  rightArm={{ a: 10, b: -50, cls: "fws-take", clsLower: "fws-take-lower" }}
                />
              </g>
            </g>
          </g>
          <g transform="translate(280 285) scale(1.1)">
            <Figure
              look={LEON}
              expression="soft"
              seated
              headCls="fws-nod"
              rightArm={{ a: 10, b: -50 }}
              leftArm={{ a: 10, b: -50, cls: "fws-offer", clsLower: "fws-offer-lower" }}
              leftHand={
                <g className="fws-offer-chips">
                  <Chips />
                </g>
              }
            />
          </g>
          <rect width="480" height="300" fill="#FF9F4A" opacity="0.12" />
        </g>
        <Pop at={1.4}>
          <Bubble x={22} y={40} w={150} text="“Dad moved out.”" tail="right" />
        </Pop>
        <Pop at={4.6}>
          <Bubble x={240} y={28} w={214} text="“Figured it was something.”" tail="left" italic />
        </Pop>
      </g>
      <Vignette id="fws6-vig" />
    </svg>
  );
}

function SceneStayed() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <radialGradient id="fws7-bg" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#FFF3DC" />
          <stop offset="1" stopColor="#F4CF98" />
        </radialGradient>
        <radialGradient id="fws7-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFD56B" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFD56B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="fws-cam">
        <rect width="480" height="300" fill="url(#fws7-bg)" />
        {/* every message he left on read, still there */}
        <g opacity="0.7">
          <Fade at={0.3} dur={1}>
            <g className="fws-float">
              <Msg x={22} y={52} w={108} text="bro. the hoodie" />
            </g>
          </Fade>
          <Fade at={0.9} dur={1}>
            <g className="fws-float-late">
              <Msg x={344} y={36} w={98} text="u coming sat?" />
            </g>
          </Fade>
          <Fade at={1.5} dur={1}>
            <g className="fws-float">
              <Msg x={16} y={142} w={112} text="ok next sat then" />
            </g>
          </Fade>
          <Fade at={2.1} dur={1}>
            <g className="fws-float-late">
              <Msg x={330} y={112} w={132} text="anyway. another dog" />
            </g>
          </Fade>
          <Fade at={2.7} dur={1}>
            <g className="fws-float">
              <g transform="translate(26 200)">
                <DogPhoto w={92} h={54} />
              </g>
            </g>
          </Fade>
        </g>
        <circle cx="200" cy="180" r="120" fill="url(#fws7-halo)" className="fws-halo" />
        <ellipse cx="240" cy="266" rx="150" ry="11" fill="#E3AE72" opacity="0.5" />
        {/* Jonah, faint, filling back in */}
        <g transform="translate(200 262) scale(1.05)">
          <g className="fws-ghost">
            <Figure look={JONAH_GREY} expression="flat" />
          </g>
          <Fade at={3} dur={2.6}>
            <Figure look={JONAH} expression="smile" />
          </Fade>
        </g>
        {/* Leon, arriving, and staying */}
        <g transform="translate(0 262)">
          <g className="fws-arrive">
            <g transform="scale(1.05)">
              <Figure
                look={LEON}
                expression="smile"
                leftLeg={{ a: 0, cls: "fws-leg-a-in" }}
                rightLeg={{ a: 0, cls: "fws-leg-b-in" }}
                leftArm={{ a: 8, b: 6, cls: "fws-hug", clsLower: "fws-hug-lower" }}
              />
            </g>
          </g>
        </g>
      </g>
      <Vignette id="fws7-vig" />
    </svg>
  );
}

function SceneNow() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <g className="fws-cam">
        <SchoolYard skyId="fws8-sky" />
        {/* the bench */}
        <rect x="300" y="220" width="160" height="10" rx="3" fill="#A9825E" />
        <rect x="300" y="202" width="160" height="8" rx="3" fill="#B8916B" />
        <rect x="312" y="230" width="7" height="38" fill="#8F6C4D" />
        <rect x="442" y="230" width="7" height="38" fill="#8F6C4D" />
        {/* Leon and Jonah, solid, phone out */}
        <g transform="translate(48 266)">
          <g className="fws-bob-late">
            <Figure look={LEON_SCHOOL} expression="laugh" leftArm={{ a: 20, b: -40 }} />
          </g>
        </g>
        <g transform="translate(124 266)">
          <Figure look={JONAH_SCHOOL} expression="smile" rightArm={{ a: 14, b: -120 }} />
          <PhoneBack x={-4} y={-100} />
        </g>
        <Pop at={1}>
          <g transform="translate(176 34)">
            <DogPhoto w={104} h={60} />
          </g>
        </Pop>
        <Pop at={2.2}>
          <Msg x={176} y={100} w={136} text="sam. look at this dog" out />
        </Pop>
        {/* Sam, on his own, gone quiet — then the phone goes */}
        <g transform="translate(384 294) scale(0.95)">
          <Figure look={SAM_GREY} expression="flat" seated leftArm={{ a: 10, b: -60 }} rightArm={{ a: 10, b: -60 }} />
          <Fade at={5.4} dur={0.8}>
            <Figure look={SAM_GREY} expression="soft" seated leftArm={{ a: 10, b: -60 }} rightArm={{ a: 10, b: -60 }} />
          </Fade>
          <g opacity="0.55">
            <Fade at={5.4} dur={2.4}>
              <Figure look={SAM} expression="soft" seated leftArm={{ a: 10, b: -60 }} rightArm={{ a: 10, b: -60 }} />
            </Fade>
          </g>
          <Headphones />
          <g className="fws-buzz">
            <PhoneBack x={0} y={-74} />
          </g>
          <g className="fws-buzz-lines">
            <path d="M12 -82 l5 -3 M12 -74 h6 M12 -66 l5 3" stroke="#2E8C7A" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>
        <Pop at={7.2}>
          <g transform="translate(356 96)">
            <rect width="58" height="28" rx="14" fill="#E6E8EE" />
            <path d="M18 27 L14 37 L26 27 Z" fill="#E6E8EE" />
            {[17, 29, 41].map((cx, i) => (
              <circle key={cx} cx={cx} cy="14" r="3.2" fill="#8A90A0" className="fws-dot" style={{ animationDelay: `${i * 0.18}s` }} />
            ))}
          </g>
        </Pop>
      </g>
      <Vignette id="fws8-vig" />
    </svg>
  );
}

function Poster() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="fws0-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B27A" />
          <stop offset="1" stopColor="#FBE0B8" />
        </linearGradient>
      </defs>
      <rect width="480" height="300" fill="url(#fws0-sky)" />
      <BackOfHouse />
      <g transform="translate(200 285) scale(1.1)">
        <Figure look={JONAH_GREY} expression="soft" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
        <g opacity="0.5">
          <Figure look={JONAH} expression="soft" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 10, b: -50 }} />
        </g>
      </g>
      <g transform="translate(280 285) scale(1.1)">
        <Figure look={LEON} expression="smile" seated leftArm={{ a: 10, b: -50 }} rightArm={{ a: 18, b: -60 }} />
      </g>
      <g transform="translate(287 205) rotate(-20)">
        <Footy />
      </g>
      <rect width="480" height="300" fill="#FF9F4A" opacity="0.12" />
      <Vignette id="fws0-vig" />
    </svg>
  );
}

/* -------------------------------------------------------------- script -- */

const SCENES: FilmScene[] = [
  {
    id: "split",
    art: <SceneSplit />,
    duration: 9000,
    caption:
      "In the middle of Year 9, Jonah's parents split up. His dad moved into a flat across town, and the house went quiet in a new way. Jonah didn't tell anyone at school. Not even Leon.",
  },
  {
    id: "drift",
    art: <SceneDrift />,
    duration: 9000,
    caption:
      "He got quieter. He said he was “just tired”. He cancelled on Saturday, then the Saturday after. He'd seen how it went when things got hard for someone — people drifted. So he started drifting first.",
  },
  {
    id: "texts",
    art: <SceneTexts />,
    duration: 9000,
    caption:
      "Leon didn't take the hint. He kept texting — never about anything. A dog in a hoodie. Who was coming on Saturday. Jonah left most of them on read. Leon kept sending them anyway.",
  },
  {
    id: "door",
    art: <SceneDoor />,
    duration: 8500,
    caption:
      "Then one Saturday, the doorbell. Leon was standing there with a packet of chips and a footy. “I was in the area,” he said. He lived twenty minutes away.",
  },
  {
    id: "step",
    art: <SceneStep />,
    duration: 9500,
    caption:
      "They sat on the back step for an hour. Kicked the footy against the fence a bit. Mostly didn't talk. Leon didn't ask what was wrong, and he didn't say anything wise. He just stayed.",
  },
  {
    id: "said",
    art: <SceneSaid />,
    duration: 9500,
    caption:
      "Near the end, without planning to, Jonah said it: “Dad moved out.” Leon nodded. “Figured it was something.” Then he passed the chips. That was the whole conversation. It was enough.",
  },
  {
    id: "stayed",
    art: <SceneStayed />,
    duration: 8500,
    caption:
      "Later, Jonah worked out what that afternoon had been. Not someone rescuing him — nobody fixed anything. Just someone refusing to let him disappear.",
  },
  {
    id: "now",
    art: <SceneNow />,
    duration: 10000,
    caption:
      "He's never told Leon what it meant. He still hasn't. But these days, when a mate goes quiet, Jonah's the one who keeps sending the dog videos.",
  },
];

export default function FriendWhoStayedFilm({ storyId }: { storyId: string }) {
  return <FilmPlayer storyId={storyId} scenes={SCENES} poster={<Poster />} css={RIG_CSS + FILM_CSS} />;
}

/* --------------------------------------------------------------- style -- */

const FILM_CSS = `
.fws-cam { transform-origin: 240px 150px; animation: fws-cam 9s ease-out both; }
@keyframes fws-cam { from { transform: scale(1); } to { transform: scale(1.06); } }

/* timing comes from the inline animation-delay on each element */
.fws-in { animation: fws-in 0.6s ease both; }
.fws-out { animation: fws-out 0.6s ease both; }
@keyframes fws-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fws-out { from { opacity: 1; } to { opacity: 0; } }
.fws-pop { transform-box: fill-box; transform-origin: center; animation: fws-pop 0.5s cubic-bezier(.2,.9,.3,1.3) both; }
@keyframes fws-pop { from { opacity: 0; transform: scale(0.85) translateY(6px); } to { opacity: 1; transform: none; } }

/* idle life */
.fws-bob { animation: fws-bob 0.8s ease-in-out infinite; }
.fws-bob-late { animation: fws-bob 0.8s ease-in-out 0.3s infinite; }
@keyframes fws-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.fws-haha { animation: fws-haha 2.4s ease-in-out 0.4s infinite; }
@keyframes fws-haha { 0%, 20% { opacity: 0; } 35%, 70% { opacity: 1; } 90%, 100% { opacity: 0; } }

/* walking */
.fws-step { animation: fws-step 0.55s ease-in-out infinite; }
@keyframes fws-step { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.fws-leg-a { animation: fws-leg 1.1s ease-in-out infinite; }
.fws-leg-b { animation: fws-leg 1.1s ease-in-out -0.55s infinite; }
@keyframes fws-leg { 0%, 100% { transform: rotate(16deg); } 50% { transform: rotate(-16deg); } }

/* the split */
.fws-dad { animation: fws-dad 9s linear both; }
@keyframes fws-dad {
  0%, 8% { transform: translateX(330px); opacity: 1; }
  64% { transform: translateX(418px); opacity: 1; }
  74%, 100% { transform: translateX(432px); opacity: 0; }
}
.fws-shut { transform-box: fill-box; transform-origin: right center; animation: fws-shut 9s ease-in-out both; }
@keyframes fws-shut { 0%, 75% { transform: scaleX(0.1); } 82%, 100% { transform: scaleX(1); } }
.fws-mug-gone { animation: fws-mug-gone 9s linear both; }
@keyframes fws-mug-gone { 0%, 74% { opacity: 1; } 84%, 100% { opacity: 0; } }
.fws-cool { animation: fws-cool 9s linear both; }
@keyframes fws-cool { 0%, 76% { opacity: 0; } 100% { opacity: 0.16; } }
.fws-lamp { animation: fws-lamp 9s linear both; }
@keyframes fws-lamp { 0%, 76% { opacity: 1; } 100% { opacity: 0.55; } }

/* the drift: he stands, then walks off and loses his colour */
.fws-drift { animation: fws-drift 9s ease-in-out both; }
@keyframes fws-drift {
  0%, 28% { transform: translateX(236px); opacity: 1; }
  96%, 100% { transform: translateX(424px); opacity: 0.7; }
}
.fws-drain { animation: fws-drain 9s linear both; }
@keyframes fws-drain { 0%, 32% { opacity: 1; } 80%, 100% { opacity: 0; } }
.fws-step-late { animation: fws-step 0.55s ease-in-out 2.5s infinite; }
.fws-leg-a-late { animation: fws-stride 1.1s ease-in-out 2.5s infinite; }
.fws-leg-b-late { animation: fws-stride-rev 1.1s ease-in-out 2.5s infinite; }
.fws-arm-a-late { animation: fws-swing-rev 1.1s ease-in-out 2.5s infinite; }
.fws-arm-b-late { animation: fws-swing 1.1s ease-in-out 2.5s infinite; }
@keyframes fws-stride { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(16deg); } 75% { transform: rotate(-16deg); } }
@keyframes fws-stride-rev { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-16deg); } 75% { transform: rotate(16deg); } }
@keyframes fws-swing { 0%, 100% { transform: rotate(6deg); } 25% { transform: rotate(16deg); } 75% { transform: rotate(-6deg); } }
@keyframes fws-swing-rev { 0%, 100% { transform: rotate(6deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(16deg); } }

/* the texts: the screen lights his face each time one lands */
.fws-screen { animation: fws-screen 9s linear both; }
@keyframes fws-screen {
  0%, 3% { opacity: 0.3; } 5% { opacity: 0.85; } 9%, 18% { opacity: 0.3; }
  20% { opacity: 0.85; } 24%, 33% { opacity: 0.3; } 35% { opacity: 0.85; }
  39%, 50% { opacity: 0.3; } 52% { opacity: 0.85; } 56%, 66% { opacity: 0.3; }
  68% { opacity: 0.85; } 72%, 100% { opacity: 0.3; }
}
.fws-typed { animation: fws-typed 9s linear both; }
@keyframes fws-typed { 0%, 79% { opacity: 0; } 81%, 91% { opacity: 1; } 93%, 100% { opacity: 0; } }
.fws-placeholder { animation: fws-placeholder 9s linear both; }
@keyframes fws-placeholder { 0%, 79% { opacity: 1; } 81%, 91% { opacity: 0; } 93%, 100% { opacity: 1; } }

/* the door */
.fws-door-open { transform-box: fill-box; transform-origin: left center; animation: fws-door 1s ease-out 2.6s both; }
@keyframes fws-door { from { transform: scaleX(1); } to { transform: scaleX(0.12); } }
.fws-ding { animation: fws-ding 1.6s ease 0.5s both; }
@keyframes fws-ding { 0% { opacity: 0; transform: translateY(6px); } 25%, 70% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; } }

/* the step: an hour of not much */
.fws-beam { animation: fws-beam 9.5s linear both; }
@keyframes fws-beam { from { transform: translateX(60px); } to { transform: translateX(520px); } }
.fws-warm { animation: fws-warm 9.5s linear both; }
@keyframes fws-warm { from { opacity: 0; } to { opacity: 0.14; } }
.fws-toss { animation: fws-toss 1.8s ease-in-out 0.8s 3 both; }
@keyframes fws-toss {
  0% { transform: translate(0, 0) rotate(0deg); }
  22% { transform: translate(34px, -52px) rotate(100deg); }
  45% { transform: translate(60px, -70px) rotate(200deg); }
  68% { transform: translate(34px, -52px) rotate(290deg); }
  90%, 100% { transform: translate(0, 0) rotate(360deg); }
}
.fws-flick { animation: fws-flick 1.8s ease-in-out 0.8s 3 both; }
@keyframes fws-flick { 0% { transform: rotate(-60deg); } 10% { transform: rotate(-84deg); } 22%, 100% { transform: rotate(-60deg); } }

/* what got said */
.fws-fill { animation: fws-fill 9.5s linear both; }
@keyframes fws-fill { from { opacity: 0.45; } to { opacity: 1; } }
.fws-nod { animation: fws-nod 9.5s ease-in-out both; }
@keyframes fws-nod { 0%, 31% { transform: translateY(0); } 34% { transform: translateY(2.5px); } 37% { transform: translateY(0); } 40% { transform: translateY(2.5px); } 43%, 100% { transform: translateY(0); } }
.fws-offer { animation: fws-offer 9.5s ease-in-out both; }
@keyframes fws-offer { 0%, 66% { transform: rotate(10deg); } 74%, 100% { transform: rotate(52deg); } }
.fws-offer-lower { animation: fws-offer-lower 9.5s ease-in-out both; }
@keyframes fws-offer-lower { 0%, 66% { transform: rotate(-50deg); } 74%, 100% { transform: rotate(-20deg); } }
.fws-offer-chips { animation: fws-offer-chips 9.5s ease-in-out both; }
@keyframes fws-offer-chips { 0%, 66% { transform: rotate(40deg); } 74%, 100% { transform: rotate(-32deg); } }
.fws-take { animation: fws-take 9.5s ease-in-out both; }
@keyframes fws-take { 0%, 74% { transform: rotate(10deg); } 82%, 100% { transform: rotate(26deg); } }
.fws-take-lower { animation: fws-take-lower 9.5s ease-in-out both; }
@keyframes fws-take-lower { 0%, 74% { transform: rotate(-50deg); } 82%, 100% { transform: rotate(-30deg); } }

/* stayed */
.fws-float { animation: fws-float 8.5s ease-in-out both; }
.fws-float-late { animation: fws-float 8.5s ease-in-out -1.5s both; }
@keyframes fws-float { from { transform: translateY(6px); } to { transform: translateY(-8px); } }
.fws-ghost { animation: fws-ghost 8.5s linear both; }
@keyframes fws-ghost { 0%, 30% { opacity: 0.45; } 66%, 100% { opacity: 0; } }
.fws-arrive { animation: fws-arrive 3s ease-out 0.3s both; }
@keyframes fws-arrive { from { transform: translateX(540px); } to { transform: translateX(280px); } }
.fws-leg-a-in { animation: fws-stride 1s ease-in-out 0.3s 3; }
.fws-leg-b-in { animation: fws-stride-rev 1s ease-in-out 0.3s 3; }
.fws-hug { animation: fws-hug 8.5s ease-in-out both; }
@keyframes fws-hug { 0%, 54% { transform: rotate(8deg); } 66%, 100% { transform: rotate(82deg); } }
.fws-hug-lower { animation: fws-hug-lower 8.5s ease-in-out both; }
@keyframes fws-hug-lower { 0%, 54% { transform: rotate(6deg); } 66%, 100% { transform: rotate(-8deg); } }
.fws-halo { transform-box: fill-box; transform-origin: center; animation: fws-halo 8.5s ease both; }
@keyframes fws-halo { 0%, 45% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }

/* now */
.fws-buzz { animation: fws-buzz 0.12s linear 3.4s 10; }
@keyframes fws-buzz { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(1.6px); } }
.fws-buzz-lines { animation: fws-buzz-lines 10s linear both; }
@keyframes fws-buzz-lines { 0%, 33% { opacity: 0; } 35%, 46% { opacity: 1; } 50%, 100% { opacity: 0; } }
.fws-dot { animation: fws-dot 1s ease-in-out infinite; }
@keyframes fws-dot { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-3px); } }
`;
