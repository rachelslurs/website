interface ViewSourceProps {
  filename: string;
  className?: string;
}

export default function ViewSource({
  filename,
  className = "",
}: ViewSourceProps) {
  const githubUrl = `https://github.com/rachelslurs/website/tree/main/src/components/demo/${filename}`;

  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-sm text-skin-base opacity-70 hover:opacity-100 hover:text-skin-accent transition-colors group ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 group-hover:text-skin-accent transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
      </svg>
      <span>View Source</span>
    </a>
  );
}
