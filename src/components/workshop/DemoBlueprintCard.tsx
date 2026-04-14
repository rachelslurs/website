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
          <span className="blueprint-hook blueprint-hook--tl" />
          <span className="blueprint-hook blueprint-hook--tr" />
        </div>

        <div className="blueprint-body">
          <header className="blueprint-header">
            <div className="blueprint-header__main">
              <a
                href={item.href}
                className="blueprint-title"
                {...ext}
                onPointerDown={stopDragChain}
                onClick={stopDragChain}
              >
                {item.title}
              </a>
              {item.subtitle ? (
                <p className="blueprint-subtitle" style={{ color: accent }}>
                  {item.subtitle}
                </p>
              ) : null}
            </div>
            <div className="blueprint-icon-recess" aria-hidden>
              <BlueprintCardIcon name={item.pegboardIcon} />
            </div>
          </header>

          {item.description ? (
            <p className="blueprint-desc">{item.description}</p>
          ) : null}

          <a
            href={item.href}
            className="mech-switch mech-switch--block focus-outline"
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
