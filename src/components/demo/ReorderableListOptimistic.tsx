import { useState, memo } from "react";
import { Reorder } from "framer-motion";
import DemoLayout from "@components/DemoLayout";
import Loader from "./icons/Loader";
import Check from "./icons/Check";
import GripVertical from "./GripVertical";

interface ReorderableItem {
  id: string;
  text: string;
}

export default memo(function ReorderableListOptimistic() {
  const [reorderableItems, setReorderableItems] = useState<ReorderableItem[]>([
    { id: "1", text: "First item" },
    { id: "2", text: "Second item" },
    { id: "3", text: "Third item" },
  ]);
  const [isReordering, setIsReordering] = useState(false);
  const [justReordered, setJustReordered] = useState(false);

  const handleReorder = (newItems: ReorderableItem[]) => {
    // Optimistic reorder
    setReorderableItems(newItems);
    setIsReordering(true);
    setJustReordered(false);

    // Simulate server sync
    setTimeout(() => {
      setIsReordering(false);
      setJustReordered(true);
      // Clear justReordered flag after showing success message
      setTimeout(() => {
        setJustReordered(false);
      }, 2000);
    }, 1500);
  };

  return (
    <DemoLayout
      title="Reorderable List"
      description="Drag items to reorder with server sync indicators"
      filename="ReorderableListOptimistic.tsx"
    >
      <div className="flex flex-col items-center">
        <div className="w-1/2">
          <Reorder.Group
            axis="y"
            values={reorderableItems}
            onReorder={handleReorder}
            className="space-y-2 overflow-visible mb-4"
          >
            {reorderableItems.map(item => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="flex items-center gap-3 p-4 bg-skin-card border border-skin-line rounded-lg cursor-grab active:cursor-grabbing hover:border-skin-accent transition-colors"
                whileDrag={{
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  zIndex: 50,
                }}
              >
                <GripVertical className="w-5 h-5 text-skin-base opacity-50 flex-shrink-0" />
                <span className="text-skin-base flex-grow">{item.text}</span>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <div className="h-px bg-skin-line mb-3"></div>
          <div className="flex justify-center items-center min-h-[20px]">
            {isReordering && (
              <span className="flex items-center gap-2 text-xs text-skin-base opacity-70">
                <Loader className="w-3 h-3 animate-spin" />
                Syncing...
              </span>
            )}
            {justReordered && (
              <span className="flex items-center gap-2 text-xs text-skin-toast-success">
                <Check className="w-3 h-3 !fill-none" />
                Synced!
              </span>
            )}
          </div>
        </div>
      </div>
    </DemoLayout>
  );
});
