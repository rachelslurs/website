interface WorkYearProps {
  year?: string;
}

interface Props extends WorkYearProps {
  size?: "sm" | "lg";
  className?: string;
}

export default function WorkYear({ year, size = "sm", className }: Props) {
  return (
    <div className={`flex items-center space-x-1 opacity-80 ${className}`}>
      <span className={`${size === "sm" ? "text-sm" : "text-base"}`}>
        <span className="text-nowrap">{year}</span>
      </span>
    </div>
  );
}
