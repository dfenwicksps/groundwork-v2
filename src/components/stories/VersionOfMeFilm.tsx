"use client";

import FilmPlayer, { type FilmScene } from "./FilmPlayer";

/**
 * "The Version of Me at School", told as an animated film instead of prose.
 * Eight scenes: Priya loud at home, the mask going on at the school gate, the
 * yes that meant maybe, the assignment, the reading, the listening quiet, the
 * two versions of her meeting, and a next day that isn't a tidy ending.
 */

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
    art: <SceneClassroom />,
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
    art: <SceneQuiet />,
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

export default function VersionOfMeFilm({ storyId }: { storyId: string }) {
  return <FilmPlayer storyId={storyId} scenes={SCENES} poster={<Poster />} css={FILM_CSS} />;
}

function Poster() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#EEF2FF" />
      <rect x="240" width="240" height="300" fill="#E2E6F5" />
      <rect width="240" height="300" fill="#FFF7ED" />
      <g transform="translate(190 125)">
        <Priya />
      </g>
      <g transform="translate(290 125)">
        <Priya dress={GREY} />
        <Mask />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- cast -- */

const SKIN = "#8D5524";
const HAIR = "#2B2118";
const DRESS = "#F59E0B";
const GREY = "#9CA3AF";

function Priya({ dress = DRESS }: { dress?: string }) {
  return (
    <g>
      <circle cx="14" cy="-6" r="7" fill={HAIR} />
      <path d="M-15 16 h30 l-4 54 h-22 z" fill={dress} />
      <circle cx="0" cy="0" r="14" fill={SKIN} />
      <path d="M-15 2 C-17 -18 17 -18 15 2 C12 -8 -6 -12 -15 2 Z" fill={HAIR} />
      <circle cx="-5" cy="1" r="1.6" fill={HAIR} />
      <circle cx="5" cy="1" r="1.6" fill={HAIR} />
      <path d="M-4 7 Q0 10 4 7" stroke={HAIR} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

// The polite, blank face Priya wears at school.
function Mask() {
  return (
    <g>
      <ellipse cx="0" cy="1" rx="12.5" ry="12" fill="#F3F0EA" stroke="#D6D3CD" strokeWidth="1.5" />
      <circle cx="-5" cy="0" r="1.6" fill="#63605A" />
      <circle cx="5" cy="0" r="1.6" fill="#63605A" />
      <path d="M-5 7 H5" stroke="#63605A" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function Classmate({ skin, top }: { skin: string; top: string }) {
  return (
    <g>
      <circle cx="0" cy="-10" r="12" fill={skin} />
      <rect x="-12" y="2" width="24" height="34" rx="8" fill={top} />
    </g>
  );
}

/* -------------------------------------------------------------- scenes -- */

function SceneHome() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#FFF7ED" />
      <rect y="250" width="480" height="50" fill="#FDE9CF" />
      <rect x="40" y="40" width="90" height="70" rx="6" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
      <line x1="85" y1="40" x2="85" y2="110" stroke="#F59E0B" strokeWidth="2" />
      {/* the couch and the family, laughing */}
      <rect x="290" y="200" width="150" height="50" rx="14" fill="#C2703D" />
      <rect x="282" y="180" width="166" height="30" rx="12" fill="#A85C2F" />
      <g transform="translate(335 172)">
        <g className="vmf-bob">
          <Classmate skin="#7A4A21" top="#0E7490" />
        </g>
      </g>
      <g transform="translate(395 172)">
        <g className="vmf-bob-late">
          <Classmate skin="#6B3E1B" top="#15803D" />
        </g>
      </g>
      <text x="318" y="135" className="vmf-pop" fontSize="16" fontWeight="700" fill="#C2703D">ha!</text>
      <text x="385" y="120" className="vmf-pop-late" fontSize="16" fontWeight="700" fill="#C2703D">stop! ha ha</text>
      {/* Priya, mid-song */}
      <g transform="translate(170 180)">
        <g className="vmf-sway">
          <line x1="-13" y1="24" x2="-34" y2="4" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
          <line x1="13" y1="24" x2="34" y2="2" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
          <Priya />
          <ellipse cx="0" cy="8" rx="4" ry="3.5" fill={HAIR} />
        </g>
      </g>
      <g fill="#4338CA">
        <text x="205" y="130" fontSize="22" className="vmf-note">♪</text>
        <text x="228" y="112" fontSize="18" className="vmf-note-2">♩</text>
        <text x="190" y="102" fontSize="16" className="vmf-note-3">♪</text>
      </g>
    </svg>
  );
}

function SceneGate() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#EEF2FF" />
      <rect width="190" height="300" fill="#FFF7ED" className="vmf-warm-shrink" />
      <rect y="250" width="480" height="50" fill="#DCE1F7" />
      <g transform="translate(30 110)">
        <rect x="0" y="30" width="80" height="80" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" rx="4" />
        <path d="M-8 32 L40 -4 L88 32 Z" fill="#F59E0B" />
        <rect x="30" y="70" width="20" height="40" fill="#C2703D" rx="2" />
      </g>
      <g stroke="#4338CA" strokeWidth="4" opacity="0.85">
        <line x1="380" y1="110" x2="380" y2="250" />
        <line x1="450" y1="110" x2="450" y2="250" />
        <line x1="372" y1="120" x2="458" y2="120" />
        <line x1="398" y1="120" x2="398" y2="250" />
        <line x1="415" y1="120" x2="415" y2="250" />
        <line x1="432" y1="120" x2="432" y2="250" />
      </g>
      <text x="415" y="100" fontSize="12" fontWeight="700" fill="#4338CA" textAnchor="middle" letterSpacing="2">SCHOOL</text>
      {/* the walk: colour drains, the mask comes down */}
      <g transform="translate(0 175)">
        <g className="vmf-cross">
          <g className="vmf-fade-out">
            <Priya />
          </g>
          <g className="vmf-fade-in">
            <Priya dress={GREY} />
          </g>
          <g className="vmf-mask-on">
            <Mask />
          </g>
        </g>
      </g>
    </svg>
  );
}

function SceneClassroom() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#EEF2FF" />
      <ellipse cx="240" cy="258" rx="160" ry="24" fill="#DCE1F7" />
      <g transform="translate(150 200)">
        <g className="vmf-bob">
          <Classmate skin="#B06A3B" top="#0E7490" />
        </g>
      </g>
      <g transform="translate(330 200)">
        <g className="vmf-bob-late">
          <Classmate skin="#E0AC69" top="#4338CA" />
        </g>
      </g>
      <text x="345" y="160" fontSize="14" fontWeight="700" fill="#4338CA" className="vmf-appear-0">HAHA</text>
      <g transform="translate(240 185)">
        <Priya dress={GREY} />
        <Mask />
      </g>
      {/* what she says… */}
      <g className="vmf-appear-1">
        <rect x="258" y="112" width="64" height="30" rx="10" fill="white" stroke="#D6D3CD" />
        <path d="M266 141 l4 10 6 -10" fill="white" stroke="#D6D3CD" />
        <text x="290" y="132" fontSize="15" fontWeight="600" fill="#1A1A1A" textAnchor="middle">Yes!</text>
      </g>
      {/* …and what she means */}
      <g className="vmf-appear-2">
        <ellipse cx="160" cy="95" rx="54" ry="25" fill="white" stroke="#9CA3AF" strokeDasharray="4 4" />
        <circle cx="200" cy="130" r="5" fill="white" stroke="#9CA3AF" strokeDasharray="3 3" />
        <circle cx="214" cy="146" r="3" fill="white" stroke="#9CA3AF" strokeDasharray="3 3" />
        <text x="160" y="100" fontSize="14" fontStyle="italic" fill="#63605A" textAnchor="middle">…maybe?</text>
      </g>
      <text x="170" y="206" fontSize="13" fill="#9CA3AF" className="vmf-appear-3">ha. ha.</text>
    </svg>
  );
}

function SceneAssignment() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#EEF2FF" />
      <rect x="30" y="40" width="200" height="110" rx="6" fill="white" stroke="#D6D3CD" strokeWidth="2" />
      <text x="130" y="72" fontSize="11" fill="#63605A" textAnchor="middle">ENGLISH · YEAR 10</text>
      <text x="130" y="98" fontSize="15" fontWeight="600" fill="#4338CA" textAnchor="middle">Write about someone</text>
      <text x="130" y="120" fontSize="15" fontWeight="600" fill="#4338CA" textAnchor="middle">you admire.</text>
      {/* the desk */}
      <rect x="280" y="232" width="130" height="10" rx="4" fill="#C2703D" />
      <rect x="290" y="242" width="8" height="48" fill="#A85C2F" />
      <rect x="392" y="242" width="8" height="48" fill="#A85C2F" />
      <rect x="352" y="224" width="36" height="8" rx="1" fill="white" stroke="#D6D3CD" />
      <g transform="translate(335 185)">
        <Priya dress={GREY} />
        <g transform="translate(13 24)">
          <g className="vmf-write">
            <line x1="0" y1="0" x2="20" y2="14" stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>
      </g>
      {/* the thought: her grandmother, hands on hips */}
      <g className="vmf-appear-2">
        <ellipse cx="335" cy="88" rx="74" ry="50" fill="#FFF7ED" stroke="#F59E0B" strokeDasharray="5 5" />
        <circle cx="340" cy="150" r="6" fill="#FFF7ED" stroke="#F59E0B" strokeDasharray="3 3" />
        <circle cx="338" cy="166" r="4" fill="#FFF7ED" stroke="#F59E0B" strokeDasharray="3 3" />
        <g transform="translate(335 84)">
          <path d="M-12 -2 h24 l4 40 h-32 z" fill="#B45309" />
          <path d="M-12 4 q-12 6 -4 16" stroke={SKIN} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M12 4 q12 6 4 16" stroke={SKIN} strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="0" cy="-16" r="12" fill={SKIN} />
          <path d="M-12 -18 C-12 -34 12 -34 12 -18 C8 -26 -8 -26 -12 -18 Z" fill="#E5E7EB" />
          <circle cx="0" cy="-32" r="5" fill="#E5E7EB" />
          <path d="M-4 -10 Q0 -6 4 -10" stroke={HAIR} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

function SceneReading() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#EEF2FF" />
      <g fill="#B0B7D9">
        <circle cx="80" cy="270" r="18" />
        <circle cx="155" cy="276" r="18" />
        <circle cx="325" cy="276" r="18" />
        <circle cx="400" cy="270" r="18" />
      </g>
      <g transform="translate(240 150)">
        {/* colour coming back as she reads */}
        <g className="vmf-fade-out-slow">
          <Priya dress={GREY} />
        </g>
        <g className="vmf-fade-in-slow">
          <Priya />
        </g>
        <g className="vmf-mask-slip">
          <Mask />
        </g>
        <g transform="translate(16 18)">
          <g className="vmf-tremble">
            <rect x="0" y="0" width="30" height="38" rx="3" fill="white" stroke="#D6D3CD" />
            <g stroke="#9CA3AF" strokeWidth="1.5">
              <line x1="5" y1="8" x2="25" y2="8" />
              <line x1="5" y1="14" x2="25" y2="14" />
              <line x1="5" y1="20" x2="21" y2="20" />
              <line x1="5" y1="26" x2="24" y2="26" />
            </g>
          </g>
        </g>
      </g>
      {/* her voice: steady, then a crack, then steady again */}
      <path
        className="vmf-voice"
        d="M40 80 q15 -12 30 0 t30 0 t30 0 t30 0 l8 -26 8 38 8 -18 q10 -8 22 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0"
        fill="none"
        stroke="#0E7490"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SceneQuiet() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#E2E6F5" />
      <ellipse cx="170" cy="170" rx="90" ry="120" fill="#FFF7ED" opacity="0.8" className="vmf-appear-0" />
      <g transform="translate(170 140)">
        <Priya />
      </g>
      {/* the girl she barely knew */}
      <g transform="translate(330 150)">
        <g className="vmf-approach">
          <Classmate skin="#E0AC69" top="#0E7490" />
          <path d="M-6 -12 C-8 -26 8 -26 6 -12" fill="#7C2D12" />
          <rect x="-13" y="-22" width="26" height="8" rx="4" fill="#7C2D12" />
        </g>
      </g>
      <g className="vmf-appear-3">
        <rect x="236" y="62" width="200" height="38" rx="12" fill="white" stroke="#D6D3CD" />
        <path d="M300 99 l-6 14 16 -14" fill="white" stroke="#D6D3CD" />
        <text x="336" y="86" fontSize="14" fontStyle="italic" fill="#1A1A1A" textAnchor="middle">
          “That was really something.”
        </text>
      </g>
    </svg>
  );
}

function SceneWhole() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#FFF7ED" />
      <circle cx="240" cy="165" r="95" fill="#FDE68A" className="vmf-halo" />
      {/* home-Priya and school-Priya walk into each other; one remains */}
      <g transform="translate(0 140)">
        <g className="vmf-merge-l">
          <Priya />
        </g>
      </g>
      <g transform="translate(0 140)">
        <g className="vmf-merge-r">
          <Priya dress={GREY} />
          <Mask />
        </g>
      </g>
    </svg>
  );
}

function SceneAfter() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-auto block" aria-hidden="true">
      <rect width="480" height="300" fill="#EEF2FF" />
      <rect y="250" width="480" height="50" fill="#DCE1F7" />
      {/* not all the way back to home-colour — no tidy endings */}
      <g transform="translate(200 170)">
        <Priya dress="#F7C77E" />
        {/* her bag, with the mask tucked in the pocket */}
        <rect x="-26" y="30" width="22" height="26" rx="4" fill="#4338CA" />
        <g transform="translate(-15 30) rotate(-20)">
          <ellipse cx="0" cy="-2" rx="8" ry="8" fill="#F3F0EA" stroke="#D6D3CD" strokeWidth="1.2" />
        </g>
      </g>
      <g transform="translate(280 185)">
        <Classmate skin="#E0AC69" top="#0E7490" />
        <rect x="-13" y="-22" width="26" height="8" rx="4" fill="#7C2D12" />
      </g>
      <text x="240" y="148" fontSize="15" fontWeight="700" fill="#C2703D" textAnchor="middle" className="vmf-pop">
        ha!
      </text>
    </svg>
  );
}

/* --------------------------------------------------------------- style -- */

const FILM_CSS = `

.vmf-sway { animation: vmf-sway 1.6s ease-in-out infinite; transform-origin: 0px 60px; }
@keyframes vmf-sway { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
.vmf-bob { animation: vmf-bob 0.9s ease-in-out infinite; }
.vmf-bob-late { animation: vmf-bob 0.9s ease-in-out 0.35s infinite; }
@keyframes vmf-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.vmf-pop { animation: vmf-pop 2.4s ease-in-out infinite; }
.vmf-pop-late { animation: vmf-pop 2.4s ease-in-out 1.1s infinite; }
@keyframes vmf-pop { 0%, 20% { opacity: 0; } 35%, 70% { opacity: 1; } 90%, 100% { opacity: 0; } }
.vmf-note, .vmf-note-2, .vmf-note-3 { animation: vmf-note 2.6s ease-out infinite; }
.vmf-note-2 { animation-delay: 0.8s; }
.vmf-note-3 { animation-delay: 1.6s; }
@keyframes vmf-note { 0% { opacity: 0; transform: translateY(10px); } 25% { opacity: 1; } 100% { opacity: 0; transform: translateY(-34px); } }

.vmf-cross { animation: vmf-cross 8s linear both; }
@keyframes vmf-cross { from { transform: translateX(120px); } to { transform: translateX(330px); } }
.vmf-fade-out { animation: vmf-out 8s linear both; }
.vmf-fade-in { animation: vmf-fin 8s linear both; }
@keyframes vmf-out { 0%, 30% { opacity: 1; } 65%, 100% { opacity: 0; } }
@keyframes vmf-fin { 0%, 30% { opacity: 0; } 65%, 100% { opacity: 1; } }
.vmf-mask-on { animation: vmf-mask-on 8s ease-out both; }
@keyframes vmf-mask-on { 0%, 40% { opacity: 0; transform: translateY(-45px); } 62%, 100% { opacity: 1; transform: translateY(0); } }
.vmf-warm-shrink { animation: vmf-warm-shrink 8s ease-in-out both; }
@keyframes vmf-warm-shrink { from { transform: scaleX(1); } to { transform: scaleX(0.3); } }

.vmf-appear-0 { animation: vmf-in 0.8s ease 0.3s both; }
.vmf-appear-1 { animation: vmf-in 0.6s ease 1s both; }
.vmf-appear-2 { animation: vmf-in 0.9s ease 3s both; }
.vmf-appear-3 { animation: vmf-in 0.9s ease 5.2s both; }
@keyframes vmf-in { from { opacity: 0; } to { opacity: 1; } }

.vmf-write { animation: vmf-write 0.5s ease-in-out infinite; }
@keyframes vmf-write { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }

.vmf-tremble { animation: vmf-tremble 0.3s ease-in-out infinite; }
@keyframes vmf-tremble { 0%,100% { transform: rotate(-1deg); } 50% { transform: rotate(2deg); } }
.vmf-voice { stroke-dasharray: 700; stroke-dashoffset: 700; animation: vmf-voice 7s linear 0.5s both; }
@keyframes vmf-voice { to { stroke-dashoffset: 0; } }
.vmf-mask-slip { animation: vmf-mask-slip 8s ease-in both; }
@keyframes vmf-mask-slip {
  0%, 40% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  60% { opacity: 1; transform: translate(-4px, 10px) rotate(-18deg); }
  85%, 100% { opacity: 0; transform: translate(-18px, 90px) rotate(-70deg); }
}
.vmf-fade-out-slow { animation: vmf-out-slow 8s linear both; }
.vmf-fade-in-slow { animation: vmf-fin-slow 8s linear both; }
@keyframes vmf-out-slow { 0%, 45% { opacity: 1; } 90%, 100% { opacity: 0; } }
@keyframes vmf-fin-slow { 0%, 45% { opacity: 0; } 90%, 100% { opacity: 1; } }

.vmf-approach { animation: vmf-approach 4s ease-out 2s both; }
@keyframes vmf-approach { from { transform: translateX(160px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

.vmf-merge-l { animation: vmf-merge-l 6s ease-in-out both; }
@keyframes vmf-merge-l { 0%, 15% { transform: translateX(130px); } 75%, 100% { transform: translateX(240px); } }
.vmf-merge-r { animation: vmf-merge-r 6s ease-in-out both; }
@keyframes vmf-merge-r {
  0%, 15% { transform: translateX(350px); opacity: 1; }
  75% { transform: translateX(240px); opacity: 0.4; }
  100% { transform: translateX(240px); opacity: 0; }
}
.vmf-halo { animation: vmf-halo 6s ease both; }
@keyframes vmf-halo { 0%, 55% { opacity: 0; } 100% { opacity: 0.6; } }
`;
