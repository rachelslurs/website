import React, { useRef, useEffect } from "react";

export interface ConsoleEntry {
  id: number;
  text: string;
}

interface ConsoleProps {
  log: ConsoleEntry[];
  visibleId: number | null;
  className?: string;
  /** Use inverted (devtools-style) colors to match SharedBrain header */
  variant?: "default" | "inverted";
}

function Console({
  log,
  visibleId,
  className = "",
  variant = "default",
}: ConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInverted = variant === "inverted";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log.length]);

  return (
    <div
      className={`flex flex-col min-h-0 border-t ${className} ${
        isInverted
          ? "border-skin-line bg-skin-inverted"
          : "border-skin-line bg-skin-card-muted/80"
      }`}
    >
      <div
        className={`shrink-0 flex items-center h-8 px-3 border-b border-skin-line ${
          isInverted ? "bg-skin-inverted" : "bg-skin-card-muted"
        }`}
      >
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isInverted
              ? "text-skin-inverted opacity-90"
              : "text-skin-base opacity-70"
          }`}
        >
          Console
        </span>
      </div>
      <div
        ref={scrollRef}
        className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-2 font-mono text-sm ${
          isInverted
            ? "console-scroll-inverted text-skin-inverted"
            : "text-skin-base"
        }`}
      >
        {log.length === 0 ? (
          <div
            className={`text-sm italic ${isInverted ? "text-skin-inverted/60" : "text-skin-base/50"}`}
          >
            No messages
          </div>
        ) : (
          [...log].reverse().map((entry, i) => {
            const isLatest = entry.id === visibleId;
            const reversedIndex = log.length - 1 - i;
            const opacity = isLatest
              ? "opacity-100"
              : reversedIndex === 0
                ? "opacity-90"
                : "opacity-70";
            return (
              <div
                key={entry.id}
                className={`py-1.5 pr-2 flex items-start gap-2 border-l-2 pl-2 -ml-px transition-all duration-500 ease-in-out ${opacity} ${
                  isLatest ? "border-skin-accent" : "border-skin-line"
                }`}
              >
                <span
                  className={`shrink-0 select-none text-sm ${isInverted ? "text-skin-inverted/60" : "text-skin-base/50"}`}
                >
                  &gt;
                </span>
                <span className="break-all leading-snug text-sm">
                  {entry.text}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Console;
