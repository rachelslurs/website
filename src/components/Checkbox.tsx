import { useId } from "react";

const Checkbox = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-4 transition-all [&:has(input:checked)_.checkbox-desc]:text-skin-accent [&:has(input:not(:checked))_.checkbox-desc]:opacity-75 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded cursor-pointer text-skin-base dark:text-skin-accent"
      />
      <div className="flex flex-col">
        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-skin-foreground">
          {label}
        </span>
        <span className="checkbox-desc text-[9px] md:text-[10px] font-bold uppercase transition-colors text-skin-foreground">
          {description}
        </span>
      </div>
    </label>
  );
};

export default Checkbox;
