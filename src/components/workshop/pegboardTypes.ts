import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";

export type PegboardCardSpec = {
  id: string;
  hardware: PegboardCardDTO["hardware"];
  w: number;
  h: number;
};

/**
 * One width + scale for every mobile slab (from all panels’ hardware).
 *
 * Contract (portal width, shared scale, design-space physics) is **ADR-001**.
 * If you change how mobile scaling works, update the ADR or supersede it.
 *
 * @see docs/decisions/001-workshop-mobile-pegboard-contract.md
 */
export type MobileScalePresentation = {
  slotContentW: number;
  designContentW: number;
  scale: number;
};
