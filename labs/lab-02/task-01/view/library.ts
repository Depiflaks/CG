import * as model from "../model";
import { Canvas, CanvasImage } from "../canvas";
import { BoardPointerEvent } from "../view";

const LIBRARY_GRID_PADDING = 10;
const LIBRARY_GRID_COLUMNS = 4;
const LIBRARY_SECTION_WIDTH_RATIO = 0.4;
const SORT_BUTTON_HEIGHT = 36;
const SORT_BUTTON_MARGIN = 10;

export class Library {
  private model: model.Library;
  private imageCache: Map<string, CanvasImage>;
  private isSortedAlphabetically: boolean;

  constructor(model: model.Library) {
    this.model = model;
    this.imageCache = new Map<string, CanvasImage>();
    this.isSortedAlphabetically = false;
  }

  public draw(canvas: Canvas): void {
    const size = this.getCardSize(canvas);
    const openedTypes = this.getOpenedTypesForDisplay();

    this.drawSortButton(canvas);

    const nextIndex = this.drawOpenedTypes(canvas, openedTypes, size);

    const totalTypes = this.model.typesCount();
    const remainingClosed = Math.max(0, totalTypes - openedTypes.length);

    this.drawClosedTypes(canvas, remainingClosed, size, nextIndex);
  }

  public onMouseDown(event: BoardPointerEvent): void {
    const buttonRect = this.getSortButtonRect(event.canvasWidth);
    const isInsideButton =
      event.x >= buttonRect.x &&
      event.x <= buttonRect.x + buttonRect.width &&
      event.y >= buttonRect.y &&
      event.y <= buttonRect.y + buttonRect.height;

    if (isInsideButton) {
      this.isSortedAlphabetically = !this.isSortedAlphabetically;
    }
  }

  private getCardSize(canvas: Canvas): number {
    const librarySectionWidth = this.getLibrarySectionWidth(canvas.getWidth());
    return (
      (librarySectionWidth -
        LIBRARY_GRID_PADDING * (LIBRARY_GRID_COLUMNS + 1)) /
      LIBRARY_GRID_COLUMNS
    );
  }

  private drawOpenedTypes(
    canvas: Canvas,
    openedTypes: model.TypeDefinition[],
    size: number,
  ): number {
    for (let i = 0; i < openedTypes.length; i++) {
      const { x, y } = this.getGridPosition(i, size);
      const typeDef = openedTypes[i];
      if (!typeDef) {
        continue;
      }

      this.drawCardBox(canvas, x, y, size);
      this.drawImage(canvas, typeDef.imgSrc, x, y, size);
      this.drawText(canvas, typeDef.name, x, y, size);
    }

    return openedTypes.length;
  }

  private drawClosedTypes(
    canvas: Canvas,
    count: number,
    size: number,
    startIndex: number,
  ): void {
    for (let i = 0; i < count; i++) {
      const { x, y } = this.getGridPosition(startIndex + i, size);
      this.drawCardBox(canvas, x, y, size);
    }
  }

  private getGridPosition(
    index: number,
    size: number,
  ): { x: number; y: number } {
    const col = index % LIBRARY_GRID_COLUMNS;
    const row = Math.floor(index / LIBRARY_GRID_COLUMNS);
    const x = LIBRARY_GRID_PADDING + col * (size + LIBRARY_GRID_PADDING);
    const y =
      LIBRARY_GRID_PADDING +
      SORT_BUTTON_HEIGHT +
      SORT_BUTTON_MARGIN +
      row * (size + LIBRARY_GRID_PADDING);

    return { x, y };
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

    const openedTypes = this.getOpenedTypesForDisplay();
    let row = 0;
    let col = 0;

    for (const typeDef of openedTypes) {
      const x = LIBRARY_GRID_PADDING + col * (size + LIBRARY_GRID_PADDING);
      const y =
        LIBRARY_GRID_PADDING +
        SORT_BUTTON_HEIGHT +
        SORT_BUTTON_MARGIN +
        row * (size + LIBRARY_GRID_PADDING);

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

  private getOpenedTypesForDisplay(): model.TypeDefinition[] {
    const openedTypes = this.model.openedTypes();
    if (!this.isSortedAlphabetically) {
      return openedTypes;
    }

    return [...openedTypes].sort((a, b) => a.name.localeCompare(b.name));
  }

  private getSortButtonRect(canvasWidth: number): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const librarySectionWidth = this.getLibrarySectionWidth(canvasWidth);
    const width = librarySectionWidth - LIBRARY_GRID_PADDING * 2;
    return {
      x: LIBRARY_GRID_PADDING,
      y: LIBRARY_GRID_PADDING,
      width,
      height: SORT_BUTTON_HEIGHT,
    };
  }

  private drawSortButton(canvas: Canvas): void {
    const rect = this.getSortButtonRect(canvas.getWidth());

    canvas.setFillColor(this.isSortedAlphabetically ? "#cfd8dc" : "#e0e0e0");
    canvas.fillRect(rect.x, rect.y, rect.width, rect.height);
    canvas.setStrokeColor("#000000");
    canvas.strokeRect(rect.x, rect.y, rect.width, rect.height);

    canvas.setFillColor("#000000");
    canvas.setFont("16px sans-serif");
    canvas.setTextAlign("center");
    canvas.setTextBaseline("middle");
    const text = this.isSortedAlphabetically ? "discovery order" : "sort";
    canvas.fillText(text, rect.x + rect.width / 2, rect.y + rect.height / 2);
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
