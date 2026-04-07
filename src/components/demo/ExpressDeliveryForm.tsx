import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PlayIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const SPACING = {
  cardPadding: "p-2 md:p-3",
  fieldGap: "gap-1 md:gap-1.5",
  labelGap: "gap-0.5 md:gap-0.5",
  sectionGap: "gap-2 md:gap-3",
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
      className={`w-full max-w-[21rem] min-h-[7rem] md:min-h-[9rem] rounded-lg md:rounded-xl shadow-md md:shadow-lg relative overflow-hidden border-2 transition-all flex flex-col bg-skin-card shrink-0 ${isOptimistic ? "border-skin-line/70 ring-2 md:ring-4 ring-skin-accent/10" : "border-skin-line/70"}`}
    >
      <AnimatePresence>
        {showDriftNotification && (
          <motion.div
            key="drift-notification"
            className="absolute top-1.5 left-1.5 right-1.5 md:top-3 md:left-3 md:right-3 z-50"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="bg-skin-card text-skin-base p-1 md:p-1.5 rounded-md md:rounded-lg shadow-lg flex items-center gap-1.5 md:gap-2 border border-skin-line">
              <InformationCircleIcon className="h-3 w-3 md:h-3.5 md:w-3.5 text-skin-accent shrink-0" />
              <p className="text-[10px] md:text-xs font-semibold leading-snug tracking-tight">
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
            className="font-bold text-xs md:text-sm text-skin-base tracking-tight"
            data-exclude-heading-link
          >
            Delivery Date
          </h3>
        </div>

        <div className="flex flex-col justify-center mt-1.5 md:mt-2.5">
          <label className="text-[10px] md:text-xs pb-1 md:pb-1.5 font-semibold uppercase tracking-wider text-skin-base">
            {isConfirmed ? "Confirmed Date" : "Estimated Date"}
          </label>
          <div className="h-8 md:h-10 flex items-center justify-center rounded-md md:rounded-lg bg-skin-card-muted/20 border border-skin-line px-2.5 md:px-3 py-0 relative">
            {step === 0 && (
              <p className="text-skin-base text-[10px] md:text-xs font-medium italic opacity-60 leading-none">
                —
              </p>
            )}
            {step > 0 && !isOptimistic && step < 6 && (
              <div className="flex items-center gap-2 animate-in fade-in">
                <span className="text-[10px] font-semibold text-skin-accent uppercase tracking-wider leading-none">
                  Fetching…
                </span>
              </div>
            )}
            {step > 0 && (isOptimistic || step === 6) && (
              <div className="relative flex min-h-5 w-full items-center justify-center md:min-h-6">
                <p
                  className={`font-sans tabular-nums font-bold text-sm md:text-base transition-all duration-500 ${
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
                  <p className="text-skin-accent font-sans tabular-nums font-bold text-sm md:text-base animate-in fade-in zoom-in slide-in-from-bottom-2 duration-500 absolute left-1/2 -translate-x-1/2">
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
          className={`flex w-full items-center justify-center gap-1.5 md:gap-2 py-1.5 md:py-2 px-3 md:px-3.5 rounded-md md:rounded-lg font-semibold text-[10px] md:text-xs transition-all active:scale-95 shadow-sm md:shadow-md border-2 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:shrink-0 ${
            step === 6
              ? "bg-skin-card-muted/20 text-skin-base border-skin-line hover:bg-skin-card"
              : isPlaying && step >= 2
                ? "bg-skin-card-muted/20 text-skin-base border-skin-line cursor-not-allowed opacity-60"
                : "bg-skin-accent text-skin-inverted border-skin-accent hover:opacity-90"
          }`}
        >
          {step === 6 ? (
            <ArrowUturnLeftIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
          ) : isPlaying && step >= 2 ? (
            <ArrowPathIcon className="h-3 w-3 md:h-3.5 md:w-3.5 animate-spin" />
          ) : (
            <PlayIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
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
