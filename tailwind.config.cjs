function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    // Remove the following screen breakpoint or add other breakpoints
    // if one breakpoint is not enough for you
    

    extend: {
      colors: {
        riso: {
          red: "#E8453C",
          blue: "#0078BF",
          yellow: "#FFB511",
          green: "#00A95C",
          pink: "#F5A0B1",
          orange: "#F47A2D",
          violet: "#7B68AE",
          black: "#1A1A2E",
          cream: "#F5F0E8",
          cork: "#C4A97D",
        },
      },
      spacing: {
        "spacing": "var(--spacing)",
      },
      textColor: {
        skin: {
          base: withOpacity("--color-text-base"),
          foreground: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-fill"),
          cork: withOpacity("--color-cork"),
          "card-muted": withOpacity("--color-card-muted"),
          placeholder: withOpacity("--color-placeholder"),
          "chart-1": withOpacity("--color-chart-1"),
          "chart-2": withOpacity("--color-chart-2"),
          "chart-3": withOpacity("--color-chart-3"),
          "toast-success": withOpacity("--color-toast-success-icon"),
          "toast-error": withOpacity("--color-toast-error-icon"),
          "toast-info": withOpacity("--color-toast-info-icon"),
        },
      },
      backgroundColor: {
        skin: {
          fill: withOpacity("--color-fill"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-text-base"),
          card: withOpacity("--color-card"),
          cork: withOpacity("--color-cork"),
          "card-muted": withOpacity("--color-card-muted"),
          "chart-1": withOpacity("--color-chart-1"),
          "chart-2": withOpacity("--color-chart-2"),
          "chart-3": withOpacity("--color-chart-3"),
          "toast-success": withOpacity("--color-toast-success-bg"),
          "toast-error": withOpacity("--color-toast-error-bg"),
          "toast-info": withOpacity("--color-toast-info-bg"),
        },
      },
      outlineColor: {
        skin: {
          fill: withOpacity("--color-accent"),
        },
      },
      ringOffsetColor: {
        skin: withOpacity("--color-ring-offset"),
      },
      ringColor: {
        skin: {
          line: withOpacity("--color-border"),
          accent: withOpacity("--color-accent"),
          fill: withOpacity("--color-text-base"),
        },
      },
      placeholderColor: {
        skin: withOpacity("--color-placeholder"),
      },
      caretColor: {
        skin: {
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
      },
      borderColor: {
        skin: {
          line: withOpacity("--color-border"),
          fill: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
          cork: withOpacity("--color-cork"),
          "card-muted": withOpacity("--color-card-muted"),
          "chart-1": withOpacity("--color-chart-1"),
          "chart-2": withOpacity("--color-chart-2"),
          "chart-3": withOpacity("--color-chart-3"),
          "toast-success": withOpacity("--color-toast-success-border"),
          "toast-error": withOpacity("--color-toast-error-border"),
          "toast-info": withOpacity("--color-toast-info-border"),
        },
      },
      fill: {
        skin: {
          fill: withOpacity("--color-fill"),
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
          card: withOpacity("--color-card"),
          cork: withOpacity("--color-cork"),
          "card-muted": withOpacity("--color-card-muted"),
          placeholder: withOpacity("--color-placeholder"),
          "chart-1": withOpacity("--color-chart-1"),
          "chart-2": withOpacity("--color-chart-2"),
          "chart-3": withOpacity("--color-chart-3"),
        },
        transparent: "transparent",
      },
      stroke: {
        skin: {
          line: withOpacity("--color-border"),
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
          cork: withOpacity("--color-cork"),
          "card-muted": withOpacity("--color-card-muted"),
          "chart-1": withOpacity("--color-chart-1"),
          "chart-2": withOpacity("--color-chart-2"),
          "chart-3": withOpacity("--color-chart-3"),
        },
      },
      /* The Bold Manual: be explicit about intent.
       * - sans: UI sans stack (for components/demos that want “app UI”)
       * - body: Lora serif stack (long-form reading)
       * - heading/serif: Zilla Slab serif stack
       * - display: Archivo Black (stamped headlines)
       */
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        serif: ["Zilla Slab", "Georgia", "serif"],
        display: ["Archivo Black", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Zilla Slab", "Georgia", "serif"],
        body: ["Lora", "Georgia", "ui-serif", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      /* Modular scale — major third (1.25); rem values harmonize display vs body */
      fontSize: {
        "type-2xs": ["0.64rem", { lineHeight: "1.5" }],
        "type-xs": ["0.8rem", { lineHeight: "1.55" }],
        "type-sm": ["1rem", { lineHeight: "1.65" }],
        "type-md": ["1.25rem", { lineHeight: "1.5" }],
        "type-lg": ["1.563rem", { lineHeight: "1.45" }],
        "type-xl": ["1.953rem", { lineHeight: "1.35" }],
        "type-2xl": ["2.441rem", { lineHeight: "1.25" }],
        "type-3xl": ["3.052rem", { lineHeight: "1.15" }],
        "type-4xl": ["3.815rem", { lineHeight: "1.1" }],
      },

      boxShadow: {
        skin: {
          sm: "0 1px 2px 0 rgba(var(--color-shadow), 0.06)",
          DEFAULT:
            "0 1px 3px 0 rgba(var(--color-shadow), 0.1), 0 1px 2px -1px rgba(var(--color-shadow), 0.1)",
          md: "0 4px 6px -1px rgba(var(--color-shadow), 0.1), 0 2px 4px -2px rgba(var(--color-shadow), 0.1)",
          lg: "0 10px 15px -3px rgba(var(--color-shadow), 0.1), 0 4px 6px -4px rgba(var(--color-shadow), 0.1)",
        },
      },

      typography: {
        DEFAULT: {
          css: {
            'blockquote p:first-of-type::before': false,
            'blockquote p:first-of-type::after': false,
            maxWidth: 'var(--max-3xl)',
            lineHeight: '1.65',
            fontSize: '1rem',
            fontFamily: "'Lora', Georgia, ui-serif, serif",
            color: 'rgb(var(--color-text-base))',
            'a:hover': {
              color: 'rgb(var(--color-accent))',
            },
            p: {
              marginTop: '0.5em',
              marginBottom: '1em',
            },
            'ul, ol': {
              paddingLeft: '1.25em',
            },
            li: {
              marginBottom: '0.5em',
            },
            h1: {
              fontWeight: '400',
              letterSpacing: '-0.02em',
              fontFamily: 'Archivo Black, ui-sans-serif, system-ui, sans-serif',
              marginTop: '1.25em',
              marginBottom: '0.5em',
            },
            'h1:first-child': {
              marginTop: '0',
            },
            h2: {
              fontWeight: '600',
              letterSpacing: '-0.01em',
              fontFamily: 'Zilla Slab, Georgia, serif',
              marginTop: '1.25em',
              marginBottom: '0.5em',
            },
            'h2:first-child': {
              marginTop: '0',
            },
            h3: {
              fontWeight: '600',
              letterSpacing: '-0.01em',
              fontFamily: 'Zilla Slab, Georgia, serif',
              marginTop: '1.25em',
              marginBottom: '0.5em',
            },
            'h3:first-child': {
              marginTop: '0',
            },
            h4: {
              fontWeight: '600',
              letterSpacing: '-0.01em',
              fontFamily: 'Zilla Slab, Georgia, serif',
              marginTop: '1.25em',
              marginBottom: '0.5em',
            },
            'h4:first-child': {
              marginTop: '0',
            },
            h5: {
              fontWeight: '600',
              letterSpacing: '-0.01em',
              fontFamily: 'Zilla Slab, Georgia, serif',
              marginTop: '1.25em',
              marginBottom: '0.5em',
            },
            'h5:first-child': {
              marginTop: '0',
            },
            h6: {
              fontWeight: '600',
              letterSpacing: '-0.01em',
              fontFamily: 'Zilla Slab, Georgia, serif',
              marginTop: '1.25em',
              marginBottom: '0.5em',
            },
            'h6:first-child': {
              marginTop: '0',
            },
            code: {
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '0.9em',
              backgroundColor: 'rgba(var(--color-text-base), 0.05)',
              padding: '0.2em 0.4em',
              borderRadius: '4px',
              fontWeight: '400',
            },
            pre: {
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '0.9em',
            },
            strong: {
              color: 'inherit',
              fontWeight: '600',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              fontSize: '1em',
            },
            'blockquote, blockquote > ul, blockquote > ol': {
              fontStyle: 'normal',
              paddingLeft: '1.5em',
              paddingRight: '1.5em',
              fontSize: '0.95rem',
            },
            'blockquote > p, blockquote > ul > li, blockquote > ol > li': {
              fontFamily: 'IBM Plex Mono, monospace',
            },

            'hr': {
              borderColor: 'rgba(var(--color-text-base), var(--tw-border-opacity/2))',
              borderWidth: '1px',
              marginTop: '2em',
              marginBottom: '2em',
            },
            'img': {
              marginTop: '1em',
              marginBottom: '1em',
            },
            '.contains-task-list': {
        listStyleType: 'none',
        paddingLeft: '0',
      },
      // Target the li specifically to remove the pseudo-element bullet
      '.task-list-item': {
        listStyleType: 'none',
        display: 'flex',
        alignItems: 'flex-start',
      },
      '.task-list-item::before': {
        content: 'none !important',
      },
      '.task-list-item input[type="checkbox"]': {
        appearance: 'none',
        backgroundColor: 'transparent',
        margin: '0.3em 0.6em 0 0',
        padding: '0',
        width: '1rem',
        height: '1rem',
        border: '1px solid rgba(var(--color-text-base), 0.3)',
        borderRadius: '3px',
        position: 'relative',
        cursor: 'pointer',
      },
      // Styling the checkmark itself
      '.task-list-item input[type="checkbox"]:checked': {
        backgroundColor: 'rgb(var(--color-accent))',
        borderColor: 'rgb(var(--color-accent))',
      },
      '.task-list-item input[type="checkbox"]:checked::after': {
        content: '""',
        position: 'absolute',
        top: '1px',
        left: '4px',
        width: '4px',
        height: '8px',
        border: 'solid white',
        borderWidth: '0 2px 2px 0',
        transform: 'rotate(45deg)',
      },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
};
