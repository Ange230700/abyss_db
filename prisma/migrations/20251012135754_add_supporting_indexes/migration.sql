-- New/additional helpful indexes

-- favorite: composite for toggles & lookups
CREATE INDEX `favorite_id_user_id_furniture_idx`
  ON `favorite`(`id_user`, `id_furniture`);

-- furniture: common filters/sorts
CREATE INDEX `furniture_status_idx` ON `furniture`(`status`);
CREATE INDEX `furniture_price_idx`  ON `furniture`(`price`);
