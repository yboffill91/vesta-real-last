-- Script para actualizar la contraseña del usuario admin
-- Nueva contraseña: Adminl0cal.

UPDATE Users SET password = '$2b$12$A/.OMCnZv0UPl3Jcq4FTsO1jl5w/gcrUuITTHRNHJINfqWYPshgym' WHERE username = 'admin';

-- Verifica que se haya actualizado correctamente
SELECT id, username, role FROM Users WHERE username = 'admin';
