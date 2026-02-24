#!/usr/bin/env python3
from __future__ import annotations
import csv
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZIP_PATH = ROOT / 'Tapiz.zip'
OUT_DIR = ROOT / 'assets' / 'modelos'
MAP_PATH = ROOT / 'config' / 'categorias.csv'
JSON_PATH = ROOT / 'config' / 'modelos.json'

VALID_CATS = ['centro', 'cenefa', 'esquina', 'hexagonales', 'antiderrapante']


def slugify(name: str) -> str:
    name = name.lower().strip()
    name = re.sub(r'[^a-z0-9]+', '-', name)
    return name.strip('-') or 'modelo'


def title_from_file(stem: str) -> str:
    clean = re.sub(r'[_\-]+', ' ', stem).strip()
    return re.sub(r'\s+', ' ', clean).title()


def load_mapping() -> dict[str, str]:
    if not MAP_PATH.exists():
        return {}
    m: dict[str, str] = {}
    with MAP_PATH.open('r', encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            archivo = (row.get('archivo') or '').strip().lower()
            categoria = (row.get('categoria') or '').strip().lower()
            if archivo and categoria in VALID_CATS:
                m[archivo] = categoria
    return m


def main() -> int:
    if not ZIP_PATH.exists():
        print(f'ERROR: No se encontró {ZIP_PATH}')
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    mapping = load_mapping()

    files = []
    with zipfile.ZipFile(ZIP_PATH) as z:
        for info in z.infolist():
            if info.is_dir():
                continue
            if not info.filename.lower().endswith('.png'):
                continue
            name = Path(info.filename).name
            stem = Path(name).stem
            slug = slugify(stem)
            out_name = f'{slug}.png'
            out_path = OUT_DIR / out_name
            data = z.read(info)
            out_path.write_bytes(data)
            files.append(out_name)

    files = sorted(set(files))
    records = []
    counters = {'centro':0,'cenefa':0,'esquina':0,'hexagonales':0,'antiderrapante':0}
    pref = {'centro':'CTR','cenefa':'CEN','esquina':'ESQ','hexagonales':'HEX','antiderrapante':'ANT'}

    for idx, fname in enumerate(files, start=1):
        cat = mapping.get(fname.lower(), 'centro')
        if cat not in counters:
            cat = 'centro'
        counters[cat] += 1
        ident = f"{pref[cat]}-{counters[cat]:04d}"
        records.append({
            'id': idx,
            'nombre': title_from_file(Path(fname).stem),
            'imagen': f'assets/modelos/{fname}',
            'categoria': cat,
            'identificador': ident,
        })

    JSON_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')

    if not MAP_PATH.exists():
        with MAP_PATH.open('w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['archivo', 'categoria'])
            for r in records:
                writer.writerow([Path(r['imagen']).name, r['categoria']])

    print(f'OK: {len(records)} modelos importados en {JSON_PATH}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
