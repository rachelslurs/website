import { useCallback, useEffect, useRef, useState } from "react";
import DemoPanel from "./DemoPanel";
import DemoPrimaryButton from "./DemoPrimaryButton";
import DemoSecondaryButton from "./DemoSecondaryButton";
import ScrollToBottomFab from "./ScrollToBottomFab";
import StreamingChatBubble from "./StreamingChatBubble";

interface RadioOptionProps {
  label: string;
  value: string;
  selected: string;
  onChange: (value: string) => void;
  name: string;
}

const LONG_RESPONSE =
  "Let me walk through how React handles state updates during streaming. When a chunk arrives, you call setState with the new partial content. React batches this into a re-render. The component function runs again, the JSX reflects the new content, and the DOM updates. This happens for every single chunk. At 50 milliseconds per chunk, that is 20 re-renders per second. Each re-render diffs the virtual DOM, commits changes, and triggers any layout effects. For a simple chat bubble, this is fine. React is fast enough. But if your component tree is deep, or if you have expensive computations running during render, those 20 re-renders per second start to add up. This is where the distinction between useState and useRef becomes critical. Values that drive what the user sees on screen belong in state. Values that your code reads inside callbacks to make decisions do not. An AbortController, a request ID, a scroll position flag. These are bookkeeping. They inform logic but they do not inform the UI. Putting them in state means React re-renders every time they change, even though nothing visible changed. In a streaming context where updates are already frequent, unnecessary re-renders compound. You are paying the render tax on values the user never sees. The mental model is simple. Ask yourself: does the user need to see this value change? If yes, useState. If no, useRef. Streaming just makes the cost of getting this wrong more visible.";

async function* simulateStream(
  text: string,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) return;
    await new Promise(r => setTimeout(r, 45 + Math.random() * 25));
    yield words[i] + (i < words.length - 1 ? " " : "");
  }
}

const INITIAL_MESSAGES: { role: "user" | "assistant"; content: string }[] = [
  { role: "user", content: "How does React handle streaming updates?" },
  {
    role: "assistant",
    content:
      "Great question. The short answer is: one chunk at a time, each triggering a state update and re-render. But the details matter a lot for performance.",
  },
  { role: "user", content: "Can you go deeper on that?" },
  {
    role: "assistant",
    content:
      "Sure. Each chunk from the stream calls setState, which triggers a re-render. React diffs the virtual DOM, updates the real DOM, and the user sees the new text. At high frequency, this can get expensive.",
  },
  { role: "user", content: "What about scroll behavior during streaming?" },
  {
    role: "assistant",
    content:
      "This is where it gets tricky. Most implementations auto-scroll to the bottom on every update. That works fine if the user is watching the stream come in. But if they scroll up to re-read something...",
  },
  { role: "user", content: "Keep going, explain the full picture." },
];

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

export default function ScrollThrashingDemo() {
  const [mode, setMode] = useState<"broken" | "fixed">("broken");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [partialContent, setPartialContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const userScrolledUpRef = useRef(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const isAtBottom = useCallback((el: HTMLDivElement) => {
    // Tolerance avoids "off by 1px" from fractional scroll values.
    const tolerancePx = 6;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - tolerancePx;
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = isAtBottom(el);
    if (mode === "fixed") {
      userScrolledUpRef.current = !atBottom;
      setShowScrollBtn(!atBottom);
    }
  }, [isAtBottom, mode]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    userScrolledUpRef.current = false;
    setShowScrollBtn(false);
  }, []);

  useEffect(() => {
    if (mode === "broken" && scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [partialContent, messages, mode]);

  useEffect(() => {
    if (mode === "fixed" && !userScrolledUpRef.current && scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [partialContent, messages, mode]);

  useEffect(() => {
    if (mode !== "fixed") return;
    const el = scrollRef.current;
    if (!el) return;
    if (isAtBottom(el)) {
      userScrolledUpRef.current = false;
      setShowScrollBtn(false);
    }
  }, [isAtBottom, mode, partialContent, messages]);

  const reset = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages(INITIAL_MESSAGES);
    setPartialContent("");
    setIsStreaming(false);
    setShowScrollBtn(false);
    userScrolledUpRef.current = false;
  };
  const changeMode = (newMode: string) => {
    reset();
    setMode(newMode as "broken" | "fixed");
  };

  const triggerDemo = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    setIsStreaming(true);
    setPartialContent("");
    userScrolledUpRef.current = false;
    setShowScrollBtn(false);
    const stream = simulateStream(LONG_RESPONSE, signal);
    let buffer = "";
    try {
      for await (const chunk of stream) {
        buffer += chunk;
        setPartialContent(buffer);
      }
      setMessages(prev => [...prev, { role: "assistant", content: buffer }]);
      setPartialContent("");
    } catch (e) {
      /* aborted */
    }
    setIsStreaming(false);
  };

  const annotation =
    mode === "broken"
      ? "⚠ Auto-scrolls on every chunk. Try scrolling up while streaming: you get yanked back down within 50 milliseconds."
      : "✓ Scroll position tracked in a useRef. Scroll up freely during streaming. Use the arrow button to jump back down.";

  return (
    <DemoPanel>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-skin-line/15 p-4">
        <div>
          <div className="text-sm font-bold text-skin-base">
            Problem 3: Scroll Thrashing
          </div>
          <div className="mt-0.5 text-xs text-skin-placeholder">
            Auto-scroll fights the user
          </div>
        </div>
        <div className="flex gap-4">
          <RadioOption
            label="Broken"
            value="broken"
            selected={mode}
            onChange={changeMode}
            name="mode-scroll"
          />
          <RadioOption
            label="Fixed"
            value="fixed"
            selected={mode}
            onChange={changeMode}
            name="mode-scroll"
          />
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-[280px] flex-col gap-3 overflow-y-auto p-4"
        >
          {messages.map((msg, i) => (
            <StreamingChatBubble
              key={i}
              role={msg.role}
              content={msg.content}
            />
          ))}
          {partialContent && (
            <StreamingChatBubble
              role="assistant"
              content={partialContent}
              isPartial
            />
          )}
        </div>

        {showScrollBtn && mode === "fixed" && (
          <ScrollToBottomFab
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            isStreaming={isStreaming}
          />
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
          {isStreaming ? "Streaming — try scrolling up" : "Start long stream"}
        </DemoPrimaryButton>
        <DemoSecondaryButton onClick={reset} className="text-xs">
          Reset
        </DemoSecondaryButton>
      </div>
    </DemoPanel>
  );
}
