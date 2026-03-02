<?php
/**
 * Experimental PHP 5.6 legacy builder.
 * Keeps current PHP 8 files untouched and emits downgraded copies in legacy-php56/.
 */
$root = dirname(__DIR__);
$outDir = $root . '/legacy-php56';
if (!is_dir($outDir)) {
    mkdir($outDir, 0775, true);
}

$targets = [
    'mosaicos.php',
    'personalizar.php',
    'tapetes.php',
    'especiales.php',
    'especiales-personalizar.php',
];

function downgrade_function_signature($code) {
    return preg_replace_callback(
        '/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^\)]*)\)\s*:\s*([a-zA-Z_\\?][a-zA-Z0-9_\\?]*)\s*\{/',
        function ($m) {
            $name = $m[1];
            $args = $m[2];
            $args = preg_replace('/\b(?:array|string|int|float|bool|callable|iterable|object)\s+\$/', '$', $args);
            $args = preg_replace('/\?\s*(array|string|int|float|bool|callable|iterable|object)\s+\$/', '$', $args);
            return 'function ' . $name . '(' . $args . ') {';
        },
        $code
    );
}

function downgrade_typed_params($code) {
        $code = preg_replace('/\?\s*\$/', '$', $code);
    return preg_replace('/\b(?:array|string|int|float|bool|callable|iterable|object)\s+\$/', '$', $code);
}

function downgrade_arrow_functions($code) {
    return preg_replace_callback('/fn\s*\(([^\)]*)\)\s*=>\s*([^;\n]+)([;\n])/', function ($m) {
        return 'function(' . $m[1] . '){ return ' . trim($m[2]) . '; }' . $m[3];
    }, $code);
}

function downgrade_null_coalesce($code) {
    // Best-effort pass for common expressions.
    for ($i = 0; $i < 8; $i++) {
        $next = preg_replace('/([^\s\(\);]+)\s*\?\?\s*([^\n;\)]+)/', '(isset($1) ? $1 : $2)', $code);
        if ($next === $code) break;
        $code = $next;
    }
    return $code;
}

function downgrade_match_blocks($code) {
    // Project-specific known match blocks.
    $map = [
        "return match (\$cat) {\n        'cenefa' => 'CEN',\n        'esquina' => 'ESQ',\n        'centro' => 'CTR',\n        'cenefa_exterior' => 'CEX',\n        'esquina_exterior' => 'EEX',\n        'hexagonales' => 'HEX',\n        'antiderrapante' => 'ANT',\n        default => 'MOD',\n    };" =>
        "switch (\$cat) {\n        case 'cenefa': return 'CEN';\n        case 'esquina': return 'ESQ';\n        case 'centro': return 'CTR';\n        case 'cenefa_exterior': return 'CEX';\n        case 'esquina_exterior': return 'EEX';\n        case 'hexagonales': return 'HEX';\n        case 'antiderrapante': return 'ANT';\n        default: return 'MOD';\n    }",
    ];
    return strtr($code, $map);
}

foreach ($targets as $file) {
    $src = $root . '/' . $file;
    if (!file_exists($src)) continue;
    $code = file_get_contents($src);
    $code = downgrade_match_blocks($code);
    $code = downgrade_function_signature($code);
    $code = downgrade_typed_params($code);
    $code = downgrade_arrow_functions($code);
    $code = downgrade_null_coalesce($code);

    $code = preg_replace("/require_once __DIR__ \\.'\/compat-php56.php';\\n/", "", $code);
    $header = "<?php\nrequire_once __DIR__ . '/../compat-php56.php';\n";
    $code = preg_replace('/^<\?php\n/', $header, $code, 1);

    file_put_contents($outDir . '/' . $file, $code);
    echo "built: {$file}\n";
}
