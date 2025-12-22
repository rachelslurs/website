import { useState } from "react";
import { Reorder } from "framer-motion";
import DemoLayout from "@components/DemoLayout";
import GripVertical from "./GripVertical";

interface ListItem {
  id: string;
  text: string;
}

export default function ReorderableList() {
  const [items, setItems] = useState<ListItem[]>([
    { id: "1", text: "First item" },
    { id: "2", text: "Second item" },
    { id: "3", text: "Third item" },
    { id: "4", text: "Fourth item" },
  ]);

  return (
    <DemoLayout
      title="Reorderable List"
      description="Drag items to reorder them"
      filename="ReorderableList.tsx"
      className="max-w-2xl"
    >
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        className="space-y-2 overflow-visible"
      >
        {items.map(item => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="flex items-center gap-3 p-4 bg-skin-card rounded-lg cursor-grab active:cursor-grabbing border-2 border-skin-line hover:border-skin-accent transition-colors duration-300"
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
    </DemoLayout>
  );
}
