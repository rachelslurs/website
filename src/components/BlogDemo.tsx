import type { ReactNode } from "react";

/** Vertical spacing for interactive demos embedded in `prose` blog MDX. */
export default function BlogDemo({ children }: { children: ReactNode }) {
  return <div className="not-prose my-8 w-full md:my-10">{children}</div>;
}
