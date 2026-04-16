import { PEG_GRID } from "@utils/workshopPegboardPhysics";

/** Usable cork width inside panel padding (not snapped to a peg step). */
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

export function mobileInnerW(vw: number): number {
  const panelOuter = Math.min(420, vw);
  const maxInner = panelOuter - 48;
  return Math.max(PEG_GRID * 4, Math.floor(maxInner / PEG_GRID) * PEG_GRID);
}
