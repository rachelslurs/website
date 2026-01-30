import React, { useState, useEffect } from "react";
import Play from "./icons/Play";
import RotateCcw from "./icons/RotateCcw";
import Database from "./icons/Database";
import Info from "./icons/Info";
import Truck from "./icons/Truck";
import Loader from "./icons/Loader";
import DemoLayout from "@components/DemoLayout";
import Toggle from "@components/Toggle";
import Checkbox from "@components/Checkbox";
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
      setLog(prev => [{ id: newId, text: msg }, ...prev].slice(0, 2));
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
    <DemoLayout title="Shared Brain" filename="SharedBrain.tsx">
      <div className="max-w-7xl w-full bg-skin-card rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 border-skin-line flex flex-col h-[540px]">
        {/* [ HEADER ] */}
        <div className="sharedbrain-header bg-skin-inverted border-b border-skin-line px-4 md:px-10 py-2 flex flex-col md:flex-row items-center justify-between shrink-0 gap-4 md:gap-0 min-h-[5.5rem] md:h-20">
          <div className="sharedbrain-header-controls flex items-center gap-6 md:gap-10">
            {/* Optimistic UI Toggle */}
            <Toggle
              label="Optimistic UI"
              description={isOptimistic ? "Active" : "Inactive"}
              checked={isOptimistic}
              onChange={toggleOptimistic}
            />

            <div
              className="sharedbrain-header-divider h-8 w-px hidden md:block shrink-0"
              aria-hidden
            ></div>

            {/* Simulate Drift Toggle */}
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

          {/* Header Communication Logs */}
          <div className="relative w-full md:w-[340px] min-h-20 flex flex-col justify-center overflow-visible">
            {log.map((entry, i) => {
              const opacity =
                entry.id === visibleId
                  ? "opacity-100"
                  : i === 0
                    ? "opacity-90"
                    : "opacity-70";
              return (
                <div
                  key={entry.id}
                  className={`absolute right-0 left-0 top-0 px-3 py-1.5 rounded-lg border bg-skin-card shadow-sm flex items-center transition-all duration-500 ease-in-out ${opacity} ${
                    i === 0
                      ? "border-skin-accent z-20"
                      : "border-skin-line z-10"
                  }`}
                  style={{ transform: `translateY(${i * 40}px)` }}
                >
                  <span
                    className={`text-[10px] font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis ${i === 0 ? "text-skin-base" : "text-skin-base opacity-80"}`}
                  >
                    {entry.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* [ MAIN STAGE ] */}
        <div className="flex-1 flex flex-row bg-skin-card relative overflow-hidden px-3 md:px-6">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:32px_32px] text-skin-base"></div>

          {/* CLIENT (2/5) */}
          <div className="flex-[2] min-w-0 flex flex-col items-center justify-center p-3 md:p-4 relative z-10">
            <div
              className={`w-full max-w-[420px] rounded-2xl shadow-xl relative overflow-hidden border-2 transition-all flex flex-col bg-skin-card h-[280px] md:h-[320px] ${isOptimistic ? "border-skin-accent ring-8 ring-skin-accent/10" : "border-skin-line shadow-md"}`}
            >
              {showDriftNotification && (
                <div className="absolute top-10 left-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-500">
                  <div className="bg-skin-card text-skin-base px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-skin-accent ring-4 ring-skin-accent/10">
                    <Info size={18} className="text-skin-accent shrink-0" />
                    <p className="text-[12px] font-semibold leading-tight tracking-tight">
                      Update: Saturday confirmed as delivery date.
                    </p>
                  </div>
                </div>
              )}

              <div className="h-7 bg-skin-card-muted border-b border-skin-line flex items-center px-4 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-skin-line"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-skin-line"></div>
                </div>
              </div>

              <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="p-2 bg-skin-accent/10 rounded-lg text-skin-accent">
                    <Truck size={20} />
                  </div>
                  <h4
                    className="text-xs md:text-sm font-bold text-skin-base tracking-tight uppercase"
                    data-exclude-heading-link
                  >
                    Express Delivery
                  </h4>
                </div>

                <div className="bg-skin-card-muted/80 rounded-2xl p-4 md:p-5 border border-skin-line h-20 md:h-24 relative overflow-visible flex flex-col justify-center shadow-inner mb-6 md:mb-8">
                  <p className="text-[9px] text-skin-base font-black uppercase tracking-widest mb-1 opacity-70">
                    Estimated Delivery
                  </p>
                  <div className="min-h-8 flex items-center relative">
                    {step === 0 && (
                      <p className="text-skin-base text-xs md:text-sm font-medium italic opacity-60">
                        Click check delivery below...
                      </p>
                    )}
                    {isOptimistic && (step >= 1 || isPlaying) && (
                      <div className="relative min-h-[2rem] flex items-center w-full">
                        <p
                          className={`font-mono font-bold transition-all duration-500 text-2xl md:text-3xl ${
                            step < 6
                              ? "text-skin-base opacity-70"
                              : simulateDrift
                                ? "opacity-0 absolute scale-95 pointer-events-none"
                                : "text-skin-accent opacity-100"
                          }`}
                          aria-hidden={simulateDrift && step >= 6}
                        >
                          Friday
                        </p>
                        {simulateDrift && step >= 6 && (
                          <p className="text-skin-accent font-mono font-bold text-2xl md:text-3xl animate-in fade-in zoom-in slide-in-from-bottom-2 duration-500 absolute left-0">
                            Saturday
                          </p>
                        )}
                      </div>
                    )}
                    {!isOptimistic && step > 0 && (
                      <div className="flex items-center gap-2">
                        {step < 6 ? (
                          <div className="flex items-center gap-2 animate-in fade-in">
                            <Loader
                              className="text-skin-accent animate-spin"
                              size={16}
                            />
                            <span className="text-[9px] font-black text-skin-accent uppercase tracking-widest">
                              Fetching...
                            </span>
                          </div>
                        ) : (
                          <p className="text-skin-accent font-mono font-bold text-2xl md:text-3xl animate-in fade-in">
                            Friday
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAction}
                  disabled={isPlaying && step < 6}
                  className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-black text-xs md:text-sm transition-all active:scale-95 shadow-lg border-2 [&_svg]:fill-current ${
                    step === 6
                      ? "bg-skin-card-muted text-skin-base border-skin-line hover:bg-skin-card"
                      : isPlaying && step >= 2
                        ? "bg-skin-card-muted text-skin-base border-skin-line cursor-not-allowed opacity-60"
                        : "bg-skin-accent text-white dark:text-[rgb(var(--color-fill))] border-skin-accent hover:opacity-90"
                  }`}
                >
                  {step === 6 ? (
                    <RotateCcw size={18} />
                  ) : isPlaying && step >= 2 ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Play size={18} />
                  )}
                  <span className="uppercase whitespace-nowrap">
                    {step === 6
                      ? "Reset Simulation"
                      : step >= 2
                        ? isOptimistic
                          ? "Confirming..."
                          : "Loading..."
                        : "Check Delivery Date"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* NETWORK STREAM (2/5) */}
          <div className="flex-[2] min-w-0 flex items-center justify-center p-2 relative z-10">
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

          {/* BACKEND (1/5) - UPDATED LAYOUT */}
          <div className="flex-[1] min-w-0 flex flex-col items-center justify-center p-2 md:px-3 relative z-10">
            {/* The wrapper is relative to anchor the text, but the div itself stays in flex flow to center vertically */}
            <div className="relative flex flex-col items-center">
              {/* Database Icon Container */}
              <div
                className={`p-6 rounded-full border-2 transition-all duration-500 relative flex items-center justify-center ${step === 4 ? "bg-skin-card border-skin-accent shadow-xl scale-105" : "bg-skin-card/50 dark:bg-skin-card/60 border-skin-line opacity-70 dark:opacity-80"}`}
              >
                <Database
                  size={28}
                  className={`${step === 4 ? "text-skin-accent" : "text-skin-base opacity-50"}`}
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
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-skin-base opacity-70 text-center">
                  Backend
                </span>
                <span
                  className={`text-[8px] font-bold uppercase tracking-widest h-4 flex items-center justify-center ${step === 4 ? "text-skin-accent animate-pulse" : "invisible"}`}
                >
                  Verifying
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* [ FOOTER ] */}
        <div className="h-4 bg-skin-card-muted border-t border-skin-line flex items-center justify-center shrink-0">
          <div className="h-1 w-20 bg-skin-line rounded-full opacity-50"></div>
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
