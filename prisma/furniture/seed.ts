// abyss_db\prisma\furniture\seed.ts

import prisma from "abyssdb/lib/client";
import { faker } from "@faker-js/faker";
import { Status } from "abyssdb/prisma/generated/client";

async function seedFurniture() {
  const COUNT = 10;
  const types = await prisma.furnituretype.findMany({ select: { id: true } });
  const typeIds = types.map((t) => t.id);
  if (typeIds.length === 0) {
    console.warn("No furniture types found; skipping furniture seeds.");
    return;
  }

  const STATUS_OPTIONS = [
    Status.AVAILABLE,
    Status.OUT_OF_STOCK,
    Status.LOW_STOCK,
    Status.DISCONTINUED,
  ] as const;

  const data = Array.from({ length: COUNT }).map(() => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    id_type: faker.helpers.arrayElement(typeIds),
    size: faker.helpers.arrayElement(["Small", "Medium", "Large"]),
    colour: faker.color.human(),
    quantity: faker.number.int({ min: 0, max: 100 }),
    price: parseFloat(faker.commerce.price({ min: 20, max: 999, dec: 2 })),
    status: faker.helpers.arrayElement(STATUS_OPTIONS),
  }));

  await prisma.furniture.createMany({ data, skipDuplicates: true });
  console.log(`🎉 Seeded ${COUNT} furniture.`);
}
export default seedFurniture;
