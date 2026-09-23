import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import db from "@/lib/db";
import { signAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "نام کاربری و رمز را وارد کنید" }, { status: 400 });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT username, password_hash FROM admins WHERE username = ? LIMIT 1",
      [username]
    );

    // same message for both cases → attacker can't guess valid usernames
    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return NextResponse.json({ error: "نام کاربری یا رمز اشتباه است" }, { status: 401 });
    }

    const token = signAdminToken(rows[0].username);
    return NextResponse.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "خطا در ورود" }, { status: 500 });
  }
}