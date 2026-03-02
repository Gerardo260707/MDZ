# PHP 5.6 compatibility patch (sin eliminar el código actual)

Este proyecto hoy usa sintaxis de PHP 7/8 en varios archivos (`??`, `fn()`, `match`, tipos de parámetros y retornos).

## Qué sí agrega este parche
- `compat-php56.php` con polyfills para:
  - `str_starts_with`
  - `str_contains`
  - helper `dz_array_get()`

Esto evita errores de *función inexistente* en servidores viejos.

## Qué falta para que funcione al 100% en PHP 5.6
Además de los polyfills, hay que convertir sintaxis que PHP 5.6 no parsea:
- `??`
- `fn(...) => ...`
- `match (...)`
- `function foo(string $x): array`

## Recomendación práctica
1. Mantener el código actual para PHP 8 (sin borrar nada).
2. Crear rama/pack `legacy-php56` generado automáticamente (transpilado), o subir el servidor a PHP 8.1+.
3. Mientras tanto, incluir `compat-php56.php` al inicio de páginas críticas para prevenir errores por funciones.

## Incluye este archivo en páginas críticas
```php
require_once __DIR__ . '/compat-php56.php';
```

Archivos recomendados:
- `mosaicos.php`
- `personalizar.php`
- `tapetes.php`
- `especiales.php`
- `especiales-personalizar.php`
