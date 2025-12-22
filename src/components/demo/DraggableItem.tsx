import { motion } from "framer-motion";
import { useState } from "react";

interface DraggableItemProps {
  id: string;
  label: string;
  onDragEnd: (id: string, x: number, y: number) => void;
  color?: string;
  compact?: boolean;
}

export default function DraggableItem({
  id,
  label,
  onDragEnd,
  color = "bg-skin-accent",
  compact = false,
}: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        setIsDragging(false);
        // Use info.point which gives us viewport coordinates
        onDragEnd(id, info.point.x, info.point.y);
      }}
      whileDrag={{
        scale: 1.1,
        zIndex: 50,
        cursor: "grabbing",
      }}
      initial={compact ? { opacity: 0, y: -10 } : { opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.8 : 1,
        scale: isDragging ? 1.1 : 1,
      }}
      className={`
        ${color} 
        text-white 
        ${compact ? "px-3 py-2" : "px-4 py-3"}
        rounded-lg 
        cursor-grab 
        active:cursor-grabbing
        shadow-lg
        select-none
        font-medium
        text-sm
        ${compact ? "w-full" : "inline-block"}
        relative
      `}
      style={{
        touchAction: "none",
        position: isDragging ? "fixed" : "relative",
      }}
    >
      {label}
    </motion.div>
  );
}
