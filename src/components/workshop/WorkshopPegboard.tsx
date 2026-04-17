import DymoLabel from "@components/riso/DymoLabel";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import {
  desktopPegboardSideGap,
  hardwareDimsWithGrid,
  PEG_GRID,
} from "@utils/workshopPegboardPhysics";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { PegboardPanelDTO } from "@utils/serializeWorkshopPegboard";
import PegboardPanelView from "./PegboardPanels";
import {
  desktopInnerW,
  mobileInnerW,
  PEGBOARD_BORDER_OUTSET,
} from "./pegboardDimensions";
import type { MobileScalePresentation } from "./pegboardTypes";

import "../../styles/workshop-pegboard.css";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** One side of `.workshop-panel--desktop { padding: 2rem }` in px (tracks `html` font-size, e.g. `md` 125%). */
function workshopPanelRemPaddingPx(): number {
  if (typeof document === "undefined") return 32;
  const rootPx = parseFloat(
    getComputedStyle(document.documentElement).fontSize || "16"
  );
  const fontPx = Number.isFinite(rootPx) && rootPx > 0 ? rootPx : 16;
  return Math.round(2 * fontPx);
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
  const portalInnerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  /** `?workshopDebugCork=1` or `localStorage.workshopDebugCork = "1"` — outlines cork + console packing logs. */
  const [debugWorkshopCork, setDebugWorkshopCork] = useState(false);
  const [portalLayout, setPortalLayout] = useState<{
    w: number;
    h: number;
    isMobile: boolean;
  } | null>(null);
  /** Mobile column: panel index at ends, or -1 when mid-scroll (reference: both nav buttons stay enabled). */
  const [mobilePanelIdx, setMobilePanelIdx] = useState(0);
  const [connectorBands, setConnectorBands] = useState<
    Record<number, { left: number; width: number; top: number; bottom: number }>
  >({});
  /** Measured `.workshop-panel--desktop` content width (avoids portal−padding drift at odd viewports). */
  const [desktopPegboardContentInnerW, setDesktopPegboardContentInnerW] =
    useState<number | null>(null);
  const [desktopPanelPadY, setDesktopPanelPadY] = useState(() =>
    workshopPanelRemPaddingPx()
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
      Math.ceil(Math.max(slotContentW, maxCardW) / PEG_GRID) * PEG_GRID;
    const designOuterW = designContentW + PEGBOARD_BORDER_OUTSET;
    const scale = Math.min(1, slotContentW / designOuterW);
    return { slotContentW, designContentW, scale };
  }, [isMobile, layoutW, panels]);

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

  useIsoLayoutEffect(() => {
    const el = portalInnerRef.current;
    if (!el) return;
    const apply = (target: HTMLElement) => {
      // Use border-box pixel size from layout (not contentRect), so flex-constrained
      // portal-inner height matches what the user sees after ADR-003 height chain.
      const w = Math.round(target.clientWidth);
      const h = Math.round(target.clientHeight);
      // Do not bail on 0×0: first paint can be before flex insets size the portal; we
      // still need portalLayout set so `visibility` clears and ResizeObserver can settle.
      setPortalLayout({
        w,
        h,
        isMobile: w <= 768,
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
  }, [panels.length]);

  const syncScrollIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pageW = el.clientWidth || 1;
    const idx = Math.round(el.scrollLeft / pageW);
    setActivePanelIndex(
      Math.min(Math.max(0, idx), Math.max(0, panels.length - 1))
    );
  }, [panels.length]);

  const syncMobileScrollIndex = useCallback(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop <= 10;
    const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10;
    const n = panels.length;
    if (atTop && atBottom) {
      setMobilePanelIdx(-1);
    } else if (atTop) {
      setMobilePanelIdx(0);
    } else if (atBottom) {
      setMobilePanelIdx(Math.max(0, n - 1));
    } else {
      setMobilePanelIdx(-1);
    }
  }, [panels.length]);

  useEffect(() => {
    syncScrollIndex();
  }, [syncScrollIndex, panels.length, layoutW]);

  useEffect(() => {
    if (!isMobile) return;
    syncMobileScrollIndex();
  }, [isMobile, panels.length, syncMobileScrollIndex]);

  const scrollPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pageW = el.clientWidth;
    el.scrollBy({ left: -pageW, behavior: "smooth" });
  }, []);

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pageW = el.clientWidth;
    el.scrollBy({ left: pageW, behavior: "smooth" });
  }, []);

  const scrollMobilePrev = useCallback(() => {
    const el = mobileScrollRef.current;
    const ch =
      el?.clientHeight ??
      (typeof window !== "undefined" ? window.innerHeight : 600);
    const delta = ch * 0.8;
    el?.scrollBy({
      top: -delta,
      behavior: "smooth",
    });
  }, []);

  const scrollMobileNext = useCallback(() => {
    const el = mobileScrollRef.current;
    const ch =
      el?.clientHeight ??
      (typeof window !== "undefined" ? window.innerHeight : 600);
    const delta = ch * 0.8;
    el?.scrollBy({
      top: delta,
      behavior: "smooth",
    });
  }, []);

  if (panels.length === 0) {
    return (
      <div
        className="workshop-pegboard-root workshop-wall not-prose font-body w-full min-w-0"
        data-pegboard-layout="desktop"
      >
        <div className="portal-frame">
          <div className="portal-inner flex min-h-[12rem] items-center justify-center">
            <p className="text-sm text-slate-400">
              Nothing on the pegboard yet.
            </p>
          </div>
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
        />
      </div>
    );
  });

  const atFirst = activePanelIndex <= 0;
  const atLast = activePanelIndex >= panels.length - 1;
  const navDisabledPrev = isMobile ? mobilePanelIdx === 0 : atFirst;
  const navDisabledNext = isMobile
    ? mobilePanelIdx === panels.length - 1
    : atLast;

  return (
    <div
      className="workshop-pegboard-root workshop-wall not-prose font-body w-full min-w-0"
      data-pegboard-layout={isMobile ? "mobile" : "desktop"}
    >
      <div className="portal-frame">
        <div
          ref={portalInnerRef}
          className="portal-inner"
          style={{ visibility: isLayoutReady ? "visible" : "hidden" }}
        >
          <div className="shadowbox-portal" aria-hidden />
          {!isMobile ? (
            <div
              ref={scrollRef}
              onScroll={syncScrollIndex}
              className="workshop-scroll--desktop-strip hide-scrollbar"
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
              onScroll={syncMobileScrollIndex}
              className="workshop-scroll--mobile hide-scrollbar"
            >
              {mobileBlocks}
            </div>
          )}
        </div>

        <div
          className={
            panels.length === 1
              ? "portal-bezel portal-bezel--solo"
              : "portal-bezel"
          }
        >
          <div
            className="flex shrink-0 items-center justify-center gap-3 max-[380px]:gap-2"
            aria-hidden="true"
          >
            <DymoLabel
              text="Workshop"
              size="large"
              isInteractive={false}
              grain="vertical"
              title="Vertical grain (default)"
            />
          </div>
          <span className="sr-only">
            Workshop — two label textures shown for comparison: vertical and
            horizontal tape grain.
          </span>
          {panels.length > 1 ? (
            <nav className="workshop-panel-nav" aria-label="Workshop panels">
              <button
                type="button"
                className="workshop-panel-nav__btn focus-outline"
                disabled={navDisabledPrev}
                aria-label={isMobile ? "Scroll up" : "Previous panel"}
                onClick={isMobile ? scrollMobilePrev : scrollPrev}
              >
                {isMobile ? (
                  <ChevronUpIcon className="h-5 w-5" aria-hidden />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden />
                )}
              </button>
              <button
                type="button"
                className="workshop-panel-nav__btn focus-outline"
                disabled={navDisabledNext}
                aria-label={isMobile ? "Scroll down" : "Next panel"}
                onClick={isMobile ? scrollMobileNext : scrollNext}
              >
                {isMobile ? (
                  <ChevronDownIcon className="h-5 w-5" aria-hidden />
                ) : (
                  <ChevronRightIcon className="h-5 w-5" aria-hidden />
                )}
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
