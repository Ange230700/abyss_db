// abyss_db\prisma\index.ts

export { default as prisma } from "abyssdb/lib/client";
export * from "abyssdb/extensions/softDelete";
// Optionally re-export common helpers:
export { default as cleanUp } from "abyssdb/helpers/cleanUp";
