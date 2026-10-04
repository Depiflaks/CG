import { createCanvas } from "@/src/common/canvas/index.ts";
import * as model from "@/labs/lab-02/task-01/model";
import * as view from "./view";
import configData from "./data/dict.json";
import { HtmlCanvas } from "@/src/common/canvas/HtmlCanvas.ts";

function createBoard(): { board: view.Board; library: view.Library } {
  const modelLibrary = new model.Library(configData);
  const modelBoard = new model.Board(modelLibrary);
  const viewLibrary = new view.Library(modelLibrary);
  const notification = new view.Notification();
  const viewBoard = new view.Board(viewLibrary, modelBoard, notification);

  modelBoard.addObserver(viewBoard);
  modelLibrary.addGameFinishObserver(viewBoard);
  modelLibrary.addNotificationObserver(notification);
  return { board: viewBoard, library: viewLibrary };
}

function toBoardPointerEvent(canvas: HTMLCanvasElement, event: MouseEvent): view.BoardPointerEvent {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
  };
}

function bindInteraction(canvas: HTMLCanvasElement, board: view.Board, library: view.Library): () => void {
  const handleMouseDown = (e: MouseEvent) => {
    board.onMouseDown(toBoardPointerEvent(canvas, e));
    library.onMouseDown(toBoardPointerEvent(canvas, e));
  };

  const handleMouseMove = (e: MouseEvent) => {
    board.onMouseMove(toBoardPointerEvent(canvas, e));
  };

  const handleMouseUp = (e: MouseEvent) => {
    board.onMouseUp(toBoardPointerEvent(canvas, e));
  };

  canvas.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
  return (): void => {
    canvas.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };
}

function animateBoard(canvas: HTMLCanvasElement, board: view.Board): () => void {
  const ctx = canvas.getContext("2d");
  const cvs = ctx === null ? null : new HtmlCanvas(ctx);
  let animationFrameId: number;

  const render = (): void => {
    if (ctx !== null && cvs !== null) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      board.draw(cvs);
    }
    animationFrameId = requestAnimationFrame(render);
  };

  render();
  return (): void => { cancelAnimationFrame(animationFrameId); };
}

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({ className: "", touchAction: "auto" });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.append(canvas);
  const { board, library } = createBoard();
  const unbind = bindInteraction(canvas, board, library);
  const stopAnimation = animateBoard(canvas, board);
  return (): void => {
    stopAnimation();
    unbind();
    canvas.remove();
  };
}
