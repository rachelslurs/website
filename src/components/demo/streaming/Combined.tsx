import type { FormEvent, KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import DemoPanel from "./DemoPanel";
import DemoPrimaryButton from "./DemoPrimaryButton";
import ScrollToBottomFab from "./ScrollToBottomFab";
import StreamingChatBubble from "./StreamingChatBubble";
import TypingIndicator from "./TypingIndicator";

const RESPONSES = [
  "React's component model makes it straightforward to build chat interfaces. Each message is a component, the message list is state, and new messages trigger a re-render. For simple cases, this works perfectly well. But streaming changes the equation. Instead of receiving a complete response, you're receiving chunks every few milliseconds.",
  "The key insight is that not every value your component uses needs to live in useState. Some values are bookkeeping: they inform your logic but they don't inform the UI. An AbortController that cancels a previous request, a request ID that guards against race conditions, a scroll flag that tracks whether the user has scrolled up. None of these need to trigger re-renders. They belong in useRef.",
  "Streaming compresses the feedback loop between state changes and what the user sees. The tighter that loop, the more it matters that you're only re-rendering when you mean to. useState for what the user sees. useRef for what your code decides. That's the whole mental model.",
  "Think about what happens without these guards. Send a new message before the old one finishes? Both streams write to the same buffer. Fire rapid messages? Responses arrive out of order and the slow one overwrites the fast one. Auto-scroll on every chunk? The user gets yanked back to the bottom every time they try to read something above.",
];

function getResponse(msg: string): string {
  return RESPONSES[msg.trim().length % RESPONSES.length];
}

async function* simulateStream(
  text: string,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) return;
    await new Promise(r => setTimeout(r, 40 + Math.random() * 35));
    yield words[i] + (i < words.length - 1 ? " " : "");
  }
}

function RefBadge({ label }: { label: string }) {
  return (
    <span className="ml-1.5 rounded border border-skin-chart-3/15 bg-skin-card-muted/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-skin-chart-3">
      {label}
    </span>
  );
}

export default function StreamingChatFixed() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Ask me anything about React and streaming UIs. Try sending multiple messages quickly, or scroll up while I'm responding.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [partialContent, setPartialContent] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const userScrolledUpRef = useRef(false);
  const savedUpdatesRef = useRef(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 1;
    userScrolledUpRef.current = !atBottom;
    setShowScrollBtn(!atBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      userScrolledUpRef.current = false;
      setShowScrollBtn(false);
    }
  }, []);

  useEffect(() => {
    if (!userScrolledUpRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [partialContent, messages]);

  const sendMessage = async (
    e: FormEvent | KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    requestIdRef.current += 1;
    const myRequestId = requestIdRef.current;

    setIsStreaming(true);
    setPartialContent("");

    const responseText = getResponse(userMessage);
    const totalWords = responseText.split(" ").length;
    const stream = simulateStream(responseText, signal);
    let buffer = "";
    let chunksReceived = 0;

    try {
      for await (const chunk of stream) {
        if (requestIdRef.current !== myRequestId) {
          savedUpdatesRef.current += totalWords - chunksReceived;
          return;
        }
        chunksReceived++;
        buffer += chunk;
        setPartialContent(buffer);
      }

      if (requestIdRef.current === myRequestId) {
        setMessages(prev => [...prev, { role: "assistant", content: buffer }]);
        setPartialContent("");
        setIsStreaming(false);
      }
    } catch {
      savedUpdatesRef.current += totalWords - chunksReceived;
      if (requestIdRef.current === myRequestId) {
        setIsStreaming(false);
      }
    }
  };

  const suggestions = [
    "How does useState work?",
    "What about useRef?",
    "Tell me about streaming.",
  ];

  return (
    <DemoPanel>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-skin-line/15 p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={[
              "h-2 w-2 rounded-full transition-all duration-300",
              isStreaming
                ? "bg-skin-accent shadow-chart-1"
                : "bg-skin-card-muted shadow-chart-3",
            ].join(" ")}
          />
          <span className="text-sm font-bold text-skin-base">
            Fixed version
          </span>
          <span className="text-[11px] text-skin-placeholder">
            all three useRef fixes applied
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-md bg-skin-card px-2.5 py-1 font-mono text-xs tabular-nums text-skin-placeholder">
            Renders: {renderCountRef.current}
          </div>
          {savedUpdatesRef.current > 0 && (
            <div className="rounded-md bg-skin-card-muted/10 px-2.5 py-1 font-mono text-xs tabular-nums text-skin-chart-3">
              Saved: {savedUpdatesRef.current}
            </div>
          )}
        </div>
      </div>

      {/* Ref badges */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-skin-line/10 px-4 py-3">
        <span className="font-mono text-[11px] text-skin-placeholder">
          Active refs:
        </span>
        <RefBadge label="AbortController" />
        <RefBadge label="requestId" />
        <RefBadge label="scrollPosition" />
      </div>

      {/* Messages */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-[320px] flex-col gap-3 overflow-y-auto p-4"
        >
          {messages.map((msg, i) => (
            <StreamingChatBubble
              key={i}
              role={msg.role}
              content={msg.content}
            />
          ))}
          {isStreaming && partialContent && (
            <StreamingChatBubble
              role="assistant"
              content={partialContent}
              isPartial
            />
          )}
          {isStreaming && !partialContent && <TypingIndicator />}

          {messages.length <= 1 && !isStreaming && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="focus-outline inline-flex cursor-pointer items-center justify-center rounded-lg border-2 border-skin-line/20 bg-skin-card-muted/20 px-3 py-1.5 text-xs font-semibold text-skin-base transition-all hover:bg-skin-card active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {showScrollBtn && (
          <ScrollToBottomFab
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            isStreaming={isStreaming}
          />
        )}
      </div>

      {/* Input */}
      <div className="border-t border-skin-line/15 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(e)}
            placeholder={
              isStreaming
                ? "Send another to test cancel..."
                : "Type a message..."
            }
            className="flex-1 rounded-lg border border-skin-line/25 bg-skin-fill px-4 py-3 font-mono text-[13px] text-skin-base outline-none transition-colors duration-150 placeholder:text-skin-placeholder"
          />
          <DemoPrimaryButton
            type="button"
            onClick={sendMessage}
            isDisabled={!input.trim()}
            className="text-[13px]"
          >
            Send
          </DemoPrimaryButton>
        </div>
      </div>

      {/* Annotation */}
      <div className="border-t border-skin-line/15 border-l-2 border-l-skin-chart-3 bg-skin-card-muted/10 p-4 font-mono text-xs leading-relaxed text-skin-chart-3">
        ✓ Send mid-stream to test cancel. Send rapidly to test race conditions.
        Scroll up during streaming to test scroll control.
      </div>
    </DemoPanel>
  );
}
