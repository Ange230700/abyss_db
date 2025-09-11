// abyss_db/prisma/testSetup.ts
import { execSync } from "node:child_process";
import net from "node:net";

/**
 * Wait until MySQL is reachable and then push the schema.
 * Throws with a clear message if Docker Compose isn't running.
 */
export default async function globalSetup() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "❌ DATABASE_URL is not set for tests. Did you export it or load .env?",
    );
  }

  let host = "127.0.0.1";
  let port = 3306;

  try {
    const u = new URL(dbUrl);
    host = u.hostname || host;
    port = Number(u.port || port);
  } catch {
    console.warn(
      `⚠️ Could not parse DATABASE_URL (${dbUrl}), falling back to ${host}:${port}`,
    );
  }

  console.log(`🔌 Checking MySQL availability at ${host}:${port} …`);

  const maxRetries = 15;
  const delayMs = 2000;

  for (let i = 1; i <= maxRetries; i++) {
    const ok = await new Promise<boolean>((resolve) => {
      const socket = net.connect({ host, port });
      socket.once("connect", () => {
        socket.end();
        resolve(true);
      });
      socket.once("error", () => {
        resolve(false);
      });
      socket.setTimeout(1000, () => {
        socket.destroy();
        resolve(false);
      });
    });

    if (ok) {
      console.log(`✅ MySQL is reachable (attempt ${i}/${maxRetries})`);
      try {
        execSync("npx prisma db push", { stdio: "inherit" });
        return;
      } catch (err) {
        console.error("❌ prisma db push failed:", err);
        throw err;
      }
    }

    console.log(
      `⏳ MySQL not ready (attempt ${i}/${maxRetries}). Retrying in ${delayMs}ms…`,
    );
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error(
    `❌ MySQL not reachable at ${host}:${port} after ${maxRetries} attempts. Did you run "docker compose up -d"?`,
  );
}
