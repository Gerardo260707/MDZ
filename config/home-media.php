<?php
header('Content-Type: application/javascript; charset=UTF-8');

function scan_images(string $dir): array {
    $ext = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
    if (!is_dir($dir)) return [];
    $items = [];
    foreach (scandir($dir) ?: [] as $name) {
        if ($name === '.' || $name === '..') continue;
        $path = $dir . '/' . $name;
        if (!is_file($path)) continue;
        $e = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($e, $ext, true)) continue;
        $items[] = ['name' => $name, 'path' => $path, 'mtime' => @filemtime($path) ?: time()];
    }
    usort($items, static fn($a, $b) => strnatcasecmp($a['name'], $b['name']));
    return $items;
}

$root = dirname(__DIR__);
$carrusel = scan_images($root . '/assets/carrusel');
$cuadros = scan_images($root . '/assets/cuadros');

$slides = array_map(static function($it){
    return ['image' => 'assets/carrusel/' . rawurlencode($it['name']) . '?v=' . $it['mtime'], 'title' => '', 'subtitle' => ''];
}, $carrusel);
$cards = array_map(static function($it){
    return 'assets/cuadros/' . rawurlencode($it['name']) . '?v=' . $it['mtime'];
}, array_slice($cuadros, 0, 3));

echo 'window.HOME_CAROUSEL_ASSETS = ' . json_encode($slides, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';';
echo "\n";
echo 'window.HOME_FEATURE_IMAGES = ' . json_encode($cards, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';';
