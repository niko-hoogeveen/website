"""One-off: regenerate favicon assets that satisfy Google's favicon guidelines.

The previous src/app/favicon.ico was actually a PNG with an .ico extension, which
Googlebot-Image can fail to parse. This emits a real multi-resolution ICO plus
PNG icons.
"""

from PIL import Image

src = Image.open("src/app/favicon.ico").convert("RGBA")
print("source:", src.size, src.mode)

src.resize((512, 512), Image.LANCZOS).save("public/icon.png", "PNG")
src.resize((180, 180), Image.LANCZOS).save("public/apple-touch-icon.png", "PNG")
src.save(
    "public/favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
print("wrote public/favicon.ico, public/icon.png, public/apple-touch-icon.png")
