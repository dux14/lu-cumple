#!/usr/bin/env python3
"""Procesa los sprites de pixel art del muchacho (1024x1024, fondo magenta).

Uso: python3 scripts/process-avatar.py <carpeta con 1-saluda.png ... 8-asoma.png>

- Quita el magenta (clave por min(R,B)-G) y hace despill de los bordes.
- El arte de IA no cae en una grilla exacta (paso ~11-12 px): se remuestrea a
  una grilla nativa de PITCH px por celda tomando la mediana del centro de
  cada celda (sin interpolar, así los píxeles quedan nítidos).
- Todas las poses comparten origen horizontal y línea de pies; 8-asoma se
  alinea a su borde inferior. Salida: public/avatar/<pose>.png (+ sizes).
Los originales no se versionan.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

PITCH = 10.8          # px de origen por píxel nativo -> personaje de ~64 px
X0, X1 = 218, 726     # ventana horizontal común (px de origen)
BASE = 871            # línea de pies común (px de origen)
TOP = 140
OVERRIDE_BASE = {'6-maleta': 858, '8-asoma': 992}
OUT = Path(__file__).resolve().parent.parent / 'public' / 'avatar'


def key_score(a):
    return np.minimum(a[..., 0], a[..., 2]) - a[..., 1]


def sample(a, fg, x_left, y_bottom, ncols, nrows):
    out = np.zeros((nrows, ncols, 4), np.uint8)
    for r in range(nrows):
        yb = y_bottom - r * PITCH
        y0, y1 = yb - PITCH, yb
        if y1 < 0 or y0 > a.shape[0]:
            continue
        for c in range(ncols):
            x0 = x_left + c * PITCH
            x1 = x0 + PITCH
            ya, yb_, xa, xb = [int(round(v)) for v in (y0, y1, x0, x1)]
            ya, xa = max(ya, 0), max(xa, 0)
            cell = fg[ya:yb_, xa:xb]
            if cell.size == 0 or cell.mean() < 0.5:
                continue
            m = int(PITCH * 0.25)
            sub = a[ya + m:yb_ - m, xa + m:xb - m]
            sf = fg[ya + m:yb_ - m, xa + m:xb - m]
            px = sub[sf] if sf.any() else a[ya:yb_, xa:xb][cell]
            out[nrows - 1 - r, c, :3] = np.median(px, axis=0)
            out[nrows - 1 - r, c, 3] = 255
    return out


def clean_edges(px):
    """Quita celdas de borde con tinte magenta y neutraliza el resto."""
    alpha = px[..., 3] > 0
    pad = np.pad(alpha, 1)
    inner = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
    edge = alpha & ~inner
    rgb = px[..., :3].astype(int)
    s = key_score(rgb)
    kill = edge & (s > 45)
    px[kill] = 0
    # despill: las celdas de borde con tinte (s > 20) toman el color medio de
    # sus vecinas interiores en vez de conservar el rosado
    edge &= ~kill
    inner_mask = alpha & ~edge
    for y, x in zip(*np.where(edge & (s > 20))):
        vec = [px[y + dy, x + dx, :3].astype(int)
               for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1))
               if 0 <= y + dy < px.shape[0] and 0 <= x + dx < px.shape[1]
               and inner_mask[y + dy, x + dx]]
        if vec:
            px[y, x, :3] = np.mean(vec, axis=0).astype(np.uint8)
        else:
            px[y, x] = 0
    return px


def trim(px):
    ys, xs = np.where(px[..., 3] > 0)
    return ys.min(), ys.max() + 1, xs.min(), xs.max() + 1


def main(src):
    src = Path(src)
    OUT.mkdir(parents=True, exist_ok=True)
    ncols = int(round((X1 - X0) / PITCH))
    nrows = int(round((BASE - TOP) / PITCH))
    results = {}
    for f in sorted(src.glob('*.png')):
        name = f.stem
        a = np.array(Image.open(f).convert('RGB')).astype(int)
        fg = key_score(a) < 110
        base = OVERRIDE_BASE.get(name, BASE)
        px = clean_edges(sample(a, fg, X0, base, ncols, nrows))
        results[name] = px
    # Recorte común: unión de bboxes de las poses de cuerpo completo; 8 aparte.
    full = [n for n in results if n != '8-asoma']
    t = min(trim(results[n])[0] for n in full)
    b = nrows
    l = min(trim(results[n])[2] for n in full)
    r = max(trim(results[n])[3] for n in full)
    meta = {}
    for n, px in results.items():
        if n == '8-asoma':
            # mismo ancho y origen X que el resto (cabeza centrada igual);
            # solo se recorta el vacío de arriba, la base queda en el borde
            y0 = trim(px)[0]
            crop = px[y0:b, l:r]
        else:
            crop = px[t:b, l:r]
        im = Image.fromarray(crop)
        path = OUT / f'{n}.png'
        im.save(path, optimize=True)
        meta[n] = {'w': im.width, 'h': im.height, 'bytes': path.stat().st_size}
    print(json.dumps(meta, indent=1))
    print('total bytes', sum(m['bytes'] for m in meta.values()))


if __name__ == '__main__':
    main(sys.argv[1])
