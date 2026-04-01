import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function DemoPanel({ children, className }: Props) {
  return (
    <div
      className={[
        "mx-auto max-w-[640px] overflow-hidden rounded-xl border border-skin-line/25 bg-skin-fill font-sans",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
