/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind scans authored app files so generated folders do not affect class output.
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Design tokens mirror DESIGN.md Sections 1-3 and keep raw hex values out of components.
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-tint': 'var(--color-primary-tint)',
        'primary-disabled': 'var(--color-primary-disabled)',
        canvas: 'var(--color-canvas)',
        'page-warm': 'var(--color-page-warm)',
        'surface-soft': 'var(--color-surface-soft)',
        'surface-strong': 'var(--color-surface-strong)',
        'surface-dark': 'var(--color-surface-dark)',
        'surface-dark-elevated': 'var(--color-surface-dark-elevated)',
        hairline: 'var(--color-hairline)',
        ink: 'var(--color-ink)',
        body: 'var(--color-body)',
        muted: 'var(--color-muted)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      // Font families match the display, UI, and metric roles from DESIGN.md Section 2.
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // Radius values are restrained and avoid pill-shaped controls.
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      // The single approved shadow tier from DESIGN.md Section 3.
      boxShadow: {
        float: 'var(--shadow-float)',
      },
      // Named spacing keeps layout rhythm on the 4px base unit from DESIGN.md.
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        base: '16px',
        md: '20px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        section: '96px',
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
}
