import * as model from "../model";
import { Canvas } from "../canvas";
import { BoardPointerEvent, Position } from "../view";
import { Element } from "./element";
import { Library } from "./library";

const ELEMENT_SQUARE_SIZE = 100;
const LIBRARY_SECTION_WIDTH_RATIO = 0.4;
const DELETE_ZONE_RADIUS = 36;
const DELETE_ZONE_MARGIN_BOTTOM = 24;
const DELETE_ICON_SIZE = 18;

export class Board implements model.BoardObserver {
  private elements: Map<string, Element>;
  private library: Library;
  private modelBoard: model.Board;
  private draggedElement: Element | null;
  private dragOffset: Position | null;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(library: Library, modelBoard: model.Board) {
    this.elements = new Map<string, Element>();
    this.library = library;
    this.modelBoard = modelBoard;
    this.draggedElement = null;
    this.dragOffset = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
  }

  public onAppend(modelElement: model.Element): void {
    if (this.elements.has(modelElement.getId())) {
      return;
    }

    const element = this.createElementFromModel(
      modelElement,
      this.getScreenCenterPosition(),
    );
    this.elements.set(element.id, element);
  }

  public onRemove(id: string): void {
    this.elements.delete(id);
  }

  public onElementsCombine(ids: string[], result: model.Element): void {
    const combinePosition = this.getCombinedElementsMidpoint(ids);

    for (const id of ids) {
      this.elements.delete(id);
    }

    const element = this.createElementFromModel(result, combinePosition);
    this.elements.set(element.id, element);
  }

  private createElementFromModel(
    modelElement: model.Element,
    position: Position,
  ): Element {
    const imgSrc = this.library.getTypeDefinition(
      modelElement.getType(),
    )?.imgSrc;

    return new Element(
      modelElement.getId(),
      modelElement.getType(),
      imgSrc ?? null,
      position,
    );
  }

  private getCombinedElementsMidpoint(ids: string[]): Position {
    const positions = ids
      .map((id) => this.elements.get(id)?.position)
      .filter((position): position is Position => !!position);

    if (positions.length === 0) {
      return this.getScreenCenterPosition();
    }

    const total = positions.reduce(
      (acc, position) => ({ x: acc.x + position.x, y: acc.y + position.y }),
      { x: 0, y: 0 },
    );

    return {
      x: total.x / positions.length,
      y: total.y / positions.length,
    };
  }

  private getScreenCenterPosition(): Position {
    return { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
  }

  public draw(canvas: Canvas): void {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    const libraryWidth = this.getLibraryBoundaryX(canvasWidth);

    canvas.setFillColor("#f2f2f2");
    canvas.fillRect(0, 0, libraryWidth, canvasHeight);

    canvas.setFillColor("#ffffff");
    canvas.fillRect(libraryWidth, 0, canvasWidth - libraryWidth, canvasHeight);

    canvas.setStrokeColor("#333333");
    canvas.strokeRect(0, 0, libraryWidth, canvasHeight);
    canvas.strokeRect(
      libraryWidth,
      0,
      canvasWidth - libraryWidth,
      canvasHeight,
    );
    canvas.strokeRect(libraryWidth, 0, 0, canvasHeight);

    this.library.draw(canvas);
    this.drawDeleteZone(canvas);
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

    if (
      this.isInDeleteZone(
        this.draggedElement.position,
        event.canvasWidth,
        event.canvasHeight,
      )
    ) {
      if (!this.draggedElement.isTemporary) {
        this.modelBoard.remove(this.draggedElement.id);
      }
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

  private getDeleteZoneCenter(
    canvasWidth: number,
    canvasHeight: number,
  ): Position {
    const libraryBoundaryX = this.getLibraryBoundaryX(canvasWidth);
    return {
      x: libraryBoundaryX + (canvasWidth - libraryBoundaryX) / 2,
      y: canvasHeight - DELETE_ZONE_MARGIN_BOTTOM - DELETE_ZONE_RADIUS,
    };
  }

  private isInDeleteZone(
    position: Position,
    canvasWidth: number,
    canvasHeight: number,
  ): boolean {
    const center = this.getDeleteZoneCenter(canvasWidth, canvasHeight);
    const dx = position.x - center.x;
    const dy = position.y - center.y;
    return dx * dx + dy * dy <= DELETE_ZONE_RADIUS * DELETE_ZONE_RADIUS;
  }

  private drawDeleteZone(canvas: Canvas): void {
    const center = this.getDeleteZoneCenter(
      this.canvasWidth,
      this.canvasHeight,
    );
    const half = DELETE_ICON_SIZE / 2;

    canvas.setFillColor("#f5f5f5");
    canvas.fillRect(
      center.x - DELETE_ZONE_RADIUS,
      center.y - DELETE_ZONE_RADIUS,
      DELETE_ZONE_RADIUS * 2,
      DELETE_ZONE_RADIUS * 2,
    );

    canvas.setStrokeColor("#cc3333");
    canvas.strokeRect(
      center.x - DELETE_ZONE_RADIUS,
      center.y - DELETE_ZONE_RADIUS,
      DELETE_ZONE_RADIUS * 2,
      DELETE_ZONE_RADIUS * 2,
    );

    canvas.setStrokeColor("#cc3333");
    canvas.drawLine(
      center.x - half,
      center.y - half,
      center.x + half,
      center.y + half,
    );
    canvas.drawLine(
      center.x + half,
      center.y - half,
      center.x - half,
      center.y + half,
    );
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
