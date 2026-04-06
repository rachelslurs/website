import type { ReactNode } from "react";

type BlogDemoProps = {
  children: ReactNode;
  /**
   * Break out of the `.analog-prose` 600px measure so charts / wide UIs use the
   * full looseleaf content band.
   */
  wide?: boolean;
};

export default function BlogDemo({ children, wide = false }: BlogDemoProps) {
  return (
    // We use a <figure> to semantically represent an inserted diagram/demo.
    // The "group" class allows us to style child elements based on the wrapper's hover state if needed.
    <figure
      className={`
        group not-prose relative z-10 my-10 w-full
        /* Physical Paper Metaphor: Sharp borders, slight shadow, graph grid */
        border border-skin-line/40 bg-skin-fill
        p-4 sm:p-6 lg:p-8
        shadow-[2px_4px_12px_rgba(var(--color-shadow),0.08)]
        bg-[linear-gradient(rgba(var(--color-text-base),0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--color-text-base),0.04)_1px,transparent_1px)]
        bg-[size:20px_20px]
        
        /* RESPONSIVE BREAKOUT MATH */
        /* On mobile: standard w-full */
        /* On tablet (md): Break out 2rem on each side */
        /* On desktop (lg) + wide prop: Break out 3rem on each side */
        ${
          wide
            ? "md:w-[calc(100%+4rem)] md:-ml-8 lg:w-[calc(100%+6rem)] lg:-ml-12"
            : "md:w-[calc(100%+2rem)] md:-ml-4"
        }
      `}
    >
      {/* Analog Tape Details: Top Left and Bottom Right */}
      <div
        className="absolute -left-3 -top-3 h-6 w-14 -rotate-12 bg-skin-card-muted/50 backdrop-blur-sm shadow-sm"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-3 -right-3 h-6 w-14 -rotate-12 bg-skin-card-muted/50 backdrop-blur-sm shadow-sm"
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
