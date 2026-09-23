English | فارسی

🎟️ Event Registration — TechMeetup M2B
A full-stack event registration website built with Next.js (App Router) and MySQL.Visitors register through a public form; admins manage everything from a protected panel.

Built for the Tech Coffee M2B community meetup — join our Telegram

✨ Features
Public form

Validated registration (Iranian mobile format 09xxxxxxxxx, age 10–100)
Duplicate prevention — each phone number can only register once (enforced by DB UNIQUE key)
Registration can be closed by admin → visitors see a "closed" page with Telegram link
Fully RTL / Persian UI
Admin panel (/admin)

Login with username + password (bcrypt-hashed, stored in MySQL)
JWT session token, valid 7 days, stored in localStorage
View all registrations (newest first)
Open / close registration with one click
Reset (clear) all registrations
Change admin password
🛠 Tech Stack
Next.js — App Router, TypeScript, API Routes
MySQL + mysql2 connection pool
bcryptjs — password hashing
jsonwebtoken — admin sessions
Tailwind CSS
🚀 Getting Started
Requirements
Node.js 20.6+ (needed for --env-file)
MySQL 8+

1. Install
   git clone https://github.com/Amirreza3812/event-registrarion.gitcd event-registrarionnpm install
2. Database setup
   Run this in MySQL Workbench or the MySQL CLI:

CREATE DATABASE IF NOT EXISTS tech_meetup CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;USE tech_meetup;CREATE TABLE registrations ( id INT NOT NULL AUTO_INCREMENT, full_name VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL, age INT NOT NULL, gender ENUM('male','female') NOT NULL, has_attended_tech_event TINYINT(1) NOT NULL, interest_area VARCHAR(50) NOT NULL, level TEXT NOT NULL, wants_to_present TINYINT(1) NOT NULL, presentation_contact TEXT, created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), UNIQUE KEY phone (phone));CREATE TABLE settings ( id INT NOT NULL AUTO_INCREMENT, registrationOpen TINYINT(1) DEFAULT '1', created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id));-- the app expects at least one row here:INSERT INTO settings (registrationOpen) VALUES (1); 3. Environment variables
Create a .env.local file in the project root:

DB_HOST=127.0.0.1DB_USER=rootDB_PASSWORD=your_mysql_passwordDB_NAME=tech_meetupJWT_SECRET=paste_a_random_secret_here
Generate a random secret:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
⚠️ Never commit .env.local — it is already excluded by .gitignore.

4. Run
   npm run dev
   Registration form → http://localhost:3000
   Admin panel → http://localhost:3000/admin
   👤 Creating an Admin User
   There is no sign-up page — admins are created from the terminal:

node --env-file=.env.local scripts/create-admin.mjs <username> <password>
Example:

node --env-file=.env.local scripts/create-admin.mjs admin MySecret123
Creates the user, or resets the password if the username already exists
The password is stored as a bcrypt hash — never in plain text
🧭 Using the Admin Panel
Go to /admin and log in with the credentials you created above.
From the panel you can:
بستن / باز کردن ثبت‌نام — close or reopen registration
بروزرسانی — refresh the registrations list
ریست دیتابیس — delete all registrations (asks for confirmation; cannot be undone)
تغییر رمز — change your password (asks for the current one)
خروج — log out
Your session stays valid for 7 days, or until you log out.

📁 Project Structure
src/├── app/│ ├── page.tsx # public registration form│ ├── admin/page.tsx # admin panel│ └── api/│ ├── register/route.ts # GET: admin list · POST: public registration│ ├── settings/route.ts # GET: public status · PATCH: admin toggle/password│ ├── login/route.ts # POST: admin login → JWT│ └── reset-db/route.ts # POST: admin clear registrations└── lib/ ├── db.ts # MySQL connection pool └── auth.ts # JWT sign / verify helpersscripts/└── create-admin.mjs # create or update an admin user
🔒 Security Notes
Admin passwords are bcrypt-hashed; failed login never reveals whether the username or the password was wrong
All admin APIs require a valid JWT (Authorization: Bearer <token>)
All input is validated server-side (client-side checks are only for UX)
Secrets live only in .env.local, which is git-ignored
Made with ❤️ for the TechMeetup M2B community
English | فارسی

🎟️ سامانه ثبت‌نام رویداد — TechMeetup M2B
یک وب‌سایت کامل ثبت‌نام رویداد ساخته‌شده با Next.js (App Router) و MySQL.کاربران از طریق فرم عمومی ثبت‌نام می‌کنند و مدیر همه‌چیز را از یک پنل مدیریت محافظت‌شده کنترل می‌کند.

ساخته‌شده برای دورهمی Tech Coffee M2B — عضویت در کانال تلگرام

✨ قابلیت‌ها
فرم ثبت‌نام عمومی

اعتبارسنجی کامل ورودی‌ها (فرمت شماره موبایل ایران 09xxxxxxxxx، سن ۱۰ تا ۱۰۰)
جلوگیری از ثبت‌نام تکراری — هر شماره تماس فقط یک‌بار می‌تواند ثبت‌نام کند (با کلید UNIQUE در دیتابیس)
مدیر می‌تواند ثبت‌نام را ببندد → کاربران صفحه «ثبت‌نام بسته است» را با لینک کانال تلگرام می‌بینند
رابط کاربری کاملاً فارسی و راست‌چین (RTL)
پنل مدیریت (/admin)

ورود با نام کاربری و رمز عبور (رمزها با bcrypt هش و در MySQL ذخیره می‌شوند)
توکن نشست JWT با اعتبار ۷ روز، ذخیره‌شده در localStorage
مشاهده لیست همه ثبت‌نام‌ها (جدیدترین در بالا)
باز و بسته کردن ثبت‌نام با یک کلیک
پاک کردن همه ثبت‌نام‌ها (ریست)
تغییر رمز عبور مدیر
🛠 تکنولوژی‌ها
Next.js — App Router ، TypeScript و API Routes
MySQL + Connection Pool با کتابخانه mysql2
bcryptjs — هش کردن رمز عبور
jsonwebtoken — نشست‌های مدیر
Tailwind CSS
🚀 شروع به کار
پیش‌نیازها
Node.js نسخه 20.6 یا بالاتر (برای --env-file)
MySQL نسخه 8 یا بالاتر
۱. نصب
git clone https://github.com/Amirreza3812/event-registrarion.gitcd event-registrarionnpm install
۲. ساخت دیتابیس
این دستورات را در MySQL Workbench یا MySQL CLI اجرا کنید:

CREATE DATABASE IF NOT EXISTS tech_meetup CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;USE tech_meetup;CREATE TABLE registrations ( id INT NOT NULL AUTO_INCREMENT, full_name VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL, age INT NOT NULL, gender ENUM('male','female') NOT NULL, has_attended_tech_event TINYINT(1) NOT NULL, interest_area VARCHAR(50) NOT NULL, level TEXT NOT NULL, wants_to_present TINYINT(1) NOT NULL, presentation_contact TEXT, created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), UNIQUE KEY phone (phone));CREATE TABLE settings ( id INT NOT NULL AUTO_INCREMENT, registrationOpen TINYINT(1) DEFAULT '1', created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id));-- برنامه حداقل به یک ردیف در این جدول نیاز دارد:INSERT INTO settings (registrationOpen) VALUES (1);
۳. متغیرهای محیطی
در ریشه پروژه یک فایل .env.local بسازید:

DB_HOST=127.0.0.1DB_USER=rootDB_PASSWORD=your_mysql_passwordDB_NAME=tech_meetupJWT_SECRET=paste_a_random_secret_here
ساخت مقدار تصادفی برای JWT_SECRET:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
⚠️ هرگز فایل .env.local را کامیت نکنید — این فایل از قبل در .gitignore مستثنا شده است.

۴. اجرا
npm run dev
فرم ثبت‌نام → http://localhost:3000
پنل مدیریت → http://localhost:3000/admin
👤 ساخت کاربر مدیر
صفحه ثبت‌نام مدیر وجود ندارد؛ مدیرها از طریق ترمینال ساخته می‌شوند:

node --env-file=.env.local scripts/create-admin.mjs <username> <password>
مثال:

node --env-file=.env.local scripts/create-admin.mjs admin MySecret123
اگر نام کاربری وجود نداشته باشد ساخته می‌شود؛ اگر از قبل وجود داشته باشد رمز آن به‌روزرسانی می‌شود
رمز عبور به‌صورت هش bcrypt ذخیره می‌شود — هرگز به‌صورت متن ساده ذخیره نمی‌شود
🧭 کار با پنل مدیریت
۱. به آدرس /admin بروید و با اطلاعات کاربری که در مرحله قبل ساختید وارد شوید.۲. داخل پنل می‌توانید:

بستن / باز کردن ثبت‌نام — با یک کلیک
بروزرسانی — تازه‌سازی لیست ثبت‌نام‌ها
ریست دیتابیس — حذف همه ثبت‌نام‌ها (تأیید می‌خواهد و قابل بازگشت نیست)
تغییر رمز — تغییر رمز عبور (رمز فعلی پرسیده می‌شود)
خروج — خروج از حساب
نشست شما تا ۷ روز معتبر می‌ماند، مگر اینکه خودتان با دکمه «خروج» خارج شوید.

📁 ساختار پروژه
src/├── app/│ ├── page.tsx # public registration form│ ├── admin/page.tsx # admin panel│ └── api/│ ├── register/route.ts # GET: admin list · POST: public registration│ ├── settings/route.ts # GET: public status · PATCH: admin toggle/password│ ├── login/route.ts # POST: admin login → JWT│ └── reset-db/route.ts # POST: admin clear registrations└── lib/ ├── db.ts # MySQL connection pool └── auth.ts # JWT sign / verify helpersscripts/└── create-admin.mjs # create or update an admin user
🔒 نکات امنیتی
رمزهای مدیر با bcrypt هش می‌شوند؛ پیام خطای ورود هرگز مشخص نمی‌کند که نام کاربری اشتباه بوده یا رمز عبور
همه APIهای مدیریتی به توکن JWT معتبر نیاز دارند (Authorization: Bearer <token>)
همه ورودی‌ها سمت سرور اعتبارسنجی می‌شوند (بررسی‌های سمت کلاینت فقط برای تجربه کاربری است)
اطلاعات حساس فقط در .env.local نگهداری می‌شوند که در git نادیده گرفته می‌شود
با ❤️ برای کامیونیتی TechMeetup M2B
