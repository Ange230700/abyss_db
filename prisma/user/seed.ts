// abyss_db\prisma\user\seed.ts

import prisma from "abyssdb/lib/client";
import { faker } from "@faker-js/faker";
import argon2 from "argon2";

const ROLES = ["admin", "visitor", "customer", "seller"] as const;

async function seedUser() {
  const COUNT = 5;

  const raw = Array.from({ length: COUNT }).map(() => ({
    user_name: faker.internet.username(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(ROLES),
    password: faker.internet.password({ length: 14 }),
  }));

  const data = await Promise.all(
    raw.map(async (u) => ({ ...u, password: await argon2.hash(u.password) })),
  );

  await prisma.user.createMany({ data, skipDuplicates: true });
  console.log(`🎉 Seeded ${COUNT} users (hashed passwords).`);
}
export default seedUser;
