import { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DemoLayout from "@components/DemoLayout";

interface KanbanItem {
  id: string;
  text: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface Columns {
  todo: KanbanColumn;
  inProgress: KanbanColumn;
  done: KanbanColumn;
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Columns>({
    todo: {
      id: "todo",
      title: "To Do",
      items: [
        { id: "1", text: "Design new landing page" },
        { id: "2", text: "Write documentation" },
        { id: "3", text: "Update dependencies" },
      ],
    },
    inProgress: {
      id: "inProgress",
      title: "In Progress",
      items: [
        { id: "4", text: "Build kanban component" },
        { id: "5", text: "Add drag and drop" },
      ],
    },
    done: {
      id: "done",
      title: "Done",
      items: [
        { id: "6", text: "Setup project" },
        { id: "7", text: "Initial commit" },
      ],
    },
  });

  const [draggedItem, setDraggedItem] = useState<KanbanItem | null>(null);
  const [sourceColumn, setSourceColumn] = useState<keyof Columns | null>(null);

  const handleDragStart = useCallback(
    (item: KanbanItem, columnId: keyof Columns) => {
      setDraggedItem(item);
      setSourceColumn(columnId);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setSourceColumn(null);
  }, []);

  const handleDrop = useCallback(
    (targetColumnId: keyof Columns) => {
      if (!draggedItem || !sourceColumn) return;

      if (sourceColumn === targetColumnId) {
        handleDragEnd();
        return;
      }

      setColumns(prev => {
        const newColumns = { ...prev };

        // Remove from source
        newColumns[sourceColumn] = {
          ...newColumns[sourceColumn],
          items: newColumns[sourceColumn].items.filter(
            item => item.id !== draggedItem.id
          ),
        };

        // Add to target
        newColumns[targetColumnId] = {
          ...newColumns[targetColumnId],
          items: [...newColumns[targetColumnId].items, draggedItem],
        };

        return newColumns;
      });

      handleDragEnd();
    },
    [draggedItem, sourceColumn, columns, handleDragEnd]
  );

  const columnArray = useMemo(() => Object.values(columns), [columns]);

  return (
    <DemoLayout
      title="Kanban Board"
      description="Drag cards between columns to reorganize tasks"
      filename="KanbanBoard.tsx"
    >
      <div className="grid grid-cols-3 gap-8">
        {columnArray.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </DemoLayout>
  );
}

interface KanbanColumnProps {
  column: KanbanColumn;
  onDrop: (columnId: keyof Columns) => void;
  onDragStart: (item: KanbanItem, columnId: keyof Columns) => void;
  onDragEnd: () => void;
}

const KanbanColumn = memo(
  ({ column, onDrop, onDragStart, onDragEnd }: KanbanColumnProps) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
      setIsDragOver(false);
    }, []);

    const handleDropLocal = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(column.id as keyof Columns);
      },
      [column.id, onDrop]
    );

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropLocal}
        className={`
          flex-1 min-w-[250px] transition-colors rounded-lg border border-dashed p-4
          ${
            isDragOver
              ? "border-skin-accent bg-skin-accent/10"
              : "border-skin-line/30 bg-skin-card/30"
          }
        `}
      >
        <div className="flex items-baseline justify-between">
          <h4 className="">{column.title}</h4>
          <span className="text-sm text-skin-base opacity-70 leading-none">
            {column.items.length}
          </span>
        </div>

        <div className="space-y-2 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {column.items.map(item => (
              <KanbanCard
                key={item.id}
                item={item}
                columnId={column.id as keyof Columns}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }
);

KanbanColumn.displayName = "KanbanColumn";

interface KanbanCardProps {
  item: KanbanItem;
  columnId: keyof Columns;
  onDragStart: (item: KanbanItem, columnId: keyof Columns) => void;
  onDragEnd: () => void;
}

const KanbanCard = memo(
  ({ item, columnId, onDragStart, onDragEnd }: KanbanCardProps) => {
    const handleDragStartLocal = useCallback(() => {
      onDragStart(item, columnId);
    }, [item, columnId, onDragStart]);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        draggable
        onDragStart={handleDragStartLocal}
        onDragEnd={onDragEnd}
        className="p-3 bg-skin-card border border-skin-line rounded-lg cursor-grab active:cursor-grabbing hover:border-skin-accent transition-colors shadow-sm"
        whileDrag={{
          scale: 1.05,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          zIndex: 50,
        }}
      >
        <p className="text-sm text-skin-base my-2">{item.text}</p>
      </motion.div>
    );
  }
);

KanbanCard.displayName = "KanbanCard";
