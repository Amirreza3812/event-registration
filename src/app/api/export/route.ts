import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import db from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, full_name, phone, age, gender,
              has_attended_tech_event, interest_area, level,
              wants_to_present, presentation_contact, created_at
       FROM registrations
       ORDER BY id ASC`
    );

    const headers = [
      "ردیف", "نام و نام خانوادگی", "شماره تماس", "سن", "جنسیت",
      "سابقه ایونت", "حوزه علاقه", "سطح", "ارائه", "راه ارتباطی ارائه", "زمان ثبت‌نام",
    ];

    const lines = [headers.map(csvEscape).join(",")];

    for (const r of rows) {
      lines.push(
        [
          r.id,
          r.full_name,
          r.phone,
          r.age,
          r.gender === "male" ? "آقا" : "خانم",
          r.has_attended_tech_event ? "بله" : "خیر",
          r.interest_area,
          r.level,
          r.wants_to_present ? "بله" : "خیر",
          r.presentation_contact ?? "",
          r.created_at ? new Date(r.created_at).toLocaleString("fa-IR") : "",
        ]
          .map(csvEscape)
          .join(",")
      );
    }

    // \uFEFF (BOM) makes Excel display Persian text correctly
    const csv = "\uFEFF" + lines.join("\r\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="registrations.csv"',
      },
    });
  } catch (err) {
    console.error("Export CSV error:", err);
    return NextResponse.json({ error: "خطا در ساخت فایل" }, { status: 500 });
  }
}