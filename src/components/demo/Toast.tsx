import { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import DemoLayout from "@components/DemoLayout";

interface ToastItem {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  timestamp: number;
}

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

const ToastNotification = forwardRef<
  HTMLDivElement,
  ToastProps & { reducedMotion?: boolean }
>(({ message, type = "info", onClose, reducedMotion = false }, ref) => {
  const bgColor =
    type === "success"
      ? "bg-skin-toast-success border-skin-toast-success"
      : type === "error"
        ? "bg-skin-toast-error border-skin-toast-error"
        : "bg-skin-toast-info border-skin-toast-info";

  const iconColor =
    type === "success"
      ? "text-skin-toast-success"
      : type === "error"
        ? "text-skin-toast-error"
        : "text-skin-toast-info";

  const icon =
    type === "success" ? (
      <CheckIcon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
    ) : (
      <ExclamationCircleIcon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
    );

  return (
    <motion.div
      ref={ref}
      layout={!reducedMotion}
      initial={
        reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }
      }
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={
        reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }
      }
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              duration: 0.2,
              layout: { duration: 0.3, ease: "easeOut" },
            }
      }
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor} shadow-lg w-80`}
      onAnimationComplete={definition => {
        // Only call onClose when exit animation completes
        if (definition === "exit") {
          onClose();
        }
      }}
    >
      {icon}
      <p className="text-sm text-skin-base flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-skin-base opacity-70 hover:opacity-100 flex-shrink-0 transition-opacity"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );
});

ToastNotification.displayName = "ToastNotification";

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: "success" | "error" | "info";
    timestamp: number;
  }>;
  removeToast: (id: string) => void;
  reducedMotion?: boolean;
}

function ToastContainer({
  toasts,
  removeToast,
  reducedMotion = false,
}: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            reducedMotion={reducedMotion}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

const DEDUPLICATION_WINDOW_MS = 3000; // Ignore duplicate messages within 3 seconds
const AUTO_DISMISS_DURATION_MS = 3000;
const EXIT_ANIMATION_DURATION_MS = 200; // Match the exit animation duration

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [queuedToasts, setQueuedToasts] = useState<ToastItem[]>([]);
  const [deduplicationEnabled, setDeduplicationEnabled] = useState(true);
  const [maxVisibleToasts, setMaxVisibleToasts] = useState(3);
  const [reducedMotionOverride, setReducedMotionOverride] = useState<
    boolean | undefined
  >(undefined);
  const prefersReducedMotion = useReducedMotion();
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isProcessingRef = useRef(false);

  // Use override if set, otherwise use system preference
  const reducedMotion =
    reducedMotionOverride !== undefined
      ? reducedMotionOverride
      : (prefersReducedMotion ?? false);

  const removeToast = useCallback((id: string) => {
    // Clear timer if exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts(prev => {
      return prev.filter(toast => toast.id !== id);
    });
  }, []);

  // Centralized auto-dismiss timer management
  const scheduleDismiss = useCallback(
    (toastId: string) => {
      // Clear any existing timer for this toast
      const existingTimer = timersRef.current.get(toastId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        removeToast(toastId);
        timersRef.current.delete(toastId);
      }, AUTO_DISMISS_DURATION_MS + EXIT_ANIMATION_DURATION_MS); // Wait for dismiss + animation

      timersRef.current.set(toastId, timer);
    },
    [removeToast]
  );

  // Process queue when there's space available
  useEffect(() => {
    if (isProcessingRef.current) return;
    if (toasts.length >= maxVisibleToasts) return;
    if (queuedToasts.length === 0) return;

    isProcessingRef.current = true;
    const slotsAvailable = maxVisibleToasts - toasts.length;
    const toastsToAdd = queuedToasts.slice(0, slotsAvailable);
    const remainingQueue = queuedToasts.slice(slotsAvailable);

    // Schedule dismiss timers for new toasts
    toastsToAdd.forEach(toast => {
      scheduleDismiss(toast.id);
    });

    // Update states
    setToasts(prev => [...prev, ...toastsToAdd]);
    setQueuedToasts(remainingQueue);
    isProcessingRef.current = false;
  }, [toasts.length, queuedToasts.length, maxVisibleToasts, scheduleDismiss]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const now = Date.now();

      // Deduplication: Check if same message was shown recently (only if enabled)
      if (deduplicationEnabled) {
        const recentToast = [...toasts, ...queuedToasts].find(
          toast =>
            toast.message === message &&
            toast.type === type &&
            now - toast.timestamp < DEDUPLICATION_WINDOW_MS
        );

        if (recentToast) {
          // Reset timer for existing toast
          scheduleDismiss(recentToast.id);
          return;
        }
      }

      const id = Math.random().toString(36).substring(7);
      const newToast: ToastItem = {
        id,
        message,
        type,
        timestamp: now,
      };

      setToasts(prev => {
        if (prev.length < maxVisibleToasts) {
          // Add directly if under limit
          const updated = [...prev, newToast];
          scheduleDismiss(id);
          return updated;
        } else {
          // Add to queue
          setQueuedToasts(queue => [...queue, newToast]);
          return prev;
        }
      });
    },
    [
      toasts,
      queuedToasts,
      scheduleDismiss,
      deduplicationEnabled,
      maxVisibleToasts,
    ]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <DemoLayout
      title="Toast Notifications"
      description="Success, error, and info notifications with deduplication and queueing"
      filename="Toast.tsx"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-6 mb-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deduplicationEnabled}
              onChange={e => setDeduplicationEnabled(e.target.checked)}
              className="w-4 h-4 bg-skin-card"
            />
            <span className="text-sm text-skin-base">Enable Deduplication</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm text-skin-base">Max Toasts:</span>
            <input
              type="number"
              min="1"
              max="10"
              value={maxVisibleToasts}
              onChange={e => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= 10) {
                  setMaxVisibleToasts(value);
                }
              }}
              className="w-16 px-2 py-1 text-sm bg-skin-card"
            />
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={e => setReducedMotionOverride(e.target.checked)}
              className="w-4 h-4 bg-skin-card"
            />
            <span className="text-sm text-skin-base">
              Prefers Reduced Motion{" "}
              {prefersReducedMotion &&
                reducedMotionOverride === undefined &&
                "(System)"}
            </span>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              addToast("Operation completed successfully!", "success")
            }
            className="px-4 py-2 bg-skin-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Success
          </button>
          <button
            onClick={() => addToast("Something went wrong!", "error")}
            className="px-4 py-2 bg-skin-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Error
          </button>
          <button
            onClick={() => addToast("Here's some information for you", "info")}
            className="px-4 py-2 bg-skin-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Info
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              // Test max visible toasts
              for (let i = 0; i < 5; i++) {
                addToast(`Toast ${i + 1}`, "info");
              }
            }}
            className="px-4 py-2 bg-skin-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Show 5 Toasts (Tests Queue)
          </button>
        </div>
        <p className="text-sm text-skin-base opacity-70">
          These notifications will automatically disappear after 3 seconds, or
          you can close them manually. Maximum {maxVisibleToasts} toasts visible
          at once.
        </p>
      </div>
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
        reducedMotion={reducedMotion}
      />
    </DemoLayout>
  );
}
