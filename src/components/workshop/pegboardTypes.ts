import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";

export type PegboardCardSpec = {
  id: string;
  hardware: PegboardCardDTO["hardware"];
  w: number;
  h: number;
};
