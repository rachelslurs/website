import DymoLabel from "@components/riso/DymoLabel";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { desktopPegboardSideGap } from "@utils/workshopPegboardPhysics";
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
import { desktopInnerW } from "./pegboardDimensions";

import "../../styles/workshop-pegboard.css";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface WorkshopPegboardProps {
  panels: PegboardPanelDTO[];
}

function useViewportPegboard() {
  const [vw, setVw] = useState(1024);
  const [vh, setVh] = useState(768);

  useIsoLayoutEffect(() => {
    function read() {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
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
  const [portalLayout, setPortalLayout] = useState<{
    w: number;
    h: number;
    isMobile: boolean;
  } | null>(null);
  /** Mobile column: panel index at ends, or -1 when mid-scroll (reference: both nav buttons stay enabled). */
  const [mobilePanelIdx, setMobilePanelIdx] = useState(0);

  const layoutW = portalLayout?.w ?? vw;
  const layoutH = portalLayout?.h ?? vh;
  const isMobile = portalLayout?.isMobile ?? false;

  const desktopInner = useMemo(() => desktopInnerW(layoutW), [layoutW]);
  const sideGap = useMemo(
    () => desktopPegboardSideGap(layoutW, desktopInner),
    [layoutW, desktopInner]
  );

  useIsoLayoutEffect(() => {
    const el = portalInnerRef.current;
    if (!el) return;
    const apply = (width: number, height: number) => {
      setPortalLayout({
        w: width,
        h: height,
        isMobile: width <= 768,
      });
    };
    apply(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        apply(width, height);
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
        <div key={`seam-${i}`} className="slab-seam" aria-hidden>
          <span className="heavy-screw heavy-screw--left" />
          <span className="heavy-screw heavy-screw--right" />
        </div>
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
        <div ref={portalInnerRef} className="portal-inner">
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
                  />
                  {i < panels.length - 1 ? (
                    <>
                      <div
                        aria-hidden
                        className="metal-bracket--band"
                        style={{
                          width: sideGap + 80,
                          right: -(sideGap + 40),
                          top: 98,
                          transform: "translateY(-50%)",
                        }}
                      />
                      <div
                        aria-hidden
                        className="metal-bracket--band"
                        style={{
                          width: sideGap + 80,
                          right: -(sideGap + 40),
                          bottom: 98,
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
          <DymoLabel text="WORKSHOP" size="large" isInteractive={false} />
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
