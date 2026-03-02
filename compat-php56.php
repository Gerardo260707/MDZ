<?php
/**
 * Compat layer for PHP 5.6+ shared helpers.
 * Safe to include in PHP 8 as well.
 */

if (!function_exists('str_starts_with')) {
    function str_starts_with($haystack, $needle) {
        $haystack = (string)$haystack;
        $needle = (string)$needle;
        if ($needle === '') return true;
        return substr($haystack, 0, strlen($needle)) === $needle;
    }
}

if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle) {
        $haystack = (string)$haystack;
        $needle = (string)$needle;
        if ($needle === '') return true;
        return strpos($haystack, $needle) !== false;
    }
}

if (!function_exists('dz_array_get')) {
    function dz_array_get($array, $key, $default = null) {
        return (is_array($array) && array_key_exists($key, $array)) ? $array[$key] : $default;
    }
}
