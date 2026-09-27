import * as model from "../model";
import { Canvas, CanvasImage } from "../canvas";
import { BoardPointerEvent } from "../view";

const LIBRARY_GRID_PADDING = 10;
const LIBRARY_GRID_COLUMNS = 4;
const LIBRARY_SECTION_WIDTH_RATIO = 0.4;

export class Library {
  private model: model.Library;
  private imageCache: Map<string, CanvasImage>;

  constructor(model: model.Library) {
    this.model = model;
    this.imageCache = new Map<string, CanvasImage>();
  }

  public draw(canvas: Canvas): void {
    const librarySectionWidth = this.getLibrarySectionWidth(canvas.getWidth());
    const size =
      (librarySectionWidth -
        LIBRARY_GRID_PADDING * (LIBRARY_GRID_COLUMNS + 1)) /
      LIBRARY_GRID_COLUMNS;

    const openedTypes = this.model.openedTypes();
    
    let row = 0;
    let col = 0;

    for (const typeDef of openedTypes) {
      const x = LIBRARY_GRID_PADDING + col * (size + LIBRARY_GRID_PADDING);
      const y = LIBRARY_GRID_PADDING + row * (size + LIBRARY_GRID_PADDING);

      this.drawCardBox(canvas, x, y, size);
      this.drawImage(canvas, typeDef.imgSrc, x, y, size);
      this.drawText(canvas, typeDef.name, x, y, size);

      col++;
      if (col >= LIBRARY_GRID_COLUMNS) {
        col = 0;
        row++;
      }
    }
  }

  public getTypeDefinition(
    type: model.ElementType,
  ): model.TypeDefinition | undefined {
    return this.model.getDefinition(type);
  }

  public getTypeAtEvent(
    event: BoardPointerEvent,
  ): model.TypeDefinition | undefined {
    const librarySectionWidth = this.getLibrarySectionWidth(event.canvasWidth);
    const size =
      (librarySectionWidth -
        LIBRARY_GRID_PADDING * (LIBRARY_GRID_COLUMNS + 1)) /
      LIBRARY_GRID_COLUMNS;

    const mouseX = event.x;
    const mouseY = event.y;

    if (mouseX > librarySectionWidth) {
      return undefined;
    }

    const openedTypes = this.model.openedTypes();
    let row = 0;
    let col = 0;

    for (const typeDef of openedTypes) {
      const x = LIBRARY_GRID_PADDING + col * (size + LIBRARY_GRID_PADDING);
      const y = LIBRARY_GRID_PADDING + row * (size + LIBRARY_GRID_PADDING);

      if (
        mouseX >= x &&
        mouseX <= x + size &&
        mouseY >= y &&
        mouseY <= y + size
      ) {
        return typeDef;
      }

      col++;
      if (col >= LIBRARY_GRID_COLUMNS) {
        col = 0;
        row++;
      }
    }

    return undefined;
  }

  private getLibrarySectionWidth(totalWidth: number): number {
    return totalWidth * LIBRARY_SECTION_WIDTH_RATIO;
  }

  private drawCardBox(
    canvas: Canvas,
    x: number,
    y: number,
    size: number,
  ): void {
    canvas.setFillColor("#e0e0e0");
    canvas.fillRect(x, y, size, size);
    canvas.setStrokeColor("#000000");
    canvas.strokeRect(x, y, size, size);
  }

  private drawImage(
    canvas: Canvas,
    imgSrc: string,
    x: number,
    y: number,
    size: number,
  ): void {
    let img = this.imageCache.get(imgSrc);
    if (!img) {
      img = canvas.createImage(imgSrc);
      this.imageCache.set(imgSrc, img);
    }

    if (img.isReady()) {
      const imgSize = size - 35;
      const imgX = x + (size - imgSize) / 2;
      const imgY = y + 10;
      canvas.drawImage(img, imgX, imgY, imgSize, imgSize);
    }
  }

  private drawText(
    canvas: Canvas,
    text: string,
    x: number,
    y: number,
    size: number,
  ): void {
    canvas.setFillColor("#000000");
    canvas.setFont("14px sans-serif");
    canvas.setTextAlign("center");
    canvas.setTextBaseline("middle");
    canvas.fillText(text, x + size / 2, y + size - 12);
  }
}
