const ConstraintLayers = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 840 330"
    className="w-full font-sans"
    role="img"
    aria-label="Three layers of constraint enforcement: editor rules shape generation, lint rules block commits, CI blocks merges"
  >
    <rect width="840" height="330" rx="12" className="fill-skin-fill" />

    {/* Layer 3 (top): CI / pre-commit — chart-2 blue */}
    <rect
      x="260"
      y="40"
      width="240"
      height="76"
      rx="10"
      style={{ fill: "rgba(var(--color-chart-2), 0.1)" }}
      className="stroke-skin-chart-2"
      strokeWidth="0.8"
    />
    <text
      x="380"
      y="72"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-2 text-sm font-semibold"
    >
      CI / pre-commit hooks
    </text>
    <text
      x="380"
      y="94"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-2 text-xs opacity-70"
    >
      Blocks what can be merged
    </text>

    {/* Layer 2 (middle): Lint rules — chart-3 green */}
    <rect
      x="260"
      y="140"
      width="240"
      height="76"
      rx="10"
      style={{ fill: "rgba(var(--color-chart-3), 0.1)" }}
      className="stroke-skin-chart-3"
      strokeWidth="0.8"
    />
    <text
      x="380"
      y="172"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-3 text-sm font-semibold"
    >
      Lint rules / ESLint config
    </text>
    <text
      x="380"
      y="194"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-3 text-xs opacity-70"
    >
      Blocks what can be committed
    </text>

    {/* Layer 1 (bottom): Editor rules — chart-1 coral */}
    <rect
      x="260"
      y="240"
      width="240"
      height="76"
      rx="10"
      style={{ fill: "rgba(var(--color-chart-1), 0.1)" }}
      className="stroke-skin-chart-1"
      strokeWidth="0.8"
    />
    <text
      x="380"
      y="272"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-1 text-sm font-semibold"
    >
      Editor rules / .cursor/rules/
    </text>
    <text
      x="380"
      y="294"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-1 text-xs opacity-70"
    >
      Shapes what the agent generates
    </text>

    {/* Spine ends at arrow base; triangle points up in absolute coords (no marker orient bugs) */}
    <line
      x1="550"
      y1="290"
      x2="550"
      y2="70"
      className="stroke-skin-card-muted"
      strokeWidth="1.5"
      strokeLinecap="butt"
    />
    <path
      d="M 550 54 L 559 70 L 541 70 Z"
      style={{ fill: "rgb(var(--color-placeholder))" }}
    />
    <text
      x="575"
      y="172"
      dominantBaseline="central"
      className="fill-skin-placeholder text-xs font-medium"
    >
      Constraint
    </text>
    <text
      x="575"
      y="190"
      dominantBaseline="central"
      className="fill-skin-placeholder text-xs font-medium"
    >
      tightens
    </text>

    <text
      x="248"
      y="82"
      textAnchor="end"
      className="fill-skin-chart-2 text-xs opacity-70"
    >
      All tests pass
    </text>
    <text
      x="248"
      y="182"
      textAnchor="end"
      className="fill-skin-chart-3 text-xs opacity-70"
    >
      No direct useEffect
    </text>
    <text
      x="248"
      y="282"
      textAnchor="end"
      className="fill-skin-chart-1 text-xs opacity-70"
    >
      Use semantic HTML
    </text>

    <line
      x1="250"
      y1="82"
      x2="258"
      y2="82"
      className="stroke-skin-chart-2"
      strokeWidth="0.5"
      opacity={0.4}
    />
    <line
      x1="250"
      y1="182"
      x2="258"
      y2="182"
      className="stroke-skin-chart-3"
      strokeWidth="0.5"
      opacity={0.4}
    />
    <line
      x1="250"
      y1="282"
      x2="258"
      y2="282"
      className="stroke-skin-chart-1"
      strokeWidth="0.5"
      opacity={0.4}
    />
  </svg>
);

export default ConstraintLayers;
