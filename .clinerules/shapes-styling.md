## Brief overview
Guidelines for styling shape annotations (rectangles, circles, text) in the Kutlass video editor. Shapes should look like beautiful visual notes/stickers rather than plain geometric primitives.

## Shape style system
- Define `ShapeStyle` type in `types/editor.ts` with values: `"simple" | "note" | "sticky" | "outline" | "neon"`
- Add `style: ShapeStyle` field to `ShapeAnnotation` interface
- Store current style selection in Zustand `shapeSlice` as `shapeStyle` with `setShapeStyle` action
- Default style is `"simple"` for backward compatibility

## Rendering styles (in PreviewEngine.ts → drawShapesOnCtx)
- **simple** — original behavior: solid stroke + optional fill
- **note** — rounded rectangle with dog-ear (folded corner), drop shadow, cream/light background (`#fffbe6`), subtle fold line
- **sticky** — yellow sticky-note look (`#fef08a`), drop shadow, slight rotation (`0.03` rad), rounded corners
- **outline** — double border: outer dashed (low opacity) + inner solid, with inset
- **neon** — glow effect using `ctx.shadowBlur` with the shape's color, two passes (wide blur + narrow blur)

## Canvas rendering patterns
- Use `ctx.save()`/`ctx.restore()` for isolated state per shape
- Use `ctx.shadowColor`, `ctx.shadowBlur`, `ctx.shadowOffsetX/Y` for shadows and glow
- Use `ctx.setLineDash()` for dashed borders
- Use `ctx.translate()`/`ctx.rotate()` for rotation effects (sticky style)
- Use `ctx.roundRect()` for rounded corners (available in modern Canvas API)
- Scale font sizes relative to canvas height: `Math.round(shape.fontSize * (h / 720))`

## Panel UI (AnnotatePanel.tsx)
- Add style selector row with icon + label buttons (📝 Note, 📌 Sticky, ◻ Outline, 💡 Neon)
- Style buttons use same `kt-btn-accent` / `kt-btn-subtle` pattern as other tool selectors
- Pass `shapeStyle` and `setShapeStyle` through props to `ShapeTools` component
- Include `style` field when calling `addShape()`

## Selection highlight (ShapeOverlay.tsx)
- Adapt highlight rendering based on shape style:
  - **neon**: blue glow (`shadowBlur: 12`) around selection bounds
  - **note/sticky**: dashed border + corner handle dots
  - **simple/outline**: standard dashed border
