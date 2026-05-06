# FocusDoList — Monochrome Todo Management (Frontend)

FocusDoList adalah aplikasi manajemen tugas minimalis dengan estetika monokrom yang bersih. Dibangun menggunakan **React 18**, **TypeScript**, dan **Vite**, aplikasi ini menawarkan pengalaman pengguna yang fokus dan elegan.

![FocusDoList Preview](public/pwa-icon.svg) *Ganti dengan screenshot aplikasi jika sudah ada*

## 🚀 Fitur Utama

- **Dashboard Today**: Tampilan tugas hari ini dengan strip kalender mingguan.
- **Manajemen Tugas**: CRUD Todo lengkap dengan prioritas (High, Medium, Low).
- **Milestones & Progress**: Pantau proyek jangka panjang dengan milestone yang terhubung ke tugas. Progress dihitung otomatis dari penyelesaian tugas.
- **Sub-tasks & Reminders**: Pecah tugas besar menjadi sub-task kecil dan setel pengingat.
- **Statistik & Heatmap**: Visualisasi produktivitas dengan heatmap aktivitas dan grafik prioritas.
- **Sistem Grup & Label**: Organisasi tugas menggunakan kategori warna-warni (meskipun tetap dalam tema monokrom).
- **Responsive Design**: Optimal untuk tampilan desktop dan mobile.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/) (TypeScript)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: Vanilla CSS (Custom Design System)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## 📦 Instalasi Lokal

1. **Clone Repository**
   `ash
   git clone https://github.com/username/todo-frontend.git
   cd todo-frontend
   `

2. **Install Dependencies**
   `ash
   npm install
   `

3. **Konfigurasi Environment**
   Salin file .env.example menjadi .env:
   `ash
   cp .env.example .env
   `
   Sesuaikan VITE_API_URL jika backend Anda berjalan di port yang berbeda.

4. **Jalankan Aplikasi**
   `ash
   npm run dev
   `
   Buka [http://localhost:5173](http://localhost:5173) di browser Anda.

## 🌐 Demo Tanpa Backend (Offline Mode)

Untuk keperluan portfolio atau demo cepat tanpa harus menjalankan Laravel Backend, Anda bisa menggunakan **Mock Service Worker (MSW)**.

### Cara Aktivasi Mock (Opsional untuk Portfolio):
Jika Anda ingin mengirimkan link demo (misal via Vercel/Netlify) yang bisa langsung dicoba:
1. Pasang MSW: 
pm install msw --save-dev
2. Buat handlers untuk mensimulasikan API response.
3. Inisialisasi worker di src/main.tsx saat environment adalah production/demo.

*Catatan: Saat ini aplikasi dikonfigurasi untuk terhubung ke REST API asli. Untuk demo live, disarankan menggunakan backend yang di-deploy (Railway/Render) atau menggunakan pendekatan Mocking.*

## 🔒 Keamanan & Praktik Terbaik

- **.gitignore**: File sensitif seperti .env, folder 
ode_modules, dan hasil build dist/ sudah dikecualikan dari pelacakan Git.
- **PWA Ready**: Dilengkapi dengan Service Worker untuk caching aset dasar.
- **Type Safety**: Menggunakan TypeScript untuk mengurangi bug saat development.

---

Dibuat dengan ❤️ untuk produktivitas yang lebih fokus.
