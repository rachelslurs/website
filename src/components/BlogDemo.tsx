import type { ReactNode } from "react";

type BlogDemoProps = {
  children: ReactNode;
  /**
   * Break out of the `.analog-prose` 600px measure so charts / wide UIs use the
   * full looseleaf content band.
   */
  wide?: boolean;
};

/** Escape `.analog-prose`’s 600px column: wider box + equal negative L/R margins keeps the card centered. */
const BREAKOUT_DEFAULT =
  "sm:w-[calc(100%+2rem)] sm:-mx-4 md:w-[calc(100%+4rem)] md:-mx-8";
const BREAKOUT_WIDE =
  "sm:w-[calc(100%+4rem)] sm:-mx-8 md:w-[calc(100%+8rem)] md:-mx-16 lg:w-[calc(100%+10rem)] lg:-mx-20";

export default function BlogDemo({ children, wide = false }: BlogDemoProps) {
  return (
    // We use a <figure> to semantically represent an inserted diagram/demo.
    // The "group" class allows us to style child elements based on the wrapper's hover state if needed.
    // Physical paper metaphor: sharp borders, slight shadow, graph grid
    <figure
      className={`
        group not-prose relative z-10 my-10 w-full max-w-none
        border border-skin-line/40 bg-skin-fill
        p-4 sm:p-6 lg:p-8
        shadow-[2px_4px_12px_rgba(var(--color-shadow),0.08)]
        bg-[linear-gradient(rgba(var(--color-text-base),0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--color-text-base),0.04)_1px,transparent_1px)]
        bg-[size:20px_20px]
        ${wide ? BREAKOUT_WIDE : BREAKOUT_DEFAULT}
      `}
    >
      {/* Analog Tape Details: Top Left and Bottom Right mathematically centered on corners */}
      <div
        className="absolute left-0 top-0 h-5 w-14 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-skin-card-muted/70 backdrop-blur-sm shadow-sm"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 h-5 w-14 translate-x-1/2 translate-y-1/2 -rotate-45 bg-skin-card-muted/70 backdrop-blur-sm shadow-sm"
        aria-hidden="true"
      />

      {/* For demos that CANNOT scale down smoothly (like complex tables), 
        we wrap the children in an overflow container. 
        SVGs with viewBox (like your state chart) will scale naturally.
      */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-min">{children}</div>
      </div>
    </figure>
  );
}
