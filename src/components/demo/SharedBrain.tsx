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
 * - Always horizontal: Client (2/5) | Network stream (2/5) | Backend (1/5)
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
      <div className="max-w-7xl w-full bg-skin-card rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 border-skin-line flex flex-col h-[540px]">
        {/* [ HEADER ] - 50% width each side with center divider */}
        <div className="sharedbrain-header w-full bg-skin-inverted border-b border-skin-line flex shrink-0 min-h-[5.5rem] md:min-h-[5rem]">
          <div className="sharedbrain-header-controls flex-1 flex items-center justify-center md:justify-end md:pr-6 py-4 px-4 min-w-0">
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
          <div className="sharedbrain-header-controls flex-1 flex items-center justify-center md:justify-start md:pl-6 py-4 px-4 min-w-0">
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

        {/* [ MAIN STAGE ] */}
        <div className="flex-1 flex flex-row bg-skin-card relative overflow-hidden px-4 md:px-6">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:32px_32px] text-skin-base"></div>

          {/* CLIENT (widest) */}
          <div className="flex-[3] min-w-0 flex flex-col items-center justify-center p-4 md:p-6 relative z-10">
            <ExpressDeliveryForm
              step={step}
              isOptimistic={isOptimistic}
              simulateDrift={simulateDrift}
              isPlaying={isPlaying}
              showDriftNotification={showDriftNotification}
              onAction={handleAction}
            />
          </div>

          {/* NETWORK STREAM */}
          <div className="flex-[2] min-w-0 flex items-center justify-center p-4 relative z-10">
            <div className="w-full h-1 bg-skin-line rounded-full relative overflow-hidden">
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

          {/* BACKEND (narrowest) */}
          <div className="flex-[1] min-w-0 flex flex-col items-center justify-center p-4 md:p-6 relative z-10">
            {/* The wrapper is relative to anchor the text, but the div itself stays in flex flow to center vertically */}
            <div className="relative flex flex-col items-center">
              {/* Database Icon Container */}
              <div
                className={`p-6 rounded-full border-2 transition-all duration-500 relative flex items-center justify-center ${step === 4 ? "bg-skin-card border-skin-accent shadow-xl scale-105" : "bg-skin-card/50 dark:bg-skin-card/60 border-skin-line opacity-70 dark:opacity-80"}`}
              >
                <CircleStackIcon
                  className={`w-7 h-7 ${step === 4 ? "text-skin-accent" : "text-skin-base opacity-50"}`}
                />
                {step === 4 && (
                  <div className="absolute top-0 right-0 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skin-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-skin-accent"></span>
                  </div>
                )}
              </div>

              {/* Text Container - Absolute positioned to not affect vertical centering of the Icon */}
              <div className="absolute top-full mt-4 flex flex-col items-center gap-0.5 w-32 justify-start pointer-events-none">
                <span className="text-xs font-black uppercase tracking-widest text-skin-base opacity-70 text-center">
                  Backend
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-widest h-4 flex items-center justify-center ${step === 4 ? "text-skin-accent animate-pulse" : "invisible"}`}
                >
                  Verifying
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* [ FOOTER: Console ] - height fits ~5 log lines, rest scrolls */}
        <div className="h-[10rem] shrink-0 flex flex-col min-h-0">
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
