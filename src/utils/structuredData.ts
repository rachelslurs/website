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

/** Reference to the Person node defined elsewhere on the same page —
 *  JSON-LD consumers merge nodes by @id across script tags. */
const personRef = (): Schema => ({ "@id": PERSON_ID });

/** Site-wide WebSite schema (homepage). Pair with personSchema() on the same
 *  page — publisher is only an @id reference. No SearchAction: Google retired
 *  the sitelinks search box rich result; `/search?q=` exists if ever wanted. */
export function websiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.title,
    url: SITE.website,
    description: SITE.desc,
    publisher: personRef(),
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

const isGuestAuthor = (author?: string) =>
  Boolean(author) && author !== SITE.author;

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
    // The full Person node appears once per page; the second mention is an
    // @id reference. A guest author flips which slot carries the full node.
    author: isGuestAuthor(author)
      ? { "@type": "Person", name: author }
      : personEntity(),
    publisher: isGuestAuthor(author) ? personEntity() : personRef(),
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
