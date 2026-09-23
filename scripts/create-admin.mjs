import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error(
    "Usage: node --env-file=.env.local scripts/create-admin.mjs <username> <password>"
  );
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const db = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tech_meetup",
});

await db.execute(
  `INSERT INTO admins (username, password_hash) VALUES (?, ?)
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
  [username, hash]
);

console.log(`✅ Admin "${username}" created/updated`);
await db.end();
