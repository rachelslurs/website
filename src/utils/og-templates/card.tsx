import type { ReactNode } from "react";

/** Shared satori frame for all OG images: paper card with offset double
 *  border. Collection templates only supply the title and footer content. */
export default function card({
  title,
  footer,
}: {
  title: string;
  footer: ReactNode;
}) {
  return (
    <div
      style={{
        background: "#F5F0E8",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-1px",
          right: "-1px",
          border: "4px solid #1A1A2E",
          background: "#EDE8D8",
          opacity: "0.9",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2.5rem",
          width: "88%",
          height: "80%",
        }}
      />

      <div
        style={{
          border: "4px solid #1A1A2E",
          background: "#F5F0E8",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            margin: "20px",
            width: "90%",
            height: "90%",
          }}
        >
          <p
            style={{
              fontSize: 72,
              fontWeight: "bold",
              maxHeight: "84%",
              overflow: "hidden",
            }}
          >
            {title}
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              marginBottom: "8px",
              fontSize: 28,
            }}
          >
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
