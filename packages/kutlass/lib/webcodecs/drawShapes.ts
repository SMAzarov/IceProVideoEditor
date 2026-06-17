import { ShapeAnnotation } from "@/types/editor";

/** Draw a folded corner (dog-ear) on a rectangle path */
function drawDogEar(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, w: number, h: number, foldSize: number) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w - foldSize, y);
  ctx.lineTo(x + w, y + foldSize);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

/** Safe roundRect — falls back to rect if roundRect is not available (e.g. OffscreenCanvas in Safari) */
function safeRoundRect(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

/** Draw shape annotations onto a canvas context */
export function drawShapesOnCtx(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  shapes: ShapeAnnotation[],
  w: number,
  h: number
) {
  for (const shape of shapes) {
    ctx.save();

    const cx = shape.x * w;
    const cy = shape.y * h;
    const sw = shape.width * w;
    const sh = shape.height * h;
    const halfW = sw / 2;
    const halfH = sh / 2;
    const style = shape.style || "simple";

    // ── Common: draw the shape path ──────────────────────────────────────
    const drawPath = (drawFn: () => void) => {
      if (style === "note") {
        // Note style: rounded rect with dog-ear corner
        const r = Math.min(12, sw * 0.08, sh * 0.08);
        const fold = Math.min(24, sw * 0.15, sh * 0.15);
        const x = cx - halfW;
        const y = cy - halfH;

        // Build the note path (rounded rect with dog-ear)
        const notePath = () => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + sw - fold - r, y);
          ctx.quadraticCurveTo(x + sw - fold, y, x + sw - fold, y + r);
          ctx.lineTo(x + sw, y + fold + r);
          ctx.lineTo(x + sw, y + sh - r);
          ctx.quadraticCurveTo(x + sw, y + sh, x + sw - r, y + sh);
          ctx.lineTo(x + r, y + sh);
          ctx.quadraticCurveTo(x, y + sh, x, y + sh - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
        };

        // Shadow (only if fill is visible)
        if (shape.fillColor !== "transparent") {
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.25)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 3;
          ctx.fillStyle = shape.fillColor;
          notePath();
          ctx.fill();
          ctx.restore();
        }

        // Main shape: fill + stroke on the same path
        notePath();
        if (shape.fillColor !== "transparent") {
          ctx.fillStyle = shape.fillColor;
          ctx.fill();
        }
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.stroke();

        // Fold line (drawn on top)
        ctx.save();
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + sw - fold, y);
        ctx.lineTo(x + sw, y + fold);
        ctx.stroke();
        ctx.restore();
      } else if (style === "sticky") {
        // Sticky note: yellow background, shadow, slightly rotated
        const x = cx - halfW;
        const y = cy - halfH;
        const angle = 0.03; // slight rotation

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.translate(-cx, -cy);

        // Shadow
        if (shape.fillColor !== "transparent") {
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle = shape.fillColor;
          ctx.beginPath();
          safeRoundRect(ctx, x, y, sw, sh, 4);
          ctx.fill();
        }
        ctx.restore();

        // Main sticky
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.translate(-cx, -cy);
        if (shape.fillColor !== "transparent") {
          ctx.fillStyle = shape.fillColor;
          ctx.beginPath();
          safeRoundRect(ctx, x, y, sw, sh, 4);
          ctx.fill();
        }
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.stroke();
        ctx.restore();
      } else if (style === "outline") {
        // Outline: double border with dashed outer
        const x = cx - halfW;
        const y = cy - halfH;

        // Outer dashed
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.globalAlpha = 0.4;
        drawFn();
        ctx.stroke();
        ctx.restore();

        // Inner solid
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.globalAlpha = 1;
        const inset = 6;
        ctx.beginPath();
        ctx.rect(x + inset, y + inset, sw - inset * 2, sh - inset * 2);
        ctx.stroke();
        ctx.restore();

        // Fill
        if (shape.fillColor !== "transparent") {
          ctx.fillStyle = shape.fillColor;
          ctx.beginPath();
          ctx.rect(x, y, sw, sh);
          ctx.fill();
        }
      } else if (style === "neon") {
        // Neon: glow effect
        ctx.save();
        ctx.shadowColor = shape.color;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth + 2;
        ctx.globalAlpha = 0.6;
        drawFn();
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = shape.color;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        drawFn();
        ctx.stroke();
        ctx.restore();

        if (shape.fillColor !== "transparent") {
          ctx.fillStyle = shape.fillColor;
          drawFn();
          ctx.fill();
        }
      } else {
        // Simple (default)
        drawFn();
        if (shape.fillColor !== "transparent") ctx.fill();
        ctx.stroke();
      }
    };

    // ── Shape type dispatch ──────────────────────────────────────────────
    if (shape.type === "rectangle") {
      drawPath(() => {
        ctx.beginPath();
        safeRoundRect(ctx, cx - halfW, cy - halfH, sw, sh, 6);
      });
    } else if (shape.type === "circle") {
      drawPath(() => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, halfW, halfH, 0, 0, Math.PI * 2);
      });
    } else if (shape.type === "text") {
      const size = Math.round(shape.fontSize * (h / 720));
      ctx.font = `bold ${size}px sans-serif`;
      ctx.fillStyle = shape.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Bounding box for text wrapping
      const maxW = sw > 10 ? sw : w * 0.3;
      const maxH = sh > 10 ? sh : h * 0.15;
      const tx = cx - maxW / 2;
      const ty = cy - maxH / 2;

      // Word-wrap the text into lines
      const words = shape.text.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Draw lines, clipped to bounding box
      const lineHeight = size * 1.3;
      const maxLines = Math.floor(maxH / lineHeight);
      ctx.save();
      ctx.beginPath();
      ctx.rect(tx, ty, maxW, maxH);
      ctx.clip();
      for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
        ctx.fillText(lines[i], tx, ty + i * lineHeight);
      }
      ctx.restore();
    }

    ctx.restore();
  }
}
