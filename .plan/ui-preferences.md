## Brief overview
UI/UX preferences for the Kutlass video editor project. These rules cover styling, theming, typography, and component design patterns used throughout the editor.

## Theming
- Use CSS custom properties (variables) with `--kt-` prefix for all themeable values
- Support both `dark` and `light` themes via `[data-kt-theme="dark"]` / `[data-kt-theme="light"]` selectors
- Persist theme choice in `localStorage` under key `kt-theme`
- Apply theme before React hydration using an inline `<script>` in the app layout to prevent FOUC
- Set `document.documentElement.style.background` and `document.body.style.background` to match the current theme background color
- Store theme state in a Zustand slice (`themeSlice`) with `setTheme` and `toggleTheme` actions

## Typography
- Use Inter as the primary font family, loaded from Google Fonts
- Set base font size to `13px` on the editor container (`.kutlass-editor`)
- Use Tailwind's `text-xs` (12px) for sidebar tool labels
- Use Tailwind's `text-sm` (14px) for menu items and top bar buttons
- Use `tabular-nums` class for numeric displays (zoom percentage, playback speed)

## Color palette
- Dark theme base: `#1c1c1c`, panels: `#1a1a1a`, surface: `#18181b`
- Light theme base: `#f0f2f5`, panels: `#ffffff`, surface: `#e8eaed`
- Accent color: amber/gold (`#fbbf24` dark, `#f59e0b` light) with derived subtle/hover/border variants
- Text hierarchy: primary → secondary → tertiary → muted → faint (darkening/lightening appropriately per theme)
- Sidebar icons use distinct colors per tool (blue for trim, green for crop, purple for adjust, rose for filter, orange for annotate, pink for sticker, yellow for resize, cyan for voice)

## Component patterns
- Use `"use client"` directive for all interactive components
- Use Framer Motion's `motion.div` with `layoutId` for animated active state transitions in sidebars
- Define reusable CSS classes in `kutlass.css` with `kt-` prefix (e.g., `kt-btn-ghost`, `kt-btn-accent`, `kt-btn-import`, `kt-tool-btn`, `kt-chip`)
- Use `style` prop with CSS variable references for dynamic theming (e.g., `style={{ borderColor: "var(--kt-border)" }}`)
- Avoid `require()` — use ESM `import` statements only
- For dropdown menus, close on outside click via `mousedown` event listener

## Zustand store patterns
- Create separate slice files in `store/slices/` for each domain concern
- Export `State` and `Actions` interfaces from each slice
- Compose all slices in `editorStore.ts` using spread operator
- Use `useShallow` for array/object selectors to prevent unnecessary re-renders
- Use `set` with callback function for state updates that depend on current state

## Next.js considerations
- Library code (`packages/kutlass/`) must remain framework-agnostic — no Next.js-specific APIs
- Demo app (`apps/demo/`) uses Next.js 16 — check `node_modules/next/dist/docs/` for breaking changes
- Use `suppressHydrationWarning` on `<html>` and `<body>` when using inline scripts that modify DOM before hydration
- Place inline theme scripts in both `<head>` (for `document.documentElement`) and end of `<body>` (for `document.body`) to avoid null reference errors
