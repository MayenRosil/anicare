-- Crear la base de datos
DROP DATABASE IF EXISTS anicare;
CREATE DATABASE anicare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE anicare;

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

-- Tabla: Propietario
CREATE TABLE Propietario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dpi VARCHAR(20) NOT NULL,
    nit VARCHAR(20),
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
CREATE TABLE Raza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_especie INT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (id_especie) REFERENCES Especie(id)
);

-- Tabla: Paciente
CREATE TABLE Paciente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_propietario INT,
    id_raza INT,
    nombre VARCHAR(100) NOT NULL,
    sexo ENUM('M','F') NOT NULL,
    fecha_nacimiento DATE,
    color VARCHAR(50),
    FOREIGN KEY (id_propietario) REFERENCES Propietario(id),
    FOREIGN KEY (id_raza) REFERENCES Raza(id)
);

-- Tabla: Caracteristicas_Paciente
CREATE TABLE Caracteristicas_Paciente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT,
    esterilizado BOOLEAN DEFAULT FALSE,
    talla ENUM('Pequeño', 'Mediano', 'Grande') DEFAULT 'Mediano',
    peso DECIMAL(5,2),
    observaciones TEXT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id)
);

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
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
);

-- Tabla: Cita
CREATE TABLE Cita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT,
    id_doctor INT,
    id_usuario_registro INT,
    fecha_hora DATETIME NOT NULL,
    estado ENUM('Pendiente', 'Atendida', 'Cancelada') DEFAULT 'Pendiente',
    comentario TEXT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id),
    FOREIGN KEY (id_doctor) REFERENCES Doctor(id),
    FOREIGN KEY (id_usuario_registro) REFERENCES Usuario(id)
);

-- Tabla: Consulta (✨ ACTUALIZADA con signos vitales)
CREATE TABLE Consulta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT,
    id_doctor INT,
    id_usuario_registro INT,
    id_cita INT NULL,
    fecha_hora DATETIME NOT NULL,
    estado ENUM('Abierta', 'Finalizada', 'Cancelada') DEFAULT 'Abierta',
    notas_adicionales TEXT,
    -- ✨ NUEVOS CAMPOS - Signos vitales y examen previo
    motivo_consulta TEXT,
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

-- Tabla: Medicamento
CREATE TABLE Medicamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    laboratorio VARCHAR(100),
    presentacion VARCHAR(100),
    unidad_medida VARCHAR(50),
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2),
    ganancia_venta DECIMAL(10,2),
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0
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

-- Tabla: LogSistema
CREATE TABLE LogSistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    modulo VARCHAR(100),
    accion VARCHAR(255),
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
);

-- -------------------------------
-- INSERCION DE REGISTROS POR DEFECTO
INSERT INTO Rol (nombre, descripcion)
VALUES ('admin', 'Administrador del sistema');

INSERT INTO Rol (nombre, descripcion)
VALUES ('doctor', 'Doctor que atiende pacientes');

INSERT INTO Usuario (nombre_usuario, correo, contraseña, id_rol, activo)
VALUES ('admin', 'admin@anicare.com', '$2b$10$uN7vMwGGY3H97GeBcQozvu59kENGU4S72MitJS/C1J1Dr.DfBONTO', 1, true);

INSERT INTO Usuario (nombre_usuario, correo, contraseña, id_rol, activo)
VALUES ('ana', 'ana@anicare.com', '$2b$10$7iXS3eP9eJMNooR.T9KWBuz53nsJCpyLViTT9ctYsKXynPUJphyyW', 2, true);

INSERT INTO Especie (nombre, descripcion)
VALUES ('Perro', 'Mamífero doméstico común');

INSERT INTO Especie (nombre, descripcion)
VALUES ('Gato', 'Mamífero doméstico común');

INSERT INTO Raza (id_especie, nombre, descripcion)
VALUES (1, 'Labrador Retriever', 'Raza amigable y activa');

INSERT INTO Raza (id_especie, nombre, descripcion)
VALUES (1, 'Pastor Alemán', 'Raza inteligente y leal');

INSERT INTO Raza (id_especie, nombre, descripcion)
VALUES (2, 'Persa', 'Gato de pelo largo');

INSERT INTO Doctor (id_usuario, nombre, apellido, especialidad, dpi, telefono, correo, activo)
VALUES (2, 'Ana', 'Maldonado', 'Medicina veterinaria', '1234567890101', '55556666', 'ana@anicare.com', true);

-- Placeholder para diagnóstico genérico
INSERT INTO Diagnostico (id, nombre, descripcion)
VALUES (1, 'Sin diagnóstico', 'Diagnóstico temporal utilizado para consultas automáticas')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Placeholder para medicamento genérico
INSERT INTO Medicamento (
  id,
  nombre,
  laboratorio,
  presentacion,
  unidad_medida,
  precio_compra,
  precio_venta,
  ganancia_venta,
  stock_actual,
  stock_minimo
)
VALUES (
  1,
  'Sin especificar',
  'N/A',
  'N/A',
  'N/A',
  0.00,
  0.00,
  0.00,
  0,
  0
)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ✨ Medicamentos de ejemplo
INSERT INTO Medicamento (nombre, laboratorio, presentacion, unidad_medida, precio_compra, precio_venta, ganancia_venta, stock_actual, stock_minimo)
VALUES 
('Amoxicilina', 'Bayer', 'Tabletas 500mg', 'Tableta', 2.50, 5.00, 2.50, 100, 20),
('Meloxicam', 'Boehringer', 'Inyectable 5mg/ml', 'ml', 15.00, 25.00, 10.00, 50, 10),
('Dexametasona', 'Pfizer', 'Inyectable 4mg/ml', 'ml', 8.00, 15.00, 7.00, 75, 15),
('Omeprazol', 'Laboratorios Unidos', 'Cápsulas 20mg', 'Cápsula', 1.50, 3.50, 2.00, 200, 30),
('Ivermectina', 'MSD', 'Solución oral 1%', 'ml', 12.00, 22.00, 10.00, 60, 10),
('Metronidazol', 'Bayer', 'Tabletas 250mg', 'Tableta', 1.80, 4.00, 2.20, 150, 25);


-- Datos de ejemplo para pruebas
INSERT INTO Propietario (nombre, apellido, dpi, nit, direccion, telefono, correo)
VALUES ('Juan', 'Pérez', '1234567890101', '12345678', 'Zona 10, Guatemala', '12345678', 'juan@example.com');

INSERT INTO Paciente (id_propietario, id_raza, nombre, sexo, fecha_nacimiento, color)
VALUES (1, 1, 'Fido', 'M', '2020-01-15', 'Dorado');

-- ---------------------------------
-- SELECTS PARA PRUEBAS
SELECT 'Base de datos creada exitosamente!' AS Mensaje;
SELECT * FROM Rol;
SELECT * FROM Usuario;
SELECT * FROM Doctor;
SELECT * FROM Especie;
SELECT * FROM Raza;