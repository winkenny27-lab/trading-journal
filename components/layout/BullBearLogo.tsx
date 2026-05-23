"use client";

import { useId } from "react";

interface BullBearLogoProps {
  size?: number;
}

export function BullBearLogo({ size = 36 }: BullBearLogoProps) {
  const id = useId().replace(/:/g, "");
  const W = 64;
  const H = 58;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size * (W / H)}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-bull`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id={`${id}-bear`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── BULL (left, facing right) ── */}

      {/* Bull body hint */}
      <ellipse cx="9" cy="46" rx="10" ry="7" fill={`url(#${id}-bull)`} opacity="0.7" />

      {/* Bull head */}
      <circle cx="17" cy="32" r="13" fill={`url(#${id}-bull)`} />

      {/* Bull back horn (curves up-left) */}
      <path
        d="M 10,21 C 6,14 2,10 5,7"
        stroke="#4ade80"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Bull front horn (curves up toward center — aggressive lean) */}
      <path
        d="M 21,20 C 26,12 30,9 34,9"
        stroke="#4ade80"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Bull snout */}
      <ellipse cx="29" cy="35" rx="6" ry="4.5" fill="#166534" />
      <circle cx="31.5" cy="33.5" r="1.3" fill="#14532d" />
      <circle cx="28.5" cy="33.5" r="1.3" fill="#14532d" />

      {/* Bull eye */}
      <circle cx="19" cy="27" r="2.5" fill="white" />
      <circle cx="19.5" cy="27" r="1.3" fill="#0f172a" />
      <circle cx="20" cy="26.5" r="0.4" fill="white" />

      {/* Bull ear */}
      <ellipse cx="10" cy="24" rx="3.5" ry="4" fill="#15803d" />

      {/* Bull neck */}
      <path
        d="M 11,42 Q 13,36 17,34"
        stroke={`url(#${id}-bull)`}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── LIGHTNING BOLT (center clash) ── */}
      <path
        d="M 33,10 L 29,24 L 35,23 L 31,38 L 41,22 L 35,23 L 39,10 Z"
        fill="#fbbf24"
        filter={`url(#${id}-glow)`}
        opacity="0.97"
      />

      {/* Spark dots around bolt */}
      <circle cx="26" cy="18" r="1.2" fill="#fde68a" opacity="0.8" />
      <circle cx="40" cy="16" r="1" fill="#fde68a" opacity="0.8" />
      <circle cx="43" cy="30" r="1.2" fill="#fde68a" opacity="0.7" />
      <circle cx="25" cy="32" r="1" fill="#fde68a" opacity="0.7" />

      {/* ── BEAR (right, facing left) ── */}

      {/* Bear body hint */}
      <ellipse cx="55" cy="46" rx="10" ry="7" fill={`url(#${id}-bear)`} opacity="0.7" />

      {/* Bear head */}
      <circle cx="47" cy="32" r="13" fill={`url(#${id}-bear)`} />

      {/* Bear right ear (viewer's right) */}
      <circle cx="56" cy="21" r="6" fill={`url(#${id}-bear)`} />
      <circle cx="56" cy="21" r="3.5" fill="#dc2626" />

      {/* Bear left ear (viewer's left) */}
      <circle cx="40" cy="20" r="6" fill={`url(#${id}-bear)`} />
      <circle cx="40" cy="20" r="3.5" fill="#dc2626" />

      {/* Bear snout */}
      <ellipse cx="35" cy="36" rx="6" ry="4.5" fill="#991b1b" />
      <ellipse cx="33" cy="34" rx="2.2" ry="1.6" fill="#450a0a" />
      {/* little mouth curve */}
      <path
        d="M 33,37 Q 35,39.5 37,37"
        stroke="#450a0a"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Bear eye */}
      <circle cx="45" cy="27" r="2.5" fill="white" />
      <circle cx="44.5" cy="27" r="1.3" fill="#0f172a" />
      <circle cx="44" cy="26.5" r="0.4" fill="white" />

      {/* Bear neck */}
      <path
        d="M 53,42 Q 51,36 47,34"
        stroke={`url(#${id}-bear)`}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
