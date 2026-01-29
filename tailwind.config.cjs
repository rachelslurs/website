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
  darkMode:  ['selector', '[data-theme="dark"]'],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    // Remove the following screen breakpoint or add other breakpoints
    // if one breakpoint is not enough for you
    screens: {
      sm: "640px",
    },

    extend: {
      textColor: {
        skin: {
          base: withOpacity("--color-text-base"),
          foreground: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-fill"),
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
          "card-muted": withOpacity("--color-card-muted"),
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
          "toast-success": withOpacity("--color-toast-success-border"),
          "toast-error": withOpacity("--color-toast-error-border"),
          "toast-info": withOpacity("--color-toast-info-border"),
        },
      },
      fill: {
        skin: {
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
        transparent: "transparent",
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
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
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")
  ],
};
