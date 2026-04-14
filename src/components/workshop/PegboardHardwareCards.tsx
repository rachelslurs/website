import {
  ArrowTopRightOnSquareIcon,
  PlayIcon,
  TvIcon,
} from "@heroicons/react/24/outline";
import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";
import { useEffect, useId, useState } from "react";
import type { MouseEvent } from "react";
import { externalLinkProps, stopDragChain } from "./pegboardCardUtils";

export function CaseStudyClipboard({
  item,
  dragVisual,
}: {
  item: PegboardCardDTO;
  dragVisual: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const metalId = `clipMetal-${uid}`;
  const darkId = `clipDark-${uid}`;
  const ext = externalLinkProps(item.href);

  const label = item.caseStudyLabel ?? "Case Study";
  const year = item.caseStudyYear ?? "—";

  return (
    <div className="peg-clipboard-root">
      <div
        className={`masonite-plate ${dragVisual ? "masonite-plate--dragging" : ""}`}
        aria-hidden
      />
      <svg
        width={240}
        height={100}
        viewBox="0 0 240 100"
        fill="none"
        className="peg-clipboard-spec-svg"
        style={{ filter: "drop-shadow(3px 5px 4px rgba(0,0,0,0.3))" }}
        aria-hidden
      >
        <defs>
          <linearGradient id={metalId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="15%" stopColor="#cbd5e1" />
            <stop offset="35%" stopColor="#64748b" />
            <stop offset="45%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="80%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id={darkId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect
          x="70"
          y="50"
          width="100"
          height="16"
          rx="4"
          fill={`url(#${darkId})`}
        />
        <path
          d="M 120 8 C 138 8, 145 18, 148 30 C 152 48, 160 52, 175 52 C 192 52, 196 60, 196 75 C 196 88, 192 94, 185 94 L 55 94 C 48 94, 44 88, 44 75 C 44 60, 48 52, 65 52 C 80 52, 88 48, 92 30 C 95 18, 102 8, 120 8 Z M 120 22 A 8 8 0 1 0 120 38 A 8 8 0 1 0 120 22"
          fill={`url(#${metalId})`}
          fillRule="evenodd"
        />
        <circle
          cx="120"
          cy="30"
          r="14"
          fill="none"
          stroke={`url(#${metalId})`}
          strokeWidth="4"
        />
      </svg>
      <div className="peg-clipboard-mount" aria-hidden>
        <div className="peg-clipboard-hook-mock">
          <div className="peg-clipboard-hook-mock__shaft">
            <div className="peg-clipboard-hook-mock__spec" />
          </div>
        </div>
      </div>
      <div className="peg-clipboard__papers">
        <div className="peg-clipboard__paper-back" aria-hidden />
        <div className="peg-clipboard__paper-front">
          <div className="peg-clipboard-wireframe" aria-hidden>
            <div className="peg-clipboard-wireframe__chrome">
              <TvIcon className="peg-clipboard-wireframe__icon" />
              <PlayIcon className="peg-clipboard-wireframe__play" />
            </div>
            <div className="peg-clipboard-wireframe__bar peg-clipboard-wireframe__bar--blue" />
            <div className="peg-clipboard-wireframe__row">
              <span className="peg-clipboard-wireframe__block peg-clipboard-wireframe__block--orange" />
              <span className="peg-clipboard-wireframe__block peg-clipboard-wireframe__block--blue" />
            </div>
          </div>
          <div className="peg-clipboard-meta-pill font-mono text-[10px] font-bold uppercase tracking-[1.5px]">
            <span className="peg-clipboard-meta-pill__dot" />
            <span>
              {label} / {year}
            </span>
          </div>
          <a
            href={item.href}
            className="peg-clipboard-title font-heading text-xl font-semibold leading-tight tracking-tight text-[var(--black)] no-underline hover:underline hover:underline-offset-2"
            {...ext}
            onPointerDown={stopDragChain}
            onClick={stopDragChain}
          >
            {item.title}
          </a>
          {item.description ? (
            <p className="peg-clipboard-desc text-xs leading-[1.65] text-[rgba(26,26,46,0.78)]">
              {item.description}
            </p>
          ) : null}
          <a
            href={item.href}
            className="polished-btn font-mono text-[11px] font-bold uppercase tracking-[1.5px]"
            {...ext}
            onPointerDown={stopDragChain}
            onClick={stopDragChain}
          >
            View case study
          </a>
        </div>
      </div>
    </div>
  );
}

export function LinkLcdCard({
  item,
  dragVisual = false,
}: {
  item: PegboardCardDTO;
  dragVisual?: boolean;
}) {
  const ext = externalLinkProps(item.href);
  const chipLabel = (item.subtitle ?? "").trim() || "Link";
  const gifSrc = item.gifLink;
  const [gifPlaying, setGifPlaying] = useState(false);

  useEffect(() => {
    if (!gifSrc || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setGifPlaying(!mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [gifSrc]);

  const openVideoUrl = () => {
    if (typeof window === "undefined") return;
    window.open(item.href, ext.target ?? "_blank", "noopener,noreferrer");
  };

  const handlePlay = (e: MouseEvent<HTMLButtonElement>) => {
    stopDragChain(e);
    if (gifSrc) {
      setGifPlaying(true);
    } else {
      openVideoUrl();
    }
  };

  return (
    <div
      className={`lcd-hardware ${dragVisual ? "lcd-hardware--dragging" : ""}`}
    >
      <div className="lcd-shadow-base" aria-hidden />
      <div
        className={`lcd-hardware__tilt ${dragVisual ? "lcd-hardware__tilt--dragging" : ""}`}
      >
        <div className="lcd-pcb">
          <div className="lcd-pcb__substrate" aria-hidden>
            <div className="lcd-pcb__pin-strip">
              {Array.from({ length: 16 }, (_, i) => (
                <span key={i} className="lcd-pcb__pin" />
              ))}
            </div>
          </div>
          <div className="lcd-slate">
            <div className="lcd-slate__chrome">
              <div className="lcd-slate__top">
                <span className="lcd-chip-label">{chipLabel}</span>
                <a
                  href={item.href}
                  className="lcd-see-external focus-outline"
                  {...ext}
                  onPointerDown={stopDragChain}
                  onClick={stopDragChain}
                >
                  <span>See video</span>
                  <ArrowTopRightOnSquareIcon
                    className="lcd-see-external__icon"
                    aria-hidden
                  />
                </a>
              </div>
              <div className="lcd-screen-stage">
                {!(gifPlaying && gifSrc) ? (
                  <span className="lcd-screen-stage__scanlines" aria-hidden />
                ) : null}
                {gifPlaying && gifSrc ? (
                  <img
                    src={gifSrc}
                    alt=""
                    className="lcd-screen-gif"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    onDragStart={e => e.preventDefault()}
                  />
                ) : null}
                {!gifPlaying ? (
                  <button
                    type="button"
                    className="lcd-play-trigger focus-outline"
                    aria-label={
                      gifSrc
                        ? `Play animated preview for ${item.title}`
                        : `Open video for ${item.title}`
                    }
                    onClick={handlePlay}
                    onPointerDown={stopDragChain}
                  >
                    <PlayIcon className="lcd-play-trigger__icon" aria-hidden />
                    <span className="lcd-play-trigger__label">Play</span>
                  </button>
                ) : null}
              </div>
              <div className="lcd-headline">
                <span className="lcd-headline__text">{item.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="lcd-mount-hook lcd-mount-hook--l" aria-hidden>
        <span className="lcd-hook-shaft">
          <span className="lcd-hook-shaft__spec" aria-hidden />
        </span>
        <span className="lcd-hook-foot" aria-hidden />
      </span>
      <span className="lcd-mount-hook lcd-mount-hook--r" aria-hidden>
        <span className="lcd-hook-shaft">
          <span className="lcd-hook-shaft__spec" aria-hidden />
        </span>
        <span className="lcd-hook-foot" aria-hidden />
      </span>
    </div>
  );
}
