import * as model from "./model";
import { Canvas, CanvasImage } from "./canvas";

const LIBRARY_GRID_PADDING = 10;
const LIBRARY_GRID_COLUMNS = 4;
const ELEMENT_SQUARE_SIZE = 100;
const LIBRARY_SECTION_WIDTH_RATIO = 0.4;

export interface Position {
  x: number;
  y: number;
}

export interface BoardPointerEvent {
  x: number;
  y: number;
  canvasWidth: number;
  canvasHeight: number;
}

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

      if (typeDef.img) {
        this.drawImage(canvas, typeDef.img, x, y, size);
      }
      this.drawText(canvas, typeDef.name, x, y, size);

      col++;
      if (col >= LIBRARY_GRID_COLUMNS) {
        col = 0;
        row++;
      }
    }
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

export class Element {
  public id: string;
  public type: string;
  public position: Position;
  public isTemporary: boolean;
  private image: CanvasImage | null;

  constructor(
    id: string,
    type: string,
    image: CanvasImage | null,
    position: { x: number; y: number },
    temporary = false,
  ) {
    this.id = id;
    this.type = type;
    this.position = position;
    this.image = image;
    this.isTemporary = temporary;
  }

  public draw(canvas: Canvas): void {
    const halfSize = ELEMENT_SQUARE_SIZE / 2;

    canvas.setFillColor("#f0f0f0");
    canvas.fillRect(
      this.position.x - halfSize,
      this.position.y - halfSize,
      ELEMENT_SQUARE_SIZE,
      ELEMENT_SQUARE_SIZE,
    );

    this.drawImage(canvas);
    this.drawText(canvas);
  }

  public contains(x: number, y: number): boolean {
    const dx = x - this.position.x;
    const dy = y - this.position.y;

    return (
      Math.abs(dx) <= ELEMENT_SQUARE_SIZE / 2 &&
      Math.abs(dy) <= ELEMENT_SQUARE_SIZE / 2
    );
  }

  private drawImage(canvas: Canvas): void {
    if (!this.image?.isReady()) {
      return;
    }

    const imgSize = ELEMENT_SQUARE_SIZE - 20;
    canvas.drawImage(
      this.image,
      this.position.x - imgSize / 2,
      this.position.y - imgSize / 2 - 10,
      imgSize,
      imgSize,
    );
  }

  private drawText(canvas: Canvas): void {
    canvas.setFillColor("#000000");
    canvas.setFont("12px sans-serif");
    canvas.setTextAlign("center");
    canvas.setTextBaseline("middle");
    canvas.fillText(
      this.type,
      this.position.x,
      this.position.y + ELEMENT_SQUARE_SIZE / 2 - 10,
    );
  }
}

export class Board implements model.BoardObserver {
  private elements: Map<string, Element>;
  private library: Library;
  private modelBoard: model.Board;
  private draggedElement: Element | null;
  private imageCache: Map<string, CanvasImage>;

  constructor(library: Library, modelBoard: model.Board) {
    this.elements = new Map<string, Element>();
    this.library = library;
    this.modelBoard = modelBoard;
    this.draggedElement = null;
    this.imageCache = new Map<string, CanvasImage>();
  }

  public updateElements(): void {
    return;
  }

  public draw(canvas: Canvas): void {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const libraryWidth = this.getLibraryBoundaryX(canvasWidth);

    canvas.setFillColor("#f2f2f2");
    canvas.fillRect(0, 0, libraryWidth, canvasHeight);

    canvas.setFillColor("#ffffff");
    canvas.fillRect(libraryWidth, 0, canvasWidth - libraryWidth, canvasHeight);

    this.library.draw(canvas);
    for (const element of this.elements.values()) {
      element.draw(canvas);
    }
    if (this.draggedElement) {
      this.draggedElement.draw(canvas);
    }
  }

  public onMouseDown(canvas: Canvas, event: BoardPointerEvent): void {
    const libraryBoundaryX = this.getLibraryBoundaryX(event.canvasWidth);

    if (event.x > libraryBoundaryX) {
      const elementsArray = Array.from(this.elements.values()).reverse();
      for (const element of elementsArray) {
        if (element.contains(event.x, event.y)) {
          this.draggedElement = element;
          this.elements.delete(element.id);
          break;
        }
      }
    } else {
      const typeDef = this.library.getTypeAtEvent(event);
      if (typeDef) {
        const image = this.getImageForType(canvas, typeDef.img);
        this.draggedElement = this.createTemporaryElement(typeDef.name, image, {
          x: event.x,
          y: event.y,
        });
      }
    }
  }

  private getImageForType(canvas: Canvas, imgSrc?: string): CanvasImage | null {
    if (!imgSrc) {
      return null;
    }
    let image = this.imageCache.get(imgSrc) ?? null;
    if (!image) {
      image = canvas.createImage(imgSrc);
      this.imageCache.set(imgSrc, image);
    }

    return image;
  }

  private createTemporaryElement(
    type: string,
    image: CanvasImage | null,
    position: { x: number; y: number },
  ): Element {
    return new Element(
      Board.createTemporaryElementId(),
      type,
      image,
      position,
      true,
    );
  }

  public onMouseMove(_: Canvas, event: BoardPointerEvent): void {
    if (!this.draggedElement) {
      return;
    }
    let newX = event.x;
    const libraryBoundaryX = this.getLibraryBoundaryX(event.canvasWidth);

    const halfElement = ELEMENT_SQUARE_SIZE / 2;
    if (
      !this.draggedElement.isTemporary &&
      newX < libraryBoundaryX + halfElement
    ) {
      newX = libraryBoundaryX + halfElement;
    }

    this.draggedElement.position = { x: newX, y: event.y };
  }

  public onMouseUp(_: Canvas, event: BoardPointerEvent): void {
    if (!this.draggedElement) {
      return;
    }
    const libraryBoundaryX = this.getLibraryBoundaryX(event.canvasWidth);

    if (this.draggedElement.position.x <= libraryBoundaryX) {
      this.draggedElement = null;
      return;
    }

    if (this.draggedElement.isTemporary) {
      const newModelElement = this.modelBoard.append(this.draggedElement.type);
      this.draggedElement.id = newModelElement.getId();
      this.draggedElement.isTemporary = false;
    }

    const currentId = this.draggedElement.id;
    let intersectedId: string | null = null;
    for (const [id, element] of this.elements.entries()) {
      if (
        element.contains(
          this.draggedElement.position.x,
          this.draggedElement.position.y,
        )
      ) {
        intersectedId = id;
        break;
      }
    }

    if (intersectedId) {
      const combined = this.modelBoard.tryCombine([currentId, intersectedId]);
      if (!combined) {
        this.elements.set(currentId, this.draggedElement);
      }
    } else {
      this.elements.set(currentId, this.draggedElement);
    }

    this.draggedElement = null;
  }

  private getLibraryBoundaryX(canvasWidth: number): number {
    return canvasWidth * LIBRARY_SECTION_WIDTH_RATIO;
  }

  private static createTemporaryElementId(): string {
    return `temp-${crypto.randomUUID()}`;
  }
}
