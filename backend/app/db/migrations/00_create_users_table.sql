-- Migración inicial para crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(32) NOT NULL,
    surname VARCHAR(32) NOT NULL,
    username VARCHAR(32) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Soporte', 'Administrador', 'Dependiente') NOT NULL
);

-- Insertar un usuario de soporte por defecto si no existe ninguno
INSERT INTO Users (name, surname, username, password, role)
SELECT 'Soporte', 'Tecnico', 'soporte', '$2b$12$A/.OMCnZv0UPl3Jcq4FTsO1jl5w/gcrUuITTHRNHJINfqWYPshgym', 'Soporte'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE username = 'soporte');
