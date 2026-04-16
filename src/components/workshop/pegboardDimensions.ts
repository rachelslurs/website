import { PEG_GRID } from "@utils/workshopPegboardPhysics";

/** Matches `.pegboard-bg { border: 8px solid … }` — 2× border width for content-box outer size. */
export const PEGBOARD_BORDER_OUTSET = 16;

/** Usable cork width for desktop (panel padding from caller). */
export function desktopInnerW(vw: number, desktopPanelPadX: number): number {
  return Math.max(0, vw - desktopPanelPadX * 2);
}

export function desktopViewportInnerH(vh: number): number {
  return Math.floor((vh - 96) / PEG_GRID) * PEG_GRID;
}

/** Usable cork height inside panel padding (not snapped to a peg step). */
export function desktopPortalInnerH(
  portalInnerH: number,
  desktopPanelPadY: number
): number {
  return Math.max(0, portalInnerH - desktopPanelPadY * 2);
}

/**
 * Cork **content** width budget for mobile slabs — matches
 * `.workshop-panel--mobile { width: 92%; max-width: 420px; padding: 0 0.5rem }`.
 * Does not force `4 * PEG_GRID` when the column is narrower (fixes ~320px clip).
 */
export function mobileInnerW(portalInnerW: number): number {
  const panelOuter = Math.min(420, portalInnerW);
  const horizontalPaddingPx = 16; /* 0.5rem × 2 at default root font */
  const inner = panelOuter * 0.92 - horizontalPaddingPx;
  const snapped = Math.floor(Math.max(0, inner) / PEG_GRID) * PEG_GRID;
  return Math.max(PEG_GRID, snapped);
}
