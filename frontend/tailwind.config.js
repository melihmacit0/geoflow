/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        error: '#ba1a1a',
        'on-tertiary': '#ffffff',
        tertiary: '#2d1100',
        'error-container': '#ffdad6',
        'secondary-fixed-dim': '#f3be65',
        'outline-variant': '#c4c6d0',
        'surface-dim': '#dbd9de',
        'on-secondary': '#ffffff',
        'inverse-on-surface': '#f1f0f5',
        'on-surface-variant': '#44474f',
        'tertiary-fixed-dim': '#ffb689',
        'inverse-surface': '#2f3034',
        outline: '#747780',
        surface: '#faf8fd',
        'on-background': '#1a1b1f',
        'surface-container-low': '#f4f3f8',
        'tertiary-fixed': '#ffdbc8',
        'on-secondary-fixed-variant': '#604100',
        'tertiary-container': '#4d2100',
        'primary-container': '#0f2c5c',
        'on-surface': '#1a1b1f',
        primary: '#00173d',
        'on-secondary-container': '#785300',
        'on-primary-fixed-variant': '#2d4677',
        'secondary-fixed': '#ffdeac',
        'secondary-container': '#ffc96f',
        'surface-tint': '#455e90',
        'inverse-primary': '#aec6ff',
        'on-primary-container': '#7d95cb',
        'primary-fixed-dim': '#aec6ff',
        'on-tertiary-fixed-variant': '#6c3915',
        'surface-container-highest': '#e3e2e7',
        'on-tertiary-container': '#c9855a',
        background: '#faf8fd',
        secondary: '#7e5700',
        'on-secondary-fixed': '#281900',
        'primary-fixed': '#d8e2ff',
        'on-primary-fixed': '#001a42',
        'surface-container-high': '#e9e7ec',
        'surface-container': '#efedf2',
        'on-tertiary-fixed': '#321300',
        'on-error': '#ffffff',
        'surface-bright': '#faf8fd',
        'on-error-container': '#93000a',
        'on-primary': '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-variant': '#e3e2e7',
        gold: '#D4A24C'
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '9999px'
      },
      spacing: {
        gutter: '32px',
        'section-gap': '120px',
        base: '4px',
        'stack-sm': '8px',
        'stack-lg': '24px',
        'stack-md': '16px',
        'margin-page': '64px'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        'body-md': ['Inter'],
        'label-caps': ['Inter'],
        h3: ['Inter'],
        'body-lg': ['Inter'],
        'hero-display': ['Inter'],
        h2: ['Inter'],
        h1: ['Inter']
      },
      fontSize: {
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '1.2', letterSpacing: '0.1em', fontWeight: '600' }],
        h3: ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'hero-display': ['60px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        h2: ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        h1: ['48px', { lineHeight: '1.2', fontWeight: '700' }]
      }
    }
  },
  plugins: []
};
