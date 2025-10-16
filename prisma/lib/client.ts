// abyss_db\prisma\lib\client.ts

import { PrismaClient } from "abyssdb/prisma/generated/client";
import { getSoftDeleteExtension } from "abyssdb/extensions/softDelete";

// Soft delete filter is enabled by default (production/staging)
const disableSoftDeleteFilter = process.env.DISABLE_SOFT_DELETE === "true";

// Allow hard deletes explicitly during cleanup
const allowHardDeleteCalls =
  process.env.ALLOW_HARD_DELETE_CALLS === "true" ||
  process.env.CLEANUP_MODE?.toLowerCase() === "hard";

// You can use NODE_ENV as well if you want different behavior in dev
const prisma = new PrismaClient().$extends(
  getSoftDeleteExtension({
    disableFilter: disableSoftDeleteFilter,
    allowHardDeleteCalls,
  }),
);

export default prisma;
