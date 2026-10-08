"""AUDIT ONLY — build labelled thumbnail contact sheets + Step 4 simulations."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).parent
THUMB_W = 480


def load(j):
    p = ROOT / j
    return json.loads(p.read_text()) if p.exists() else None


def contact_sheet(vp, theme, out_name, cols=6):
    d = ROOT / 'screens' / vp / theme
    shots = sorted(d.glob('*.png'))
    thumbs = []
    for s in shots:
        im = Image.open(s).convert('RGB')
        w, h = im.size
        tw = THUMB_W
        th = round(h * tw / w)
        thumbs.append((s.stem, im.resize((tw, th), Image.LANCZOS)))
    if not thumbs:
        print('no shots for', vp, theme)
        return
    rows = (len(thumbs) + cols - 1) // cols
    label_h = 22
    sheet = Image.new('RGB', (cols * (THUMB_W + 8) + 8, rows * (thumbs[0][1].height + label_h + 8) + 8), 'white')
    dr = ImageDraw.Draw(sheet)
    for i, (stem, t) in enumerate(thumbs):
        x = 8 + (i % cols) * (THUMB_W + 8)
        y = 8 + (i // cols) * (t.height + label_h + 8)
        sheet.paste(t, (x, y))
        dr.text((x + 4, y + t.height + 4), stem, fill='black')
    out = ROOT / out_name
    sheet.save(out)
    print('wrote', out, sheet.size)


def downscales(src_name, out_prefix, sizes=((960, 540), (640, 360))):
    src = ROOT / 'screens' / '1920x1080' / 'paper' / src_name
    if not src.exists():
        print('missing', src_name)
        return
    im = Image.open(src).convert('RGB')
    for w, h in sizes:
        im.resize((w, h), Image.LANCZOS).save(ROOT / f'{out_prefix}-{w}x{h}.png')
    # greyscale + CVD simulations at full res
    im.convert('L').save(ROOT / f'{out_prefix}-grey.png')
    # protanopia / deuteranopia approximation matrices (sRGB, 3x4 tuples)
    apply = {
        'protan': (0.567, 0.433, 0.0, 0.0, 0.558, 0.442, 0.0, 0.0, 0.0, 0.242, 0.758, 0.0),
        'deutan': (0.625, 0.375, 0.0, 0.0, 0.7, 0.3, 0.0, 0.0, 0.0, 0.3, 0.7, 0.0),
    }
    for name, m in apply.items():
        im.convert('RGB', m).save(ROOT / f'{out_prefix}-{name}.png')
    print('wrote sims for', src_name)


if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if which in ('all', 'contacts'):
        for vp in ('1920x1080', '1366x768'):
            for theme in ('paper', 'ink'):
                contact_sheet(vp, theme, f'contact-{vp}-{theme}.png')
    if which in ('all', 'sims'):
        for s in sys.argv[2:] or []:
            downscales(s, 'sim-' + Path(s).stem)
