import { seededOffset } from "./seededOffset";

/** Stable integer from slug — same post always gets the same board tilt. */
export function slugRotationSeed(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 100000;
}

/** At-rest card tilt (matches DraggableCard / BoardCard outer wrapper). */
export function boardCardRestRotationDeg(slug: string): number {
  return seededOffset(slugRotationSeed(slug) * 17, 2.5);
}

/** Extra rotation on entrance animation (inner motion layer). */
export function boardCardEntranceExtraRotateDeg(slug: string): number {
  return seededOffset(slugRotationSeed(slug) * 31, 6);
}
