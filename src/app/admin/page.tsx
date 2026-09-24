"use client";

import { useEffect, useState } from "react";

type Registration = {
  id: number;
  full_name: string;
  phone: string;
  age: number;
  gender: "male" | "female";
  hasAttendedTechEvent: boolean | number;
  interest_area: string;
  level: string;
  wantsToPresent: boolean | number;
  presentationContact: string | null;
};

const TOKEN_KEY = "admin_token";

export default function AdminPage() {
  const [list, setList] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("0");
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [capacityMessage, setCapacityMessage] = useState("");

  // every admin request carries the token
  const authFetch = (url: string, init: RequestInit = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    return fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthenticated(false);
    setList([]);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [regRes, settingsRes] = await Promise.all([
        authFetch("/api/register"),
        fetch("/api/settings"),
      ]);
      const regData = await regRes.json();
      const settingsData = await settingsRes.json();

      if (regRes.status === 401) {
        logout();
        return;
      } // token expired → login again
      if (!regRes.ok) throw new Error(regData.error || "خطا");
      if (!settingsRes.ok) throw new Error("خطا در تنظیمات");

      setList(regData.registrations || []);
      setRegistrationOpen(settingsData.registrationOpen !== false);
      setMaxCapacity(String(settingsData.maxCapacity ?? 0));
    } catch (err: any) {
      setError(err.message || "بارگذاری لیست ناموفق بود.");
    } finally {
      setLoading(false);
    }
  };

  // restore session on page load
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) setAuthenticated(true);
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ورود ناموفق بود");
        return;
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setPassword("");
      setAuthenticated(true);
    } catch {
      setError("ارتباط با سرور برقرار نشد");
    }
  };

  const toggleRegistration = async () => {
    setToggling(true);
    try {
      const res = await authFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ registrationOpen: !registrationOpen }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setRegistrationOpen(data.registrationOpen);
    } catch (err: any) {
      setError(err.message || "تغییر وضعیت ناموفق بود.");
    } finally {
      setToggling(false);
    }
  };

  const saveCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCapacity(true);
    setCapacityMessage("");
    try {
      const cap = parseInt(maxCapacity, 10);
      if (isNaN(cap) || cap < 0)
        throw new Error("لطفاً یک عدد معتبر وارد کنید");
      const res = await authFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ maxCapacity: cap }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setCapacityMessage(
        cap === 0 ? "✅ بدون محدودیت" : `✅ ظرفیت روی ${cap} ثبت شد`
      );
    } catch (err: any) {
      setCapacityMessage(err.message);
    } finally {
      setSavingCapacity(false);
    }
  };

  const exportCsv = async () => {
    try {
      const res = await authFetch("/api/export");
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error("خطا در دریافت فایل");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "registrations.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "خطا در دانلود فایل");
    }
  };

  const resetDatabase = async () => {
    if (!confirm("⚠️ هشدار: فقط ثبت‌نام‌ها پاک می‌شوند! آیا مطمئنید؟")) return;
    try {
      const res = await authFetch("/api/reset-db", { method: "POST" });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error("ریست ناموفق بود");
      alert("✅ فقط ثبت‌نام‌ها پاک شدند!");
      fetchData();
    } catch (err: any) {
      setError(err.message || "خطا در پاک کردن ثبت‌نام‌ها");
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage("");
    try {
      const res = await authFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setPassMessage("✅ رمز تغییر کرد");
      setCurrentPass("");
      setNewPass("");
    } catch (err: any) {
      setPassMessage(err.message);
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4"
        >
          <h1 className="text-xl font-bold text-center text-white">
            ورود به پنل مدیریت
          </h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="نام کاربری"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
          >
            ورود
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">
            لیست ثبت‌نام‌ها ({list.length})
          </h1>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm"
            >
              بروزرسانی
            </button>
            <button
              onClick={resetDatabase}
              className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-sm text-white"
            >
              ریست دیتابیس
            </button>
            <button
              onClick={exportCsv}
              className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-sm text-white"
            >
              دریافت CSV
            </button>
          </div>
        </div>

        {/* ظرفيت ثبت نام */}
        <div className="mb-8 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <p className="text-white font-medium mb-1">ظرفیت ثبت‌نام</p>
          <p className="text-sm text-slate-400 mb-3">
            عدد ۰ یعنی بدون محدودیت. وقتی تعداد ثبت‌نام‌ها به این عدد برسد،
            ثبت‌نام خودکار بسته می‌شود.
          </p>
          <form
            onSubmit={saveCapacity}
            className="flex flex-wrap items-center gap-3"
          >
            <input
              type="number"
              min={0}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              className="w-32 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-white"
            />
            <button
              type="submit"
              disabled={savingCapacity}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm"
            >
              {savingCapacity ? "..." : "ذخیره ظرفیت"}
            </button>
            {capacityMessage && (
              <span className="text-sm text-slate-300">{capacityMessage}</span>
            )}
          </form>
        </div>
        {/* وضعیت ثبت‌نام */}
        <div className="mb-8 p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium">وضعیت ثبت‌نام</p>
            <p className="text-sm text-slate-400">
              {registrationOpen ? "باز است" : "بسته است"}
            </p>
          </div>
          <button
            onClick={toggleRegistration}
            disabled={toggling}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 ${
              registrationOpen
                ? "bg-red-600/80 hover:bg-red-500"
                : "bg-emerald-600/80 hover:bg-emerald-500"
            } text-white`}
          >
            {toggling
              ? "..."
              : registrationOpen
              ? "بستن ثبت‌نام"
              : "باز کردن ثبت‌نام"}
          </button>
        </div>

        {loading && (
          <p className="text-slate-400 text-center">در حال بارگذاری...</p>
        )}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {!loading && list.length === 0 && (
          <p className="text-slate-400 text-center py-12">
            هنوز ثبت‌نامی نشده است.
          </p>
        )}

        <div className="space-y-3">
          {list.reverse().map((r) => (
            <div
              key={r.id}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">نام:</span>{" "}
                  <span className="text-white font-medium">{r.full_name}</span>
                </div>
                <div>
                  <span className="text-slate-400">تلفن:</span>{" "}
                  <span className="text-white font-mono" dir="ltr">
                    {r.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">سن:</span>{" "}
                  <span className="text-white">{r.age}</span>
                </div>
                <div>
                  <span className="text-slate-400">جنسیت:</span>{" "}
                  <span className="text-white">
                    {r.gender === "male" ? "آقا" : "خانم"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">تجربه ایونت:</span>{" "}
                  <span className="text-white">
                    {r.hasAttendedTechEvent ? "بله" : "خیر"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">حوزه علاقه:</span>{" "}
                  <span className="text-indigo-300 font-medium">
                    {r.interest_area || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">سطح:</span>{" "}
                  <span className="text-white">{r.level || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400">ارائه:</span>{" "}
                  <span
                    className={
                      r.wantsToPresent
                        ? "text-amber-300 font-medium"
                        : "text-white"
                    }
                  >
                    {r.wantsToPresent ? "بله" : "خیر"}
                  </span>
                </div>
                {r.wantsToPresent && r.presentationContact && (
                  <div>
                    <span className="text-slate-400"> راه ارتباطی ارائه:</span>{" "}
                    <span className="text-amber-200 font-mono" dir="ltr">
                      {r.presentationContact}
                    </span>
                  </div>
                )}
                {/* <div>
                  <span className="text-slate-400">زمان:</span>{" "}
                  <span className="text-slate-300 text-xs">
                    {new Date(r.createdAt).toLocaleString("fa-IR")}
                  </span>
                </div> */}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <p className="text-white font-medium mb-3">تغییر رمز عبور</p>
          <form onSubmit={changePassword} className="flex flex-wrap gap-3">
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="رمز فعلی"
              required
              className="flex-1 min-w-40 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-white"
            />
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="رمز جدید (حداقل ۶ کاراکتر)"
              required
              className="flex-1 min-w-40 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-white"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
            >
              تغییر رمز
            </button>
          </form>
          {passMessage && (
            <p className="text-sm mt-2 text-slate-300">{passMessage}</p>
          )}
        </div>
      </div>
    </main>
  );
}
