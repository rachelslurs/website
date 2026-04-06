import React, { useMemo } from "react";
import { seededOffset } from "@utils/seededOffset";

const DymoLabel = React.memo(
  ({
    text,
    size = "normal",
    isActive = false,
    color = "",
    as: Tag = "span",
    href,
    isInteractive = true,
    onClick,
  }: {
    text: string;
    size?: "normal" | "large" | "section";
    isActive?: boolean;
    color?: string;
    as?: "span" | "a";
    href?: string;
    isInteractive?: boolean;
    onClick?: () => void;
  }) => {
    const chars = useMemo(() => {
      return text
        .toUpperCase()
        .split("")
        .map((char, i) => ({
          char,
          mr: `${seededOffset(i * 3, 0.8) + 0.8}px`,
          y: `${seededOffset(i * 7, 0.5)}px`,
          rot: `${seededOffset(i * 13, 1.5)}deg`,
        }));
    }, [text]);

    const cls = [
      "dymo",
      size === "large" && "dymo-lg",
      size === "section" && "dymo-section",
      isActive && "active",
      color && `dymo-${color}`,
      isInteractive ? "is-interactive" : "no-interactive",
    ]
      .filter(Boolean)
      .join(" ");

    const inner = (
      <span className="dymo-text" aria-label={text}>
        {chars.map((c, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              marginRight: c.mr,
              transform: `translateY(${c.y}) rotate(${c.rot})`,
              display: "inline-block",
            }}
          >
            {c.char}
          </span>
        ))}
      </span>
    );

    if (Tag === "a") {
      return (
        <a
          href={href || "#"}
          className={cls}
          onClick={onClick}
          aria-current={isActive ? "true" : undefined}
        >
          {inner}
        </a>
      );
    }
    return <span className={cls}>{inner}</span>;
  }
);

export default DymoLabel;
