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

export { Library } from "./view/Library";
export { Element } from "./view/Element";
export { Board } from "./view/Board";
