import React from "react";
import DymoLabel from "./DymoLabel";

type PostStub = {
  title: string;
  slug: string;
};

type PostPaginationProps = {
  prevPost?: PostStub | null;
  nextPost?: PostStub | null;
  /** Link prefix, e.g. `/posts` or `/demos` */
  hrefBase?: string;
  /** Accessible name for the nav landmark */
  navLabel?: string;
};

export default function PostPagination({
  prevPost,
  nextPost,
  hrefBase = "/posts",
  navLabel = "Post navigation",
}: PostPaginationProps) {
  if (!prevPost && !nextPost) return null;

  const rawCSS = `
    .pagination-zone {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      /* Pulls cards slightly under the main looseleaf paper */
      margin-top: -2.5rem; 
      position: relative;
      /* Lower than the main paper's shadow (which is z-10) */
      z-index: 5; 
      padding: 0 4rem;
    }

    @media (max-width: 768px) {
      .pagination-zone {
        grid-template-columns: 1fr;
        margin-top: -1.5rem;
        padding: 0 1.5rem;
      }
    }

    /* ── THE INDEX CARD ── */
    .index-card {
      background: var(--cream);
      padding: 1.5rem;
      min-height: 120px;
      box-shadow: 0 4px 12px rgba(var(--color-shadow), 0.15);
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), z-index 0s 0.3s;
      
      /* Ruled index card top line using the base ink color */
      border-top: 2px solid rgb(var(--color-text-base));
      
      /* Link styling resets */
      text-decoration: none;
      color: inherit;
    }

    .index-card:focus-visible {
      outline: 3px dashed rgb(var(--color-accent));
      outline-offset: 4px;
    }

    /* Map to Kraft Riso Palette */
    .prev-card { 
      transform: rotate(-1.5deg); 
      border-top-color: rgb(var(--color-chart-2)); /* Riso Blue */
    }
    .next-card { 
      transform: rotate(1.5deg); 
      border-top-color: rgb(var(--color-accent)); /* Riso Red */
    }

    .index-card:hover {
      /* Cards "slide out" from under the paper on hover */
      transform: translateY(16px) rotate(0deg);
      z-index: 15; /* Lift above the paper edge temporarily */
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), z-index 0s;
    }

    /* ── CARD CONTENT ── */
    .card-label {
      margin-bottom: 0.75rem;
    }

    .card-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.125rem;
      line-height: 1.3;
      color: rgb(var(--color-text-base));
      font-weight: 600;
      display: block;
      transition: color 0.2s;
    }

    .prev-card:hover .card-title {
      color: rgb(var(--color-chart-2));
    }

    .next-card:hover .card-title {
      color: rgb(var(--color-accent));
    }
  `;

  return (
    <>
      <style>{rawCSS}</style>
      <nav className="pagination-zone" aria-label={navLabel}>
        {prevPost ? (
          <a
            href={`${hrefBase}/${prevPost.slug}`}
            className="index-card prev-card"
          >
            <div className="card-label">
              <DymoLabel
                text="PREVIOUS"
                size="section"
                color="blue"
                isInteractive={false}
              />
            </div>
            <span className="card-title">{prevPost.title}</span>
          </a>
        ) : (
          <div className="empty-card" aria-hidden="true" />
        )}

        {nextPost ? (
          <a
            href={`${hrefBase}/${nextPost.slug}`}
            className="index-card next-card"
          >
            <div className="card-label">
              <DymoLabel
                text="NEXT"
                size="section"
                color="red"
                isInteractive={false}
              />
            </div>
            <span className="card-title">{nextPost.title}</span>
          </a>
        ) : (
          <div className="empty-card" aria-hidden="true" />
        )}
      </nav>
    </>
  );
}
