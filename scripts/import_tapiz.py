#!/usr/bin/env python3
from __future__ import annotations
import csv
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TAPIZ_DIR = ROOT / 'Tapiz'
OUT_DIR = ROOT / 'assets' / 'modelos'
MAP_PATH = ROOT / 'config' / 'categorias.csv'
JSON_PATH = ROOT / 'config' / 'modelos.json'

VALID_CATS = ['centro', 'cenefa', 'esquina', 'hexagonales', 'antiderrapante']


def slugify(name: str) -> str:
    name = name.lower().strip()
    name = re.sub(r'[^a-z0-9]+', '-', name)
    return name.strip('-') or 'modelo'


def title_from_folder(folder: str) -> str:
    clean = re.sub(r'[_\-]+', ' ', folder).strip()
    return re.sub(r'\s+', ' ', clean).title()


def load_mapping() -> dict[str, str]:
    if not MAP_PATH.exists():
        return {}
    m: dict[str, str] = {}
    with MAP_PATH.open('r', encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            carpeta = (row.get('carpeta_modelo') or '').strip().lower()
            categoria = (row.get('categoria') or '').strip().lower()
            if carpeta and categoria in VALID_CATS:
                m[carpeta] = categoria
    return m


def find_first_png(folder: Path) -> Path | None:
    pngs = sorted([p for p in folder.iterdir() if p.is_file() and p.suffix.lower() == '.png'])
    return pngs[0] if pngs else None


def main() -> int:
    if not TAPIZ_DIR.exists():
        print(f'ERROR: No se encontró la carpeta {TAPIZ_DIR}')
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    mapping = load_mapping()

    model_dirs = sorted([d for d in TAPIZ_DIR.iterdir() if d.is_dir()])
    if not model_dirs:
        print(f'ERROR: No hay carpetas de modelos dentro de {TAPIZ_DIR}')
        return 1

    records = []
    counters = {'centro': 0, 'cenefa': 0, 'esquina': 0, 'hexagonales': 0, 'antiderrapante': 0}
    pref = {'centro': 'CTR', 'cenefa': 'CEN', 'esquina': 'ESQ', 'hexagonales': 'HEX', 'antiderrapante': 'ANT'}

    idx = 1
    for model_dir in model_dirs:
        png = find_first_png(model_dir)
        if png is None:
            continue

        folder_name = model_dir.name
        slug = slugify(folder_name)
        out_name = f'{slug}.png'
        out_path = OUT_DIR / out_name
        shutil.copy2(png, out_path)

        cat = mapping.get(folder_name.lower(), 'centro')
        if cat not in counters:
            cat = 'centro'

        counters[cat] += 1
        ident = f"{pref[cat]}-{counters[cat]:04d}"

        records.append({
            'id': idx,
            'nombre': title_from_folder(folder_name),
            'imagen': f'assets/modelos/{out_name}',
            'categoria': cat,
            'identificador': ident,
            'carpeta_modelo': folder_name,
        })
        idx += 1

    if not records:
        print('ERROR: No se encontró ningún PNG válido en las carpetas de Tapiz/')
        return 1

    JSON_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')

    with MAP_PATH.open('w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['carpeta_modelo', 'categoria'])
        for r in records:
            writer.writerow([r['carpeta_modelo'], r['categoria']])

    print(f'OK: {len(records)} modelos importados desde carpetas de Tapiz/ en {JSON_PATH}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
