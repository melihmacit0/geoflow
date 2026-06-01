---
name: Modern Globalist
colors:
  surface: '#faf8fd'
  surface-dim: '#dbd9de'
  surface-bright: '#faf8fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#efedf2'
  surface-container-high: '#e9e7ec'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#44474f'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#455e90'
  primary: '#00173d'
  on-primary: '#ffffff'
  primary-container: '#0f2c5c'
  on-primary-container: '#7d95cb'
  inverse-primary: '#aec6ff'
  secondary: '#7e5700'
  on-secondary: '#ffffff'
  secondary-container: '#ffc96f'
  on-secondary-container: '#785300'
  tertiary: '#2d1100'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d2100'
  on-tertiary-container: '#c9855a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#2d4677'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#f3be65'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#604100'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb689'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#6c3915'
  background: '#faf8fd'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  hero-display:
    fontFamily: Inter
    fontSize: 60px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 32px
  margin-page: 64px
  section-gap: 120px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The brand personality of this design system is that of a "Sophisticated Explorer"—an authoritative yet inviting curator of global experiences. It is designed for high-intent travelers who value efficiency, clarity, and a premium editorial feel. 

The aesthetic follows a **Modern Minimalist** movement. It prioritizes content through heavy whitespace, high-contrast typography, and a restricted color palette. The visual language is intentional and quiet, allowing photography and travel data to remain the focal point. The goal is to evoke a sense of calm reliability and professional precision.

## Colors

The palette is anchored by a deep navy to establish trust and professional depth. The warm gold serves as a surgical accent, used sparingly to draw attention to primary calls to action or "discovery" moments. 

The background is a curated off-white, which reduces eye strain compared to pure white and provides a more "paper-like" editorial quality. For text and UI borders, neutral tones are derived from the same warm spectrum to maintain a cohesive, high-end atmosphere.

## Typography

This design system utilizes **Inter** exclusively to lean into a functional, systematic aesthetic. The typographic hierarchy is designed for scanability. The hero headline is a bold 60px statement, commanding the user's attention immediately upon landing.

To maintain the professional look, use tighter letter spacing on larger headlines and generous line heights for body text to ensure legibility during long-form discovery reading. Label styles should utilize uppercase with tracking to differentiate metadata from interactive content.

## Layout & Spacing

This design system employs a **Fixed Grid** layout for desktop, centered within the viewport with a maximum width of 1280px. This ensures content remains legible on ultra-wide monitors. A 12-column grid is used with generous 32px gutters to prevent visual clutter.

Spacing is governed by an 8pt rhythm, but with a specific emphasis on "Macro-spacing." Large vertical gaps (120px+) between sections are encouraged to create the "generous whitespace" required for a sophisticated aesthetic. Elements should feel like they have room to breathe, avoiding cramped clusters.

## Elevation & Depth

To maintain a minimalist profile, this design system avoids heavy shadows. Depth is communicated primarily through **Low-Contrast Outlines** and **Tonal Layers**. 

Interactive cards should sit on the off-white background with a 1px border (#E5E5E0). When an element requires elevation (like a floating navigation bar or a modal), use a very diffused, low-opacity ambient shadow (Color: #0F2C5C, Opacity: 4%, Blur: 20px). This creates a "lifted" effect without the muddy appearance of traditional shadows.

## Shapes

The shape language is "Soft," utilizing a 0.25rem (4px) base radius. This subtle rounding softens the clinical nature of the deep navy and sharp typography without becoming playful or "bubbly." Larger components, such as search containers or primary images, may use the `rounded-lg` (8px) variant to provide a modern frame for photography.

## Components

### Buttons
Primary buttons use the Deep Navy background with white text. Hover states should transition to a slightly lighter tint of navy. The Gold accent color is reserved for "High Conversion" buttons, such as "Book Now" or "Save Trip."

### Input Fields
Inputs should be minimalist. Use a background-colored fill with a 1px bottom border for a clean, "form-like" appearance, or a full thin stroke for better accessibility in complex filters.

### Cards
Cards are the primary vessel for discovery. They should use a pure white background to pop against the off-white page background. Images within cards must fill the top half, with text content below utilizing the `label-caps` for location tags and `h3` for destination names.

### Chips
Used for category filtering (e.g., "Beach", "Urban", "Hiking"). These should be outlined with the neutral-mid color and use the `body-md` font size. Active chips fill with the primary navy color.

### Progress Indicators
For multi-step discovery flows, use a thin 2px gold line to indicate progress, maintaining the sophisticated, non-intrusive aesthetic.