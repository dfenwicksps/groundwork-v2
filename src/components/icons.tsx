// Line icons for the interface, drawn to match the tab bar (22px grid, 1.6
// stroke, currentColor). They replace emoji in the app's own chrome, which
// render differently on every phone; emoji that are part of the content — a
// strength's or a week's symbol — stay emoji.

type IconProps = { size?: number; className?: string };

function Svg({ size = 22, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function LockIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4.5" y="9.5" width="13" height="9" rx="2" />
      <path d="M7.5 9.5V7a3.5 3.5 0 0 1 7 0v2.5M11 13v2" />
    </Svg>
  );
}

export function PeopleIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8" cy="7.5" r="2.75" />
      <circle cx="15" cy="8.5" r="2.25" />
      <path d="M3 17.5c.4-3 2.4-4.75 5-4.75s4.6 1.75 5 4.75M13.5 13c2.6-.4 4.8 1 5.5 4.5" />
    </Svg>
  );
}

export function SproutIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M11 18.5V10M11 12c0-3.5-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5zM11 10c0-3 2-5 5.5-5 0 3-2 5-5.5 5z" />
    </Svg>
  );
}

export function CompassIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7.5" />
      <path d="M13.8 8.2l-1.6 4-4 1.6 1.6-4 4-1.6z" />
    </Svg>
  );
}

export function WavesIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 8.5c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 3 0M3 13.5c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 3 0" />
    </Svg>
  );
}

export function TargetIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7.5" />
      <circle cx="11" cy="11" r="4" />
      <circle cx="11" cy="11" r="0.75" fill="currentColor" />
    </Svg>
  );
}

export function SparkIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M11 3.5l1.6 4.9 4.9 1.6-4.9 1.6L11 16.5l-1.6-4.9L4.5 10l4.9-1.6L11 3.5zM17 15.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z" />
    </Svg>
  );
}
