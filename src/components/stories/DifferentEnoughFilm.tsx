"use client";

import FilmPlayer, { type FilmScene } from "./FilmPlayer";

/**
 * "Different Enough", told as an animated film instead of prose.
 *
 * Mum is labels and lists; Sofia is scribbles. The thing they turn out to
 * share is drawing — Mum filled a sketchbook at sixteen and never showed
 * anyone — and the ending is in Mum's own language: a sticky note.
 */

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
  return <FilmPlayer storyId={storyId} scenes={SCENES} poster={<Poster />} css={FILM_CSS} />;
}

function Poster() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#1E293B" />
      <Veranda />
      <circle cx="240" cy="226" r="70" fill="#FDE68A" opacity="0.25" />
      <g transform="translate(195 150)">
        <Sitting {...MUM} />
      </g>
      <g transform="translate(285 150)">
        <Sitting {...SOFIA} />
      </g>
      <Candle x={240} y={236} />
    </svg>
  );
}

/* ---------------------------------------------------------------- cast -- */

type HairStyle = "long" | "bob" | "bun";

interface Look {
  skin: string;
  hair: string;
  style: HairStyle;
  top: string;
  legs: string;
}

const SOFIA: Look = { skin: "#D4A276", hair: "#3B2416", style: "long", top: "#C026D3", legs: "#334155" };
const MUM: Look = { skin: "#C9936A", hair: "#3B2416", style: "bob", top: "#64748B", legs: "#1F2937" };
// Mum at sixteen: same face, Sofia's energy.
const TEEN_MUM: Look = { skin: "#C9936A", hair: "#3B2416", style: "bun", top: "#CA8A04", legs: "#334155" };

type Mood = "flat" | "smile" | "cross";

function Head({ skin, hair, style, mood = "flat" }: Look & { mood?: Mood }) {
  return (
    <g>
      {/* hair that falls past the face is drawn as side panels only, so
          nothing shows under the chin */}
      {style === "long" && (
        <g fill={hair}>
          <rect x="-17" y="-6" width="9" height="38" rx="4" />
          <rect x="8" y="-6" width="9" height="38" rx="4" />
        </g>
      )}
      {style === "bob" && (
        <g fill={hair}>
          <rect x="-16" y="-6" width="8" height="17" rx="3" />
          <rect x="8" y="-6" width="8" height="17" rx="3" />
        </g>
      )}
      <circle cx="0" cy="0" r="13" fill={skin} />
      <path d="M-14 -1 C-15 -19 15 -19 14 -1 C8 -10 -8 -10 -14 -1 Z" fill={hair} />
      {style === "bun" && <circle cx="0" cy="-17" r="7" fill={hair} />}
      {style === "bob" && <path d="M-6 -13 q4 -2 8 0" stroke="#A8A29E" strokeWidth="1.6" fill="none" />}
      <circle cx="-4.5" cy="1" r="1.5" fill="#1C1917" />
      <circle cx="4.5" cy="1" r="1.5" fill="#1C1917" />
      {mood === "cross" && (
        <g stroke="#1C1917" strokeWidth="1.4" strokeLinecap="round">
          <path d="M-7 -4 L-2 -2.5" />
          <path d="M7 -4 L2 -2.5" />
        </g>
      )}
      {mood === "smile" ? (
        <path d="M-4 6 Q0 9.5 4 6" stroke="#1C1917" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ) : mood === "cross" ? (
        <path d="M-4 8 Q0 5.5 4 8" stroke="#1C1917" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M-3.5 7 H3.5" stroke="#1C1917" strokeWidth="1.4" strokeLinecap="round" />
      )}
    </g>
  );
}

function Standing(props: Look & { mood?: Mood }) {
  return (
    <g>
      <rect x="-11" y="56" width="9" height="28" rx="2" fill={props.legs} />
      <rect x="2" y="56" width="9" height="28" rx="2" fill={props.legs} />
      <path d="M-15 15 h30 l3 44 h-36 z" fill={props.top} />
      <Head {...props} />
    </g>
  );
}

// upperOnly: for anyone sitting behind a table, whose legs it would hide.
function Sitting(props: Look & { mood?: Mood; upperOnly?: boolean }) {
  return (
    <g>
      <path d="M-15 15 h30 l2 36 h-34 z" fill={props.top} />
      {!props.upperOnly && (
        <g fill={props.legs}>
          <rect x="-16" y="48" width="14" height="11" rx="3" />
          <rect x="2" y="48" width="14" height="11" rx="3" />
          <rect x="-15" y="56" width="11" height="24" rx="2" />
          <rect x="4" y="56" width="11" height="24" rx="2" />
        </g>
      )}
      <Head {...props} />
    </g>
  );
}

function Sketchbook({ open }: { open?: boolean }) {
  return open ? (
    <g>
      <rect x="-22" y="-9" width="44" height="18" rx="1.5" fill="white" stroke="#A8A29E" />
      <line x1="0" y1="-9" x2="0" y2="9" stroke="#A8A29E" />
      <path d="M-18 2 q4 -6 8 0 t8 0" stroke="#C026D3" strokeWidth="1.2" fill="none" />
      <path d="M4 4 l5 -8 5 8 z" stroke="#78716C" strokeWidth="1" fill="none" />
    </g>
  ) : (
    <rect x="-14" y="-8" width="28" height="16" rx="1.5" fill="#FDF4FF" stroke="#C026D3" />
  );
}

function Candle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-4" y="-2" width="8" height="16" rx="1" fill="#FEF3C7" />
      <g className="de-flicker">
        <ellipse cx="0" cy="-7" rx="3.5" ry="6" fill="#F59E0B" />
        <ellipse cx="0" cy="-5.5" rx="1.6" ry="3" fill="#FEF9C3" />
      </g>
    </g>
  );
}

function Rain() {
  return (
    <g className="de-rain" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
      {Array.from({ length: 48 }, (_, i) => {
        const x = (i * 37) % 480;
        const y = ((i * 53) % 240) - 40;
        return <line key={i} x1={x} y1={y} x2={x - 4} y2={y + 14} />;
      })}
    </g>
  );
}

function Veranda() {
  return (
    <g>
      <rect y="0" width="480" height="18" fill="#44403C" />
      <rect x="18" y="18" width="10" height="222" fill="#57534E" />
      <rect x="452" y="18" width="10" height="222" fill="#57534E" />
      <rect y="240" width="480" height="60" fill="#57534E" />
      <rect x="28" y="150" width="424" height="6" fill="#78716C" />
      <rect x="150" y="204" width="180" height="10" rx="2" fill="#78716C" />
    </g>
  );
}

function Bubble({
  x,
  y,
  w,
  text,
  tail = "left",
}: {
  x: number;
  y: number;
  w: number;
  text: string;
  tail?: "left" | "right";
}) {
  const tx = tail === "left" ? x + 18 : x + w - 18;
  return (
    <g>
      <rect x={x} y={y} width={w} height="32" rx="11" fill="white" stroke="#D6D3CD" />
      <path
        d={tail === "left" ? `M${tx} ${y + 31} l-4 12 12 -12` : `M${tx} ${y + 31} l4 12 -12 -12`}
        fill="white"
        stroke="#D6D3CD"
      />
      <rect x={tx - 7} y={y + 28} width="18" height="4" fill="white" />
      <text x={x + w / 2} y={y + 21} fontSize="14" fill="#1A1A1A" textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

/* -------------------------------------------------------------- scenes -- */

function Kitchen() {
  return (
    <g>
      <rect width="480" height="300" fill="#FFF7ED" />
      <rect y="250" width="480" height="50" fill="#FDE9CF" />
      {/* fridge, with the list */}
      <rect x="28" y="92" width="70" height="158" rx="4" fill="#E2E8F0" stroke="#CBD5E1" />
      <rect x="44" y="108" width="38" height="46" fill="white" stroke="#E2E8F0" />
      <g stroke="#94A3B8" strokeWidth="1.4">
        <line x1="50" y1="118" x2="76" y2="118" />
        <line x1="50" y1="126" x2="72" y2="126" />
        <line x1="50" y1="134" x2="76" y2="134" />
        <line x1="50" y1="142" x2="68" y2="142" />
      </g>
      {/* 6:30 */}
      <circle cx="150" cy="58" r="18" fill="white" stroke="#CBD5E1" strokeWidth="2" />
      <line x1="150" y1="58" x2="147" y2="68" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="150" y1="58" x2="150" y2="73" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

function Containers() {
  return (
    <g>
      {[122, 160, 198].map((x) => (
        <g key={x}>
          <rect x={x} y="182" width="32" height="20" rx="2" fill="#F8FAFC" stroke="#94A3B8" />
          <rect x={x + 6} y="188" width="20" height="6" fill="#FDE68A" />
        </g>
      ))}
    </g>
  );
}

function SceneSettings() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <Kitchen />
      <g transform="translate(180 148)">
        <Standing {...MUM} />
      </g>
      <rect x="110" y="202" width="140" height="10" fill="#CBD5E1" />
      <rect x="110" y="212" width="140" height="38" fill="#E2E8F0" />
      <g className="de-appear-0">
        <Containers />
      </g>
      {/* Sofia and the scribbles */}
      <rect x="340" y="216" width="60" height="8" rx="2" fill="#A8896B" />
      <rect x="366" y="224" width="8" height="26" fill="#8B7157" />
      <g transform="translate(370 158)">
        <Sitting {...SOFIA} mood="smile" />
        <g transform="translate(0 40)">
          <Sketchbook />
        </g>
      </g>
      <g fill="none" strokeWidth="3" strokeLinecap="round">
        <path className="de-draw-1" d="M300 110 q12 -24 24 0 t24 0 t24 0" stroke="#C026D3" />
        <path className="de-draw-2" d="M395 70 c20 -20 40 10 20 25 s-30 10 -10 -20" stroke="#F59E0B" />
        <path className="de-draw-3" d="M430 140 l12 -18 10 16 14 -20" stroke="#0E7490" />
        <path className="de-draw-4" d="M320 60 q6 -16 18 -4 q10 12 22 -6" stroke="#EA580C" />
      </g>
    </svg>
  );
}

function SceneDinner() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#FFF7ED" />
      <rect y="250" width="480" height="50" fill="#FDE9CF" />
      <line x1="240" y1="0" x2="240" y2="112" stroke="#78716C" strokeWidth="1.5" />
      <path d="M222 124 h36 l-8 -12 h-20 z" fill="#78716C" />
      <g transform="translate(170 150)">
        <Sitting {...MUM} upperOnly mood="cross" />
      </g>
      <g transform="translate(310 150)">
        <g className="de-leave">
          <Sitting {...SOFIA} upperOnly mood="cross" />
        </g>
      </g>
      <rect x="110" y="202" width="260" height="12" rx="3" fill="#A8896B" />
      <rect x="130" y="214" width="8" height="36" fill="#8B7157" />
      <rect x="342" y="214" width="8" height="36" fill="#8B7157" />
      <ellipse cx="185" cy="200" rx="18" ry="4" fill="white" stroke="#D6D3CD" />
      <g transform="translate(295 200)">
        <g className="de-leave">
          <ellipse cx="0" cy="0" rx="18" ry="4" fill="white" stroke="#D6D3CD" />
        </g>
      </g>
      <g className="de-appear-1">
        <Bubble x={30} y={62} w={190} text="I'm just being honest." tail="right" />
      </g>
      <g className="de-appear-2">
        <Bubble x={262} y={62} w={178} text="You ALWAYS do this!" tail="left" />
      </g>
      <g className="de-clash" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M232 148 l8 -8 -2 10 8 -8" />
        <path d="M228 164 l-8 4 8 2 -6 6" />
      </g>
      <text x="150" y="134" fontSize="12" fontStyle="italic" fill="#78716C" className="de-appear-4">sigh.</text>
    </svg>
  );
}

function SceneRooms() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="236" height="300" fill="#FFF7ED" />
      <rect x="244" width="236" height="300" fill="#F5E8FF" />
      <rect x="236" width="8" height="300" fill="#94A3B8" />
      <rect y="250" width="236" height="50" fill="#FDE9CF" />
      <rect x="244" y="250" width="236" height="50" fill="#E9D5FF" />
      {/* Mum, wiping a clean bench */}
      <g transform="translate(115 148)">
        <Standing {...MUM} />
      </g>
      <rect x="40" y="202" width="150" height="10" fill="#CBD5E1" />
      <rect x="40" y="212" width="150" height="38" fill="#E2E8F0" />
      <g transform="translate(118 197)">
        <g className="de-wipe">
          <ellipse cx="0" cy="0" rx="12" ry="4" fill="#7DD3FC" />
        </g>
      </g>
      {/* Sofia on her bed, phone glow */}
      <rect x="290" y="206" width="170" height="30" rx="6" fill="#C4B5FD" />
      <rect x="296" y="236" width="8" height="14" fill="#A78BFA" />
      <rect x="446" y="236" width="8" height="14" fill="#A78BFA" />
      <rect x="420" y="192" width="34" height="16" rx="6" fill="white" />
      <g transform="translate(365 150)">
        <Sitting {...SOFIA} />
        <rect x="8" y="26" width="10" height="16" rx="2" fill="#1E293B" />
        <circle cx="13" cy="30" r="12" fill="#BAE6FD" opacity="0.35" />
      </g>
      {/* ten metres */}
      <g className="de-appear-1">
        <path d="M115 52 H365" stroke="#78716C" strokeWidth="1.5" strokeDasharray="5 5" />
        <path d="M122 46 l-7 6 7 6 M358 46 l7 6 -7 6" stroke="#78716C" strokeWidth="1.5" fill="none" />
        <rect x="200" y="40" width="80" height="24" rx="6" fill="white" />
        <text x="240" y="57" fontSize="13" fill="#57534E" textAnchor="middle">10 metres</text>
      </g>
    </svg>
  );
}

function SceneStorm() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#1E293B" />
      <Rain />
      <Veranda />
      <rect width="480" height="300" fill="white" className="de-lightning" />
      {/* the lights, then no lights */}
      <circle cx="240" cy="30" r="8" fill="#FDE68A" className="de-lamp-out" />
      <rect width="480" height="300" fill="#FDE68A" className="de-lights-out" />
      <g transform="translate(195 150)">
        <Sitting {...MUM} />
      </g>
      <g transform="translate(285 150)">
        <Sitting {...SOFIA} />
        <rect x="8" y="26" width="10" height="16" rx="2" fill="#0F172A" />
      </g>
      <g className="de-appear-2">
        <rect x="306" y="150" width="34" height="18" rx="4" fill="white" />
        <text x="323" y="163" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">4%</text>
      </g>
      <g className="de-candle-on">
        <circle cx="240" cy="226" r="70" fill="#FDE68A" opacity="0.25" />
        <Candle x={240} y={236} />
      </g>
    </svg>
  );
}

function SceneStory() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#1E293B" />
      <Rain />
      <Veranda />
      <circle cx="240" cy="226" r="70" fill="#FDE68A" opacity="0.25" />
      <g transform="translate(195 150)">
        <Sitting {...MUM} mood="smile" />
      </g>
      <g transform="translate(285 150)">
        <Sitting {...SOFIA} />
      </g>
      <Candle x={240} y={236} />
      {/* what Mum is remembering */}
      <g className="de-appear-1">
        <circle cx="180" cy="122" r="4" fill="#FFFBEB" />
        <circle cx="168" cy="110" r="6" fill="#FFFBEB" />
      </g>
      <g className="de-appear-2">
        <ellipse cx="130" cy="64" rx="105" ry="46" fill="#FFFBEB" />
        <text x="62" y="46" fontSize="12" fontWeight="700" fill="#A16207">16</text>
        <g transform="translate(118 48) scale(0.62)">
          <Sitting {...TEEN_MUM} mood="smile" />
          <g transform="translate(0 40)">
            <Sketchbook open />
          </g>
          <g transform="translate(14 34)">
            <g className="de-pencil">
              <line x1="0" y1="0" x2="10" y2="-10" stroke="#57534E" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>
        </g>
        <g className="de-appear-3" fill="#A16207">
          <text x="172" y="58" fontSize="13" fontStyle="italic">{"“you're good"}</text>
          <text x="178" y="74" fontSize="13" fontStyle="italic">at this”</text>
        </g>
      </g>
    </svg>
  );
}

function SceneSeen() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#1E293B" />
      <Rain />
      <Veranda />
      <circle cx="240" cy="226" r="70" fill="#FDE68A" opacity="0.3" />
      {/* Mum, and Mum at sixteen, in the same place */}
      <g transform="translate(195 150)">
        <g className="de-now">
          <Sitting {...MUM} mood="smile" />
        </g>
        <g className="de-then">
          <Sitting {...TEEN_MUM} mood="smile" />
          <g transform="translate(0 40)">
            <Sketchbook />
          </g>
        </g>
      </g>
      <g transform="translate(285 150)">
        <Sitting {...SOFIA} />
        <g transform="translate(0 40)">
          <Sketchbook />
        </g>
      </g>
      <Candle x={240} y={236} />
    </svg>
  );
}

function SceneLights() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#1E293B" />
      <Veranda />
      <circle cx="240" cy="30" r="8" fill="#FDE68A" className="de-appear-1" />
      <rect width="480" height="300" fill="#FFFBEB" className="de-lights-on" />
      <g transform="translate(195 150)">
        <g className="de-sit-out">
          <Sitting {...MUM} />
        </g>
      </g>
      <g transform="translate(195 150)">
        <g className="de-go">
          <Standing {...MUM} />
        </g>
      </g>
      <g transform="translate(285 150)">
        <Sitting {...SOFIA} />
      </g>
      {/* candle out, a thread of smoke */}
      <g transform="translate(240 236)">
        <rect x="-4" y="-2" width="8" height="16" rx="1" fill="#FEF3C7" />
        <g className="de-flame-out">
          <ellipse cx="0" cy="-7" rx="3.5" ry="6" fill="#F59E0B" />
        </g>
        <path className="de-smoke" d="M0 -4 q-5 -8 0 -14 t0 -16" stroke="#CBD5E1" strokeWidth="1.8" fill="none" />
      </g>
      <g className="de-appear-3">
        <Bubble x={40} y={70} w={170} text="Right. The freezer." tail="right" />
      </g>
    </svg>
  );
}

function SceneNote() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <Kitchen />
      <rect x="110" y="212" width="340" height="38" fill="#E2E8F0" />
      <rect x="110" y="202" width="340" height="10" fill="#CBD5E1" />
      <Containers />
      {/* the sketchbook, open on the bench */}
      <g transform="translate(330 186) scale(2.6)">
        <Sketchbook open />
      </g>
      <g className="de-note">
        <g transform="translate(362 172) rotate(6)">
          <rect x="-34" y="-18" width="68" height="36" fill="#FDE047" />
          <text x="0" y="5" fontSize="13" fontStyle="italic" fill="#1C1917" textAnchor="middle">
            This one.
          </text>
        </g>
      </g>
      {/* Sofia, finding it */}
      <g transform="translate(470 150)">
        <g className="de-peek">
          <Standing {...SOFIA} mood="smile" />
        </g>
      </g>
    </svg>
  );
}

/* --------------------------------------------------------------- style -- */

const FILM_CSS = `
@keyframes de-in { from { opacity: 0; } to { opacity: 1; } }
.de-appear-0 { animation: de-in 0.6s ease 0.4s both; }
.de-appear-1 { animation: de-in 0.6s ease 1.2s both; }
.de-appear-2 { animation: de-in 0.6s ease 2.6s both; }
.de-appear-3 { animation: de-in 0.6s ease 4.2s both; }
.de-appear-4 { animation: de-in 0.6s ease 6.6s both; }

.de-draw-1, .de-draw-2, .de-draw-3, .de-draw-4 { stroke-dasharray: 160; stroke-dashoffset: 160; animation: de-draw 1.4s ease-out both; }
.de-draw-1 { animation-delay: 1.4s; }
.de-draw-2 { animation-delay: 2.6s; }
.de-draw-3 { animation-delay: 3.8s; }
.de-draw-4 { animation-delay: 5s; }
@keyframes de-draw { to { stroke-dashoffset: 0; } }

.de-clash { animation: de-clash 0.5s ease 3.6s both; }
@keyframes de-clash { 0% { opacity: 0; transform: scale(0.6); } 60% { opacity: 1; transform: scale(1.15); } 100% { opacity: 1; transform: scale(1); } }
.de-clash { transform-box: fill-box; transform-origin: center; }
.de-leave { animation: de-leave 2.4s ease-in 5s both; }
@keyframes de-leave { from { transform: translateX(0); opacity: 1; } to { transform: translateX(170px); opacity: 0; } }

.de-wipe { animation: de-wipe 1.2s ease-in-out infinite; }
@keyframes de-wipe { 0%, 100% { transform: translateX(-22px); } 50% { transform: translateX(22px); } }

.de-rain { animation: de-rain 0.6s linear infinite; }
@keyframes de-rain { from { transform: translate(0, -20px); } to { transform: translate(-6px, 20px); } }
.de-lightning { opacity: 0; animation: de-lightning 0.9s ease-out 0.7s both; }
@keyframes de-lightning { 0% { opacity: 0; } 8% { opacity: 0.8; } 18% { opacity: 0; } 26% { opacity: 0.5; } 100% { opacity: 0; } }
.de-lights-out { animation: de-lights-out 9s linear both; }
@keyframes de-lights-out { 0%, 17% { opacity: 0.3; } 18%, 100% { opacity: 0; } }
.de-lamp-out { animation: de-lamp-out 9s linear both; }
@keyframes de-lamp-out { 0%, 17% { opacity: 1; } 18%, 100% { opacity: 0.08; } }
.de-candle-on { animation: de-in 1.4s ease 4.4s both; }
.de-flicker { transform-box: fill-box; transform-origin: bottom center; animation: de-flicker 0.4s ease-in-out infinite alternate; }
@keyframes de-flicker { from { transform: scale(1, 1) rotate(-3deg); } to { transform: scale(0.9, 1.08) rotate(3deg); } }

.de-pencil { animation: de-pencil 0.45s ease-in-out infinite; }
@keyframes de-pencil { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-6px, 2px); } }

.de-now { animation: de-now 9s ease-in-out both; }
@keyframes de-now { 0%, 22% { opacity: 1; } 40%, 62% { opacity: 0; } 82%, 100% { opacity: 1; } }
.de-then { animation: de-then 9s ease-in-out both; }
@keyframes de-then { 0%, 22% { opacity: 0; } 40%, 62% { opacity: 1; } 82%, 100% { opacity: 0; } }

.de-lights-on { animation: de-lights-on 8.5s ease both; }
@keyframes de-lights-on { 0%, 10% { opacity: 0; } 14%, 100% { opacity: 0.7; } }
.de-flame-out { animation: de-flame-out 8.5s linear both; }
@keyframes de-flame-out { 0%, 15% { opacity: 1; } 17%, 100% { opacity: 0; } }
.de-smoke { stroke-dasharray: 40; stroke-dashoffset: 40; animation: de-smoke 3s ease-out 1.5s both; }
@keyframes de-smoke { 0% { stroke-dashoffset: 40; opacity: 0.9; } 100% { stroke-dashoffset: 0; opacity: 0; } }
.de-sit-out { animation: de-sit-out 8.5s linear both; }
@keyframes de-sit-out { 0%, 30% { opacity: 1; } 32%, 100% { opacity: 0; } }
.de-go { animation: de-go 8.5s ease-in both; }
@keyframes de-go {
  0%, 30% { opacity: 0; transform: translateX(0); }
  32%, 60% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(-190px); }
}

.de-note { animation: de-note 0.7s ease-out 2.6s both; }
@keyframes de-note { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
.de-peek { animation: de-peek 1.6s ease-out 4.8s both; }
@keyframes de-peek { from { transform: translateX(60px); } to { transform: translateX(-20px); } }
`;
