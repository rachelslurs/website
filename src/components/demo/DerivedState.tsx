import { useState, useEffect, useRef } from "react";

/*
  Derived state: contrast to the useEffect branching graph.
  Straight top-to-bottom flow — chart-3 (green) for a clean path.
*/

type NodeDef = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  sub: string | null;
};

const DS_NODE_W = 252;
const DS_ORIGIN_X = (500 - DS_NODE_W) / 2;

const NODES: NodeDef[] = [
  {
    id: "props",
    label: "Props",
    x: DS_ORIGIN_X,
    y: 12,
    w: DS_NODE_W,
    h: 58,
    sub: "products, filter",
  },
  {
    id: "filtered",
    label: "const filtered = …",
    x: DS_ORIGIN_X,
    y: 102,
    w: DS_NODE_W,
    h: 76,
    sub: "derived from props",
  },
  {
    id: "count",
    label: "const count = …",
    x: DS_ORIGIN_X,
    y: 210,
    w: DS_NODE_W,
    h: 76,
    sub: "derived from filtered",
  },
  {
    id: "jsx",
    label: "return <JSX />",
    x: DS_ORIGIN_X,
    y: 318,
    w: DS_NODE_W,
    h: 58,
    sub: null,
  },
];

const EDGES: { from: string; to: string }[] = [
  { from: "props", to: "filtered" },
  { from: "filtered", to: "count" },
  { from: "count", to: "jsx" },
];

const STEPS: string[][] = [
  ["props"],
  ["props", "filtered"],
  ["props", "filtered", "count"],
  ["props", "filtered", "count", "jsx"],
];

const CAPTIONS = [
  "Props come in.",
  "Values derived inline. No state, no effect.",
  "More values derived. Still just computation.",
  "JSX out. Top to bottom. Done.",
];

const ACTIVE_FILL = { fill: "rgba(var(--color-chart-3), 0.1)" } as const;
const INACTIVE_RECT =
  "fill-skin-card-muted/12 stroke-skin-card-muted/35 stroke-[0.5]";

function getNode(id: string): NodeDef | undefined {
  return NODES.find(n => n.id === id);
}

function NodeRect({
  node,
  active,
  highlight,
}: {
  node: NodeDef;
  active: boolean;
  highlight: boolean;
}) {
  const { label, sub, x, y, w, h } = node;
  const cx = x + w / 2;

  return (
    <g
      className={active ? "opacity-100" : "opacity-30"}
      style={{ transition: "opacity 0.4s ease" }}
    >
      {/* Removed rounded corners (rx=10) for a sharper, printed schematic look */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={2}
        style={active ? ACTIVE_FILL : undefined}
        className={`${
          active
            ? "stroke-skin-chart-3 stroke-2 transition-all duration-500 ease-in-out"
            : `${INACTIVE_RECT} transition-all duration-500 ease-in-out`
        } ${highlight ? "[filter:url(#glow-ds)]" : ""}`}
      />
      {sub ? (
        <text
          x={cx}
          y={y + h / 2}
          textAnchor="middle"
          className={`transition-[fill] duration-500 ease-in-out ${active ? "fill-skin-chart-3" : "fill-skin-placeholder"}`}
        >
          {/* Use font-mono for schematic text */}
          <tspan
            x={cx}
            dy="-10"
            className="font-mono text-sm font-bold tracking-tight"
          >
            {label}
          </tspan>
          <tspan
            x={cx}
            dy="20"
            className={`font-mono text-xs ${active ? "fill-skin-chart-3 opacity-80" : "fill-skin-placeholder"}`}
          >
            {sub}
          </tspan>
        </text>
      ) : (
        <text
          x={cx}
          y={y + h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={`font-mono text-sm font-bold tracking-tight transition-[fill] duration-500 ease-in-out ${active ? "fill-skin-chart-3" : "fill-skin-placeholder"}`}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function EdgePath({
  edge,
  active,
}: {
  edge: (typeof EDGES)[number];
  active: boolean;
}) {
  const from = getNode(edge.from);
  const to = getNode(edge.to);
  if (!from || !to) return null;
  const x1 = from.x + from.w / 2;
  const y1 = from.y + from.h;
  const x2 = to.x + to.w / 2;
  const y2 = to.y;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      fill="none"
      className={
        active
          ? "stroke-skin-chart-3 stroke-[2] opacity-80 transition-all duration-500 ease-in-out"
          : "stroke-skin-card-muted/40 stroke-[1] opacity-30 transition-all duration-500 ease-in-out"
      }
      markerEnd={active ? "url(#arr-green-ds)" : "url(#arr-muted-ds)"}
    />
  );
}

function PlayIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="inline-block"
    >
      <path d="M2.5 1L10 6L2.5 11V1Z" className="fill-skin-fill" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="inline-block"
    >
      <rect x="2" y="1" width="3" height="10" className="fill-skin-fill" />
      <rect x="7" y="1" width="3" height="10" className="fill-skin-fill" />
    </svg>
  );
}

export default function DerivedState() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showCommentary, setShowCommentary] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setStep(s => {
        if (s >= STEPS.length - 1) return -1;
        if (s === -1) return 0;
        return s + 1;
      });
    }, 1400);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  const currentStep = Math.max(step, 0);
  const activeNodes = new Set(STEPS[currentStep]);
  const prevNodes = new Set(currentStep > 0 ? STEPS[currentStep - 1] : []);
  const newNodes = new Set([...activeNodes].filter(id => !prevNodes.has(id)));

  const activeEdges = new Set<string>();
  EDGES.forEach(e => {
    if (activeNodes.has(e.from) && activeNodes.has(e.to)) {
      activeEdges.add(`${e.from}-${e.to}`);
    }
  });

  return (
    // Removed the outer rounded border/bg classes since BlogDemo handles the physical wrapper now
    <div className="font-sans text-skin-base">
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_260px] md:items-start md:gap-x-10">
        {/* Left Column: SVG Chart */}
        <div className="w-full max-w-sm justify-self-center md:justify-self-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 400"
            className="w-full"
            role="img"
            aria-label="Derived state flow chart"
          >
            <defs>
              <marker
                id="arr-green-ds"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path
                  d="M2 1L8 5L2 9"
                  fill="none"
                  className="stroke-skin-chart-3"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </marker>
              <marker
                id="arr-muted-ds"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path
                  d="M2 1L8 5L2 9"
                  fill="none"
                  className="stroke-skin-card-muted/40"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </marker>
              <filter id="glow-ds">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g transform="translate(0, 4)">
              {EDGES.map(e => (
                <EdgePath
                  key={`${e.from}-${e.to}`}
                  edge={e}
                  active={activeEdges.has(`${e.from}-${e.to}`)}
                />
              ))}
              {NODES.map(node => (
                <NodeRect
                  key={node.id}
                  node={node}
                  active={activeNodes.has(node.id)}
                  highlight={newNodes.has(node.id)}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Right Column: Controls & Commentary */}
        <div className="w-full pt-2">
          <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-4 border-b border-skin-line/20 pb-4">
            {/* Hardened, industrial button styling */}
            <button
              type="button"
              className={`
                flex shrink-0 items-center gap-2 border-[2px] border-skin-base px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all
                ${playing ? "bg-skin-base text-skin-fill" : "bg-skin-card text-skin-base hover:bg-skin-card-muted/30"}
                active:translate-y-[2px]
              `}
              onClick={() => setPlaying(p => !p)}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
              {playing ? "Pause" : "Play"}
            </button>

            <label className="flex cursor-pointer select-none items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-skin-base opacity-80">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer rounded-sm border-2 border-skin-base bg-skin-fill text-skin-base focus:ring-skin-accent"
                checked={showCommentary}
                onChange={e => setShowCommentary(e.target.checked)}
              />
              Notes
            </label>
          </div>

          {showCommentary && (
            <div className="flex flex-col gap-2">
              {CAPTIONS.map((caption, i) => {
                const isActive = i === currentStep;
                const isPast = i < currentStep;
                return (
                  <div
                    key={i}
                    className={`
                      cursor-pointer border-l-[3px] py-2 pl-4 transition-all duration-300
                      ${isActive ? "border-skin-chart-3 bg-skin-chart-3/5" : "border-skin-card-muted/20 hover:border-skin-card-muted/50"}
                    `}
                    style={{ opacity: isActive ? 1 : isPast ? 0.6 : 0.3 }}
                    onClick={() => {
                      setStep(i);
                      setPlaying(false);
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        setStep(i);
                        setPlaying(false);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-skin-placeholder">
                      {i === currentStep ? "▶ Executing" : `Step ${i + 1}`}
                    </div>
                    <div className="text-sm font-medium leading-snug text-skin-base">
                      {caption}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
