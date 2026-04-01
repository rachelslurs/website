import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import DemoPanel from "./DemoPanel";
import DemoPrimaryButton from "./DemoPrimaryButton";
import DemoSecondaryButton from "./DemoSecondaryButton";
import StreamingChatBubble from "./StreamingChatBubble";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isPartial?: boolean;
  tag?: string;
}

interface RadioOptionProps {
  label: string;
  value: string;
  selected: string;
  onChange: (value: string) => void;
  name: string;
}

const RESPONSES = [
  {
    label: "Message 1",
    text: "This is the response to your first message. It covers the basics of component state and how React decides when to re-render your UI.",
  },
  {
    label: "Message 2",
    text: "Here's the second response. Streaming adds complexity because chunks arrive over time, not all at once.",
  },
  {
    label: "Message 3",
    text: "Third response coming in. The key insight is that not every value driving your logic needs to live in useState.",
  },
];

async function* simulateStream(
  text: string,
  signal?: AbortSignal,
  delayMs: number = 50
) {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) return;
    await new Promise(r => setTimeout(r, delayMs + Math.random() * 20));
    yield words[i] + (i < words.length - 1 ? " " : "");
  }
}

function StreamTransition({
  transitionKey,
  children,
  enabled,
}: {
  transitionKey: number;
  children: ReactNode;
  enabled: boolean;
}) {
  const [layers, setLayers] = useState<{ key: number; state: string }[]>([]);
  const prevKeyRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!enabled) {
      prevKeyRef.current = null;
      setLayers([]);
      return;
    }
    if (transitionKey !== prevKeyRef.current) {
      const oldKey = prevKeyRef.current;
      prevKeyRef.current = transitionKey;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (oldKey !== null) {
        setLayers([{ key: transitionKey, state: "entering" }]);
        timeoutRef.current = setTimeout(
          () => setLayers([{ key: transitionKey, state: "entered" }]),
          300
        );
      } else {
        setLayers([{ key: transitionKey, state: "entered" }]);
      }
    }
  }, [transitionKey, enabled]);
  if (!enabled || layers.length === 0) return children || null;
  const currentLayer = layers[layers.length - 1];
  return (
    <div className="relative">
      <div
        key={currentLayer.key}
        className={
          currentLayer.state === "entering"
            ? "animate-[streamIn_0.3s_ease-out_forwards]"
            : ""
        }
      >
        {children}
      </div>
    </div>
  );
}

function RadioOption({
  label,
  value,
  selected,
  onChange,
  name,
}: RadioOptionProps) {
  const isActive = selected === value;
  const colorClass =
    value === "broken" ? "text-skin-chart-1" : "text-skin-chart-3";
  const borderClass =
    value === "broken" ? "border-skin-chart-1" : "border-skin-chart-3";
  const dotClass = value === "broken" ? "bg-skin-chart-1" : "bg-skin-chart-3";
  return (
    <label
      className={[
        "flex cursor-pointer items-center gap-2 font-mono text-xs transition-colors duration-150",
        isActive ? colorClass : "text-skin-placeholder",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 transition-colors duration-150",
          isActive ? borderClass : "border-skin-line/30",
        ].join(" ")}
      >
        {isActive && (
          <span className={["h-1.5 w-1.5 rounded-full", dotClass].join(" ")} />
        )}
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isActive}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {label}
    </label>
  );
}

interface MessageEntry {
  role: "user" | "assistant";
  content: string;
  tag?: string;
}

export default function RaceConditionDemo() {
  const [mode, setMode] = useState<"broken" | "fixed">("broken");
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [partialContent, setPartialContent] = useState("");
  const [partialTag, setPartialTag] = useState("");
  const [transitionKey, setTransitionKey] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const activeStreams = useRef(0);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [partialContent, messages]);

  const reset = () => {
    if (abortRef.current) abortRef.current.abort();
    requestIdRef.current = 0;
    activeStreams.current = 0;
    setMessages([]);
    setPartialContent("");
    setPartialTag("");
    setIsStreaming(false);
  };
  const changeMode = (newMode: string) => {
    reset();
    setMode(newMode as "broken" | "fixed");
  };

  const sendOne = async (index: number, delayMs: number) => {
    const { label, text } = RESPONSES[index];
    setMessages(prev => [
      ...prev,
      { role: "user", content: `${label}: quick question` },
    ]);
    if (mode === "fixed") {
      requestIdRef.current += 1;
      const myRequestId = requestIdRef.current;
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      setPartialContent("");
      setPartialTag(label);
      setTransitionKey(k => k + 1);
      const stream = simulateStream(text, signal, delayMs);
      let buffer = "";
      try {
        for await (const chunk of stream) {
          if (requestIdRef.current !== myRequestId) return;
          buffer += chunk;
          setPartialContent(buffer);
        }
        if (requestIdRef.current === myRequestId) {
          setMessages(prev => [
            ...prev,
            { role: "assistant", content: buffer, tag: label },
          ]);
          setPartialContent("");
          setPartialTag("");
        }
      } catch (e) {
        /* aborted */
      }
    } else {
      activeStreams.current += 1;
      setPartialTag(label);
      const stream = simulateStream(text, undefined, delayMs);
      let buffer = "";
      for await (const chunk of stream) {
        buffer += chunk;
        setPartialContent(buffer);
        setPartialTag(label);
      }
      activeStreams.current -= 1;
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: buffer, tag: label },
      ]);
      if (activeStreams.current === 0) {
        setPartialContent("");
        setPartialTag("");
      }
    }
  };

  const triggerDemo = () => {
    reset();
    setIsStreaming(true);
    sendOne(0, 80);
    setTimeout(() => sendOne(1, 55), 300);
    setTimeout(() => sendOne(2, 30), 600);
    setTimeout(() => setIsStreaming(false), 8000);
  };

  const annotation =
    mode === "broken"
      ? "⚠ No request ID tracking: all three streams write to partialContent. The slowest finishes last and commits out of order."
      : "✓ Request ID stored in a useRef. Each new message increments the counter. Stale streams check requestIdRef.current before writing.";

  return (
    <DemoPanel>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-skin-line/15 p-4">
        <div>
          <div className="text-sm font-bold text-skin-base">
            Problem 2: Race Condition
          </div>
          <div className="mt-0.5 text-[11px] text-skin-placeholder">
            Rapid messages, responses arrive out of order
          </div>
        </div>
        <div className="flex gap-4">
          <RadioOption
            label="Broken"
            value="broken"
            selected={mode}
            onChange={changeMode}
            name="mode-race"
          />
          <RadioOption
            label="Fixed"
            value="fixed"
            selected={mode}
            onChange={changeMode}
            name="mode-race"
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex h-[280px] flex-col gap-3 overflow-y-auto p-4"
      >
        {messages.map((msg, i) => (
          <StreamingChatBubble
            key={i}
            role={msg.role}
            content={msg.content}
            tag={msg.tag}
          />
        ))}
        <StreamTransition
          transitionKey={transitionKey}
          enabled={mode === "fixed"}
        >
          {partialContent ? (
            <StreamingChatBubble
              role="assistant"
              content={partialContent}
              isPartial
              tag={partialTag}
            />
          ) : null}
        </StreamTransition>
        {messages.length === 0 && !partialContent && (
          <div className="flex h-full items-center justify-center font-mono text-xs text-skin-placeholder">
            Click below to fire three messages in quick succession
          </div>
        )}
      </div>

      <div
        className={[
          "border-t border-skin-line/15 p-4 font-mono text-xs leading-relaxed",
          mode === "broken"
            ? "border-l-2 border-l-skin-chart-1 bg-skin-card-muted/10 text-skin-chart-1"
            : "border-l-2 border-l-skin-chart-3 bg-skin-card-muted/10 text-skin-chart-3",
        ].join(" ")}
      >
        {annotation}
      </div>

      <div className="flex gap-2 border-t border-skin-line/15 p-4">
        <DemoPrimaryButton
          onClick={triggerDemo}
          isDisabled={isStreaming}
          className="flex-1 text-xs"
        >
          {isStreaming ? "Streaming..." : "Send three messages rapidly"}
        </DemoPrimaryButton>
        <DemoSecondaryButton onClick={reset} className="text-xs">
          Reset
        </DemoSecondaryButton>
      </div>
    </DemoPanel>
  );
}
