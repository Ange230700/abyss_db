-- 1) FAVORITE
ALTER TABLE `favorite` MODIFY `updated_at` DATETIME(3) NULL;
UPDATE `favorite` SET `updated_at` = COALESCE(`updated_at`, `created_at`, NOW(3));
ALTER TABLE `favorite` MODIFY `updated_at` DATETIME(3) NOT NULL;

-- 2) FURNITURE
ALTER TABLE `furniture` MODIFY `updated_at` DATETIME(3) NULL;
UPDATE `furniture` SET `updated_at` = COALESCE(`updated_at`, `created_at`, NOW(3));
ALTER TABLE `furniture` MODIFY `updated_at` DATETIME(3) NOT NULL;

-- 3) FURNITUREMATERIAL
ALTER TABLE `furniturematerial` MODIFY `updated_at` DATETIME(3) NULL;
UPDATE `furniturematerial` SET `updated_at` = COALESCE(`updated_at`, `created_at`, NOW(3));
ALTER TABLE `furniturematerial` MODIFY `updated_at` DATETIME(3) NOT NULL;

-- 4) FURNITURETYPE
ALTER TABLE `furnituretype` MODIFY `updated_at` DATETIME(3) NULL;
UPDATE `furnituretype` SET `updated_at` = COALESCE(`updated_at`, `created_at`, NOW(3));
ALTER TABLE `furnituretype` MODIFY `updated_at` DATETIME(3) NOT NULL;

-- 5) IMAGE
ALTER TABLE `image` MODIFY `updated_at` DATETIME(3) NULL;
UPDATE `image` SET `updated_at` = COALESCE(`updated_at`, `created_at`, NOW(3));
ALTER TABLE `image` MODIFY `updated_at` DATETIME(3) NOT NULL;

-- 6) MATERIAL
ALTER TABLE `material` MODIFY `updated_at` DATETIME(3) NULL;
UPDATE `material` SET `updated_at` = COALESCE(`updated_at`, `created_at`, NOW(3));
ALTER TABLE `material` MODIFY `updated_at` DATETIME(3) NOT NULL;

-- 7) USER
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NULL;
UPDATE `user` SET `updated_at` = COALESCE(`updated_at`, `created_at`, NOW(3));
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NOT NULL;
