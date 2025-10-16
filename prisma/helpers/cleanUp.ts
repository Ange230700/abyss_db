// abyss_db/prisma/helpers/cleanUp.ts
import prisma from "abyssdb/lib/client";

async function cleanUp() {
  const env = (process.env.NODE_ENV || "development").toLowerCase();
  const isProd = env === "production";
  // CLEANUP_MODE can be: "hard" | "soft"
  const cleanupMode = (
    process.env.CLEANUP_MODE || (isProd ? "soft" : "hard")
  ).toLowerCase();
  const now = new Date();

  if (cleanupMode === "hard") {
    console.log(`🧹 [${env}] Hard deleting all data...`);
    await prisma.$transaction(async (tx) => {
      await tx.favorite.hardDeleteMany({});
      await tx.image.hardDeleteMany({});
      await tx.furniturematerial.hardDeleteMany({});
      await tx.furniture.hardDeleteMany({});
      await tx.user.hardDeleteMany({});
      await tx.material.hardDeleteMany({});
      await tx.furnituretype.hardDeleteMany({});
    });
    // Reset AUTO_INCREMENTs (ignore errors if tables missing)
    const resets = [
      "favorite",
      "image",
      "furniturematerial",
      "furniture",
      "`user`",
      "material",
      "furnituretype",
    ];
    for (const table of resets) {
      try {
        // MySQL only
        await prisma.$executeRawUnsafe(
          `ALTER TABLE ${table} AUTO_INCREMENT = 1`,
        );
      } catch {
        /* ignore */
      }
    }
  } else {
    if (process.env.CONFIRM_SOFT_DELETE !== "YES_I_AM_SURE") {
      throw new Error(
        "Set CONFIRM_SOFT_DELETE=YES_I_AM_SURE to run soft delete cleanup!",
      );
    }
    console.log(`🧹 [${env}] Soft deleting all data...`);
    await Promise.all([
      prisma.favorite.updateMany({ data: { deleted_at: now } }),
      prisma.image.updateMany({ data: { deleted_at: now } }),
      prisma.furniturematerial.updateMany({ data: { deleted_at: now } }),
      prisma.furniture.updateMany({ data: { deleted_at: now } }),
      prisma.user.updateMany({ data: { deleted_at: now } }),
      prisma.material.updateMany({ data: { deleted_at: now } }),
      prisma.furnituretype.updateMany({ data: { deleted_at: now } }),
    ]);
  }

  console.log("🧹 Cleaning up complete.");
}

export default cleanUp;
