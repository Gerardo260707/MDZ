# Cómo personalizar el sitio

## 1) Archivos JavaScript (2 scripts)
- `app.js`: idioma ES/EN, persistencia y propagación de `?lang=`.
- `site-pages.js`: lógica de páginas (home, categorías, personalizador y footer negro global).

## 2) Home (3 cuadros)
Ahora los 3 cuadros muestran:
- **Mosaicos**
- **Personalizar**
- **Colores**

Las imágenes siguen cargando de `assets/cuadros/`.

## 3) ¿Dónde agrego los modelos PNG?
Los modelos se cargan desde una carpeta raíz llamada:
- `Tapiz/`

Estructura esperada:
- `Tapiz/Modelo_A/modelo.png`
- `Tapiz/Modelo_B/imagen.png`

Cada carpeta dentro de `Tapiz/` representa un modelo.

## 4) Importar modelos desde carpetas de Tapiz/
1. Crea tus carpetas dentro de `Tapiz/` y coloca un `.png` por modelo.
2. (Opcional) Edita categorías en `config/categorias.csv`.
3. Ejecuta:
   - `python3 scripts/import_tapiz.py`

Resultado:
- Copia PNG a `assets/modelos/`
- Genera `config/modelos.json` con nombres, categoría e identificador.

> En `mosaicos.php` ya NO se muestran ejemplos si no hay modelos.

## 5) Personalizador (PNG)
- Todas las imágenes de modelo son PNG.
- La paleta usa colores específicos (la paleta que compartiste).
- El mosaico en vista principal se actualiza con esos tonos seleccionados.

## 6) ¿Cómo compartirme tu base de datos?
Puedes hacerlo de cualquiera de estas formas:
1. Exporta SQL (phpMyAdmin > Exportar > SQL) y súbelo al repositorio como `config/tu_export.sql`.
2. O comparte:
   - estructura de tabla
   - 5 a 10 filas de ejemplo
   - credenciales de desarrollo local

También te dejo plantilla de esquema en:
- `config/mosaicos_schema.sql`

## 7) Categorías + identificadores
Categorías soportadas:
- `cenefa`
- `esquina`
- `centro`
- `hexagonales`
- `antiderrapante`

Identificador automático (si no se llena en BD/JSON):
- `CEN-0001`, `ESQ-0002`, `CTR-0003`, `HEX-0004`, `ANT-0005`

## 8) Orden en la página
`mosaicos.php` ordena por grupos:
1. centros
2. cenefas y esquinas
3. hexagonales
4. antiderrapante

Y dentro de cada grupo, orden alfabético por nombre.

## 9) Conectar base de datos (catálogo)
1. Copia `config/database.example.php` a `config/database.php`.
2. Ajusta credenciales.
3. Crea tabla `mosaicos` (puedes usar `config/mosaicos_schema.sql`).
4. Abre `mosaicos.php` y se listarán automáticamente.

## 10) Ajustes finos del personalizador
### Relleno por zona (pixel a pixel)
Puedes ajustar tolerancia del flood-fill creando una variable global antes de `site-pages.js`:

```html
<script>
window.CUSTOMIZER_FILL = {
  tolerance: 105,      // similitud respecto al color semilla
  edgeTolerance: 50    // qué tanto salto de borde permite entre píxeles vecinos
};
</script>
```

### Paleta editable con identificadores únicos
Edita `customizer-colors.js` con este formato:

```js
{ id: 'R57', hex: '#9B3536', name: 'Rojo barro' }
```

### Plantilla del PDF (tamaño carta y layout editable)
Edita `customizer-pdf-template.js` para mover elementos, cambiar textos y agregar logo.
- Tamaño carta: `page.widthPt = 612`, `page.heightPt = 792`
- Para logo usa ruta en `logo.src` (ejemplo: `assets/logo.png`).

### Imagen de franja de mosaicos (línea superior)
La franja usa la variable CSS:
- `--mosaic-strip-image` en `assets.css`

Por defecto apunta a:
- `assets/strip-mosaicos-linea.svg`

Puedes reemplazar ese archivo o cambiar la ruta en CSS.
