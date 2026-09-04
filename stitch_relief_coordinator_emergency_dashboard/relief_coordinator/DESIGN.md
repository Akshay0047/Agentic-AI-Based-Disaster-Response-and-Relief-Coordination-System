---
name: Relief Coordinator
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
  on-surface-variant: '#444653'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#396091'
  on-secondary: '#ffffff'
  secondary-container: '#a1c6fd'
  on-secondary-container: '#2a5282'
  tertiary: '#611e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#872d00'
  on-tertiary-container: '#ffa583'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#1e4877'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  display-mobile:
    fontFamily: inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  label-md:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  metric-num:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  code-sm:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
---

## Brand & Style

This design system is built for life-critical disaster relief orchestration, dynamic resource routing, and autonomous tactical response. In catastrophe zones and emergency operation centers (EOCs), human cognition is heavily taxed by acute stress, sleep deprivation, and data saturation.

The aesthetic philosophy couples tactical utilitarianism with modern institutional precision:
- **Calm Authority:** Eliminates all non-functional visual noise, decorative gradients, and frivolous motion.
- **Zero-Ambiguity Hierarchy:** Interfaces present operational priorities instantly with unambiguous visual hierarchy.
- **High-Trust Interaction:** System states, confidence intervals, and autonomous AI recommendations are communicated with transparent, auditable indicators.
- **Cognitive Ergonomics:** Generous touch targets, high text contrast against crisp surfaces, and consistent spatial logic safeguard against critical operational errors.

## Colors

The palette is engineered around instant semantic recognition and extreme legibility under harsh ambient conditions (e.g., glare in field vehicles or dark operation bunkers).

### Base & Neutral Tokens
- **Canvas Base:** `#ffffff`
- **Surface Muted:** `#f8fafc` (Slate 50)
- **Surface Recessed / Subtle:** `#f1f5f9` (Slate 100)
- **Border Default:** `#e2e8f0` (Slate 200)
- **Border Strong:** `#cbd5e1` (Slate 300)
- **Text Primary:** `#0f172a` (Slate 900) — WCAG AAA contrast for body and headers.
- **Text Secondary:** `#475569` (Slate 600) — Supplementary context, metadata.
- **Text Muted:** `#64748b` (Slate 500) — Disabled states, subtle timestamps.

### Primary Command Actions
- **Primary Base:** `#1e40af` (Command Navy)
- **Primary Hover:** `#1d4ed8`
- **Primary Active / Deep:** `#0f3d6c`
- **Primary Focus Ring:** `rgba(30, 64, 175, 0.25)`

### Semantic & Operational Severity Levels
Semantic color is reserved strictly for operational triage and telemetry states; it is never applied decoratively.
- **Urgent / Critical (Tier 1 Hazard):** Text & Fill `#dc2626`, Background `#fef2f2`, Border `#fecaca`.
- **High Severity (Tier 2 Warning):** Text & Fill `#ea580c`, Background `#fff7ed`, Border `#ffedd5`.
- **Medium Severity (Tier 3 Alert):** Text & Fill `#d97706`, Background `#fffbeb`, Border `#fef3c7`.
- **Operational Normal / Success:** Text & Fill `#16a34a`, Background `#f0fdf4`, Border `#bbf7d0`.
- **Neutral / Informational:** Text & Fill `#64748b`, Background `#f1f5f9`, Border `#e2e8f0`.
- **Autonomous AI Coordination:** Text `#3730a3`, Background `#eef2ff`, Border `#c7d2fe`, Accent `#4f46e5`.

## Typography

The type system prioritizes systematic readability, neutral character, and exact numerical alignment:

- **Primary Interface Font:** Inter is utilized across all UI tiers, headlines, body copy, and dialog structures.
- **Telemetry & Tabular Data:** All metrics, coordinates, UTC mission timers, casualty figures, and inventory tallies must enforce `font-feature-settings: "tnum" 1` or use JetBrains Mono to avoid layout shift during rapid live updates.
- **Hierarchy Rules:** Large display types are kept compact to maximize information density without claustrophobia. Body sizes do not drop below 12px for interactive elements.

## Layout & Spacing

A structured 8pt grid governed by an underlying 4pt baseline forms the layout architecture:

- **Desktop Framework (1024px+):** Fluid 12-column grid system with 24px (`space-xl`) gutters and 24px container padding. For dual-pane command consoles (map/telemetry splits), fixed navigation bars (64px collapsed, 240px expanded) pair with fluid workspace regions.
- **Tablet Reflow (768px - 1023px):** 8-column layout with 16px (`space-base`) gutters. Split views automatically collapse to stacked panels with tab toggles.
- **Field Mobile (<768px):** 4-column layout with 16px safe margins. Single-column stacked density; touch targets expand to a minimum hit area of 44x44px.
- **Rhythm Rules:** Vertical margins between related data points use `space-xs` (4px) or `space-sm` (8px); card groupings and form field boundaries enforce `space-base` (16px) or `space-xl` (24px).

## Elevation & Depth

To prevent visual clutter, this design system rejects heavy, diffuse dropped shadows in favor of **low-contrast outlines, high structural clarity, and calibrated flat surface tiers**:

- **Layer 0 (Canvas Base):** `#ffffff` or muted canvas `#f8fafc`.
- **Layer 1 (Cards, Modules, Surface Panels):** Pure white `#ffffff` encased with 1px solid border `#e2e8f0`. Subtlest ambient base shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.05)`.
- **Layer 2 (Dropdowns, Popovers, Active Cards):** Surface `#ffffff`, border `#cbd5e1`, elevated ambient shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Layer 3 (Modal Dialogs, Slide-over Shelves):** High-priority focus. Backed by modal overlay `rgba(15, 23, 42, 0.5)` with crisp boundary: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`.
- **Z-Index System:** Floor/Canvas (0), Surface Containers (10), Sticky Headers/Toolbars (100), Slide-over Drawers (200), Modals & Overlays (300), Critical Broadcast Alerts (500).

## Shapes

The design system employs disciplined geometry (`roundedness: 1`), communicating operational reliability:

- **Base Radius (6px / `rounded-md`):** Applied to buttons, text inputs, segmented controllers, and small panels.
- **Card & Modal Radius (8px / `rounded-lg`):** Boundary containment for data panels, operational dashboards, map HUD modules, and dialog boxes.
- **Pill Geometry (`rounded-full`):** Reserved exclusively for status indicators, operational severity tags, micro-badges, and live dispatch counters.

## Components

### 1. Buttons
- **Primary Action:** Solid background `#1e40af`, white text, 6px radius. Height: 36px (compact) or 42px (standard). Padding: 12px horizontal. Hover: `#1d4ed8`. Active: `#0f3d6c`. Focus: 2px offset ring `#1e40af`.
- **Secondary / Tactical Neutral:** Background `#ffffff`, border 1px solid `#e2e8f0`, text `#0f172a`. Hover: `#f8fafc`, border `#cbd5e1`.
- **Destructive / Emergency Override:** Background `#dc2626`, text `#ffffff`. Hover: `#b91c1c`. Focus ring: `rgba(220, 38, 38, 0.3)`.

### 2. Status Chips & Pill Badges
- Strict semantic matching: 20px height, 8px horizontal padding, pill-shaped (`rounded-full`), font size 11px with bold tracking (`label-sm`).
- **Critical:** Background `#fef2f2`, text `#dc2626`, border 1px solid `#fecaca`. Includes 6px pulse dot for real-time unresolved threats.
- **Operational:** Background `#f0fdf4`, text `#16a34a`, border 1px solid `#bbf7d0`.

### 3. Inputs & Form Fields
- Surface: `#ffffff`, 1px solid border `#cbd5e1`, 6px radius. Height: 38px. Text: `#0f172a`, placeholder: `#64748b`.
- **Focused:** Border 1px solid `#1e40af`, outline 3px solid `rgba(30, 64, 175, 0.15)`.
- **Error State:** Border 1px solid `#dc2626`, focus ring `rgba(220, 38, 38, 0.15)`.

### 4. Data Tables & Data Grids
- Designed for high telemetry density. Row height: 40px (compact) or 48px (standard).
- Table header: `#f8fafc`, text `#475569`, 11px uppercase weight 600, border-bottom 1px solid `#e2e8f0`.
- Rows: Clean borders `#e2e8f0` between rows; subtle zebra striping using `#f8fafc` on alternate rows for large tables.
- All numbers, dates, and coordinates right-aligned with JetBrains Mono or tabular figures.

### 5. Cards & Operational Units
- Background `#ffffff`, border 1px solid `#e2e8f0`, 8px radius.
- Header divided by 1px subtle divider `#f1f5f9` with embedded severity or action tray.

### 6. Modal Dialogs & Slide-overs
- **Slide-overs:** Right-anchored sheet (widths: 440px or 640px), 1px solid border-left `#cbd5e1`, zero-radius edges on screen seams, full height.
- **Modals:** Centered, 8px radius, prominent mission confirmation header with non-destructive escape paths.

### 7. AI Coordination & Reasoning Callouts
- Specialized container signaling autonomous agent recommendations and algorithmic resource allocation.
- Container: Background `#eef2ff`, border 1px solid `#c7d2fe`, 8px radius.
- Header: Displays an AI spark badge with `[AGENT AUTONOMY: LEVEL 2]` label in `#3730a3`, JetBrains Mono.
- Confidence score bar: Integrated 4px micro-gauge indicating probability and algorithmic rationale before dispatch confirmation.