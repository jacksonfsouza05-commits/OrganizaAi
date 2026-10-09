import "dotenv/config";
import fs from "node:fs";
import pg from "pg";

pg.types.setTypeParser(1082, (v) => v);

const url = new URL(process.env.DATABASE_URL || "postgres://localhost/avisai");
const local = ["localhost", "127.0.0.1"].includes(url.hostname);
url.searchParams.delete("sslmode");

let ssl = false;
if (!local) {
  const caPath = process.env.DB_CA_PATH;
  ssl = caPath && fs.existsSync(caPath)
    ? { ca: fs.readFileSync(caPath, "utf8"), rejectUnauthorized: true }
    : { rejectUnauthorized: false };
}

export const pool = new pg.Pool({ connectionString: url.toString(), ssl, max: 10 });

export const query = (text, params) => pool.query(text, params);
