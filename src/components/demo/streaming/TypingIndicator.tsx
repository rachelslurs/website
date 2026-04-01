type Props = {
  className?: string;
};

export default function TypingIndicator({ className }: Props) {
  return (
    <div className={["self-start", className ?? ""].join(" ")}>
      <div className="flex gap-1 rounded-lg border border-skin-line/12 bg-skin-card px-3.5 py-2.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={[
              "h-1.5 w-1.5 rounded-full bg-skin-card-muted",
              "animate-[demo-bounce_1.4s_ease-in-out_infinite]",
              i === 0 ? "[animation-delay:0ms]" : "",
              i === 1 ? "[animation-delay:160ms]" : "",
              i === 2 ? "[animation-delay:320ms]" : "",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
