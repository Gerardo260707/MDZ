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

function file_key_and_lang(string $name): array {
    $stem = pathinfo($name, PATHINFO_FILENAME);
    if (preg_match('/^(.*?)(?:[_\-.](es|en))$/i', $stem, $m)) {
        $key = strtolower(trim((string)$m[1]));
        $lang = strtolower((string)$m[2]);
        return [$key !== '' ? $key : strtolower($stem), $lang];
    }
    return [strtolower($stem), ''];
}

function build_image_rel(string $folder, string $name, int $mtime): string {
    return 'assets/' . trim($folder, '/') . '/' . rawurlencode($name) . '?v=' . $mtime;
}

$root = dirname(__DIR__);
$carrusel = scan_images($root . '/assets/carrusel');
$carruselEs = scan_images($root . '/assets/carrusel/es');
$carruselEn = scan_images($root . '/assets/carrusel/en');
$cuadros = scan_images($root . '/assets/cuadros');

$slidesByKey = [];
foreach ($carrusel as $it) {
    [$key, $lang] = file_key_and_lang((string)$it['name']);
    if (!isset($slidesByKey[$key])) $slidesByKey[$key] = ['order' => $key, 'title' => '', 'subtitle' => ''];
    $imageRel = build_image_rel('carrusel', (string)$it['name'], (int)$it['mtime']);
    if ($lang === 'es' || $lang === 'en') {
        $slidesByKey[$key]['image_' . $lang] = $imageRel;
    } else {
        $slidesByKey[$key]['image'] = $imageRel;
    }
}

foreach ($carruselEs as $it) {
    [$key] = file_key_and_lang((string)$it['name']);
    if (!isset($slidesByKey[$key])) $slidesByKey[$key] = ['order' => $key, 'title' => '', 'subtitle' => ''];
    $slidesByKey[$key]['image_es'] = build_image_rel('carrusel/es', (string)$it['name'], (int)$it['mtime']);
}

foreach ($carruselEn as $it) {
    [$key] = file_key_and_lang((string)$it['name']);
    if (!isset($slidesByKey[$key])) $slidesByKey[$key] = ['order' => $key, 'title' => '', 'subtitle' => ''];
    $slidesByKey[$key]['image_en'] = build_image_rel('carrusel/en', (string)$it['name'], (int)$it['mtime']);
}

$slides = array_values($slidesByKey);
usort($slides, static fn($a, $b) => strnatcasecmp((string)($a['order'] ?? ''), (string)($b['order'] ?? '')));
$slides = array_map(static function($slide) {
    unset($slide['order']);
    return $slide;
}, $slides);

$cards = array_map(static function($it){
    return 'assets/cuadros/' . rawurlencode($it['name']) . '?v=' . $it['mtime'];
}, array_slice($cuadros, 0, 3));

echo 'window.HOME_CAROUSEL_ASSETS = ' . json_encode($slides, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';';
echo PHP_EOL;
echo 'window.HOME_FEATURE_IMAGES = ' . json_encode($cards, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';';
