import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import db from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

// GET = admin only: list registrations
export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, full_name, phone, age, gender,
              has_attended_tech_event AS hasAttendedTechEvent,
              interest_area, level,
              wants_to_present AS wantsToPresent,
              presentation_contact AS presentationContact,
              created_at AS createdAt
       FROM registrations
       ORDER BY id DESC`
    );
    return NextResponse.json({ registrations: rows });
  } catch (err) {
    console.error("List registrations error:", err);
    return NextResponse.json({ error: "خطا در دریافت لیست" }, { status: 500 });
  }
}

// POST = public: create registration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const phone =
      typeof body.phone === "string" ? body.phone.replace(/[\s-]/g, "") : "";
    const age = Number(body.age);

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره تماس معتبر نیست (باید با ۰۹ شروع شود و ۱۱ رقم باشد)" },
        { status: 400 }
      );
    }
    if (fullName.length < 3) {
      return NextResponse.json(
        { error: "نام را کامل وارد کنید" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(age) || age < 10 || age > 100) {
      return NextResponse.json({ error: "سن معتبر نیست" }, { status: 400 });
    }
    if (body.gender !== "male" && body.gender !== "female") {
      return NextResponse.json(
        { error: "جنسیت را انتخاب کنید" },
        { status: 400 }
      );
      // capacity check
      const [settingsRows] = await db.execute<RowDataPacket[]>(
        "SELECT maxCapacity FROM settings LIMIT 1"
      );
      const maxCapacity =
        settingsRows.length > 0 ? Number(settingsRows[0].maxCapacity) || 0 : 0;

      if (maxCapacity > 0) {
        const [countRows] = await db.execute<RowDataPacket[]>(
          "SELECT COUNT(*) AS total FROM registrations"
        );
        if (Number(countRows[0].total) >= maxCapacity) {
          return NextResponse.json(
            { error: "ظرفیت رویداد تکمیل شده است" },
            { status: 409 }
          );
        }
      }
    }

    await db.execute<ResultSetHeader>(
      `INSERT INTO registrations
        (full_name, phone, age, gender, has_attended_tech_event, interest_area,
         level, wants_to_present, presentation_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        phone,
        age,
        body.gender,
        Boolean(body.hasAttendedTechEvent),
        String(body.interestArea ?? ""),
        String(body.level ?? ""),
        Boolean(body.wantsToPresent),
        body.wantsToPresent && typeof body.presentationContact === "string"
          ? body.presentationContact.trim()
          : null,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // the UNIQUE KEY on phone is the real duplicate protection
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "این شماره قبلاً ثبت‌نام کرده است" },
        { status: 409 }
      );
    }
    console.error("Register error:", err);
    return NextResponse.json({ error: "خطا در ثبت‌نام" }, { status: 500 });
  }
}
