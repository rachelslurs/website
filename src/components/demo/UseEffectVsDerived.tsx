const WithUseEffectSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 420 460"
    className="w-full"
    role="img"
    aria-label="With useEffect: unresolved dependency graph between state and effects"
  >
    <defs>
      <marker
        id="arr-coral-l"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path
          d="M2 1L8 5L2 9"
          fill="none"
          style={{ stroke: "rgb(var(--color-chart-1))" }}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>
      <marker
        id="arr-muted-l"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path
          d="M2 1L8 5L2 9"
          fill="none"
          style={{ stroke: "rgba(var(--color-chart-1), 0.4)" }}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>
    </defs>

    <rect width="420" height="460" rx="12" className="fill-skin-fill" />

    <text
      x="210"
      y="42"
      textAnchor="middle"
      className="fill-skin-base"
      style={{ fontSize: 15, fontWeight: 600 }}
    >
      With useEffect
    </text>
    <text
      x="210"
      y="62"
      textAnchor="middle"
      className="fill-skin-placeholder"
      style={{ fontSize: 12 }}
    >
      Agent reads: unresolved graph
    </text>

    <rect
      x="70"
      y="88"
      width="130"
      height="42"
      rx="6"
      style={{ fill: "rgba(var(--color-chart-1), 0.12)" }}
      className="stroke-skin-chart-1"
      strokeWidth="0.8"
      opacity="0.8"
    />
    <text
      x="135"
      y="109"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-1"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      useState(A)
    </text>

    <rect
      x="220"
      y="88"
      width="130"
      height="42"
      rx="6"
      style={{ fill: "rgba(var(--color-chart-1), 0.12)" }}
      className="stroke-skin-chart-1"
      strokeWidth="0.8"
      opacity="0.8"
    />
    <text
      x="285"
      y="109"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-1"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      useState(B)
    </text>

    <rect
      x="70"
      y="175"
      width="130"
      height="52"
      rx="6"
      style={{ fill: "rgba(var(--color-chart-1), 0.18)" }}
      className="stroke-skin-chart-1"
      strokeWidth="0.8"
    />
    <text
      x="135"
      y="201"
      textAnchor="middle"
      className="fill-skin-base"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      <tspan x="135" dy="-7">
        useEffect
      </tspan>
      <tspan
        x="135"
        dy="15"
        className="fill-skin-chart-1"
        style={{ fontSize: 11 }}
      >
        deps: [props]
      </tspan>
    </text>

    <rect
      x="220"
      y="175"
      width="130"
      height="52"
      rx="6"
      style={{ fill: "rgba(var(--color-chart-1), 0.18)" }}
      className="stroke-skin-chart-1"
      strokeWidth="0.8"
    />
    <text
      x="285"
      y="201"
      textAnchor="middle"
      className="fill-skin-base"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      <tspan x="285" dy="-7">
        useEffect
      </tspan>
      <tspan
        x="285"
        dy="15"
        className="fill-skin-chart-1"
        style={{ fontSize: 11 }}
      >
        deps: [A]
      </tspan>
    </text>

    <line
      x1="135"
      y1="130"
      x2="135"
      y2="173"
      className="stroke-skin-chart-1"
      strokeWidth="1.2"
      opacity="0.6"
      markerEnd="url(#arr-coral-l)"
    />
    <line
      x1="285"
      y1="130"
      x2="285"
      y2="173"
      className="stroke-skin-chart-1"
      strokeWidth="1.2"
      opacity="0.6"
      markerEnd="url(#arr-coral-l)"
    />

    <line
      x1="200"
      y1="109"
      x2="218"
      y2="109"
      className="stroke-skin-chart-1"
      strokeWidth="1"
      opacity="0.4"
      markerEnd="url(#arr-muted-l)"
    />

    {/* Effect 1 → useState A: left edges, routed outside column (x=56) */}
    <path
      d="M 70 201 L 56 201 L 56 109 L 70 109"
      fill="none"
      className="stroke-skin-chart-1"
      strokeWidth="1"
      opacity="0.4"
      strokeDasharray="4 3"
      strokeLinejoin="round"
    />

    {/* Effect 2 → useState B: right edges, routed outside column (x=364) */}
    <path
      d="M 350 201 L 364 201 L 364 109 L 350 109"
      fill="none"
      className="stroke-skin-chart-1"
      strokeWidth="1"
      opacity="0.4"
      strokeDasharray="4 3"
      strokeLinejoin="round"
    />

    <rect
      x="110"
      y="295"
      width="200"
      height="42"
      rx="6"
      className="fill-skin-card"
      style={{ stroke: "rgba(var(--color-card-muted), 0.4)" }}
      strokeWidth="0.8"
    />
    <text
      x="210"
      y="316"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-placeholder"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      JSX output
    </text>

    <line
      x1="135"
      y1="227"
      x2="170"
      y2="293"
      style={{ stroke: "rgba(var(--color-card-muted), 0.25)" }}
      strokeWidth="0.8"
    />
    <line
      x1="285"
      y1="227"
      x2="250"
      y2="293"
      style={{ stroke: "rgba(var(--color-card-muted), 0.25)" }}
      strokeWidth="0.8"
    />

    <text
      x="210"
      y="366"
      textAnchor="middle"
      className="fill-skin-placeholder"
      style={{ fontSize: 12, fontStyle: "italic" }}
    >
      Which ran first? What's stale?
    </text>

    <rect
      x="92"
      y="418"
      width="12"
      height="12"
      rx="3"
      className="fill-skin-chart-1"
      opacity="0.7"
    />
    <text
      x="210"
      y="426"
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-skin-placeholder"
      style={{ fontSize: 11 }}
    >
      State mutation + dependency chain
    </text>
  </svg>
);

const DerivedStateSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="420 0 420 460"
    className="w-full"
    role="img"
    aria-label="Derived state: pure top-to-bottom data flow"
  >
    <defs>
      <marker
        id="arr-green-r"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path
          d="M2 1L8 5L2 9"
          fill="none"
          style={{ stroke: "rgb(var(--color-chart-3))" }}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>
    </defs>

    <rect x="420" width="420" height="460" rx="12" className="fill-skin-fill" />

    <text
      x="630"
      y="42"
      textAnchor="middle"
      className="fill-skin-base"
      style={{ fontSize: 15, fontWeight: 600 }}
    >
      Derived state
    </text>
    <text
      x="630"
      y="62"
      textAnchor="middle"
      className="fill-skin-placeholder"
      style={{ fontSize: 12 }}
    >
      Agent reads: pure function
    </text>

    <rect
      x="555"
      y="88"
      width="150"
      height="42"
      rx="6"
      style={{ fill: "rgba(var(--color-chart-3), 0.12)" }}
      className="stroke-skin-chart-3"
      strokeWidth="0.8"
    />
    <text
      x="630"
      y="109"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-3"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      Props
    </text>

    <rect
      x="555"
      y="175"
      width="150"
      height="52"
      rx="6"
      style={{ fill: "rgba(var(--color-chart-3), 0.18)" }}
      className="stroke-skin-chart-3"
      strokeWidth="0.8"
    />
    <text
      x="630"
      y="201"
      textAnchor="middle"
      className="fill-skin-base"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      <tspan x="630" dy="-7">
        Computed values
      </tspan>
      <tspan
        x="630"
        dy="15"
        className="fill-skin-chart-3"
        style={{ fontSize: 11 }}
      >
        derived inline
      </tspan>
    </text>

    <rect
      x="555"
      y="295"
      width="150"
      height="42"
      rx="6"
      style={{ fill: "rgba(var(--color-chart-3), 0.12)" }}
      className="stroke-skin-chart-3"
      strokeWidth="0.8"
    />
    <text
      x="630"
      y="316"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-skin-chart-3"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      JSX output
    </text>

    <line
      x1="630"
      y1="130"
      x2="630"
      y2="173"
      className="stroke-skin-chart-3"
      strokeWidth="1.5"
      markerEnd="url(#arr-green-r)"
    />
    <line
      x1="630"
      y1="227"
      x2="630"
      y2="293"
      className="stroke-skin-chart-3"
      strokeWidth="1.5"
      markerEnd="url(#arr-green-r)"
    />

    <text
      x="630"
      y="366"
      textAnchor="middle"
      className="fill-skin-placeholder"
      style={{ fontSize: 12, fontStyle: "italic" }}
    >
      Top to bottom. No simulation.
    </text>

    <rect
      x="538"
      y="418"
      width="12"
      height="12"
      rx="3"
      className="fill-skin-chart-3"
      opacity="0.8"
    />
    <text
      x="630"
      y="426"
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-skin-placeholder"
      style={{ fontSize: 11 }}
    >
      Unidirectional data flow
    </text>
  </svg>
);

const UseEffectVsDerived = () => (
  <div className="flex flex-col gap-6 lg:flex-row lg:gap-6 lg:items-stretch">
    <div className="min-w-0 w-full lg:w-1/2 lg:min-w-0">
      <WithUseEffectSvg />
    </div>
    <div className="min-w-0 w-full lg:w-1/2 lg:min-w-0">
      <DerivedStateSvg />
    </div>
  </div>
);

export default UseEffectVsDerived;
