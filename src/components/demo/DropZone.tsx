import { motion } from "framer-motion";
import React from "react";

interface DropZoneProps {
  id: string;
  label: string;
  isOver: boolean;
  hasItem: boolean;
  children?: React.ReactNode;
}

export default function DropZone({
  id,
  label,
  isOver,
  hasItem,
  children,
}: DropZoneProps) {
  return (
    <motion.div
      id={id}
      className={`
        min-h-[120px]
        md:min-h-[200px]
        border-2
        border-dashed
        rounded-lg
        p-4
        transition-colors
        relative
        w-full
        ${isOver ? "border-skin-accent bg-skin-accent/10" : "border-skin-line"}
        ${hasItem ? "bg-skin-card/50" : "bg-transparent"}
      `}
      animate={{
        scale: isOver ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
      style={{
        position: "relative",
        zIndex: isOver ? 10 : 1,
      }}
    >
      <div className="text-center mb-2 pointer-events-none">
        <p className="text-sm font-medium text-skin-base opacity-80">{label}</p>
      </div>
      <div className="flex items-center justify-center min-h-[60px] pointer-events-none">
        {children || (
          <p className="text-xs text-skin-base opacity-50">
            {isOver ? "Drop here!" : "Drop items here"}
          </p>
        )}
      </div>
    </motion.div>
  );
}
