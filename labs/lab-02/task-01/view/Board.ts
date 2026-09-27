import * as model from "../model";
import { Canvas } from "../canvas";
import { BoardPointerEvent, Position } from "../view";
import { Element } from "./Element";
import { Library } from "./Library";

const ELEMENT_SQUARE_SIZE = 100;
const LIBRARY_SECTION_WIDTH_RATIO = 0.4;

export class Board implements model.BoardObserver {
  private elements: Map<string, Element>;
  private library: Library;
  private modelBoard: model.Board;
  private draggedElement: Element | null;
  private dragOffset: Position | null;

  constructor(library: Library, modelBoard: model.Board) {
    this.elements = new Map<string, Element>();
    this.library = library;
    this.modelBoard = modelBoard;
    this.draggedElement = null;
    this.dragOffset = null;
  }

  public updateElements(): void {
    const updatedElements = new Map<string, Element>();

    for (const modelElement of this.modelBoard.elements()) {
      const existingElement = this.elements.get(modelElement.getId());
      if (existingElement) {
        updatedElements.set(modelElement.getId(), existingElement);
        continue;
      }

      const newElement = this.createMissingElement(modelElement);
      updatedElements.set(modelElement.getId(), newElement);
    }

    this.elements = updatedElements;
  }

  private createMissingElement(modelElement: model.Element): Element {
    const imgSrc = this.library.getTypeDefinition(
      modelElement.getType(),
    )?.imgSrc;

    return new Element(
      modelElement.getId(),
      modelElement.getType(),
      imgSrc ?? null,
      {
        x: Math.random() * ELEMENT_SQUARE_SIZE,
        y: Math.random() * ELEMENT_SQUARE_SIZE,
      },
    );
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
      element.ensureImage(canvas);
      element.draw(canvas);
    }
    if (this.draggedElement) {
      this.draggedElement.ensureImage(canvas);
      this.draggedElement.draw(canvas);
    }
  }

  public onMouseDown(event: BoardPointerEvent): void {
    const libraryBoundaryX = this.getLibraryBoundaryX(event.canvasWidth);

    if (event.x > libraryBoundaryX) {
      const elementsArray = Array.from(this.elements.values()).reverse();
      for (const element of elementsArray) {
        if (element.contains(event.x, event.y)) {
          this.draggedElement = element;
          this.dragOffset = {
            x: event.x - element.position.x,
            y: event.y - element.position.y,
          };
          this.elements.delete(element.id);
          break;
        }
      }
    } else {
      const typeDef = this.library.getTypeAtEvent(event);
      if (typeDef) {
        this.draggedElement = this.createTemporaryElement(
          typeDef.name,
          typeDef.imgSrc,
          {
            x: event.x,
            y: event.y,
          },
        );
        this.dragOffset = { x: 0, y: 0 };
      }
    }
  }

  public onMouseMove(event: BoardPointerEvent): void {
    if (!this.draggedElement) {
      return;
    }
    const offset = this.dragOffset ?? { x: 0, y: 0 };
    let newX = event.x - offset.x;
    const newY = event.y - offset.y;
    const libraryBoundaryX = this.getLibraryBoundaryX(event.canvasWidth);

    const halfElement = ELEMENT_SQUARE_SIZE / 2;
    if (
      !this.draggedElement.isTemporary &&
      newX < libraryBoundaryX + halfElement
    ) {
      newX = libraryBoundaryX + halfElement;
    }

    this.draggedElement.position = { x: newX, y: newY };
  }

  public onMouseUp(event: BoardPointerEvent): void {
    if (!this.draggedElement) {
      return;
    }

    const libraryBoundaryX = this.getLibraryBoundaryX(event.canvasWidth);
    if (this.shouldDiscardDraggedElement(libraryBoundaryX)) {
      this.resetDragState();
      return;
    }

    this.finalizeTemporaryDraggedElement();

    const currentId = this.draggedElement.id;
    const intersectedId = this.findIntersectedElementId(this.draggedElement);

    if (intersectedId) {
      this.handlePotentialCombine(
        currentId,
        intersectedId,
        this.draggedElement,
      );
    } else {
      this.elements.set(currentId, this.draggedElement);
    }

    this.resetDragState();
  }

  private shouldDiscardDraggedElement(libraryBoundaryX: number): boolean {
    if (!this.draggedElement) {
      return false;
    }

    return this.draggedElement.position.x <= libraryBoundaryX;
  }

  private finalizeTemporaryDraggedElement(): void {
    if (!this.draggedElement?.isTemporary) {
      return;
    }

    const newModelElement = this.modelBoard.append(this.draggedElement.type);
    this.draggedElement.id = newModelElement.getId();
    this.draggedElement.isTemporary = false;
  }

  private findIntersectedElementId(draggedElement: Element): string | null {
    for (const [id, element] of this.elements.entries()) {
      if (
        element.contains(draggedElement.position.x, draggedElement.position.y)
      ) {
        return id;
      }
    }

    return null;
  }

  private handlePotentialCombine(
    currentId: string,
    intersectedId: string,
    draggedElement: Element,
  ): void {
    const combined = this.modelBoard.tryCombine([currentId, intersectedId]);
    if (!combined) {
      this.elements.set(currentId, draggedElement);
    }
  }

  private resetDragState(): void {
    this.draggedElement = null;
    this.dragOffset = null;
  }

  private getLibraryBoundaryX(canvasWidth: number): number {
    return canvasWidth * LIBRARY_SECTION_WIDTH_RATIO;
  }

  private static createTemporaryElementId(): string {
    return `temp-${crypto.randomUUID()}`;
  }

  private createTemporaryElement(
    type: string,
    imageSrc: string | null,
    position: { x: number; y: number },
  ): Element {
    return new Element(
      Board.createTemporaryElementId(),
      type,
      imageSrc,
      position,
      true,
    );
  }
}
