import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DemoLayout from "@components/DemoLayout";
import {
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface Item {
  id: number;
  text: string;
  synced: boolean;
  justSynced?: boolean;
}

export default memo(function AddDeleteItems() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, text: "Task 1", synced: true },
    { id: 2, text: "Task 2", synced: true },
  ]);
  const [input, setInput] = useState("");

  const addItem = () => {
    if (!input.trim()) return;

    const newItem: Item = {
      id: Date.now(),
      text: input,
      synced: false,
    };

    // Optimistic update
    setItems(prev => [...prev, newItem]);
    setInput("");

    // Simulate server sync
    setTimeout(() => {
      setItems(prev =>
        prev.map(item =>
          item.id === newItem.id
            ? { ...item, synced: true, justSynced: true }
            : item
        )
      );
      // Clear justSynced flag after showing success message
      setTimeout(() => {
        setItems(prev =>
          prev.map(item =>
            item.id === newItem.id ? { ...item, justSynced: false } : item
          )
        );
      }, 2000);
    }, 1500);
  };

  const deleteItem = (id: number) => {
    // Optimistic delete
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <DemoLayout
      title="Add & Delete Items"
      description="Instant updates with server sync indicators"
      filename="AddDeleteItems.tsx"
    >
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()}
          placeholder="Add new item..."
          className="flex-1 px-4 py-2 border border-skin-line rounded-lg focus:outline-none focus:ring-2 focus:ring-skin-accent bg-skin-fill text-skin-base"
        />
        <button
          onClick={addItem}
          className="px-4 py-2 bg-skin-accent text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-4 bg-skin-card border border-skin-line rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-skin-base">{item.text}</span>
                {!item.synced && (
                  <span className="flex items-center gap-1 text-xs text-skin-base opacity-70">
                    <ArrowPathIcon className="w-3 h-3 animate-spin" />
                    Syncing...
                  </span>
                )}
                {item.synced && item.justSynced && (
                  <span className="flex items-center gap-1 text-xs text-skin-toast-success">
                    <CheckIcon className="w-3 h-3" />
                    Synced!
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-skin-base opacity-50 hover:text-skin-toast-error hover:opacity-100 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </DemoLayout>
  );
});
