import type { ReactNode } from "react";
import StreamingCaret from "./StreamingCaret";

type Props = {
  role: "user" | "assistant";
  content: ReactNode;
  isPartial?: boolean;
  tag?: ReactNode;
};

export default function StreamingChatBubble({
  role,
  content,
  isPartial,
  tag,
}: Props) {
  const isUser = role === "user";

  return (
    <div
      className={["max-w-[85%]", isUser ? "self-end" : "self-start"].join(" ")}
    >
      <div
        className={[
          "mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-skin-placeholder",
          isUser ? "justify-end" : "justify-start",
        ].join(" ")}
      >
        {isUser ? "You" : "Assistant"}
        {tag ? (
          <span className="text-[10px] font-medium normal-case text-skin-chart-2">
            {tag}
          </span>
        ) : null}
      </div>

      <div
        className={[
          "rounded-lg px-3.5 py-2.5 font-sans text-[13px] leading-relaxed text-skin-base",
          isUser
            ? "border border-skin-accent/30 bg-skin-accent/10 text-right"
            : "border border-skin-line/12 bg-skin-card",
        ].join(" ")}
      >
        {content}
        {isPartial ? <StreamingCaret /> : null}
      </div>
    </div>
  );
}
