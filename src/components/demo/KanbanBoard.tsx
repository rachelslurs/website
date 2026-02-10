import {
  useState,
  useCallback,
  useMemo,
  memo,
  forwardRef,
  useEffect,
} from "react";
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
  // Hydration fix states
  const [hasMounted, setHasMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const checkTouch = () => {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    };
    checkTouch();

    const monitor = window.matchMedia("(pointer: coarse)");
    monitor.addEventListener("change", checkTouch);
    return () => monitor.removeEventListener("change", checkTouch);
  }, []);

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
        newColumns[sourceColumn] = {
          ...newColumns[sourceColumn],
          items: newColumns[sourceColumn].items.filter(
            item => item.id !== draggedItem.id
          ),
        };
        newColumns[targetColumnId] = {
          ...newColumns[targetColumnId],
          items: [...newColumns[targetColumnId].items, draggedItem],
        };
        return newColumns;
      });

      handleDragEnd();
    },
    [draggedItem, sourceColumn, handleDragEnd]
  );

  const columnArray = useMemo(() => Object.values(columns), [columns]);

  return (
    <DemoLayout
      title="Kanban Board"
      description="Drag cards between columns to reorganize tasks"
      filename="KanbanBoard.tsx"
    >
      <AnimatePresence>
        {hasMounted && isTouchDevice && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-6 p-4 border border-amber-500/50 bg-amber-400/10 rounded-lg text-sm text-amber-800 dark:bg-amber-900/25 dark:text-amber-200">
              <p className="font-bold mb-1">⚠️ Touch Device Detected</p>
              <p>
                This board uses the <strong>HTML5 Drag and Drop API</strong>,
                which is not supported on most mobile browsers. For the best
                experience, please use a desktop browser with a mouse.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED LAYOUT:
          - flex-col for mobile stacking
          - md:flex-row for desktop horizontal
          - items-stretch ensures all columns stay the same height
      */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
        {columnArray.map(column => (
          /* md:min-w-0 is the "magic" fix that lets flex items shrink 
             properly within the 48rem parent constraint.
          */
          <div key={column.id} className="w-full md:flex-1 min-w-0">
            <KanbanColumn
              column={column}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </div>
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
        /* Removed min-w-[250px] here to allow the column to shrink 
           to 1/3 of the parent width on smaller desktop screens.
        */
        className={`
          h-full transition-colors rounded-lg border border-dashed p-4 min-w-[150px]
          ${
            isDragOver
              ? "border-skin-accent bg-skin-accent/10"
              : "border-skin-line/30 bg-skin-card/30"
          }
        `}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h4
            className="font-semibold text-skin-base"
            data-exclude-heading-link
          >
            {column.title}
          </h4>
          <span className="text-xs font-mono opacity-60">
            {column.items.length}
          </span>
        </div>

        <div className="space-y-2 min-h-[100px]">
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
  forwardRef<HTMLDivElement, KanbanCardProps>(
    ({ item, columnId, onDragStart, onDragEnd }, ref) => {
      return (
        <motion.div
          ref={ref}
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          draggable
          onDragStart={() => onDragStart(item, columnId)}
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
  )
);

KanbanCard.displayName = "KanbanCard";
