import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";

export type PegboardCardSpec = {
  id: string;
  hardware: PegboardCardDTO["hardware"];
  w: number;
  h: number;
};

/** One width + scale for every mobile slab (from all panels’ hardware). */
export type MobileScalePresentation = {
  slotContentW: number;
  designContentW: number;
  scale: number;
};
