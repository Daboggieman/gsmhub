---
name: Precision Spec Light
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#424656'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#727687'
  outline-variant: '#c2c6d8'
  surface-tint: '#0054d6'
  primary: '#0050cb'
  on-primary: '#ffffff'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#b3c5ff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#006645'
  on-tertiary: '#ffffff'
  tertiary-container: '#008259'
  on-tertiary-container: '#e1ffec'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-mono:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for dense technical telemetry, laboratory device benchmarking, and exhaustive hardware specification databases. Built on principles of instrumentation consoles, laboratory readouts, and metrology calibration tools, the visual aesthetic prioritizes instant legibility, structural clarity, and high-density information layout without visual exhaustion.

The target audience encompasses hardware engineers, device benchmarks analysts, technical journalists, and detail-oriented consumers. The interface evokes feelings of surgical precision, technical authority, and calibration confidence. Every visual element follows an exacting hierarchy where data points, metric units, tolerance tolerances, and delta values are explicitly articulated through rigorous alignment, micro-typography, and crisp hairline division.

## Colors

The palette is anchored in an uncompromising clinical white foundation, utilizing high-contrast cool-slate ink and metrological indicator dyes.

- **Primary Metrology Blue (`#0066ff`):** Designates active states, primary actions, focused benchmarks, and key structural highlights.
- **Secondary Telemetry Cyan (`#0284c7`):** Marks real-time telemetry streams, active sensor readouts, and frequency sweeps.
- **Tertiary Calibration Emerald (`#10b981`):** Applied to validated metrics, passed conformance tests, nominal operational thresholds, and factory-calibrated marks.
- **Thermal Alert Amber (`#f59e0b`):** Denotes throttling, elevated thermal registers, tolerance deviations, or warnings.
- **Critical Deviation Red (`#ef4444`):** Flags catastrophic thresholds, failed assertions, and out-of-spec readings.
- **Neutral Core:** Canvas base begins at pure white (`#ffffff`), layering up through technical container surfaces (`#f8fafc`, `#f1f5f9`), framed by structural technical borders (`#e2e8f0`, `#cbd5e1`). Primary data registers appear in deep slate (`#0f172a`), with secondary metrics, technical units, and keys in muted slate (`#475569`, `#64748b`).

## Typography

The type hierarchy is configured exclusively in Inter with font-feature settings configured for dense technical reading: tabular numbers (`tnum`), slashed zero (`zero`), and precise fractions (`frac`). 

- Numeric telemetry, benchmarks, hex codes, and frequency bands must enforce tabular alignment (`font-variant-numeric: tabular-nums`) to prevent optical shifts across live stream updates.
- Micro-labels, spec parameter keys, and calibration statuses use uppercase treatments with expanded tracking (`+0.04em`) to maintain crisp optical separation at 10px–11px scale.
- Section headers remain compact and low-profile to preserve maximum vertical space for data matrices and comparative tables.

## Layout & Spacing

The layout model is driven by a rigid 12-column modular grid optimized for side-by-side spec comparison, multi-channel telemetry streams, and hardware property sheets. 

- **Desktop (1280px+):** 12-column fluid grid, 1.5rem outer canvas margin, 1rem column gutters. Side rails accommodate nested architectural indexes, pin-out diagrams, or diagnostic parameter selectors.
- **Tablet (768px - 1279px):** 8-column layout with 1rem margins and gutters. Spec tables prioritize horizontal scrolling with sticky primary hardware key identifiers.
- **Mobile (<768px):** 4-column layout with 1rem screen edge margin and 0.75rem gutters. Complex multi-column tables collapse into vertical attribute-value pair matrices.
- **Spatial Rhythm:** Spacing adopts a compact 4px base increment (`0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`). Information packing is dense, treating horizontal and vertical padding as functional delimitations rather than decorative voids.

## Elevation & Depth

Visual hierarchy is constructed through structural surface layering and crisp mechanical hairline borders rather than heavy atmospheric shadows.

- **Surface Tiers:**
  - Base Floor: Canvas level `#ffffff`.
  - Level 1 Tier (Spec Groups, Data Cards): `#f8fafc` bounded by 1px solid `#e2e8f0`.
  - Level 2 Tier (Telemetry Insets, Readout Wells, Sub-tables): `#f1f5f9` bounded by 1px solid `#cbd5e1`.
- **Border Architecture:** Clean 1px hairlines define all cell divisions and interactive containers. No structural elements exist without explicit edge boundaries.
- **Shadow Profile:** Diffuse ambient shadows are intentionally suppressed. Overlays, tooltips, and floating diagnostic palettes use a hard-engineered micro-drop: `0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)`. Elevated inspection modals apply a crisp border (`#cbd5e1`) alongside a subdued offset: `0 10px 15px -3px rgba(15, 23, 42, 0.08)`.

## Shapes

The design system enforces a disciplined, surgical 4px corner radius across all standard interactive elements and structural panels (`roundedness: 1`).

- **Containers, Cards, Input Cells, and Buttons:** Uniform 4px radius (`rounded-sm`). This creates a precision-tooled, modular laboratory aesthetic that interlocks cleanly without the organic softness of larger consumer radiuses.
- **Micro-badges, Metric Tags, and Status Dots:** Scaled strictly to 2px or 4px corner bounds. Rounded pill treatments are explicitly forbidden to prevent visual misalignment with dense tabular data.
- **Dividers & Metric Bars:** 0px radius with crisp cutoffs to reflect engineered linearity.

## Components

### Buttons
- **Primary Action:** Solid `#0066ff` background, `#ffffff` text, 4px radius, 1px solid `#0052cc`. Focus: 2px offset ring in `#0066ff`.
- **Secondary / Metric Action:** `#ffffff` surface, `#e2e8f0` border, `#0f172a` text. Hover: `#f8fafc` background with `#cbd5e1` border.
- **Micro / Tooling Buttons:** 24px height, 11px Inter bold uppercase, 4px padding, `#f1f5f9` background with `#cbd5e1` hairline border.

### Micro-Badges & Calibration Tags
- Structural tags indicating silicon fabrication nodes (e.g., `3nm TSMC`), wireless bands, or test pass/fail states.
- Height fixed at 18px–20px. Font size 11px (`label-sm`), letter spacing `+0.04em`.
- Variants:
  - *Calibrated / Pass:* `#ecfdf5` surface, `#10b981` text, 1px solid `#a7f3d0`.
  - *Active Stream:* `#f0f9ff` surface, `#0284c7` text, 1px solid `#bae6fd`.
  - *Thermal Warning:* `#fffbeb` surface, `#d97706` text, 1px solid `#fde68a`.
  - *Static Spec / Neutral:* `#f1f5f9` surface, `#475569` text, 1px solid `#e2e8f0`.

### Data Tables & Specification Grids
- Alternating or zebra-divided spec lists with fixed 1px `#e2e8f0` borders.
- Left column (Parameter Key): 12px Inter semi-bold, `#64748b` color, `#f8fafc` background.
- Right column (Observed Metric / Telemetry): 13px Inter regular with tabular numbers, `#0f172a` color, `#ffffff` background.
- Row heights are compact (32px default, 28px dense) with vertically centered content.

### Input Fields & Filter Triggers
- Height: 32px standard, 28px dense.
- Background `#ffffff`, border 1px solid `#cbd5e1`, 4px radius.
- Inner text: 13px Inter regular with muted `#94a3b8` placeholder.
- Focus state: Border transition to `#0066ff`, sharp 1px glow ring (`box-shadow: 0 0 0 1px #0066ff`).

### Checkboxes & Radio Controls
- Checkbox: 14x14px square, 2px radius, 1px solid `#cbd5e1`. Active: `#0066ff` fill with white geometric checkmark.
- Radio: 14x14px circle, 1px solid `#cbd5e1`. Active: White center inset inside `#0066ff` ring.

### Cards & Telemetry Containers
- Background `#f8fafc`, outer border 1px solid `#e2e8f0`, corner radius 4px.
- Card Header: Integrated toolbar separated by a 1px solid `#e2e8f0` horizontal partition, displaying metric category, lab test run timestamp, and status tag.