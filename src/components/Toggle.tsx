import { useId } from "react";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-4 cursor-pointer group select-none [&:has(input:not(:checked))_.toggle-desc]:opacity-75"
    >
      <div className="flex flex-col items-start shrink-0">
        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-skin-foreground">
          {label}
        </span>
        {description && (
          <span
            id="toggle-description"
            className="toggle-desc text-[9px] md:text-[10px] font-bold transition-colors text-skin-foreground"
          >
            {description}
          </span>
        )}
      </div>
      <div className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-skin-line bg-skin-card-muted shadow-inner transition-colors duration-200 ease-in-out has-[:checked]:border-skin-accent has-[:checked]:bg-skin-accent">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="absolute inset-0 size-full cursor-pointer rounded-full border-0 opacity-0 appearance-none focus:outline-none"
          aria-describedby={description ? "toggle-description" : undefined}
        />
        <span
          className="pointer-events-none absolute left-0.5 inline-block h-5 w-5 rounded-full bg-skin-card shadow-md ring-0 transition-transform duration-200 ease-in-out group-has-[:checked]:translate-x-5"
          aria-hidden
        />
      </div>
    </label>
  );
}

export default Toggle;
