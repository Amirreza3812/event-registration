import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST() {
  try {
    // فقط ثبت‌نام‌ها را پاک می‌کند
    await db.execute("DELETE FROM registrations");

    // ثبت‌نام باز می‌ماند (بهتر است)
    await db.execute("UPDATE settings SET registrationOpen = true");

    return NextResponse.json({
      success: true,
      message: "✅ فقط ثبت‌نام‌ها پاک شدند (دیتابیس کامل ریست نشد).",
    });
  } catch (err) {
    console.error("Reset DB error:", err);
    return NextResponse.json(
      { error: "خطا در پاک کردن ثبت‌نام‌ها" },
      { status: 500 }
    );
  }
}
