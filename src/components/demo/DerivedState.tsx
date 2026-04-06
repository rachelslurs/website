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

/** Same band width as ConstraintLayers (240), centered in 500px canvas. */
const DS_NODE_W = 240;
const DS_ORIGIN_X = (500 - DS_NODE_W) / 2;

const NODES: NodeDef[] = [
  {
    id: "props",
    label: "Props",
    x: DS_ORIGIN_X,
    y: 14,
    w: DS_NODE_W,
    h: 50,
    sub: "products, filter",
  },
  {
    id: "filtered",
    label: "const filtered = …",
    x: DS_ORIGIN_X,
    y: 88,
    w: DS_NODE_W,
    h: 60,
    sub: "derived from props",
  },
  {
    id: "count",
    label: "const count = …",
    x: DS_ORIGIN_X,
    y: 180,
    w: DS_NODE_W,
    h: 60,
    sub: "derived from filtered",
  },
  {
    id: "jsx",
    label: "return <JSX />",
    x: DS_ORIGIN_X,
    y: 272,
    w: DS_NODE_W,
    h: 50,
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

/** Match ConstraintLayers: 240× bands, rgba fill + thin stroke on the rect. */
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
      className={active ? "opacity-100" : "opacity-25"}
      style={{ transition: "opacity 0.5s ease" }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        style={active ? ACTIVE_FILL : undefined}
        className={`${
          active
            ? "stroke-skin-chart-3 transition-all duration-500 ease-in-out"
            : `${INACTIVE_RECT} transition-all duration-500 ease-in-out`
        } ${highlight ? "[filter:url(#glow-ds)]" : ""}`}
        strokeWidth={active ? 0.8 : undefined}
      />
      {sub ? (
        <text
          x={cx}
          y={y + h / 2}
          textAnchor="middle"
          className={`transition-[fill] duration-500 ease-in-out ${
            active ? "fill-skin-chart-3" : "fill-skin-placeholder"
          }`}
        >
          <tspan x={cx} dy="-8" className="text-sm font-semibold">
            {label}
          </tspan>
          <tspan
            x={cx}
            dy="18"
            className={`text-xs font-normal ${
              active ? "fill-skin-chart-3 opacity-70" : "fill-skin-placeholder"
            }`}
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
          className={`text-sm font-semibold transition-[fill] duration-500 ease-in-out ${
            active ? "fill-skin-chart-3" : "fill-skin-placeholder"
          }`}
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
          ? "stroke-skin-chart-3 stroke-[1.5] opacity-60 transition-all duration-500 ease-in-out"
          : "stroke-skin-card-muted/30 stroke-[0.8] opacity-15 transition-all duration-500 ease-in-out"
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
      <path d="M2.5 1L10 6L2.5 11V1Z" className="fill-skin-base" />
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
      <rect
        x="2"
        y="1"
        width="2.5"
        height="10"
        rx="0.5"
        className="fill-skin-base"
      />
      <rect
        x="7.5"
        y="1"
        width="2.5"
        height="10"
        rx="0.5"
        className="fill-skin-base"
      />
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
    <div className="rounded-xl border border-skin-line/10 bg-skin-fill p-4 font-sans text-skin-base sm:p-6">
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_240px] md:items-start md:gap-x-7 md:gap-y-0">
        <div className="min-w-0 w-full max-w-xs justify-self-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 340"
            className="w-full"
            role="img"
            aria-label="Derived state: a straight top-to-bottom data flow with no side effects"
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                  className="stroke-skin-card-muted/35"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>
              <filter id="glow-ds">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="500" height="340" rx="12" className="fill-skin-fill" />

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

        <div className="w-full min-w-0 pt-1">
          <div className="flex w-full min-w-0 items-center justify-between gap-4">
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-skin-card-muted/60 bg-skin-card px-3.5 py-1.5 text-sm font-medium text-skin-base hover:bg-skin-card-muted/50"
              onClick={() => setPlaying(p => !p)}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
              {playing ? "Pause" : "Play"}
            </button>
            <label className="flex shrink-0 cursor-pointer select-none items-center gap-2 whitespace-nowrap text-sm text-skin-placeholder">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer [accent-color:rgb(var(--color-chart-3))]"
                checked={showCommentary}
                onChange={e => setShowCommentary(e.target.checked)}
              />
              Commentary
            </label>
          </div>

          {showCommentary && (
            <div className="mt-3.5">
              {CAPTIONS.map((caption, i) => {
                const isActive = i === currentStep;
                const isPast = i < currentStep;
                return (
                  <div
                    key={i}
                    className="cursor-pointer border-b border-skin-card-muted/20 py-2 transition-opacity duration-300 last:border-b-0"
                    style={{ opacity: isActive ? 1 : isPast ? 0.45 : 0.2 }}
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
                    <div className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-skin-base opacity-70">
                      Step {i + 1}
                    </div>
                    <div
                      className={`text-sm leading-snug ${isActive ? "text-skin-base" : "text-skin-placeholder"}`}
                    >
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
