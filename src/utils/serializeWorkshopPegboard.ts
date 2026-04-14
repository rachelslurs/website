import type { BlueprintPegboardIconKey } from "@components/workshop/blueprintPegboardIcons";
import type { WorkshopPanel, WorkshopPanelItem } from "./buildWorkshopPanels";
import { formatPostDate } from "./mapBlogToPortfolioPost";
import type { PegboardHardware } from "./workshopPegboardPhysics";

export type { PegboardHardware };

export interface PegboardCardDTO {
  id: string;
  hardware: PegboardHardware;
  title: string;
  href: string;
  subtitle?: string;
  dateLabel: string;
  /** Links (LCD): optional GIF for in-card preview; resolved to URL string. */
  gifLink?: string;
  /** Case study clipboard: body copy (description or summary). */
  description?: string;
  caseStudyYear?: string;
  caseStudyLabel?: string;
  /** Blueprint: cycling Riso accent for subtitle */
  subtitleColor?: string;
  /** Blueprint: optional Heroicon key from frontmatter */
  pegboardIcon?: BlueprintPegboardIconKey;
}

export interface PegboardPanelDTO {
  items: PegboardCardDTO[];
}

function resolveGifLink(gifLink: unknown): string | undefined {
  if (gifLink == null) return undefined;
  if (typeof gifLink === "string") return gifLink;
  if (typeof gifLink === "object" && gifLink !== null && "src" in gifLink) {
    const src = (gifLink as { src: unknown }).src;
    return typeof src === "string" ? src : undefined;
  }
  return undefined;
}

function serializeItem(item: WorkshopPanelItem): PegboardCardDTO {
  switch (item.kind) {
    case "work": {
      const d = item.entry.data;
      const raw = d.modDatetime ?? d.pubDatetime;
      const date = new Date(raw);
      return {
        id: `work:${item.entry.slug}`,
        hardware: "clipboard",
        title: d.title,
        href: `/work/${item.entry.slug}`,
        dateLabel: formatPostDate(date),
        description: (d.description?.trim() && d.description) || d.summary,
        caseStudyYear: d.year ?? String(date.getFullYear()),
        caseStudyLabel: "Case Study",
      };
    }
    case "links": {
      const d = item.entry.data;
      const raw = d.modDatetime ?? d.pubDatetime;
      return {
        id: `links:${item.entry.slug}`,
        hardware: "lcd",
        title: d.title,
        href: d.url,
        subtitle: d.subtitle,
        dateLabel: formatPostDate(new Date(raw)),
        gifLink: resolveGifLink(d.gifLink),
      };
    }
    case "demos": {
      const d = item.entry.data;
      const raw = d.modDatetime ?? d.pubDatetime;
      const summaryLine = d.summary?.trim() || undefined;
      const desc = d.description?.trim() || undefined;
      return {
        id: `demos:${item.entry.slug}`,
        hardware: "blueprint",
        title: d.title,
        href: `/demos/${item.entry.slug}`,
        subtitle: summaryLine,
        dateLabel: formatPostDate(new Date(raw)),
        description:
          desc && summaryLine && desc === summaryLine ? undefined : desc,
        pegboardIcon: d.pegboardIcon,
      };
    }
  }
}

const RISO_ACCENTS = [
  "var(--blue)",
  "var(--red)",
  "var(--violet)",
  "var(--green)",
  "var(--orange)",
  "var(--pink)",
] as const;

export function serializeWorkshopPanelsForPegboard(
  panels: WorkshopPanel[]
): PegboardPanelDTO[] {
  const rows = panels.map(panel => panel.map(serializeItem));
  let demoOrdinal = 0;
  return rows.map(items => ({
    items: items.map(item => {
      if (item.hardware !== "blueprint") return item;
      const subtitleColor =
        RISO_ACCENTS[demoOrdinal % RISO_ACCENTS.length] ?? "var(--blue)";
      demoOrdinal += 1;
      return { ...item, subtitleColor };
    }),
  }));
}
