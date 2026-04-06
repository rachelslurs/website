import { useState, useEffect, useRef } from "react";

/** Maps data palette keys to Tailwind skin classes (full strings for JIT). */
const PALETTE = {
  effect: {
    fillActive: "fill-skin-chart-1/10",
    strokeActive: "stroke-skin-chart-1 stroke-[0.8]",
    text: "fill-skin-chart-1",
    edge: "stroke-skin-chart-1",
    markerPath: "stroke-skin-chart-1",
  },
  state: {
    fillActive: "fill-skin-chart-2/10",
    strokeActive: "stroke-skin-chart-2 stroke-[0.8]",
    text: "fill-skin-chart-2",
    edge: "stroke-skin-chart-2",
    markerPath: "stroke-skin-chart-2",
  },
  external: {
    fillActive: "fill-skin-chart-3/10",
    strokeActive: "stroke-skin-chart-3 stroke-[0.8]",
    text: "fill-skin-chart-3",
    edge: "stroke-skin-chart-3",
    markerPath: "stroke-skin-chart-3",
  },
  race: {
    fillActive: "fill-skin-accent/10",
    /** Fill only — dashed accent ring is a separate stroke-only rect (matches legend). */
    strokeActive: "",
    text: "fill-skin-accent",
    edge: "stroke-skin-accent",
    markerPath: "stroke-skin-accent",
  },
  neutral: {
    fillActive: "fill-skin-base/[0.06]",
    strokeActive: "stroke-skin-base stroke-[0.8]",
    text: "fill-skin-base",
    edge: "stroke-skin-base",
    markerPath: "stroke-skin-base",
  },
} as const;

type PaletteKey = keyof typeof PALETTE;

const INACTIVE_RECT =
  "fill-skin-card-muted/12 stroke-skin-card-muted/35 stroke-[0.5]";

type NodeDef = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  sub: string | null;
  palette: PaletteKey;
};

const NODES: NodeDef[] = [
  {
    id: "mount",
    label: "Component mounts",
    x: 185,
    y: 10,
    w: 180,
    h: 62,
    sub: null,
    palette: "neutral",
  },
  {
    id: "effectA",
    label: "useEffect A",
    x: 195,
    y: 140,
    w: 160,
    h: 76,
    sub: "deps: [ ]",
    palette: "effect",
  },
  {
    id: "setX",
    label: "setState(X)",
    x: 90,
    y: 284,
    w: 150,
    h: 62,
    sub: null,
    palette: "state",
  },
  {
    id: "race",
    label: "setState(X)",
    x: 310,
    y: 284,
    w: 160,
    h: 76,
    sub: "race condition",
    palette: "race",
  },
  {
    id: "effectB",
    label: "useEffect B",
    x: 20,
    y: 428,
    w: 150,
    h: 76,
    sub: "deps: [X]",
    palette: "effect",
  },
  {
    id: "effectC",
    label: "useEffect C",
    x: 185,
    y: 428,
    w: 160,
    h: 76,
    sub: "deps: [X]",
    palette: "effect",
  },
  {
    id: "noop",
    label: "effects skip",
    x: 360,
    y: 428,
    w: 150,
    h: 76,
    sub: "stale closure?",
    palette: "race",
  },
  {
    id: "fetchOk",
    label: "fetch → data",
    x: 0,
    y: 572,
    w: 135,
    h: 62,
    sub: null,
    palette: "external",
  },
  {
    id: "fetchErr",
    label: "fetch → error",
    x: 135,
    y: 572,
    w: 140,
    h: 62,
    sub: null,
    palette: "race",
  },
  {
    id: "title",
    label: "document.title",
    x: 295,
    y: 572,
    w: 160,
    h: 76,
    sub: "side effect",
    palette: "external",
  },
  {
    id: "effectD",
    label: "useEffect D",
    x: 0,
    y: 716,
    w: 150,
    h: 76,
    sub: "deps: [data]",
    palette: "effect",
  },
  {
    id: "effectE",
    label: "useEffect E",
    x: 145,
    y: 716,
    w: 155,
    h: 76,
    sub: "deps: [error]",
    palette: "effect",
  },
  {
    id: "analytics",
    label: "analytics.track()",
    x: 0,
    y: 860,
    w: 160,
    h: 62,
    sub: null,
    palette: "external",
  },
  {
    id: "toast",
    label: "toast + retry?",
    x: 155,
    y: 860,
    w: 150,
    h: 62,
    sub: null,
    palette: "race",
  },
];

const EDGES = [
  { from: "mount", to: "effectA" },
  { from: "effectA", to: "setX" },
  { from: "effectA", to: "race", dashed: true },
  { from: "setX", to: "effectB" },
  { from: "setX", to: "effectC" },
  { from: "race", to: "noop", dashed: true },
  { from: "effectB", to: "fetchOk" },
  { from: "effectB", to: "fetchErr" },
  { from: "effectC", to: "title" },
  { from: "fetchOk", to: "effectD" },
  { from: "fetchErr", to: "effectE" },
  { from: "effectD", to: "analytics" },
  { from: "effectE", to: "toast" },
];

const STEPS = [
  ["mount"],
  ["mount", "effectA"],
  ["mount", "effectA", "setX", "race"],
  ["mount", "effectA", "setX", "race", "effectB", "effectC", "noop"],
  [
    "mount",
    "effectA",
    "setX",
    "race",
    "effectB",
    "effectC",
    "noop",
    "fetchOk",
    "fetchErr",
    "title",
  ],
  [
    "mount",
    "effectA",
    "setX",
    "race",
    "effectB",
    "effectC",
    "noop",
    "fetchOk",
    "fetchErr",
    "title",
    "effectD",
    "effectE",
  ],
  [
    "mount",
    "effectA",
    "setX",
    "race",
    "effectB",
    "effectC",
    "noop",
    "fetchOk",
    "fetchErr",
    "title",
    "effectD",
    "effectE",
    "analytics",
    "toast",
  ],
];

const CAPTIONS = [
  "Component mounts.",
  "First effect fires on mount.",
  "State updates. But what order? A race condition is possible.",
  "Two more effects trigger from the state change.",
  "One fetches data. The other mutates the DOM directly.",
  "Fetch results trigger yet more effects.",
  "Each branch keeps going. Which path are you on?",
];

function getNode(id: string) {
  return NODES.find(n => n.id === id);
}

const WARNING_BADGE_W = 26;
const WARNING_BADGE_H = 26;

function WarningIcon({
  x,
  y,
  active,
}: {
  x: number;
  y: number;
  active: boolean;
}) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      className={active ? "opacity-95" : "opacity-35"}
      style={{ transition: "opacity 0.5s ease" }}
    >
      <rect
        x={0}
        y={0}
        width={WARNING_BADGE_W}
        height={WARNING_BADGE_H}
        rx={5}
        className="fill-skin-accent/[0.08] stroke-skin-accent/40"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <text
        x={WARNING_BADGE_W / 2}
        y={WARNING_BADGE_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-skin-base text-base font-extrabold [font-family:inherit]"
      >
        !
      </text>
    </g>
  );
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
  const { label, sub, x, y, w, h, palette } = node;
  const cx = x + w / 2;
  const P = PALETTE[palette];
  const isRace = palette === "race";

  const nonRaceRectClass = active
    ? `${P.fillActive} ${P.strokeActive}`
    : INACTIVE_RECT;

  return (
    <g
      className={active ? "opacity-100" : "opacity-25"}
      style={{ transition: "opacity 0.5s ease" }}
    >
      {isRace ? (
        <g className={highlight ? "[filter:url(#glow)]" : ""}>
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            rx={10}
            className={`${active ? P.fillActive : "fill-skin-card-muted/12"} transition-all duration-500 ease-in-out`}
          />
          {/* Inset so stroke stays inside the fill (half-stroke is not clipped). */}
          <rect
            x={x + 1.25}
            y={y + 1.25}
            width={w - 2.5}
            height={h - 2.5}
            rx={8.5}
            fill="none"
            pointerEvents="none"
            className="stroke-skin-accent stroke-[1.5] [stroke-dasharray:4px_3px] [stroke-linejoin:round] transition-opacity duration-500 ease-in-out"
            opacity={active ? 1 : 0.45}
          />
        </g>
      ) : (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={10}
          className={`${nonRaceRectClass} transition-all duration-500 ease-in-out ${highlight ? "[filter:url(#glow)]" : ""}`}
        />
      )}
      {isRace && (
        <WarningIcon
          x={x + 6}
          y={y + h / 2 - WARNING_BADGE_H / 2}
          active={active}
        />
      )}
      {sub ? (
        <text
          x={cx + (isRace ? 14 : 0)}
          y={y + h / 2}
          textAnchor="middle"
          className={`transition-[fill] duration-500 ease-in-out ${
            active ? P.text : "fill-skin-placeholder"
          }`}
        >
          <tspan
            x={cx + (isRace ? 14 : 0)}
            dy="-10"
            className="text-base font-semibold"
          >
            {label}
          </tspan>
          <tspan
            x={cx + (isRace ? 14 : 0)}
            dy="22"
            className={`text-sm font-normal ${
              active ? `${P.text} opacity-70` : "fill-skin-placeholder"
            }`}
          >
            {sub}
          </tspan>
        </text>
      ) : (
        <text
          x={cx + (isRace ? 14 : 0)}
          y={y + h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={`text-base font-semibold transition-[fill] duration-500 ease-in-out ${
            active ? P.text : "fill-skin-placeholder"
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
  const midY = y1 + (y2 - y1) * 0.5;

  const toPalette: PaletteKey = to.palette;
  const P = PALETTE[toPalette];
  const markerId = active ? `arr-${toPalette}` : "arr-muted";

  return (
    <path
      d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
      fill="none"
      className={
        active
          ? `${P.edge} stroke-[1.2] opacity-55 transition-all duration-500 ease-in-out`
          : "stroke-skin-card-muted/30 stroke-[0.8] opacity-15 transition-all duration-500 ease-in-out"
      }
      strokeDasharray={edge.dashed ? "4 3" : "none"}
      markerEnd={`url(#${markerId})`}
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

function LegendItem({
  variant,
  label,
  dashed,
  warn,
}: {
  variant: keyof typeof LEGEND_STYLES;
  label: string;
  dashed?: boolean;
  warn?: boolean;
}) {
  const s = LEGEND_STYLES[variant];
  const swatchClass = warn
    ? "h-6 min-w-6 rounded-sm text-sm font-extrabold"
    : "h-3 w-3 rounded-sm text-xs font-bold";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center leading-none ${swatchClass} ${s.box} ${dashed ? "border-dashed" : ""}`}
      >
        {warn ? "!" : ""}
      </div>
      <span className="text-sm text-skin-placeholder">{label}</span>
    </div>
  );
}

const LEGEND_STYLES = {
  effect: {
    box: "border border-skin-chart-1 bg-skin-chart-1/10 text-skin-chart-1",
  },
  state: {
    box: "border border-skin-chart-2 bg-skin-chart-2/10 text-skin-chart-2",
  },
  external: {
    box: "border border-skin-chart-3 bg-skin-chart-3/10 text-skin-chart-3",
  },
  uncertain: {
    box: "border border-skin-accent bg-skin-accent/[0.06] text-skin-base",
  },
} as const;

const MARKER_DEFS: [string, string][] = [
  ["effect", PALETTE.effect.markerPath],
  ["state", PALETTE.state.markerPath],
  ["external", PALETTE.external.markerPath],
  ["race", PALETTE.race.markerPath],
  ["neutral", PALETTE.neutral.markerPath],
];

function UseEffectBranching() {
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
    }, 1600);
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
        <div className="min-w-0 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 510 940"
            className="w-full"
            role="img"
            aria-label="useEffect dependency graph showing how one mount cascades into branching outcomes"
          >
            <defs>
              {MARKER_DEFS.map(([name, strokeClass]) => (
                <marker
                  key={name}
                  id={`arr-${name}`}
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
                    className={strokeClass}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </marker>
              ))}
              <marker
                id="arr-muted"
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
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="510" height="940" rx="12" className="fill-skin-fill" />

            <g transform="translate(2, 4)">
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

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2.5 py-2">
            <LegendItem variant="effect" label="Effect" />
            <LegendItem variant="state" label="State" />
            <LegendItem variant="external" label="Side effect" />
            <LegendItem variant="uncertain" label="Uncertain" dashed warn />
          </div>
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
                className="h-4 w-4 cursor-pointer [accent-color:rgb(var(--color-chart-1))]"
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

export default UseEffectBranching;
