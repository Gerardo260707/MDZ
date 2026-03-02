# Legacy PHP 5.6 phase (sin borrar el código actual)

Este directorio es la salida de la fase de downgrade para servidores PHP 5.6.

## Flujo
1. Mantienes el código principal actual (PHP moderno).
2. Ejecutas el generador de downgrade para producir copias legacy aquí.
3. Publicas **solo** estos archivos en tu entorno PHP 5.6.

## Generación
```bash
php tools/build-php56-legacy.php
```

## Nota
El generador está marcado como experimental y se debe validar en staging PHP 5.6 antes de producción.
