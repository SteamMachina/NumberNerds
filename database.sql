-------------------------------------
-- Creation of database and tables --
-------------------------------------

CREATE DATABASE IF NOT EXISTS numbernerds;
USE numbernerds;

CREATE TABLE users (
   user_id INT PRIMARY KEY AUTO_INCREMENT,
   email VARCHAR(50) NOT NULL UNIQUE,
   password_hash VARCHAR(255) NOT NULL,
   name VARCHAR(50) NOT NULL,
   total_money DECIMAL(10,2) NOT NULL
);

CREATE TABLE operations (
   operation_id INT PRIMARY KEY AUTO_INCREMENT,
   amount DECIMAL(10,2) NOT NULL,
   category VARCHAR(50) NOT NULL,
   label VARCHAR(50) NOT NULL,
   date DATETIME NOT NULL,
   payer_id INT NOT NULL,
   FOREIGN KEY (payer_id) REFERENCES users(user_id)
);

CREATE TABLE shares (
   user_id INT,
   operation_id INT,
   percentage TINYINT NOT NULL,
   PRIMARY KEY (user_id, operation_id),
   FOREIGN KEY (user_id) REFERENCES users(user_id),
   FOREIGN KEY (operation_id) REFERENCES operations(operation_id)
);

CREATE TABLE befriend (
   user_id INT,
   friend_id INT,
   owed_money DECIMAL(10,2) DEFAULT 0.00,
   PRIMARY KEY (user_id, friend_id),
   FOREIGN KEY (user_id) REFERENCES users(user_id),
   FOREIGN KEY (friend_id) REFERENCES users(user_id)
);

----------------------------
-- Insertion of fake data --
----------------------------

-- Insert fake users
INSERT INTO users (email, password_hash, name, total_money) VALUES
('alice@example.com', 'hash_alice', 'Alice', 120.50),
('bob@example.com', 'hash_bob', 'Bob', 75.00),
('carol@example.com', 'hash_carol', 'Carol', 200.00),
('david@example.com', 'hash_david', 'David', 150.75),
('emma@example.com', 'hash_emma', 'Emma', 95.25),
('frank@example.com', 'hash_frank', 'Frank', 180.00),
('grace@example.com', 'hash_grace', 'Grace', 225.50);

-- Insert fake operations
INSERT INTO operations (amount, category, label, date, payer_id) VALUES
(50.00, 'Groceries', 'Supermarket', '2024-05-01 10:00:00', 1),
(30.00, 'Transport', 'Gas', '2024-05-02 15:30:00', 2),
(80.00, 'Dining', 'Restaurant', '2024-05-03 19:00:00', 3),
(45.00, 'Entertainment', 'Cinema', '2024-05-04 20:00:00', 4),
(120.00, 'Shopping', 'Electronics', '2024-05-05 14:20:00', 5),
(25.50, 'Food', 'Pizza', '2024-05-06 19:45:00', 6),
(60.00, 'Sports', 'Gym Equipment', '2024-05-07 11:30:00', 7),
(90.00, 'Utilities', 'Internet Bill', '2024-05-08 09:15:00', 4);

-- Insert fake shares
INSERT INTO shares (user_id, operation_id, percentage) VALUES
(1, 1, 50),
(2, 1, 50),
(2, 2, 60),
(3, 2, 40),
(1, 3, 30),
(3, 3, 70),
(4, 4, 70),
(5, 4, 30),
(5, 5, 50),
(6, 5, 50),
(6, 6, 40),
(7, 6, 60),
(4, 7, 45),
(7, 7, 55),
(4, 8, 100);

-- Insert fake friendships
INSERT INTO befriend (user_id, friend_id) VALUES
(1, 2),
(2, 3),
(1, 3),
(4, 5),
(5, 6),
(6, 7),
(4, 7);

