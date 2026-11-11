---
name: Precision Spec Dark
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#c2c6d8'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#8c90a1'
  outline-variant: '#424656'
  surface-tint: '#b3c5ff'
  primary: '#b3c5ff'
  on-primary: '#002b75'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#0054d6'
  secondary: '#a5e7ff'
  on-secondary: '#003543'
  secondary-container: '#00d2ff'
  on-secondary-container: '#00566a'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#008259'
  on-tertiary-container: '#e1ffec'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#b6ebff'
  secondary-fixed-dim: '#47d6ff'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e60'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  label-xs:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets power users, tech enthusiasts, industry analysts, and prospective device buyers seeking authoritative, instant device specifications and side-by-side technical breakdowns. The emotional posture is utilitarian precision: rapid, frictionless, and data-dense without visual exhaustion.

The aesthetic fuses modern high-contrast dark mode with structured, technical minimalism. Deep charcoal canvases prevent eye strain across extended reading sessions, while high-voltage cyan and turquoise accents illuminate active pathways and interactive levers. Visual clutter is stripped away in favor of strict alignment, calibrated tabular hierarchy, micro-surfaces, and clear contextual badges that guide comparison decisions at a glance.

## Colors

The palette leverages a calibrated dark-mode hierarchy to organize dense technical matrices:

- **Canvas & Elevation**: Base canvas is `#0B0F17` (Deep Slate Charcoal), stepping up to `#141B28` for elevated card containers, `#1B2436` for hovered/nested micro-containers, and `#232F45` for structural boundaries and table grid borders.
- **Accents**: Primary interactive elements rely on `#0066FF` (Electric Royal) for solid affordances and `#00D2FF` (Cyan Glow) for focus states, tabular metric highlights, and active segment tabs.
- **Semantic Accents**: `#10B981` (Emerald) is reserved for top battery endurance scores, class-leading camera ratings, and lowest verified vendor prices. `#F59E0B` (Amber) signals trade-offs, warnings, or unverified leaks.
- **Text & Data Contrast**: Primary data readout is `#F1F5F9`, muted secondary descriptors are `#94A3B8`, and disabled or structural captions are `#64748B`.

## Typography

The type system runs exclusively on Inter with open font features: tabular numbers (`tnum`) and slashed zeros (`zero`) must be forced on all spec displays, benchmark numbers, frequencies, and dimensions.

Headings maintain a tight vertical footprint to preserve above-the-fold screen real estate. Small labels and data badges rely on upper-case or condensed letter tracking (`0.03em` to `0.06em`) to ensure instant legibility against dark slate backgrounds even at 10px and 11px scales.

## Layout & Spacing

A compact mobile-first fluid layout forms the backbone of the platform:

- **Mobile (< 768px)**: 4-column layout with `1rem` (16px) margins and `0.75rem` (12px) gutters. Comparison tables lock the left attribute column (`104px` wide) while device columns swipe horizontally.
- **Tablet (768px - 1024px)**: 8-column fluid layout with `1.25rem` margins and `1rem` gutters, facilitating 2-way device comparisons side-by-side.
- **Desktop (> 1024px)**: 12-column grid capped at `1440px` max-width with `1.5rem` margins and gutters, accommodating up to 4-way spec matrix comparisons with zero horizontal scrolling.
- **Component Flow**: Spacing rhythm prioritizes information density using compact vertical steps (`space-xs` and `space-sm` for table rows and metadata tags; `space-md` for standard card interiors).

## Elevation & Depth

This system avoids heavy, blurry drop shadows that wash out dark interfaces. Depth is communicated strictly via tonal layering and precision hairline outlines:

- **Level 0 (Base Canvas)**: Background `#0B0F17`.
- **Level 1 (Surface Cards & Tiles)**: Background `#141B28` with a 1px border of `#232F45`. No ambient shadow.
- **Level 2 (Dropdowns, Overlays & Sticky Nav)**: Background `#141B28` at 92% opacity with `backdrop-filter: blur(12px)`, bordered by `#2E3D5B`, elevated by a directional contact shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.6)`.
- **Level 3 (Modal Sheets & Full-screen Search Takeovers)**: Background `#0F1622` bordered by `#3B4C6E` with shadow: `0 20px 40px -8px rgba(0, 0, 0, 0.8)`.
- **Interactive Focus Rings**: 2px solid ring using `#00D2FF` with a 1px inner offset of `#0B0F17`.

## Shapes

Shapes reflect precision-milled hardware aesthetics. A crisp, soft roundedness standard (`4px` base) is enforced across structural panels, table headers, and inputs. 

Pill rounding (`9999px`) is reserved solely for categorical metadata chips, brand identifiers, status indicators, and comparison slot tags ('Device 1', 'Trending') to create clear visual separation between functional layout containers and contextual tags.

## Components

### Device Cards
- **Structure**: Surface `#141B28`, 1px border `#232F45`, border-radius `0.25rem`.
- **Anatomy**: Top bar contains a mini brand pill (`Samsung`, `Apple`) and an absolute-positioned top-right bookmark/favorite icon button (`28x28px`). Center features a transparent product render (`120px` height) over a subtle radial vignette. Bottom stack contains a 2-line title, 3 horizontal icon-spec rows (Chipset, Battery, Camera in `12px` tabular font), and a bottom-aligned base price badge.

### Sticky Mobile Header & Search Bar
- **Header**: Height `56px`, fixed top, background `#0B0F17/90` with `backdrop-filter: blur(16px)`, border-bottom `1px solid #232F45`.
- **Search Field**: Height `38px`, background `#141B28`, inset icon `#64748B`, placeholder "Search 12,000+ phones, chips, specs...". On focus, expand into an instant-suggestion flyout listing top matching devices with release years and micro-thumbnails.
- **Actions**: Left hamburger icon (`24px`), right comparison quick-counter badge showing active compared items.

### Spec Highlight Tiles
- **Format**: 2x2 or 4x1 dashboard grids at the head of device pages.
- **Anatomy**: Background `#182232`, border `1px solid #283750`, padding `0.75rem`. Top row displays an uppercase label (`label-xs` in `#94A3B8`), middle row displays prominent stat value (`headline-md` in `#F1F5F9`), bottom row contains a micro subtext or benchmark delta.

### Badges & Micro Pills
- **Variant - Trending / New**: Border-radius `9999px`, padding `2px 8px`, `label-xs`, cyan tint (`#00D2FF/15` background, `#00D2FF` text).
- **Variant - Best Price / Top Rating**: Green tint (`#10B981/15` background, `#10B981` text).
- **Variant - Comparison Markers ('Device 1', 'Device 2')**: High-contrast solid fills (`#0066FF` for Device 1, `#8B5CF6` for Device 2) with white text.

### Dense Accordion Spec Tables
- **Section Headers**: Sticky within viewport, background `#101724`, text `label-md` uppercase in `#00D2FF`, chevron on right edge.
- **Table Grid**: Rows alternate between `#141B28` and `#0E141F`. Borders are `1px solid #1D2638`.
- **Label Column**: Fixed width `28%` (mobile `96px`), font `label-sm` in `#94A3B8`.
- **Value Columns**: Font `body-sm` in `#F1F5F9` with tabular numbers enabled. Differing values between compared devices feature an inline highlight border on the left edge.

### Bottom Action Tray
- **Format**: Fixed viewport bottom, height `64px`, background `#141B28/95` with top hairline `#232F45`.
- **Action Set**: Quick "Add to Compare" button with slot indicator, "Share Specs" ghost button, and high-emphasis "View Deals" primary solid cyan button.