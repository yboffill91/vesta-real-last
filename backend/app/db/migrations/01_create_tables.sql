-- Migración SQL para crear todas las tablas necesarias para el sistema Vesta

-- Asegurar que la base de datos exista
-- CREATE DATABASE IF NOT EXISTS vestasys;
-- USE vestasys;

-- La tabla Users ya está creada previamente, pero por completitud aquí está su estructura
-- CREATE TABLE IF NOT EXISTS Users (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(32) NOT NULL,
--     surname VARCHAR(32) NOT NULL,
--     username VARCHAR(32) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     role ENUM('Soporte', 'Administrador', 'Dependiente') NOT NULL
-- );

-- Tabla de Configuración de Local
CREATE TABLE IF NOT EXISTS Establishment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    logo VARCHAR(255),
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'CUP',
    is_configured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Áreas de Venta
CREATE TABLE IF NOT EXISTS SalesAreas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    establishment_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (establishment_id) REFERENCES Establishment(id) ON DELETE CASCADE
);

-- Tabla de Puestos de Atención
CREATE TABLE IF NOT EXISTS ServiceSpots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_area_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 1,
    status ENUM('libre', 'ocupado', 'reservado', 'pedido_abierto', 'cobrado') DEFAULT 'libre',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_area_id) REFERENCES SalesAreas(id) ON DELETE CASCADE
);

-- Tabla de Categorías de Productos
CREATE TABLE IF NOT EXISTS ProductCategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS Products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (category_id) REFERENCES ProductCategories(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

-- Tabla de Cartas de Menú
CREATE TABLE IF NOT EXISTS Menus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    valid_date DATE NOT NULL,
    status ENUM('borrador', 'publicada', 'archivada') DEFAULT 'borrador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

-- Tabla de relación Menú-Área de Venta
CREATE TABLE IF NOT EXISTS MenuSalesAreas (
    menu_id INT NOT NULL,
    sales_area_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (menu_id, sales_area_id),
    FOREIGN KEY (menu_id) REFERENCES Menus(id) ON DELETE CASCADE,
    FOREIGN KEY (sales_area_id) REFERENCES SalesAreas(id) ON DELETE CASCADE
);

-- Tabla de Ítems de Menú
CREATE TABLE IF NOT EXISTS MenuItems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    menu_id INT NOT NULL,
    product_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_id) REFERENCES Menus(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- Tabla de Comandas (Pedidos)
CREATE TABLE IF NOT EXISTS Orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_spot_id INT NOT NULL,
    sales_area_id INT NOT NULL,
    menu_id INT NOT NULL,
    status ENUM('abierta', 'en_preparación', 'servida', 'cobrada', 'cancelada') DEFAULT 'abierta',
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    created_by INT NOT NULL,
    closed_by INT,
    FOREIGN KEY (service_spot_id) REFERENCES ServiceSpots(id),
    FOREIGN KEY (sales_area_id) REFERENCES SalesAreas(id),
    FOREIGN KEY (menu_id) REFERENCES Menus(id),
    FOREIGN KEY (created_by) REFERENCES Users(id),
    FOREIGN KEY (closed_by) REFERENCES Users(id)
);

-- Tabla de Ítems de Comanda
CREATE TABLE IF NOT EXISTS OrderItems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status ENUM('pendiente', 'en_preparación', 'listo', 'servido', 'cancelado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Insertar categorías predeterminadas
INSERT INTO ProductCategories (name, description) VALUES 
('Tragos', 'Bebidas alcohólicas mezcladas'),
('Bebidas', 'Refrescos, jugos y otras bebidas no alcohólicas'),
('Tablets', 'Combos y ofertas especiales'),
('Ofertas', 'Promociones temporales'),
('Infusiones', 'Tés, cafés y otras bebidas calientes'),
('Entrantes', 'Aperitivos y entradas'),
('Plato Principal', 'Platos principales'),
('Guarnición', 'Acompañamientos para platos principales'),
('Postres', 'Dulces y postres');
