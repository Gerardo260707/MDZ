# Cómo personalizar el sitio

## 1) Navegación por archivos independientes
- `index.html` (inicio)
- `mosaicos.html` (categorías de mosaicos)
- `mosaicos.php` (decorados: lista de modelos 4 por fila)
- `personalizar.php` (simulador por mosaico)
- `galeria.html`, `mantenimiento.html`, `instalacion.html`, `contacto.html`, `pago.html`

## 2) Idioma real (ES / EN)
- El selector 🇲🇽 / 🇺🇸 cambia los textos del sitio.
- Se conserva idioma entre páginas con `?lang=` y `localStorage`.
- Los nombres de mosaicos NO se traducen (se respetan como vienen de la BD).

## 3) Cambiar imágenes de los 3 cuadros (inicio)
Pega tus imágenes en `assets/cuadros/` con estos nombres:
- `galeria.jpg`
- `instalacion.jpg`
- `contacto.jpg`

## 4) Decorados + personalizar
- En `mosaicos.html`, el bloque **Decorados** dirige a `mosaicos.php`.
- En `mosaicos.php`, cada mosaico tiene botón **Personalizar** a `personalizar.php?id=...`.
- En `personalizar.php`, la paleta actualiza la vista grande al aplicar color.

## 5) Conectar base de datos (catálogo)
1. Copia `config/database.example.php` a `config/database.php`.
2. Ajusta credenciales.
3. Crea tabla `mosaicos`: `id`, `nombre`, `imagen`, `descripcion`, `precio`.
4. Abre `mosaicos.php` y se listarán automáticamente.
