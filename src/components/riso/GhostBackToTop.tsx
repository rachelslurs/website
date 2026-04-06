import DymoLabel from "@components/riso/DymoLabel";

export default function GhostBackToTop() {
  return (
    <div
      className="ghost-btn-wrapper ghost-btn-wrapper--footer"
      style={{ margin: "var(--baseline) auto var(--baseline) auto" }}
    >
      <button
        type="button"
        className="ghost-back-to-top-btn focus-outline"
        onClick={() => {
          const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          window.scrollTo({
            top: 0,
            behavior: reduceMotion ? "auto" : "smooth",
          });
        }}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          transform: "rotate(1deg)",
        }}
      >
        <DymoLabel text="^ TOP" isInteractive={true} />
      </button>
    </div>
  );
}
