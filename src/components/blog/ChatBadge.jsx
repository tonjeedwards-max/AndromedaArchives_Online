import React from "react";

const BADGE_CONFIG = {
  asteroid: {
    name: "Asteroid Streak",
    icon: "☄️",
    className: "bg-slate-400/15 border-slate-400/40 text-slate-300",
    description: "7 consecutive active days",
  },
  comet: {
    name: "Comet Streak",
    icon: "🌠",
    className: "bg-sky-400/15 border-sky-400/40 text-sky-300",
    description: "21 consecutive active days (3 weeks)",
  },
  supernova: {
    name: "Supernova Streak",
    icon: "💥",
    className: "bg-purple-500/15 border-purple-500/40 text-amber-300",
    description: "42 consecutive active days (6 weeks)",
  },
};

export default function ChatBadge({ tier, size = "sm" }) {
  if (!tier) return null;
  const config = BADGE_CONFIG[tier];
  if (!config) return null;

  const sizeClasses = size === "sm" ? "text-[9px] px-1 py-0.5" : "text-xs px-1.5 py-0.5";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border ${config.className} ${sizeClasses} font-medium shrink-0 cursor-default`}
      title={`${config.name}: ${config.description}`}
    >
      <span>{config.icon}</span>
    </span>
  );
}

export { BADGE_CONFIG };
