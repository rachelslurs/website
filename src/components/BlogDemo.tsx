import type { ReactNode } from "react";

type BlogDemoProps = {
  children: ReactNode;
  /**
   * Break out of the `.analog-prose` 600px measure so charts / wide UIs use the
   * full looseleaf content band (see `.blog-demo-wide` in `riso.css`).
   */
  wide?: boolean;
};

/** Vertical spacing for interactive demos embedded in `prose` blog MDX. */
export default function BlogDemo({ children, wide = false }: BlogDemoProps) {
  return (
    <div
      className={`not-prose my-8 w-full md:my-10 ${wide ? "blog-demo-wide" : ""}`}
    >
      {children}
    </div>
  );
}
