# ثبت‌نام دورهمی فناوری و کامپیوتر

سایت ثبت‌نام با **Next.js** + **MongoDB Atlas** (دیتابیس رایگان)

## ویژگی‌ها

- فرم ثبت‌نام کامل (نام، تلفن، سن، جنسیت، سابقه ایونت، حوزه علاقه، سطح، ارائه)
- ذخیره پایدار در MongoDB Atlas (رایگان)
- پنل ادمین با امکان بستن/باز کردن ثبت‌نام
- وقتی ثبت‌نام بسته است، لینک کانال تلگرام نمایش داده می‌شود

---

## راه‌اندازی دیتابیس رایگان (MongoDB Atlas)

### مرحله ۱ — ساخت حساب و کلاستر

1. بروید به https://www.mongodb.com/cloud/atlas/register
2. ثبت‌نام کنید (با Google هم می‌شود)
3. روی **Build a Cluster** بزنید
4. پلن **M0 Free** را انتخاب کنید
5. Region نزدیک را انتخاب کنید
6. Create Cluster را بزنید (۱–۳ دقیقه طول می‌کشد)

### مرحله ۲ — ساخت کاربر دیتابیس

1. از منوی چپ بروید به **Database Access**
2. **Add New Database User**
3. Authentication: Password
4. یک Username و Password قوی بگذارید (یادداشت کنید)
5. Role: **Read and write to any database**
6. Add User

### مرحله ۳ — اجازه دسترسی شبکه

1. از منوی چپ بروید به **Network Access**
2. **Add IP Address**
3. روی **Allow Access from Anywhere** بزنید (`0.0.0.0/0`)
4. Confirm

### مرحله ۴ — گرفتن Connection String

1. بروید به **Database** → روی کلاستر **Connect**
2. **Drivers** را انتخاب کنید
3. Driver: Node.js
4. رشته اتصال را کپی کنید:

```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. به‌جای USERNAME و PASSWORD مقادیر خودتان را بگذارید

---

## اجرای محلی

```bash
cd event-registration
npm install
```

فایل `.env.local` را ویرایش کنید:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=event_registration
```

سپس:

```bash
npm run dev
```

- فرم: http://localhost:3000
- ادمین: http://localhost:3000/admin (رمز: admin123)

---

## دیپلوی روی Vercel (رایگان)

1. پروژه را روی GitHub بگذارید
2. به https://vercel.com بروید و Import کنید
3. در **Environment Variables** این‌ها را اضافه کنید:

| Name | Value |
|------|--------|
| MONGODB_URI | همان connection string |
| MONGODB_DB_NAME | event_registration |

4. Deploy

---

## ساختار دیتابیس

**registrations** — لیست ثبت‌نام‌ها  
**settings** — وضعیت باز/بسته بودن ثبت‌نام

---

## نکات امنیتی

- فایل `.env.local` را در Git commit نکنید
- رمز پنل ادمین را در src/app/admin/page.tsx تغییر دهید
"# event-registration" 
