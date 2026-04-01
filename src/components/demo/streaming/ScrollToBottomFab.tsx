import type { ButtonHTMLAttributes } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  isStreaming?: boolean;
};

export default function ScrollToBottomFab({
  isStreaming,
  className,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={[
        "focus-outline absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-skin-fill/95 text-skin-base shadow-lg",
        "animate-[scrollBtnIn_0.2s_ease-out]",
        isStreaming
          ? "border-2 border-skin-chart-1"
          : "border border-skin-line/25",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3v10M4 9l4 4 4-4" />
      </svg>
    </button>
  );
}
