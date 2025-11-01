# 🏦 Premium Nasiya Admin Panel

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="version" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="license" />
  <img src="https://img.shields.io/badge/React-18.x-61dafb.svg" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.x-38bdf8.svg" alt="Tailwind" />
</div>

<p align="center">
  <b>Zamonaviy nasiya xizmatlarini boshqarish uchun professional admin panel</b>
</p>

<p align="center">
  <a href="https://premiumnasiya.uz" target="_blank">🌐 Asosiy sayt</a> •
  <a href="#-xususiyatlar">✨ Xususiyatlar</a> •
  <a href="#-kurulum">📦 O'rnatish</a> •
  <a href="#-texnologiyalar">⚙️ Texnologiyalar</a>
</p>

---

## 📸 Screenshot

<div align="center">
  <img src="https://via.placeholder.com/1200x600/4F46E5/ffffff?text=Premium+Nasiya+Admin+Dashboard" alt="Dashboard Preview" />
</div>

---

## ✨ Xususiyatlar

### 📊 Dashboard
- **Real-time statistika** - Jami arizalar, tasdiqlangan summa, operatorlar soni
- **Grafik vizualizatsiya** - ApexCharts yordamida interaktiv grafiklar
- **Filtr tizimi** - Sana, hudud va filial bo'yicha filtrlash

### 👥 Foydalanuvchilar (Operatorlar)
- Operatorlarni boshqarish
- Rol va huquqlarni nazorat qilish
- Ish holati (Faol/Bloklangan)
- Filial va merchant ma'lumotlari

### 📝 Arizalar
- Arizalarni ko'rish va boshqarish
- **Tovarlar summasi** va **To'lov summasi** ajratilgan
- Holat ko'rsatkichlari (Tasdiqlangan, Rad etilgan, Kutilmoqda)
- Muddatli to'lov imkoniyati (3, 6, 9, 12 oy)
- Hujjatlarni yuklab olish (PDF format)

### 🏢 Filiallar
- Filiallarni CRUD operatsiyalari
- Bank ma'lumotlari (INN, NDS, Hisob raqam, MFO)
- Direktor ma'lumotlari
- Hudud bo'yicha guruplash
- Excel ga eksport

### 🔍 Global Qidiruv
- Operator, Ariza va Filiallarni qidirish
- Real-time natijalar
- Modal oynada batafsil ma'lumot

### 🌓 Dark Mode
- To'liq dark mode qo'llab-quvvatlash
- Avtomatik tema o'zgartirish

### 🌐 Lokalizatsiya
- To'liq O'zbek tilida interfeys
- Sana va vaqt formatlari (24 soatlik)
- Pul birligi (so'm)

---

## 📦 O'rnatish

### Talablar
- Node.js 16.x yoki yuqori
- npm yoki yarn

### Qadamlar

1. **Repository ni klonlash**
```bash
git clone https://github.com/khurshid28/premium-nasiya-admin.git
cd premium-nasiya-admin
```

2. **Paketlarni o'rnatish**
```bash
npm install
```

3. **Environment o'zgaruvchilarini sozlash**
```bash
# .env.example faylidan nusxa oling
cp .env.example .env

# .env faylini tahrirlang va API URL'ni kiriting
REACT_APP_API_BASE=https://api.premiumnasiya.uz/api/v1
```

4. **Development serverini ishga tushirish**
```bash
npm start
```

Server `http://localhost:3000` da ishga tushadi.

### API Konfiguratsiyasi

**Base URL:** `https://api.premiumnasiya.uz/api/v1`

**Login Endpoint:** `POST /auth/login`
```json
{
  "login": "998950642827",
  "password": "1234567890"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "phone": "+998950642827",
    "fullname": "Xurshid Ismoilov",
    "image": null,
    "role": "SUPER"
  },
  "access_token": "eyJhbGc...",
  "message": "Logined successfully"
}
```

**Barcha so'rovlar uchun Authorization header:**
```
Authorization: Bearer {access_token}
```

#### Xatoliklar va Qayta Urinishlar

API so'rovlari avtomatik qayta urinish mexanizmi bilan jihozlangan:
- **Tarmoq xatoliklari**: Avtomatik 2 marta qayta urinadi (exponential backoff bilan)
- **Xato xabarlari**: O'zbek tilida aniq xato xabarlari
- **Xavfsizlik**: Barcha xato xabarlari foydalanuvchi uchun tushunarli formatda

4. **Production build**
```bash
npm run build
```

---

## ⚙️ Texnologiyalar

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### UI Komponentlar
- **ApexCharts** - Grafik vizualizatsiya
- **React Icons** - Icon library
- **Tabler Icons** - Modern ikonlar

### State Management
- React Context API
- Local Storage

### Boshqa
- **Mock API** - Development uchun mock data
- **Excel Export** - XLSX kutubxonasi

---

## 🗂️ Loyiha Strukturasi

```
src/
├── assets/           # Rasmlar va CSS
├── components/       # Qayta ishlatish mumkin bo'lgan komponentlar
│   ├── card/        # Card komponentlari
│   ├── charts/      # Grafik komponentlari
│   ├── modal/       # Modal oynalar
│   ├── navbar/      # Navbar (LTR/RTL)
│   └── sidebar/     # Sidebar navigatsiya
├── contexts/        # React Context
├── layouts/         # Layout komponentlari
├── lib/            # Utility funksiyalar va Mock API
├── types/          # TypeScript type definitions
├── views/          # Sahifalar
│   ├── admin/
│   │   ├── default/        # Dashboard
│   │   ├── applications/   # Arizalar
│   │   ├── users/          # Operatorlar
│   │   └── fillials/       # Filiallar
│   └── auth/              # Autentifikatsiya
└── routes.tsx      # Route konfiguratsiyasi
```

---

## 🚀 Asosiy Funksiyalar

### Dashboard
```typescript
// Real-time statistika
- Jami arizalar: 250+
- Tasdiqlangan summa: 150M+ so'm
- Jami operatorlar: 45+
- Jami filiallar: 35+
```

### Arizalar Tizimi
- **Tovarlar summasi**: Mahsulotlar umumiy narxi
- **To'lov summasi**: Klient to'laydigan summa (foiz bilan)
- **Muddatli to'lov**: 3, 6, 9, 12 oylik rejalar
- **Hujjat yaratish**: PDF formatida shartnoma

### Filiallar Boshqaruvi
- INN, NDS, Bank ma'lumotlari
- Direktor va telefon ma'lumotlari
- Hisob raqam va MFO
- Hudud bo'yicha statistika

---

## 🎨 Dizayn Tizimi

### Ranglar
- **Brand**: `#4F46E5` (Indigo)
- **Success**: `#10B981` (Green)
- **Error**: `#EF4444` (Red)
- **Warning**: `#F59E0B` (Amber)

### Dark Mode
Barcha komponentlar dark mode ni qo'llab-quvvatlaydi:
- `dark:bg-navy-800` - Asosiy fon
- `dark:text-white` - Matn rangi
- `dark:border-gray-600` - Chegara rangi

---

## 🔐 Autentifikatsiya

Demo login ma'lumotlari:
- **Telefon**: `+998900000001`
- **Parol**: `aJk#2025`

---

## 📝 License

MIT License - [LICENSE.md](LICENSE.md)

---

## 👥 Muallif

**Khurshid**
- GitHub: [@khurshid28](https://github.com/khurshid28)
- Repository: [premium-nasiya-admin](https://github.com/khurshid28/premium-nasiya-admin)

---

## 🌐 Aloqa

- **Website**: [premiumnasiya.uz](https://premiumnasiya.uz)
- **Email**: info@premiumnasiya.uz

---

<div align="center">
  <p>Made with ❤️ for Premium Nasiya</p>
  <p>© 2025 Premium Nasiya. All rights reserved.</p>
</div>

⭐️ [Copyright 2023 Horizon UI ](https://www.horizon-ui.com/?ref=readme-horizon-tailwind-react-ts)

📄 [Horizon UI License](https://www.simmmple.com/licenses?ref=readme-horizon-tailwind-react-ts)
