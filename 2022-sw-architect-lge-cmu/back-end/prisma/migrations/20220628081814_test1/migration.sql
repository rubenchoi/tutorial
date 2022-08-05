-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlateNumber` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plate` VARCHAR(30) NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `registration` INTEGER NOT NULL,
    `ownerName` VARCHAR(50) NOT NULL,
    `ownerBirth` INTEGER NOT NULL,
    `ownerAddress` VARCHAR(255) NOT NULL,
    `ownerCity` VARCHAR(150) NOT NULL,
    `vehicleYear` INTEGER NOT NULL,
    `vehicleMaker` VARCHAR(50) NOT NULL,
    `vehicleModel` VARCHAR(50) NOT NULL,
    `vehicleColor` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
