import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function DemoSecondaryButton({
  className,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={[
        "focus-outline inline-flex items-center justify-center rounded-lg border-2 border-skin-line/20 bg-skin-card-muted/20 px-4 py-3 font-semibold text-skin-base transition-all hover:bg-skin-card active:scale-95",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}
