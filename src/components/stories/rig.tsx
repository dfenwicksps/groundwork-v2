// ─── Character rig for the story films ────────────────────────────────────────
// One figure, drawn in a flat illustration style: teen proportions (about five
// and a half heads tall), shaded clothing, hair in front of and behind the
// head, a face that can blink and change expression, and arms that bend at the
// shoulder and elbow so a scene can make them gesture.
//
// Coordinates: the figure stands with its feet at (0, 0) and is 160 units
// tall, facing the viewer. Place it in a scene with translate() and scale().
//
// Animating a limb: pass `cls` on an arm or leg. The joint's rest angle is set
// with an inline transform, which a CSS animation on that class overrides, so
// keyframes should state absolute angles. Joints rotate about their own origin
// (shoulder, elbow, hip), which is where each group is translated to.

export type HairStyle = "long" | "bun" | "short" | "curly" | "bob" | "ponytail";
export type TopStyle = "hoodie" | "jumper" | "tee" | "cardigan" | "blazer";
export type BottomStyle = "skirt" | "pants" | "leggings";
export type Expression =
  | "neutral"
  | "smile"
  | "laugh"
  | "sing"
  | "flat"
  | "worried"
  | "soft"
  | "speak";

export interface Look {
  skin: string;
  skinShade: string;
  hair: string;
  hairShade: string;
  hairStyle: HairStyle;
  top: string;
  topShade: string;
  topStyle: TopStyle;
  bottom: string;
  bottomStyle: BottomStyle;
  shoes: string;
  /** School shirt showing at the collar */
  collar?: string;
  socks?: string;
  glasses?: boolean;
  /** A shawl over the shoulders (the grandmother) */
  shawl?: string;
}

export interface Limb {
  /** Shoulder or hip angle in degrees; 0 hangs straight down, positive swings outward */
  a: number;
  /** Elbow or knee angle relative to the upper segment; positive continues outward */
  b?: number;
  cls?: string;
  clsLower?: string;
}

export interface FigureProps {
  look: Look;
  expression?: Expression;
  /** Viewer's left / right */
  leftArm?: Limb;
  rightArm?: Limb;
  leftLeg?: Limb;
  rightLeg?: Limb;
  /** Upper body only — for anyone behind a desk, table or couch */
  upper?: boolean;
  /** Sitting, seen from the front: hips at y = -72, feet about 27 units above the origin */
  seated?: boolean;
  /** Class on the head group (nods, tilts) */
  headCls?: string;
  /** Class on the whole body above the legs (sway, bob) */
  bodyCls?: string;
  /** Draws a porcelain mask over the face */
  mask?: boolean;
  maskCls?: string;
  /** Rendered in the hand of the right arm (a brush, a page, a phone) */
  rightHand?: React.ReactNode;
  leftHand?: React.ReactNode;
  shadow?: boolean;
}

const INK = "#1E1512";

function Arm({
  look,
  limb,
  hand,
}: {
  look: Look;
  limb: Limb;
  hand?: React.ReactNode;
}) {
  const sleeve = look.topStyle === "tee" ? look.skin : look.top;
  return (
    <g transform="translate(-16 -113)">
      <g className={limb.cls} style={{ transform: `rotate(${limb.a}deg)` }}>
        <line x1="0" y1="0" x2="0" y2="25" stroke={look.top} strokeWidth="9" strokeLinecap="round" />
        <line x1="-2.2" y1="2" x2="-2.2" y2="23" stroke={look.topShade} strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
        <g transform="translate(0 25)">
          <g className={limb.clsLower} style={{ transform: `rotate(${limb.b ?? 0}deg)` }}>
            <line x1="0" y1="0" x2="0" y2="27" stroke={sleeve} strokeWidth="8" strokeLinecap="round" />
            {look.topStyle !== "tee" && (
              <line x1="-3.8" y1="25" x2="3.8" y2="25" stroke={look.topShade} strokeWidth="2" strokeLinecap="round" />
            )}
            <circle cx="0" cy="30.5" r="3.9" fill={look.skin} />
            {hand && <g transform="translate(0 31)">{hand}</g>}
          </g>
        </g>
      </g>
    </g>
  );
}

function SeatedLeg({ look, side }: { look: Look; side: -1 | 1 }) {
  const legColour = look.bottomStyle === "skirt" ? look.skin : look.bottom;
  // Front view, sitting: the thigh comes towards the viewer, so it's short and
  // wide; the shin hangs straight down to the floor.
  return (
    <g transform={`translate(${side * 7} -72)`}>
      <rect x="-6.5" y="-2" width="13" height="16" rx="6" fill={legColour} />
      <line x1="0" y1="12" x2="0" y2="42" stroke={legColour} strokeWidth="10" strokeLinecap="round" />
      {look.socks && <line x1="0" y1="32" x2="0" y2="42" stroke={look.socks} strokeWidth="10" />}
      <path d="M-6 40 h12 c2.4 0 3.6 2.2 3.2 5.4 h-18.4 c-0.4 -3.2 0.8 -5.4 3.2 -5.4 z" fill={look.shoes} />
    </g>
  );
}

function Leg({ look, limb, side }: { look: Look; limb: Limb; side: -1 | 1 }) {
  const legColour = look.bottomStyle === "skirt" ? look.skin : look.bottom;
  return (
    <g transform={`translate(${side * 6} -72)`}>
      <g className={limb.cls} style={{ transform: `rotate(${side * -limb.a}deg)` }}>
        <line x1="0" y1="0" x2="0" y2="34" stroke={legColour} strokeWidth="11" strokeLinecap="round" />
        <g transform="translate(0 34)">
          <g className={limb.clsLower} style={{ transform: `rotate(${side * -(limb.b ?? 0)}deg)` }}>
            <line x1="0" y1="0" x2="0" y2="31" stroke={legColour} strokeWidth="10" strokeLinecap="round" />
            {look.socks && <line x1="0" y1="20" x2="0" y2="31" stroke={look.socks} strokeWidth="10" />}
            <path d="M-6 29 h12 c2.4 0 3.6 2.2 3.2 5.4 h-18.4 c-0.4 -3.2 0.8 -5.4 3.2 -5.4 z" fill={look.shoes} />
            <path d="M-8.6 34.4 h17.2" stroke="#000000" strokeWidth="1" opacity="0.15" />
          </g>
        </g>
      </g>
    </g>
  );
}

function Torso({ look }: { look: Look }) {
  return (
    <g>
      <path
        d="M-17 -119 C-22 -117 -22 -108 -21 -100 L-20 -70 C-10 -66 10 -66 20 -70 L21 -100 C22 -108 22 -117 17 -119 C8 -123 -8 -123 -17 -119 Z"
        fill={look.top}
      />
      <path d="M8 -121 C16 -120 21 -114 21 -100 L20 -70 C16 -68 12 -67 8 -67 Z" fill={look.topShade} opacity="0.35" />
      {look.topStyle === "hoodie" && (
        <g>
          <path d="M-11 -121 C-8 -114 8 -114 11 -121 C6 -123 -6 -123 -11 -121 Z" fill={look.topShade} opacity="0.6" />
          <path d="M-3 -116 L-3.5 -103 M3 -116 L3.5 -103" stroke="#F5EFE6" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M-11 -88 H11 L8 -78 H-8 Z" fill={look.topShade} opacity="0.45" />
          <path d="M-20 -73 C-10 -69 10 -69 20 -73" stroke={look.topShade} strokeWidth="3" fill="none" opacity="0.6" />
        </g>
      )}
      {look.topStyle === "jumper" && (
        <g>
          <path d="M-6.5 -120 L0 -107 L6.5 -120 Z" fill={look.collar ?? "#FFFFFF"} />
          <path d="M-6.5 -120 L-2 -114 L0 -120 Z M6.5 -120 L2 -114 L0 -120 Z" fill={look.collar ?? "#FFFFFF"} stroke="#D9D4CC" strokeWidth="0.6" />
          <path d="M-6.5 -120 L0 -107 L6.5 -120" stroke={look.topShade} strokeWidth="1.6" fill="none" />
          <path d="M-20 -73 C-10 -69 10 -69 20 -73" stroke={look.topShade} strokeWidth="3" fill="none" opacity="0.6" />
        </g>
      )}
      {look.topStyle === "tee" && (
        <path d="M-6 -120 C-4 -116 4 -116 6 -120" stroke={look.topShade} strokeWidth="1.6" fill="none" />
      )}
      {look.topStyle === "cardigan" && (
        <g>
          <path d="M0 -118 L0 -68" stroke={look.topShade} strokeWidth="1.4" />
          <circle cx="-2.5" cy="-104" r="1.1" fill={look.topShade} />
          <circle cx="-2.5" cy="-94" r="1.1" fill={look.topShade} />
          <circle cx="-2.5" cy="-84" r="1.1" fill={look.topShade} />
        </g>
      )}
      {look.topStyle === "blazer" && (
        <g>
          <path d="M-7 -120 L0 -96 L7 -120 Z" fill={look.collar ?? "#FFFFFF"} />
          <path d="M-7 -120 L-1 -96 L-9 -104 Z M7 -120 L1 -96 L9 -104 Z" fill={look.topShade} />
        </g>
      )}
      {look.shawl && (
        <g fill={look.shawl}>
          <path d="M-21 -111 C-19 -118 -11 -121 -6 -121 L-8 -100 C-10 -91 -13 -84 -17 -77 C-20 -88 -22 -100 -21 -111 Z" />
          <path d="M21 -111 C19 -118 11 -121 6 -121 L8 -100 C10 -91 13 -84 17 -77 C20 -88 22 -100 21 -111 Z" />
          <path d="M-8 -100 C-10 -91 -13 -84 -17 -77 M8 -100 C10 -91 13 -84 17 -77" stroke="#000000" strokeWidth="1" opacity="0.12" fill="none" />
        </g>
      )}
    </g>
  );
}

function BackHair({ look }: { look: Look }) {
  switch (look.hairStyle) {
    case "long":
      return (
        <g>
          <path d="M-14 -144 C-19 -128 -19 -108 -16 -95 C-8 -92 8 -92 16 -95 C19 -108 19 -128 14 -144 Z" fill={look.hair} />
          <path d="M9 -140 C14 -126 15 -110 13 -97" stroke={look.hairShade} strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      );
    case "bob":
      return <path d="M-14 -146 C-17 -134 -16 -124 -13 -122 C-6 -121 6 -121 13 -122 C16 -124 17 -134 14 -146 Z" fill={look.hair} />;
    case "ponytail":
      return <path d="M10 -150 C20 -146 22 -130 17 -118 C15 -126 14 -136 9 -142 Z" fill={look.hair} />;
    default:
      return null;
  }
}

function FrontHair({ look }: { look: Look }) {
  const h = look.hair;
  switch (look.hairStyle) {
    case "long":
      return (
        <g>
          <path d="M-12.6 -138 C-13.5 -152 -4 -156 2 -155 C9 -154 13.5 -149 12.6 -138 C10.5 -145 5 -149 -1 -148 C-6.5 -147 -10 -143 -12.6 -134 Z" fill={h} />
          <path d="M-12.6 -140 C-14.5 -131 -14 -123 -11 -117 C-11.5 -125 -11 -132 -9.5 -138 Z" fill={h} />
          <path d="M-2 -153 C3 -153 8 -150 10 -146" stroke={look.hairShade} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    case "bob":
      return (
        <g>
          <path d="M-12.6 -137 C-13 -152 -4 -155 1 -155 C8 -155 13.5 -150 12.6 -137 C11 -144 6 -147 0 -147 C-6 -147 -11 -144 -12.6 -137 Z" fill={h} />
          <path d="M-12.6 -140 C-14 -132 -13.5 -126 -12 -122 L-10 -136 Z M12.6 -140 C14 -132 13.5 -126 12 -122 L10 -136 Z" fill={h} />
        </g>
      );
    case "bun":
      return (
        <g>
          <circle cx="0" cy="-155" r="6.5" fill={h} />
          <path d="M-12.4 -137 C-13 -151 -5 -153 0 -153 C5 -153 13 -151 12.4 -137 C10 -145 5 -147 0 -147 C-5 -147 -10 -145 -12.4 -137 Z" fill={h} />
          <path d="M-4 -150 C-1 -148 3 -148 6 -150" stroke={look.hairShade} strokeWidth="1" fill="none" opacity="0.7" />
        </g>
      );
    case "curly":
      return (
        <g fill={h}>
          <circle cx="-9" cy="-147" r="5.5" />
          <circle cx="-3" cy="-152" r="6" />
          <circle cx="4" cy="-152" r="6" />
          <circle cx="10" cy="-147" r="5.5" />
          <circle cx="-12" cy="-141" r="4" />
          <circle cx="12" cy="-141" r="4" />
        </g>
      );
    case "ponytail":
      return (
        <path d="M-12.6 -137 C-13 -152 -4 -155 1 -155 C8 -155 13.5 -150 12.6 -137 C10 -146 4 -148 -2 -147 C-7 -146 -11 -142 -12.6 -137 Z" fill={h} />
      );
    case "short":
    default:
      return (
        <g>
          <path d="M-12.4 -136 C-13.5 -150 -6 -155 1 -155 C8 -155 13.5 -150 12.4 -136 C11.5 -143 7 -146 2 -146 C-3 -146 -9 -144 -12.4 -136 Z" fill={h} />
          <path d="M-4 -152 C1 -153 6 -151 9 -147" stroke={look.hairShade} strokeWidth="1.2" fill="none" opacity="0.7" />
        </g>
      );
  }
}

function Face({ look, expression }: { look: Look; expression: Expression }) {
  const brows: Record<Expression, string> = {
    neutral: "M-6.5 -143 q2 -1 4 0 M2.5 -143 q2 -1 4 0",
    smile: "M-6.5 -143.5 q2 -1.4 4 0 M2.5 -143.5 q2 -1.4 4 0",
    laugh: "M-6.5 -144.5 q2 -1.8 4 0 M2.5 -144.5 q2 -1.8 4 0",
    sing: "M-6.5 -145 q2 -1.8 4 0 M2.5 -145 q2 -1.8 4 0",
    flat: "M-6.5 -142.5 h4 M2.5 -142.5 h4",
    worried: "M-6.5 -142.5 q2 -1.6 4 -1.2 M2.5 -143.7 q2 -0.4 4 1.2",
    soft: "M-6.5 -143 q2 -1.2 4 0 M2.5 -143 q2 -1.2 4 0",
    speak: "M-6.5 -143.5 q2 -1.4 4 0 M2.5 -143.5 q2 -1.4 4 0",
  };
  const eyesClosed = expression === "laugh" || expression === "sing";
  return (
    <g>
      <path d={brows[expression]} stroke={look.hairShade === look.hair ? INK : look.hair} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {eyesClosed ? (
        <path d="M-6.2 -138 q1.9 -2 3.8 0 M2.4 -138 q1.9 -2 3.8 0" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      ) : (
        <g className="rig-blink">
          <ellipse cx="-4.3" cy="-138" rx="1.55" ry="1.95" fill={INK} />
          <ellipse cx="4.3" cy="-138" rx="1.55" ry="1.95" fill={INK} />
          <circle cx="-3.8" cy="-138.7" r="0.5" fill="#FFFFFF" />
          <circle cx="4.8" cy="-138.7" r="0.5" fill="#FFFFFF" />
        </g>
      )}
      <path d="M0.6 -136 q1.3 2.3 -0.7 3" stroke={look.skinShade} strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="-7.2" cy="-133.2" rx="2.4" ry="1.4" fill="#E0846F" opacity="0.32" />
      <ellipse cx="7.2" cy="-133.2" rx="2.4" ry="1.4" fill="#E0846F" opacity="0.32" />
      {expression === "laugh" ? (
        <g>
          <path d="M-3.8 -131 q3.8 6 7.6 0 z" fill="#5A2620" />
          <path d="M-3 -130.6 h6" stroke="#FFFFFF" strokeWidth="1" />
        </g>
      ) : expression === "sing" ? (
        <ellipse cx="0" cy="-129.8" rx="2.3" ry="2.9" fill="#5A2620" />
      ) : expression === "speak" ? (
        <ellipse cx="0" cy="-130.2" rx="2.4" ry="1.5" fill="#5A2620" />
      ) : expression === "smile" ? (
        <path d="M-3.6 -131 q3.6 3.2 7.2 0" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      ) : expression === "soft" ? (
        <path d="M-2.6 -130.8 q2.6 1.8 5.2 0" stroke={INK} strokeWidth="1.15" fill="none" strokeLinecap="round" />
      ) : expression === "worried" ? (
        <path d="M-2.8 -129.6 q2.8 -1.6 5.6 0" stroke={INK} strokeWidth="1.15" fill="none" strokeLinecap="round" />
      ) : expression === "flat" ? (
        <path d="M-2.6 -130.5 h5.2" stroke={INK} strokeWidth="1.15" strokeLinecap="round" />
      ) : (
        <path d="M-2.4 -130.8 q2.4 1.2 4.8 0" stroke={INK} strokeWidth="1.15" fill="none" strokeLinecap="round" />
      )}
      {look.glasses && (
        <g stroke="#6B4F3A" strokeWidth="0.9" fill="none">
          <circle cx="-4.3" cy="-138" r="3.4" />
          <circle cx="4.3" cy="-138" r="3.4" />
          <path d="M-0.9 -138 h1.8" />
        </g>
      )}
    </g>
  );
}

/** The polite, blank face Priya wears at school. Drawn on the head's coordinates. */
export function Mask({ cracked = false }: { cracked?: boolean }) {
  return (
    <g>
      <path
        d="M-11.5 -146 C-12.5 -134 -10 -126 0 -124.5 C10 -126 12.5 -134 11.5 -146 C7 -150 -7 -150 -11.5 -146 Z"
        fill="#F6F2EC"
        stroke="#D8D0C4"
        strokeWidth="0.8"
      />
      <path d="M-9 -146 C-6 -148 6 -148 9 -146 C6 -147 -6 -147 -9 -146 Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M-6.2 -138.2 q1.9 0.9 3.8 0 M2.4 -138.2 q1.9 0.9 3.8 0" stroke="#7E766C" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M-3 -131 q3 1.6 6 0" stroke="#B9A595" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <ellipse cx="-7" cy="-133.4" rx="2.2" ry="1.1" fill="#E9B4A4" opacity="0.5" />
      <ellipse cx="7" cy="-133.4" rx="2.2" ry="1.1" fill="#E9B4A4" opacity="0.5" />
      {cracked && (
        <path d="M2 -149 L0 -143 L3 -139 L-1 -134 L1.5 -129" stroke="#9C9184" strokeWidth="0.9" fill="none" strokeLinejoin="round" />
      )}
    </g>
  );
}

export function Figure({
  look,
  expression = "neutral",
  leftArm = { a: 8, b: 6 },
  rightArm = { a: 8, b: 6 },
  leftLeg = { a: 2 },
  rightLeg = { a: 2 },
  upper = false,
  seated = false,
  headCls,
  bodyCls,
  mask = false,
  maskCls,
  rightHand,
  leftHand,
  shadow = true,
}: FigureProps) {
  return (
    <g>
      {shadow && !upper && !seated && <ellipse cx="0" cy="1.5" rx="22" ry="3.6" fill="#000000" opacity="0.13" />}
      {!upper && !seated && (
        <g>
          <Leg look={look} limb={leftLeg} side={-1} />
          <Leg look={look} limb={rightLeg} side={1} />
        </g>
      )}
      {seated && (
        <g>
          <SeatedLeg look={look} side={-1} />
          <SeatedLeg look={look} side={1} />
        </g>
      )}
      <g className={bodyCls}>
        <BackHair look={look} />
        {!upper && !seated && look.bottomStyle === "skirt" && (
          <g>
            <path d="M-18 -75 L18 -75 L23 -48 C10 -45 -10 -45 -23 -48 Z" fill={look.bottom} />
            <path d="M6 -75 L18 -75 L23 -48 C16 -46.5 10 -46 6 -45.8 Z" fill="#000000" opacity="0.12" />
          </g>
        )}
        {seated && look.bottomStyle === "skirt" && (
          <path d="M-18 -75 L18 -75 L21 -62 C10 -59 -10 -59 -21 -62 Z" fill={look.bottom} />
        )}
        {!upper && look.bottomStyle !== "skirt" && (
          <path d="M-18 -75 L18 -75 L19 -64 L-19 -64 Z" fill={look.bottom} />
        )}
        <g>
          <Arm look={look} limb={leftArm} hand={leftHand} />
        </g>
        <rect x="-4.2" y="-127" width="8.4" height="10" rx="3" fill={look.skinShade} />
        <Torso look={look} />
        <g transform="scale(-1 1)">
          <Arm look={look} limb={rightArm} hand={rightHand && <g transform="scale(-1 1)">{rightHand}</g>} />
        </g>
        <g className={headCls}>
          <ellipse cx="-11.6" cy="-136.5" rx="2" ry="3" fill={look.skinShade} />
          <ellipse cx="11.6" cy="-136.5" rx="2" ry="3" fill={look.skinShade} />
          <ellipse cx="0" cy="-138" rx="11.6" ry="13.4" fill={look.skin} />
          <path d="M-9 -128 C-5 -124 5 -124 9 -128 C6 -125.5 -6 -125.5 -9 -128 Z" fill={look.skinShade} opacity="0.45" />
          <Face look={look} expression={expression} />
          {mask && (
            <g className={maskCls}>
              <Mask />
            </g>
          )}
          <FrontHair look={look} />
        </g>
      </g>
    </g>
  );
}

/** Shared CSS for every scene that uses the rig: blinking, and a gentle idle sway. */
export const RIG_CSS = `
.rig-blink { transform-box: fill-box; transform-origin: center; animation: rig-blink 4.2s infinite; }
@keyframes rig-blink { 0%, 93%, 100% { transform: scaleY(1); } 95%, 97% { transform: scaleY(0.12); } }
`;
