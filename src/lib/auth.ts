import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env.local");
  return secret;
}

export function signAdminToken(username: string): string {
  return jwt.sign({ sub: username }, getSecret(), { expiresIn: "7d" });
}

/** Returns admin info if token is valid, otherwise null */
export function getAdminFromRequest(
  req: NextRequest
): { username: string } | null {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;

  try {
    const payload = jwt.verify(header.slice(7), getSecret());
    if (typeof payload === "string" || !payload.sub) return null;
    return { username: payload.sub as string };
  } catch {
    return null; // invalid OR expired token → both mean "not logged in"
  }
}
