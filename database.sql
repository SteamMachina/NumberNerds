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

CREATE TABLE categories (
   name VARCHAR(50) PRIMARY KEY
);

CREATE TABLE operations (
   operation_id INT PRIMARY KEY AUTO_INCREMENT,
   amount DECIMAL(10,2) NOT NULL,
   category VARCHAR(50) NOT NULL,
   label VARCHAR(50) NOT NULL,
   date DATE NOT NULL,
   payer_id INT NOT NULL,
   FOREIGN KEY (payer_id) REFERENCES users(user_id),
   FOREIGN KEY (category) REFERENCES categories(name)
);

CREATE TABLE shares (
   receiver_id INT,
   operation_id INT,
   percentage TINYINT NOT NULL,
   PRIMARY KEY (receiver_id, operation_id),
   FOREIGN KEY (receiver_id) REFERENCES users(user_id),
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

-- Insert categories
INSERT INTO categories (name) VALUES
('Groceries'),
('Transport'),
('Dining'),
('Utilities'),
('Entertainment'),
('Shopping'),
('Health'),
('Education'),
('Travel'),
('Insurance'),
('Rent'),
('Subscriptions'),
('Pets'),
('Salary'),
('Other');

-- Insert fake operations (spendings are negative, gains are positive)
INSERT INTO operations (amount, category, label, date, payer_id) VALUES
(-50.00, 'Groceries', 'Supermarket', '2024-05-01', 1),
(-30.00, 'Transport', 'Gas', '2024-05-02', 2),
(-80.00, 'Dining', 'Restaurant', '2024-05-03', 3),
(-45.00, 'Entertainment', 'Cinema', '2024-05-04', 4),
(-60.00, 'Shopping', 'Market', '2024-05-05', 5),
(-25.00, 'Health', 'Pharmacy', '2024-05-06', 2),
(-100.00, 'Rent', 'Monthly Rent', '2024-05-07', 3),
(-15.00, 'Subscriptions', 'Music Service', '2024-05-08', 4),
(-40.00, 'Pets', 'Vet Visit', '2024-05-09', 5),
(1200.00, 'Salary', 'Monthly Salary', '2024-05-10', 1);

-- Insert fake friendships
INSERT INTO befriend (user_id, friend_id) VALUES
(1, 2), (2, 1),
(2, 3), (3, 2),
(1, 3), (3, 1),
(4, 5), (5, 4),
(5, 6), (6, 5),
(6, 7), (7, 6),
(4, 7), (7, 4);