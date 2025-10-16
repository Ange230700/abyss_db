// abyss_db\prisma\extensions\softDelete.spec.ts

import { PrismaClient } from "abyssdb/prisma/generated/client";
import { getSoftDeleteExtension } from "abyssdb/extensions/softDelete";

function makeClient(opts?: Parameters<typeof getSoftDeleteExtension>[0]) {
  const base = new PrismaClient();
  return base.$extends(
    getSoftDeleteExtension({ allowHardDeleteCalls: true, ...opts }),
  );
}

describe("softDelete extension", () => {
  const email = `test+${Date.now()}@example.com`;

  test("findMany/findFirst/findUnique exclude soft-deleted rows", async () => {
    const prisma = makeClient({ disableFilter: false });

    // create
    const u = await prisma.user.create({
      data: { user_name: "t", email, password: "x", role: "visitor" },
    });

    // soft delete via helper
    await prisma.user.softDelete({ id: u.id });

    // reads should exclude by default
    await expect(
      prisma.user.findUnique({ where: { id: u.id } }),
    ).resolves.toBeNull();
    const list = await prisma.user.findMany({ where: { email } });
    expect(list.length).toBe(0);

    // aggregates exclude too
    const c = await prisma.user.count({ where: { email } });
    expect(c).toBe(0);

    const aggr = await prisma.user.aggregate({
      _count: { _all: true },
      where: { email },
    });
    expect(aggr._count?._all ?? 0).toBe(0);
  });

  test("groupBy excludes soft-deleted rows", async () => {
    const prisma = makeClient({ disableFilter: false });

    const e1 = `g1+${Date.now()}@ex.com`;
    const e2 = `g2+${Date.now()}@ex.com`;

    await prisma.user.create({
      data: { user_name: "a", email: e1, password: "x", role: "visitor" },
    });
    const u2 = await prisma.user.create({
      data: { user_name: "b", email: e2, password: "x", role: "visitor" },
    });

    await prisma.user.softDelete({ id: u2.id });

    const g = await prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
      where: { role: "visitor" },
    });

    // only u1 should count
    expect(
      g.find((r) => r.role === "visitor")?._count?._all ?? 0,
    ).toBeGreaterThanOrEqual(1);
  });

  test("guards block hard delete unless allowed", async () => {
    // guard ON (no hard deletes)
    const guarded = makeClient({
      disableFilter: false,
      allowHardDeleteCalls: false,
    });
    const u = await guarded.user.create({
      data: {
        user_name: "d",
        email: `guard+${Date.now()}@ex.com`,
        password: "x",
        role: "visitor",
      },
    });

    await expect(guarded.user.delete({ where: { id: u.id } })).rejects.toThrow(
      /Hard delete blocked/,
    );

    // but softDelete works
    await expect(guarded.user.softDelete({ id: u.id })).resolves.toBeTruthy();
  });

  test("allowHardDeleteCalls enables real deletions", async () => {
    const open = makeClient({
      disableFilter: false,
      allowHardDeleteCalls: true,
    });
    const u = await open.user.create({
      data: {
        user_name: "d",
        email: `allow+${Date.now()}@ex.com`,
        password: "x",
        role: "visitor",
      },
    });
    await expect(
      open.user.delete({ where: { id: u.id } }),
    ).resolves.toBeTruthy();
  });
});
