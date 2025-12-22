import type { ReactNode } from "react";
import ViewSource from "./ViewSource";

interface DemoLayoutProps {
  title: string;
  description?: string;
  filename: string;
  children: ReactNode;
  className?: string;
}

export default function DemoLayout({
  title,
  description,
  filename,
  children,
  className = "",
}: DemoLayoutProps) {
  return (
    <div
      className={`w-full max-w-6xl mx-auto my-4 overflow-visible ${className}`}
    >
      <div className="mb-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-lg mb-2 font-semibold text-skin-base">{title}</h3>
          <ViewSource filename={filename} />
        </div>
        {description && (
          <p className="text-sm mt-0 mb-6 text-skin-base opacity-70">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
