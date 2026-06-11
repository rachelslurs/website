/** JSON-LD schema.org builders. Each top-level builder returns a plain object
 *  ready for `JSON.stringify` into a `<script type="application/ld+json">`. */

import { SITE, SOCIALS } from "@config";
import type { BreadcrumbItem } from "@utils/breadcrumbItems";

type Schema = Record<string, unknown>;

const PERSON_ID = `${SITE.website}/#person`;

/** Person entity embedded inside other schemas (no @context). */
function personEntity(): Schema {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.author,
    url: SITE.website,
    sameAs: SOCIALS.filter(social => social.active).map(social => social.href),
  };
}

export function personSchema(): Schema {
  return {
    "@context": "https://schema.org",
    ...personEntity(),
  };
}

/** Site-wide WebSite schema (homepage). No SearchAction: Google retired the
 *  sitelinks search box rich result; `/search?q=` exists if ever wanted. */
export function websiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.title,
    url: SITE.website,
    description: SITE.desc,
    publisher: personEntity(),
  };
}

export function profilePageSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: personEntity(),
  };
}

interface ArticleSchemaInput {
  title: string;
  url: string;
  image: string;
  description?: string;
  author?: string;
  pubDatetime?: Date;
  modDatetime?: Date | null;
  tags?: string[];
  wordCount?: number;
}

/** Frontmatter `author` defaults to SITE.author; only a guest author needs a
 *  standalone Person without the site-wide @id. */
function authorEntity(author?: string): Schema {
  return author && author !== SITE.author
    ? { "@type": "Person", name: author }
    : personEntity();
}

function articleFields({
  url,
  image,
  description,
  author,
  pubDatetime,
  modDatetime,
  tags,
  wordCount,
}: ArticleSchemaInput): Schema {
  return {
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image,
    ...(description && { description }),
    ...(pubDatetime && { datePublished: pubDatetime.toISOString() }),
    ...(modDatetime && { dateModified: modDatetime.toISOString() }),
    author: authorEntity(author),
    publisher: personEntity(),
    ...(tags && tags.length > 0 && { keywords: tags.join(", ") }),
    ...(wordCount && { wordCount }),
  };
}

export function blogPostingSchema(input: ArticleSchemaInput): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    ...articleFields(input),
  };
}

/** Work and demo pages: CreativeWork keeps validators happy without the
 *  offers/ratings requirements SoftwareApplication would trigger. */
export function creativeWorkSchema(input: ArticleSchemaInput): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.title,
    ...articleFields(input),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      // The current page (href: null) carries no item, per Google's docs.
      ...(item.href && { item: new URL(item.href, SITE.website).href }),
    })),
  };
}
