// abyss_db\prisma\main.ts

import prisma from "abyssdb/lib/client";
import cleanUp from "abyssdb/helpers/cleanUp";
import seedFurnitureType from "abyssdb/furnituretype/seed";
import seedMaterial from "abyssdb/material/seed";
import seedUser from "abyssdb/user/seed";
import seedFurniture from "abyssdb/furniture/seed";
import seedImage from "abyssdb/image/seed";
import seedFurnitureMaterial from "abyssdb/furniturematerial/seed";
import seedFavorite from "abyssdb/favorite/seed";

async function main() {
  console.log("🌱 Seeding...");

  const skipCleanup = process.env.SKIP_CLEANUP === "true";
  if (!skipCleanup) {
    await cleanUp();
  }

  await seedFurnitureType();
  await seedMaterial();
  await seedUser();
  await seedFurniture();
  await seedImage();
  await seedFurnitureMaterial();
  await seedFavorite();
  console.log("🌱 Seeding complete.");
}

main()
  .catch((e) => {
    console.error("💥 Error seeding:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
