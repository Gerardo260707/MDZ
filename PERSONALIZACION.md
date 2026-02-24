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

## 3) Personalizador por secciones (vector)
- Elige un color en la paleta.
- Da clic con el mouse en una sección del mosaico vectorial para aplicarlo.
- Puedes seguir cambiando colores en otras secciones del mismo mosaico.
- La vista grande se actualiza automáticamente con el patrón personalizado.

## 4) Imágenes vectoriales reales
- Al entrar desde `mosaicos.php`, se envía `img` y `name` al personalizador.
- Si `img` apunta a un `.svg`, el editor usa ese SVG para recolorar por secciones.
- Si todavía no hay SVG real, usa una plantilla temporal.

## 5) Footer negro en todas las páginas
Se agrega automáticamente al final de cada página con:
- información de contacto
- dirección
- políticas
- redes sociales

## 6) Conectar base de datos (catálogo)
1. Copia `config/database.example.php` a `config/database.php`.
2. Ajusta credenciales.
3. Crea tabla `mosaicos`: `id`, `nombre`, `imagen`, `descripcion`, `precio`.
4. Abre `mosaicos.php` y se listarán automáticamente.
