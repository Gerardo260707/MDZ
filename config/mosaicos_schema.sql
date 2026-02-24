CREATE TABLE IF NOT EXISTS mosaicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria ENUM('cenefa','esquina','centro','hexagonales','antiderrapante') NOT NULL,
  identificador VARCHAR(30) DEFAULT NULL,
  imagen VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ejemplo de inserción:
-- INSERT INTO mosaicos (nombre, categoria, identificador, imagen, descripcion, precio)
-- VALUES ('Alcazar', 'cenefa', 'CEN-0001', 'assets/vectores/alcazar.svg', 'Modelo Alcazar', 100.00);

-- Consulta ordenada alfabéticamente (como usa el sitio):
-- SELECT * FROM mosaicos ORDER BY nombre COLLATE utf8mb4_unicode_ci ASC;
