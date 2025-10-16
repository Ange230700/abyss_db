// scripts/wait-for-mysql.mjs

// ESM script that waits for a MySQL TCP socket to be reachable.
// Uses DATABASE_URL to infer host/port, with optional MYSQL_HOST/MYSQL_PORT overrides.
//
// Env:
//   DATABASE_URL   (required) e.g. mysql://user:pass@host:3306/db
//   WAIT_RETRIES   (optional) default 30
//   WAIT_DELAY_MS  (optional) default 2000
//   MYSQL_HOST     (optional) override host
//   MYSQL_PORT     (optional) override port
//
// Exit codes:
//   0 - reachable
//   1 - timed out / unreached
//
// Example:
//   node scripts/wait-for-mysql.mjs
//   WAIT_RETRIES=60 WAIT_DELAY_MS=1000 node scripts/wait-for-mysql.mjs

import net from "node:net";

function parseMysqlTarget() {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl) {
    throw new Error("DATABASE_URL is not set. Cannot infer MySQL host/port.");
  }

  // Accept common Prisma/MySQL URL forms: mysql://user:pass@host:port/db?params
  let host = "127.0.0.1",
    port = 3306;
  try {
    const u = new URL(envUrl);
    // Protocol sanity check
    if (!u.protocol || !u.protocol.startsWith("mysql")) {
      // Still allow if it's something like "mysqls:" etc. but warn
      console.warn(
        `⚠️ DATABASE_URL protocol is "${u.protocol}". Proceeding if it's MySQL-compatible...`,
      );
    }
    host = u.hostname || host;
    port = Number(u.port || port);
  } catch (e) {
    // Very rare: non-standard URL; last resort: try simple parsing
    console.warn(
      "⚠️ Could not parse DATABASE_URL with URL(). Falling back to defaults.",
      e,
    );
    host = "127.0.0.1";
    port = 3306;
  }

  const prev = { host, port };

  // Env overrides
  if (process.env.MYSQL_HOST) host = process.env.MYSQL_HOST;
  if (process.env.MYSQL_PORT) {
    const parsed = Number(process.env.MYSQL_PORT);
    if (Number.isFinite(parsed) && parsed > 0) port = parsed;
  }

  // Emit an explicit log only if we actually changed something
  if (host !== prev.host || port !== prev.port) {
    const changed = [];
    if (host !== prev.host)
      changed.push(`host: ${prev.host} → ${host} (MYSQL_HOST)`);
    if (port !== prev.port)
      changed.push(`port: ${prev.port} → ${port} (MYSQL_PORT)`);
    console.log(`🔧 Overriding MySQL target via env — ${changed.join(", ")}`);
  }

  if (!Number.isFinite(port) || port <= 0) port = 3306;

  return { host, port };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForTcp(host, port, attempts, delayMs) {
  for (let i = 1; i <= attempts; i++) {
    const attemptInfo = `(${i}/${attempts})`;
    try {
      const ok = await new Promise((resolve) => {
        const socket = net.connect({ host, port });
        // Success = 'connect', failure = 'error'
        socket
          .once("connect", () => {
            socket.end();
            resolve(true);
          })
          .once("error", () => {
            try {
              socket.destroy();
            } catch {
              // Ignore
            }
            resolve(false);
          });

        // Safety timeout per attempt (slightly less than delay)
        socket.setTimeout(Math.max(500, Math.min(5000, delayMs - 100)), () => {
          try {
            socket.destroy();
          } catch {
            // Ignore
          }
          resolve(false);
        });
      });

      if (ok) {
        console.log(`✅ MySQL reachable at ${host}:${port} ${attemptInfo}`);
        return true;
      }

      console.log(
        `⏳ MySQL not ready at ${host}:${port} ${attemptInfo} — retrying in ${delayMs}ms…`,
      );
      await delay(delayMs);
    } catch (e) {
      console.log(
        `⏳ Attempt ${attemptInfo} encountered an error: ${e?.message || e}. Retrying in ${delayMs}ms…`,
      );
      await delay(delayMs);
    }
  }
  return false;
}

async function main() {
  const { host, port } = parseMysqlTarget();

  const attempts = Number(process.env.WAIT_RETRIES || 30);
  const delayMs = Number(process.env.WAIT_DELAY_MS || 2000);

  console.log(
    `🔌 Waiting for MySQL — target: ${host}:${port}, retries: ${attempts}, delay: ${delayMs}ms`,
  );

  const ok = await waitForTcp(host, port, attempts, delayMs);
  if (!ok) {
    console.error(
      `❌ Could not reach MySQL at ${host}:${port} after ${attempts} attempts.`,
    );
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(`❌ wait-for-mysql.mjs crashed:`, e);
  process.exit(1);
});
