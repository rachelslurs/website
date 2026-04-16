import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";

export type PegboardCardSpec = {
  id: string;
  hardware: PegboardCardDTO["hardware"];
  w: number;
  h: number;
};

/** Shared mobile cork step + width (all slabs use the same layout). */
export type MobilePegLayout = {
  grid: number;
  innerWUsed: number;
  suppressMobileScale: boolean;
};
