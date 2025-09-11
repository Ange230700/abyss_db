// abyss_db\prisma\material\seed.ts

import prisma from "abyssdb/lib/client";

const MATERIALS = ["Wood", "Metal", "Glass", "Plastic", "Fabric", "Leather"];

async function seedMaterial() {
  await prisma.material.createMany({
    data: MATERIALS.map((name) => ({ name })),
    skipDuplicates: true,
  });
  console.log(`🎉 Seeded ${MATERIALS.length} materials.`);
}
export default seedMaterial;
