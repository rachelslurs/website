import { useState, useMemo, useCallback, useRef, useEffect, memo } from "react";

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
const ROW_H = 24;
const TREE_X = 32;
const TOP_PAD = 32;
const GRAV_X = 460;
const GRAV_CARD_W = 148;
const EDGE_X = 280;
const SVG_W = 640;

const GRAVITY_Y: Record<GravityId, number> = {
  api: TOP_PAD + 90,
  router: TOP_PAD + 230,
  analytics: TOP_PAD + 375,
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

const FolderLabel = memo(({ x, y, label, textClass }: FolderLabelProps) => (
  <foreignObject x={x} y={y + 2} width="220" height={ROW_H - 4}>
    <div
      {...({
        xmlns: "http://www.w3.org/1999/xhtml",
      } as React.HTMLAttributes<HTMLDivElement>)}
      className={`flex items-center gap-1 h-full pointer-events-none select-none text-xs font-bold font-mono transition-colors duration-200 ease-out ${textClass}`}
    >
      <Chevron />
      <span>{label}/</span>
    </div>
  </foreignObject>
));

const Edge = memo(({ d, strokeClass, opacity, width }: EdgeProps) => (
  <path
    d={d}
    fill="none"
    strokeWidth={width}
    strokeOpacity={opacity}
    className={`transition-[stroke,stroke-opacity,stroke-width] duration-200 ease-out ${strokeClass}`}
  />
));

const GravityCard = memo(
  ({
    g,
    active,
    dimmed,
    y,
    onEnter,
    onLeave,
    onKeyDown,
    focusClassName,
  }: GravityCardProps) => (
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
          y={y - 36}
          width={GRAV_CARD_W + 12}
          height={70}
          rx={10}
          className={`transition-opacity duration-200 ease-out ${chartFillAlphaClass(g.id)}`}
        />
      )}
      <rect
        x={GRAV_X}
        y={y - 30}
        width={GRAV_CARD_W}
        height={58}
        rx={7}
        strokeWidth={active ? 1.75 : 0.75}
        strokeOpacity={dimmed ? 0.2 : 1}
        className={`transition-all duration-200 ease-out ${
          active
            ? `${chartFillAlphaClass(g.id)} ${chartStrokeClass(g.id)}`
            : "fill-skin-card stroke-skin-line"
        }`}
      />
      <text
        x={GRAV_X + GRAV_CARD_W / 2}
        y={y - 10}
        textAnchor="middle"
        className={`text-xs font-bold transition-[fill] duration-200 ease-out pointer-events-none ${
          dimmed
            ? "fill-skin-card-muted"
            : active
              ? chartFillClass(g.id)
              : "fill-skin-base"
        }`}
      >
        {g.label}
      </text>
      <text
        x={GRAV_X + GRAV_CARD_W / 2}
        y={y + 8}
        textAnchor="middle"
        className={`text-xs transition-[fill] duration-200 ease-out pointer-events-none ${dimmed ? "fill-skin-card-muted" : "fill-skin-placeholder"}`}
      >
        {g.sub}
      </text>
    </g>
  )
);

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
      className={`flex-1 min-w-0 cursor-pointer rounded-md border px-2.5 py-2 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-skin-accent focus-visible:ring-offset-2 focus-visible:ring-offset-skin ${
        active
          ? `border-[1.75px] ${chartBgAlphaClass(g.id)} ${chartBorderClass(g.id)} ${chartShadowClass(g.id)}`
          : "border-[0.75px] border-skin-line bg-skin-card"
      } ${dimmed ? "opacity-30" : ""}`}
    >
      <div
        className={`text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-200 ease-out ${active ? chartTextClass(g.id) : "text-skin-base"}`}
      >
        {g.label}
      </div>
      <div className="text-xs text-skin-placeholder mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
        {g.sub}
      </div>
    </div>
  )
);

// --- Main ---
export default function GravityTree() {
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const containerRef = useRef(null);
  const diagramRef = useRef(null);
  const [mobile, setMobile] = useState(false);
  const [diagramVisible, setDiagramVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setMobile(entry.contentRect.width < 520)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = diagramRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setDiagramVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
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
      className={`min-h-screen flex flex-col items-center justify-center font-mono bg-skin-fill ${mobile ? "p-4 pb-[5rem]" : "p-6"}`}
    >
      <svg
        ref={diagramRef}
        viewBox={`0 0 ${mobile ? 320 : SVG_W} ${SVG_H}`}
        className="w-full max-w-3xl"
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
              width={mobile ? 290 : 250}
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
          const fillClass = dimmed
            ? "fill-skin-card-muted"
            : active
              ? "fill-skin-base"
              : "fill-skin-placeholder";

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
                width={mobile ? 290 : 250}
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
                />
              ) : (
                <text
                  x={TREE_X + node.depth * 16 + 8}
                  y={y + 16}
                  className={`text-xs transition-[fill] duration-200 ease-out select-none ${fillClass}`}
                >
                  {`└─ ${node.label}`}
                </text>
              )}

              {active &&
                nodeGravities.map((gid, i) => (
                  <circle
                    key={gid}
                    cx={(mobile ? 278 : 238) - i * 13}
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

      {/* Mobile footer gravity cards — animates in/out with diagram visibility */}
      {mobile && (
        <div
          role="toolbar"
          aria-label="Gravity center selector"
          className={`fixed bottom-0 left-0 right-0 flex gap-2 bg-skin-fill border-t border-skin-card-muted px-3 py-2.5 pb-3.5 shadow-footer transition-transform duration-300 ease-out ${
            diagramVisible ? "translate-y-0" : "translate-y-full"
          } ${!diagramVisible ? "pointer-events-none" : ""}`}
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
