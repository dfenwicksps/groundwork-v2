"use client";

import FilmPlayer, { type FilmScene } from "./FilmPlayer";

/**
 * "The Friend Who Stayed", told as an animated film instead of prose.
 *
 * The visual thread is Jonah disappearing: he fades as he pulls away (scenes
 * 2–4), fills back in while Leon sits with him (5–7), and by the last scene
 * he's solid enough to be the one doing the staying for someone else.
 */

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
  return <FilmPlayer storyId={storyId} scenes={SCENES} poster={<Poster />} css={FILM_CSS} />;
}

function Poster() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#FEF3E2" />
      <FenceAndLawn />
      <rect x="130" y="238" width="220" height="22" rx="3" fill="#A8A29E" />
      <g transform="translate(205 170)" opacity="0.75">
        <Sitting {...JONAH} />
      </g>
      <g transform="translate(275 170)">
        <Sitting {...LEON} />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- cast -- */

interface Look {
  skin: string;
  hair: string;
  top: string;
  curly?: boolean;
}

const JONAH: Look = { skin: "#E8B98A", hair: "#5B3A22", top: "#64748B" };
const LEON: Look = { skin: "#7A4A21", hair: "#1C1917", top: "#EA580C", curly: true };
const DAD: Look = { skin: "#E0AC7E", hair: "#3F2A1C", top: "#475569" };
const SAM: Look = { skin: "#C68642", hair: "#292524", top: "#0E7490" };
const JEANS = "#334155";

function Head({ skin, hair, curly, smile }: Look & { smile?: boolean }) {
  return (
    <g>
      <circle cx="0" cy="0" r="13" fill={skin} />
      {curly ? (
        <g fill={hair}>
          <circle cx="-8" cy="-8" r="6.5" />
          <circle cx="0" cy="-11" r="7" />
          <circle cx="8" cy="-8" r="6.5" />
        </g>
      ) : (
        <path d="M-13 -1 C-14 -18 14 -18 13 -1 C9 -9 -9 -9 -13 -1 Z" fill={hair} />
      )}
      <circle cx="-4.5" cy="1" r="1.5" fill="#1C1917" />
      <circle cx="4.5" cy="1" r="1.5" fill="#1C1917" />
      {smile ? (
        <path d="M-4 6 Q0 9.5 4 6" stroke="#1C1917" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M-3.5 7 H3.5" stroke="#1C1917" strokeWidth="1.4" strokeLinecap="round" />
      )}
    </g>
  );
}

function Standing(props: Look & { smile?: boolean }) {
  return (
    <g>
      <rect x="-11" y="56" width="9" height="28" rx="2" fill={JEANS} />
      <rect x="2" y="56" width="9" height="28" rx="2" fill={JEANS} />
      <path d="M-15 15 h30 l3 44 h-36 z" fill={props.top} />
      <Head {...props} />
    </g>
  );
}

function Sitting(props: Look & { smile?: boolean }) {
  return (
    <g>
      <path d="M-15 15 h30 l2 36 h-34 z" fill={props.top} />
      <rect x="-16" y="48" width="14" height="11" rx="3" fill={JEANS} />
      <rect x="2" y="48" width="14" height="11" rx="3" fill={JEANS} />
      <rect x="-15" y="56" width="11" height="24" rx="2" fill={JEANS} />
      <rect x="4" y="56" width="11" height="24" rx="2" fill={JEANS} />
      <Head {...props} />
    </g>
  );
}

function Headphones() {
  return (
    <g>
      <path d="M-14 0 C-15 -22 15 -22 14 0" stroke="#1E293B" strokeWidth="3" fill="none" />
      <rect x="-17" y="-4" width="6" height="11" rx="3" fill="#1E293B" />
      <rect x="11" y="-4" width="6" height="11" rx="3" fill="#1E293B" />
    </g>
  );
}

function Chips() {
  return (
    <g>
      <path d="M-9 -12 h18 l-2 24 h-14 z" fill="#FACC15" />
      <rect x="-8" y="-4" width="16" height="6" fill="#DC2626" />
    </g>
  );
}

function Footy() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="11" ry="7" fill="#92400E" />
      <path d="M-4 -1 H4" stroke="white" strokeWidth="1.2" />
      <path d="M-2 -3 V1 M0 -3 V1 M2 -3 V1" stroke="white" strokeWidth="0.8" />
    </g>
  );
}

function FenceAndLawn() {
  return (
    <g>
      <rect y="200" width="480" height="100" fill="#BBD9A5" />
      <g fill="#D6BC9A" stroke="#C4A57F" strokeWidth="1">
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={i * 30 + 2} y="118" width="26" height="90" />
        ))}
      </g>
    </g>
  );
}

function Bubble({
  x,
  y,
  w,
  text,
  tail = "left",
  italic,
}: {
  x: number;
  y: number;
  w: number;
  text: string;
  tail?: "left" | "right";
  italic?: boolean;
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
      <text
        x={x + w / 2}
        y={y + 21}
        fontSize="14"
        fontStyle={italic ? "italic" : undefined}
        fill="#1A1A1A"
        textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );
}

/* -------------------------------------------------------------- scenes -- */

function SceneSplit() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#E7E5F0" />
      <rect y="250" width="480" height="50" fill="#D6D3E0" />
      {/* window, dusk */}
      <rect x="200" y="50" width="80" height="60" rx="4" fill="#C7B8E0" stroke="#A89BC4" strokeWidth="2" />
      {/* the door dad leaves through */}
      <rect x="400" y="120" width="56" height="130" rx="3" fill="#8B7B6B" />
      <circle cx="446" cy="188" r="3" fill="#E7E5F0" />
      {/* stairs, Jonah watching from them */}
      <g fill="#C9C3D9">
        <rect x="0" y="230" width="130" height="20" />
        <rect x="0" y="210" width="105" height="20" />
        <rect x="0" y="190" width="80" height="20" />
        <rect x="0" y="170" width="55" height="20" />
      </g>
      <g transform="translate(78 132) scale(0.85)">
        <Sitting {...JONAH} />
      </g>
      {/* the table — two mugs, then one */}
      <rect x="170" y="212" width="130" height="8" rx="3" fill="#A8896B" />
      <rect x="180" y="220" width="7" height="30" fill="#8B7157" />
      <rect x="283" y="220" width="7" height="30" fill="#8B7157" />
      <rect x="208" y="198" width="14" height="14" rx="2" fill="#F8FAFC" stroke="#94A3B8" />
      <g className="fws-mug-fade">
        <rect x="248" y="198" width="14" height="14" rx="2" fill="#F8FAFC" stroke="#94A3B8" />
      </g>
      {/* dad, with the box, heading out */}
      <g transform="translate(320 150) scale(1.12)">
        <g className="fws-walk-out">
          <Standing {...DAD} />
          <rect x="-20" y="22" width="40" height="30" rx="2" fill="#C8A165" stroke="#A7834D" />
          <path d="M-20 32 H20" stroke="#A7834D" />
        </g>
      </g>
    </svg>
  );
}

function SceneDrift() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#EEF2FF" />
      <rect y="250" width="480" height="50" fill="#DCE1F7" />
      {/* the tree his mates still sit under */}
      <rect x="100" y="120" width="16" height="130" fill="#8B6F4E" />
      <circle cx="108" cy="105" r="62" fill="#A7D7B5" />
      <g transform="translate(55 188)">
        <g className="fws-bob">
          <Standing {...SAM} smile />
        </g>
      </g>
      <g transform="translate(160 188)">
        <g className="fws-bob-late">
          <Standing {...LEON} smile />
        </g>
      </g>
      <text x="92" y="165" fontSize="14" fontWeight="700" fill="#4338CA" className="fws-pop">haha</text>
      {/* Jonah, headphones on, drifting off — and fading */}
      <g transform="translate(250 166)">
        <g className="fws-drift">
          <Standing {...JONAH} />
          <Headphones />
        </g>
      </g>
      <g className="fws-appear-2">
        <rect x="300" y="60" width="160" height="40" rx="10" fill="#F1F5F9" stroke="#CBD5E1" />
        <text x="380" y="85" fontSize="13" fill="#475569" textAnchor="middle">{"can't make sat, sorry"}</text>
      </g>
    </svg>
  );
}

function SceneTexts() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#E5E7EB" />
      {/* the phone */}
      <rect x="140" y="8" width="200" height="300" rx="24" fill="#1E293B" />
      <rect x="150" y="22" width="180" height="290" rx="14" fill="white" />
      <text x="240" y="44" fontSize="13" fontWeight="700" fill="#1E293B" textAnchor="middle">Leon</text>
      <line x1="150" y1="54" x2="330" y2="54" stroke="#E2E8F0" />
      {/* 1: the dog in the hoodie */}
      <g className="fws-appear-0">
        <rect x="160" y="62" width="112" height="62" rx="10" fill="#E2E8F0" />
        <g transform="translate(216 96)">
          <path d="M-18 8 h36 l-3 18 h-30 z" fill="#EA580C" />
          <circle cx="0" cy="0" r="13" fill="#B45309" />
          <ellipse cx="-12" cy="-4" rx="5" ry="9" fill="#78350F" />
          <ellipse cx="12" cy="-4" rx="5" ry="9" fill="#78350F" />
          <circle cx="-4" cy="-2" r="1.6" fill="#1C1917" />
          <circle cx="4" cy="-2" r="1.6" fill="#1C1917" />
          <ellipse cx="0" cy="4" rx="3" ry="2" fill="#1C1917" />
          <path d="M-14 -8 Q0 -22 14 -8" stroke="#EA580C" strokeWidth="4" fill="none" />
        </g>
      </g>
      <g className="fws-appear-1">
        <rect x="160" y="132" width="118" height="28" rx="10" fill="#E2E8F0" />
        <text x="170" y="151" fontSize="13" fill="#1E293B">bro. the hoodie</text>
      </g>
      <g className="fws-appear-2">
        <rect x="160" y="168" width="108" height="28" rx="10" fill="#E2E8F0" />
        <text x="170" y="187" fontSize="13" fill="#1E293B">u coming sat?</text>
      </g>
      <g className="fws-appear-3">
        <rect x="160" y="204" width="118" height="28" rx="10" fill="#E2E8F0" />
        <text x="170" y="223" fontSize="13" fill="#1E293B">ok next sat then</text>
      </g>
      <g className="fws-appear-4">
        <rect x="160" y="240" width="140" height="28" rx="10" fill="#E2E8F0" />
        <text x="170" y="259" fontSize="13" fill="#1E293B">anyway. another dog</text>
      </g>
      <text x="320" y="284" fontSize="11" fill="#94A3B8" textAnchor="end" className="fws-appear-5">
        Seen
      </text>
    </svg>
  );
}

function SceneDoor() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#F1E8DA" />
      <rect y="262" width="480" height="38" fill="#D6C7B0" />
      <rect x="190" y="252" width="110" height="12" fill="#B8A68C" />
      {/* doorway, dim inside; Jonah there once the door opens */}
      <rect x="200" y="100" width="90" height="152" fill="#475569" />
      <g transform="translate(245 168)" opacity="0.6">
        <Standing {...JONAH} />
      </g>
      <g className="fws-door-open">
        <rect x="200" y="100" width="90" height="152" fill="#7C5E45" />
        <rect x="212" y="114" width="66" height="54" rx="2" fill="none" stroke="#6B4F3A" strokeWidth="2" />
        <rect x="212" y="182" width="66" height="54" rx="2" fill="none" stroke="#6B4F3A" strokeWidth="2" />
        <circle cx="278" cy="178" r="3.5" fill="#E7C98F" />
      </g>
      <text x="330" y="96" fontSize="14" fontWeight="700" fill="#B45309" className="fws-ding">ding dong</text>
      {/* Leon on the step, chips and footy */}
      <g transform="translate(365 176)">
        <Standing {...LEON} smile />
        <g transform="translate(-20 38)">
          <Chips />
        </g>
        <g transform="translate(20 40)">
          <Footy />
        </g>
      </g>
      <g className="fws-appear-3">
        <Bubble x={320} y={110} w={150} text="I was in the area." tail="left" />
      </g>
    </svg>
  );
}

function SceneStep() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#FEF3E2" />
      {/* an hour passes: the sun crosses and warms */}
      <g transform="translate(70 60)">
        <g className="fws-sun">
          <circle cx="0" cy="0" r="22" fill="#FBBF24" />
        </g>
      </g>
      <FenceAndLawn />
      <rect x="130" y="238" width="220" height="22" rx="3" fill="#A8A29E" />
      <g transform="translate(205 170)">
        <g className="fws-fill-slow">
          <Sitting {...JONAH} />
        </g>
      </g>
      <g transform="translate(275 170)">
        <Sitting {...LEON} />
      </g>
      {/* the footy, off the fence and back */}
      <g transform="translate(300 262)">
        <g className="fws-kick">
          <Footy />
        </g>
      </g>
    </svg>
  );
}

function SceneSaid() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#FDE9CF" />
      <FenceAndLawn />
      <rect x="130" y="238" width="220" height="22" rx="3" fill="#A8A29E" />
      <g transform="translate(205 170)" opacity="0.85">
        <Sitting {...JONAH} />
      </g>
      <g transform="translate(275 170)">
        <Sitting {...LEON} />
      </g>
      <g className="fws-appear-1">
        <Bubble x={60} y={70} w={140} text="Dad moved out." tail="right" />
      </g>
      <g className="fws-appear-3">
        <Bubble x={270} y={70} w={200} text="Figured it was something." tail="left" italic />
      </g>
      {/* the chips, passed along the step */}
      <g transform="translate(305 226)">
        <g className="fws-pass">
          <Chips />
        </g>
      </g>
    </svg>
  );
}

function SceneStayed() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#FEF3E2" />
      <circle cx="170" cy="190" r="80" fill="#FDE68A" className="fws-glow" />
      {/* every text Leon sent, a line he kept holding out */}
      <path
        className="fws-thread"
        d="M345 170 C300 110 250 240 205 170"
        fill="none"
        stroke="#EA580C"
        strokeWidth="3"
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
      <g className="fws-dots">
        <rect x="266" y="118" width="22" height="14" rx="5" fill="#E2E8F0" />
        <rect x="232" y="196" width="22" height="14" rx="5" fill="#E2E8F0" />
        <rect x="300" y="160" width="22" height="14" rx="5" fill="#E2E8F0" />
      </g>
      {/* Jonah, faint outline filling back in */}
      <g transform="translate(170 150)">
        <g opacity="0.35">
          <Standing {...JONAH} />
        </g>
        <g className="fws-fill-in">
          <Standing {...JONAH} smile />
        </g>
      </g>
      <g transform="translate(360 150)">
        <Standing {...LEON} smile />
      </g>
    </svg>
  );
}

function SceneNow() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#EEF2FF" />
      <rect y="250" width="480" height="50" fill="#DCE1F7" />
      {/* Jonah, solid now, phone out */}
      <g transform="translate(120 166)">
        <Standing {...JONAH} smile />
        <rect x="10" y="26" width="12" height="20" rx="2" fill="#1E293B" />
      </g>
      <g className="fws-appear-1">
        <rect x="150" y="80" width="150" height="34" rx="12" fill="#0E7490" />
        <path d="M170 113 l-6 12 14 -12" fill="#0E7490" />
        <text x="225" y="102" fontSize="13" fill="white" textAnchor="middle">sam. look at this dog</text>
      </g>
      {/* Sam, alone on the bench, going quiet */}
      <rect x="330" y="232" width="110" height="10" rx="3" fill="#8B7157" />
      <rect x="340" y="242" width="6" height="16" fill="#8B7157" />
      <rect x="424" y="242" width="6" height="16" fill="#8B7157" />
      <g transform="translate(385 180)">
        <g className="fws-sam">
          <Sitting {...SAM} />
        </g>
        <g className="fws-buzz">
          <rect x="10" y="30" width="12" height="18" rx="2" fill="#1E293B" />
          <path d="M26 32 l5 -3 M26 40 h6 M26 48 l5 3" stroke="#0E7490" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/* --------------------------------------------------------------- style -- */

const FILM_CSS = `
@keyframes fws-in { from { opacity: 0; } to { opacity: 1; } }
.fws-appear-0 { animation: fws-in 0.6s ease 0.4s both; }
.fws-appear-1 { animation: fws-in 0.6s ease 1.5s both; }
.fws-appear-2 { animation: fws-in 0.6s ease 3s both; }
.fws-appear-3 { animation: fws-in 0.6s ease 4.5s both; }
.fws-appear-4 { animation: fws-in 0.6s ease 6s both; }
.fws-appear-5 { animation: fws-in 0.6s ease 7.2s both; }

.fws-bob { animation: fws-bob 0.9s ease-in-out infinite; }
.fws-bob-late { animation: fws-bob 0.9s ease-in-out 0.35s infinite; }
@keyframes fws-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.fws-pop { animation: fws-pop 2.4s ease-in-out infinite; }
@keyframes fws-pop { 0%, 20% { opacity: 0; } 35%, 70% { opacity: 1; } 90%, 100% { opacity: 0; } }

.fws-mug-fade { animation: fws-mug 9s linear both; }
@keyframes fws-mug { 0%, 55% { opacity: 1; } 75%, 100% { opacity: 0; } }
.fws-walk-out { animation: fws-walk-out 8s ease-in both; }
@keyframes fws-walk-out {
  0%, 10% { transform: translateX(0); opacity: 1; }
  80% { transform: translateX(90px); opacity: 1; }
  100% { transform: translateX(110px); opacity: 0; }
}

.fws-drift { animation: fws-drift 8.5s ease-in-out both; }
@keyframes fws-drift {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(150px); opacity: 0.45; }
}

.fws-door-open { transform-box: fill-box; transform-origin: left center; animation: fws-door 1.2s ease-out 2.6s both; }
@keyframes fws-door { from { transform: scaleX(1); } to { transform: scaleX(0.12); } }
.fws-ding { animation: fws-ding 1.4s ease 0.6s both; }
@keyframes fws-ding { 0% { opacity: 0; transform: translateY(6px); } 30%, 70% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; } }

.fws-sun { animation: fws-sun 9.5s linear both; }
@keyframes fws-sun {
  0% { transform: translate(0, 0); }
  50% { transform: translate(170px, -30px); }
  100% { transform: translate(340px, 40px); }
}
.fws-fill-slow { animation: fws-fill-slow 9.5s linear both; }
@keyframes fws-fill-slow { from { opacity: 0.6; } to { opacity: 0.85; } }
.fws-kick { animation: fws-kick 3.2s ease-in-out 0.8s infinite; }
@keyframes fws-kick {
  0%, 15% { transform: translate(0, 0) rotate(0deg); }
  40% { transform: translate(40px, -110px) rotate(200deg); }
  65%, 100% { transform: translate(0, 0) rotate(360deg); }
}

.fws-pass { animation: fws-pass 0.9s ease-in-out 6.6s both; }
@keyframes fws-pass { from { transform: translateX(0); } to { transform: translateX(-56px); } }

/* the dots flow from Leon towards Jonah (the path runs that way) */
.fws-thread { animation: fws-in 1s ease 0.4s both, fws-flow 1s linear infinite; }
@keyframes fws-flow { to { stroke-dashoffset: -22; } }
.fws-dots { animation: fws-in 0.8s ease 1.4s both; }
.fws-fill-in { animation: fws-in 2.5s ease 3s both; }
.fws-glow { animation: fws-glow 8.5s ease both; }
@keyframes fws-glow { 0%, 40% { opacity: 0; } 100% { opacity: 0.7; } }

.fws-buzz { animation: fws-buzz 0.12s linear 3s 8 both; }
@keyframes fws-buzz { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(2px); } }
.fws-sam { animation: fws-sam 10s ease both; }
@keyframes fws-sam { 0%, 35% { opacity: 0.6; transform: translateY(0); } 55%, 100% { opacity: 0.8; transform: translateY(-3px); } }
`;
