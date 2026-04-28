import { CodeBracketIcon } from "@heroicons/react/24/outline";
import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";
import { externalLinkProps, stopDragChain } from "./pegboardCardUtils";

export default function DemoBlueprintCard({
  item,
  dragVisual,
  blockParentDragHandlers = true,
}: {
  item: PegboardCardDTO;
  dragVisual: boolean;
  /** When false (mobile stack), omit stopPropagation so vertical scroll + taps behave naturally. */
  blockParentDragHandlers?: boolean;
}) {
  const ext = externalLinkProps(item.href);
  const stopIfNeeded = blockParentDragHandlers ? stopDragChain : undefined;
  const accent = item.subtitleColor ?? "var(--blue)";
  const demoTag = item.tags?.[0]?.trim() || undefined;

  return (
    <article
      aria-label={`${item.title} blueprint demo`}
      className={`blueprint-card ${dragVisual ? "blueprint-card--dragging" : ""}`}
    >
      <div className="blueprint-bg">
        <span
          className="blueprint-hole-depth blueprint-hole-depth--tl"
          aria-hidden
        />
        <span
          className="blueprint-hole-depth blueprint-hole-depth--tr"
          aria-hidden
        />
        <div className="blueprint-hardware" aria-hidden>
          <span className="blueprint-hook-anchor blueprint-hook-anchor--tl">
            <span className="straight-hook" />
          </span>
          <span className="blueprint-hook-anchor blueprint-hook-anchor--tr">
            <span className="straight-hook" />
          </span>
        </div>

        <div className="blueprint-body">
          <header className="blueprint-header">
            <div className="blueprint-header__main">
              <a
                href={item.href}
                className="blueprint-title font-display text-sm font-bold uppercase leading-none tracking-wide text-[var(--black)] no-underline hover:underline hover:underline-offset-2"
                {...ext}
                onPointerDown={stopIfNeeded}
                onClick={stopIfNeeded}
              >
                {item.title}
              </a>
              {demoTag ? (
                <p
                  className="blueprint-subtitle font-mono text-xs font-bold leading-snug tracking-tightest"
                  style={{ color: accent }}
                >
                  {demoTag}
                </p>
              ) : item.subtitle ? (
                <p
                  className="blueprint-subtitle font-mono text-xs font-bold leading-snug tracking-tightest"
                  style={{ color: accent }}
                >
                  {item.subtitle}
                </p>
              ) : null}
            </div>
          </header>

          {item.description ? (
            <p className="blueprint-desc text-xs leading-[1.65] text-[rgba(26,26,46,0.78)]">
              {item.description}
            </p>
          ) : null}

          <a
            href={item.href}
            className="mech-switch mech-switch--block focus-outline font-mono text-[10px] font-bold uppercase tracking-[1.5px]"
            aria-label={`Open demo ${item.title}`}
            {...ext}
            onPointerDown={stopIfNeeded}
            onClick={stopIfNeeded}
          >
            <CodeBracketIcon className="mech-switch__icon" aria-hidden />
            <span>Open demo</span>
          </a>
        </div>
      </div>
    </article>
  );
}
