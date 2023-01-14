-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 06, 2023 at 07:48 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bbs`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking_details`
--

CREATE TABLE `booking_details` (
  `TICKET` varchar(32) NOT NULL,
  `USERID` varchar(25) NOT NULL,
  `JOURNEY_ID` varchar(10) NOT NULL,
  `ROUTE_ID` int(5) NOT NULL,
  `REQ_SEAT` int(2) NOT NULL,
  `ADDDATE` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bus_details`
--

CREATE TABLE `bus_details` (
  `BUSID` varchar(6) NOT NULL,
  `TOTAL_SEAT` int(2) NOT NULL,
  `COST` int(3) NOT NULL,
  `ADDDATE` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `city_details`
--

CREATE TABLE `city_details` (
  `CITY_ID` int(3) NOT NULL,
  `CITY_NAME` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journey_details`
--

CREATE TABLE `journey_details` (
  `JOURNEY_ID` varchar(10) NOT NULL,
  `ROUTE_ID` int(5) NOT NULL,
  `BUSID` varchar(6) NOT NULL,
  `JOURNEY_DATE` datetime NOT NULL,
  `FROM_CITY` int(3) NOT NULL,
  `TO_CITY` int(3) NOT NULL,
  `BOOK_COUNT` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_details`
--

CREATE TABLE `user_details` (
  `USERID` varchar(25) NOT NULL,
  `NAME` varchar(25) NOT NULL,
  `EMAIL` varchar(30) NOT NULL,
  `PHONE` int(10) NOT NULL,
  `PASSWORD` varchar(16) NOT NULL,
  `ADDRESS` varchar(50) NOT NULL,
  `TYPE` char(1) NOT NULL,
  `ADDDATE` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking_details`
--
ALTER TABLE `booking_details`
  ADD PRIMARY KEY (`TICKET`),
  ADD KEY `USERID_FK1` (`USERID`),
  ADD KEY `JOURNEY_ID_FK1` (`JOURNEY_ID`,`ROUTE_ID`);

--
-- Indexes for table `bus_details`
--
ALTER TABLE `bus_details`
  ADD PRIMARY KEY (`BUSID`);

--
-- Indexes for table `city_details`
--
ALTER TABLE `city_details`
  ADD PRIMARY KEY (`CITY_ID`);

--
-- Indexes for table `journey_details`
--
ALTER TABLE `journey_details`
  ADD PRIMARY KEY (`JOURNEY_ID`,`ROUTE_ID`),
  ADD KEY `BUSID_FK1` (`BUSID`),
  ADD KEY `CITY_ID1` (`FROM_CITY`),
  ADD KEY `CITY_ID2` (`TO_CITY`);

--
-- Indexes for table `user_details`
--
ALTER TABLE `user_details`
  ADD PRIMARY KEY (`USERID`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking_details`
--
ALTER TABLE `booking_details`
  ADD CONSTRAINT `JOURNEY_ID_FK1` FOREIGN KEY (`JOURNEY_ID`,`ROUTE_ID`) REFERENCES `journey_details` (`JOURNEY_ID`, `ROUTE_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `USERID_FK1` FOREIGN KEY (`USERID`) REFERENCES `user_details` (`USERID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `journey_details`
--
ALTER TABLE `journey_details`
  ADD CONSTRAINT `BUSID_FK1` FOREIGN KEY (`BUSID`) REFERENCES `bus_details` (`BUSID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CITY_ID1` FOREIGN KEY (`FROM_CITY`) REFERENCES `city_details` (`CITY_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CITY_ID2` FOREIGN KEY (`TO_CITY`) REFERENCES `city_details` (`CITY_ID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
