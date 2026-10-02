"use client";

import FilmPlayer, { type FilmScene } from "./FilmPlayer";
import { Figure, Mask, RIG_CSS, type Look } from "./rig";

/**
 * "The Version of Me at School", told as an animated film instead of prose.
 *
 * Colour carries the story. At home Priya wears a mustard hoodie in a warm,
 * lamp-lit room. At school everyone else is in navy and she is in washed-out
 * grey behind a polite mask. The colour comes back while she reads, and in the
 * last scene — the same lockers, warmer light — she's in navy like everyone
 * else, with the mask tucked in her bag.
 */

/* ---------------------------------------------------------------- cast -- */

const SKIN = { skin: "#B87A4B", skinShade: "#9A6238" };
const PRIYA_HAIR = { hair: "#241914", hairShade: "#4A3426", hairStyle: "long" as const };

const PRIYA_HOME: Look = {
  ...SKIN, ...PRIYA_HAIR,
  top: "#F2A93B", topShade: "#C7781C", topStyle: "hoodie",
  bottom: "#2F3A56", bottomStyle: "leggings", shoes: "#F4F1EA",
};
// School, as she feels it: the uniform drained of colour.
const PRIYA_GREY: Look = {
  ...SKIN, ...PRIYA_HAIR,
  top: "#8C93A3", topShade: "#6B7283", topStyle: "jumper", collar: "#FFFFFF",
  bottom: "#666D7D", bottomStyle: "skirt", shoes: "#2A2F3A", socks: "#E6E7EB",
};
// School, as everyone else wears it — and as she does by the end.
const UNIFORM = {
  top: "#34416B", topShade: "#232E52", topStyle: "jumper" as const, collar: "#FFFFFF",
  bottom: "#3C4766", shoes: "#1C2130", socks: "#E6E7EB",
};
const PRIYA_NAVY: Look = { ...SKIN, ...PRIYA_HAIR, ...UNIFORM, bottomStyle: "skirt" };

const DAD: Look = {
  skin: "#A9703F", skinShade: "#8C5832", hair: "#1B1412", hairShade: "#3A2A20", hairStyle: "short",
  top: "#2F7F7A", topShade: "#1F5F5B", topStyle: "tee", bottom: "#2B3346", bottomStyle: "pants", shoes: "#EDEDED",
};
const BROTHER: Look = {
  skin: "#B87A4B", skinShade: "#9A6238", hair: "#1B1412", hairShade: "#3A2A20", hairStyle: "short",
  top: "#D8513F", topShade: "#B03C2D", topStyle: "tee", bottom: "#2B3346", bottomStyle: "pants", shoes: "#EDEDED",
};
const GRAN: Look = {
  skin: "#A86E43", skinShade: "#8C5832", hair: "#DAD6CF", hairShade: "#B5AFA6", hairStyle: "bun",
  top: "#7A2E4A", topShade: "#5A1F35", topStyle: "cardigan", bottom: "#3D2C4A", bottomStyle: "skirt",
  shoes: "#3B2A22", glasses: true, shawl: "#D9A441",
};
const LIAM: Look = {
  skin: "#E3B48C", skinShade: "#C99670", hair: "#6B4226", hairShade: "#8A5A36", hairStyle: "short",
  ...UNIFORM, bottomStyle: "pants",
};
const ZARA: Look = {
  skin: "#7A4A2A", skinShade: "#613A20", hair: "#17110E", hairShade: "#3A2A20", hairStyle: "curly",
  ...UNIFORM, bottomStyle: "skirt",
};
// The girl she barely knew.
const MEI: Look = {
  skin: "#EAC4A0", skinShade: "#D2A47F", hair: "#2A1F1A", hairShade: "#4B3A30", hairStyle: "ponytail",
  ...UNIFORM, bottomStyle: "skirt",
};

/* ------------------------------------------------------------ helpers -- */

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
  x, y, w, text, tail = "left", italic, thought,
}: {
  x: number; y: number; w: number; text: string; tail?: "left" | "right"; italic?: boolean; thought?: boolean;
}) {
  const tx = tail === "left" ? x + 22 : x + w - 22;
  return (
    <g>
      <rect
        x={x} y={y} width={w} height="34" rx="17"
        fill="#FFFFFF" stroke={thought ? "#9AA3B5" : "#E2DDD5"} strokeDasharray={thought ? "4 4" : undefined}
      />
      {thought ? (
        <g fill="#FFFFFF" stroke="#9AA3B5" strokeDasharray="3 3">
          <circle cx={tx} cy={y + 44} r="4.5" />
          <circle cx={tx + (tail === "left" ? -6 : 6)} cy={y + 55} r="2.8" />
        </g>
      ) : (
        <path
          d={tail === "left" ? `M${tx - 6} ${y + 32} L${tx - 12} ${y + 46} L${tx + 6} ${y + 32} Z` : `M${tx - 6} ${y + 32} L${tx + 12} ${y + 46} L${tx + 6} ${y + 32} Z`}
          fill="#FFFFFF"
        />
      )}
      <text
        x={x + w / 2} y={y + 22} fontSize="15" fontWeight={italic ? 400 : 600}
        fontStyle={italic ? "italic" : undefined} fill="#1E1A24" textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );
}

function Note({ x, y, cls }: { x: number; y: number; cls: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={cls}>
        <ellipse cx="0" cy="0" rx="4.6" ry="3.4" transform="rotate(-20)" fill="#5B4FCF" />
        <path d="M4 -1 V-18 q5 2 8 6" stroke="#5B4FCF" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Lockers({ y = 62, tone = "#8EA0BC", shade = "#7486A3" }: { y?: number; tone?: string; shade?: string }) {
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`translate(${i * 41} ${y})`}>
          <rect x="1" y="0" width="39" height="168" rx="2" fill={tone} />
          <rect x="31" y="0" width="9" height="168" fill={shade} opacity="0.35" />
          {[14, 20, 26].map((vy) => (
            <rect key={vy} x="9" y={vy} width="20" height="2.4" rx="1.2" fill={shade} />
          ))}
          <rect x="30" y="76" width="3.5" height="16" rx="1.5" fill="#D9DEE8" />
        </g>
      ))}
    </g>
  );
}

/* -------------------------------------------------------------- scenes -- */

function SceneHome() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="vm1-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBE3C3" />
          <stop offset="1" stopColor="#F2C690" />
        </linearGradient>
        <linearGradient id="vm1-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7B67B5" />
          <stop offset="0.6" stopColor="#E98C6A" />
          <stop offset="1" stopColor="#F7C27D" />
        </linearGradient>
        <radialGradient id="vm1-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE6A8" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFE6A8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="vm-cam">
        <rect width="480" height="300" fill="url(#vm1-wall)" />
        {/* window at dusk */}
        <rect x="36" y="44" width="92" height="96" rx="4" fill="#F7EBD9" />
        <rect x="42" y="50" width="80" height="84" fill="url(#vm1-sky)" />
        <circle cx="98" cy="112" r="11" fill="#FFD9A0" opacity="0.9" />
        <path d="M42 120 q20 -10 40 0 t40 -4 V134 H42 Z" fill="#5E4A86" opacity="0.6" />
        <path d="M82 50 V134 M42 92 H122" stroke="#F7EBD9" strokeWidth="3" />
        <path d="M26 40 C34 70 30 110 34 146 H48 C40 110 46 70 40 40 Z" fill="#C2563A" />
        <path d="M138 40 C130 70 134 110 130 146 H116 C124 110 118 70 124 40 Z" fill="#C2563A" />
        <rect x="22" y="36" width="122" height="6" rx="3" fill="#8A5A3A" />
        {/* family photos */}
        <rect x="312" y="40" width="34" height="42" rx="2" fill="#8A5A3A" />
        <rect x="316" y="44" width="26" height="34" fill="#E9D3B4" />
        <circle cx="329" cy="56" r="6" fill="#B87A4B" />
        <path d="M319 78 q10 -12 20 0" fill="#B87A4B" />
        <rect x="354" y="48" width="44" height="32" rx="2" fill="#8A5A3A" />
        <rect x="358" y="52" width="36" height="24" fill="#CFE0D6" />
        <path d="M358 76 l10 -10 8 6 10 -8 8 12 Z" fill="#8FB59E" />
        {/* floor */}
        <rect y="236" width="480" height="64" fill="#B97A4D" />
        <path d="M0 252 H480 M0 272 H480 M0 290 H480" stroke="#A06640" strokeWidth="1.2" />
        <rect y="232" width="480" height="6" fill="#E7C49A" />
        <ellipse cx="190" cy="266" rx="110" ry="18" fill="#D9734E" />
        <ellipse cx="190" cy="266" rx="92" ry="13" fill="none" stroke="#F2B07F" strokeWidth="2" strokeDasharray="6 5" />
        {/* lamp glow */}
        <circle cx="448" cy="112" r="110" fill="url(#vm1-lamp)" />
        <rect x="445" y="112" width="4" height="124" fill="#5A3E2B" />
        <path d="M428 92 L468 92 L460 120 L436 120 Z" fill="#F7D79A" />
        {/* couch: back, family, then seat over their laps */}
        <rect x="292" y="166" width="150" height="46" rx="16" fill="#2F7F7A" />
        <g transform="translate(338 236) scale(0.92)">
          <g className="vm-bob">
            <Figure look={DAD} expression="laugh" upper rightArm={{ a: 18, b: -60 }} leftArm={{ a: 14, b: -40 }} />
          </g>
        </g>
        <g transform="translate(400 240) scale(0.74)">
          <g className="vm-bob-late">
            <Figure look={BROTHER} expression="laugh" upper leftArm={{ a: 30, b: -70 }} />
          </g>
        </g>
        <rect x="284" y="196" width="166" height="38" rx="12" fill="#3A938D" />
        <rect x="278" y="182" width="20" height="54" rx="9" fill="#2A716C" />
        <rect x="430" y="182" width="20" height="54" rx="9" fill="#2A716C" />
        <g className="vm-laugh-lines">
          <path d="M318 112 l-6 -6 M324 106 l-2 -8 M332 106 l2 -8" stroke="#B2462F" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M394 140 l-5 -5 M400 135 l-1 -7 M407 135 l2 -7" stroke="#B2462F" strokeWidth="2.4" strokeLinecap="round" />
        </g>
        {/* Priya, singing into a hairbrush */}
        <g transform="translate(176 262) scale(1.12)">
          <Figure
            look={PRIYA_HOME}
            expression="sing"
            bodyCls="vm-sway"
            headCls="vm-headtilt"
            leftArm={{ a: 145, b: -25, cls: "vm-singarm" }}
            rightArm={{ a: 125, b: 145 }}
            rightHand={
              <g transform="rotate(-90)">
                <rect x="-2" y="-1" width="4" height="13" rx="2" fill="#7B4B2A" />
                <ellipse cx="0" cy="-4" rx="4.6" ry="5.6" fill="#2C2C2C" />
              </g>
            }
          />
        </g>
        <Note x={232} y={120} cls="vm-note" />
        <Note x={252} y={104} cls="vm-note-2" />
        <Note x={222} y={96} cls="vm-note-3" />
      </g>
      <Vignette id="vm1-vig" />
    </svg>
  );
}

function SceneGate() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="vm2-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BCD7F0" />
          <stop offset="1" stopColor="#EEF4FA" />
        </linearGradient>
      </defs>
      <g className="vm-cam">
        <rect width="480" height="300" fill="url(#vm2-sky)" />
        <g className="vm-parallax">
          {/* distant street */}
          <path d="M0 150 q30 -30 60 0 q30 -36 70 0 q40 -28 80 0 q30 -34 70 0 q40 -30 90 0 q30 -26 60 0 q20 -20 50 0 V190 H0 Z" fill="#A9C4DE" opacity="0.7" />
          {/* home, warm */}
          <g transform="translate(-6 96)">
            <path d="M0 40 L56 0 L112 40 Z" fill="#C2563A" />
            <rect x="8" y="40" width="96" height="100" fill="#F4D19B" />
            <rect x="22" y="58" width="26" height="24" rx="2" fill="#FFF3D6" stroke="#E0B577" strokeWidth="2" />
            <rect x="66" y="86" width="24" height="54" rx="2" fill="#B2462F" />
            <circle cx="85" cy="114" r="2" fill="#F4D19B" />
          </g>
          {/* school, cool */}
          <g transform="translate(330 70)">
            <rect x="0" y="0" width="190" height="170" fill="#C9D1DE" />
            <rect x="0" y="0" width="190" height="16" fill="#A9B4C6" />
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect key={`${r}${c}`} x={14 + c * 44} y={30 + r * 40} width="30" height="24" rx="2" fill="#E8EEF6" stroke="#A9B4C6" strokeWidth="2" />
              ))
            )}
          </g>
          {/* the gate */}
          <g stroke="#3F4A63" strokeWidth="4" strokeLinecap="round">
            <path d="M318 130 V240 M470 130 V240" strokeWidth="7" />
            <path d="M318 146 H470" />
            {[336, 354, 372, 390, 408, 426, 444, 462].map((x) => (
              <path key={x} d={`M${x} 146 V240`} />
            ))}
          </g>
        </g>
        {/* pavement */}
        <rect y="236" width="480" height="64" fill="#D8D3CB" />
        <rect y="232" width="480" height="6" fill="#BFB8AD" />
        <path d="M0 270 H480" stroke="#CAC3B8" strokeWidth="2" strokeDasharray="30 18" />
        {/* the walk: colour drains, the mask comes down */}
        <g transform="translate(0 262)">
          <g className="vm-walk">
            <g className="vm-step">
              <g className="vm-out">
                <Figure
                  look={PRIYA_HOME}
                  expression="soft"
                  leftLeg={{ a: 14, cls: "vm-leg-a" }}
                  rightLeg={{ a: -14, cls: "vm-leg-b" }}
                  leftArm={{ a: 4, b: 8, cls: "vm-arm-a" }}
                  rightArm={{ a: 4, b: 8, cls: "vm-arm-b" }}
                />
              </g>
              <g className="vm-in">
                <Figure
                  look={PRIYA_GREY}
                  expression="flat"
                  leftLeg={{ a: 14, cls: "vm-leg-a" }}
                  rightLeg={{ a: -14, cls: "vm-leg-b" }}
                  leftArm={{ a: 4, b: 8, cls: "vm-arm-a" }}
                  rightArm={{ a: 4, b: 8, cls: "vm-arm-b" }}
                />
              </g>
              <g className="vm-mask-on">
                <Mask />
              </g>
            </g>
          </g>
        </g>
        {/* colour grade: warm at the door, cool at the gate */}
        <rect width="480" height="300" fill="#FFB36B" className="vm-grade-warm" />
        <rect width="480" height="300" fill="#6F93C8" className="vm-grade-cool" />
      </g>
      <Vignette id="vm2-vig" />
    </svg>
  );
}

function SceneHallway() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <g className="vm-cam">
        <rect width="480" height="300" fill="#E3E9F2" />
        <rect y="40" width="480" height="8" fill="#CDD5E2" />
        <Lockers />
        <rect y="230" width="480" height="70" fill="#C9D0DB" />
        <path d="M0 230 H480" stroke="#B4BDCB" strokeWidth="3" />
        <ellipse cx="240" cy="262" rx="210" ry="14" fill="#B9C1CE" opacity="0.6" />
        <g transform="translate(120 268) scale(1.02)">
          <g className="vm-bob">
            <Figure look={LIAM} expression="speak" rightArm={{ a: 30, b: -55 }} leftArm={{ a: 6 }} />
          </g>
        </g>
        <g transform="translate(372 268) scale(1)">
          <g className="vm-bob-late">
            <Figure look={ZARA} expression="laugh" leftArm={{ a: 20, b: -70 }} />
          </g>
        </g>
        <g transform="translate(246 270) scale(1.08)">
          <Figure
            look={PRIYA_GREY}
            expression="flat"
            mask
            rightArm={{ a: 10, b: -96 }}
            rightHand={
              <g transform="rotate(8)">
                <rect x="-12" y="-14" width="22" height="28" rx="2" fill="#B8C3D6" />
                <rect x="-10" y="-12" width="22" height="28" rx="2" fill="#E07A5F" />
              </g>
            }
          />
        </g>
        <g className="vm-pop-0">
          <Bubble x={18} y={52} w={226} text="You're coming Friday, yeah?" tail="left" />
        </g>
        <g className="vm-pop-1">
          <Bubble x={262} y={60} w={74} text="Yes!" tail="left" />
        </g>
        <g className="vm-pop-2">
          <Bubble x={156} y={13} w={110} text="…maybe?" tail="right" italic thought />
        </g>
        <g className="vm-pop-3">
          <text x="404" y="98" fontSize="16" fontWeight="800" fill="#34416B">HAHA</text>
          <text x="276" y="150" fontSize="13" fill="#6B7283" fontStyle="italic">ha. ha.</text>
        </g>
      </g>
      <Vignette id="vm3-vig" />
    </svg>
  );
}

function SceneAssignment() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="vm4-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="vm4-warm" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE1B0" />
          <stop offset="1" stopColor="#F9C98A" />
        </radialGradient>
      </defs>
      <g className="vm-cam">
        <rect width="480" height="300" fill="#EBEFF5" />
        {/* whiteboard */}
        <rect x="30" y="38" width="226" height="116" rx="4" fill="#FFFFFF" stroke="#C8D0DC" strokeWidth="3" />
        <rect x="30" y="150" width="226" height="6" fill="#C8D0DC" />
        <text x="46" y="66" fontSize="11" fontWeight="700" fill="#8A93A6" letterSpacing="1">ENGLISH · YEAR 10</text>
        <text x="46" y="98" fontSize="19" fontWeight="700" fill="#2E3A8C">Write about someone</text>
        <text x="46" y="122" fontSize="19" fontWeight="700" fill="#2E3A8C">you admire.</text>
        <text x="174" y="142" fontSize="11" fontWeight="600" fill="#D04848">Due Friday</text>
        {/* window and light */}
        <rect x="320" y="30" width="140" height="120" rx="4" fill="#CFE3F5" stroke="#B5C2D3" strokeWidth="4" />
        <path d="M390 30 V150 M320 90 H460" stroke="#B5C2D3" strokeWidth="4" />
        <path d="M322 150 L460 150 L420 300 L250 300 Z" fill="url(#vm4-beam)" />
        {/* floor */}
        <rect y="236" width="480" height="64" fill="#D4D9E2" />
        {/* Priya at her desk, writing */}
        <g transform="translate(338 276) scale(0.92)">
          <Figure
            look={PRIYA_GREY}
            expression="soft"
            upper
            headCls="vm-head-down"
            leftArm={{ a: 10, b: -70 }}
            rightArm={{ a: 14, b: -92, clsLower: "vm-write" }}
            rightHand={<path d="M0 0 L-12 -6" stroke="#2E3A8C" strokeWidth="2" strokeLinecap="round" />}
          />
        </g>
        <path d="M278 206 H404 L414 220 H268 Z" fill="#C9A27C" />
        <rect x="268" y="220" width="146" height="8" fill="#A9825E" />
        <rect x="276" y="228" width="8" height="40" fill="#8F6C4D" />
        <rect x="398" y="228" width="8" height="40" fill="#8F6C4D" />
        <g transform="translate(316 208) rotate(-4)">
          <rect x="0" y="0" width="44" height="12" rx="1" fill="#FFFFFF" />
          <path className="vm-ink" d="M4 4 H38 M4 8 H30" stroke="#2E3A8C" strokeWidth="1" />
        </g>
        {/* the thought: her grandmother, hands on hips */}
        <g className="vm-pop-2">
          <ellipse cx="392" cy="66" rx="76" ry="52" fill="url(#vm4-warm)" stroke="#E7A75C" strokeWidth="2" strokeDasharray="6 5" />
          <circle cx="360" cy="126" r="6" fill="#FCD9A6" stroke="#E7A75C" strokeDasharray="3 3" />
          <circle cx="350" cy="138" r="3.5" fill="#FCD9A6" stroke="#E7A75C" strokeDasharray="3 3" />
          <g transform="translate(392 112) scale(0.55)">
            <Figure look={GRAN} expression="smile" leftArm={{ a: 32, b: -118 }} rightArm={{ a: 32, b: -118 }} upper />
          </g>
        </g>
      </g>
      <Vignette id="vm4-vig" />
    </svg>
  );
}

function SceneReading() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <radialGradient id="vm5-spot" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF4DD" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFF4DD" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="vm-cam">
        <rect width="480" height="300" fill="#D9DFEA" />
        <rect x="120" y="40" width="240" height="110" rx="4" fill="#F3F5F9" stroke="#C3CBD8" strokeWidth="3" />
        <rect y="236" width="480" height="64" fill="#C5CCD8" />
        <ellipse cx="240" cy="170" rx="130" ry="150" fill="url(#vm5-spot)" />
        {/* her voice: steady, a crack, then steady again */}
        <g transform="translate(150 66)">
          {Array.from({ length: 24 }, (_, i) => (
            <rect
              key={i}
              x={i * 7.6}
              y="-12"
              width="4"
              height="24"
              rx="2"
              fill={i >= 11 && i <= 13 ? "#D04848" : "#2E7D8C"}
              className={`vm-bar vm-bar-${i % 4}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </g>
        <g transform="translate(240 268) scale(1.05)">
          <g className="vm-colour-out">
            <Figure look={PRIYA_GREY} expression="worried" leftArm={{ a: 22, b: -96 }} rightArm={{ a: 22, b: -96 }} />
          </g>
          <g className="vm-colour-in">
            <Figure look={PRIYA_NAVY} expression="soft" leftArm={{ a: 22, b: -96 }} rightArm={{ a: 22, b: -96 }} />
          </g>
          <g className="vm-mask-fall">
            <Mask cracked />
          </g>
          <g transform="translate(0 -79)">
            <g className="vm-tremble">
              <rect x="-17" y="-14" width="34" height="42" rx="2" fill="#FFFFFF" stroke="#D5D9E1" />
              <path d="M-12 -6 H12 M-12 0 H12 M-12 6 H8 M-12 12 H11 M-12 18 H6" stroke="#9AA3B5" strokeWidth="1.4" />
            </g>
          </g>
        </g>
        {/* the class, from behind */}
        <g fill="#2B3553">
          {[50, 130, 350, 430].map((x, i) => (
            <g key={x} transform={`translate(${x} ${282 + (i % 2) * 6})`}>
              <ellipse cx="0" cy="-26" rx="17" ry="19" />
              <path d="M-34 18 C-30 -6 30 -6 34 18 Z" />
            </g>
          ))}
        </g>
      </g>
      <Vignette id="vm5-vig" />
    </svg>
  );
}

function SceneLunch() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="vm6-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9D2F0" />
          <stop offset="1" stopColor="#E3F1FA" />
        </linearGradient>
      </defs>
      <g className="vm-cam">
        <rect width="480" height="300" fill="url(#vm6-sky)" />
        <rect y="150" width="480" height="30" fill="#C6D2DE" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={i * 84 + 8} y="160" width="60" height="12" rx="2" fill="#E8EEF6" />
        ))}
        <rect y="178" width="480" height="122" fill="#9CC47A" />
        <path d="M0 236 H480" stroke="#8AB56A" strokeWidth="2" />
        {/* the tree */}
        <rect x="64" y="96" width="16" height="110" fill="#7A5A3E" />
        <circle cx="72" cy="86" r="52" fill="#5E9E5A" />
        <circle cx="44" cy="102" r="30" fill="#6FAE66" />
        <circle cx="104" cy="98" r="32" fill="#4F8E4C" />
        {/* the bench */}
        <rect x="150" y="226" width="150" height="10" rx="3" fill="#A9825E" />
        <rect x="150" y="210" width="150" height="8" rx="3" fill="#B8916B" />
        <rect x="162" y="236" width="7" height="22" fill="#8F6C4D" />
        <rect x="282" y="236" width="7" height="22" fill="#8F6C4D" />
        <g transform="translate(212 295) scale(0.96)">
          <g className="vm-face-a">
            <Figure look={PRIYA_NAVY} expression="worried" seated leftArm={{ a: 8, b: -40 }} rightArm={{ a: 8, b: -40 }} />
          </g>
          <g className="vm-face-b">
            <Figure look={PRIYA_NAVY} expression="soft" seated leftArm={{ a: 8, b: -40 }} rightArm={{ a: 8, b: -40 }} />
          </g>
        </g>
        {/* the girl she barely knew */}
        <g transform="translate(0 268)">
          <g className="vm-approach">
            <Figure
              look={MEI}
              expression="smile"
              leftLeg={{ a: 10, cls: "vm-leg-a-slow" }}
              rightLeg={{ a: -10, cls: "vm-leg-b-slow" }}
              rightArm={{ a: 36, b: -30 }}
            />
          </g>
        </g>
        <g className="vm-pop-3">
          <Bubble x={160} y={66} w={232} text="“That was really something.”" tail="right" italic />
        </g>
      </g>
      <Vignette id="vm6-vig" />
    </svg>
  );
}

function SceneWhole() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <radialGradient id="vm7-bg" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#FFF1D6" />
          <stop offset="1" stopColor="#F2C690" />
        </radialGradient>
        <radialGradient id="vm7-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFD56B" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFD56B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="vm-cam">
        <rect width="480" height="300" fill="url(#vm7-bg)" />
        <circle cx="240" cy="170" r="130" fill="url(#vm7-halo)" className="vm-halo" />
        <ellipse cx="240" cy="266" rx="160" ry="12" fill="#E3AE72" opacity="0.5" />
        <g transform="translate(0 262)">
          <g className="vm-merge-l">
            <Figure look={PRIYA_HOME} expression="smile" leftArm={{ a: 20, b: 10 }} rightArm={{ a: 30, b: -10 }} />
          </g>
        </g>
        <g transform="translate(0 262)">
          <g className="vm-merge-r">
            <Figure look={PRIYA_GREY} expression="flat" mask leftArm={{ a: 30, b: -10 }} />
          </g>
        </g>
        {/* the mask, set down for good */}
        <g transform="translate(240 300)">
          <g className="vm-mask-drop">
            <g transform="rotate(70) translate(0 138)">
              <Mask cracked />
            </g>
          </g>
        </g>
      </g>
      <Vignette id="vm7-vig" />
    </svg>
  );
}

function SceneAfter() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="vm8-light" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE1B0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFE1B0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="vm-cam">
        <rect width="480" height="300" fill="#ECE8EF" />
        <rect y="40" width="480" height="8" fill="#D6D3DC" />
        <Lockers tone="#97A6C0" shade="#7D8DAA" />
        <rect y="230" width="480" height="70" fill="#CFD0D8" />
        <path d="M0 230 H480" stroke="#B9BAC6" strokeWidth="3" />
        <rect width="480" height="300" fill="url(#vm8-light)" />
        <g transform="translate(196 268) scale(1.08)">
          <g className="vm-bob">
            <Figure
              look={PRIYA_NAVY}
              expression="laugh"
              leftArm={{ a: 6, b: -20 }}
              rightArm={{ a: 20, b: -70 }}
              leftHand={
                <g transform="translate(-6 -44)">
                  <rect x="-10" y="0" width="22" height="30" rx="5" fill="#E07A5F" />
                  <rect x="-7" y="6" width="16" height="12" rx="3" fill="#C9634A" />
                  <g transform="translate(1 4) rotate(-14) scale(0.55) translate(0 138)">
                    <Mask />
                  </g>
                </g>
              }
            />
          </g>
        </g>
        <g transform="translate(286 268) scale(1.02)">
          <g className="vm-bob-late">
            <Figure look={MEI} expression="laugh" leftArm={{ a: 24, b: -60 }} />
          </g>
        </g>
        <text x="236" y="90" fontSize="18" fontWeight="800" fill="#D9734E" className="vm-pop-loop">ha!</text>
      </g>
      <Vignette id="vm8-vig" />
    </svg>
  );
}

function Poster() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <defs>
        <linearGradient id="vm0-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBE3C3" />
          <stop offset="1" stopColor="#F2C690" />
        </linearGradient>
        <linearGradient id="vm0-cool" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCE5F1" />
          <stop offset="1" stopColor="#C2CEDF" />
        </linearGradient>
      </defs>
      <rect width="240" height="300" fill="url(#vm0-warm)" />
      <rect x="240" width="240" height="300" fill="url(#vm0-cool)" />
      <rect y="236" width="240" height="64" fill="#B97A4D" />
      <rect x="240" y="236" width="240" height="64" fill="#C5CCD8" />
      <g transform="translate(160 262) scale(1.1)">
        <Figure look={PRIYA_HOME} expression="smile" rightArm={{ a: 30, b: -20 }} />
      </g>
      <g transform="translate(320 262) scale(1.1)">
        <Figure look={PRIYA_GREY} expression="flat" mask />
      </g>
      <Vignette id="vm0-vig" />
    </svg>
  );
}

/* -------------------------------------------------------------- script -- */

const SCENES: FilmScene[] = [
  {
    id: "home",
    art: <SceneHome />,
    duration: 8500,
    caption:
      "At home, Priya took up the whole room. She did impressions that made her family beg her to stop, argued at dinner about things she actually cared about, and sang badly — loudly, on purpose.",
  },
  {
    id: "gate",
    art: <SceneGate />,
    duration: 9000,
    caption:
      "But every morning, somewhere between the front door and the school gate, she turned herself down. Quieter. Careful. A version of her that almost fitted — like shoes half a size too small.",
  },
  {
    id: "classroom",
    art: <SceneHallway />,
    duration: 8500,
    caption:
      "At school she said yes when she meant maybe. She laughed at jokes she didn't find funny. Nobody noticed, which was sort of the point — and sort of the problem.",
  },
  {
    id: "assignment",
    art: <SceneAssignment />,
    duration: 9000,
    caption:
      "In Year 10, her English teacher set a piece of writing: someone you admire. Priya nearly picked someone safe. Instead she wrote about her grandmother — a woman who had never once apologised for taking up space.",
  },
  {
    id: "reading",
    art: <SceneReading />,
    duration: 8500,
    caption:
      "Reading it aloud, her voice cracked halfway through. Everyone heard it. She could have stopped, made a joke, sat down. She kept going.",
  },
  {
    id: "quiet",
    art: <SceneLunch />,
    duration: 9000,
    caption:
      "When she finished, the room was quiet — not the bored kind, the listening kind. At lunch, a girl she barely knew caught up with her and said, “That was really something.”",
  },
  {
    id: "whole",
    art: <SceneWhole />,
    duration: 8500,
    caption:
      "Priya realised she hadn't been performing at all. For five minutes, the version of her at home and the version of her at school had been the same person. It felt enormous.",
  },
  {
    id: "after",
    art: <SceneAfter />,
    duration: 10000,
    caption:
      "The next day she was still quieter at school than at home — that didn't just vanish. But she only laughed when something was funny. And she'd seen the mask for what it was: something she could take off.",
  },
];

export const VERSION_OF_ME_TRANSCRIPT = SCENES.map((s) => s.caption);

export default function VersionOfMeFilm({ storyId }: { storyId: string }) {
  return <FilmPlayer storyId={storyId} scenes={SCENES} poster={<Poster />} css={RIG_CSS + FILM_CSS} />;
}

/* --------------------------------------------------------------- style -- */

const FILM_CSS = `
.vm-cam { transform-origin: 240px 150px; animation: vm-cam 9s ease-out both; }
@keyframes vm-cam { from { transform: scale(1); } to { transform: scale(1.06); } }

.vm-pop-0 { animation: vm-pop-in 0.5s cubic-bezier(.2,.9,.3,1.3) 0.3s both; }
.vm-pop-1 { animation: vm-pop-in 0.5s cubic-bezier(.2,.9,.3,1.3) 1.8s both; }
.vm-pop-2 { animation: vm-pop-in 0.6s cubic-bezier(.2,.9,.3,1.3) 3.2s both; }
.vm-pop-3 { animation: vm-pop-in 0.6s cubic-bezier(.2,.9,.3,1.3) 5s both; }
.vm-pop-0, .vm-pop-1, .vm-pop-2, .vm-pop-3 { transform-box: fill-box; transform-origin: center; }
@keyframes vm-pop-in { from { opacity: 0; transform: scale(0.85) translateY(6px); } to { opacity: 1; transform: none; } }
.vm-pop-loop { animation: vm-pop-loop 2.4s ease-in-out 1s infinite; }
@keyframes vm-pop-loop { 0%, 20% { opacity: 0; } 35%, 70% { opacity: 1; } 90%, 100% { opacity: 0; } }

/* idle life */
.vm-sway { animation: vm-sway 1.8s ease-in-out infinite; }
@keyframes vm-sway { 0%, 100% { transform: rotate(-2.5deg); } 50% { transform: rotate(2.5deg); } }
.vm-headtilt { transform-origin: 0px -125px; animation: vm-headtilt 1.8s ease-in-out infinite; }
@keyframes vm-headtilt { 0%, 100% { transform: rotate(4deg); } 50% { transform: rotate(-4deg); } }
.vm-singarm { animation: vm-singarm 0.9s ease-in-out infinite; }
@keyframes vm-singarm { 0%, 100% { transform: rotate(140deg); } 50% { transform: rotate(158deg); } }
.vm-bob { animation: vm-bob 0.8s ease-in-out infinite; }
.vm-bob-late { animation: vm-bob 0.8s ease-in-out 0.3s infinite; }
@keyframes vm-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.vm-laugh-lines { animation: vm-pop-loop 1.6s ease-in-out infinite; }
.vm-note, .vm-note-2, .vm-note-3 { animation: vm-note 2.6s ease-out infinite; }
.vm-note-2 { animation-delay: 0.8s; }
.vm-note-3 { animation-delay: 1.6s; }
@keyframes vm-note { 0% { opacity: 0; transform: translate(0, 10px) rotate(-8deg); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(10px, -40px) rotate(10deg); } }

/* the walk to school */
.vm-walk { animation: vm-walk 8.6s linear both; }
@keyframes vm-walk { from { transform: translateX(70px); } to { transform: translateX(290px); } }
.vm-step { animation: vm-step 0.6s ease-in-out infinite; }
@keyframes vm-step { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.vm-leg-a { animation: vm-leg 1.2s ease-in-out infinite; }
.vm-leg-b { animation: vm-leg 1.2s ease-in-out -0.6s infinite; }
@keyframes vm-leg { 0%, 100% { transform: rotate(18deg); } 50% { transform: rotate(-18deg); } }
.vm-arm-a { animation: vm-arm 1.2s ease-in-out -0.6s infinite; }
.vm-arm-b { animation: vm-arm 1.2s ease-in-out infinite; }
@keyframes vm-arm { 0%, 100% { transform: rotate(16deg); } 50% { transform: rotate(-10deg); } }
.vm-parallax { animation: vm-parallax 9s linear both; }
@keyframes vm-parallax { from { transform: translateX(0); } to { transform: translateX(-28px); } }
.vm-out { animation: vm-out 8.6s linear both; }
.vm-in { animation: vm-fin 8.6s linear both; }
@keyframes vm-out { 0%, 38% { opacity: 1; } 62%, 100% { opacity: 0; } }
@keyframes vm-fin { 0%, 38% { opacity: 0; } 62%, 100% { opacity: 1; } }
.vm-mask-on { animation: vm-mask-on 8.6s ease-out both; }
@keyframes vm-mask-on { 0%, 52% { opacity: 0; transform: translateY(-40px); } 70%, 100% { opacity: 1; transform: translateY(0); } }
.vm-grade-warm { animation: vm-grade-warm 8.6s linear both; }
.vm-grade-cool { animation: vm-grade-cool 8.6s linear both; }
@keyframes vm-grade-warm { 0% { opacity: 0.16; } 55%, 100% { opacity: 0; } }
@keyframes vm-grade-cool { 0%, 45% { opacity: 0; } 100% { opacity: 0.14; } }

/* writing */
.vm-head-down { transform-origin: 0px -125px; transform: rotate(6deg); }
.vm-write { animation: vm-write 0.55s ease-in-out infinite; }
@keyframes vm-write { 0%, 100% { transform: rotate(-92deg); } 50% { transform: rotate(-84deg); } }
.vm-ink { stroke-dasharray: 60; stroke-dashoffset: 60; animation: vm-ink 6s linear 0.5s both; }
@keyframes vm-ink { to { stroke-dashoffset: 0; } }

/* reading aloud */
.vm-bar { transform-box: fill-box; transform-origin: center; animation: vm-bar 0.7s ease-in-out infinite alternate; }
.vm-bar-1 { animation-duration: 0.55s; }
.vm-bar-2 { animation-duration: 0.8s; }
.vm-bar-3 { animation-duration: 0.62s; }
@keyframes vm-bar { from { transform: scaleY(0.25); } to { transform: scaleY(1); } }
.vm-tremble { animation: vm-tremble 0.18s linear infinite; }
@keyframes vm-tremble { 0%, 100% { transform: rotate(-1.2deg); } 50% { transform: rotate(1.2deg); } }
.vm-mask-fall { transform-box: fill-box; transform-origin: center; animation: vm-mask-fall 8.5s ease-in both; }
@keyframes vm-mask-fall {
  0%, 38% { opacity: 1; transform: none; }
  50% { opacity: 1; transform: translate(-2px, 6px) rotate(-10deg); }
  72%, 100% { opacity: 0; transform: translate(-30px, 150px) rotate(-75deg); }
}
.vm-colour-out { animation: vm-out-slow 8.5s linear both; }
.vm-colour-in { animation: vm-in-slow 8.5s linear both; }
@keyframes vm-out-slow { 0%, 48% { opacity: 1; } 85%, 100% { opacity: 0; } }
@keyframes vm-in-slow { 0%, 48% { opacity: 0; } 85%, 100% { opacity: 1; } }

/* lunch */
.vm-approach { animation: vm-approach 4.6s ease-out 0.4s both; }
@keyframes vm-approach { from { transform: translateX(540px); } to { transform: translateX(356px); } }
.vm-leg-a-slow { animation: vm-leg-slow 1.1s ease-in-out 4 both; }
.vm-leg-b-slow { animation: vm-leg-slow 1.1s ease-in-out -0.55s 4 both; }
@keyframes vm-leg-slow { 0%, 50%, 100% { transform: rotate(0deg); } 25% { transform: rotate(12deg); } 75% { transform: rotate(-12deg); } }
.vm-face-a { animation: vm-out-face 9s linear both; }
.vm-face-b { animation: vm-in-face 9s linear both; }
@keyframes vm-out-face { 0%, 62% { opacity: 1; } 70%, 100% { opacity: 0; } }
@keyframes vm-in-face { 0%, 62% { opacity: 0; } 70%, 100% { opacity: 1; } }

/* whole */
.vm-merge-l { animation: vm-merge-l 6.5s ease-in-out both; }
@keyframes vm-merge-l { 0%, 12% { transform: translateX(120px); } 72%, 100% { transform: translateX(240px); } }
.vm-merge-r { animation: vm-merge-r 6.5s ease-in-out both; }
@keyframes vm-merge-r {
  0%, 12% { transform: translateX(360px); opacity: 1; }
  66% { transform: translateX(244px); opacity: 0.5; }
  76%, 100% { transform: translateX(240px); opacity: 0; }
}
.vm-mask-drop { animation: vm-mask-drop 6.5s ease-in both; }
@keyframes vm-mask-drop { 0%, 66% { opacity: 0; transform: translate(0, -150px); } 80% { opacity: 1; transform: translate(0, -24px); } 100% { opacity: 0.85; transform: translate(0, -24px); } }
.vm-halo { transform-box: fill-box; transform-origin: center; animation: vm-halo 7s ease both; }
@keyframes vm-halo { 0%, 55% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
`;
