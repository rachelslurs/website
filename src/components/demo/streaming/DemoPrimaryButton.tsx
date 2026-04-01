import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  isDisabled?: boolean;
};

export default function DemoPrimaryButton({
  className,
  isDisabled,
  disabled,
  type = "button",
  ...props
}: Props) {
  const computedDisabled = Boolean(disabled ?? isDisabled);

  return (
    <button
      type={type}
      disabled={computedDisabled}
      className={[
        "focus-outline inline-flex items-center justify-center rounded-lg border-2 px-4 py-3 font-semibold transition-all shadow-md active:scale-95",
        computedDisabled
          ? "cursor-not-allowed border-skin-line bg-skin-card-muted/20 text-skin-base opacity-60"
          : "border-skin-accent bg-skin-accent text-white dark:text-[rgb(var(--color-fill))] hover:opacity-90",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}
