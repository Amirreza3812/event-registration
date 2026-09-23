import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import db from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

// public: only the open/closed status
export async function GET() {
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT registrationOpen FROM settings LIMIT 1"
    );
    const open = rows.length === 0 ? true : Boolean(rows[0].registrationOpen);
    return NextResponse.json({ registrationOpen: open });
  } catch (err) {
    console.error("Get settings error:", err);
    return NextResponse.json({ registrationOpen: true });
  }
}

// admin only
export async function PATCH(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // toggle registration
    if (typeof body.registrationOpen === "boolean") {
      await db.execute("UPDATE settings SET registrationOpen = ?", [
        body.registrationOpen,
      ]);
      return NextResponse.json({
        success: true,
        registrationOpen: body.registrationOpen,
      });
    }

    // change password (needs current password)
    if (
      typeof body.currentPassword === "string" &&
      typeof body.newPassword === "string"
    ) {
      if (body.newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "رمز جدید باید حداقل ۶ کاراکتر باشد" },
          { status: 400 }
        );
      }
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT password_hash FROM admins WHERE username = ? LIMIT 1",
        [admin.username]
      );
      if (
        rows.length === 0 ||
        !(await bcrypt.compare(body.currentPassword, rows[0].password_hash))
      ) {
        return NextResponse.json(
          { error: "رمز فعلی اشتباه است" },
          { status: 401 }
        );
      }
      const hash = await bcrypt.hash(body.newPassword.trim(), 10);
      await db.execute(
        "UPDATE admins SET password_hash = ? WHERE username = ?",
        [hash, admin.username]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  } catch (err) {
    console.error("Update settings error:", err);
    return NextResponse.json(
      { error: "خطا در بروزرسانی تنظیمات" },
      { status: 500 }
    );
  }
}
