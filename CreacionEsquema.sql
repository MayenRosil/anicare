-- ============================================================================
-- SCRIPT DE CREACIÓN - BASE DE DATOS ANICARE (ACTUALIZADO)
-- Fecha: Noviembre 2025
-- Descripción: Esquema completo con mejoras al módulo de pacientes
-- ✨ NUEVO: Soporte para "PACIENTE NUEVO" en citas (id_paciente NULLABLE)
-- ============================================================================

-- Crear la base de datos
DROP DATABASE IF EXISTS anicare;
CREATE DATABASE anicare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE anicare;

-- ============================================================================
-- TABLAS DE SISTEMA Y SEGURIDAD
-- ============================================================================

-- Tabla: Rol
CREATE TABLE Rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Tabla: Usuario
CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    id_rol INT,
    ultimo_login DATETIME,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_rol) REFERENCES Rol(id)
);

-- ============================================================================
-- TABLAS DE GESTIÓN DE PROPIETARIOS Y PACIENTES
-- ============================================================================

-- Tabla: Propietario
CREATE TABLE Propietario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dpi VARCHAR(13),
    nit VARCHAR(10),
    direccion TEXT,
    telefono VARCHAR(20),
    correo VARCHAR(100)
);

-- Tabla: Especie
CREATE TABLE Especie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla: Raza
-- ✨ CAMBIO: Agregado campo 'especie_personalizada'
CREATE TABLE Raza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_especie INT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    especie_personalizada VARCHAR(100) NULL COMMENT 'Nombre de especie personalizada cuando id_especie=3',
    FOREIGN KEY (id_especie) REFERENCES Especie(id)
);

-- Tabla: Paciente
-- ✨ CAMBIOS: Agregados campos 'castrado', 'adoptado', 'fecha_adopcion', 'edad_aproximada'
CREATE TABLE Paciente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_propietario INT,
    id_raza INT,
    nombre VARCHAR(100) NOT NULL,
    sexo ENUM('M','F') NOT NULL,
    fecha_nacimiento DATE,
    color VARCHAR(50),
    castrado BOOLEAN DEFAULT FALSE,
    adoptado BOOLEAN DEFAULT FALSE,
    fecha_adopcion DATE NULL,
    edad_aproximada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_propietario) REFERENCES Propietario(id),
    FOREIGN KEY (id_raza) REFERENCES Raza(id)
);

-- ============================================================================
-- TABLAS DE PERSONAL MÉDICO
-- ============================================================================

-- Tabla: Doctor
CREATE TABLE Doctor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    dpi VARCHAR(20),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    colegiado VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
);

-- ============================================================================
-- TABLAS DE ATENCIÓN MÉDICA
-- ============================================================================

-- Tabla: Cita
-- ✨ NUEVO: id_paciente ahora es NULLABLE para soportar "PACIENTE NUEVO"
CREATE TABLE Cita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NULL COMMENT 'NULL = PACIENTE NUEVO (datos pendientes de registro)',
    id_doctor INT,
    id_usuario_registro INT,
    fecha_hora DATETIME NOT NULL,
    estado ENUM('Pendiente', 'Atendida', 'Cancelada') DEFAULT 'Pendiente',
    comentario TEXT COMMENT 'Motivo de la cita',
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_doctor) REFERENCES Doctor(id),
    FOREIGN KEY (id_usuario_registro) REFERENCES Usuario(id)
);

-- Tabla: Consulta (con signos vitales)
CREATE TABLE Consulta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT,
    id_doctor INT,
    id_usuario_registro INT,
    id_cita INT NULL,
    fecha_hora DATETIME NOT NULL,
    estado ENUM('Abierta', 'Finalizada', 'Cancelada') DEFAULT 'Abierta',
    notas_adicionales TEXT,
    motivo_consulta TEXT COMMENT 'Motivo de la consulta (copiado del comentario de la cita)',
    peso DECIMAL(5,2),
    temperatura DECIMAL(4,2),
    frecuencia_cardiaca INT,
    frecuencia_respiratoria INT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id),
    FOREIGN KEY (id_doctor) REFERENCES Doctor(id),
    FOREIGN KEY (id_usuario_registro) REFERENCES Usuario(id),
    FOREIGN KEY (id_cita) REFERENCES Cita(id)
);

-- Tabla: Diagnostico
CREATE TABLE Diagnostico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla: DiagnosticoConsulta
CREATE TABLE DiagnosticoConsulta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_consulta INT,
    id_diagnostico INT,
    tipo VARCHAR(50),
    estado ENUM('Activo', 'Resuelto') DEFAULT 'Activo',
    comentarios TEXT,
    FOREIGN KEY (id_consulta) REFERENCES Consulta(id),
    FOREIGN KEY (id_diagnostico) REFERENCES Diagnostico(id)
);

-- ============================================================================
-- TABLAS DE MEDICAMENTOS E INVENTARIO
-- ============================================================================

-- Tabla: Medicamento
CREATE TABLE Medicamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    laboratorio VARCHAR(100) NOT NULL,
    presentacion VARCHAR(100),
    unidad_medida VARCHAR(50),
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2),
    ganancia_venta DECIMAL(10,2),
    stock_actual INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: MovimientosInventario
CREATE TABLE MovimientosInventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_medicamento INT NOT NULL,
    tipo_movimiento ENUM('Entrada', 'Salida') NOT NULL,
    cantidad INT NOT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    id_usuario INT,
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
);

-- Tabla: Tratamiento
CREATE TABLE Tratamiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_diagnostico_consulta INT,
    id_medicamento INT,
    dosis VARCHAR(100),
    frecuencia VARCHAR(100),
    duracion VARCHAR(100),
    instrucciones TEXT,
    FOREIGN KEY (id_diagnostico_consulta) REFERENCES DiagnosticoConsulta(id),
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id)
);

-- ============================================================================
-- TABLA DE LOGS
-- ============================================================================

-- Tabla: LogSistema
CREATE TABLE LogSistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    modulo VARCHAR(100),
    accion VARCHAR(255),
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
);

-- ============================================================================
-- INSERCIÓN DE DATOS INICIALES
-- ============================================================================

-- Roles del sistema
INSERT INTO Rol (nombre, descripcion) VALUES
('admin', 'Administrador del sistema'),
('doctor', 'Doctor que atiende pacientes');

-- Usuarios por defecto
-- Contraseña para 'admin': admin123
-- Contraseña para 'ana': ana123
INSERT INTO Usuario (nombre_usuario, correo, contraseña, id_rol, activo) VALUES
('admin', 'admin@anicare.com', '$2b$10$uN7vMwGGY3H97GeBcQozvu59kENGU4S72MitJS/C1J1Dr.DfBONTO', 1, true),
('ana', 'ana@anicare.com', '$2b$10$7iXS3eP9eJMNooR.T9KWBuz53nsJCpyLViTT9ctYsKXynPUJphyyW', 2, true);

-- ✨ ESPECIES (Solo 3: Canino, Felino, Otro)
INSERT INTO Especie (id, nombre, descripcion) VALUES
(1, 'Canino', 'Perros de todas las razas'),
(2, 'Felino', 'Gatos de todas las razas'),
(3, 'Otro', 'Otras especies animales (aves, reptiles, roedores, etc.)');

-- ✨ RAZAS CANINAS (Especie 1)
INSERT INTO Raza (id_especie, nombre, descripcion, especie_personalizada) VALUES
(1, 'Labrador Retriever', 'Raza amigable y activa', NULL),
(1, 'Pastor Alemán', 'Raza inteligente y leal', NULL),
(1, 'Golden Retriever', 'Raza familiar y amigable', NULL),
(1, 'Bulldog Francés', 'Raza pequeña y juguetona', NULL),
(1, 'Chihuahua', 'Raza muy pequeña', NULL),
(1, 'Beagle', 'Raza cazadora de tamaño mediano', NULL),
(1, 'Poodle', 'Raza inteligente, varias tallas', NULL),
(1, 'Rottweiler', 'Raza guardiana y protectora', NULL),
(1, 'Yorkshire Terrier', 'Raza miniatura de pelo largo', NULL),
(1, 'Dachshund', 'Raza alargada y de patas cortas', NULL),
(1, 'Husky Siberiano', 'Raza de trabajo y compañía', NULL),
(1, 'Boxer', 'Raza energética y protectora', NULL),
(1, 'Mestizo', 'Perro de raza mixta', NULL);

-- ✨ RAZAS FELINAS (Especie 2)
INSERT INTO Raza (id_especie, nombre, descripcion, especie_personalizada) VALUES
(2, 'Persa', 'Gato de pelo largo y cara aplanada', NULL),
(2, 'Siamés', 'Gato oriental de color claro con extremidades oscuras', NULL),
(2, 'Maine Coon', 'Gato grande de pelo semi-largo', NULL),
(2, 'Bengalí', 'Gato con patrón de leopardo', NULL),
(2, 'Esfinge', 'Gato sin pelo', NULL),
(2, 'Ragdoll', 'Gato grande y dócil', NULL),
(2, 'Británico de pelo corto', 'Gato robusto de pelo corto', NULL),
(2, 'Angora', 'Gato de pelo largo y sedoso', NULL),
(2, 'Scottish Fold', 'Gato con orejas plegadas', NULL),
(2, 'Mestizo', 'Gato de raza mixta', NULL),
(2, 'Doméstico', 'Gato común sin raza específica', NULL);

-- ✨ OTRAS ESPECIES (Especie 3) - Ejemplos
INSERT INTO Raza (id_especie, nombre, descripcion, especie_personalizada) VALUES
(3, 'Periquito', 'Ave pequeña doméstica', 'Ave'),
(3, 'Canario', 'Ave cantora', 'Ave'),
(3, 'Loro', 'Ave parlante', 'Ave'),
(3, 'Conejo', 'Mamífero pequeño', 'Conejo'),
(3, 'Hámster', 'Roedor pequeño', 'Roedor'),
(3, 'Cobayo', 'Roedor mediano', 'Roedor'),
(3, 'Iguana', 'Reptil herbívoro', 'Reptil'),
(3, 'Tortuga', 'Reptil con caparazón', 'Reptil'),
(3, 'Hurón', 'Mamífero carnívoro pequeño', 'Hurón');

-- Doctor de ejemplo
INSERT INTO Doctor (id_usuario, nombre, apellido, especialidad, dpi, telefono, correo, activo) VALUES
(2, 'Ana', 'Maldonado', 'Medicina veterinaria', '1234567890101', '55556666', 'ana@anicare.com', true);

-- Diagnóstico placeholder
INSERT INTO Diagnostico (id, nombre, descripcion) VALUES
(1, 'Sin diagnóstico', 'Diagnóstico temporal utilizado para consultas automáticas')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Medicamento placeholder
INSERT INTO Medicamento (id, nombre, laboratorio, presentacion, unidad_medida, precio_compra, precio_venta, ganancia_venta, stock_actual) VALUES
(1, 'Sin especificar', 'N/A', 'N/A', 'N/A', 0.00, 0.00, 0.00, 0)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Medicamentos de ejemplo
INSERT INTO Medicamento (nombre, laboratorio, presentacion, unidad_medida, precio_compra, precio_venta, ganancia_venta, stock_actual) VALUES
('Amoxicilina', 'Bayer', 'Tabletas 500mg', 'Tableta', 2.50, 5.00, 2.50, 100),
('Meloxicam', 'Boehringer', 'Inyectable 5mg/ml', 'ml', 15.00, 25.00, 10.00, 50),
('Dexametasona', 'Pfizer', 'Inyectable 4mg/ml', 'ml', 8.00, 15.00, 7.00, 75),
('Omeprazol', 'Laboratorios Unidos', 'Cápsulas 20mg', 'Cápsula', 1.50, 3.50, 2.00, 200),
('Ivermectina', 'MSD', 'Solución oral 1%', 'ml', 12.00, 22.00, 10.00, 60),
('Metronidazol', 'Bayer', 'Tabletas 250mg', 'Tableta', 1.80, 4.00, 2.20, 150);

-- Propietario de ejemplo
INSERT INTO Propietario (nombre, apellido, dpi, nit, direccion, telefono, correo) VALUES
('Juan', 'Pérez', '1234567890101', '12345678', 'Zona 10, Guatemala', '12345678', 'juan@example.com');

-- ✨ Paciente de ejemplo (con campos nuevos)
INSERT INTO Paciente (id_propietario, id_raza, nombre, sexo, fecha_nacimiento, color, castrado, adoptado, fecha_adopcion, edad_aproximada) VALUES
(1, 1, 'Fido', 'M', '2020-01-15', 'Dorado', true, false, NULL, false);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT 'Base de datos creada exitosamente!' AS Mensaje;
SELECT CONCAT('✓ ', COUNT(*), ' Roles creados') AS Resultado FROM Rol;
SELECT CONCAT('✓ ', COUNT(*), ' Usuarios creados') AS Resultado FROM Usuario;
SELECT CONCAT('✓ ', COUNT(*), ' Especies creadas') AS Resultado FROM Especie;
SELECT CONCAT('✓ ', COUNT(*), ' Razas creadas') AS Resultado FROM Raza;
SELECT CONCAT('✓ ', COUNT(*), ' Doctores creados') AS Resultado FROM Doctor;
SELECT CONCAT('✓ ', COUNT(*), ' Medicamentos creados') AS Resultado FROM Medicamento;
SELECT CONCAT('✓ ', COUNT(*), ' Pacientes de ejemplo') AS Resultado FROM Paciente;

-- Verificar estructura de la tabla Paciente
DESCRIBE Paciente;

-- Verificar razas por especie
SELECT
    e.nombre AS Especie,
    COUNT(r.id) AS Total_Razas
FROM Especie e
LEFT JOIN Raza r ON e.id = r.id_especie
GROUP BY e.id, e.nombre
ORDER BY e.id;