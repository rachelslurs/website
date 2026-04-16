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
    grain = "vertical",
    title: titleAttr,
  }: {
    text: string;
    size?: "normal" | "large" | "section";
    isActive?: boolean;
    color?: string;
    as?: "span" | "a";
    href?: string;
    isInteractive?: boolean;
    onClick?: () => void;
    /** `vertical` = ‖ ribs; `horizontal` = ≡ striations along tape length */
    grain?: "vertical" | "horizontal";
    title?: string;
  }) => {
    const chars = useMemo(() => {
      return text
        .toUpperCase()
        .split("")
        .map((char, i) => {
          if (char === " ") {
            return {
              char: "\u00A0",
              mr: "4px",
              y: "0px",
              rot: "0deg",
            };
          }
          return {
            char,
            mr: `${seededOffset(i * 3, 0.8) + 0.8}px`,
            y: `${seededOffset(i * 7, 0.5)}px`,
            rot: `${seededOffset(i * 13, 1.5)}deg`,
          };
        });
    }, [text]);

    const cls = [
      "dymo",
      grain === "horizontal" && "dymo--grain-horizontal",
      size === "large" && "dymo-lg",
      size === "section" && "dymo-section",
      isActive && "active",
      color && `dymo-${color}`,
      isInteractive ? "is-interactive" : "no-interactive",
    ]
      .filter(Boolean)
      .join(" ");

    const inner = (
      <>
        <span className="sr-only">{text}</span>
        <span className="dymo-text" aria-hidden="true">
          {chars.map((c, i) => (
            <span
              key={i}
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
      </>
    );

    if (Tag === "a") {
      return (
        <a
          href={href || "#"}
          className={cls}
          title={titleAttr}
          onClick={onClick}
          aria-current={isActive ? "page" : undefined}
        >
          {inner}
        </a>
      );
    }
    return (
      <span className={cls} title={titleAttr}>
        {inner}
      </span>
    );
  }
);

export default DymoLabel;
