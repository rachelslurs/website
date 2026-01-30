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
    

    extend: {
      spacing: {
        "spacing": "var(--spacing)",
      },
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
        sans: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
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
            lineHeight: '1.75',
            fontSize: '1.1rem',
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
            'h1, h2, h3, h4, h5, h6': {
              fontWeight: '600',
              letterSpacing: '-0.003em',
            },
            code: {
              fontFamily: 'IBM Plex Mono, monospace',
              backgroundColor: 'rgba(var(--color-text-base), 0.05)',
              padding: '0.2em 0.4em',
              borderRadius: '4px',
              fontWeight: '400',
            },
            strong: {
              color: 'inherit',
              fontWeight: '600',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
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
