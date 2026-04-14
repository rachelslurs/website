import { PEG_GRID } from "@utils/workshopPegboardPhysics";

export function desktopInnerW(vw: number): number {
  const maxInnerW = vw - 96;
  return Math.floor(maxInnerW / PEG_GRID) * PEG_GRID;
}

export function desktopViewportInnerH(vh: number): number {
  return Math.floor((vh - 96) / PEG_GRID) * PEG_GRID;
}

export function mobileInnerW(vw: number): number {
  const panelOuter = Math.min(420, vw);
  const maxInner = panelOuter - 48;
  return Math.max(PEG_GRID * 4, Math.floor(maxInner / PEG_GRID) * PEG_GRID);
}
