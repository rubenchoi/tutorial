/*
  Warnings:

  - The `registration` column on the `platenumber` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `ownerBirth` on the `platenumber` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `platenumber` DROP COLUMN `registration`,
    ADD COLUMN `registration` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `ownerBirth`,
    ADD COLUMN `ownerBirth` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
