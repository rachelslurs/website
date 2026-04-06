import { LOCALE } from "@config";

interface DatetimesProps {
  pubDatetime: Date;
  modDatetime: string | Date | undefined | null;
}

interface Props extends DatetimesProps {
  size?: "sm" | "lg";
  className?: string;
  /** Blog looseleaf: mono date line, no icon (matches editorial post-meta). */
  variant?: "default" | "analog";
}

export default function Datetime({
  pubDatetime,
  modDatetime,
  size = "sm",
  className = "",
  variant = "default",
}: Props) {
  if (variant === "analog") {
    return (
      <div className={`post-meta ${className}`}>
        <FormattedDatetime
          pubDatetime={pubDatetime}
          modDatetime={modDatetime}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center space-x-2 opacity-80 font-mono ${size === "sm" ? "mt-0 mb-2" : "mt-0 mb-10"} ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${
          size === "sm" ? "scale-75" : "scale-100"
        } inline-block h-6 w-6 min-w-[1.375rem] fill-skin-base`}
        aria-hidden="true"
      >
        <path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"></path>
        <path d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"></path>
      </svg>
      <span className={`${size === "sm" ? "text-sm" : "text-base"}`}>
        <FormattedDatetime
          pubDatetime={pubDatetime}
          modDatetime={modDatetime}
        />
      </span>
    </div>
  );
}

const FormattedDatetime = ({ pubDatetime, modDatetime }: DatetimesProps) => {
  const myDatetime = new Date(
    modDatetime && modDatetime > pubDatetime ? modDatetime : pubDatetime
  );

  const date = myDatetime.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // const time = myDatetime.toLocaleTimeString(LOCALE.langTag, {
  //   hour: "2-digit",
  //   minute: "2-digit",
  // });

  return (
    <>
      <time dateTime={myDatetime.toISOString()}>{date}</time>
    </>
  );
};
