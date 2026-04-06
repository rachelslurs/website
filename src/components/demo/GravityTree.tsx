import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  memo,
} from "react";

// --- Types ---
type GravityId = "api" | "router" | "analytics";
type HoveredType = "folder" | "file" | "gravity";

interface Hovered {
  type: HoveredType;
  id: string;
}

interface TreeNode {
  id: string;
  label: string;
  type: "folder" | "file";
  depth: number;
  gravity: GravityId[];
}

interface GravityItem {
  id: GravityId;
  label: string;
  sub: string;
}

interface FolderLabelProps {
  x: number;
  y: number;
  label: string;
  textClass: string;
  /** foreignObject width — wider on mobile when the viewBox is expanded */
  labelWidth?: number;
}

interface EdgeProps {
  d: string;
  strokeClass: string;
  opacity: number;
  width: number;
}

interface GravityCardProps {
  g: GravityItem;
  active: boolean;
  dimmed: boolean;
  y: number;
  onEnter: () => void;
  onLeave: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  focusClassName?: string;
}

interface MobileGravityCardProps {
  g: GravityItem;
  active: boolean;
  dimmed: boolean;
  onTap: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const GRAVITY: GravityItem[] = [
  { id: "api", label: "API Client", sub: "User, Post, Membership" },
  { id: "router", label: "Routing Layer", sub: "routes & params" },
  { id: "analytics", label: "Analytics Layer", sub: "events & properties" },
];

/* Map gravity IDs to generic chart series (chart-1, chart-2, chart-3) */
const chartFillClass = (id: string) =>
  ({
    api: "fill-skin-chart-1",
    router: "fill-skin-chart-2",
    analytics: "fill-skin-chart-3",
  })[id] ?? "fill-skin-chart-1";
const chartFillAlphaClass = (id: string) =>
  ({
    api: "fill-skin-chart-1/10",
    router: "fill-skin-chart-2/10",
    analytics: "fill-skin-chart-3/10",
  })[id] ?? "fill-skin-chart-1/10";
const chartStrokeClass = (id: string) =>
  ({
    api: "stroke-skin-chart-1",
    router: "stroke-skin-chart-2",
    analytics: "stroke-skin-chart-3",
  })[id] ?? "stroke-skin-chart-1";
const chartTextClass = (id: string) =>
  ({
    api: "text-skin-chart-1",
    router: "text-skin-chart-2",
    analytics: "text-skin-chart-3",
  })[id] ?? "text-skin-chart-1";
const chartBgAlphaClass = (id: string) =>
  ({
    api: "bg-skin-chart-1/10",
    router: "bg-skin-chart-2/10",
    analytics: "bg-skin-chart-3/10",
  })[id] ?? "bg-skin-chart-1/10";
const chartBorderClass = (id: string) =>
  ({
    api: "border-skin-chart-1",
    router: "border-skin-chart-2",
    analytics: "border-skin-chart-3",
  })[id] ?? "border-skin-chart-1";
const chartShadowClass = (id: string) =>
  ({
    api: "shadow-chart-1",
    router: "shadow-chart-2",
    analytics: "shadow-chart-3",
  })[id] ?? "shadow-chart-1";

const TREE: TreeNode[] = [
  { id: "feed", label: "feed", type: "folder", depth: 0, gravity: [] },
  {
    id: "feed/index",
    label: "index",
    type: "file",
    depth: 1,
    gravity: ["api", "router", "analytics"],
  },
  {
    id: "feed/FeedItem",
    label: "FeedItem",
    type: "file",
    depth: 1,
    gravity: ["api"],
  },
  {
    id: "feed/FeedFilter",
    label: "FeedFilter",
    type: "file",
    depth: 1,
    gravity: ["router"],
  },
  {
    id: "feed/useFeed",
    label: "useFeed",
    type: "file",
    depth: 1,
    gravity: ["api", "analytics"],
  },
  {
    id: "dashboard",
    label: "dashboard",
    type: "folder",
    depth: 0,
    gravity: [],
  },
  {
    id: "dashboard/index",
    label: "index",
    type: "file",
    depth: 1,
    gravity: ["api", "router", "analytics"],
  },
  {
    id: "dashboard/Chart",
    label: "Chart",
    type: "file",
    depth: 1,
    gravity: ["api"],
  },
  {
    id: "dashboard/Summary",
    label: "Summary",
    type: "file",
    depth: 1,
    gravity: ["api", "analytics"],
  },
  {
    id: "dashboard/useEarnings",
    label: "useEarnings",
    type: "file",
    depth: 1,
    gravity: ["api"],
  },
  { id: "profile", label: "profile", type: "folder", depth: 0, gravity: [] },
  {
    id: "profile/index",
    label: "index",
    type: "file",
    depth: 1,
    gravity: ["api", "router"],
  },
  {
    id: "profile/Avatar",
    label: "Avatar",
    type: "file",
    depth: 1,
    gravity: ["api"],
  },
  {
    id: "profile/ProfileStats",
    label: "ProfileStats",
    type: "file",
    depth: 1,
    gravity: ["api", "analytics"],
  },
  {
    id: "membership",
    label: "membership",
    type: "folder",
    depth: 0,
    gravity: [],
  },
  {
    id: "membership/index",
    label: "index",
    type: "file",
    depth: 1,
    gravity: ["api", "router", "analytics"],
  },
  {
    id: "membership/MemberCard",
    label: "MemberCard",
    type: "file",
    depth: 1,
    gravity: ["api"],
  },
  {
    id: "membership/PledgeButton",
    label: "PledgeButton",
    type: "file",
    depth: 1,
    gravity: ["api", "analytics"],
  },
  { id: "checkout", label: "checkout", type: "folder", depth: 0, gravity: [] },
  {
    id: "checkout/index",
    label: "index",
    type: "file",
    depth: 1,
    gravity: ["api", "router", "analytics"],
  },
  {
    id: "checkout/useCheckout",
    label: "useCheckout",
    type: "file",
    depth: 1,
    gravity: ["api", "analytics"],
  },
  { id: "nav", label: "nav", type: "folder", depth: 0, gravity: [] },
  {
    id: "nav/NavMenu",
    label: "NavMenu",
    type: "file",
    depth: 1,
    gravity: ["router"],
  },
  {
    id: "nav/NotificationBadge",
    label: "NotificationBadge",
    type: "file",
    depth: 1,
    gravity: ["api", "analytics"],
  },
  { id: "search", label: "search", type: "folder", depth: 0, gravity: [] },
  {
    id: "search/SearchBar",
    label: "SearchBar",
    type: "file",
    depth: 1,
    gravity: ["router", "analytics"],
  },
];

const FILES = TREE.filter(n => n.type === "file");
/** Taller rows so `text-base` tree labels fit inside foreignObject */
const ROW_H = 28;
const TREE_X = 32;
const TOP_PAD = 32;
const GRAV_X = 460;
const EDGE_X = 280;
/** Room for variable-width gravity cards (fit content + wrap) */
const SVG_W = 720;
/** Mobile-only: wider viewBox + tree column so the diagram isn’t squeezed to 320px units */
const MOBILE_VB_W = 520;
const MOBILE_TREE_W = 480;

/** Right edge (x) of the tree row rects — for sizing foreignObject labels */
function treeRowRightEdge(mobile: boolean) {
  return TREE_X - 4 + (mobile ? MOBILE_TREE_W : 250);
}

/** Scaled with ROW_H (was tuned for 24px rows) */
const GRAVITY_Y: Record<GravityId, number> = {
  api: TOP_PAD + Math.round((90 * ROW_H) / 24),
  router: TOP_PAD + Math.round((230 * ROW_H) / 24),
  analytics: TOP_PAD + Math.round((375 * ROW_H) / 24),
};

const FOLDER_GRAVITY = Object.fromEntries(
  TREE.filter(n => n.type === "folder").map(f => [
    f.id,
    [
      ...new Set(
        TREE.filter(
          n => n.id.startsWith(f.id + "/") && n.type === "file"
        ).flatMap(c => c.gravity)
      ),
    ],
  ])
);
const NODE_Y = Object.fromEntries(
  TREE.map((n, i) => [n.id, TOP_PAD + i * ROW_H])
);
const SVG_H = TOP_PAD + TREE.length * ROW_H + 40;

// --- Helpers ---
function getNodeState(
  hovered: Hovered | null,
  node: TreeNode
): "idle" | "active" | "dimmed" {
  if (!hovered) return "idle";
  const { type, id } = hovered;
  if (node.type === "folder") {
    if (type === "folder" && id === node.id) return "active";
    if (
      type === "gravity" &&
      FOLDER_GRAVITY[node.id]?.includes(id as GravityId)
    )
      return "active";
    if (type === "file" && id.startsWith(node.id + "/")) return "active";
    return "dimmed";
  }
  if (type === "file" && id === node.id) return "active";
  if (type === "folder" && node.id.startsWith(id + "/")) return "active";
  if (type === "gravity" && node.gravity.includes(id as GravityId))
    return "active";
  return "dimmed";
}

function getGravityState(
  hovered: Hovered | null,
  gid: GravityId
): "idle" | "active" | "dimmed" {
  if (!hovered) return "idle";
  if (hovered.type === "gravity")
    return hovered.id === gid ? "active" : "dimmed";
  const node = TREE.find(n => n.id === hovered.id);
  const gravities =
    hovered.type === "folder"
      ? FOLDER_GRAVITY[hovered.id]
      : (node?.gravity ?? []);
  return gravities.includes(gid) ? "active" : "dimmed";
}

// --- Subcomponents ---
const Chevron = memo(() => (
  <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
    <polyline
      points="2,3 5,7 8,3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));

const FolderLabel = memo(
  ({ x, y, label, textClass, labelWidth = 220 }: FolderLabelProps) => (
    <foreignObject x={x} y={y + 2} width={labelWidth} height={ROW_H - 4}>
      <div
        {...({
          xmlns: "http://www.w3.org/1999/xhtml",
        } as React.HTMLAttributes<HTMLDivElement>)}
        className={`flex h-full w-full min-w-0 items-center gap-1 font-mono text-base font-bold leading-none transition-colors duration-200 ease-out pointer-events-none select-none ${textClass}`}
      >
        <Chevron />
        <span className="min-w-0 flex-1 truncate">{label}/</span>
      </div>
    </foreignObject>
  )
);

interface FileRowLabelProps {
  depth: number;
  y: number;
  label: string;
  mobile: boolean;
  textClass: string;
}

/** File rows use foreignObject (not SVG text nodes) so type scales with the viewBox like folders. */
const FileRowLabel = memo(
  ({ depth, y, label, mobile, textClass }: FileRowLabelProps) => {
    const foX = TREE_X + depth * 16 + 4;
    const foW = Math.max(48, treeRowRightEdge(mobile) - foX - 10);
    return (
      <foreignObject x={foX} y={y + 2} width={foW} height={ROW_H - 4}>
        <div
          {...({
            xmlns: "http://www.w3.org/1999/xhtml",
          } as React.HTMLAttributes<HTMLDivElement>)}
          className={`flex h-full w-full min-w-0 items-center font-mono text-base font-normal leading-tight transition-colors duration-200 ease-out pointer-events-none select-none ${textClass}`}
        >
          <span className="min-w-0 w-full text-left">{`└─ ${label}`}</span>
        </div>
      </foreignObject>
    );
  }
);

const Edge = memo(({ d, strokeClass, opacity, width }: EdgeProps) => (
  <path
    d={d}
    fill="none"
    strokeWidth={width}
    strokeOpacity={opacity}
    className={`transition-[stroke,stroke-opacity,stroke-width] duration-200 ease-out ${strokeClass}`}
  />
));

const GravityCard = memo(function GravityCardInner({
  g,
  active,
  dimmed,
  y,
  onEnter,
  onLeave,
  onKeyDown,
  focusClassName,
}: GravityCardProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  /** Generous first pass so foreignObject doesn’t clip before measure; RO used to tighten */
  const [size, setSize] = useState({ w: 260, h: 120 });

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      // contentRect tracks the *clipped* box; scroll sizes reflect full laid-out content
      const sw = el.scrollWidth;
      const sh = el.scrollHeight;
      const w = Math.ceil(Math.max(sw, el.offsetWidth)) + 6;
      const h = Math.ceil(Math.max(sh, el.offsetHeight)) + 6;
      setSize(prev =>
        prev.w === w && prev.h === h
          ? prev
          : { w: Math.max(152, w), h: Math.max(52, h) }
      );
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [g.label, g.sub, active, dimmed]);

  const { w, h } = size;
  const top = y - h / 2;

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`${g.label}: ${g.sub}. Select to highlight connections.`}
      aria-pressed={active}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onKeyDown={onKeyDown}
      className={`cursor-pointer ${focusClassName ?? ""}`}
    >
      {active && (
        <rect
          x={GRAV_X - 6}
          y={top - 6}
          width={w + 12}
          height={h + 12}
          rx={10}
          className={`transition-opacity duration-200 ease-out ${chartFillAlphaClass(g.id)}`}
        />
      )}
      <rect
        x={GRAV_X}
        y={top}
        width={w}
        height={h}
        rx={7}
        strokeWidth={active ? 1.75 : 0.75}
        strokeOpacity={dimmed ? 0.2 : 1}
        className={`transition-all duration-200 ease-out ${
          active
            ? `${chartFillAlphaClass(g.id)} ${chartStrokeClass(g.id)}`
            : "fill-skin-card stroke-skin-line"
        }`}
      />
      <foreignObject
        x={GRAV_X}
        y={top}
        width={w}
        height={h}
        overflow="visible"
        pointerEvents="none"
      >
        <div
          ref={measureRef}
          {...({
            xmlns: "http://www.w3.org/1999/xhtml",
          } as React.HTMLAttributes<HTMLDivElement>)}
          className="box-border flex w-max max-w-[13rem] min-w-0 flex-col items-center justify-center gap-1 px-3 py-2.5 text-center font-mono leading-snug"
        >
          <div
            className={`text-base font-bold transition-colors duration-200 ease-out ${
              dimmed
                ? "text-skin-card-muted"
                : active
                  ? chartTextClass(g.id)
                  : "text-skin-base"
            }`}
          >
            {g.label}
          </div>
          <div
            className={`text-sm transition-colors duration-200 ease-out ${
              dimmed ? "text-skin-card-muted" : "text-skin-placeholder"
            }`}
          >
            {g.sub}
          </div>
        </div>
      </foreignObject>
    </g>
  );
});

// Mobile footer gravity card (HTML) — tap only, no hover (avoids touch ghost events)
const MobileGravityCard = memo(
  ({ g, active, dimmed, onTap, onKeyDown }: MobileGravityCardProps) => (
    <div
      tabIndex={0}
      role="button"
      aria-label={`${g.label}: ${g.sub}. Select to highlight connections.`}
      aria-pressed={active}
      onClick={onTap}
      onKeyDown={onKeyDown}
      className={`min-w-0 flex-[1_1_7.5rem] cursor-pointer rounded-md border px-2 py-2 text-center transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-skin-accent focus-visible:ring-offset-2 focus-visible:ring-offset-skin ${
        active
          ? `border-[1.75px] ${chartBgAlphaClass(g.id)} ${chartBorderClass(g.id)} ${chartShadowClass(g.id)}`
          : "border-[0.75px] border-skin-line bg-skin-card"
      } ${dimmed ? "opacity-30" : ""}`}
    >
      <div
        className={`text-base font-bold leading-snug transition-colors duration-200 ease-out break-words ${active ? chartTextClass(g.id) : "text-skin-base"}`}
      >
        {g.label}
      </div>
      <div className="mt-1 text-sm leading-snug text-skin-placeholder break-words">
        {g.sub}
      </div>
    </div>
  )
);

// --- Main ---
export default function GravityTree() {
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const containerRef = useRef(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setMobile(entry.contentRect.width < 520)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const enter = useCallback(
    (type: HoveredType, id: string) => setHovered({ type, id }),
    []
  );
  const leave = useCallback(() => setHovered(null), []);

  // Tap handler for touch: select item, or toggle off if same item tapped again
  const handleNodeTap = useCallback((type: HoveredType, id: string) => {
    setHovered(prev =>
      prev?.type === type && prev?.id === id ? null : { type, id }
    );
  }, []);

  // Keyboard activation (Enter/Space) for accessibility — custom elements don't fire click on keypress
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        action();
      }
    },
    []
  );

  const edgeData = useMemo(
    () =>
      FILES.flatMap(file =>
        file.gravity.map((gid: GravityId) => {
          const fy = NODE_Y[file.id] + ROW_H / 2 - 1;
          const gy = GRAVITY_Y[gid];
          const active =
            hovered &&
            ((hovered.type === "gravity" &&
              hovered.id === gid &&
              file.gravity.includes(gid)) ||
              (hovered.type === "file" && hovered.id === file.id) ||
              (hovered.type === "folder" &&
                file.id.startsWith(hovered.id + "/")));
          return {
            key: `${file.id}-${gid}`,
            d: `M${EDGE_X},${fy} C${EDGE_X + 80},${fy} ${GRAV_X - 60},${gy} ${GRAV_X},${gy}`,
            strokeClass: active
              ? chartStrokeClass(gid)
              : "stroke-skin-card-muted",
            width: active ? 1.75 : 0.75,
            opacity: hovered && !active ? 0.07 : active ? 1 : 0.35,
          };
        })
      ),
    [hovered]
  );

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl border border-skin-line/10 bg-skin-fill p-4 font-mono text-base text-skin-base sm:p-6"
    >
      <svg
        viewBox={`0 0 ${mobile ? MOBILE_VB_W : SVG_W} ${SVG_H}`}
        className="h-auto w-full max-w-none"
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label="File tree diagram showing gravity centers: API Client, Routing Layer, and Analytics Layer"
      >
        {/* Layer 1: opaque row backgrounds (masks edges) */}
        {TREE.map(node => {
          const y = NODE_Y[node.id];
          return (
            <rect
              key={`bg-${node.id}`}
              x={TREE_X - 4}
              y={y + 2}
              width={mobile ? MOBILE_TREE_W : 250}
              height={ROW_H - 4}
              rx={4}
              className="fill-skin-fill"
            />
          );
        })}

        {/* Layer 2: edges (above bg rects, below styled row rects + labels) */}
        {!mobile &&
          edgeData.map(e => {
            const { key, ...rest } = e;
            return <Edge key={key} {...rest} />;
          })}

        {/* Layer 3: styled row rects + labels + dots */}
        {TREE.map(node => {
          const y = NODE_Y[node.id];
          const isFolder = node.type === "folder";
          const state = getNodeState(hovered, node);
          const active = state === "active";
          const dimmed = state === "dimmed";
          const nodeGravities = isFolder
            ? FOLDER_GRAVITY[node.id]
            : node.gravity;
          const textClass = dimmed
            ? "text-skin-card-muted"
            : active
              ? "text-skin-base"
              : "text-skin-placeholder";

          const activateNode = () =>
            mobile
              ? handleNodeTap(isFolder ? "folder" : "file", node.id)
              : enter(isFolder ? "folder" : "file", node.id);
          const nodeLabel = isFolder
            ? `Folder ${node.label}`
            : `File ${node.label}`;
          return (
            <g
              key={node.id}
              tabIndex={0}
              role="button"
              aria-label={`${nodeLabel}. Select to highlight connections.`}
              aria-pressed={active}
              onMouseEnter={
                !mobile
                  ? () => enter(isFolder ? "folder" : "file", node.id)
                  : undefined
              }
              onMouseLeave={!mobile ? leave : undefined}
              onFocus={
                !mobile
                  ? () => enter(isFolder ? "folder" : "file", node.id)
                  : undefined
              }
              onBlur={!mobile ? leave : undefined}
              onClick={
                mobile
                  ? () => handleNodeTap(isFolder ? "folder" : "file", node.id)
                  : undefined
              }
              onKeyDown={e => handleKeyDown(e, activateNode)}
              className="cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skin-fill"
            >
              <rect
                x={TREE_X - 4}
                y={y + 2}
                width={mobile ? MOBILE_TREE_W : 250}
                height={ROW_H - 4}
                rx={4}
                fill={active ? undefined : "transparent"}
                stroke={
                  !isFolder && !active && !dimmed ? undefined : "transparent"
                }
                strokeWidth="0.75"
                className={`transition-[fill,stroke] duration-200 ease-out ${active ? "fill-skin-card" : ""} ${!isFolder && !active && !dimmed ? "stroke-skin-card-muted" : ""}`}
              />

              {isFolder ? (
                <FolderLabel
                  x={TREE_X + node.depth * 16}
                  y={y}
                  label={node.label}
                  textClass={textClass}
                  labelWidth={mobile ? MOBILE_TREE_W - 56 : 220}
                />
              ) : (
                <FileRowLabel
                  depth={node.depth}
                  y={y}
                  label={node.label}
                  mobile={mobile}
                  textClass={textClass}
                />
              )}

              {active &&
                nodeGravities.map((gid, i) => (
                  <circle
                    key={gid}
                    cx={(mobile ? MOBILE_VB_W - 24 : 238) - i * 13}
                    cy={y + ROW_H / 2 + 1}
                    r={4.5}
                    className={`transition-opacity duration-200 ease-out ${chartFillClass(gid)}`}
                  />
                ))}
            </g>
          );
        })}

        {/* Gravity cards — desktop only in SVG */}
        {!mobile &&
          GRAVITY.map(g => {
            const state = getGravityState(hovered, g.id);
            return (
              <GravityCard
                key={g.id}
                g={g}
                active={state === "active"}
                dimmed={state === "dimmed"}
                y={GRAVITY_Y[g.id]}
                onEnter={() => enter("gravity", g.id)}
                onLeave={leave}
                onKeyDown={(e: React.KeyboardEvent) =>
                  handleKeyDown(e, () => enter("gravity", g.id))
                }
                focusClassName="focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skin-fill"
              />
            );
          })}
      </svg>

      {mobile && (
        <div
          role="toolbar"
          aria-label="Gravity center selector"
          className="mt-3 flex flex-wrap gap-2 border-t border-skin-card-muted pt-3"
        >
          {GRAVITY.map(g => {
            const state = getGravityState(hovered, g.id);
            return (
              <MobileGravityCard
                key={g.id}
                g={g}
                active={state === "active"}
                dimmed={state === "dimmed"}
                onTap={() => handleNodeTap("gravity", g.id)}
                onKeyDown={(e: React.KeyboardEvent) =>
                  handleKeyDown(e, () => handleNodeTap("gravity", g.id))
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
