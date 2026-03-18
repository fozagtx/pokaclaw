# UI Skill — Polkadot Design System

When building or modifying UI components in this project, follow this design system exactly. This is the single source of truth for all visual decisions.

## Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS v4 (CSS-based config in `globals.css`)
- Framer Motion for animations
- Space Grotesk font from Google Fonts

---

## FONTS

**Space Grotesk** (all weights). Imported via Google Fonts in `app/layout.tsx`.
Applied globally via `font-sans` in Tailwind config. No fallback to system fonts.

---

## COLORS

All colors are defined as CSS custom properties in `:root` and as Tailwind `@theme` values in `app/globals.css`.

| Token | Value |
|---|---|
| `--yo-yellow` | `#D6FF34` |
| `--bg` | `#000000` |
| `--surface-1` | `#1D1E19` |
| `--surface-2` | `#262722` |
| `--surface-3` | `#292A2D` |
| `--text` | `#EDEDED` |
| `--muted` | `rgba(255,255,255,0.45)` |

### Feature card color pairs (background / text):

| Pair | Background | Text |
|---|---|---|
| Blue | `#7DA2FF` | `#000434` |
| Mint | `#5DFFC0` | `#003F18` |
| Cyan | `#71F6FF` | `#204150` |
| Lavender | `#C1ADFF` | `#4D2050` |

**Rule**: No two adjacent cards share a color pair. Rotate: blue -> mint -> cyan -> lavender.

---

## TYPOGRAPHY

### Rules
- ALL headings: `uppercase font-bold` (weight 700)
- Buttons: `uppercase tracking-[0.96px]`
- Body: `text-base font-normal leading-6` (16px/400/24px)

### Scale

| Name | Size | Weight | Case | Line-height | Extra |
|---|---|---|---|---|---|
| Hero H1 | 88px | 700 | uppercase | 80px | — |
| Section H2 | 56px | 700 | uppercase | 64px | — |
| Card H3 | 40px | 700 | uppercase | 48px | — |
| Sub-headline | 28px | 700 | uppercase | 36px | — |
| Label / Nav | 13px | 700 | uppercase | — | letter-spacing: 1.2px |
| Body | 16px | 400 | normal | 24px | — |
| Muted small | 12px | 400 | normal | — | color: var(--muted) |
| Stat value | 42px | 700 | normal | — | color: var(--yo-yellow) |

### Tailwind classes for each:

```
Hero H1:       text-[88px] font-bold uppercase leading-[80px]
Section H2:    text-[56px] font-bold uppercase leading-[64px]
Card H3:       text-[40px] font-bold uppercase leading-[48px]
Sub-headline:  text-[28px] font-bold uppercase leading-[36px]
Label / Nav:   text-[13px] font-bold uppercase tracking-[1.2px]
Body:          text-base font-normal leading-6
Muted small:   text-xs font-normal text-[var(--muted)]
Stat value:    text-[42px] font-bold text-[var(--yo-yellow)]
```

---

## BORDER RADIUS

| Element | Value | Tailwind |
|---|---|---|
| Sections (bottom only) | 120px | `rounded-b-[120px]` |
| Cards | 30px | `rounded-[30px]` |
| Buttons | 9999px | `rounded-full` |
| Small chips / badges | 12px | `rounded-[12px]` |
| Inner data cards | 8px | `rounded-[8px]` |

---

## SPACING

- Container: `max-w-[1700px] mx-auto px-6`
- Section vertical padding: `pb-24` (96px) to `pb-[170px]`
- Card padding: `p-10` (40px)
- Card gap: `gap-4` or `gap-5`

---

## LAYOUT — OVERLAPPING PILL SECTIONS

Every major section:
1. Has `rounded-b-[120px]` on its bottom edge
2. The next section uses `-mt-[120px]` with a higher z-index
3. Creates a cascading "onion peel" depth effect
4. Background colors alternate: `#000` -> `#1D1E19` -> `#000` -> `#FFFFFF`

Example stacking:
```tsx
<section className="bg-black rounded-b-[120px] z-10 relative pb-[170px]">
  {/* content */}
</section>
<section className="bg-[var(--surface-1)] -mt-[120px] z-20 relative rounded-b-[120px] pb-[170px]">
  {/* content */}
</section>
<section className="bg-black -mt-[120px] z-30 relative rounded-b-[120px] pb-[170px]">
  {/* content */}
</section>
```

---

## BUTTONS

### Primary Yellow
```tsx
<button className="bg-[var(--yo-yellow)] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity">
  Label
</button>
```

### Primary Dark
```tsx
<button className="bg-black text-white rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] border border-white/10 hover:opacity-80 transition-opacity">
  Label
</button>
```

### Ghost
```tsx
<button className="bg-[var(--surface-2)] text-[var(--text)] rounded-full px-5 py-2.5 text-xs font-bold uppercase hover:opacity-80 transition-opacity">
  Label
</button>
```

### Chip / Filter
```tsx
{/* Default state */}
<button className="bg-[var(--surface-2)] text-[var(--text)] rounded-[12px] px-3.5 py-2 text-xs font-bold uppercase">
  Label
</button>
{/* Active state */}
<button className="bg-[var(--yo-yellow)] text-black rounded-[12px] px-3.5 py-2 text-xs font-bold uppercase">
  Label
</button>
```

---

## CARDS

### Dark Card (standard)
```tsx
<div className="bg-[var(--surface-1)] rounded-[30px] p-10">
  {/* No border. No shadow. */}
</div>
```

### Dark Card Nested
```tsx
<div className="bg-[var(--surface-2)] rounded-[16px] p-5">
</div>
```

### Feature Card (vibrant)
Use one of the 4 card color pairs. No two adjacent cards share a color.
```tsx
<div className="bg-[var(--card-blue)] text-[var(--card-blue-text)] rounded-[30px] p-10">
  <p className="text-xs font-bold uppercase opacity-60 mb-3">Category</p>
  <h3 className="text-[40px] font-bold uppercase leading-[48px]">Title</h3>
  <p className="text-base font-normal leading-6">Body text</p>
</div>
```

### Stat Card
```tsx
<div className="bg-[var(--surface-1)] rounded-[20px] p-6 border-t-[3px] border-[var(--yo-yellow)]">
  <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">Label</p>
  <p className="text-[40px] font-bold text-[var(--yo-yellow)]">Value</p>
</div>
```

### Step / Process Card
```tsx
<div className="bg-[#ECEEE7] rounded-[30px] p-10 text-black">
  <p className="text-xs text-black/45">Step 01</p>
  <h3 className="text-[40px] font-bold uppercase text-black">Title</h3>
  <p className="text-base font-normal text-black">Body</p>
</div>
```

---

## STAT / DATA DISPLAY

- Large metric: `text-[42px] font-bold` to `text-[56px] font-bold`
- Positive values: `text-[var(--yo-yellow)]`
- Neutral values: `text-[var(--text)]`
- Secondary metrics: `text-[var(--card-mint)]`
- Muted label above metric: `text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]`

### Change / delta badge
```tsx
<span className="bg-[rgba(93,255,192,0.12)] text-[var(--card-mint)] rounded-full px-2 py-0.5 text-xs font-semibold">
  +12.5%
</span>
```

---

## PROGRESS BAR

```tsx
<div className="h-2.5 bg-white/15 rounded-full">
  <div
    className="h-full bg-[var(--yo-yellow)] rounded-full transition-[width] duration-[1200ms] ease-in-out"
    style={{ width: `${percent}%` }}
  />
</div>
```

On yellow backgrounds, use `bg-black` for the fill instead.

---

## BACKGROUND TEXTURES

### Diagonal grid lines (hero sections)
```css
background-image: repeating-linear-gradient(
  45deg,
  rgba(255,255,255,0.05) 0px,
  rgba(255,255,255,0.05) 1px,
  transparent 1px,
  transparent 40px
);
```

### Decorative blob
```tsx
<div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--yo-yellow)] opacity-20 blur-[120px] rounded-full pointer-events-none z-0" />
```

---

## PULSE / LIVE INDICATOR

```tsx
<span className="relative flex h-2.5 w-2.5">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--card-mint)] opacity-75" />
  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--card-mint)]" />
</span>
```

---

## ANIMATIONS (Framer Motion)

### Page enter
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
```

### Stagger children
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: index * 0.08 }}
>
```

### Bottom sheet
```tsx
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  transition={{ type: "spring", damping: 30, stiffness: 300 }}
>
```

### Pulsing logo
```tsx
<motion.div
  animate={{ scale: [1, 1.08, 1] }}
  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
>
```

---

## DESIGN PRINCIPLES

1. **High contrast always.** Black on YO yellow. YO yellow on black. Never low-contrast.
2. **Bold uppercase type** is the primary visual element — not illustration.
3. Each feature card uses a **unique color pair**. Never repeat adjacent.
4. **Pill shapes everywhere** — buttons, sections, progress bars, badges.
5. **Dark-first.** Base is `#000` / `#1D1E19`. YO Yellow is the reward color.
6. **Generous spacing.** Let elements breathe.
7. **YO Yellow (#D6FF34)** only appears on positive states, CTAs, and wins.

---

## IMPORTANT IMPLEMENTATION NOTES

- This project uses **Tailwind CSS v4** — configuration is done in `app/globals.css` using `@theme`, NOT in a `tailwind.config.js` file.
- Always use CSS variables (`var(--yo-yellow)`) for colors in Tailwind arbitrary values.
- Install `framer-motion` before using animation components.
- The Google Fonts import for Space Grotesk is in `app/layout.tsx` via `next/font/google`.
