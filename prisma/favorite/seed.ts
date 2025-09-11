// abyss_db\prisma\favorite\seed.ts

import prisma from "abyssdb/lib/client";
import { faker } from "@faker-js/faker";

async function seedFavorite() {
  const users = await prisma.user.findMany({ select: { id: true } });
  const furnitures = await prisma.furniture.findMany({ select: { id: true } });

  const userIds = users.map((u) => u.id);
  const furnitureIds = furnitures.map((f) => f.id);

  const favorites: {
    id_user: number;
    id_furniture: number;
    is_favorite: boolean;
  }[] = [];

  for (const uid of userIds) {
    const count = faker.number.int({
      min: 2,
      max: Math.min(5, furnitureIds.length),
    });
    const chosen = faker.helpers.arrayElements(furnitureIds, count);
    for (const fid of chosen) {
      favorites.push({
        id_user: uid,
        id_furniture: fid,
        is_favorite: faker.helpers.arrayElement([true, false]),
      });
    }
  }

  if (favorites.length) {
    await prisma.favorite.createMany({ data: favorites, skipDuplicates: true });
  }
  console.log(`🎉 Seeded ${favorites.length} favorites.`);
}
export default seedFavorite;
