import React, { useState, useEffect } from "react";
import { CircleStackIcon } from "@heroicons/react/24/outline";
import DemoLayout from "@components/DemoLayout";
import Toggle from "@components/Toggle";
import Checkbox from "@components/Checkbox";
import Console from "@components/demo/Console";
import ExpressDeliveryForm from "@components/demo/ExpressDeliveryForm";
/**
 * ARCHITECTURAL LAYOUT: RESPONSIVE UNIFIED CANVAS
 * * [ HEADER ]
 * - Responsive container (Stacked on mobile, row on desktop)
 * - LEFT: Controls (Optimistic UI Toggle | Simulate Drift Toggle)
 * - RIGHT: Sequential Communication Logs
 * * [ MAIN STAGE ]
 * - Desktop: horizontal Client (3) | Network stream (2) | Backend (1)
 * - Mobile: stacked Client → Arrow (stream direction) → Backend
 */

// --- 2. MAIN COMPONENT ---
function SharedBrain() {
  const [isOptimistic, setIsOptimistic] = useState(true);
  const [simulateDrift, setSimulateDrift] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [showDriftNotification, setShowDriftNotification] = useState(false);

  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const [visibleId, setVisibleId] = useState<number | null>(null);

  // Animation Engine
  useEffect(() => {
    if (!isPlaying) return;
    if (step >= 6) {
      setIsPlaying(false);
      return;
    }

    let delay = 1400;
    if (step === 1 && isOptimistic) {
      delay = 400;
    }

    const timer = setTimeout(() => {
      setStep(s => s + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, step, isOptimistic]);

  // Message Log Management
  useEffect(() => {
    const getMessage = (currentStep: number): string | null => {
      switch (currentStep) {
        case 1:
          return "User requests delivery date";
        case 2:
          return isOptimistic
            ? "Frontend Shared Brain estimates Friday"
            : "Awaiting response from backend...";
        case 3:
          return isOptimistic ? "Transmitting expected state to API" : null;
        case 4:
          return isOptimistic
            ? "Backend verifying business rules..."
            : "Backend checking business rules...";
        case 5:
          if (isOptimistic) {
            return simulateDrift
              ? "Conflict detected: Friday → Saturday"
              : "State verified: Friday confirmed";
          }
          return null;
        case 6:
          return "Handshake complete";
        default:
          return null;
      }
    };

    const msg = getMessage(step);
    if (msg) {
      const newId = Math.random();
      setLog(prev => [{ id: newId, text: msg }, ...prev]);
      const timer = setTimeout(() => {
        setVisibleId(newId);
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [step, isOptimistic, simulateDrift]);

  useEffect(() => {
    if (step === 6 && simulateDrift && isOptimistic) {
      setShowDriftNotification(true);
      const timer = setTimeout(() => setShowDriftNotification(false), 4000);
      return () => clearTimeout(timer);
    }
    setShowDriftNotification(false);
    return undefined;
  }, [step, simulateDrift, isOptimistic]);

  const reset = () => {
    setIsPlaying(false);
    setStep(0);
    setLog([]);
    setVisibleId(null);
    setShowDriftNotification(false);
  };

  const handleAction = () => {
    if (step === 6) reset();
    else {
      setStep(1);
      setIsPlaying(true);
    }
  };

  const toggleOptimistic = () => {
    const next = !isOptimistic;
    setIsOptimistic(next);
    if (!next) setSimulateDrift(false);
    reset();
  };

  return (
    <DemoLayout
      title="Shared Brain"
      filename="SharedBrain.tsx"
      showHeader={false}
    >
      <div className="max-w-7xl w-full bg-skin-card rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 border-skin-line flex flex-col h-[540px] md:h-[620px]">
        {/* [ HEADER ] - compact on mobile with reserved space so it never covers content */}
        <div className="sharedbrain-header relative z-20 w-full bg-skin-inverted border-b border-skin-line flex shrink-0 min-h-[3.25rem] py-2 md:py-0 md:min-h-[5rem]">
          <div className="sharedbrain-header-controls flex-1 flex items-center justify-center md:justify-end md:pr-6 py-2 md:py-4 px-2 md:px-4 min-w-0">
            <Toggle
              label="Optimistic UI"
              description={isOptimistic ? "Active" : "Inactive"}
              checked={isOptimistic}
              onChange={toggleOptimistic}
            />
          </div>
          <div
            className="sharedbrain-header-divider w-px bg-skin-line shrink-0 self-stretch my-2 hidden md:block"
            aria-hidden
          />
          <div className="sharedbrain-header-controls flex-1 flex items-center justify-center md:justify-start md:pl-6 py-2 md:py-4 px-2 md:px-4 min-w-0">
            <Checkbox
              label="Simulate Drift"
              description="Trigger Conflict"
              checked={simulateDrift}
              onChange={checked => {
                setSimulateDrift(checked);
                reset();
              }}
              disabled={!isOptimistic}
            />
          </div>
        </div>

        {/* [ MAIN STAGE ] - stacked on mobile, row on desktop; z-0 so header stays on top */}
        <div className="flex-1 flex flex-col md:flex-row bg-skin-card relative z-0 overflow-hidden px-4 md:px-6 min-h-0">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:32px_32px] text-skin-base"></div>

          {/* CLIENT - fixed proportion on desktop; overflow only on mobile if needed */}
          <div className="flex-1 md:flex-[3] min-w-0 min-h-0 flex flex-col items-center justify-center md:justify-center p-4 md:px-6 relative z-10 overflow-y-auto md:overflow-visible">
            <div className="w-full flex flex-col items-center md:my-5 shrink-0">
              <ExpressDeliveryForm
                step={step}
                isOptimistic={isOptimistic}
                simulateDrift={simulateDrift}
                isPlaying={isPlaying}
                showDriftNotification={showDriftNotification}
                onAction={handleAction}
              />
            </div>
          </div>

          {/* NETWORK: arrow on mobile (only when sending/receiving), horizontal bar on desktop */}
          <div className="flex-none md:flex-[2] min-w-0 flex items-center justify-center py-2 md:py-4 md:px-4 relative z-10">
            {/* Mobile: arrow down = sending (step 3), arrow up = receiving (step 5); hidden when idle */}
            <div
              className="flex flex-col items-center justify-center md:hidden min-h-[2rem] transition-opacity duration-300"
              aria-hidden
            >
              {step === 3 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-skin-accent stream-glow-mobile"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                    transform="rotate(90 12 12)"
                  />
                </svg>
              )}
              {step === 5 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-8 h-8 ${simulateDrift && isOptimistic ? "text-[rgb(var(--color-toast-error-icon))]" : "text-[rgb(var(--color-toast-success-icon))]"}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                    transform="rotate(-90 12 12)"
                  />
                </svg>
              )}
            </div>
            {/* Desktop: horizontal stream bar */}
            <div className="hidden md:block w-full h-1 bg-skin-line rounded-full relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-skin-accent/20 dark:bg-skin-accent/35 transition-opacity duration-500 ${step === 3 || step === 5 ? "opacity-100" : "opacity-0"}`}
              ></div>
              {step === 3 && (
                <div className="absolute bg-skin-accent stream-glow rounded-full animate-stream-horizontal-forward"></div>
              )}
              {step === 5 && (
                <div
                  className={`absolute shadow-lg rounded-full animate-stream-horizontal-backward ${simulateDrift && isOptimistic ? "stream-dot-error" : "stream-dot-success"}`}
                ></div>
              )}
            </div>
          </div>

          {/* BACKEND - smaller on mobile */}
          <div className="flex-none md:flex-[1] min-w-0 flex flex-col items-center justify-center p-2 md:p-6 relative z-10">
            <div className="relative flex flex-col items-center">
              <div
                className={`p-3 md:p-6 rounded-full border-2 transition-all duration-500 relative flex items-center justify-center ${step === 4 ? "bg-skin-card border-skin-accent shadow-xl scale-105" : "bg-skin-card/50 dark:bg-skin-card/60 border-skin-line opacity-70 dark:opacity-80"}`}
              >
                <CircleStackIcon
                  className={`w-5 h-5 md:w-7 md:h-7 ${step === 4 ? "text-skin-accent" : "text-skin-base opacity-50"}`}
                />
                {step === 4 && (
                  <div className="absolute top-0 right-0 flex h-2.5 w-2.5 md:h-3.5 md:w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skin-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3.5 md:w-3.5 bg-skin-accent"></span>
                  </div>
                )}
              </div>

              <div className="absolute top-full mt-2 md:mt-4 flex flex-col items-center gap-0.5 w-24 md:w-32 justify-start pointer-events-none">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-skin-base opacity-70 text-center">
                  Backend
                </span>
                <span
                  className={`text-[10px] md:text-xs font-bold uppercase tracking-widest h-3 md:h-4 flex items-center justify-center ${step === 4 ? "text-skin-accent animate-pulse" : "invisible"}`}
                >
                  Verifying
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* [ FOOTER: Console ] - shorter on mobile to fit stacked stage */}
        <div className="h-[6rem] md:h-[10rem] shrink-0 flex flex-col min-h-0">
          <Console
            log={log}
            visibleId={visibleId}
            variant="inverted"
            className="flex-1 min-h-0"
          />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .sharedbrain-header-controls label,
          .sharedbrain-header-controls label *:not(input) { color: rgb(var(--color-fill)) !important; }
          .sharedbrain-header .sharedbrain-header-divider { background-color: rgb(var(--color-fill)) !important; }
          .stream-glow { box-shadow: 0 0 15px rgb(var(--color-accent)); }
          .stream-glow-mobile { filter: drop-shadow(0 0 8px rgb(var(--color-accent))); }
          .stream-dot-success { background-color: rgb(var(--color-toast-success-icon)); }
          .stream-dot-error { background-color: rgb(var(--color-toast-error-icon)); }
          .animate-stream-horizontal-forward { width: 30%; height: 100%; top: 0; left: -30%; animation: stream-right 1.4s linear forwards; }
          .animate-stream-horizontal-backward { width: 30%; height: 100%; top: 0; right: -30%; animation: stream-left 1.4s linear forwards; }
          @keyframes stream-right { 0% { left: -30%; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
          @keyframes stream-left { 0% { right: -30%; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { right: 100%; opacity: 0; } }
        `,
        }}
      />
    </DemoLayout>
  );
}

export default SharedBrain;
