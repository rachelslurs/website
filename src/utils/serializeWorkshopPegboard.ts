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
  /** Case study clipboard: body copy (description or summary). */
  description?: string;
  caseStudyYear?: string;
  caseStudyLabel?: string;
}

export interface PegboardPanelDTO {
  items: PegboardCardDTO[];
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
      };
    }
    case "demos": {
      const d = item.entry.data;
      const raw = d.modDatetime ?? d.pubDatetime;
      return {
        id: `demos:${item.entry.slug}`,
        hardware: "blueprint",
        title: d.title,
        href: `/demos/${item.entry.slug}`,
        subtitle: d.summary,
        dateLabel: formatPostDate(new Date(raw)),
      };
    }
  }
}

export function serializeWorkshopPanelsForPegboard(
  panels: WorkshopPanel[]
): PegboardPanelDTO[] {
  return panels.map(panel => ({
    items: panel.map(serializeItem),
  }));
}
