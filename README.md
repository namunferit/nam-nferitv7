# Nâmünferit — CMS Yönetim Paneli ve Statik Site Oluşturucu (SSG)

Bu proje, **Nâmünferit Dijital Kültür Platformu** için özel olarak geliştirilmiş Node.js (Express) + React (Vite + Tailwind CSS v4) tabanlı bir İçerik Yönetim Sistemi (CMS) ve Statik Site Oluşturucu (SSG) motorudur.

---

## 🚀 Hızlı Başlangıç

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edin:

### 1. Kurulum ve Başlatma
Projenin kök dizininde bir terminal açın ve sunucuyu başlatın:

```bash
cd server
npm start
```

Sunucu port **3000** üzerinde yayına başlayacaktır:
* **Statik Web Sitesi:** [http://localhost:3000](http://localhost:3000)
* **CMS Yönetim Paneli:** [http://localhost:3000/admin](http://localhost:3000/admin)

### 2. Giriş Bilgileri
Yönetim paneline erişmek için aşağıdaki varsayılan kimlik bilgilerini kullanın:
* **Kullanıcı Adı:** `admin`
* **Şifre:** `namunferit2026`

*(Bu bilgileri kök dizindeki `.env` dosyasından dilediğiniz gibi güncelleyebilirsiniz.)*

---

## 🛠️ Mimari ve Nasıl Çalışır?

Proje, statik HTML sitesinin hızını dinamik bir yönetim panelinin kolaylığıyla birleştiren **Statik Site Oluşturucu (SSG)** mantığıyla tasarlanmıştır:

1. **Veritabanı:** Tüm içerikler, kategoriler, medya listesi ve site ayarları `db/` klasörü altındaki optimize edilmiş JSON dosyalarında tutulur.
2. **Yönetim Paneli (React):** Editör; yazıları, videoları, kategorileri, renkleri/fontları ve medya dosyalarını arayüz üzerinden düzenler. Yapılan her güncelleme Express API'sine gönderilir.
3. **Statik Oluşturucu (SSG Motoru):** İçeriklerdeki her değişiklikte (yazı ekleme, güncelleme, silme veya renk değiştirme), `server/ssg/generator.js` motoru tetiklenir. `templates/` altındaki HTML dosyalarını derleyerek doğrudan `public/` klasörüne statik HTML/CSS dosyaları yazar.
4. **Sunucu:** Express.js sunucusu, `/api/*` üzerinden yönetim panelini beslerken, `/` altında `public/` klasöründeki üretilmiş saf statik HTML dosyalarını son kullanıcılara sunar.

---

## 📁 Klasör Yapısı

```text
namunferit/
├── admin/                    # React + Vite + Tailwind v4 Admin Arayüzü
│   ├── src/
│   │   ├── components/       # Layout, Sidebar, Toast, FileUpload, RichEditor (Quill)
│   │   ├── lib/              # api.js ve auth.jsx modülleri
│   │   └── pages/            # Dashboard, Articles, Videos, Categories, Design, Media
│   └── vite.config.js        # Vite + Tailwind v4 konfigürasyonu (base: /admin/)
├── server/                   # Express.js REST API
│   ├── middleware/           # JWT kimlik doğrulama & rate limiting (güvenlik)
│   ├── routes/               # API endpointleri (makaleler, videolar, medya vb.)
│   ├── ssg/                  # Handlebars şablon derleyici (generator.js)
│   └── index.js              # Express sunucu giriş noktası
├── db/                       # JSON veritabanı (articles, videos, categories, settings)
├── templates/                # HTML şablonları (Handlebars placeholders ile)
├── public/                   # Derlenen saf statik web sitesi (sunucu burayı servis eder)
├── uploads/                  # Editörün yüklediği medya dosyaları (WebP olarak optimize edilir)
├── .env                      # JWT Secret, admin şifre hash'i ve port ayarları
└── README.md                 # Bu dosya
```

---

## ✨ Özellikler

* 🔒 **Güvenli Giriş & Rate Limiting:** JWT tabanlı auth. Art arda 5 kez hatalı giriş yapıldığında IP adresini 15 dakika boyunca kilitler.
* ✍️ **Zengin Metin Editörü (Quill.js):** Makale içeriklerini kalın, italik, alıntı, başlık ve görsellerle zenginleştirebilirsiniz.
* 🖼️ **Medya Kütüphanesi & Otomatik Optimizasyon:** Sunucuya yüklenen tüm resimler `sharp` kütüphanesi kullanılarak otomatik olarak **WebP** formatına dönüştürülür ve sıkıştırılır.
* 🎨 **Canlı Tasarım Yönetimi:** Yönetim panelinden site ana başlıklarını, sosyal medya hesaplarını, yazı fontlarını veya renklerini güncelleyebilirsiniz. CSS değişkenleri anında derlenip statik siteye yansıtılır.
* 🗑️ **Çöp Kutusu & Geri Yükleme:** Silinen yazılar doğrudan kaybolmaz; çöp kutusundan geri yüklenebilir veya kalıcı olarak temizlenebilir.
