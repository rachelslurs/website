interface WorkYearProps {
  pubDatetime: string;
}

interface Props extends WorkYearProps {
  size?: "sm" | "lg";
  className?: string;
}

export default function WorkYear({
  pubDatetime,
  size = "sm",
  className,
}: Props) {
  return (
    <div className={`flex items-center space-x-2 opacity-80 ${className}`}>
      <span className={`${size === "sm" ? "text-sm" : "text-base"}`}>
        <span className="text-nowrap">{pubDatetime}</span>
      </span>
    </div>
  );
}
