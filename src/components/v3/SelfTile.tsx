import Link from "next/link";
import type { MapLevel, MapSelf } from "@/lib/v3/levelMap";
import { INK, accentOn, display, onBand, toneOf } from "./mapStyle";

export default function SelfTile({ level, self }: { level: MapLevel; self: MapSelf }) {
  const tone = toneOf(level);
  return (
    <Link
      href={`/me/selves/${self.key}`}
      className="group flex min-h-[44px] flex-col gap-1.5 rounded-[18px] p-3.5 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2"
      style={
        tone === "dark"
          ? { border: "2.5px dashed rgba(255,255,255,.55)", color: "#fff", outlineColor: "#fff" }
          : { background: "#fff", color: INK, border: tone === "bright" ? "2px solid #1B1640" : "2px solid transparent", outlineColor: level.colour }
      }
    >
      <span className="text-[17px] sm:text-[19px] font-extrabold leading-[1.1] break-words" style={{ ...onBand, color: tone === "dark" ? "#fff" : accentOn(level) }}>
        {self.name}
      </span>
      <span className="text-[14px] sm:text-[15px] font-semibold leading-snug" style={{ color: tone === "dark" ? "#E9E6FF" : "#2A2A33" }}>
        {self.short}
      </span>
    </Link>
  );
}
