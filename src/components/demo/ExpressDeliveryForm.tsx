import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PlayIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const SPACING = {
  cardPadding: "p-4 md:p-6",
  fieldGap: "gap-2",
  labelGap: "gap-1",
  sectionGap: "gap-4",
};

interface ExpressDeliveryFormProps {
  step: number;
  isOptimistic: boolean;
  simulateDrift: boolean;
  isPlaying: boolean;
  showDriftNotification: boolean;
  onAction: () => void;
}

function ExpressDeliveryForm({
  step,
  isOptimistic,
  simulateDrift,
  isPlaying,
  showDriftNotification,
  onAction,
}: ExpressDeliveryFormProps) {
  const isConfirmed = step === 6;

  return (
    <div
      className={`w-full max-w-[520px] min-h-[250px] rounded-2xl shadow-xl relative overflow-hidden border-2 transition-all flex flex-col bg-skin-card shrink-0 ${isOptimistic ? "border-skin-line/70 ring-8 ring-skin-accent/10" : "border-skin-line/70"}`}
    >
      <AnimatePresence>
        {showDriftNotification && (
          <motion.div
            key="drift-notification"
            className="absolute top-4 left-4 right-4 z-50"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="bg-skin-card text-skin-base p-2 rounded-xl shadow-xl flex items-center gap-3 border border-skin-line">
              <InformationCircleIcon className="h-4 w-4 text-skin-accent shrink-0" />
              <p className="text-sm font-semibold leading-snug tracking-tight">
                Update: Saturday confirmed as delivery date.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`${SPACING.cardPadding} flex-1 min-h-0 flex flex-col overflow-hidden`}
      >
        <div className="flex w-full">
          <h3
            className="font-bold text-skin-base tracking-tight"
            data-exclude-heading-link
          >
            Delivery Date
          </h3>
        </div>

        <div className={`flex flex-col justify-center mt-6`}>
          <label className="text-xs pb-2 font-semibold uppercase tracking-wider text-skin-base">
            {isConfirmed ? "Confirmed Date" : "Estimated Date"}
          </label>
          <div className="h-12 flex items-center justify-center rounded-xl bg-skin-card-muted/20 border border-skin-line px-4 py-3 relative">
            {step === 0 && (
              <p className="text-skin-base text-xs md:text-sm font-medium italic opacity-60">
                —
              </p>
            )}
            {step > 0 && !isOptimistic && step < 6 && (
              <div className="flex items-center gap-2 animate-in fade-in">
                <span className="text-xs font-semibold text-skin-accent uppercase tracking-wider">
                  Fetching…
                </span>
              </div>
            )}
            {step > 0 && (isOptimistic || step === 6) && (
              <div className="relative min-h-[1.5rem] flex items-center justify-center w-full">
                <p
                  className={`font-mono font-bold text-lg md:text-xl transition-all duration-500 ${
                    step < 6
                      ? "text-skin-base opacity-80"
                      : simulateDrift
                        ? "opacity-0 absolute scale-95 pointer-events-none"
                        : "text-skin-accent opacity-100"
                  }`}
                  aria-hidden={simulateDrift && step >= 6}
                >
                  Friday
                </p>
                {isOptimistic && simulateDrift && step >= 6 && (
                  <p className="text-skin-accent font-mono font-bold text-lg md:text-xl animate-in fade-in zoom-in slide-in-from-bottom-2 duration-500 absolute left-1/2 -translate-x-1/2">
                    Saturday
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`${SPACING.cardPadding} pt-0 shrink-0 flex justify-end`}>
        <button
          onClick={onAction}
          disabled={isPlaying && step < 6}
          className={`flex w-full items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold text-xs md:text-sm transition-all active:scale-95 shadow-lg border-2 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:shrink-0 ${
            step === 6
              ? "bg-skin-card-muted/20 text-skin-base border-skin-line hover:bg-skin-card"
              : isPlaying && step >= 2
                ? "bg-skin-card-muted/20 text-skin-base border-skin-line cursor-not-allowed opacity-60"
                : "bg-skin-accent text-white dark:text-[rgb(var(--color-fill))] border-skin-accent hover:opacity-90"
          }`}
        >
          {step === 6 ? (
            <ArrowUturnLeftIcon className="h-4 w-4" />
          ) : isPlaying && step >= 2 ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          <span className="uppercase whitespace-nowrap">
            {step === 6
              ? "Reset simulation"
              : step >= 2
                ? isOptimistic
                  ? "Confirming…"
                  : "Loading…"
                : "Check delivery date"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ExpressDeliveryForm;
