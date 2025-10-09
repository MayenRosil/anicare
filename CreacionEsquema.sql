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
    -- agregar id especie
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
-- HACER QUE ID Y ID_USUARIO SEA UNA LLAVE COMPUESTA, PERMITE REPETIR REGISTROS
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

-- Tabla: Consulta
CREATE TABLE Consulta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT,
    id_doctor INT,
    id_usuario_registro INT,
    id_cita INT NULL,
    fecha_hora DATETIME NOT NULL,
    estado ENUM('Abierta', 'Finalizada', 'Cancelada') DEFAULT 'Abierta',
    notas_adicionales TEXT,
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

INSERT INTO Raza (id_especie, nombre, descripcion)
VALUES (1, 'Labrador Retriever', 'Raza amigable y activa');

INSERT INTO Doctor (id_usuario, nombre, apellido, especialidad, dpi, telefono, correo, activo)
VALUES (2, 'Ana', 'Maldonado', 'Medicina veterinaria', '1234567890101', '55556666', 'ana@anicare.com', true);

-- ---------------------------------
-- SELECTS PARA PRUEBAS
select * from propietario
