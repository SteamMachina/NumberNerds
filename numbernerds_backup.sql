/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: numbernerds
-- ------------------------------------------------------
-- Server version	10.11.11-MariaDB-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `befriend`
--

DROP TABLE IF EXISTS `befriend`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `befriend` (
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `owed_money` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`user_id`,`friend_id`),
  KEY `friend_id` (`friend_id`),
  CONSTRAINT `befriend_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `befriend_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `befriend`
--

LOCK TABLES `befriend` WRITE;
/*!40000 ALTER TABLE `befriend` DISABLE KEYS */;
INSERT INTO `befriend` VALUES
(1,2,0.00),
(1,3,0.00),
(2,3,0.00),
(4,5,0.00),
(4,7,0.00),
(5,6,0.00),
(6,7,0.00);
/*!40000 ALTER TABLE `befriend` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
('Dining'),
('Education'),
('Entertainment'),
('Groceries'),
('Health'),
('Insurance'),
('Other'),
('Pets'),
('Rent'),
('Salary'),
('Shopping'),
('Subscriptions'),
('Transport'),
('Travel'),
('Utilities');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operations`
--

DROP TABLE IF EXISTS `operations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `operations` (
  `operation_id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `label` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `payer_id` int(11) NOT NULL,
  PRIMARY KEY (`operation_id`),
  KEY `payer_id` (`payer_id`),
  KEY `category` (`category`),
  CONSTRAINT `operations_ibfk_1` FOREIGN KEY (`payer_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `operations_ibfk_2` FOREIGN KEY (`category`) REFERENCES `categories` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operations`
--

LOCK TABLES `operations` WRITE;
/*!40000 ALTER TABLE `operations` DISABLE KEYS */;
INSERT INTO `operations` VALUES
(1,50.00,'Groceries','Supermarket','2024-05-01',1),
(2,30.00,'Transport','Gas','2024-05-02',2),
(3,80.00,'Dining','Restaurant','2024-05-03',3),
(4,45.00,'Entertainment','Cinema','2024-05-04',4),
(5,60.00,'Shopping','Market','2024-05-05',5),
(6,25.00,'Health','Pharmacy','2024-05-06',2),
(7,100.00,'Rent','Monthly Rent','2024-05-07',3),
(8,15.00,'Subscriptions','Music Service','2024-05-08',4),
(9,40.00,'Pets','Vet Visit','2024-05-09',5),
(10,1200.00,'Salary','Monthly Salary','2024-05-10',1),
(11,25.00,'other','qdfq','2025-04-01',1);
/*!40000 ALTER TABLE `operations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shares`
--

DROP TABLE IF EXISTS `shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `shares` (
  `receiver_id` int(11) NOT NULL,
  `operation_id` int(11) NOT NULL,
  `percentage` tinyint(4) NOT NULL,
  PRIMARY KEY (`receiver_id`,`operation_id`),
  KEY `operation_id` (`operation_id`),
  CONSTRAINT `shares_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `shares_ibfk_2` FOREIGN KEY (`operation_id`) REFERENCES `operations` (`operation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shares`
--

LOCK TABLES `shares` WRITE;
/*!40000 ALTER TABLE `shares` DISABLE KEYS */;
INSERT INTO `shares` VALUES
(1,1,50),
(1,3,30),
(2,1,50),
(2,2,60),
(3,2,40),
(3,3,70),
(4,4,70),
(5,4,30),
(5,5,50),
(6,5,50);
/*!40000 ALTER TABLE `shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `total_money` decimal(10,2) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'alice@example.com','hash_alice','Alice',120.50),
(2,'bob@example.com','hash_bob','Bob',75.00),
(3,'carol@example.com','hash_carol','Carol',200.00),
(4,'david@example.com','hash_david','David',150.75),
(5,'emma@example.com','hash_emma','Emma',95.25),
(6,'frank@example.com','hash_frank','Frank',180.00),
(7,'grace@example.com','hash_grace','Grace',225.50);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-20 21:58:40
