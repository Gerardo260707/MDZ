# Cómo personalizar el sitio

## 1) Navegación por archivos independientes
Cada menú abre un archivo distinto:
- `index.html`
- `mosaicos.php`
- `galeria.html`
- `mantenimiento.html`
- `instalacion.html`
- `contacto.html`
- `pago.html`

## 2) Cambiar imágenes de los 3 cuadros (inicio)
Pega tus imágenes en `assets/cuadros/` con estos nombres:
- `galeria.jpg`
- `instalacion.jpg`
- `contacto.jpg`

Si usas PNG, cambia los nombres/extensión en `FEATURE_CARDS` dentro de `index.html`.

## 3) Cambiar carrusel
En `index.html`, edita:
- `CAROUSEL_SLIDES` (texto y fondo)
- `AUTO_CHANGE_MS` (velocidad)

## 4) Conectar base de datos (catálogo)
1. Copia `config/database.example.php` a `config/database.php`.
2. Ajusta credenciales.
3. Crea tabla `mosaicos` con campos sugeridos:
   - `id`, `nombre`, `imagen`, `descripcion`, `precio`
4. Abre `mosaicos.php` y se listarán automáticamente.
