import * as model from "../model";
import { Canvas } from "../canvas";

const NOTIFICATION_DURATION_MS = 3000;
const NOTIFICATION_HEIGHT = 44;
const NOTIFICATION_MARGIN_BOTTOM = 16;
const NOTIFICATION_HORIZONTAL_PADDING = 18;

export class Notification implements model.NotificationObserver {
  private text: string | null;
  private visibleUntil: number;

  constructor() {
    this.text = null;
    this.visibleUntil = 0;
  }

  public onNotify(message: string): void {
    this.text = message;
    this.visibleUntil = Date.now() + NOTIFICATION_DURATION_MS;
  }

  public draw(canvas: Canvas): void {
    if (!this.text) {
      return;
    }

    if (Date.now() > this.visibleUntil) {
      this.text = null;
      return;
    }

    const width = canvas.getWidth();
    const height = canvas.getHeight();
    const y = height - NOTIFICATION_MARGIN_BOTTOM - NOTIFICATION_HEIGHT;

    canvas.setFillColor("rgba(0, 0, 0, 0.75)");
    canvas.fillRect(0, y, width, NOTIFICATION_HEIGHT);

    canvas.setFillColor("#ffffff");
    canvas.setFont("18px sans-serif");
    canvas.setTextAlign("left");
    canvas.setTextBaseline("middle");
    canvas.fillText(
      this.text,
      NOTIFICATION_HORIZONTAL_PADDING,
      y + NOTIFICATION_HEIGHT / 2,
    );
  }
}
