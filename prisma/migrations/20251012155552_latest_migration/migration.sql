-- CreateIndex
CREATE INDEX `favorite_id_user_idx` ON `favorite`(`id_user`);

-- RenameIndex
ALTER TABLE `favorite` RENAME INDEX `favorite_id_furniture_fkey` TO `favorite_id_furniture_idx`;

-- RenameIndex
ALTER TABLE `furniture` RENAME INDEX `furniture_id_type_fkey` TO `furniture_id_type_idx`;

-- RenameIndex
ALTER TABLE `furniturematerial` RENAME INDEX `furniturematerial_id_material_fkey` TO `furniturematerial_id_material_idx`;
