# Design

> Auto-generated and maintained by frontend-god-mode.
> Source of truth for typography, color, motion, layout, and component tokens.
> Read this before changing the interface.

## Aesthetic direction

Operational industrial dashboard: quiet blue-gray surfaces, compact procurement data, and restrained green for verified live-source status.

## Dials

- DESIGN_VARIANCE: 3 / 10
- MOTION_INTENSITY: 2 / 10
- VISUAL_DENSITY: 8 / 10

## Type stack

- Display and body: Manrope Variable
- Loaded via: `@fontsource-variable/manrope`
- Use tabular figures for dense numerical columns when adding metrics.

## Color tokens

- Canvas: `#f5f7fa`
- Primary ink: `#264163`
- Muted ink: `#71849b`
- Border: `#dce5ef`
- Primary action: `#2871d0`
- Verified/live: `#2f9b70`
- Error: `#bd6758`

No purple-to-blue gradients, pure-black shadows, or extra decorative accents.

## Motion

- Only short opacity and transform transitions.
- Drawers use the existing restrained slide-in transition.
- Respect `prefers-reduced-motion` for any future motion additions.

## Layout

- Dense desktop data table with contained horizontal overflow.
- Forms collapse from three columns to one on mobile.
- Live-source state sits directly above the filters because it changes the trust context of every row.
- Cards communicate functional grouping; do not nest cards.

## Component inventory

- Sidebar and top navigation
- Opportunity table and filter toolbar
- Live source status bar
- Detail drawer
- Manual forms, source cards, reports, notifications, and toast

## Brand voice

- Direct, factual, and procurement-specific.
- State whether data is official, manual, stale, unavailable, or incomplete.
- Never imply that engineering suitability or bidding decisions are automated.

## Accessibility floor

- WCAG 2.2 AA body contrast
- Visible focus rings
- Labeled form controls
- Live status uses `role="status"`, `aria-live`, and `aria-busy`
- Minimum 44px mobile touch targets for new controls

## Last updated

2026-09-30 — Added the official procurement feed status and refresh workflow.
