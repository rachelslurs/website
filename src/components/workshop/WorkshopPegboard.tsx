import {
  desktopPegboardSideGap,
  hardwareDimsWithGrid,
  pickSharedDesktopPackGrid,
  PEG_GRID,
} from "@utils/workshopPegboardPhysics";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { PegboardPanelDTO } from "@utils/serializeWorkshopPegboard";
import PegboardPanelView from "./PegboardPanels";
import {
  desktopInnerW,
  desktopPortalInnerH,
  mobileInnerW,
  MOBILE_PEGBOARD_STACK_PADDING_X,
  PEGBOARD_BORDER_OUTSET,
} from "./pegboardDimensions";
import type { MobileScalePresentation } from "./pegboardTypes";

import "../../styles/workshop-pegboard.css";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** One side of `.workshop-panel--desktop { padding-inline: 1.5rem }` in px (tracks `html` font-size). */
function workshopPanelRemPaddingPx(): number {
  if (typeof document === "undefined") return 24;
  const rootPx = parseFloat(
    getComputedStyle(document.documentElement).fontSize || "16"
  );
  const fontPx = Number.isFinite(rootPx) && rootPx > 0 ? rootPx : 16;
  return Math.round(1.5 * fontPx);
}

/** One side of `.workshop-panel--desktop { padding-block: 0.375rem }` (default) in px. */
function workshopPanelRemPaddingBlockPx(): number {
  if (typeof document === "undefined") return 6;
  const rootPx = parseFloat(
    getComputedStyle(document.documentElement).fontSize || "16"
  );
  const fontPx = Number.isFinite(rootPx) && rootPx > 0 ? rootPx : 16;
  return Math.round(0.375 * fontPx);
}

/** Content-box size for packing — `client*` includes padding; flex children lay out in the content box. */
function workshopScrollContentClientSize(target: HTMLElement): {
  w: number;
  h: number;
} {
  const cs = getComputedStyle(target);
  const pl = parseFloat(cs.paddingLeft || "0") || 0;
  const pr = parseFloat(cs.paddingRight || "0") || 0;
  const pt = parseFloat(cs.paddingTop || "0") || 0;
  const pb = parseFloat(cs.paddingBottom || "0") || 0;
  return {
    w: Math.max(0, Math.round(target.clientWidth - pl - pr)),
    h: Math.max(0, Math.round(target.clientHeight - pt - pb)),
  };
}

export interface WorkshopPegboardProps {
  panels: PegboardPanelDTO[];
}

function useViewportPegboard() {
  const [vw, setVw] = useState(() =>
    typeof window !== "undefined" ? Math.round(window.innerWidth) : 1024
  );
  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? Math.round(window.innerHeight) : 768
  );

  useIsoLayoutEffect(() => {
    function read() {
      setVw(Math.round(window.innerWidth));
      setVh(Math.round(window.innerHeight));
    }
    read();
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("resize", read);
    };
  }, []);

  return { vw, vh };
}

export default function WorkshopPegboard({ panels }: WorkshopPegboardProps) {
  const { vw, vh } = useViewportPegboard();
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  /** `?workshopDebugCork=1` or `localStorage.workshopDebugCork = "1"` — outlines cork + console packing logs. */
  const [debugWorkshopCork, setDebugWorkshopCork] = useState(false);
  const debugWorkshopCorkRef = useRef(debugWorkshopCork);
  debugWorkshopCorkRef.current = debugWorkshopCork;
  /** Dedupe `[workshopDebugCork]` ResizeObserver logs when dimensions are unchanged. */
  const lastScrollportDebugDigest = useRef("");
  const [portalLayout, setPortalLayout] = useState<{
    w: number;
    h: number;
    isMobile: boolean;
  } | null>(null);
  const [connectorBands, setConnectorBands] = useState<
    Record<number, { left: number; width: number; top: number; bottom: number }>
  >({});
  /** Measured `.workshop-panel--desktop` content width (avoids portal−padding drift at odd viewports). */
  const [desktopPegboardContentInnerW, setDesktopPegboardContentInnerW] =
    useState<number | null>(null);
  const [desktopPanelPadY, setDesktopPanelPadY] = useState(() =>
    workshopPanelRemPaddingBlockPx()
  );
  const [desktopPanelPadX, setDesktopPanelPadX] = useState(() =>
    workshopPanelRemPaddingPx()
  );

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get(
        "workshopDebugCork"
      );
      const ls = window.localStorage.getItem("workshopDebugCork");
      setDebugWorkshopCork(q === "1" || ls === "1");
    } catch {
      setDebugWorkshopCork(false);
    }
  }, []);

  useEffect(() => {
    if (debugWorkshopCork) lastScrollportDebugDigest.current = "";
  }, [debugWorkshopCork]);

  const layoutW = Math.round(portalLayout?.w ?? vw);
  const layoutH = Math.round(portalLayout?.h ?? vh);
  const isMobile = portalLayout?.isMobile ?? false;
  const isLayoutReady = portalLayout !== null;

  const desktopInner = useMemo(
    () => desktopInnerW(layoutW, desktopPanelPadX),
    [layoutW, desktopPanelPadX]
  );
  const sideGap = useMemo(
    () => desktopPegboardSideGap(layoutW, desktopInner),
    [layoutW, desktopInner]
  );

  const mobileScalePresentation = useMemo(():
    | MobileScalePresentation
    | undefined => {
    if (!isMobile) return undefined;
    const slotContentW = mobileInnerW(layoutW);
    const flat = panels.flatMap(p => p.items);
    const maxCardW =
      flat.length === 0
        ? PEG_GRID * 4
        : Math.max(
            ...flat.map(it => hardwareDimsWithGrid(it.hardware, PEG_GRID).w)
          );
    const designContentW =
      Math.ceil(
        Math.max(slotContentW, maxCardW + MOBILE_PEGBOARD_STACK_PADDING_X) /
          PEG_GRID
      ) * PEG_GRID;
    const designOuterW = designContentW + PEGBOARD_BORDER_OUTSET;
    const scale = Math.min(1, slotContentW / designOuterW);
    return { slotContentW, designContentW, scale };
  }, [isMobile, layoutW, panels]);

  const panelsPackKey = useMemo(
    () =>
      panels
        .map(p => p.items.map(it => `${it.id}:${it.hardware}`).join(","))
        .join("|"),
    [panels]
  );

  const desktopSharedPack = useMemo(() => {
    if (isMobile || !isLayoutReady) return undefined;
    const layoutInnerW =
      desktopPegboardContentInnerW != null && desktopPegboardContentInnerW > 0
        ? desktopPegboardContentInnerW
        : desktopInnerW(layoutW, desktopPanelPadX);
    const viewportH = desktopPortalInnerH(layoutH, desktopPanelPadY);
    const panelPayload = panels.map(p => ({
      items: p.items.map(i => ({ id: i.id, hardware: i.hardware })),
    }));
    return pickSharedDesktopPackGrid(panelPayload, layoutInnerW, viewportH);
  }, [
    isMobile,
    isLayoutReady,
    panelsPackKey,
    layoutW,
    layoutH,
    desktopPegboardContentInnerW,
    desktopPanelPadX,
    desktopPanelPadY,
  ]);

  useIsoLayoutEffect(() => {
    if (isMobile) {
      setDesktopPegboardContentInnerW(null);
      return;
    }
    const strip = scrollRef.current;
    if (!strip) return;

    const readPanelContentInnerW = (panel: HTMLElement) => {
      const cs = getComputedStyle(panel);
      const pl = parseFloat(cs.paddingLeft || "0") || 0;
      const pr = parseFloat(cs.paddingRight || "0") || 0;
      return Math.max(0, Math.round(panel.clientWidth - pl - pr));
    };

    const measureContentInnerW = () => {
      const panel = strip.querySelector(
        ".workshop-panel--desktop"
      ) as HTMLElement | null;
      if (!panel) return;
      setDesktopPegboardContentInnerW(readPanelContentInnerW(panel));
    };

    measureContentInnerW();
    const ro = new ResizeObserver(() => measureContentInnerW());
    const firstForRo = strip.querySelector(
      ".workshop-panel--desktop"
    ) as HTMLElement | null;
    if (firstForRo) ro.observe(firstForRo);

    return () => ro.disconnect();
  }, [isMobile, panels.length, layoutW, layoutH, isLayoutReady]);

  useIsoLayoutEffect(() => {
    if (isMobile) return;
    const strip = scrollRef.current;
    if (!strip) return;
    const n = panels.length;

    const firstPanel = strip.querySelector(
      ".workshop-panel--desktop"
    ) as HTMLElement | null;
    if (firstPanel) {
      const s = window.getComputedStyle(firstPanel);
      const pt = parseFloat(s.paddingTop || "0") || 0;
      const pl = parseFloat(s.paddingLeft || "0") || 0;
      setDesktopPanelPadY(pt);
      setDesktopPanelPadX(pl);
    }

    if (n < 2) {
      setConnectorBands({});
      return;
    }

    const next: Record<
      number,
      { left: number; width: number; top: number; bottom: number }
    > = {};

    for (let i = 0; i < n - 1; i += 1) {
      const panelEl = strip.children.item(i) as HTMLElement | null;
      const nextPanelEl = strip.children.item(i + 1) as HTMLElement | null;
      if (!panelEl || !nextPanelEl) continue;
      const boardEl = panelEl.querySelector(
        ".pegboard-bg"
      ) as HTMLElement | null;
      const nextBoardEl = nextPanelEl.querySelector(
        ".pegboard-bg"
      ) as HTMLElement | null;
      if (!boardEl || !nextBoardEl) continue;

      const panelRect = panelEl.getBoundingClientRect();
      const boardRect = boardEl.getBoundingClientRect();
      const nextBoardRect = nextBoardEl.getBoundingClientRect();

      const borderW = Math.max(
        0,
        parseFloat(window.getComputedStyle(boardEl).borderTopWidth || "0") || 0
      );
      const gridPx =
        parseFloat(
          window.getComputedStyle(boardEl).getPropertyValue("--peg-grid-px")
        ) || 60;
      const screwCenterInset = borderW + gridPx / 2;
      const overlap = 10;

      const left = boardRect.right - panelRect.left - overlap;
      const width = nextBoardRect.left - boardRect.right + overlap * 2;
      const top = boardRect.top - panelRect.top + screwCenterInset;
      const bottom = panelRect.bottom - boardRect.bottom + screwCenterInset;

      if (Number.isFinite(left) && Number.isFinite(width) && width > 0) {
        next[i] = { left, width, top, bottom };
      }
    }

    setConnectorBands(next);
  }, [isMobile, panels.length, layoutW, layoutH, desktopInner]);

  /** Peg scrollport (`workshop-scroll--*`) — same box packing used to measure when it lived in `.portal-inner`. */
  useIsoLayoutEffect(() => {
    const el = isMobile ? mobileScrollRef.current : scrollRef.current;
    if (!el) return;
    const apply = (target: HTMLElement) => {
      const { w, h } = workshopScrollContentClientSize(target);
      const isMobileLayout = Math.round(target.clientWidth) <= 768;
      if (debugWorkshopCorkRef.current) {
        const digest = `${w}x${h}@${target.clientWidth}x${target.clientHeight}@${isMobileLayout}`;
        if (digest !== lastScrollportDebugDigest.current) {
          lastScrollportDebugDigest.current = digest;
          // eslint-disable-next-line no-console -- intentional (?workshopDebugCork=1 / localStorage)
          console.info("[workshopDebugCork] scrollport → packing content box", {
            packingLayoutWxH: { w, h },
            scrollportClient: {
              width: target.clientWidth,
              height: target.clientHeight,
            },
            isMobileLayout,
          });
        }
      }
      setPortalLayout({
        w,
        h,
        /* Breakpoint uses full strip width so padding on the desktop strip does not flip mobile mode. */
        isMobile: isMobileLayout,
      });
    };
    apply(el);
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target instanceof HTMLElement) apply(entry.target);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [panels.length, isMobile]);

  if (panels.length === 0) {
    return (
      <div
        className="workshop-pegboard-root workshop-wall not-prose font-body w-full min-w-0"
        data-pegboard-layout="desktop"
        {...(debugWorkshopCork ? { "data-workshop-debug-cork": "1" } : {})}
      >
        <div className="flex min-h-[12rem] flex-1 flex-col items-center justify-center px-4">
          <p className="text-sm text-slate-400">Nothing on the pegboard yet.</p>
        </div>
      </div>
    );
  }

  const mobileBlocks: ReactNode[] = [];
  panels.forEach((panel, i) => {
    if (i > 0) {
      mobileBlocks.push(
        <div key={`seam-${i}`} className="slab-seam" aria-hidden />
      );
    }
    const slabClass = [
      "workshop-panel--mobile",
      "workshop-panel--mobile-slab",
      i === 0 ? "workshop-panel--mobile-slab--first" : "",
      i === panels.length - 1 ? "workshop-panel--mobile-slab--last" : "",
    ]
      .filter(Boolean)
      .join(" ");
    mobileBlocks.push(
      <div key={`panel-${i}`} className={slabClass}>
        <PegboardPanelView
          key={panel.items.map(x => x.id).join("|")}
          items={panel.items}
          isMobile
          vw={vw}
          vh={vh}
          layoutWidth={layoutW}
          layoutHeight={layoutH}
          mobileScalePresentation={mobileScalePresentation}
          debugWorkshopCork={debugWorkshopCork}
        />
      </div>
    );
  });

  return (
    <div
      className="workshop-pegboard-root workshop-wall not-prose font-body w-full min-w-0"
      data-pegboard-layout={isMobile ? "mobile" : "desktop"}
      {...(debugWorkshopCork ? { "data-workshop-debug-cork": "1" } : {})}
    >
      {!isMobile ? (
        <div
          ref={scrollRef}
          className="workshop-scroll--desktop-strip hide-scrollbar"
          style={{ visibility: isLayoutReady ? "visible" : "hidden" }}
        >
          {panels.map((panel, i) => (
            <div key={`panel-${i}`} className="workshop-panel--desktop">
              <PegboardPanelView
                key={panel.items.map(x => x.id).join("|")}
                items={panel.items}
                isMobile={false}
                vw={vw}
                vh={vh}
                layoutWidth={layoutW}
                layoutHeight={layoutH}
                desktopPanelPadY={desktopPanelPadY}
                desktopPanelPadX={desktopPanelPadX}
                desktopContentInnerW={desktopPegboardContentInnerW}
                debugWorkshopCork={debugWorkshopCork}
                desktopPanelIndex={i}
                desktopSharedPack={desktopSharedPack}
              />
              {i < panels.length - 1 ? (
                <>
                  {/*
                   * Align connector bands to the pegboard corner screw centers.
                   * Peg hole / screw spacing follows `--peg-grid-px` on `.pegboard-bg`.
                   */}
                  <div
                    aria-hidden
                    className="metal-bracket--band"
                    style={{
                      width: connectorBands[i]?.width ?? sideGap + 80,
                      left: connectorBands[i]?.left,
                      top: connectorBands[i]?.top ?? 70,
                      transform: "translateY(-50%)",
                    }}
                  />
                  <div
                    aria-hidden
                    className="metal-bracket--band"
                    style={{
                      width: connectorBands[i]?.width ?? sideGap + 80,
                      left: connectorBands[i]?.left,
                      bottom: connectorBands[i]?.bottom ?? 70,
                      transform: "translateY(50%)",
                    }}
                  />
                </>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={mobileScrollRef}
          className="workshop-scroll--mobile hide-scrollbar"
          style={{ visibility: isLayoutReady ? "visible" : "hidden" }}
        >
          {mobileBlocks}
        </div>
      )}
    </div>
  );
}
