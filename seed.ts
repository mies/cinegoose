import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { seed } from "drizzle-seed";
import * as schema from "./src/db/schema";
import path from "node:path";
import fs from "node:fs";
import { config } from "dotenv";

seedDatabase();

async function seedDatabase() {
  const isProd = process.env.ENVIRONMENT === "production";
  const db = isProd ? await getProductionDatabase() : getLocalD1Db();

  if (isProd) {
    console.warn("🚨 Seeding production database");
  }

  try {
    // Seed the database with deterministic but varied data
    await seed(db, schema);
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

function getLocalD1Db() {
  const pathToDb = getLocalD1DBPath();
  if (!pathToDb) {
    console.error(
      "⚠️ Local D1 database not found. Try running `npm run db:touch` to create one.",
    );
    process.exit(1);
  }

  const client = createClient({
    url: `file:${pathToDb}`,
  });
  const db = drizzle(client);
  return db;
}

function getLocalD1DBPath() {
  try {
    const basePath = path.resolve(".wrangler");
    const files = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .filter((f) => f.endsWith(".sqlite"));

    files.sort((a, b) => {
      const statA = fs.statSync(path.join(basePath, a));
      const statB = fs.statSync(path.join(basePath, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    const dbFile = files[0];

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);

    return url;
  } catch (err) {
    if (err instanceof Error) {
      console.log(`Error resolving local D1 DB: ${err.message}`);
    } else {
      console.log(`Error resolving local D1 DB: ${err}`);
    }
  }
}

async function getProductionDatabase() {
  config({ path: ".prod.vars" });

  const apiToken = process.env.CLOUDFLARE_D1_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!apiToken || !accountId || !databaseId) {
    console.error(
      "Database seed failed: production environment variables not set (make sure you have a .prod.vars file)",
    );
    process.exit(1);
  }

  return createProductionD1Connection(accountId, databaseId, apiToken);
}

export function createProductionD1Connection(
  accountId: string,
  databaseId: string,
  apiToken: string,
) {
  async function executeCloudflareD1Query(
    accountId: string,
    databaseId: string,
    apiToken: string,
    sql: string,
    params: any[],
    method: string,
  ): Promise<{ rows: any[][] }> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params, method }),
    });

    const data: any = await res.json();

    if (res.status !== 200) {
      throw new Error(
        `Error from sqlite proxy server: ${res.status} ${res.statusText}\n${JSON.stringify(data)}`,
      );
    }

    if (data.errors.length > 0 || !data.success) {
      throw new Error(
        `Error from sqlite proxy server: \n${JSON.stringify(data)}}`,
      );
    }

    const qResult = data?.result?.[0];

    if (!qResult?.success) {
      throw new Error(
        `Error from sqlite proxy server: \n${JSON.stringify(data)}`,
      );
    }

    return { rows: qResult.results.map((r: any) => Object.values(r)) };
  }

  const queryClient: AsyncRemoteCallback = async (sql, params, method) => {
    return executeCloudflareD1Query(
      accountId,
      databaseId,
      apiToken,
      sql,
      params,
      method,
    );
  };

  const batchQueryClient: AsyncBatchRemoteCallback = async (queries) => {
    const results: { rows: any[][] }[] = [];

    for (const query of queries) {
      const { sql, params, method } = query;
      const result = await executeCloudflareD1Query(
        accountId,
        databaseId,
        apiToken,
        sql,
        params,
        method,
      );
      results.push(result);
    }

    return results;
  };

  return drizzleSQLiteProxy(queryClient, batchQueryClient);
}
