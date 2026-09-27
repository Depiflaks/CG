import { Canvas, CanvasImage } from "../canvas";
import { Position } from "../view";

const ELEMENT_SQUARE_SIZE = 100;

export class Element {
  public id: string;
  public type: string;
  public position: Position;
  public isTemporary: boolean;
  private imageSrc: string | null;
  private image: CanvasImage | null;

  constructor(
    id: string,
    type: string,
    imageSrc: string | null,
    position: { x: number; y: number },
    temporary = false,
  ) {
    this.id = id;
    this.type = type;
    this.position = position;
    this.imageSrc = imageSrc;
    this.image = null;
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

  public ensureImage(canvas: Canvas): void {
    if (this.image || !this.imageSrc) {
      return;
    }

    this.image = canvas.createImage(this.imageSrc);
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
