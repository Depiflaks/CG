import * as model from "./model";

const LIBRARY_GRID_PADDING = 10;
const LIBRARY_GRID_COLUMNS = 4;
const ELEMENT_SQUARE_SIZE = 100;

export interface Position {
  x: number;
  y: number;
}

export class Library {
  private model: model.Library;
  private imageCache: Map<string, HTMLImageElement>;

  constructor(model: model.Library) {
    this.model = model;
    this.imageCache = new Map<string, HTMLImageElement>();
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const halfWidth = ctx.canvas.width / 2;
    const size =
      (halfWidth - LIBRARY_GRID_PADDING * (LIBRARY_GRID_COLUMNS + 1)) /
      LIBRARY_GRID_COLUMNS;

    const openedTypes = this.model.openedTypes();
    let row = 0;
    let col = 0;

    for (const typeDef of openedTypes) {
      const x = LIBRARY_GRID_PADDING + col * (size + LIBRARY_GRID_PADDING);
      const y = LIBRARY_GRID_PADDING + row * (size + LIBRARY_GRID_PADDING);

      this.drawCardBox(ctx, x, y, size);

      if (typeDef.img) {
        this.drawImage(ctx, typeDef.img, x, y, size);
      }
      this.drawText(ctx, typeDef.name, x, y, size);

      col++;
      if (col >= LIBRARY_GRID_COLUMNS) {
        col = 0;
        row++;
      }
    }
  }

  public getTypeAtEvent(event: MouseEvent): model.TypeDefinition | undefined {
    const target = event.target as HTMLCanvasElement;
    const halfWidth = target.width / 2;
    const size =
      (halfWidth - LIBRARY_GRID_PADDING * (LIBRARY_GRID_COLUMNS + 1)) /
      LIBRARY_GRID_COLUMNS;

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    if (mouseX > halfWidth) {
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

  private drawCardBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ): void {
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(x, y, size, size);
  }

  private drawImage(
    ctx: CanvasRenderingContext2D,
    imgSrc: string,
    x: number,
    y: number,
    size: number,
  ): void {
    let img = this.imageCache.get(imgSrc);
    if (!img) {
      img = new Image();
      img.src = imgSrc;
      this.imageCache.set(imgSrc, img);
    }

    if (img.complete && img.naturalWidth !== 0) {
      const imgSize = size - 35;
      const imgX = x + (size - imgSize) / 2;
      const imgY = y + 10;
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
    }
  }

  private drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    size: number,
  ): void {
    ctx.fillStyle = "#000000";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + size / 2, y + size - 12);
  }
}

export class Element {
  public id: string;
  public type: string;
  public position: Position;
  private image: HTMLImageElement | null;

  constructor(
    id: string,
    type: string,
    img: string,
    position: { x: number; y: number },
  ) {
    this.id = id;
    this.type = type;
    this.position = position;
    this.image = null;

    if (img) {
      this.image = new Image();
      this.image.src = img;
    }
  }

  public Draw(ctx: CanvasRenderingContext2D): void {
    const halfSize = ELEMENT_SQUARE_SIZE / 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      this.position.x - halfSize,
      this.position.y - halfSize,
      ELEMENT_SQUARE_SIZE,
      ELEMENT_SQUARE_SIZE,
    );

    this.drawImage(ctx);
    this.drawText(ctx);
  }

  public contains(x: number, y: number): boolean {
    const dx = x - this.position.x;
    const dy = y - this.position.y;

    return (
      Math.abs(dx) <= ELEMENT_SQUARE_SIZE / 2 &&
      Math.abs(dy) <= ELEMENT_SQUARE_SIZE / 2
    );
  }

  private drawImage(ctx: CanvasRenderingContext2D): void {
    if (!this.image || !this.image.complete || this.image.naturalWidth === 0) {
      return;
    }

    const imgSize = ELEMENT_SQUARE_SIZE - 20;
    ctx.drawImage(
      this.image,
      this.position.x - imgSize / 2,
      this.position.y - imgSize / 2 - 10,
      imgSize,
      imgSize,
    );
  }

  private drawText(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#000000";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
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

  constructor(library: Library, modelBoard: model.Board) {
    this.elements = new Map<string, Element>();
    this.library = library;
    this.modelBoard = modelBoard;
    this.draggedElement = null;
  }

  public updateElements(): void {
    return;
  }

  public Draw(ctx: CanvasRenderingContext2D): void {
    this.library.draw(ctx);
    for (const element of this.elements.values()) {
      element.Draw(ctx);
    }
    if (this.draggedElement) {
      this.draggedElement.Draw(ctx);
    }
  }

  public onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLCanvasElement;
    const halfWidth = target.width / 2;

    if (event.offsetX > halfWidth) {
      const elementsArray = Array.from(this.elements.values()).reverse();
      for (const element of elementsArray) {
        if (element.contains(event.offsetX, event.offsetY)) {
          this.draggedElement = element;
          this.elements.delete(element.id);
          break;
        }
      }
    } else {
      const typeDef = this.library.getTypeAtEvent(event);
      if (typeDef) {
        this.draggedElement = new Element(
          Board.createTemporaryElementId(),
          typeDef.name,
          typeDef.img,
          {
            x: event.offsetX,
            y: event.offsetY,
          },
        );
      }
    }
  }

  public onMouseMove(event: MouseEvent): void {
    if (!this.draggedElement) {
      return;
    }
    let newX = event.offsetX;
    const target = event.target as HTMLCanvasElement;
    const halfWidth = target.width / 2;

    if (newX < halfWidth + 30) {
      newX = halfWidth + 30;
    }

    this.draggedElement.position = { x: newX, y: event.offsetY };
  }

  public onMouseUp(event: MouseEvent): void {
    if (!this.draggedElement) {
      return;
    }
    const target = event.target as HTMLCanvasElement;
    const halfWidth = target.width / 2;

    if (this.draggedElement.position.x <= halfWidth) {
      this.draggedElement = null;
      return;
    }

    if (this.draggedElement.id.startsWith("temp-")) {
      const newModelElement = this.modelBoard.append(this.draggedElement.type);
      this.draggedElement.id = newModelElement.getId();
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

  private static createTemporaryElementId(): string {
    return `temp-${crypto.randomUUID()}`;
  }
}
