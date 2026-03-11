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
  tolerance: 48,             // distancia RGB global respecto al píxel semilla (más estricto)
  channelTolerance: 20,      // límite por canal semilla
  lumaTolerance: 12,         // separación por luminosidad contra semilla
  edgeTolerance: 16,         // salto RGB permitido entre píxeles vecinos
  edgeChannelTolerance: 10,  // salto máximo por canal entre vecinos
  neighborLumaTolerance: 8,  // salto de luminosidad permitido entre vecinos
  minAlpha: 250,             // ignora casi por completo bordes anti-aliased/transparencias
  homogeneityTolerance: 14,  // qué tan parecido al color semilla deben ser vecinos directos
  minSimilarNeighbors: 3,    // vecinos requeridos (0-4) para considerar píxel dentro de una zona estable
  useDiagonal: false         // en true puede cruzar esquinas y “comerse” áreas adyacentes
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

## 11) Carrusel principal con imágenes reales
Para usar imágenes en el carrusel del inicio:

1. Sube tus imágenes a esta carpeta exacta:
   - `assets/carrusel/`
2. Edita este archivo:
   - `config/home-carousel.js`
3. Agrega cada slide así:

```js
window.HOME_CAROUSEL = [
  {
    image: 'assets/carrusel/promo-1.jpg',
    title: '¡NUEVAS COLECCIONES!',
    subtitle: 'DISEÑOS PERSONALIZADOS PARA TU ESPACIO'
  },
  {
    image: 'assets/carrusel/promo-2.jpg',
    title: 'ENVÍOS A TODO MÉXICO',
    subtitle: 'COMPRA DESDE CUALQUIER ESTADO'
  }
];
```

> Si `window.HOME_CAROUSEL` queda vacío, el sitio usa los slides de respaldo.

## 12) Dónde definir si un modelo es centro/cenefa/esquina
Tienes 3 rutas válidas (en este orden de prioridad):

1. **Base de datos** (`mosaicos.categoria`)
2. **JSON** (`config/modelos.json` → campo `categoria`)
3. **CSV de mapeo** (`config/categorias.csv`)

Valores válidos de `categoria`:
- `centro`
- `cenefa`
- `esquina`
- `hexagonales`
- `antiderrapante`

### Opción más simple (carpetas Tapiz)
1. Edita `config/categorias.csv` con columnas:
   - `carpeta_modelo,categoria`
2. Ejemplo:

```csv
carpeta_modelo,categoria
Maya_Centro,centro
Maya_Cenefa,cenefa
Maya_Esquina,esquina
```

3. Ejecuta:
   - `python3 scripts/import_tapiz.py`

Eso genera `config/modelos.json` con categoría correcta.

## 13) Vincular cenefa con esquina en personalización
La página `personalizar.php` ahora tiene dos buscadores:
- `Seleccionar centro`
- `Seleccionar cenefa`

Cuando eliges una **cenefa**, el sistema busca automáticamente una **esquina** compatible por familia (nombre/carpeta parecida, por ejemplo `Maya_Cenefa` con `Maya_Esquina`).

Para que funcione perfecto:
- usa nombres consistentes por familia (`Maya_Centro`, `Maya_Cenefa`, `Maya_Esquina`),
- y asigna bien la categoría (`centro`, `cenefa`, `esquina`).


## 14) Archivo único para ruta + categoría (sin duplicar imágenes)
El archivo que debes revisar/editar es:
- `config/modelos.json`

Ahí verás automáticamente cada modelo con:
- `imagen`: ruta al PNG dentro de `Tapiz/`
- `categoria`: `centro`, `cenefa`, `esquina`, `antiderrapante`, `hexagonales`
- `identificador`: código del modelo

Ejemplo:

```json
{
  "id": 1,
  "nombre": "Maya Centro",
  "imagen": "Tapiz/Maya_Centro/modelo.png",
  "categoria": "centro",
  "identificador": "CTR-0001"
}
```

### Paso a paso recomendado
1. Crea carpeta del modelo en `Tapiz/` y pon su PNG ahí.
2. Asigna categoría en `config/categorias.csv` (carpeta vs categoría).
3. Ejecuta `python3 scripts/import_tapiz.py`.
4. Se actualiza `config/modelos.json` con rutas directas a `Tapiz/` (ya no se copia a `assets/modelos/`).
