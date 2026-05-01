# Kooler Widget — Neumorphic Redesign Plan

Last updated: 2026-03-05 (file mtime; original drafting date)
Filed under `docs/plans/` 2026-05-01 by fortress restructure.

**Status**: Plan only — no code changes made yet
**Goal**: Replace Glassmorphism (blur/rgba) with Neumorphism (soft shadows extruding from base) to match dashboard design language

---

## Design System Summary

### Current: Glassmorphism
- `backdrop-filter: blur(28–32px)`
- `background: rgba(255,255,255,0.28–0.55)`
- `border: 1px solid rgba(255,255,255,0.4–0.9)`
- Drop shadows only: `box-shadow: 0 8px 32px rgba(0,0,0,0.12)`
- Feels: frosted glass, translucent, floats over page content

### Target: Neumorphism (Soft UI)
- Solid background base — no transparency, no blur
- Two-shadow technique: one dark (lower-right), one light (upper-left)
- Raised elements push OUT; pressed/input elements are INSET
- Feels: soft clay, tactile, physical — matches ops dashboard exactly

---

## New CSS Design Tokens (go in `index.css`)

```css
/* Replace --weggy-glass-* variables with these */
--w-bg:     #ece8e2;   /* warm off-white base — same warmth as dashboard */
--w-dark:   #c9c4be;   /* shadow color (darker than bg) */
--w-light:  #ffffff;   /* highlight color (lighter than bg) */
--w-orange: #E8713A;   /* brand orange — unchanged */
--w-orange-hover: #D4622A;

/* Shadow recipes */
--w-shadow-flat:    4px 4px 10px var(--w-dark), -4px -4px 10px var(--w-light);
--w-shadow-raised:  6px 6px 14px var(--w-dark), -4px -4px 10px var(--w-light);
--w-shadow-pressed: inset 3px 3px 8px var(--w-dark), inset -2px -2px 6px var(--w-light);
--w-shadow-sm-flat: 3px 3px 7px var(--w-dark), -2px -2px 6px var(--w-light);
--w-shadow-sm-raised: 4px 4px 8px var(--w-dark), -3px -3px 7px var(--w-light);
--w-shadow-orange:  4px 4px 10px rgba(180,80,20,0.35), -2px -2px 6px rgba(255,200,150,0.4);
```

Remove: `--weggy-glass-bg`, `--weggy-glass-border`, `--weggy-glass-blur`, `--weggy-shadow-glass`
Remove utility classes: `.glass`, `.glass-panel`
Add utility classes: `.nm-flat`, `.nm-raised`, `.nm-pressed`, `.nm-orange`

---

## File-by-File Changes

### 1. `src/index.css`
- Replace glass design token block with nm tokens above
- Remove `.glass` and `.glass-panel` utility classes
- Add `.nm-flat`, `.nm-raised`, `.nm-pressed`, `.nm-orange` utility classes
- Update scrollbar thumb: `background: var(--w-dark)` (instead of rgba)

### 2. `ChatWidget.tsx` — STYLES string
**`.widget-panel`**:
- REMOVE: `background: rgba(255,255,255,0.28)`, `backdrop-filter: blur(28px)`, `border: none`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-raised);`
- Keep: `border-radius: 32px`, `overflow: hidden`

**`.widget-error-retry`** (orange pill button):
- ADD: `box-shadow: var(--w-shadow-orange);`

**`.widget-loading-spinner`**:
- No change needed (already `color: #E8713A`)

### 3. `ChatHeader.tsx` — STYLES string
**`.chat-header`**:
- Already `background: transparent` — keep (inherits widget-panel bg)

**`.chat-header-avatar`**:
- REMOVE: `box-shadow: 0 3px 10px rgba(0,0,0,0.15)`
- ADD: `box-shadow: var(--w-shadow-sm-raised);`

**`.chat-header-title h1`**:
- REMOVE: `text-shadow: 0 2px 4px rgba(0,0,0,0.3)` (glassmorphism era, looks bad on solid bg)
- ADD: `color: #2d2926;` (darker text on warm bg)

**`.chat-header-title p`**:
- REMOVE: `text-shadow: 0 1px 2px rgba(0,0,0,0.15)`
- Change: `color: rgba(0,0,0,0.55)` → `color: #7a6e67`

**`.chat-header-close`**:
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-sm-flat);`
- Hover: `box-shadow: var(--w-shadow-pressed); background: var(--w-bg);` (pressed look on hover)

### 4. `MessageBubble.tsx` — STYLES string
**`.message-avatar-user`**:
- REMOVE: `background: #e5e7eb`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-sm-raised);`

**`.message-avatar-assistant`**:
- Keep: `background: #E8713A`
- CHANGE: `box-shadow: 0 3px 10px rgba(0,0,0,0.25)` → `box-shadow: var(--w-shadow-orange);`

**`.message-bubble`**:
- REMOVE: `box-shadow: 0 3px 12px rgba(0,0,0,0.2)`

**`.message-bubble-user`**:
- REMOVE: `background: rgba(255,255,255,0.5)`, `backdrop-filter: blur(12px)`, `border`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-raised);`

**`.message-bubble-assistant`**:
- REMOVE: `background: rgba(255,255,255,0.55)`, `backdrop-filter: blur(12px)`, `border`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-flat);`
- Note: slightly flatter than user to visually distinguish

**`.message-text`**:
- REMOVE: `text-shadow: 0 1px 2px rgba(0,0,0,0.15)`
- CHANGE color: `rgba(0,0,0,0.8)` → `#2d2926` (warm near-black)

### 5. `ChatInput.tsx` — STYLES string
**`.chat-input-form`** (the pill input container):
- REMOVE: `background: rgba(255,255,255,0.95)`, `box-shadow: 0 5px 20px rgba(0,0,0,0.3)`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-pressed);`
- This makes the input look RECESSED / carved in — classic nm input treatment

**`.chat-input-textarea`**:
- No change (already transparent bg, inherits from form)

**`.chat-input-send`** (orange circle button):
- CHANGE: `box-shadow: 0 4px 14px rgba(0,0,0,0.35)` → `box-shadow: var(--w-shadow-orange);`
- Hover: Keep `background: #D4622A`; add `box-shadow: var(--w-shadow-pressed)` (press in on hover)

### 6. `CollapsedBar.tsx` — STYLES string
**`.collapsed-bar-wrapper`**:
- REMOVE: `background: rgba(180,180,180,0.35)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.4)`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-raised);`
- Keep: `border-radius: 9999px`, `cursor: pointer`, `transition`

**`.collapsed-bar-pill`**:
- REMOVE: `background: rgba(255,255,255,0.35)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.5)`, `box-shadow: inset 0 1px 2px rgba(255,255,255,0.4)`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-sm-flat);`
- Keep: `border-radius: 9999px`

**`.collapsed-bar-cta`** (orange START pill):
- ADD: `box-shadow: var(--w-shadow-orange);`

**`.collapsed-bar-avatar`**:
- CHANGE: `box-shadow: 0 2px 8px rgba(0,0,0,0.12)` → `box-shadow: var(--w-shadow-sm-raised);`

**Hover on `.collapsed-bar-wrapper`**:
- CHANGE: `box-shadow: 0 4px 20px rgba(0,0,0,0.12)` → `box-shadow: var(--w-shadow-flat);` (slightly flatten on hover to feel grounded)

### 7. `SuggestionChips.tsx` — STYLES string
**`.suggestion-chips-label`**:
- CHANGE: `color: rgba(0,0,0,0.5)` → `color: #7a6e67`

**`.suggestion-chip`**:
- REMOVE: `background: rgba(255,255,255,0.55)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.7)`, `box-shadow: 0 3px 12px rgba(0,0,0,0.2)`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-sm-raised);`
- CHANGE: `color: rgba(0,0,0,0.75)` → `color: #4a3f3a`

**`.suggestion-chip:hover`**:
- CHANGE: `background: rgba(255,255,255,0.75)` → `box-shadow: var(--w-shadow-pressed); background: var(--w-bg);`
- Keep: `border-color: #E8713A; color: #E8713A`
- Note: Remove box-shadow from hover since we replace with pressed

### 8. `CallbackCTA.tsx` — STYLES string
**`.callback-cta::before`** (divider line):
- CHANGE: `background: rgba(255,255,255,0.7)` → `background: var(--w-dark);` (nm divider = subtle groove)

**`.callback-cta-text`**:
- REMOVE: `text-shadow: 0 2px 4px rgba(0,0,0,0.3)`

**`.callback-cta-btn`**:
- CHANGE: `box-shadow: 0 5px 18px rgba(0,0,0,0.35)` → `box-shadow: var(--w-shadow-orange);`
- REMOVE: `text-shadow: 0 1px 3px rgba(0,0,0,0.3)`
- Hover: ADD `box-shadow: 2px 2px 6px rgba(180,80,20,0.35), -1px -1px 4px rgba(255,200,150,0.3);` (slightly pressed)

### 9. `CallbackForm.tsx` — STYLES string
**`.cb-form-title`**:
- REMOVE: `text-shadow: 0 2px 4px rgba(0,0,0,0.15)`
- CHANGE: `color: #000` → `color: #2d2926`

**`.cb-form-field input, .cb-form-field select`**:
- REMOVE: `background: rgba(255,255,255,0.7)`, `border: 1px solid rgba(255,255,255,0.9)`, `box-shadow: 0 2px 6px rgba(0,0,0,0.05)`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-pressed); border: none;`

**Focus state**:
- CHANGE: `background: rgba(255,255,255,0.9); border-color: #E8713A; box-shadow: 0 0 0 2px rgba(232,113,58,0.2)`
- → `background: var(--w-bg); box-shadow: var(--w-shadow-pressed), 0 0 0 2px rgba(232,113,58,0.3); border: none;`

**`.cb-consent`**:
- REMOVE: `background: rgba(255,255,255,0.6)`, `border: 1px solid rgba(255,255,255,0.85)`, `box-shadow: 0 2px 8px rgba(0,0,0,0.06)`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-sm-flat); border: none;`

**`.cb-btn-cancel`**:
- REMOVE: `background: rgba(255,255,255,0.75)`, `border: 1px solid rgba(0,0,0,0.12)`, `box-shadow: 0 2px 6px rgba(0,0,0,0.06)`
- ADD: `background: var(--w-bg); box-shadow: var(--w-shadow-sm-raised); border: none;`
- Hover: `box-shadow: var(--w-shadow-pressed);`

**`.cb-btn-submit`**:
- CHANGE: `box-shadow: 0 3px 10px rgba(0,0,0,0.2)` → `box-shadow: var(--w-shadow-orange);`
- REMOVE: `text-shadow: 0 1px 2px rgba(0,0,0,0.15)`
- Hover: `box-shadow: 2px 2px 6px rgba(180,80,20,0.35), -1px -1px 4px rgba(255,200,150,0.3);`

**`.cb-portrait`**:
- CHANGE: `box-shadow: 0 6px 20px rgba(0,0,0,0.22)` → `box-shadow: var(--w-shadow-raised);`

---

## Execution Order
1. `index.css` — swap design tokens, remove glass classes, add nm utilities
2. `ChatWidget.tsx` — panel background (most visible, sets the tone)
3. `CollapsedBar.tsx` — what users see first
4. `ChatInput.tsx` — recessed input (most impactful nm treatment)
5. `MessageBubble.tsx` — message bubbles
6. `ChatHeader.tsx` — header details
7. `SuggestionChips.tsx` — chips
8. `CallbackCTA.tsx` — CTA bar
9. `CallbackForm.tsx` — form inputs

---

## Visual Diff: Before vs After

| Element | Before (Glass) | After (Nm) |
|---|---|---|
| Widget panel | `rgba(255,255,255,0.28)` + blur | `#ece8e2` + raised shadow |
| Input bar | White pill + drop shadow | Recessed/inset shadow |
| Message bubbles | Glass + blur | Flat/raised shadows, solid bg |
| Chips | Glass + blur | Raised soft shadows |
| Orange buttons | Drop shadow | Orange nm shadow (warm tones) |
| Collapsed bar | Glass pill | Solid warm-gray raised pill |

---

## Notes
- Widget is inside an iframe — solid background is fine, no transparency needed
- Keep all border-radius values identical (no shape changes)
- Keep all font sizes, padding, margin, layout identical
- Only change: background colors, box-shadows, remove backdrop-filter
- Orange color `#E8713A` / `#D4622A` stays exactly the same
- `@media (max-width: 480px)` blocks: no changes needed (layout only)
