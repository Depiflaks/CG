#!/usr/bin/env python3

import asyncio
import io
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote_plus

import requests
from PIL import Image
from playwright.async_api import async_playwright

ELEMENTS = [
    "air",
    "steam",
    "mud",
    "dust",
    "lava",
    "rain",
    "energy",
    "stone",
    "sand",
    "glass",
    "cloud",
    "storm",
    "plant",
    "tree",
    "ash",
    "metal",
    "electricity",
]

OUTPUT_DIR = Path(".")

IMAGE_SIZE = 512
SEARCH_RESULTS = 10

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/140.0 Safari/537.36"
)


def download_image(url: str) -> bytes | None:
    """Download image and return its bytes."""

    try:
        response = requests.get(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            },
            timeout=20,
        )

        response.raise_for_status()

        content_type = response.headers.get("Content-Type", "")

        if not content_type.startswith("image/"):
            return None

        return response.content

    except requests.RequestException:
        return None


def process_image(data: bytes) -> bytes | None:
    """Resize/crop image to a square JPEG."""

    try:
        image = Image.open(io.BytesIO(data))

        # Convert RGBA/P/etc. to RGB.
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Crop to square.
        width, height = image.size
        size = min(width, height)

        left = (width - size) // 2
        top = (height - size) // 2

        image = image.crop(
            (
                left,
                top,
                left + size,
                top + size,
            )
        )

        image = image.resize(
            (IMAGE_SIZE, IMAGE_SIZE),
            Image.Resampling.LANCZOS,
        )

        output = io.BytesIO()

        image.save(
            output,
            format="JPEG",
            quality=90,
            optimize=True,
        )

        return output.getvalue()

    except Exception:
        return None


async def search_images(page, query: str) -> list[str]:
    url = (
        "https://commons.wikimedia.org/w/api.php"
        "?action=query"
        "&generator=search"
        "&gsrnamespace=6"
        "&gsrlimit=20"
        f"&gsrsearch={quote_plus(query)}"
        "&prop=imageinfo"
        "&iiprop=url"
        "&format=json"
        "&origin=*"
    )

    try:
        payload = await page.evaluate(
            """
            async (u) => {
                const response = await fetch(u, {
                    method: 'GET',
                    headers: { 'accept': 'application/json' }
                });
                if (!response.ok) {
                    return null;
                }
                return await response.text();
            }
            """,
            url,
        )

        if not payload:
            return []

        data = json.loads(payload)
        pages = data.get("query", {}).get("pages", {})

        urls = []

        for page_data in pages.values():
            imageinfo = page_data.get("imageinfo", [])
            if not imageinfo:
                continue

            image_url = imageinfo[0].get("url")
            if not image_url:
                continue

            if image_url not in urls:
                urls.append(image_url)

            if len(urls) >= SEARCH_RESULTS:
                break

        return urls

    except Exception as error:
        print(f"    Browser error: {error}")
        return []


async def process_element(page, element: str) -> None:
    output = OUTPUT_DIR / f"{element}.jpeg"

    if output.exists():
        print(f"[SKIP]   {element}")
        return

    print(f"[SEARCH] {element}")

    query = f"{element} element icon"

    urls = await search_images(page, query)

    if not urls:
        print(f"[FAIL]   {element} — no images found")
        return

    print(f"         found {len(urls)} candidates")

    for index, url in enumerate(urls, start=1):
        print(f"         trying image {index}/{len(urls)}...", end=" ")

        data = await asyncio.to_thread(download_image, url)

        if data is None:
            print("download failed")
            continue

        processed = await asyncio.to_thread(process_image, data)

        if processed is None:
            print("invalid image")
            continue

        try:
            output.write_bytes(processed)
        except OSError as error:
            print(f"save failed: {error}")
            return

        print("OK")
        print(f"[ OK ]   {element} -> {output}")

        return

    print(f"[FAIL]   {element} — could not download any image")


async def main() -> None:
    print("Google Images downloader")
    print("========================")
    print()

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            headless=True,
        )

        context = await browser.new_context(
            user_agent=USER_AGENT,
            viewport={
                "width": 1920,
                "height": 1080,
            },
        )

        page = await context.new_page()

        for element in ELEMENTS:
            await process_element(page, element)

            # Don't send requests too quickly.
            await asyncio.sleep(1)

        await browser.close()

    print()
    print("Finished.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nInterrupted.")
        sys.exit(1)
