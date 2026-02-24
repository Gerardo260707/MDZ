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

## 3) ¿Dónde agrego los vectores para personalizar?
Pégalos en:
- `assets/vectores/`

Referencia:
- `assets/vectores/README.txt`

Ejemplo de ruta guardada en BD:
- `assets/vectores/alcazar.svg`

## 4) Personalizador por secciones (vector)
- Elige un color en la paleta.
- Da clic con el mouse en una sección del mosaico vectorial para aplicarlo.
- Puedes seguir cambiando colores en otras secciones del mismo mosaico.
- La vista grande se actualiza automáticamente con el patrón personalizado.

## 5) ¿Cómo compartirme tu base de datos?
Puedes hacerlo de cualquiera de estas formas:
1. Exporta SQL (phpMyAdmin > Exportar > SQL) y súbelo al repositorio como `config/tu_export.sql`.
2. O comparte:
   - estructura de tabla
   - 5 a 10 filas de ejemplo
   - credenciales de desarrollo local

También te dejo plantilla de esquema en:
- `config/mosaicos_schema.sql`

## 6) Categorías + identificadores
Categorías soportadas:
- `cenefa`
- `esquina`
- `centro`
- `hexagonales`
- `antiderrapante`

Identificador automático (si no se llena en BD):
- `CEN-0001`, `ESQ-0002`, `CTR-0003`, `HEX-0004`, `ANT-0005`

## 7) Orden alfabético en la página
La lista de modelos se ordena alfabéticamente por nombre en `mosaicos.php` (aunque insertes uno al final, si empieza con A saldrá primero).

## 8) Conectar base de datos (catálogo)
1. Copia `config/database.example.php` a `config/database.php`.
2. Ajusta credenciales.
3. Crea tabla `mosaicos` (puedes usar `config/mosaicos_schema.sql`).
4. Abre `mosaicos.php` y se listarán automáticamente.
