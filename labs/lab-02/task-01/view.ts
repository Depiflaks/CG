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

export { Library } from "./view/library";
export { Element } from "./view/element";
export { Board } from "./view/board";
