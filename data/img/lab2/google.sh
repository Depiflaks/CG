#!/usr/bin/env bash

set -uo pipefail

OUTPUT_DIR="."

ELEMENTS=(
    air
    steam
    mud
    dust
    lava
    rain
    energy
    stone
    sand
    glass
    cloud
    storm
    plant
    tree
    ash
    metal
    electricity
)

# ------------------------------------------------------------
# Dependencies
# ------------------------------------------------------------

for cmd in curl python3 convert; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "ERROR: '$cmd' is not installed."
        echo
        echo "Install dependencies:"
        echo "  sudo apt install curl python3 imagemagick"
        exit 1
    fi
done

# ------------------------------------------------------------
# Search Google Images and extract thumbnail URLs
# ------------------------------------------------------------

get_image_url() {
    local query="$1"

    curl -L -s \
        --compressed \
        --max-time 20 \
        -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36" \
        "https://www.google.com/search?tbm=isch&hl=en&safe=active&q=${query// /+}" |
    python3 -c '
import sys
import re
import html

data = sys.stdin.read()

# Google Images thumbnails.
patterns = [
    r"https://encrypted-tbn0\.gstatic\.com/images\?[^\"\\ ]+",
    r"https:\\/\\/encrypted-tbn0\.gstatic\.com\\/images\?[^\"\\ ]+",
]

urls = []

for pattern in patterns:
    for match in re.findall(pattern, data):
        url = html.unescape(match)
        url = url.replace("\\/", "/")
        url = url.replace("\\u003d", "=")
        url = url.replace("\\u0026", "&")

        if url not in urls:
            urls.append(url)

# Print several candidates so the shell can try them.
for url in urls[:10]:
    print(url)
'
}

# ------------------------------------------------------------
# Download
# ------------------------------------------------------------

download_image() {
    local url="$1"
    local output="$2"
    local tmp="$3"

    curl -L -s \
        --fail \
        --max-time 30 \
        -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36" \
        "$url" \
        -o "$tmp" || return 1

    # Validate and convert to JPEG.
    convert "$tmp" \
        -auto-orient \
        -resize "512x512^" \
        -gravity center \
        -extent 512x512 \
        -quality 90 \
        "$output" 2>/dev/null || return 1

    return 0
}

# ------------------------------------------------------------
# Main
# ------------------------------------------------------------

echo "Downloading element images from Google Images..."
echo

for element in "${ELEMENTS[@]}"; do
    output="${OUTPUT_DIR}/${element}.jpeg"

    if [[ -f "$output" ]]; then
        echo "[SKIP]   $element"
        continue
    fi

    echo "[SEARCH] $element"

    # Better search query for the type of images needed by the lab.
    query="${element} element icon"

    mapfile -t urls < <(get_image_url "$query")

    if [[ ${#urls[@]} -eq 0 ]]; then
        echo "[FAIL]   $element — Google returned no images"
        continue
    fi

    success=false
    tmp=$(mktemp)

    for url in "${urls[@]}"; do
        if download_image "$url" "$output" "$tmp"; then
            echo "[ OK ]   $element -> $output"
            success=true
            break
        fi
    done

    rm -f "$tmp"

    if [[ "$success" != true ]]; then
        echo "[FAIL]   $element — could not download image"
        rm -f "$output"
    fi

    # Don't hammer Google.
    sleep 1
done

echo
echo "Finished."
