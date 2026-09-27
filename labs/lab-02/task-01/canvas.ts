export type HorizontalAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";

export interface CanvasImage {
  isReady(): boolean;
}

export interface Canvas {
  getWidth(): number;
  getHeight(): number;

  setFillColor(color: string): void;
  setStrokeColor(color: string): void;

  setFont(font: string): void;
  setTextAlign(align: HorizontalAlign): void;
  setTextBaseline(baseline: VerticalAlign): void;

  fillRect(x: number, y: number, width: number, height: number): void;
  strokeRect(x: number, y: number, width: number, height: number): void;
  drawLine(x1: number, y1: number, x2: number, y2: number): void;
  fillEllipse(x: number, y: number, radiusX: number, radiusY: number): void;
  strokeEllipse(x: number, y: number, radiusX: number, radiusY: number): void;
  fillText(text: string, x: number, y: number): void;

  createImage(src: string): CanvasImage;
  drawImage(
    image: CanvasImage,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void;
}

export class HtmlCanvasImage implements CanvasImage {
  private readonly image: HTMLImageElement;

  constructor(src: string) {
    this.image = new Image();
    this.image.src = src;
  }

  public isReady(): boolean {
    return this.image.complete && this.image.naturalWidth !== 0;
  }

  public getRaw(): HTMLImageElement {
    return this.image;
  }
}

export class HtmlCanvas implements Canvas {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public getWidth(): number {
    return this.ctx.canvas.width;
  }

  public getHeight(): number {
    return this.ctx.canvas.height;
  }

  public setFillColor(color: string): void {
    this.ctx.fillStyle = color;
  }

  public setStrokeColor(color: string): void {
    this.ctx.strokeStyle = color;
  }

  public setFont(font: string): void {
    this.ctx.font = font;
  }

  public setTextAlign(align: HorizontalAlign): void {
    this.ctx.textAlign = align;
  }

  public setTextBaseline(baseline: VerticalAlign): void {
    this.ctx.textBaseline = baseline;
  }

  public fillRect(x: number, y: number, width: number, height: number): void {
    this.ctx.fillRect(x, y, width, height);
  }

  public strokeRect(x: number, y: number, width: number, height: number): void {
    this.ctx.strokeRect(x, y, width, height);
  }

  public drawLine(x1: number, y1: number, x2: number, y2: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  public fillEllipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
  ): void {
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  public strokeEllipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
  ): void {
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  public fillText(text: string, x: number, y: number): void {
    this.ctx.fillText(text, x, y);
  }

  public createImage(src: string): CanvasImage {
    return new HtmlCanvasImage(src);
  }

  public drawImage(
    image: CanvasImage,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    if (!(image instanceof HtmlCanvasImage)) {
      return;
    }
    this.ctx.drawImage(image.getRaw(), x, y, width, height);
  }
}