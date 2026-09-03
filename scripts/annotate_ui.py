"""
UI Annotation Tool (Precision Arrows & Numbered Callout Badges)
Generates high-definition, anti-aliased UI callout annotations on screenshots.
"""

import math
import argparse
import json
import os
from PIL import Image, ImageDraw, ImageFont

def annotate_image(
    image_path: str,
    output_path: str,
    annotations: list,
    color=(249, 115, 22, 255), # Default Vibrant Orange #f97316
    text_color=(15, 23, 42, 255),
    badge_radius=18,
    scale=3
):
    base_img = Image.open(image_path).convert('RGBA')
    w, h = base_img.size

    # Supersample canvas for high-quality antialiasing
    canvas_w, canvas_h = w * scale, h * scale
    overlay = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Font setup
    scaled_radius = badge_radius * scale
    try:
        font = ImageFont.truetype('arialbd.ttf', int(20 * scale))
    except:
        font = ImageFont.load_default()

    SHADOW = (0, 0, 0, 85)

    def draw_arrow(start, end, line_width=2.5*scale, arrow_size=10*scale):
        x1, y1 = start
        x2, y2 = end
        draw.line([start, end], fill=color, width=int(line_width))
        angle = math.atan2(y2 - y1, x2 - x1)
        p1 = end
        p2 = (
            end[0] - arrow_size * math.cos(angle - math.pi / 6),
            end[1] - arrow_size * math.sin(angle - math.pi / 6)
        )
        p3 = (
            end[0] - arrow_size * math.cos(angle + math.pi / 6),
            end[1] - arrow_size * math.sin(angle + math.pi / 6)
        )
        draw.polygon([p1, p2, p3], fill=color)

    def draw_badge(center, number):
        cx, cy = center
        r = scaled_radius
        # Soft Drop Shadow
        draw.ellipse([cx - r + 2*scale, cy - r + 3*scale, cx + r + 2*scale, cy + r + 3*scale], fill=SHADOW)
        # White Fill
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 255))
        # Colored Outline
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=int(3.5 * scale))
        # Number Text
        text = str(number)
        bbox = font.getbbox(text)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = cx - tw / 2
        ty = cy - th / 2 - bbox[1] + (r * 0.05)
        draw.text((tx, ty), text, font=font, fill=text_color)

    for item in annotations:
        badge_pt = (item['badge'][0] * scale, item['badge'][1] * scale)
        target_pt = (item['target'][0] * scale, item['target'][1] * scale)
        num = item['num']

        # Arrow starts on badge perimeter
        angle = math.atan2(target_pt[1] - badge_pt[1], target_pt[0] - badge_pt[0])
        arrow_start = (
            badge_pt[0] + scaled_radius * math.cos(angle),
            badge_pt[1] + scaled_radius * math.sin(angle)
        )

        draw_arrow(arrow_start, target_pt)
        draw_badge(badge_pt, num)

    # Downscale overlay with Lanczos filter for smooth edges
    overlay_resized = overlay.resize((w, h), Image.Resampling.LANCZOS)
    final_img = Image.alpha_composite(base_img, overlay_resized)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_img.convert('RGB').save(output_path, quality=95)
    print(f"Annotated image saved: {output_path}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Annotate UI Screenshot")
    parser.add_argument('--input', required=True, help="Path to input image")
    parser.add_argument('--output', required=True, help="Path to output image")
    parser.add_argument('--config', required=True, help="JSON file or string containing annotations")
    args = parser.parse_args()

    if os.path.exists(args.config):
        with open(args.config, 'r', encoding='utf-8') as f:
            annotations = json.load(f)
    else:
        annotations = json.loads(args.config)

    annotate_image(args.input, args.output, annotations)
