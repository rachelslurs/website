import { CodeBracketIcon } from "@heroicons/react/24/outline";
import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";
import { BlueprintCardIcon } from "./blueprintPegboardIcons";
import { externalLinkProps, stopDragChain } from "./pegboardCardUtils";

export default function DemoBlueprintCard({
  item,
  dragVisual,
}: {
  item: PegboardCardDTO;
  dragVisual: boolean;
}) {
  const ext = externalLinkProps(item.href);
  const accent = item.subtitleColor ?? "var(--blue)";

  return (
    <article
      aria-label={`${item.title} blueprint demo`}
      className={`blueprint-card ${dragVisual ? "blueprint-card--dragging" : ""}`}
    >
      <div className="blueprint-bg">
        <div className="blueprint-hardware" aria-hidden>
          <span className="blueprint-peg blueprint-peg--tl" />
          <span className="blueprint-peg blueprint-peg--tr" />
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
                className="blueprint-title font-display text-base font-bold uppercase leading-none tracking-wide text-[var(--black)] no-underline hover:underline hover:underline-offset-2"
                {...ext}
                onPointerDown={stopDragChain}
                onClick={stopDragChain}
              >
                {item.title}
              </a>
              {item.subtitle ? (
                <p
                  className="blueprint-subtitle font-mono text-xs font-bold leading-snug tracking-[1.5px]"
                  style={{ color: accent }}
                >
                  {item.subtitle}
                </p>
              ) : null}
            </div>
            <div className="blueprint-icon-recess" aria-hidden>
              <BlueprintCardIcon name={item.pegboardIcon} />
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
            aria-label={`Execute build: open demo ${item.title}`}
            {...ext}
            onPointerDown={stopDragChain}
            onClick={stopDragChain}
          >
            <CodeBracketIcon className="mech-switch__icon" aria-hidden />
            <span>Execute build</span>
          </a>
        </div>
      </div>
    </article>
  );
}
