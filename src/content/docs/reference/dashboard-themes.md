---
title: Dashboard Colors & Themes
description: How dashboard chart and widget colors are themed, and how to recolor them from one editable file.
sidebar:
  order: 2
---

Every color in your dashboards — chart series, pie and treemap slices, budget-progress bars, the
adherence heat-map, KPI accents — comes from a single **dashboard theme**: an editable JSON file.
Change a color there and it flows to every dashboard at once. Recipes reference theme colors with
`{{theme.*}}` tokens, so a well-built dashboard re-themes for free.

## The model: two kinds of color

The system keeps two color roles strictly separate, and this is worth understanding before you edit:

- **Valence** — *favorability*. Green (under budget), amber (approaching), red (over), and a calm
  "complete" color for exactly-on-budget. These are the **only** place green/amber/red appear, so a
  color that means "over budget" never gets confused with a category that just happens to be red.
- **Identity** — *which thing*. The categorical palette used for pie/treemap slices. Its one job is
  to make neighbors easy to tell apart; the colors carry no good/bad meaning.

Plus a **brand** accent (focus/emphasis) and a muted **baseline** (the "target" a value is measured
against, e.g. the Budget bar behind the Actual bar).

## Where the theme lives

Theme files are JSON, under your config directory at `config/dashboard-themes/`. The app ships
`dusty-spectrum.json` as the default; the `active_dashboard_theme` setting picks which file is active.
Every color has a **`light`** and a **`dark`** variant, applied automatically with your app's mode.

You can edit the active file directly. Each theme also carries a `readme` field that restates the
editing order below.

## Recoloring — in tiers

Most people only touch tier 1. Everything has a sensible default, so a field you don't set just keeps
its default — **exposed does not mean you must change it.**

### Tier 1 — the colors you'll actually want to change

- **`valence`** — the budget bars and heat-map. `good`, `warn`, `bad`, `complete`, each `{light, dark}`.
- **`categorical`** — the identity palette (pie/treemap). An ordered list of colors per mode. For a
  pie, aim for colors that are **easy to tell apart from their neighbors**.
- **`brand`** — the focus/accent color (single-series charts, primary KPI icons, links).

### Tier 2 — mapping and pins

- **`baseline`** — the muted "target/budget" grey.
- **`series`** — named recurring series (`budget`, `actual`, `income`, `expense`, `savings`) mapped to
  a token or hex, so a chart series and its KPI match. Values can be tokens, e.g.
  `"actual": "{{theme.brand}}"`.
- **`accountPins`** — pin a specific account to a specific color, e.g.
  `{ "Expenses:Groceries": "{{theme.categorical.3}}" }`. Optional.

### Tier 3 — fine knobs (touch only if you really want to)

Each has a sensible default:

- **`thresholds.warnAt`** — the fraction of budget where a bar turns amber (default `0.85`).
- **`stickiness.depthLightenStep`** — how much lighter each deeper account level is in the
  treemap/sunburst (default `0.18`).
- **`overflow.lightenStep`** — lightness shift when a chart has more categories than the palette
  (default `0.15`).
- **`states.hoverLighten` / `muteOpacity` / `selectedLighten`** — hover, faded, and selected states.
- **`tints.heatmapAlpha`** — how strong the heat-map cell tint is (default `0.30`).

## Using theme colors in your own recipes

Anywhere a recipe accepts a color, use a `{{theme.*}}` token instead of a hex:

| Token | What it is |
|---|---|
| `{{theme.brand}}` | Focus/accent |
| `{{theme.baseline}}` | The measured-against grey |
| `{{theme.valence.good\|warn\|bad\|complete}}` | Favorability |
| `{{theme.series.<name>}}` | A named series (budget, actual, income, expense, savings) |
| `{{theme.categorical}}` / `{{theme.categorical.N}}` | Identity — auto-assigned, or a specific slot |

Two conveniences worth knowing:

- **Pie and treemap charts, budget-progress bars, and the heat-map are colored by the theme
  automatically** — you don't set colors on them at all.
- **KPI icons**: use `{{theme.brand}}` for a magnitude (Spent, Total, Assets); set `colorBySign: true`
  for a signed value (Remaining, Net change) so it goes green/red by its sign.

**Escape hatch — dictate your own colors.** A raw hex or CSS color always wins over the theme,
anywhere a color is accepted. To take over a whole chart's palette, set its `options.color` to your
own array — it overrides the theme's categorical palette for that chart. So you can theme everything,
or override exactly what you want, down to a single value.

## A note on color choices

Two ideas make dashboards read well: valence colors should feel *related and calm* (they're a scale),
while identity colors should be *as distinct from each other as possible* — and **fresh** (luminous
and clean) rather than washed-out or neon. The default theme is tuned this way; keep it in mind if you
build your own palette.
