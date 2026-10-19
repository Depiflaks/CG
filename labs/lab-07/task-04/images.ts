import firstUrl from "@/data/img/lab2/water.jpeg";
import secondUrl from "@/data/img/lab2/lava.jpeg";

export type Images = readonly [HTMLImageElement, HTMLImageElement];

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

export function loadImages(): Promise<Images> {
  return Promise.all([loadImage(firstUrl), loadImage(secondUrl)]);
}
