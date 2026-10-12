import brickUrl from "../textures/brick.png?url";
import stoneUrl from "../textures/stone.png?url";
import woodUrl from "../textures/wood.png?url";
import metalUrl from "../textures/metal.png?url";
import tileUrl from "../textures/tile.png?url";
import sandstoneUrl from "../textures/sandstone.png?url";
import floorUrl from "../textures/floor.png?url";
import skyUrl from "../textures/sky.png?url";
import shadowUrl from "../textures/shadow.png?url";

const MATERIAL_URLS = [brickUrl, stoneUrl, woodUrl, metalUrl,
  tileUrl, sandstoneUrl, floorUrl, skyUrl] as const;

export interface TextureImages {
  readonly materials: readonly HTMLImageElement[];
  readonly shadow: HTMLImageElement;
}

async function loadImage(url: string, signal: AbortSignal): Promise<HTMLImageElement> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Не удалось загрузить текстуру: ${url}`);
  const source = URL.createObjectURL(await response.blob());
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    signal.throwIfAborted();
    return image;
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(`Не удалось прочитать текстуру: ${url}`, { cause: error });
  } finally {
    URL.revokeObjectURL(source);
  }
}

export async function loadTextureImages(signal: AbortSignal): Promise<TextureImages> {
  const [materials, shadow] = await Promise.all([
    Promise.all(MATERIAL_URLS.map((url) => loadImage(url, signal))),
    loadImage(shadowUrl, signal),
  ]);
  return { materials, shadow };
}
