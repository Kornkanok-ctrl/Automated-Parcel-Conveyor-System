<h1 align="center">📦 Conveyor Parcel Transport System</h1>
<p align="center">
  ระบบการขนส่งพัสดุอัตโนมัติด้วย <strong>สายพานลำเลียง</strong> 
  สำหรับจัดการ <strong>รับพัสดุ</strong>, <strong>คัดแยก</strong>, และ <strong>ติดตามสถานะ</strong> ในระบบเดียว ⚙️📦
</p>

<p align="center">
  <!-- Frontend -->
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Style-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Markup-HTML%20%2F%20CSS-orange?style=for-the-badge&logo=html5" />

  <!-- Backend -->
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma" />

  <!-- Database -->
  <img src="https://img.shields.io/badge/Database-SQL%20Server-CC2927?style=for-the-badge&logo=microsoftsqlserver" />

  <!-- Auth & Tools -->
  <img src="https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/Hosting-Vercel-000000?style=for-the-badge&logo=vercel" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" />
</p>


## 🛠 Tech Stack

| Frontend      | Backend           | Database       | Tools          |
|---------------|-------------------|----------------|----------------|
| React / Next.js | Node.js / Express | SQLserver | Tailwind CSS |
| HTML / CSS    |  Prisma | JWT Auth  | Vercel Hosting |

---

## วิธีติดตั้งและรันโปรเจกต์

```bash
# Clone repo
git clone https://github.com/Kornkanok-ctrl/Automated-Parcel-Conveyor-System.git

# เข้าโฟลเดอร์โปรเจกต์
cd Automated-Parcel-Conveyor-System/frontend

# ติดตั้ง dependencies
npm install

# เริ่มเซิร์ฟเวอร์
npm run dev
```
---
## วิธีติดตั้งฝั่ง Bankend

```bash

# เข้าโฟลเดอร์โปรเจกต์
cd backend

# ติดตั้ง dependencies
npm install 

# สั่ง Docker // อย่าลืมเปิด docker 
docker compose up -d --build

#สั่ง Prisma ครั้งแรกเพื่อดึงข้อมูลจาก seed !!! สั่งครั้งเดียวพอ 
prisma migrate reset

# สั่ง Prisma ตอนแก้ไขใน schema.prisma
prisma migrate dev

# Run Server
npx nodemon server

#ดูฐานข้อมูลภายใน SQL server on Docker
prisma studio

#กรณีสั่ง prisma studio ไม่ได้ Error ทำตามนี้
Error: EPERM: operation not permitted, mkdir
สร้างโฟลเดอร์เอง (แก้ permission)
เปิด C: ..\AppData\Local

สร้างโฟลเดอร์ใหม่ชื่อ checkpoint-nodejs

คลิกขวา > Properties > Security → ให้สิทธิ์ Full Control กับ user 
```
