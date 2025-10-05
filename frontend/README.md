# Non va Suv Frontend

Bu loyihaning frontend qismi bo'lib, React va Material-UI yordamida yaratilgan.

## Xususiyatlar

- 🔐 **Autentifikatsiya**: JWT token bilan himoyalangan
- 📱 **Responsive Design**: Mobil va desktop uchun moslashtirilgan
- 🎨 **Modern UI**: Material-UI komponenti bilan zamonaviy interfeys
- 📊 **Dashboard**: Real-time statistika va grafiklar
- 🛒 **Sotuv tizimi**: To'liq sotuv jarayoni boshqaruvi
- 👥 **Mijozlar**: Mijozlar va qarzlar boshqaruvi
- 📦 **Mahsulotlar**: Mahsulotlar va inventar boshqaruvi
- 🏪 **Ombor**: Xom ashyo va harakatlar nazorati
- 💰 **Xarajatlar**: Xarajatlarni kuzatish va tahlil
- 📈 **Hisobotlar**: Batafsil hisobotlar va eksport

## Texnologiyalar

- **React 18** - Asosiy frontend framework
- **TypeScript** - Turi xavfsizligi uchun
- **Material-UI v5** - UI komponenti
- **React Router** - Navigatsiya
- **React Query** - Server state boshqaruvi
- **React Hook Form** - Form boshqaruvi
- **Recharts** - Grafik va diagrammalar
- **Axios** - HTTP so'rovlar
- **Date-fns** - Sana boshqaruvi

## O'rnatish

1. Dependencies'larni o'rnating:
```bash
npm install
```

2. Environment o'zgaruvchilarini sozlang:
```bash
cp .env.example .env
```

3. Ilovani ishga tushiring:
```bash
npm start
```

## Loyiha strukturasi

```
src/
├── components/          # Qayta ishlatiluvchi komponentlar
│   ├── Layout.tsx      # Asosiy layout
│   └── LoadingSpinner.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── pages/              # Sahifa komponentlari
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Customers.tsx
│   ├── Sales.tsx
│   ├── Warehouse.tsx
│   ├── Expenses.tsx
│   ├── Reports.tsx
│   └── Users.tsx
├── services/           # API xizmatlari
│   └── api.ts
├── types/              # TypeScript turlari
│   └── index.ts
├── utils/              # Yordam funksiyalari
│   └── helpers.ts
├── constants/          # Konstantlar
│   └── index.ts
├── App.tsx            # Asosiy App komponenti
└── index.tsx          # Entry point
```

## Foydalanuvchi rollari

1. **Admin**: To'liq huquqlar
2. **Accountant**: Moliyaviy operatsiyalar
3. **Sales**: Faqat sotuv operatsiyalari

## Standart foydalanuvchilar

- **admin** / **admin123** - Administrator
- **accountant** / **accountant123** - Hisobchi  
- **sales** / **sales123** - Sotuvchi

## Development

Development mode'da ishga tushirish:
```bash
npm run start
```

Production uchun build qilish:
```bash
npm run build
```

Testlarni ishga tushirish:
```bash
npm test
```

## API Integration

Frontend backend API bilan `/api` prefix orqali bog'lanadi. Barcha so'rovlar JWT token bilan himoyalangan.

Asosiy endpoint'lar:
- `/api/auth/*` - Autentifikatsiya
- `/api/dashboard/*` - Dashboard ma'lumotlari  
- `/api/products/*` - Mahsulotlar boshqaruvi
- `/api/customers/*` - Mijozlar boshqaruvi
- `/api/sales/*` - Sotuv operatsiyalari
- `/api/warehouse/*` - Ombor boshqaruvi
- `/api/expenses/*` - Xarajatlar

## Features

### Dashboard
- Bugungi sotuv statistikasi
- Eng ko'p qarzga ega mijozlar
- Kam qolgan materiallar haqida ogohlantirish
- Grafik va diagrammalar

### Mahsulotlar
- CRUD operatsiyalar
- Stock miqdorini kuzatish
- Minimal miqdor ogohlantirishlari
- Turi bo'yicha filtrlash

### Mijozlar  
- Mijozlar ma'lumotlarini saqlash
- Qarz hisobini yuritish
- To'lovlar tarixi
- Qidiruv funksiyasi

### Sotuv
- Tez sotuv jarayoni
- Bir necha mahsulotli sotuv
- Turli to'lov usullari
- Chegirmalar qo'llash

### Ombor
- Xom ashyo inventarizatsiyasi
- Kirim/chiqim harakatlari
- Kam qolgan materiallar ro'yxati

### Xarajatlar
- Kategoriya bo'yicha xarajatlar
- Oylik hisobotlar
- Sana oralig'i bo'yicha filtrlash

### Hisobotlar
- Batafsil sotuv hisobotlari
- Xarajatlar tahlili
- Qarzdor mijozlar ro'yxati
- Excel eksport (rejalashtirilgan)

## Responsive Design

Ilovani barcha ekran o'lchamlari uchun moslashtirilgan:
- 📱 Mobile (360px+)
- 📊 Tablet (768px+) 
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1200px+)

## Xavfsizlik

- JWT token autentifikatsiya
- Rol-ga asoslangan kirish nazorati
- Xavfsiz API so'rovlar
- XSS himoyasi

## Browser qo'llab-quvvatlash

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+# Frontend added
