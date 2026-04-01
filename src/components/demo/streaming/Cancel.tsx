import { useEffect, useRef, useState } from "react";
import DemoPanel from "./DemoPanel";
import DemoPrimaryButton from "./DemoPrimaryButton";
import DemoSecondaryButton from "./DemoSecondaryButton";
import StreamingChatBubble from "./StreamingChatBubble";

interface RadioOptionProps {
  label: string;
  value: string;
  selected: string;
  onChange: (value: string) => void;
  name: string;
}

const RESPONSES = [
  "React's component model makes it straightforward to build chat interfaces. Each message becomes a component, the list is state, and new messages trigger a re-render. For simple request-response, this is fine.",
  "Streaming changes things. Instead of one complete response, you get chunks every few milliseconds. Each chunk means a state update, each update means a re-render. That's where the trouble starts.",
  "The real question isn't whether to use state. It's which values need to trigger re-renders and which ones are just bookkeeping your code reads inside callbacks.",
];

function getResponse(msg: string, index: number): string {
  return RESPONSES[(msg.length + index) % RESPONSES.length];
}

async function* simulateStream(
  text: string,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) return;
    await new Promise(r => setTimeout(r, 50 + Math.random() * 30));
    yield words[i] + (i < words.length - 1 ? " " : "");
  }
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

export default function CancelProblemDemo() {
  const [mode, setMode] = useState<"broken" | "fixed">("broken");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [partialContent, setPartialContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const msgCounter = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [partialContent, messages]);

  const reset = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setPartialContent("");
    setIsStreaming(false);
    msgCounter.current = 0;
  };

  const changeMode = (newMode: string) => {
    reset();
    setMode(newMode as "broken" | "fixed");
  };

  const sendMessage = async (text: string) => {
    msgCounter.current += 1;
    const count = msgCounter.current;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    if (mode === "fixed") {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
    }
    setIsStreaming(true);
    setPartialContent("");
    const responseText = getResponse(text, count);
    const signal = mode === "fixed" ? abortRef.current?.signal : undefined;
    const stream = simulateStream(responseText, signal);
    let buffer = "";
    try {
      for await (const chunk of stream) {
        buffer += chunk;
        setPartialContent(buffer);
      }
      setMessages(prev => [...prev, { role: "assistant", content: buffer }]);
    } catch (e) {
      /* aborted */
    }
    setIsStreaming(false);
    setPartialContent("");
  };

  const triggerDemo = () => {
    reset();
    sendMessage("How does useState work?");
    setTimeout(() => sendMessage("What about useRef?"), 400);
  };

  const annotation =
    mode === "broken"
      ? "⚠ No AbortController: the first stream keeps writing after the second starts. Both write to the same partialContent buffer."
      : "✓ AbortController stored in a useRef. New message aborts the previous stream before starting. No jumbled output.";

  return (
    <DemoPanel>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-skin-line/15 p-4">
        <div>
          <div className="text-sm font-bold text-skin-base">
            Problem 1: No Cancel
          </div>
          <div className="mt-0.5 text-[11px] text-skin-placeholder">
            What happens when you send a new message mid-stream?
          </div>
        </div>
        <div className="flex gap-4">
          <RadioOption
            label="Broken"
            value="broken"
            selected={mode}
            onChange={changeMode}
            name="mode-cancel"
          />
          <RadioOption
            label="Fixed"
            value="fixed"
            selected={mode}
            onChange={changeMode}
            name="mode-cancel"
          />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex h-[260px] flex-col gap-3 overflow-y-auto p-4"
      >
        {messages.map((msg, i) => (
          <StreamingChatBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {partialContent && (
          <StreamingChatBubble
            role="assistant"
            content={partialContent}
            isPartial
          />
        )}
        {messages.length === 0 && !partialContent && (
          <div className="flex h-full items-center justify-center font-mono text-xs text-skin-placeholder">
            Click the button below to see the{" "}
            {mode === "broken" ? "problem" : "fix"}
          </div>
        )}
      </div>

      {/* Annotation */}
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

      {/* Actions */}
      <div className="flex gap-2 border-t border-skin-line/15 p-4">
        <DemoPrimaryButton
          onClick={triggerDemo}
          isDisabled={isStreaming}
          className="flex-1 text-xs"
        >
          {isStreaming ? "Streaming..." : "Send two messages quickly"}
        </DemoPrimaryButton>
        <DemoSecondaryButton onClick={reset} className="text-xs">
          Reset
        </DemoSecondaryButton>
      </div>
    </DemoPanel>
  );
}
