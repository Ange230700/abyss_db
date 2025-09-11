/*
  Warnings:

  - A unique constraint covering the columns `[id_furniture,id_material]` on the table `furniturematerial` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `furnituretype` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `material` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `furniture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `furniturematerial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `furnituretype` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `favorite` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `furniture` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `furniturematerial` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `furnituretype` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `image` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `material` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `furniturematerial_id_furniture_id_material_key` ON `furniturematerial`(`id_furniture`, `id_material`);

-- CreateIndex
CREATE UNIQUE INDEX `furnituretype_name_key` ON `furnituretype`(`name`);

-- CreateIndex
CREATE INDEX `image_url_idx` ON `image`(`url`);

-- CreateIndex
CREATE UNIQUE INDEX `material_name_key` ON `material`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `user_email_key` ON `user`(`email`);

-- CreateIndex
CREATE INDEX `user_role_idx` ON `user`(`role`);

-- RenameIndex
ALTER TABLE `image` RENAME INDEX `image_id_furniture_fkey` TO `image_id_furniture_idx`;
