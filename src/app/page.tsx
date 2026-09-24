"use client";

import { useState, useEffect, FormEvent } from "react";

const INTEREST_OPTIONS = [
  "AI",
  "WEB",
  "Career",
  "پروژه شخصی",
  "امنیت",
  "Open Source",
  "linux",
] as const;

const LEVEL_OPTIONS = [
  "تازه آشنا شدم با کامپیوتر و دارم یاد می‌گیرم",
  "علاقه دارم آشنا شم",
  "برنامه‌نویسی بلدم",
  "تجربه کاری دارم",
  "متخصص / حرفه‌ای هستم",
  "در حال یادگیری یک حوزه خاص",
] as const;

type FormData = {
  fullName: string;
  phone: string;
  age: string;
  gender: "male" | "female" | "";
  hasAttendedTechEvent: "yes" | "no" | "";
  interestArea: string;
  level: string;
  wantsToPresent: "yes" | "no" | "";
  presentationContact: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    age: "",
    gender: "",
    hasAttendedTechEvent: "",
    interestArea: "",
    level: "",
    wantsToPresent: "",
    presentationContact: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(
    null
  );
  const [capacity, setCapacity] = useState<{
    max: number;
    count: number;
  } | null>(null);

  const loadSettings = () => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setRegistrationOpen(data.registrationOpen !== false);
        setCapacity({
          max: data.maxCapacity ?? 0,
          count: data.registeredCount ?? 0,
        });
      })
      .catch(() => setRegistrationOpen(true));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const remaining =
    capacity && capacity.max > 0
      ? Math.max(0, capacity.max - capacity.count)
      : null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.age ||
      !form.gender ||
      !form.hasAttendedTechEvent ||
      !form.interestArea ||
      !form.level ||
      !form.wantsToPresent
    ) {
      setStatus("error");
      setMessage("لطفاً تمام فیلدها را پر کنید.");
      loadSettings();
      return;
    }

    if (
      form.wantsToPresent === "yes" &&
      form.presentationContact.trim().length < 3
    ) {
      setStatus("error");
      setMessage("لطفاً راه ارتباطی برای ارائه را وارد کنید.");
      return;
    }

    const ageNum = parseInt(form.age, 10);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      setStatus("error");
      setMessage("سن وارد شده معتبر نیست.");
      return;
    }

    const phoneClean = form.phone.replace(/\s|-/g, "");
    if (!/^09\d{9}$/.test(phoneClean)) {
      setStatus("error");
      setMessage("شماره تماس باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: phoneClean,
          age: ageNum,
          gender: form.gender,
          hasAttendedTechEvent: form.hasAttendedTechEvent === "yes",
          interestArea: form.interestArea,
          level: form.level,
          wantsToPresent: form.wantsToPresent === "yes",
          presentationContact:
            form.wantsToPresent === "yes"
              ? form.presentationContact.trim()
              : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "خطایی رخ داد. لطفاً دوباره تلاش کنید.");
        return;
      }

      setStatus("success");
      setMessage(
        "ثبت‌نام شما با موفقیت انجام شد! به زودی با شما تماس می‌گیریم."
      );
      setForm({
        fullName: "",
        phone: "",
        age: "",
        gender: "",
        hasAttendedTechEvent: "",
        interestArea: "",
        level: "",
        wantsToPresent: "",
        presentationContact: "",
      });
    } catch {
      setStatus("error");
      setMessage("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
    }
  };

  // Loading state
  if (registrationOpen === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">در حال بارگذاری...</p>
      </main>
    );
  }

  // Registration closed
  if (registrationOpen === false || remaining === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-amber-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {registrationOpen === false
              ? "ثبت‌نام بسته است"
              : "ظرفیت تکمیل شده"}
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-6">
            تا رویداد بعدی می‌توانید ارتباطتان را با کامیونیتی ما از طریق کانال
            تلگرام زیر حفظ کنید:
          </p>
          <a
            href="https://t.me/TechMeetup_M2B"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1b8bc0] text-white font-medium text-lg shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.12.098.153.23.169.323.016.093.036.305.02.47z" />
            </svg>
            @TechMeetup_M2B
          </a>
          <p className="mt-8 text-slate-500 text-sm">
            © {new Date().getFullYear()} TechMeetup_M2B
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header / Event Info */}
      <div className="w-full max-w-lg mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-5">
          <img
            src="/logo.jpg"
            alt="TECH MEETUP M2B"
            className="w-28 h-28 rounded-full object-cover shadow-lg shadow-indigo-900/40 ring-2 ring-indigo-400/30"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
          Tech Coffee M2B☕#0
          <br />
          <span className="text-1xl sm:text-2xl text-white mb-2 leading-tight">
            دورهمی علاقه‌مندان برنامه‌نویسی، هوش مصنوعی و تکنولوژی
          </span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          یک دورهمی دوستانه برای علاقه‌مندان به برنامه‌نویسی، هوش مصنوعی، شبکه و
          تکنولوژی‌های روز. فرصت شبکه‌سازی، یادگیری و آشنایی با افراد هم‌فکر.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-indigo-200">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20">
            Learn
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20">
            Share
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20">
            Grow
          </span>
        </div>
        {remaining !== null && remaining > 0 && (
          <div className="mt-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-sm font-medium">
              ✅ {remaining.toLocaleString("fa-IR")} جای باقی‌مانده
            </span>
          </div>
        )}
      </div>

      {/* Form Card */}
      <div className="w-full max-w-lg bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          فرم ثبت‌نام
        </h2>

        {status === "success" ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/30 mb-4">
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-emerald-300 text-lg mb-6">{message}</p>
            <button
              onClick={() => {
                setStatus("idle");
                setMessage("");
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              ثبت‌ نام جدید
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                نام و نام خانوادگی
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="مثلاً: علی رضایی"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                شماره تماس
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="09xxxxxxxxx"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-left"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                سن
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min={10}
                max={100}
                value={form.age}
                onChange={handleChange}
                placeholder="مثلاً: ۲۵"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <span className="block text-sm font-medium text-slate-300 mb-2">
                جنسیت
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer ${
                    form.gender === "male"
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>آقا</span>
                </label>
                <label
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer ${
                    form.gender === "female"
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>خانم</span>
                </label>
              </div>
            </div>

            {/* Previous Tech Event */}
            <div>
              <span className="block text-sm font-medium text-slate-300 mb-2">
                تا الان در دورهمی یا ایونت کامپیوتر و فناوری شرکت کرده‌اید؟
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer ${
                    form.hasAttendedTechEvent === "yes"
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="hasAttendedTechEvent"
                    value="yes"
                    checked={form.hasAttendedTechEvent === "yes"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>بله</span>
                </label>
                <label
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer ${
                    form.hasAttendedTechEvent === "no"
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="hasAttendedTechEvent"
                    value="no"
                    checked={form.hasAttendedTechEvent === "no"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>خیر</span>
                </label>
              </div>
            </div>

            {/* Interest Area */}
            <div>
              <span className="block text-sm font-medium text-slate-300 mb-2">
                حوزه علاقه
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center justify-center px-3 py-2.5 rounded-xl border cursor-pointer text-sm ${
                      form.interestArea === opt
                        ? "bg-indigo-600/30 border-indigo-400 text-white"
                        : "bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="interestArea"
                      value={opt}
                      checked={form.interestArea === opt}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <span className="block text-sm font-medium text-slate-300 mb-2">
                سطح شما
              </span>
              <div className="space-y-2">
                {LEVEL_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer text-sm ${
                      form.level === opt
                        ? "bg-indigo-600/30 border-indigo-400 text-white"
                        : "bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={opt}
                      checked={form.level === opt}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Wants to Present */}
            <div>
              <span className="block text-sm font-medium text-slate-300 mb-2">
                علاقه دارید ارائه‌ای داشته باشید؟
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer ${
                    form.wantsToPresent === "yes"
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="wantsToPresent"
                    value="yes"
                    checked={form.wantsToPresent === "yes"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>بله</span>
                </label>
                <label
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer ${
                    form.wantsToPresent === "no"
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="wantsToPresent"
                    value="no"
                    checked={form.wantsToPresent === "no"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>خیر</span>
                </label>
              </div>
            </div>

            {/* Presentation Contact - conditional */}
            {form.wantsToPresent === "yes" && (
              <div>
                <label
                  htmlFor="presentationContact"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  راه ارتباطی برای ارائه (تلگرام، ایمیل، ...)
                </label>
                <input
                  id="presentationContact"
                  name="presentationContact"
                  type="text"
                  value={form.presentationContact}
                  onChange={handleChange}
                  placeholder="مثلاً: @username یا email@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  required
                />
              </div>
            )}

            {/* Error message */}
            {status === "error" && message && (
              <div className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm text-center">
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold text-lg shadow-lg shadow-indigo-900/40"
            >
              {status === "loading" ? "در حال ثبت..." : "ثبت‌نام"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 text-slate-500 text-sm">
        © {new Date().getFullYear()} TechMeetup_M2B
      </p>
    </main>
  );
}
