import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import DemoPanel from "./DemoPanel";
import DemoPrimaryButton from "./DemoPrimaryButton";
import StreamingChatBubble from "./StreamingChatBubble";
import TypingIndicator from "./TypingIndicator";

const RESPONSES = [
  "React's component model makes it straightforward to build chat interfaces. Each message is a component, the message list is state, and new messages trigger a re-render. For simple cases, this works perfectly well.",
  "Streaming changes the equation. Instead of receiving a complete response and rendering it once, you're receiving chunks every few milliseconds. Each chunk updates state, each state update triggers a re-render. The question becomes: which values actually need to trigger re-renders, and which ones are just bookkeeping?",
  "The answer depends on who's reading the value. If the user needs to see it change, it belongs in state. If only your code needs to reference it inside a callback, it probably doesn't.",
];

function getResponseForMessage(msg: string) {
  const idx = msg.trim().length % RESPONSES.length;
  return RESPONSES[idx];
}

async function* simulateStream(
  text: string,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) return;
    await new Promise(r => setTimeout(r, 40 + Math.random() * 40));
    yield words[i] + (i < words.length - 1 ? " " : "");
  }
}

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export default function StreamingChatNaive() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask me anything about React and streaming UIs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [partialContent, setPartialContent] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [partialContent, messages]);

  const sendMessage = async (
    e: FormEvent | KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);
    setPartialContent("");
    const responseText = getResponseForMessage(userMessage);
    const stream = simulateStream(responseText);
    for await (const chunk of stream) {
      setPartialContent(prev => prev + chunk);
    }
    setPartialContent(final => {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: final || responseText },
      ]);
      return "";
    });
    setIsStreaming(false);
  };

  const suggestions = [
    "How does useState work?",
    "What about useRef?",
    "Tell me about streaming.",
  ];

  return (
    <DemoPanel>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-skin-line/15 p-4">
        <div className="flex items-center gap-2.5">
          <div
            className={[
              "h-2 w-2 rounded-full transition-all duration-300",
              isStreaming
                ? "bg-skin-accent shadow-chart-1"
                : "bg-skin-card-muted shadow-chart-3",
            ].join(" ")}
          />
          <span className="text-[13px] tracking-[0.02em] text-skin-placeholder">
            Naive version: everything in useState
          </span>
        </div>
        <div className="rounded-md bg-skin-card px-2.5 py-1 font-mono text-xs tabular-nums text-skin-placeholder">
          Renders: {renderCountRef.current}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex h-[340px] flex-col gap-3 overflow-y-auto p-4"
      >
        {messages.map((msg, i) => (
          <StreamingChatBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {/* Streaming partial */}
        {isStreaming && partialContent && (
          <StreamingChatBubble
            role="assistant"
            content={partialContent}
            isPartial
          />
        )}

        {/* Typing indicator */}
        {isStreaming && !partialContent && <TypingIndicator />}

        {/* Suggestions - inside scroll area so layout stays fixed */}
        {messages.length <= 1 && !isStreaming && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="focus-outline inline-flex cursor-pointer items-center justify-center rounded-lg border-2 border-skin-line/20 bg-skin-card-muted/20 px-3 py-1.5 text-xs font-semibold text-skin-base transition-all hover:bg-skin-card active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
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
              isStreaming ? "Waiting for response..." : "Type a message..."
            }
            disabled={isStreaming}
            className="flex-1 rounded-lg border border-skin-line/25 bg-skin-fill px-4 py-3 font-mono text-[13px] text-skin-base outline-none transition-colors duration-150 placeholder:text-skin-placeholder disabled:opacity-50"
          />
          <DemoPrimaryButton
            onClick={sendMessage}
            isDisabled={isStreaming || !input.trim()}
            className="gap-2 text-[13px]"
          >
            Send
          </DemoPrimaryButton>
        </div>
      </div>
    </DemoPanel>
  );
}
