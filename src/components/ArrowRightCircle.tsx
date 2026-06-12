/** Chunky chevron right, centered for use inside the circular card-link
 *  button on board cards (homepage + /posts). */
export default function ArrowRightCircle({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M10.25 8.25 14 12l-3.75 3.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
