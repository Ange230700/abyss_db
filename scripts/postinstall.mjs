// abyss_db/scripts/postinstall.mjs
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

function isCIEnv() {
  const flags = [
    "CI",
    "GITHUB_ACTIONS",
    "TF_BUILD",
    "TEAMCITY_VERSION",
    "BUILDKITE",
    "CIRCLECI",
    "TRAVIS",
    "APPVEYOR",
    "BITBUCKET_BUILD_NUMBER",
    "JENKINS_URL",
    "BUILD_NUMBER",
  ];
  return flags.some((k) => process.env[k]);
}

if (isCIEnv()) {
  console.log("CI detected; skipping local postinstall extras.");
  process.exit(0);
}

console.log("Running local postinstall tasks…");

try {
  // Optional: ensure TypeScript exists
  execSync("npx tsc --version", { stdio: "inherit" });

  // Clean prior build artifacts
  const toRemove = ["dist", "tsconfig.tsbuildinfo"];
  for (const p of toRemove) rmSync(p, { recursive: true, force: true });

  // Generate Prisma client (single workspace)
  execSync("npm run prisma:generate", { stdio: "inherit" });

  console.log("Local postinstall complete ✅");
} catch (e) {
  console.error("Postinstall failed ❌");
  console.error(e);
  process.exit(1);
}
