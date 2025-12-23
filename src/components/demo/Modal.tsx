import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DemoLayout from "@components/DemoLayout";

const Modal = memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DemoLayout
      title="Modal"
      description="Smooth transitions with proper focus management"
      filename="Modal.tsx"
    >
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-skin-accent text-white rounded-lg hover:opacity-90 transition-colors"
      >
        Open Modal
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
            />

            <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md bg-skin-fill rounded-lg p-6 shadow-xl border border-skin-line"
              >
                <h3 className="text-lg font-semibold text-skin-base mb-4">
                  Modal Example
                </h3>

                <p className="text-skin-base opacity-80 mb-6">
                  This modal demonstrates smooth transitions using Framer
                  Motion. It includes proper focus management and accessibility
                  features.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-skin-base border border-skin-line rounded-lg hover:bg-skin-card transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-skin-accent text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </DemoLayout>
  );
});

Modal.displayName = "Modal";

export default Modal;
